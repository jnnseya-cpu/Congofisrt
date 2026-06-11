import { z } from 'zod';
import { db } from '@/lib/db';
import { ok, err, parseBody, handleError, requireSession } from '@/lib/api';

/** GET /api/v1/users/me — authenticated user profile. */
export async function GET(req: Request) {
  try {
    const auth = await requireSession(req);
    if ('response' in auth) return auth.response;
    const user = await db.user.findUnique({ where: { id: auth.session.sub } });
    if (!user) return err('ERR_NOT_FOUND', 'Requested resource does not exist');
    const tenant = user.tenantId
      ? await db.tenant.findUnique({ where: { id: user.tenantId } })
      : null;
    return ok({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        role: user.role,
        mfa_enabled: user.mfaEnabled,
        tenant: tenant ? { id: tenant.id, name: tenant.name, slug: tenant.slug } : null,
        created_at: user.createdAt,
      },
    });
  } catch (e) {
    return handleError(e);
  }
}

const patchSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
});

/** PATCH /api/v1/users/me — update profile fields. */
export async function PATCH(req: Request) {
  try {
    const auth = await requireSession(req);
    if ('response' in auth) return auth.response;
    const body = await parseBody(req, patchSchema);
    const user = await db.user.update({
      where: { id: auth.session.sub },
      data: { firstName: body.first_name, lastName: body.last_name },
    });
    return ok({ user: { id: user.id, first_name: user.firstName, last_name: user.lastName } });
  } catch (e) {
    return handleError(e);
  }
}
