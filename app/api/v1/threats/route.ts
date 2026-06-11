import { db } from '@/lib/db';
import { ok, handleError, requireSession } from '@/lib/api';

/** GET /api/v1/threats — threat/alert feed (?scope=platform|business|project). */
export async function GET(req: Request) {
  try {
    const auth = await requireSession(req);
    if ('response' in auth) return auth.response;
    const url = new URL(req.url);
    const scope = url.searchParams.get('scope') ?? 'business';
    const where =
      auth.session.role === 'super_admin' && scope === 'platform'
        ? { scope: 'platform', status: 'open' }
        : { tenantId: auth.session.tenantId, scope, status: 'open' };
    const threats = await db.threatAlert.findMany({
      where,
      orderBy: [{ severity: 'asc' }, { detectedAt: 'desc' }],
      take: 25,
    });
    return ok({ threats });
  } catch (e) {
    return handleError(e);
  }
}
