import { clearSession, getSession } from '@/lib/auth';
import { ok } from '@/lib/api';
import { audit } from '@/lib/audit';

/** POST /api/v1/auth/logout — revoke the current dashboard session. */
export async function POST(req: Request) {
  const session = await getSession(req);
  if (session) {
    await audit({
      tenantId: session.tenantId,
      actorId: session.sub,
      actorType: 'user',
      action: 'auth.logout',
    });
  }
  clearSession();
  return ok({ success: true });
}
