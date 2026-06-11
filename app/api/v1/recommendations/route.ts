import { db } from '@/lib/db';
import { ok, handleError, requireSession } from '@/lib/api';

/** GET /api/v1/recommendations — AI recommendation queue (?scope=platform|business|project). */
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
    const recommendations = await db.recommendation.findMany({
      where,
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
      take: 10,
    });
    return ok({ recommendations });
  } catch (e) {
    return handleError(e);
  }
}
