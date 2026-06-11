import { db } from '@/lib/db';
import { ok, err, handleError, requireSession } from '@/lib/api';
import { canRead } from '@/lib/rbac';
import { verifyChain } from '@/lib/audit';

/** GET /api/v1/audit — immutable audit log explorer + chain verification. */
export async function GET(req: Request) {
  try {
    const auth = await requireSession(req);
    if ('response' in auth) return auth.response;
    if (!canRead(auth.session.role, 'audit_logs')) {
      return err('ERR_FORBIDDEN', 'Authenticated user lacks required permission');
    }
    const url = new URL(req.url);
    const limit = Math.min(200, Number(url.searchParams.get('limit') ?? 50));
    const where =
      auth.session.role === 'super_admin' ? {} : { tenantId: auth.session.tenantId };
    const [logs, chain] = await Promise.all([
      db.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit }),
      verifyChain(),
    ]);
    return ok({
      logs: logs.map((l) => ({
        id: l.id,
        action: l.action,
        actor_type: l.actorType,
        actor_id: l.actorId,
        resource_type: l.resourceType,
        resource_id: l.resourceId,
        ip_address: l.ipAddress,
        justification: l.justification,
        hash: l.hash,
        created_at: l.createdAt,
      })),
      chain_integrity: chain,
    });
  } catch (e) {
    return handleError(e);
  }
}
