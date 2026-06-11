import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken, type SessionClaims, type Role } from './auth';

/** Resolve the dashboard session from the cookie inside a Server Component. */
export async function getPageSession(): Promise<SessionClaims | null> {
  const token = cookies().get('veryx_session')?.value;
  if (!token) return null;
  const claims = await verifyToken(token);
  return claims?.typ === 'access' ? claims : null;
}

/** Require a session for a page; redirect to /login when absent or wrong role. */
export async function requirePageSession(roles?: Role[]): Promise<SessionClaims> {
  const session = await getPageSession();
  if (!session) redirect('/login');
  if (roles && !roles.includes(session.role)) redirect('/login?denied=1');
  return session;
}
