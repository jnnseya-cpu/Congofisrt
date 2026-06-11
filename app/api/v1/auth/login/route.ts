import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyPassword, issueSession, recordLoginFailure } from '@/lib/auth';
import { ok, err, parseBody, handleError, rateLimit } from '@/lib/api';
import { audit } from '@/lib/audit';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  mfa_code: z.string().optional(),
});

/** POST /api/v1/auth/login — authenticate; locks account after 5 failures. */
export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'local';
    if (!rateLimit(`login:${ip}`, 30)) {
      return err('ERR_RATE_LIMITED', 'API rate limit exceeded for this key/IP');
    }
    const body = await parseBody(req, schema);
    const user = await db.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (!user || user.deletedAt) {
      return err('ERR_UNAUTHENTICATED', 'Invalid email or password');
    }
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return err('ERR_ACCOUNT_LOCKED', 'Account locked due to suspicious activity');
    }
    if (user.status === 'suspended' || user.status === 'deactivated') {
      return err('ERR_FORBIDDEN', 'Account is not active');
    }

    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) {
      await recordLoginFailure(user.id, user.failedLoginCount);
      await audit({
        tenantId: user.tenantId,
        actorId: user.id,
        actorType: 'user',
        action: 'auth.login.failed',
        ipAddress: ip,
      });
      return err('ERR_UNAUTHENTICATED', 'Invalid email or password');
    }

    await db.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
    });
    const tokens = await issueSession(user);
    await audit({
      tenantId: user.tenantId,
      actorId: user.id,
      actorType: 'user',
      action: 'auth.login.success',
      ipAddress: ip,
      userAgent: req.headers.get('user-agent') ?? undefined,
    });

    return ok({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: { id: user.id, role: user.role, tenant_id: user.tenantId },
    });
  } catch (e) {
    return handleError(e);
  }
}
