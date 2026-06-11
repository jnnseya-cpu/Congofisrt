import { requirePageSession } from '@/lib/page-auth';
import { Shell } from '@/components/Shell';
import type { PlainNavItem } from '@/components/NavLinks';
import { acuConsumedSince, dayStart, openThreatCount } from '@/lib/queries';
import { fmtNum } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// §23A.2 — left navigation: the eleven platform sections.
const NAV: PlainNavItem[] = [
  { href: '/admin', label: 'Command Center', icon: 'dashboard' },
  { href: '/admin/performance', label: 'Performance', icon: 'performance' },
  { href: '/admin/ai-engine', label: 'AI Engine', icon: 'ai' },
  { href: '/admin/acu', label: 'ACU Economy', icon: 'acu' },
  { href: '/admin/tenants', label: 'Tenants & Users', icon: 'users' },
  { href: '/admin/threats', label: 'Risk & Alerts', icon: 'risk' },
  { href: '/admin/system', label: 'System Control', icon: 'system' },
  { href: '/admin/predictive', label: 'Predictive Intel', icon: 'predictive' },
  { href: '/admin/audit', label: 'Audit Logs', icon: 'audit' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePageSession(['super_admin']);
  const [acuToday, alerts] = await Promise.all([
    acuConsumedSince(dayStart()),
    openThreatCount('platform'),
  ]);
  return (
    <Shell
      contextLabel="VERYX Platform"
      contextTone="gold"
      nav={NAV}
      userEmail={session.email}
      acuRate={fmtNum(acuToday, true)}
      alertCount={alerts}
    >
      {children}
    </Shell>
  );
}
