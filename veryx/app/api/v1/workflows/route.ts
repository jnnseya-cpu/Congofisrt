import { db } from '@/lib/db';
import { ok, err, handleError, requireSession } from '@/lib/api';

/** GET /api/v1/workflows — enterprise workflow monitor feed (§23B.3). */
export async function GET(req: Request) {
  try {
    const auth = await requireSession(req);
    if ('response' in auth) return auth.response;
    if (!auth.session.tenantId) return err('ERR_FORBIDDEN', 'Tenant context required');
    const workflows = await db.workflow.findMany({
      where: { tenantId: auth.session.tenantId },
      orderBy: { createdAt: 'asc' },
    });
    return ok({ workflows });
  } catch (e) {
    return handleError(e);
  }
}
