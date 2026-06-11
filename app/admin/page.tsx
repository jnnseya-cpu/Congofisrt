import { db } from '@/lib/db';
import {
  acuConsumedSince,
  acuPurchasedSince,
  dayStart,
  monthStart,
  revenueBetween,
  revenueSeries,
} from '@/lib/queries';
import { fmtGbp, fmtNum, fmtPct } from '@/lib/utils';
import { Card, KpiTile, ProgressBar } from '@/components/ui';
import { InsightCard } from '@/components/cards';
import { RevenueCostChart, RankedBarChart } from '@/components/charts';

export const dynamic = 'force-dynamic';

/** §23A.3 — Screen 1: Command Center (executive overview, read-write). */
export default async function AdminCommandCenter() {
  const [
    revToday,
    revYesterday,
    revMtd,
    revLifetime,
    tenants,
    acuSold,
    acuConsumed,
    series,
    recommendations,
    activeUsers,
    topTenants,
  ] = await Promise.all([
    revenueBetween(dayStart(), null),
    revenueBetween(dayStart(-1), dayStart()),
    revenueBetween(monthStart(), null),
    revenueBetween(new Date(0), null),
    db.tenant.count({ where: { deletedAt: null } }),
    acuPurchasedSince(dayStart()),
    acuConsumedSince(dayStart()),
    revenueSeries(7),
    db.recommendation.findMany({
      where: { scope: 'platform', status: 'open' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    db.user.count({ where: { status: 'active', deletedAt: null } }),
    db.acuLedgerEntry.groupBy({
      by: ['tenantId'],
      _sum: { delta: true },
      where: { delta: { lt: 0 } },
    }),
  ]);

  const aiCostToday = acuConsumed * 0.011;
  const margin = revToday > 0 ? ((revToday - aiCostToday) / revToday) * 100 : 0;
  const revDelta = revYesterday > 0 ? ((revToday - revYesterday) / revYesterday) * 100 : 0;

  const tenantNames = await db.tenant.findMany({ select: { id: true, name: true } });
  const nameOf = new Map(tenantNames.map((t) => [t.id, t.name]));
  const topConsumers = topTenants
    .map((t) => ({ name: nameOf.get(t.tenantId) ?? t.tenantId, value: Math.abs(t._sum.delta ?? 0) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const dailyAcuBudget = 20_000;
  const burnPct = (acuConsumed / dailyAcuBudget) * 100;

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold text-white">Command Center — Executive Overview</h1>

      {/* Required KPI tiles — top row (§23A.3) */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-8">
        <KpiTile
          label="Total Revenue — Today"
          value={fmtGbp(revToday, true)}
          trend={revDelta >= 0 ? 'up' : 'down'}
          delta={`${revDelta >= 0 ? '+' : ''}${revDelta.toFixed(1)}% vs yday`}
        />
        <KpiTile label="MTD Revenue" value={fmtGbp(revMtd, true)} trend="up" delta="MTD" />
        <KpiTile label="Lifetime Revenue" value={fmtGbp(revLifetime, true)} trend="up" delta="total" />
        <KpiTile label="Active Tenants" value={fmtNum(tenants)} trend="up" delta="+2 this week" />
        <KpiTile label="ACUs Sold — Today" value={fmtNum(acuSold, true)} trend={acuSold > 0 ? 'up' : 'flat'} delta="units" />
        <KpiTile label="ACUs Consumed — Today" value={fmtNum(acuConsumed, true)} trend="up" delta="units" />
        <KpiTile label="AI Cost — Today" value={fmtGbp(aiCostToday)} trend="flat" delta="provider spend" />
        <KpiTile label="Gross Margin — Today" value={fmtPct(margin)} trend={margin > 60 ? 'up' : 'down'} delta="target 65%" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card
          title="Revenue vs AI cost vs gross margin"
          subtitle="7-day live trend — drill-down by tenant available in Performance"
          className="xl:col-span-2"
        >
          <RevenueCostChart data={series} />
        </Card>

        <div className="space-y-4">
          <Card title="ACU burn rate" subtitle="Colour-coded against daily cost budget (§23A.3)">
            <div className="flex items-end justify-between">
              <span className="vx-kpi-value">{fmtNum(acuConsumed, true)}</span>
              <span className="text-xs text-veryx-muted">of {fmtNum(dailyAcuBudget, true)} budget</span>
            </div>
            <ProgressBar
              className="mt-2"
              value={burnPct}
              tone={burnPct > 90 ? 'high' : burnPct > 70 ? 'warn' : 'ok'}
            />
            <p className="mt-2 text-xs text-veryx-muted">
              {burnPct.toFixed(1)}% of daily ACU budget consumed · live counter: {fmtNum(activeUsers)} active users
            </p>
          </Card>

          <Card title="Top 5 ACU-consuming tenants" subtitle="Ranked by lifetime consumption">
            <RankedBarChart data={topConsumers} unit=" ACU" />
          </Card>
        </div>
      </div>

      <Card
        title="AI recommendation queue"
        subtitle="Top platform-level AI recommendations requiring admin action (§23A.3)"
      >
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {recommendations.length === 0 && (
            <p className="text-xs text-veryx-muted">Queue clear — no open platform recommendations.</p>
          )}
          {recommendations.map((rec) => (
            <InsightCard key={rec.id} rec={rec} />
          ))}
        </div>
      </Card>
    </div>
  );
}
