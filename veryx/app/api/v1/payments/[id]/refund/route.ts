import { z } from 'zod';
import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { ok, err, parseBody, handleError, requireSession } from '@/lib/api';
import { canWrite } from '@/lib/rbac';
import { audit } from '@/lib/audit';

const schema = z.object({
  amount: z.number().positive(),
  reason_code: z.string().min(2).max(64),
  notes: z.string().max(2000).optional(),
});

/** POST /api/v1/payments/{id}/refund — full or partial refund (Blueprint §11.4). */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSession(req);
    if ('response' in auth) return auth.response;
    if (!canWrite(auth.session.role, 'payments')) {
      return err('ERR_FORBIDDEN', 'Authenticated user lacks required permission');
    }
    const original = await db.transaction.findUnique({ where: { id: params.id } });
    if (!original) return err('ERR_NOT_FOUND', 'Requested resource does not exist');
    if (auth.session.role !== 'super_admin' && original.tenantId !== auth.session.tenantId) {
      return err('ERR_FORBIDDEN', 'Authenticated user lacks required permission');
    }
    if (original.status !== 'completed') {
      return err('ERR_VALIDATION', 'Only completed transactions can be refunded');
    }
    const body = await parseBody(req, schema);
    if (body.amount > original.amount) {
      return err('ERR_VALIDATION', 'Refund amount exceeds original transaction amount');
    }

    const refund = await db.transaction.create({
      data: {
        tenantId: original.tenantId,
        type: 'refund',
        status: 'completed',
        amount: -body.amount,
        currency: original.currency,
        gateway: original.gateway,
        channel: original.channel,
        gatewayReference: `RFD-${randomUUID().slice(0, 12).toUpperCase()}`,
        metadata: JSON.stringify({
          original_transaction_id: original.id,
          reason_code: body.reason_code,
          notes: body.notes,
        }),
        idempotencyKey: `refund-${original.id}-${Date.now()}`,
        completedAt: new Date(),
      },
    });
    await audit({
      tenantId: original.tenantId,
      actorId: auth.session.sub,
      actorType: 'user',
      action: 'payment.refunded',
      resourceType: 'transaction',
      resourceId: refund.id,
      changes: { original: original.id, amount: body.amount, reason: body.reason_code },
    });
    return ok(
      {
        refund: {
          id: refund.id,
          transaction_id: original.id,
          amount: body.amount,
          status: refund.status,
        },
      },
      201
    );
  } catch (e) {
    return handleError(e);
  }
}
