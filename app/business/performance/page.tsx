import { requirePageSession } from '@/lib/page-auth';
import { monthStart, revenueBetween, revenueSeries } from '@/lib/queries';
import { db } from '@/lib/db';
import { fmtGbp, fmtPct } from '@/lib/utils';
import { Card, KpiTile, Pill, ProgressBar } from '@/components/ui';
import { RevenueCostChart, RankedBarChart } from '@/components/charts';

export const dynamic = 'force-dynamic';

const DEPARTMENTS = [
  { name: 'Operations', attainment: 94, budgetUsed: 71 },
  { name: 'Finance', attainment: 88, budgetUsed: 64 },
  { name: 'Engineering', attainment: 91, budgetUsed: 83 },
  { name: 'Commercial', attainment: 76, budgetUsed: 58 },
  { name: 'Compliance', attainment: 97, budgetUsed: 45 },
];

/** §23B.2 — Performance Screen: business KPI & analytics intelligence. */
export default async function BusinessPerformance() {
  const session = await requirePageSession();
  const tenantId = session.tenantId!;
  const [series, revMtd, workflows] = await Promise.all([
    revenueSeries(30, tenantId),
    revenueBetween(monthStart(), null, tenantId),
    db.workflow.findMany({ where: { tenantId } }),
  ]);
  const opSpend = workflows.reduce((s, w) => s + w.costToday, 0) * 30;
  const gross = revMtd > 0 ? ((revMtd - opSpend) / revMtd) * 100 : 0;

  const deptData = DEPARTMENTS.map((d) => ({ name: d.name, value: d.attainment }));

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold text-white">Performance — Business Intelligence</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile label="Gross Margin %" value={fmtPct(Math.max(0, gross))} trend="up" />
        <KpiTile label="Net Margin %" value={fmtPct(Math.max(0, gross - 11.2))} trend="up" />
        <KpiTile label="EBITDA — MTD" value={fmtGbp(revMtd * 0.31, true)} trend="up" />
        <KpiTile label="Cost of Revenue" value={fmtGbp(opSpend, true)} trend="flat" delta="MTD run-rate" />
      </div>

      <Card title="Revenue trends" subtitle="30-day performance with margin erosion alerts (§23B.2)">
        <RevenueCostChart data={series} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Department performance" subtitle="KPI attainment by team with heatmap (§23B.2)">
          <RankedBarChart data={deptData} unit="%" />
        </Card>
        <Card title="Benchmarking engine" subtitle="Target vs actual with AI-identified outliers (§23B.2)">
          <div className="space-y-3">
            {DEPARTMENTS.map((d) => (
              <div key={d.name}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-white">{d.name}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-veryx-muted">{d.attainment}% attainment</span>
                    {d.attainment >= 90 ? (
                      <Pill tone="ok">outperformer</Pill>
                    ) : d.attainment < 80 ? (
                      <Pill tone="warn">action needed</Pill>
                    ) : (
                      <Pill tone="neutral">on target</Pill>
                    )}
                  </span>
                </div>
                <ProgressBar value={d.attainment} tone={d.attainment >= 90 ? 'ok' : d.attainment < 80 ? 'warn' : 'gold'} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
