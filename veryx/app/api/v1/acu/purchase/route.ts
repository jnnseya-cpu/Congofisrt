import { z } from 'zod';
import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { ok, err, parseBody, handleError, requireSession } from '@/lib/api';
import { canWrite } from '@/lib/rbac';
import { ACU_PURCHASE_TIERS, creditAcu } from '@/lib/acu';

const schema = z.object({
  units: z.union([
    z.literal(500),
    z.literal(2000),
    z.literal(10000),
    z.literal(50000),
    z.literal(200000),
  ]),
});

/** POST /api/v1/acu/purchase — buy an ACU tier; settles via internal gateway. */
export async function POST(req: Request) {
  try {
    const auth = await requireSession(req);
    if ('response' in auth) return auth.response;
    if (!canWrite(auth.session.role, 'billing')) {
      return err('ERR_FORBIDDEN', 'Authenticated user lacks required permission');
    }
    if (!auth.session.tenantId) return err('ERR_FORBIDDEN', 'Tenant context required');

    const body = await parseBody(req, schema);
    const tier = ACU_PURCHASE_TIERS.find((t) => t.units === body.units)!;

    // Record the purchase as a billing transaction, then credit the ACU pool.
    const tx = await db.transaction.create({
      data: {
        tenantId: auth.session.tenantId,
        type: 'payment',
        status: 'completed',
        amount: tier.priceGbp,
        currency: 'GBP',
        gateway: 'internal',
        channel: 'card',
        gatewayReference: `ACU-${randomUUID().slice(0, 12).toUpperCase()}`,
        metadata: JSON.stringify({ acu_units: tier.units, per_unit: tier.perUnit }),
        idempotencyKey: `acu-${auth.session.tenantId}-${Date.now()}`,
        completedAt: new Date(),
      },
    });
    const balance = await creditAcu({
      tenantId: auth.session.tenantId,
      amount: tier.units,
      reason: `purchase.${tier.units}`,
      actorId: auth.session.sub,
    });
    return ok(
      {
        purchase: {
          transaction_id: tx.id,
          units: tier.units,
          price_gbp: tier.priceGbp,
          balance_after: balance,
        },
      },
      201
    );
  } catch (e) {
    return handleError(e);
  }
}
