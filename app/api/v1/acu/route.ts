import { db } from '@/lib/db';
import { ok, err, handleError, requireSession } from '@/lib/api';
import { ACU_COSTS, ACU_PURCHASE_TIERS } from '@/lib/acu';

/** GET /api/v1/acu — tenant ACU balance, recent ledger, cost table and tiers. */
export async function GET(req: Request) {
  try {
    const auth = await requireSession(req);
    if ('response' in auth) return auth.response;
    if (!auth.session.tenantId) return err('ERR_FORBIDDEN', 'Tenant context required');
    const [tenant, ledger] = await Promise.all([
      db.tenant.findUniqueOrThrow({
        where: { id: auth.session.tenantId },
        select: { acuBalance: true },
      }),
      db.acuLedgerEntry.findMany({
        where: { tenantId: auth.session.tenantId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);
    return ok({
      balance: tenant.acuBalance,
      ledger: ledger.map((l) => ({
        id: l.id,
        delta: l.delta,
        reason: l.reason,
        balance_after: l.balanceAfter,
        created_at: l.createdAt,
      })),
      cost_table: ACU_COSTS,
      purchase_tiers: ACU_PURCHASE_TIERS,
    });
  } catch (e) {
    return handleError(e);
  }
}
