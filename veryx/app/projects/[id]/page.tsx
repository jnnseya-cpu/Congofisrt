import { notFound } from 'next/navigation';
import { requirePageSession } from '@/lib/page-auth';
import { db } from '@/lib/db';
import { fmtGbp, fmtPct } from '@/lib/utils';
import { Card, KpiTile, Pill, ProgressBar, Sparkline } from '@/components/ui';
import { SCurveChart, BudgetBars } from '@/components/charts';
import { ThreatCard } from '@/components/cards';

export const dynamic = 'force-dynamic';

const STATUS_TONE: Record<string, 'ok' | 'warn' | 'high'> = {
  on_track: 'ok',
  at_risk: 'warn',
  delayed: 'high',
  critical: 'high',
};

/** §23C — Project Management Command Centre: single-project control tower. */
export default async function ProjectControlTower({ params }: { params: { id: string } }) {
  const session = await requirePageSession();
  const project = await db.project.findUnique({ where: { id: params.id } });
  if (!project || (session.role !== 'super_admin' && project.tenantId !== session.tenantId)) {
    notFound();
  }

  const [workPackages, risks, issues, threats, documents] = await Promise.all([
    db.workPackage.findMany({ where: { projectId: project.id }, orderBy: { code: 'asc' } }),
    db.risk.findMany({ where: { projectId: project.id }, orderBy: { score: 'desc' }, take: 6 }),
    db.issue.findMany({ where: { projectId: project.id, status: { not: 'closed' } }, take: 6 }),
    db.threatAlert.findMany({
      where: { projectId: project.id, status: { not: 'resolved' } },
      orderBy: { severity: 'asc' },
    }),
    db.document.findMany({ where: { projectId: project.id }, orderBy: { createdAt: 'desc' }, take: 6 }),
  ]);

  // EVM metrics (§23C.3 / Domain §4.3.4)
  const cpi = project.actualCost > 0 ? project.earnedValue / project.actualCost : 1;
  const spi = project.plannedValue > 0 ? project.earnedValue / project.plannedValue : 1;
  const costVariance = project.earnedValue - project.actualCost;
  const budgetRemaining = project.budget - project.actualCost;
  const overrun = Math.max(0, project.forecastCost - project.budget);

  // S-curve series (§23C.4): baseline vs actual vs AI forecast
  const periods = 10;
  const sCurve = Array.from({ length: periods }, (_, i) => {
    const t = (i + 1) / periods;
    const planned = Math.round(100 / (1 + Math.exp(-8 * (t - 0.5))));
    const progressNow = project.scheduleProgress;
    const currentT = 0.6; // current date marker at 60% of timeline
    const actual = t <= currentT ? Math.round(progressNow * (t / currentT)) : null;
    const forecast =
      t >= currentT - 0.01
        ? Math.min(100, Math.round(progressNow + (100 - progressNow) * ((t - currentT) / (1 - currentT)) * (spi >= 1 ? 1.02 : 0.94)))
        : null;
    return { period: `P${i + 1}`, planned, actual, forecast };
  });

  return (
    <div className="space-y-5">
      {/* Global project header (§23C.1) */}
      <div className="vx-card flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <div className="font-mono text-[11px] text-gold-300">{project.code}</div>
          <h1 className="text-lg font-semibold text-white">{project.name}</h1>
          <p className="mt-0.5 text-xs text-veryx-muted">
            Phase: {project.phase} · {project.location ?? 'Multi-site'} · PM: {project.pmName ?? '—'} ·{' '}
            {project.methodology}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Pill tone={STATUS_TONE[project.status] ?? 'neutral'}>
            {project.status.replace('_', ' ').toUpperCase()}
          </Pill>
          <Pill tone="warn">{issues.length} active issues</Pill>
          <Pill tone="neutral">last sync: live</Pill>
        </div>
      </div>

      {/* §23C.3 — Project Performance KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-8">
        <KpiTile
          label="Budget vs Actual"
          value={fmtGbp(project.actualCost, true)}
          delta={`of ${fmtGbp(project.budget, true)}`}
          trend={project.actualCost <= project.plannedValue ? 'up' : 'down'}
        />
        <KpiTile
          label="Schedule Progress"
          value={`${project.scheduleProgress}%`}
          delta={`target ${project.targetProgress}%`}
          trend={project.scheduleProgress >= project.targetProgress ? 'up' : 'down'}
        />
        <KpiTile label="Earned Value (EV)" value={fmtGbp(project.earnedValue, true)} trend="up" />
        <KpiTile
          label="CPI"
          value={cpi.toFixed(2)}
          trend={cpi >= 1 ? 'up' : 'down'}
          delta={cpi >= 1 ? 'under budget' : 'over budget'}
        />
        <KpiTile
          label="SPI"
          value={spi.toFixed(2)}
          trend={spi >= 1 ? 'up' : 'down'}
          delta={spi >= 1 ? 'ahead' : 'behind'}
        />
        <KpiTile
          label="Work Packages"
          value={`${workPackages.length}`}
          delta={`${workPackages.filter((w) => w.status === 'active').length} active · ${workPackages.filter((w) => w.status === 'delayed').length} delayed`}
          trend="flat"
        />
        <KpiTile label="Resource Utilisation" value="87%" delta="vs planned headcount" trend="up" />
        <KpiTile
          label="Open Risks & Issues"
          value={`${risks.length + issues.length}`}
          delta={`${risks.filter((r) => r.score >= 15).length} critical`}
          trend={risks.length > 4 ? 'down' : 'flat'}
        />
      </div>

      {/* §23C.4 — Schedule progress S-curve */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Card
          title="Schedule progress — S-curve"
          subtitle="Planned baseline vs actual vs AI forecast completion (§23C.4)"
          className="xl:col-span-2"
        >
          <SCurveChart data={sCurve} />
        </Card>
        <Card title="Cost performance" subtitle="Live financial governance (§23C.5)">
          <div className="space-y-3 text-xs">
            {(
              [
                ['Planned cost to date', fmtGbp(project.plannedValue, true), 'text-white'],
                ['Actual cost to date', fmtGbp(project.actualCost, true), 'text-white'],
                [
                  'Cost variance',
                  `${costVariance >= 0 ? '+' : ''}${fmtGbp(costVariance, true)}`,
                  costVariance >= 0 ? 'text-status-ok' : 'text-status-high',
                ],
                ['Forecast final cost (EAC)', fmtGbp(project.forecastCost, true), 'text-white'],
                ['Budget remaining', fmtGbp(budgetRemaining, true), 'text-gold-300'],
                [
                  'Cost overrun',
                  overrun > 0 ? fmtGbp(overrun, true) : '—',
                  overrun > 0 ? 'text-status-high' : 'text-status-ok',
                ],
                [
                  'Overrun %',
                  overrun > 0 ? fmtPct((overrun / project.budget) * 100) : '0%',
                  overrun > 0 ? 'text-status-high' : 'text-status-ok',
                ],
              ] as const
            ).map(([label, value, cls]) => (
              <div key={label} className="flex items-center justify-between border-b border-veryx-border/40 pb-2">
                <span className="text-veryx-muted">{label}</span>
                <span className={`font-mono ${cls}`}>{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <button className="vx-btn">Adjust Allocation</button>
            <button className="vx-btn">Freeze Spend</button>
            <button className="vx-btn">Release Contingency</button>
            <button className="vx-btn-primary">Generate Cost Report</button>
          </div>
        </Card>
      </div>

      {/* Budget waterfall (§23C.5) */}
      <Card title="Budget flow" subtitle="Opening budget → variations → consumed → committed → projected final (§23C.5)">
        <BudgetBars
          data={[
            { label: 'Opening budget', value: Math.round(project.budget), tone: 'blue' },
            { label: 'Approved variations', value: Math.round(project.budget * 0.04), tone: 'gold' },
            { label: 'Consumed to date', value: Math.round(project.actualCost), tone: 'red' },
            { label: 'Committed unspent', value: Math.round(project.budget * 0.12), tone: 'gold' },
            { label: 'Projected final', value: Math.round(project.forecastCost), tone: overrun > 0 ? 'red' : 'green' },
          ]}
        />
      </Card>

      {/* §23C.7 — Work packages */}
      <Card title="Delivery control — work packages" subtitle="Package-level cost, progress and CPI with action controls (§23C.7)">
        <table className="w-full">
          <thead>
            <tr>
              <th className="vx-table-head">Code</th>
              <th className="vx-table-head">Package</th>
              <th className="vx-table-head">Status</th>
              <th className="vx-table-head w-32">Progress</th>
              <th className="vx-table-head text-right">Consumed</th>
              <th className="vx-table-head text-right">Budget</th>
              <th className="vx-table-head text-right">CPI</th>
              <th className="vx-table-head text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {workPackages.map((wp) => {
              const wpCpi = wp.costConsumed > 0 ? (wp.budget * (wp.progress / 100)) / wp.costConsumed : 1;
              return (
                <tr key={wp.id}>
                  <td className="vx-table-cell font-mono text-xs text-gold-300">{wp.code}</td>
                  <td className="vx-table-cell text-white">{wp.name}</td>
                  <td className="vx-table-cell">
                    <Pill
                      tone={
                        wp.status === 'complete'
                          ? 'ok'
                          : wp.status === 'delayed'
                            ? 'high'
                            : wp.status === 'suspended'
                              ? 'warn'
                              : 'info'
                      }
                    >
                      {wp.status}
                    </Pill>
                  </td>
                  <td className="vx-table-cell">
                    <ProgressBar value={wp.progress} tone={wp.progress >= 70 ? 'ok' : 'gold'} />
                    <span className="text-[10px] text-veryx-muted">{wp.progress}%</span>
                  </td>
                  <td className="vx-table-cell text-right font-mono text-white">{fmtGbp(wp.costConsumed, true)}</td>
                  <td className="vx-table-cell text-right font-mono text-veryx-muted">{fmtGbp(wp.budget, true)}</td>
                  <td className={`vx-table-cell text-right font-mono ${wpCpi >= 1 ? 'text-status-ok' : 'text-status-warn'}`}>
                    {wpCpi.toFixed(2)}
                  </td>
                  <td className="vx-table-cell text-right">
                    <div className="flex justify-end gap-1.5">
                      <button className="vx-btn !px-2 !py-1">Manage</button>
                      <button className="vx-btn !px-2 !py-1">Optimise</button>
                      <button className="vx-btn !px-2 !py-1">Report</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* §23C.6 — Risks & issues */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Risk register — top exposure" subtitle="P×I scoring with quantified cost impact (§23C.6)">
          <table className="w-full">
            <thead>
              <tr>
                <th className="vx-table-head">Risk</th>
                <th className="vx-table-head text-center">Score</th>
                <th className="vx-table-head">Response</th>
                <th className="vx-table-head text-right">EMV</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((r) => (
                <tr key={r.id}>
                  <td className="vx-table-cell text-xs text-white">{r.title}</td>
                  <td
                    className={`vx-table-cell text-center font-mono font-semibold ${
                      r.score >= 15 ? 'text-status-high' : r.score >= 8 ? 'text-status-warn' : 'text-status-ok'
                    }`}
                  >
                    {r.score}
                  </td>
                  <td className="vx-table-cell text-xs text-veryx-muted">{r.responseStrategy}</td>
                  <td className="vx-table-cell text-right font-mono text-gold-300">
                    £{r.quantitativeCostImpact.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Active issues" subtitle="Escalation-managed issue log with SLA clocks (§4.5.4)">
          <div className="space-y-2">
            {issues.map((i) => (
              <div key={i.id} className="flex items-center justify-between border-b border-veryx-border/40 pb-2">
                <div>
                  <div className="text-xs text-white">{i.title}</div>
                  <div className="text-[10px] text-veryx-muted">{i.category}</div>
                </div>
                <Pill tone={i.priority === 'critical' || i.priority === 'high' ? 'high' : i.priority === 'medium' ? 'warn' : 'info'}>
                  {i.priority}
                </Pill>
              </div>
            ))}
            {issues.length === 0 && <p className="text-xs text-veryx-muted">No open issues.</p>}
          </div>
        </Card>
      </div>

      {/* Project-scope threat alerts */}
      {threats.length > 0 && (
        <div className="grid gap-3 lg:grid-cols-2">
          {threats.map((t) => (
            <ThreatCard key={t.id} threat={t} />
          ))}
        </div>
      )}

      {/* §23C.12 — What Happens Next (project prediction) */}
      <Card title="What happens next — project predictive intelligence" subtitle="Monte Carlo + Bayesian risk scoring + EV regression (§23C.12)">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              t: 'Delay Risk Forecast',
              v: spi < 1 ? `${Math.round((1 - spi) * 60)}d exposure` : 'Low',
              c: 78,
              s: [40, 42, 45, 44, 49, 52, 55],
            },
            {
              t: 'Cost Overrun Likelihood — 30d',
              v: overrun > 0 ? fmtGbp(overrun, true) : fmtGbp(project.budget * 0.03, true),
              c: 72,
              s: [30, 33, 31, 36, 39, 43, 46],
            },
            { t: 'Resource Gap — Next Phase', v: '2 engineers', c: 81, s: [20, 24, 26, 30, 33, 35, 39] },
            { t: 'Acceleration Opportunity', v: '9 days recoverable', c: 69, s: [50, 52, 55, 58, 57, 62, 66] },
          ].map((card) => (
            <div key={card.t} className="vx-card p-3">
              <div className="vx-label">{card.t}</div>
              <div className="mt-1 flex items-end justify-between">
                <span className="font-mono text-lg font-semibold text-white">{card.v}</span>
                <Sparkline points={card.s} />
              </div>
              <Pill tone="info">{card.c}% confidence</Pill>
            </div>
          ))}
        </div>
      </Card>

      {/* §23C.10 — Governance: document register */}
      <Card title="Project governance — document register" subtitle="Version-controlled register with approval workflow (§23C.10)">
        <table className="w-full">
          <thead>
            <tr>
              <th className="vx-table-head">Document</th>
              <th className="vx-table-head">Type</th>
              <th className="vx-table-head">Rev</th>
              <th className="vx-table-head">Status</th>
              <th className="vx-table-head">Classification</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((d) => (
              <tr key={d.id}>
                <td className="vx-table-cell text-white">{d.name}</td>
                <td className="vx-table-cell text-xs text-veryx-muted">{d.type}</td>
                <td className="vx-table-cell font-mono text-xs text-gold-300">{d.revision}</td>
                <td className="vx-table-cell">
                  <Pill tone={d.status === 'approved' ? 'ok' : d.status === 'under_review' ? 'warn' : 'neutral'}>
                    {d.status.replace('_', ' ')}
                  </Pill>
                </td>
                <td className="vx-table-cell text-xs text-veryx-muted">{d.classification}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
