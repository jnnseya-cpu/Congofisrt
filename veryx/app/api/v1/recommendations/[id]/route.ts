import { z } from 'zod';
import { db } from '@/lib/db';
import { ok, err, parseBody, handleError, requireSession } from '@/lib/api';
import { audit } from '@/lib/audit';

const schema = z.object({
  status: z.enum(['acknowledged', 'actioned', 'dismissed']),
});

/** PATCH /api/v1/recommendations/{id} — acknowledge / action / dismiss. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSession(req);
    if ('response' in auth) return auth.response;
    const rec = await db.recommendation.findUnique({ where: { id: params.id } });
    if (!rec) return err('ERR_NOT_FOUND', 'Requested resource does not exist');
    const isPlatform = rec.scope === 'platform';
    if (isPlatform && auth.session.role !== 'super_admin') {
      return err('ERR_FORBIDDEN', 'Authenticated user lacks required permission');
    }
    if (!isPlatform && rec.tenantId !== auth.session.tenantId) {
      return err('ERR_FORBIDDEN', 'Authenticated user lacks required permission');
    }
    const body = await parseBody(req, schema);
    const updated = await db.recommendation.update({
      where: { id: params.id },
      data: { status: body.status },
    });
    await audit({
      tenantId: rec.tenantId,
      actorId: auth.session.sub,
      actorType: 'user',
      action: `recommendation.${body.status}`,
      resourceType: 'recommendation',
      resourceId: rec.id,
    });
    return ok({ recommendation: updated });
  } catch (e) {
    return handleError(e);
  }
}
