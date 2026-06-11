import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { db } from './db';
import { audit } from './audit';

// ── BitriPay gateway service (Blueprint §7) ──────────────────────────────────
// Dedicated gateway layer between VERYX modules and the BitriPay rail.
// In sandbox mode (default) transactions are fully simulated end-to-end,
// matching §7.1: "Sandbox (full simulation) + Production (live rails)".

export type BitriPayChannel = 'mpesa' | 'airtel' | 'orange' | 'africell' | 'cdf_wallet' | 'card';

export const SUPPORTED_CURRENCIES = ['CDF', 'USD', 'EUR', 'GBP'] as const;

const WEBHOOK_SECRET = process.env.BITRIPAY_WEBHOOK_SECRET ?? 'vx_sandbox_webhook_secret_rotate_me';

/** Transaction fee model (Blueprint §12.3). */
export function computeFee(amount: number, currency: string, channel: BitriPayChannel): number {
  if (channel === 'cdf_wallet' && currency === 'CDF') return amount * 0.005 + 250; // 0.5% + CDF 250
  if (channel === 'mpesa' || channel === 'airtel' || channel === 'orange' || channel === 'africell') {
    return amount * 0.01 + (currency === 'CDF' ? 100 : 0.1); // 1.0% + CDF 100
  }
  return amount * 0.015 + 0.3; // cross-border default 1.5% + $0.30
}

/** HMAC-SHA256 webhook signing (Blueprint §7.6). */
export function signWebhookPayload(payload: string): string {
  return createHmac('sha256', WEBHOOK_SECRET).update(payload).digest('hex');
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const expected = signWebhookPayload(payload);
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(signature, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

export interface InitiatePaymentInput {
  tenantId: string;
  amount: number;
  currency: string;
  channel: BitriPayChannel;
  customerRef?: string;
  metadata?: Record<string, unknown>;
  idempotencyKey: string;
  fraudScore?: number;
}

/**
 * Initiate a payment through the BitriPay rail.
 * Sandbox behaviour: instantly settles sub-£10k payments; larger amounts and
 * fraud scores > 70 remain pending/blocked for manual review — mirroring the
 * production decision flow (approve / flag / block) of Blueprint §5.4.
 */
export async function initiateBitriPayPayment(input: InitiatePaymentInput) {
  const existing = await db.transaction.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
  });
  if (existing) return { transaction: existing, duplicate: true as const };

  const fraudScore =
    input.fraudScore ??
    Math.min(95, Math.round((input.amount > 10_000 ? 45 : 8) + Math.random() * 20));
  const blocked = fraudScore > 70;
  const instantSettle = !blocked && input.amount <= 10_000;

  const transaction = await db.transaction.create({
    data: {
      tenantId: input.tenantId,
      type: 'payment',
      status: blocked ? 'disputed' : instantSettle ? 'completed' : 'processing',
      amount: input.amount,
      currency: input.currency,
      gateway: 'bitripay',
      channel: input.channel,
      gatewayReference: `BTP-${randomUUID().slice(0, 12).toUpperCase()}`,
      fraudScore,
      customerRef: input.customerRef,
      metadata: JSON.stringify(input.metadata ?? {}),
      idempotencyKey: input.idempotencyKey,
      completedAt: instantSettle ? new Date() : null,
    },
  });

  await audit({
    tenantId: input.tenantId,
    actorType: 'system',
    action: blocked ? 'payment.blocked.fraud' : 'payment.initiated',
    resourceType: 'transaction',
    resourceId: transaction.id,
    changes: { amount: input.amount, currency: input.currency, channel: input.channel, fraudScore },
  });

  return { transaction, duplicate: false as const };
}

/** Webhook event catalogue (Blueprint §7.6). */
export const BITRIPAY_EVENTS = [
  'payment.completed',
  'payment.failed',
  'payment.pending',
  'refund.initiated',
  'refund.completed',
  'dispute.raised',
  'settlement.completed',
  'kyb.approved',
  'kyb.rejected',
] as const;

export type BitriPayEvent = (typeof BITRIPAY_EVENTS)[number];
