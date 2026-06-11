import { db } from '@/lib/db';
import {
  acuConsumedSince,
  dayStart,
  monthStart,
  revenueBetween,
  revenueSeries,
} from '@/lib/queries';
import { fmtGbp, fmtNum, fmtPct } from '@/lib/utils';
import { Card, KpiTile } from '@/components/ui';
import { RevenueCostChart, RankedBarChart } from '@/components/charts';

export const dynamic = 'force-dynamic';

const PROVIDERS = [
  { provider: 'Anthropic Claude', costPer1k: 14.2, share: 46 },
  { provider: 'OpenAI GPT-4o', costPer1k: 11.8, share: 31 },
  { provider: 'Google Gemini', costPer1k: 8.4, share: 15 },
  { provider: 'Vertex AI', costPer1k: 6.9, share: 8 },
];

/** §23A.5 — Screen 3: System Performance (financial & usage analytics). */
export default async function AdminPerformance() {
  const [revToday, revMtd, revLifetime, acuToday, acuMtd, acuAll, series, tierGroups] =
    await Promise.all([
      revenueBetween(dayStart(), null),
      revenueBetween(monthStart(), null),
      revenueBetween(new Date(0), null),
      acuConsumedSince(dayStart()),
      acuConsumedSince(monthStart()),
      acuConsumedSince(new Date(0)),
      revenueSeries(30),
      db.tenant.groupBy({ by: ['tier'], _count: { id: true } }),
    ]);

  const aiCostToday = acuToday * 0.011;
  const aiCostMtd = acuMtd * 0.011;
  const marginPct = revMtd > 0 ? ((revMtd - aiCostMtd) / revMtd) * 100 : 0;
  const revenuePerAcu = acuAll > 0 ? revLifetime / acuAll : 0;

  // §23A.5 — revenue by subscription tier (Solo→Sovereign naming per spec).
  const tierLabel: Record<string, string> = {
    starter: 'Solo',
    growth: 'Team',
    pro: 'Business',
    enterprise: 'Enterprise',
    sovereign: 'Sovereign',
  };
  const tierData = tierGroups.map((g) => ({
    name: tierLabel[g.tier] ?? g.tier,
    value: g._count.id,
  }));

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold text-white">System Performance (Live)</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-8">
        <KpiTile label="Revenue — Today" value={fmtGbp(revToday, true)} trend="up" delta="live" />
        <KpiTile label="MTD Revenue" value={fmtGbp(revMtd, true)} trend="up" />
        <KpiTile label="Lifetime Revenue" value={fmtGbp(revLifetime, true)} trend="up" />
        <KpiTile label="Gross Margin %" value={fmtPct(marginPct)} trend={marginPct > 60 ? 'up' : 'down'} />
        <KpiTile label="AI Cost — Today" value={fmtGbp(aiCostToday)} trend="flat" />
        <KpiTile label="AI Cost — MTD" value={fmtGbp(aiCostMtd)} trend="flat" />
        <KpiTile label="ACUs Consumed — Total" value={fmtNum(acuAll, true)} trend="up" />
        <KpiTile label="Revenue per ACU" value={`£${revenuePerAcu.toFixed(3)}`} trend="up" />
      </div>

      <Card title="Revenue vs AI cost vs margin" subtitle="30-day stacked trend with period selector">
        <RevenueCostChart data={series} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Tenants by subscription tier" subtitle="Solo · Team · Business · Enterprise · Sovereign">
          <RankedBarChart data={tierData} unit=" tenants" />
        </Card>
        <Card title="Provider cost breakdown" subtitle="Cost per 1,000 actions by AI provider (§23A.5)">
          <table className="w-full">
            <thead>
              <tr>
                <th className="vx-table-head">Provider</th>
                <th className="vx-table-head">Routing share</th>
                <th className="vx-table-head text-right">Cost / 1k actions</th>
              </tr>
            </thead>
            <tbody>
              {PROVIDERS.map((p) => (
                <tr key={p.provider}>
                  <td className="vx-table-cell text-white">{p.provider}</td>
                  <td className="vx-table-cell text-veryx-muted">{p.share}%</td>
                  <td className="vx-table-cell text-right font-mono text-gold-300">
                    £{p.costPer1k.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
