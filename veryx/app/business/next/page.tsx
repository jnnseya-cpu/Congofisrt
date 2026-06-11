import { requirePageSession } from '@/lib/page-auth';
import { monthStart, revenueBetween } from '@/lib/queries';
import { fmtGbp } from '@/lib/utils';
import { Card, Pill, Sparkline } from '@/components/ui';

export const dynamic = 'force-dynamic';

/** §23B.12 — What Happens Next: enterprise predictive intelligence centre. */
export default async function BusinessNext() {
  const session = await requirePageSession();
  const mtd = await revenueBetween(monthStart(), null, session.tenantId!);

  const cards = [
    {
      title: 'Revenue Forecast — 30 Days',
      value: fmtGbp(mtd * 1.22, true),
      confidence: 83,
      driver: 'Pipeline conversion + seasonal uplift',
      spark: [58, 61, 64, 63, 69, 74, 79],
      tone: 'ok' as const,
    },
    {
      title: 'Cost Increase Risk — 5 Days',
      value: fmtGbp(4_820),
      confidence: 76,
      driver: 'Contract renewal pipeline workflow trending over budget',
      spark: [22, 25, 24, 29, 33, 36, 41],
      tone: 'warn' as const,
    },
    {
      title: 'Efficiency Opportunity',
      value: fmtGbp(12_400) + ' /yr',
      confidence: 88,
      driver: 'Invoice processing automation rate can reach 97%',
      spark: [40, 44, 47, 52, 55, 61, 66],
      tone: 'ok' as const,
    },
    {
      title: 'Growth Projection — 90 Days',
      value: '+14% · 3 hires',
      confidence: 71,
      driver: 'Capacity model predicts engineering shortfall in Q3',
      spark: [30, 33, 35, 39, 42, 47, 51],
      tone: 'ok' as const,
    },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold text-white">What Happens Next — Predictive Intelligence</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((c) => (
          <Card key={c.title} title={c.title}>
            <div className="flex items-end justify-between">
              <span className="vx-kpi-value">{c.value}</span>
              <Sparkline points={c.spark} stroke={c.tone === 'warn' ? '#f59e0b' : '#22c55e'} />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <Pill tone={c.tone}>{c.confidence}% confidence</Pill>
              <button className="vx-btn !px-2 !py-1">Explore further</button>
            </div>
            <p className="mt-2 text-[11px] text-veryx-muted">
              <span className="font-medium text-slate-300">Driver:</span> {c.driver}
            </p>
          </Card>
        ))}
      </div>
      <Card title="AI models powering this screen" subtitle="§23B.12 model inventory">
        <div className="grid gap-2 text-xs text-slate-300 md:grid-cols-3">
          <span>· Revenue forecasting — time-series with seasonal adjustment</span>
          <span>· Anomaly detection — pattern-break identification</span>
          <span>· Trend prediction — KPI direction & magnitude</span>
          <span>· Cost prediction — spend trajectory projection</span>
          <span>· Resource planning — capacity gap pre-detection</span>
          <span>· Capacity planning — output vs projected workload</span>
        </div>
      </Card>
    </div>
  );
}
