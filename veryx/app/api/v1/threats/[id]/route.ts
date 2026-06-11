import { z } from 'zod';
import { db } from '@/lib/db';
import { ok, err, parseBody, handleError, requireSession } from '@/lib/api';
import { audit } from '@/lib/audit';

const schema = z.object({ status: z.enum(['reviewing', 'resolved']) });

/** PATCH /api/v1/threats/{id} — move a threat through its triage lifecycle. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSession(req);
    if ('response' in auth) return auth.response;
    const threat = await db.threatAlert.findUnique({ where: { id: params.id } });
    if (!threat) return err('ERR_NOT_FOUND', 'Requested resource does not exist');
    if (threat.scope === 'platform' && auth.session.role !== 'super_admin') {
      return err('ERR_FORBIDDEN', 'Authenticated user lacks required permission');
    }
    if (threat.scope !== 'platform' && threat.tenantId !== auth.session.tenantId) {
      return err('ERR_FORBIDDEN', 'Authenticated user lacks required permission');
    }
    const body = await parseBody(req, schema);
    const updated = await db.threatAlert.update({
      where: { id: params.id },
      data: { status: body.status },
    });
    await audit({
      tenantId: threat.tenantId,
      actorId: auth.session.sub,
      actorType: 'user',
      action: `threat.${body.status}`,
      resourceType: 'threat_alert',
      resourceId: threat.id,
    });
    return ok({ threat: updated });
  } catch (e) {
    return handleError(e);
  }
}
