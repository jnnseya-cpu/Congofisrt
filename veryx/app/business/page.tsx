import { requirePageSession } from '@/lib/page-auth';
import { db } from '@/lib/db';
import { dayStart, monthStart, revenueBetween, revenueSeries } from '@/lib/queries';
import { fmtGbp, fmtNum, fmtPct } from '@/lib/utils';
import { Card, KpiTile, Pill, ProgressBar } from '@/components/ui';
import { InsightCard } from '@/components/cards';
import { RevenueCostChart } from '@/components/charts';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

/** §23B.1 — Business Operations Command Center (executive landing screen). */
export default async function BusinessCommandCenter() {
  const session = await requirePageSession();
  const tenantId = session.tenantId!;

  const [revToday, revMonth, revLifetime, workflows, recs, threats, tenant, teamCount, series] =
    await Promise.all([
      revenueBetween(dayStart(), null, tenantId),
      revenueBetween(monthStart(), null, tenantId),
      revenueBetween(new Date(0), null, tenantId),
      db.workflow.findMany({ where: { tenantId } }),
      db.recommendation.findMany({
        where: { tenantId, scope: 'business', status: 'open' },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      db.threatAlert.findMany({ where: { tenantId, scope: 'business', status: 'open' } }),
      db.tenant.findUniqueOrThrow({ where: { id: tenantId } }),
      db.user.count({ where: { tenantId, status: 'active' } }),
      revenueSeries(7, tenantId),
    ]);

  const active = workflows.filter((w) => w.status === 'running').length;
  const opSpend = workflows.reduce((s, w) => s + w.costToday, 0);
  const automationRate =
    workflows.length > 0 ? workflows.reduce((s, w) => s + w.automationRate, 0) / workflows.length : 0;
  const margin = revMonth > 0 ? ((revMonth - opSpend * 30) / revMonth) * 100 : 0;
  const sevCount = { HIGH: 0, MEDIUM: 0, LOW: 0 } as Record<string, number>;
  threats.forEach((t) => (sevCount[t.severity] = (sevCount[t.severity] ?? 0) + 1));

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold text-white">Command Center — Executive Overview</h1>

      {/* Top-row KPI tiles (§23B.1) */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-8">
        <KpiTile label="Revenue — Today" value={fmtGbp(revToday, true)} trend="up" delta="live" />
        <KpiTile label="Revenue — This Month" value={fmtGbp(revMonth, true)} trend="up" delta="MTD" />
        <KpiTile label="Revenue — Lifetime" value={fmtGbp(revLifetime, true)} trend="up" />
        <KpiTile label="Operational Spend" value={fmtGbp(opSpend, true)} trend="flat" delta="today" />
        <KpiTile label="Profit Margin" value={fmtPct(Math.max(0, margin))} trend={margin > 40 ? 'up' : 'down'} />
        <KpiTile label="AI Automation Rate" value={fmtPct(automationRate, 0)} trend="up" delta="of ops" />
        <KpiTile label="Workflows Active" value={fmtNum(active)} trend="flat" delta={`${workflows.length} total`} />
        <KpiTile label="Pending Approvals" value={fmtNum(threats.length)} trend={threats.length > 3 ? 'down' : 'flat'} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card
          title="Revenue vs cost vs margin"
          subtitle="7-day trend with forecast extension (§23B.1)"
          className="xl:col-span-2"
        >
          <RevenueCostChart data={series} />
        </Card>

        <div className="space-y-4">
          <Card title="Business health score" subtitle="Composite AI score from financial, operational & risk signals">
            <div className="flex items-end gap-3">
              <span className="vx-kpi-value !text-4xl">{tenant.healthScore}</span>
              <span className="pb-1 text-xs text-veryx-muted">/100</span>
            </div>
            <ProgressBar
              className="mt-2"
              value={tenant.healthScore}
              tone={tenant.healthScore > 70 ? 'ok' : tenant.healthScore > 40 ? 'warn' : 'high'}
            />
          </Card>

          <Card title="Open risk summary" subtitle="Active alerts by severity (§23B.1)">
            <div className="flex items-center gap-2">
              <Pill tone="high">{sevCount.HIGH ?? 0} high</Pill>
              <Pill tone="warn">{sevCount.MEDIUM ?? 0} medium</Pill>
              <Pill tone="info">{sevCount.LOW ?? 0} low</Pill>
            </div>
            <Link href="/business/risk" className="vx-btn mt-3 w-full justify-center">
              Open Risk Command →
            </Link>
          </Card>

          <Card title="Team capacity" subtitle="Headcount active vs available">
            <div className="flex items-end justify-between">
              <span className="vx-kpi-value">{teamCount}</span>
              <span className="text-xs text-veryx-muted">active members</span>
            </div>
            <ProgressBar className="mt-2" value={72} tone="gold" />
            <p className="mt-1.5 text-[11px] text-veryx-muted">72% utilised · 2 overloaded · 1 on bench</p>
          </Card>
        </div>
      </div>

      <Card title="AI recommendation queue" subtitle="Top AI-generated actions requiring executive decision (§23B.1)">
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {recs.length === 0 && <p className="text-xs text-veryx-muted">Queue clear.</p>}
          {recs.map((rec) => (
            <InsightCard key={rec.id} rec={rec} />
          ))}
        </div>
      </Card>
    </div>
  );
}
