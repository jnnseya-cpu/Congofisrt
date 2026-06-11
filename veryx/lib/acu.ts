import { db } from './db';
import { audit } from './audit';

// ── ACU (AI Credits / Compute Units) billing engine (Blueprint §12.2) ────────
// Every AI computation, agent task, and connector call consumes ACU from the
// tenant balance, with an immutable per-entry ledger.

/** ACU cost table per action type (Blueprint §12.2 + Domain Coverage table). */
export const ACU_COSTS = {
  agent_standard: 1, // simple Q&A / lookup
  agent_with_tools: 5, // 1–3 tool calls
  agent_chain: 25, // multi-agent orchestration
  document_page: 2,
  report_generation: 10,
  fraud_score: 0.5,
  compliance_screening: 3,
  predictive_forecast: 15,
  fine_tuning: 500,
  connector_call: 0.1,
  board_pack: 35,
  monte_carlo: 15,
  user_story: 3,
  meeting_minutes: 10,
  esg_report: 50,
  predictive_maintenance: 5,
  supplier_pq_review: 8,
} as const;

export type AcuAction = keyof typeof ACU_COSTS;

/** ACU purchase tiers (Blueprint §12.2). */
export const ACU_PURCHASE_TIERS = [
  { units: 500, priceGbp: 25, perUnit: 0.05 },
  { units: 2_000, priceGbp: 80, perUnit: 0.04 },
  { units: 10_000, priceGbp: 350, perUnit: 0.035 },
  { units: 50_000, priceGbp: 1_500, perUnit: 0.03 },
  { units: 200_000, priceGbp: 5_000, perUnit: 0.025 },
] as const;

export class InsufficientAcuError extends Error {
  constructor(public required: number, public available: number) {
    super(`Insufficient ACU balance: required ${required}, available ${available}`);
  }
}

/**
 * Atomically deduct ACU from a tenant and write a ledger entry.
 * Throws InsufficientAcuError when the balance cannot cover the cost.
 */
export async function consumeAcu(opts: {
  tenantId: string;
  amount: number;
  reason: string;
  refType?: string;
  refId?: string;
}) {
  return db.$transaction(async (tx) => {
    const tenant = await tx.tenant.findUniqueOrThrow({
      where: { id: opts.tenantId },
      select: { acuBalance: true },
    });
    if (tenant.acuBalance < opts.amount) {
      throw new InsufficientAcuError(opts.amount, tenant.acuBalance);
    }
    const updated = await tx.tenant.update({
      where: { id: opts.tenantId },
      data: { acuBalance: { decrement: opts.amount } },
      select: { acuBalance: true },
    });
    await tx.acuLedgerEntry.create({
      data: {
        tenantId: opts.tenantId,
        delta: -opts.amount,
        reason: opts.reason,
        balanceAfter: updated.acuBalance,
        refType: opts.refType,
        refId: opts.refId,
      },
    });
    return updated.acuBalance;
  });
}

/** Credit ACU (purchase / promotional allocation) with ledger + audit entries. */
export async function creditAcu(opts: {
  tenantId: string;
  amount: number;
  reason: string;
  actorId?: string;
}) {
  const balance = await db.$transaction(async (tx) => {
    const updated = await tx.tenant.update({
      where: { id: opts.tenantId },
      data: { acuBalance: { increment: opts.amount } },
      select: { acuBalance: true },
    });
    await tx.acuLedgerEntry.create({
      data: {
        tenantId: opts.tenantId,
        delta: opts.amount,
        reason: opts.reason,
        balanceAfter: updated.acuBalance,
        refType: 'purchase',
      },
    });
    return updated.acuBalance;
  });
  await audit({
    tenantId: opts.tenantId,
    actorId: opts.actorId,
    actorType: opts.actorId ? 'user' : 'system',
    action: 'acu.credited',
    changes: { amount: opts.amount, reason: opts.reason, balanceAfter: balance },
  });
  return balance;
}

/** Platform-wide ACU economy stats for the Super Admin centre (§23A.8). */
export async function acuEconomyStats() {
  const [purchasedAgg, consumedAgg, tenants] = await Promise.all([
    db.acuLedgerEntry.aggregate({ _sum: { delta: true }, where: { delta: { gt: 0 } } }),
    db.acuLedgerEntry.aggregate({ _sum: { delta: true }, where: { delta: { lt: 0 } } }),
    db.tenant.aggregate({ _sum: { acuBalance: true } }),
  ]);
  const purchased = purchasedAgg._sum.delta ?? 0;
  const consumed = Math.abs(consumedAgg._sum.delta ?? 0);
  // Blended sell rate ≈ £0.04/ACU; modelled provider cost ≈ £0.011/ACU.
  const revenue = purchased * 0.04;
  const aiCost = consumed * 0.011;
  return {
    purchasedAllTime: purchased,
    consumedAllTime: consumed,
    remainingPool: tenants._sum.acuBalance ?? 0,
    revenueGbp: revenue,
    aiCostGbp: aiCost,
    profitGbp: revenue - aiCost,
    marginPct: revenue > 0 ? ((revenue - aiCost) / revenue) * 100 : 0,
  };
}
