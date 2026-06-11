import { requirePageSession } from '@/lib/page-auth';
import { db } from '@/lib/db';
import { fmtNum } from '@/lib/utils';
import { Card, KpiTile, Pill } from '@/components/ui';
import { DemoPaymentButton } from '@/components/client';

export const dynamic = 'force-dynamic';

/** Blueprint §6.6 + §7 — Payments & BitriPay merchant surface. */
export default async function BusinessPayments() {
  const session = await requirePageSession();
  const tenantId = session.tenantId!;
  const [transactions, wallets, counts] = await Promise.all([
    db.transaction.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 14,
    }),
    db.wallet.findMany({ where: { ownerId: tenantId, ownerType: 'tenant' } }),
    db.transaction.groupBy({ by: ['status'], _count: { id: true }, where: { tenantId } }),
  ]);
  const countOf = (s: string) => counts.find((c) => c.status === s)?._count.id ?? 0;

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold text-white">Payments — BitriPay & Global Rails</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile label="Successful" value={fmtNum(countOf('completed'))} trend="up" delta="transactions" />
        <KpiTile label="Pending / Processing" value={fmtNum(countOf('pending') + countOf('processing'))} trend="flat" />
        <KpiTile label="Failed" value={fmtNum(countOf('failed'))} trend="down" delta="improving" />
        <KpiTile label="Disputed" value={fmtNum(countOf('disputed'))} trend="flat" delta="fraud-held" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Multi-currency wallets" subtitle="GBP · EUR · USD · CDF (Blueprint §6.6)">
          <div className="space-y-2.5">
            {wallets.map((w) => (
              <div key={w.id} className="flex items-center justify-between border-b border-veryx-border/50 pb-2">
                <Pill tone="gold">{w.currency}</Pill>
                <div className="text-right">
                  <div className="font-mono text-sm text-white">
                    {w.balance.toLocaleString('en-GB', { maximumFractionDigits: 2 })}
                  </div>
                  {w.frozenBalance > 0 && (
                    <div className="text-[10px] text-status-warn">
                      {w.frozenBalance.toLocaleString()} frozen
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="BitriPay rails — live status"
          subtitle="M-Pesa · Airtel · Orange · Africell · CDF wallet (§7.3)"
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {[
              ['M-Pesa (Vodacom DRC)', 'up'],
              ['Airtel Money', 'up'],
              ['Orange Money', 'up'],
              ['Africell Money', 'degraded'],
              ['CDF Wallet', 'up'],
              ['Card (Stripe fallback)', 'up'],
            ].map(([rail, status]) => (
              <div key={rail} className="vx-card flex items-center justify-between p-2.5">
                <span className="text-xs text-white">{rail}</span>
                <Pill tone={status === 'up' ? 'ok' : 'warn'}>{status}</Pill>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <DemoPaymentButton channel="mpesa" amount={45000} currency="CDF" />
            <DemoPaymentButton channel="cdf_wallet" amount={120000} currency="CDF" />
            <DemoPaymentButton channel="card" amount={250} currency="GBP" />
            <DemoPaymentButton channel="orange" amount={89} currency="USD" />
          </div>
          <p className="mt-2 text-[11px] text-veryx-muted">
            Sandbox simulation — each payment is fraud-scored in real time and settles via the
            idempotent gateway service (Blueprint §7.1).
          </p>
        </Card>
      </div>

      <Card title="Transaction monitor" subtitle="All payment events with status, amount, channel and fraud score (§7.2)">
        <table className="w-full">
          <thead>
            <tr>
              <th className="vx-table-head">Reference</th>
              <th className="vx-table-head">Type</th>
              <th className="vx-table-head">Channel</th>
              <th className="vx-table-head text-right">Amount</th>
              <th className="vx-table-head">Status</th>
              <th className="vx-table-head text-right">Fraud score</th>
              <th className="vx-table-head text-right">When</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td className="vx-table-cell font-mono text-xs text-veryx-muted">{t.gatewayReference}</td>
                <td className="vx-table-cell text-xs text-white">{t.type}</td>
                <td className="vx-table-cell text-xs text-veryx-muted">{t.channel ?? '—'}</td>
                <td className="vx-table-cell text-right font-mono text-white">
                  {t.currency} {Math.abs(t.amount).toLocaleString()}
                </td>
                <td className="vx-table-cell">
                  <Pill
                    tone={
                      t.status === 'completed'
                        ? 'ok'
                        : t.status === 'failed' || t.status === 'disputed'
                          ? 'high'
                          : 'warn'
                    }
                  >
                    {t.status}
                  </Pill>
                </td>
                <td
                  className={`vx-table-cell text-right font-mono ${
                    (t.fraudScore ?? 0) > 70
                      ? 'text-status-high'
                      : (t.fraudScore ?? 0) > 40
                        ? 'text-status-warn'
                        : 'text-status-ok'
                  }`}
                >
                  {t.fraudScore ?? '—'}
                </td>
                <td className="vx-table-cell text-right font-mono text-xs text-veryx-muted">
                  {t.createdAt.toISOString().slice(5, 16).replace('T', ' ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
