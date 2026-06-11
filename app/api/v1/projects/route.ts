import { db } from '@/lib/db';
import { ok, err, handleError, requireSession } from '@/lib/api';

/** GET /api/v1/projects — tenant project portfolio with EVM snapshot. */
export async function GET(req: Request) {
  try {
    const auth = await requireSession(req);
    if ('response' in auth) return auth.response;
    if (!auth.session.tenantId) return err('ERR_FORBIDDEN', 'Tenant context required');
    const projects = await db.project.findMany({
      where: { tenantId: auth.session.tenantId },
      orderBy: { createdAt: 'asc' },
    });
    return ok({
      projects: projects.map((p) => ({
        ...p,
        cpi: p.actualCost > 0 ? p.earnedValue / p.actualCost : 1,
        spi: p.plannedValue > 0 ? p.earnedValue / p.plannedValue : 1,
      })),
    });
  } catch (e) {
    return handleError(e);
  }
}
