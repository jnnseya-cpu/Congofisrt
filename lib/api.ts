import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { ZodError, type ZodTypeAny, type z } from 'zod';
import { getSession, type SessionClaims, type Role } from './auth';

// ── API envelope (Blueprint §11) ─────────────────────────────────────────────
// { success, data, error: {code,message}, request_id, timestamp }

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      error: null,
      request_id: randomUUID(),
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export type ErrCode =
  | 'ERR_UNAUTHENTICATED'
  | 'ERR_FORBIDDEN'
  | 'ERR_NOT_FOUND'
  | 'ERR_VALIDATION'
  | 'ERR_RATE_LIMITED'
  | 'ERR_ACU_INSUFFICIENT'
  | 'ERR_KYC_REQUIRED'
  | 'ERR_ACCOUNT_LOCKED'
  | 'ERR_DUPLICATE_KEY'
  | 'ERR_GATEWAY_FAILURE'
  | 'ERR_INTERNAL';

const STATUS: Record<ErrCode, number> = {
  ERR_UNAUTHENTICATED: 401,
  ERR_FORBIDDEN: 403,
  ERR_NOT_FOUND: 404,
  ERR_VALIDATION: 422,
  ERR_RATE_LIMITED: 429,
  ERR_ACU_INSUFFICIENT: 402,
  ERR_KYC_REQUIRED: 403,
  ERR_ACCOUNT_LOCKED: 403,
  ERR_DUPLICATE_KEY: 409,
  ERR_GATEWAY_FAILURE: 502,
  ERR_INTERNAL: 500,
};

export function err(code: ErrCode, message: string, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      data: null,
      error: { code, message, details: details ?? {} },
      request_id: randomUUID(),
      timestamp: new Date().toISOString(),
    },
    { status: STATUS[code] }
  );
}

/** Parse + validate a JSON body against a Zod schema (defaults applied). */
export async function parseBody<S extends ZodTypeAny>(
  req: Request,
  schema: S
): Promise<z.infer<S>> {
  const json = await req.json().catch(() => ({}));
  return schema.parse(json);
}

export function handleError(e: unknown) {
  if (e instanceof ZodError) {
    return err('ERR_VALIDATION', 'Request body failed schema validation', e.flatten());
  }
  console.error('[veryx:api]', e);
  return err('ERR_INTERNAL', 'Unexpected internal server error (contact support)');
}

/** Require an authenticated session; optionally restrict to given roles. */
export async function requireSession(
  req: Request,
  roles?: Role[]
): Promise<{ session: SessionClaims } | { response: NextResponse }> {
  const session = await getSession(req);
  if (!session) {
    return { response: err('ERR_UNAUTHENTICATED', 'No valid authentication token provided') };
  }
  if (roles && !roles.includes(session.role)) {
    return { response: err('ERR_FORBIDDEN', 'Authenticated user lacks required permission') };
  }
  return { session };
}

// ── In-memory token-bucket rate limiter (Kong-gateway stand-in, §9.3) ────────
const buckets = new Map<string, { tokens: number; refilled: number }>();

export function rateLimit(key: string, perMinute = 120): boolean {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: perMinute, refilled: now };
  const elapsed = (now - bucket.refilled) / 60_000;
  bucket.tokens = Math.min(perMinute, bucket.tokens + elapsed * perMinute);
  bucket.refilled = now;
  if (bucket.tokens < 1) {
    buckets.set(key, bucket);
    return false;
  }
  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return true;
}
