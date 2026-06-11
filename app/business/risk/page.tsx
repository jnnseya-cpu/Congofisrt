import { requirePageSession } from '@/lib/page-auth';
import { db } from '@/lib/db';
import { Card } from '@/components/ui';
import { ThreatCard } from '@/components/cards';

export const dynamic = 'force-dynamic';

/** §23B.6 — Risk and Alerts: enterprise risk management & threat centre. */
export default async function BusinessRisk() {
  const session = await requirePageSession();
  const [threats, enterpriseRisks] = await Promise.all([
    db.threatAlert.findMany({
      where: { tenantId: session.tenantId!, scope: 'business', status: { not: 'resolved' } },
      orderBy: [{ severity: 'asc' }, { detectedAt: 'desc' }],
    }),
    db.risk.findMany({
      where: { tenantId: session.tenantId!, status: 'open' },
      orderBy: { score: 'desc' },
      take: 8,
    }),
  ]);

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold text-white">Risk & Alerts — Enterprise Threat Centre</h1>

      {threats.length === 0 ? (
        <Card title="No open alerts">
          <p className="text-xs text-veryx-muted">
            Monitoring continues across cost overrun, usage spikes, workflow inefficiency, inactive
            resources and revenue drop signals.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {threats.map((t) => (
            <ThreatCard key={t.id} threat={t} />
          ))}
        </div>
      )}

      <Card
        title="Enterprise risk register"
        subtitle="Qualitative P×I scoring with response strategies (Domain §4.5.2)"
      >
        <table className="w-full">
          <thead>
            <tr>
              <th className="vx-table-head">Risk</th>
              <th className="vx-table-head">Category</th>
              <th className="vx-table-head text-center">P</th>
              <th className="vx-table-head text-center">I</th>
              <th className="vx-table-head text-center">Score</th>
              <th className="vx-table-head">Response</th>
              <th className="vx-table-head text-right">EMV exposure</th>
            </tr>
          </thead>
          <tbody>
            {enterpriseRisks.map((r) => (
              <tr key={r.id}>
                <td className="vx-table-cell text-white">{r.title}</td>
                <td className="vx-table-cell text-xs text-veryx-muted">{r.category}</td>
                <td className="vx-table-cell text-center font-mono text-veryx-muted">{r.probability}</td>
                <td className="vx-table-cell text-center font-mono text-veryx-muted">{r.impact}</td>
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
    </div>
  );
}
