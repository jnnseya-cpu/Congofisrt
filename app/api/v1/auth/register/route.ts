import { z } from 'zod';
import { db } from '@/lib/db';
import { hashPassword, issueSession } from '@/lib/auth';
import { ok, err, parseBody, handleError, rateLimit } from '@/lib/api';
import { audit } from '@/lib/audit';
import { executeAgent } from '@/lib/agents/engine';

const schema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  tenant_name: z.string().min(2).max(255).optional(),
  role: z
    .enum(['business_owner', 'developer', 'merchant', 'team_member', 'consumer'])
    .default('business_owner'),
});

/** POST /api/v1/auth/register — create account + tenant; triggers Onboarding Agent. */
export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'local';
    if (!rateLimit(`register:${ip}`, 10)) {
      return err('ERR_RATE_LIMITED', 'API rate limit exceeded for this key/IP');
    }
    const body = await parseBody(req, schema);

    const existing = await db.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (existing) return err('ERR_DUPLICATE_KEY', 'An account with this email already exists');

    const tenantName = body.tenant_name ?? `${body.first_name}'s Organisation`;
    const slugBase = tenantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const tenant = await db.tenant.create({
      data: {
        name: tenantName,
        slug: `${slugBase}-${Date.now().toString(36)}`,
        acuBalance: 500, // Starter allocation (Blueprint §12.1)
        tier: 'starter',
      },
    });

    const user = await db.user.create({
      data: {
        tenantId: tenant.id,
        email: body.email.toLowerCase(),
        passwordHash: await hashPassword(body.password),
        firstName: body.first_name,
        lastName: body.last_name,
        role: body.role,
      },
    });

    const tokens = await issueSession(user);
    await audit({
      tenantId: tenant.id,
      actorId: user.id,
      actorType: 'user',
      action: 'auth.registered',
      ipAddress: ip,
    });

    // Fire the Onboarding Agent (Blueprint §11.1) — non-blocking by design,
    // but awaited here so the demo immediately shows the execution trace.
    await executeAgent({
      tenantId: tenant.id,
      agentType: 'onboarding_agent',
      triggerType: 'event',
      input: { email: user.email, role: user.role },
      actorId: user.id,
    }).catch(() => undefined);

    return ok(
      {
        user: { id: user.id, email: user.email, role: user.role },
        tenant: { id: tenant.id, slug: tenant.slug },
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      },
      201
    );
  } catch (e) {
    return handleError(e);
  }
}
