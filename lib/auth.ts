import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { db } from './db';

// ── JWT session layer (Blueprint §6.2: 15-min access / 30-day refresh) ──────

const SECRET = new TextEncoder().encode(
  process.env.VERYX_JWT_SECRET ?? 'dev-veryx-jwt-secret-change-me-please-32min'
);
const ACCESS_MINUTES = Number(process.env.VERYX_ACCESS_TOKEN_MINUTES ?? 15);
const REFRESH_DAYS = Number(process.env.VERYX_REFRESH_TOKEN_DAYS ?? 30);

export type Role =
  | 'super_admin'
  | 'enterprise_admin'
  | 'business_owner'
  | 'team_member'
  | 'developer'
  | 'merchant'
  | 'partner'
  | 'consumer';

export interface SessionClaims extends JWTPayload {
  sub: string; // user id
  email: string;
  role: Role;
  tenantId: string | null;
  typ: 'access' | 'refresh';
}

export const hashPassword = (plain: string) => bcrypt.hash(plain, 12);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

export async function signAccessToken(claims: Omit<SessionClaims, 'typ' | 'iat' | 'exp'>) {
  return new SignJWT({ ...claims, typ: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('veryx')
    .setExpirationTime(`${ACCESS_MINUTES}m`)
    .sign(SECRET);
}

export async function signRefreshToken(claims: Omit<SessionClaims, 'typ' | 'iat' | 'exp'>) {
  return new SignJWT({ ...claims, typ: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('veryx')
    .setExpirationTime(`${REFRESH_DAYS}d`)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { issuer: 'veryx' });
    return payload as SessionClaims;
  } catch {
    return null;
  }
}

/**
 * Resolve the current session from (in priority order):
 *  1. `Authorization: Bearer <jwt>` header — API clients
 *  2. `veryx_session` cookie — dashboard UI
 */
export async function getSession(req?: Request): Promise<SessionClaims | null> {
  const header = req?.headers.get('authorization');
  if (header?.startsWith('Bearer ')) {
    const claims = await verifyToken(header.slice(7));
    if (claims?.typ === 'access') return claims;
  }
  const cookie = cookies().get('veryx_session')?.value;
  if (cookie) {
    const claims = await verifyToken(cookie);
    if (claims?.typ === 'access') return claims;
  }
  return null;
}

/** Issue both tokens and set the dashboard session cookie. */
export async function issueSession(user: {
  id: string;
  email: string;
  role: string;
  tenantId: string | null;
}) {
  const base = {
    sub: user.id,
    email: user.email,
    role: user.role as Role,
    tenantId: user.tenantId,
  };
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(base),
    signRefreshToken(base),
  ]);
  cookies().set('veryx_session', accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ACCESS_MINUTES * 60,
  });
  cookies().set('veryx_refresh', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: REFRESH_DAYS * 24 * 60 * 60,
  });
  return { accessToken, refreshToken };
}

export function clearSession() {
  cookies().delete('veryx_session');
  cookies().delete('veryx_refresh');
}

/** Account lockout per Blueprint §11.1: locked after 5 consecutive failures. */
export async function recordLoginFailure(userId: string, currentCount: number) {
  const failed = currentCount + 1;
  await db.user.update({
    where: { id: userId },
    data: {
      failedLoginCount: failed,
      lockedUntil: failed >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null,
    },
  });
}
