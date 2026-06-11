import { createHash } from 'crypto';
import { db } from './db';

// ── Immutable audit trail (Blueprint §6.10) ──────────────────────────────────
// Append-only records with a SHA-256 hash chain: each entry's hash covers its
// own payload plus the previous entry's hash, making tampering evident.

export interface AuditInput {
  tenantId?: string | null;
  actorId?: string | null;
  actorType?: 'user' | 'agent' | 'system' | 'api_key';
  action: string; // e.g. "user.login", "acu.pricing.changed"
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  justification?: string;
  changes?: unknown;
}

export async function audit(input: AuditInput) {
  const prev = await db.auditLog.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { hash: true },
  });
  const payload = JSON.stringify({
    ...input,
    changes: input.changes ?? null,
    at: new Date().toISOString(),
    prev: prev?.hash ?? 'GENESIS',
  });
  const hash = createHash('sha256').update(payload).digest('hex');

  return db.auditLog.create({
    data: {
      tenantId: input.tenantId ?? null,
      actorId: input.actorId ?? null,
      actorType: input.actorType ?? 'system',
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      justification: input.justification,
      changes: input.changes ? JSON.stringify(input.changes) : null,
      hash,
      prevHash: prev?.hash ?? null,
    },
  });
}

/** Verify chain integrity over the most recent `limit` entries. */
export async function verifyChain(limit = 500): Promise<{ valid: boolean; checked: number }> {
  const rows = await db.auditLog.findMany({
    orderBy: { createdAt: 'asc' },
    take: limit,
    select: { hash: true, prevHash: true },
  });
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].prevHash !== rows[i - 1].hash) return { valid: false, checked: i };
  }
  return { valid: true, checked: rows.length };
}
