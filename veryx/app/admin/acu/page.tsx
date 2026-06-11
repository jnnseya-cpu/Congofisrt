import { acuEconomyStats, ACU_PURCHASE_TIERS } from '@/lib/acu';
import { acuConsumedSince, acuPurchasedSince, monthStart } from '@/lib/queries';
import { db } from '@/lib/db';
import { fmtGbp, fmtNum, fmtPct } from '@/lib/utils';
import { Card, KpiTile } from '@/components/ui';

export const dynamic = 'force-dynamic';

/** §23A.8 — Screen 6: ACU Economy (credit economy & margin control). */
export default async function AdminAcuEconomy() {
  const [economy, soldMtd, consumedMtd, ledger] = await Promise.all([
    acuEconomyStats(),
    acuPurchasedSince(monthStart()),
    acuConsumedSince(monthStart()),
    db.acuLedgerEntry.findMany({ orderBy: { createdAt: 'desc' }, take: 12 }),
  ]);
  const marginMtd = soldMtd * 0.04 - consumedMtd * 0.011;

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold text-white">ACU Economy — Credit & Margin Control</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-8">
        <KpiTile label="Purchased ACUs — All Time" value={fmtNum(economy.purchasedAllTime, true)} trend="up" />
        <KpiTile label="Consumed ACUs — All Time" value={fmtNum(economy.consumedAllTime, true)} trend="up" />
        <KpiTile label="ACUs Remaining — Pool" value={fmtNum(economy.remainingPool, true)} trend="flat" />
        <KpiTile label="Profit from ACU Sales" value={fmtGbp(economy.profitGbp, true)} trend="up" />
        <KpiTile label="ACUs Sold — MTD" value={fmtNum(soldMtd, true)} trend="up" />
        <KpiTile label="ACUs Consumed — MTD" value={fmtNum(consumedMtd, true)} trend="up" />
        <KpiTile label="Margin — MTD" value={fmtGbp(marginMtd, true)} trend={marginMtd > 0 ? 'up' : 'down'} delta={fmtPct(economy.marginPct)} />
        <KpiTile label="Pricing Multiplier" value="×1.00" trend="flat" delta="baseline" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          title="Pricing governance"
          subtitle="Control actions — every change writes before/after values to the audit log (§23A.12)"
        >
          <div className="space-y-3 text-xs">
            {[
              ['Pricing multiplier adjustment', 'Change the VERYX-to-ACU price ratio with full audit trail'],
              ['Consumption cap per role', 'Maximum daily ACU consumption by user role across all tenants'],
              ['Emergency shutdown control', 'Suspend all ACU-billed operations immediately'],
              ['Free trial ACU allocation', 'Configure trial limits by plan tier'],
              ['Volume incentive configuration', 'Tier-based discount thresholds within safe margin boundaries'],
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

        <Card title="ACU purchase tiers" subtitle="Volume pricing ladder (Blueprint §12.2)">
          <table className="w-full">
            <thead>
              <tr>
                <th className="vx-table-head">Units</th>
                <th className="vx-table-head text-right">Price</th>
                <th className="vx-table-head text-right">Per ACU</th>
                <th className="vx-table-head text-right">Discount</th>
              </tr>
            </thead>
            <tbody>
              {ACU_PURCHASE_TIERS.map((t, i) => (
                <tr key={t.units}>
                  <td className="vx-table-cell font-mono text-white">{fmtNum(t.units)}</td>
                  <td className="vx-table-cell text-right font-mono text-gold-300">£{fmtNum(t.priceGbp)}</td>
                  <td className="vx-table-cell text-right font-mono text-veryx-muted">£{t.perUnit.toFixed(3)}</td>
                  <td className="vx-table-cell text-right text-status-ok">{i === 0 ? '—' : `${i * 10 + 10}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card title="Recent ledger activity" subtitle="Platform-wide ACU ledger — every credit and consumption entry">
        <table className="w-full">
          <thead>
            <tr>
              <th className="vx-table-head">When</th>
              <th className="vx-table-head">Reason</th>
              <th className="vx-table-head text-right">Delta</th>
              <th className="vx-table-head text-right">Balance after</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((l) => (
              <tr key={l.id}>
                <td className="vx-table-cell font-mono text-xs text-veryx-muted">
                  {l.createdAt.toISOString().slice(0, 16).replace('T', ' ')}
                </td>
                <td className="vx-table-cell text-white">{l.reason}</td>
                <td className={`vx-table-cell text-right font-mono ${l.delta > 0 ? 'text-status-ok' : 'text-status-high'}`}>
                  {l.delta > 0 ? '+' : ''}
                  {fmtNum(l.delta)}
                </td>
                <td className="vx-table-cell text-right font-mono text-veryx-muted">{fmtNum(l.balanceAfter)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
