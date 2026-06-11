import { db } from '@/lib/db';
import { ok, err, handleError, requireSession } from '@/lib/api';

/** GET /api/v1/tenants/me — tenant details, plan and ACU balance. */
export async function GET(req: Request) {
  try {
    const auth = await requireSession(req);
    if ('response' in auth) return auth.response;
    if (!auth.session.tenantId) return err('ERR_NOT_FOUND', 'No tenant associated with this user');
    const tenant = await db.tenant.findUnique({ where: { id: auth.session.tenantId } });
    if (!tenant) return err('ERR_NOT_FOUND', 'Requested resource does not exist');
    return ok({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        tier: tenant.tier,
        acu_balance: tenant.acuBalance,
        kyb_status: tenant.kybStatus,
        country_code: tenant.countryCode,
        settings: JSON.parse(tenant.settings),
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
