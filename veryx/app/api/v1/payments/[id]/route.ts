import { db } from '@/lib/db';
import { ok, err, handleError, requireSession } from '@/lib/api';

/** GET /api/v1/payments/{transaction_id} — transaction detail. */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSession(req);
    if ('response' in auth) return auth.response;
    const tx = await db.transaction.findUnique({ where: { id: params.id } });
    if (!tx) return err('ERR_NOT_FOUND', 'Requested resource does not exist');
    if (auth.session.role !== 'super_admin' && tx.tenantId !== auth.session.tenantId) {
      return err('ERR_FORBIDDEN', 'Authenticated user lacks required permission');
    }
    return ok({
      transaction: {
        id: tx.id,
        type: tx.type,
        status: tx.status,
        amount: tx.amount,
        currency: tx.currency,
        gateway: tx.gateway,
        channel: tx.channel,
        gateway_reference: tx.gatewayReference,
        fraud_score: tx.fraudScore,
        created_at: tx.createdAt,
        completed_at: tx.completedAt,
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
