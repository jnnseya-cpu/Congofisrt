import { z } from 'zod';
import { ok, err, parseBody, handleError, requireSession } from '@/lib/api';
import { canWrite } from '@/lib/rbac';
import { initiateBitriPayPayment, computeFee, SUPPORTED_CURRENCIES } from '@/lib/bitripay';
import { executeAgent } from '@/lib/agents/engine';

const schema = z.object({
  amount: z.number().positive().max(10_000_000),
  currency: z.enum(SUPPORTED_CURRENCIES),
  gateway: z.enum(['bitripay', 'stripe', 'adyen', 'internal']).default('bitripay'),
  channel: z.enum(['mpesa', 'airtel', 'orange', 'africell', 'cdf_wallet', 'card']).default('card'),
  customer_ref: z.string().max(255).optional(),
  metadata: z.record(z.unknown()).optional(),
  idempotency_key: z.string().min(8).max(255),
});

/** POST /api/v1/payments/initiate — idempotent payment initiation (Blueprint §11.4). */
export async function POST(req: Request) {
  try {
    const auth = await requireSession(req);
    if ('response' in auth) return auth.response;
    if (!canWrite(auth.session.role, 'payments')) {
      return err('ERR_FORBIDDEN', 'Authenticated user lacks required permission');
    }
    if (!auth.session.tenantId) return err('ERR_FORBIDDEN', 'Tenant context required');

    const body = await parseBody(req, schema);
    const { transaction, duplicate } = await initiateBitriPayPayment({
      tenantId: auth.session.tenantId,
      amount: body.amount,
      currency: body.currency,
      channel: body.channel,
      customerRef: body.customer_ref,
      metadata: body.metadata,
      idempotencyKey: body.idempotency_key,
    });

    // Fraud Detection Agent scores every transaction event (Blueprint §5.4) —
    // best-effort: never blocks the payment response.
    if (!duplicate) {
      executeAgent({
        tenantId: auth.session.tenantId,
        agentType: 'fraud_detection_agent',
        triggerType: 'event',
        input: { transaction_id: transaction.id, amount: body.amount, channel: body.channel },
      }).catch(() => undefined);
    }

    return ok(
      {
        transaction: {
          id: transaction.id,
          status: transaction.status,
          amount: transaction.amount,
          currency: transaction.currency,
          gateway: transaction.gateway,
          channel: transaction.channel,
          gateway_reference: transaction.gatewayReference,
          fraud_score: transaction.fraudScore,
          fee: computeFee(body.amount, body.currency, body.channel),
          duplicate,
        },
      },
      duplicate ? 200 : 201
    );
  } catch (e) {
    return handleError(e);
  }
}
