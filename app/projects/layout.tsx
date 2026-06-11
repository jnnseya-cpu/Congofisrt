import { requirePageSession } from '@/lib/page-auth';
import { Shell } from '@/components/Shell';
import type { PlainNavItem } from '@/components/NavLinks';
import { db } from '@/lib/db';
import { acuConsumedSince, dayStart } from '@/lib/queries';
import { fmtNum } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const NAV: PlainNavItem[] = [
  { href: '/projects', label: 'Project Portfolio', icon: 'dashboard' },
  { href: '/business', label: 'Business Centre', icon: 'performance' },
  { href: '/business/agents', label: 'AI Workforce', icon: 'agents' },
  { href: '/business/domains', label: 'Domain Modules', icon: 'domains' },
];

export default async function ProjectsLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePageSession();
  const [acuToday, alerts] = await Promise.all([
    session.tenantId ? acuConsumedSince(dayStart(), session.tenantId) : Promise.resolve(0),
    session.tenantId
      ? db.threatAlert.count({
          where: { tenantId: session.tenantId, scope: 'project', status: 'open' },
        })
      : Promise.resolve(0),
  ]);
  return (
    <Shell
      contextLabel="Project Command Centre"
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
