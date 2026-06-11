import { z } from 'zod';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken, issueSession } from '@/lib/auth';
import { ok, err, handleError } from '@/lib/api';

const schema = z.object({ refresh_token: z.string().optional() });

/** POST /api/v1/auth/refresh — rotate tokens (Blueprint §11.1). */
export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json().catch(() => ({})));
    const token = body.refresh_token ?? cookies().get('veryx_refresh')?.value;
    if (!token) return err('ERR_UNAUTHENTICATED', 'No refresh token provided');

    const claims = await verifyToken(token);
    if (!claims || claims.typ !== 'refresh') {
      return err('ERR_UNAUTHENTICATED', 'Invalid or expired refresh token');
    }
    const user = await db.user.findUnique({ where: { id: claims.sub } });
    if (!user || user.status !== 'active') {
      return err('ERR_UNAUTHENTICATED', 'Account no longer active');
    }
    // Rotation on every use (rotation-attack prevention).
    const tokens = await issueSession(user);
    return ok({ access_token: tokens.accessToken, refresh_token: tokens.refreshToken });
  } catch (e) {
    return handleError(e);
  }
}
