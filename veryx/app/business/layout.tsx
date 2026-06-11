import { requirePageSession } from '@/lib/page-auth';
import { Shell } from '@/components/Shell';
import type { PlainNavItem } from '@/components/NavLinks';
import { db } from '@/lib/db';
import { acuConsumedSince, dayStart } from '@/lib/queries';
import { fmtNum } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const NAV: PlainNavItem[] = [
  { href: '/business', label: 'Command Center', icon: 'dashboard' },
  { href: '/business/performance', label: 'Performance', icon: 'performance' },
  { href: '/business/operations', label: 'Operations', icon: 'workflow' },
  { href: '/business/agents', label: 'AI Workforce', icon: 'agents' },
  { href: '/business/usage', label: 'Usage Economy', icon: 'acu' },
  { href: '/business/payments', label: 'Payments', icon: 'wallet' },
  { href: '/business/team', label: 'Team & Access', icon: 'users' },
  { href: '/business/risk', label: 'Risk & Alerts', icon: 'risk' },
  { href: '/business/domains', label: 'Domain Modules', icon: 'domains' },
  { href: '/business/reports', label: 'Reports', icon: 'reports' },
  { href: '/business/integrations', label: 'Integrations', icon: 'integrations' },
  { href: '/business/next', label: 'What Happens Next', icon: 'predictive' },
];

export default async function BusinessLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePageSession([
    'super_admin',
    'enterprise_admin',
    'business_owner',
    'team_member',
    'merchant',
    'partner',
    'developer',
  ]);
  const tenant = session.tenantId
    ? await db.tenant.findUnique({ where: { id: session.tenantId }, select: { name: true } })
    : null;
  const [acuToday, alerts] = await Promise.all([
    session.tenantId ? acuConsumedSince(dayStart(), session.tenantId) : Promise.resolve(0),
    session.tenantId
      ? db.threatAlert.count({
          where: { tenantId: session.tenantId, scope: 'business', status: 'open' },
        })
      : Promise.resolve(0),
  ]);
  return (
    <Shell
      contextLabel={tenant?.name ?? 'Enterprise Workspace'}
      contextTone="info"
      nav={NAV}
      userEmail={session.email}
      acuRate={fmtNum(acuToday, true)}
      alertCount={alerts}
    >
      {children}
    </Shell>
  );
}
