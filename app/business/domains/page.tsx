import { requirePageSession } from '@/lib/page-auth';
import { db } from '@/lib/db';
import { Card, Pill } from '@/components/ui';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

/** Domain Coverage §4.1–4.10 — the ten in-scope domain clusters, live entity counts. */
export default async function BusinessDomains() {
  const session = await requirePageSession();
  const tenantId = session.tenantId!;

  const [
    portfolios,
    programmes,
    projects,
    tasks,
    resources,
    timesheets,
    risks,
    changes,
    documents,
    esg,
    assets,
    workOrders,
    vendors,
    stories,
    testCases,
  ] = await Promise.all([
    db.portfolio.count({ where: { tenantId } }),
    db.programme.count({ where: { tenantId } }),
    db.project.count({ where: { tenantId } }),
    db.task.count({ where: { projectId: { in: (await db.project.findMany({ where: { tenantId }, select: { id: true } })).map((p) => p.id) } } }),
    db.resourceProfile.count({ where: { tenantId } }),
    db.timesheet.count(),
    db.risk.count({ where: { tenantId } }),
    db.changeRequest.count(),
    db.document.count({ where: { tenantId } }),
    db.esgDataPoint.count({ where: { tenantId } }),
    db.asset.count({ where: { tenantId } }),
    db.workOrder.count(),
    db.vendor.count({ where: { tenantId } }),
    db.story.count({ where: { tenantId } }),
    db.testCase.count(),
  ]);

  const DOMAINS = [
    {
      code: '4.1',
      name: 'Governance & Control (PMO/EPM)',
      agent: 'governance_agent',
      desc: 'Portfolio prioritisation (MCDA/AHP), NPV·IRR·ROI appraisal, stage-gate governance, benefits realisation, decision registers.',
      stats: [`${portfolios} portfolios`, `${programmes} programmes`, `${projects} projects`],
    },
    {
      code: '4.2',
      name: 'Planning & Scheduling',
      agent: 'planning_agent',
      desc: 'Live Gantt with CPM/PERT engines, unlimited baselines, resource levelling, rolling-wave, Monte Carlo schedule risk.',
      stats: [`${tasks} WBS tasks`, 'CPM engine', 'P50/P80/P90'],
    },
    {
      code: '4.3',
      name: 'Cost, Commercial & Financial Control',
      agent: 'cost_finance_agent',
      desc: 'ANSI/EIA-748 EVM (PV·EV·AC·CPI·SPI·EAC·TCPI), cashflow forecasting, multi-currency, ERP/GL sync, CAPEX/OPEX.',
      stats: ['EVM live', 'Multi-currency', 'Full audit'],
    },
    {
      code: '4.4',
      name: 'Resource & Workforce Management',
      agent: 'workflow_automation_agent',
      desc: 'Skill matrices (SFIA-aligned), capacity & utilisation, AI-prefilled timesheets, certifications, visa compliance.',
      stats: [`${resources} resources`, `${timesheets} timesheets`],
    },
    {
      code: '4.5',
      name: 'Risk, Issue & Change Management',
      agent: 'risk_change_agent',
      desc: 'Qualitative + quantitative registers, EMV, Monte Carlo cost risk, RCA workflows, formal CCB change control.',
      stats: [`${risks} risks`, `${changes} change requests`],
    },
    {
      code: '4.6',
      name: 'Document & Collaboration',
      agent: 'document_agent',
      desc: 'Context-aware DMS, version control, transmittals & RFIs, AI meeting minutes, mobile offline access.',
      stats: [`${documents} documents`, 'AI classification'],
    },
    {
      code: '4.7',
      name: 'Sustainability, ESG & Environment',
      agent: 'esg_agent',
      desc: 'Scope 1/2/3 carbon accounting (GHG Protocol), TCFD·CSRD·GRI·SASB·CDP frameworks, social metrics, incidents.',
      stats: [`${esg} data points`, '7 frameworks'],
    },
    {
      code: '4.8',
      name: 'Operations & Asset Management',
      agent: 'asset_maintenance_agent',
      desc: 'Asset registers & hierarchy, preventive + predictive maintenance, work orders, lifecycle costing, SLA tracking.',
      stats: [`${assets} assets`, `${workOrders} work orders`],
    },
    {
      code: '4.9',
      name: 'Procurement & Vendor Management',
      agent: 'procurement_agent',
      desc: 'Vendor 360, AI prequalification review, RFx with sealed bids, weighted evaluation, supplier scorecards, spend analytics.',
      stats: [`${vendors} vendors`, 'AVL managed'],
    },
    {
      code: '4.10',
      name: 'Product & Delivery Management',
      agent: 'product_delivery_agent',
      desc: 'Live roadmaps, AI story writing, Scrum/Kanban boards, CI/CD integration, test management, DORA metrics.',
      stats: [`${stories} backlog items`, `${testCases} test cases`],
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-white">Domain Modules — Unified AI-OS Coverage</h1>
        <p className="mt-1 text-xs text-veryx-muted">
          Ten domain clusters operating as one OS: common data fabric, shared agent orchestration,
          single ACU billing rail (Domain Coverage mandate).
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {DOMAINS.map((d) => (
          <Card key={d.code}>
            <div className="flex items-start gap-3">
              <span className="rounded-md bg-gold-400/15 px-2 py-1 font-mono text-xs font-bold text-gold-300">
                §{d.code}
              </span>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">{d.name}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{d.desc}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  {d.stats.map((s) => (
                    <Pill key={s} tone="neutral">
                      {s}
                    </Pill>
                  ))}
                  <Link
                    href="/business/agents"
                    className="ml-auto text-[11px] text-gold-300 hover:underline"
                  >
                    {d.agent.replace(/_/g, ' ')} →
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
