import { Card, Pill, ProgressBar } from '@/components/ui';
import { FeatureFlagToggles } from './flags';

export const dynamic = 'force-dynamic';

const API_HEALTH = [
  { name: 'BitriPay Gateway', status: 'sandbox', latency: 84, errorRate: 0.0 },
  { name: 'Stripe', status: 'up', latency: 122, errorRate: 0.1 },
  { name: 'Sumsub KYC', status: 'up', latency: 240, errorRate: 0.3 },
  { name: 'ComplyAdvantage AML', status: 'up', latency: 310, errorRate: 0.2 },
  { name: 'SendGrid', status: 'up', latency: 95, errorRate: 0.0 },
  { name: 'Twilio SMS', status: 'up', latency: 188, errorRate: 0.4 },
  { name: 'Anthropic API', status: 'up', latency: 820, errorRate: 0.6 },
  { name: 'OpenAI API', status: 'up', latency: 740, errorRate: 0.9 },
];

const DEPLOYMENTS = [
  { id: 'dpl-1042', service: 'veryx-web', strategy: 'blue-green', status: 'active', when: 'today 06:12' },
  { id: 'dpl-1041', service: 'agent-engine', strategy: 'canary 100%', status: 'active', when: 'yesterday 22:30' },
  { id: 'dpl-1040', service: 'bitripay-gateway', strategy: 'canary 50%', status: 'in_progress', when: 'yesterday 21:55' },
];

/** §23A.10 — Screen 8: System Control (flags, modules, API health, deployments). */
export default function AdminSystemControl() {
  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold text-white">System Control</h1>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          title="Feature toggle controls"
          subtitle="Enable / disable platform modules by tier or globally (§23A.10)"
        >
          <FeatureFlagToggles />
        </Card>

        <Card title="Deployment management" subtitle="Rolling 30-day success rate: 98.6% — one-click rollback for last 3 deployments">
          <div className="mb-3">
            <ProgressBar value={98.6} tone="ok" />
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className="vx-table-head">Deployment</th>
                <th className="vx-table-head">Strategy</th>
                <th className="vx-table-head">Status</th>
                <th className="vx-table-head text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {DEPLOYMENTS.map((d) => (
                <tr key={d.id}>
                  <td className="vx-table-cell">
                    <div className="font-mono text-xs text-white">{d.service}</div>
                    <div className="text-[10px] text-veryx-muted">
                      {d.id} · {d.when}
                    </div>
                  </td>
                  <td className="vx-table-cell text-xs text-veryx-muted">{d.strategy}</td>
                  <td className="vx-table-cell">
                    <Pill tone={d.status === 'active' ? 'ok' : 'warn'}>{d.status}</Pill>
                  </td>
                  <td className="vx-table-cell text-right">
                    <button className="vx-btn !px-2 !py-1">Rollback</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card title="External API health" subtitle="Status, latency and error rate per integrated provider — circuit breakers armed (Blueprint §8.7)">
        <table className="w-full">
          <thead>
            <tr>
              <th className="vx-table-head">Provider</th>
              <th className="vx-table-head">Status</th>
              <th className="vx-table-head text-right">P95 latency</th>
              <th className="vx-table-head text-right">Error rate</th>
            </tr>
          </thead>
          <tbody>
            {API_HEALTH.map((a) => (
              <tr key={a.name}>
                <td className="vx-table-cell text-white">{a.name}</td>
                <td className="vx-table-cell">
                  <Pill tone={a.status === 'up' ? 'ok' : 'gold'}>{a.status}</Pill>
                </td>
                <td className="vx-table-cell text-right font-mono text-veryx-muted">{a.latency}ms</td>
                <td className={`vx-table-cell text-right font-mono ${a.errorRate > 0.5 ? 'text-status-warn' : 'text-status-ok'}`}>
                  {a.errorRate.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
