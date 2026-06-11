import type { Role } from './auth';

// ── RBAC matrix (Blueprint §3.2) ─────────────────────────────────────────────
// RW = read+write, R = read-only, '-' = none, API = programmatic only.

export type Access = 'RW' | 'R' | 'API' | '-';

export type Module =
  | 'platform_config'
  | 'user_management'
  | 'ai_agents'
  | 'payments'
  | 'analytics'
  | 'billing'
  | 'api_keys'
  | 'compliance'
  | 'audit_logs'
  | 'security';

const MATRIX: Record<Module, Partial<Record<Role, Access>>> = {
  platform_config: { super_admin: 'RW', enterprise_admin: 'R' },
  user_management: { super_admin: 'RW', enterprise_admin: 'RW', business_owner: 'RW' },
  ai_agents: {
    super_admin: 'RW',
    enterprise_admin: 'RW',
    business_owner: 'RW',
    team_member: 'R',
    developer: 'API',
  },
  payments: {
    super_admin: 'RW',
    enterprise_admin: 'R',
    business_owner: 'RW',
    team_member: 'R',
    developer: 'API',
    merchant: 'RW',
  },
  analytics: {
    super_admin: 'RW',
    enterprise_admin: 'RW',
    business_owner: 'RW',
    team_member: 'R',
    developer: 'R',
    merchant: 'R',
  },
  billing: {
    super_admin: 'RW',
    enterprise_admin: 'RW',
    business_owner: 'RW',
    developer: 'R',
    merchant: 'R',
  },
  api_keys: {
    super_admin: 'RW',
    enterprise_admin: 'RW',
    business_owner: 'RW',
    developer: 'RW',
    merchant: 'RW',
  },
  compliance: {
    super_admin: 'RW',
    enterprise_admin: 'R',
    business_owner: 'R',
    merchant: 'R',
  },
  audit_logs: { super_admin: 'RW', enterprise_admin: 'R', business_owner: 'R' },
  security: { super_admin: 'RW', enterprise_admin: 'R', business_owner: 'R' },
};

export function accessFor(role: Role, module: Module): Access {
  return MATRIX[module][role] ?? '-';
}

export function canRead(role: Role, module: Module): boolean {
  return accessFor(role, module) !== '-';
}

export function canWrite(role: Role, module: Module): boolean {
  const a = accessFor(role, module);
  return a === 'RW' || a === 'API';
}

export const isPlatformAdmin = (role: Role) => role === 'super_admin';
export const isEnterpriseLevel = (role: Role) =>
  role === 'super_admin' || role === 'enterprise_admin' || role === 'business_owner';
