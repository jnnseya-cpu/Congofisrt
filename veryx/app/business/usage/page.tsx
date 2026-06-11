import { requirePageSession } from '@/lib/page-auth';
import { db } from '@/lib/db';
import { acuConsumedSince, dayStart, monthStart } from '@/lib/queries';
import { ACU_PURCHASE_TIERS } from '@/lib/acu';
import { fmtGbp, fmtNum, fmtPct } from '@/lib/utils';
import { Card, KpiTile, ProgressBar } from '@/components/ui';
import { AcuPurchaseButton } from '@/components/client';

export const dynamic = 'force-dynamic';

/** §23B.4 — Usage Economy: enterprise AI & operational cost management. */
export default async function BusinessUsage() {
  const session = await requirePageSession();
  const tenantId = session.tenantId!;
  const [tenant, acuToday, acuMtd, opsToday, workflows] = await Promise.all([
    db.tenant.findUniqueOrThrow({ where: { id: tenantId } }),
    acuConsumedSince(dayStart(), tenantId),
    acuConsumedSince(monthStart(), tenantId),
    db.agentExecution.count({ where: { tenantId, createdAt: { gte: dayStart() } } }),
    db.workflow.findMany({ where: { tenantId } }),
  ]);

  const aiSpendMtd = acuMtd * 0.04;
  const budget = 250_000;
  const burnPerDay = Math.max(1, acuToday);
  const daysToDepletion = Math.floor(tenant.acuBalance / burnPerDay);
  const costPerOp = opsToday > 0 ? (acuToday * 0.04) / opsToday : 0;
  const efficiency =
    workflows.length > 0 ? workflows.reduce((s, w) => s + w.efficiencyScore, 0) / workflows.length : 0;

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold text-white">Usage Economy — AI Cost Governance</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-8">
        <KpiTile label="Total Operations — Today" value={fmtNum(opsToday)} trend="up" />
        <KpiTile label="AI Spend vs Budget" value={fmtGbp(aiSpendMtd, true)} delta={`/ ${fmtGbp(budget, true)}`} trend="flat" />
        <KpiTile label="Efficiency Score" value={fmtPct(efficiency, 0)} trend="up" />
        <KpiTile label="Cost Per Operation" value={`£${costPerOp.toFixed(2)}`} trend="down" delta="improving" />
        <KpiTile label="ACU Balance" value={fmtNum(tenant.acuBalance, true)} trend="flat" delta="units" />
        <KpiTile label="ACU Burn Rate" value={`${fmtNum(acuToday)}/day`} trend="up" />
        <KpiTile label="Days Until Depletion" value={`${daysToDepletion}d`} trend={daysToDepletion < 14 ? 'down' : 'flat'} />
        <KpiTile label="Budget Utilisation" value={fmtPct((aiSpendMtd / budget) * 100)} trend="flat" />
      </div>

      {/* Value generation funnel (§23B.4) */}
      <Card title="Value generation funnel" subtitle="Where AI investment converts to measurable business value">
        <div className="grid grid-cols-4 gap-3">
          {[
            { stage: 'Input', value: `${fmtNum(acuMtd, true)} ACU`, pct: 100 },
            { stage: 'Processing', value: `${fmtNum(opsToday)} ops today`, pct: 86 },
            { stage: 'Output', value: 'reports · decisions · payments', pct: 71 },
            { stage: 'Value Generated', value: fmtGbp(aiSpendMtd * 6.2, true), pct: 58 },
          ].map((s) => (
            <div key={s.stage} className="vx-card p-3 text-center">
              <div className="vx-label">{s.stage}</div>
              <div className="mt-1 font-mono text-sm text-white">{s.value}</div>
              <ProgressBar className="mt-2" value={s.pct} tone="gold" />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Budget control actions" subtitle="Spend ceilings, usage caps, cost protection, reallocation (§23B.4)">
          <div className="space-y-3 text-xs">
            {[
              ['Set Budget Limits', 'Monthly spend ceiling by department'],
              ['Apply Usage Caps', 'Restrict individual user or role ACU consumption'],
              ['Cost Protection Mode', 'Auto-throttle AI usage when budget threshold approached'],
              ['Reallocation', 'Move budget from underutilised departments to high-demand ones'],
            ].map(([label, desc]) => (
              <div key={label} className="flex items-center justify-between gap-3 border-b border-veryx-border/50 pb-2.5">
                <div>
                  <div className="font-medium text-white">{label}</div>
                  <div className="text-[11px] text-veryx-muted">{desc}</div>
                </div>
                <button className="vx-btn shrink-0">Configure</button>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Top up ACU credits" subtitle="Volume pricing — credits applied instantly to your wallet">
          <div className="space-y-2">
            {ACU_PURCHASE_TIERS.map((t) => (
              <AcuPurchaseButton key={t.units} units={t.units} priceGbp={t.priceGbp} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
