import { requirePageSession } from '@/lib/page-auth';
import { Card, Pill } from '@/components/ui';
import { FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

const CATEGORIES = [
  ['Executive Reports', 'Board-ready summaries: revenue, margin, strategic risk', 'PDF · scheduled'],
  ['Financial Reports', 'P&L, cash flow, budget vs actual, cost analysis', 'PDF · Excel'],
  ['Operational Reports', 'Workflow performance, SLA adherence, team output', 'Excel · API'],
  ['Compliance Reports', 'Audit completeness, policy adherence, regulatory evidence', 'PDF · signed'],
  ['Audit Reports', 'Full event-chain exports with court-grade integrity hash', 'PDF · CSV'],
  ['Usage Reports', 'ACU consumption, cost efficiency, automation rate by team', 'Excel · scheduled'],
] as const;

/** §23B.8 — Reports Screen: BI and report generation centre. */
export default async function BusinessReports() {
  await requirePageSession();
  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold text-white">Reports — Business Intelligence Centre</h1>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CATEGORIES.map(([title, desc, formats]) => (
          <Card key={title}>
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 shrink-0 text-gold-300" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                <p className="mt-1 text-xs text-slate-400">{desc}</p>
                <div className="mt-2.5 flex items-center justify-between">
                  <Pill tone="neutral">{formats}</Pill>
                  <div className="flex gap-1.5">
                    <button className="vx-btn !px-2 !py-1">Schedule</button>
                    <button className="vx-btn-primary !px-2 !py-1">Generate</button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Card title="Report features" subtitle="Export, scheduling and delivery capabilities (§23B.8)">
        <ul className="grid gap-2 text-xs text-slate-300 md:grid-cols-2">
          <li>· PDF export with VERYX watermark and document integrity hash</li>
          <li>· Excel export with configurable column selection</li>
          <li>· Scheduled delivery by recipient, format and frequency</li>
          <li>· Optional password protection for sensitive reports</li>
          <li>· Dashboard snapshot — freeze current state as shareable report</li>
          <li>· AI-generated narrative commentary on every chart</li>
        </ul>
      </Card>
    </div>
  );
}
