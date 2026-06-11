import { db } from '@/lib/db';
import { Card, Pill } from '@/components/ui';
import { SplitDonut } from '@/components/charts';
import { EngineModeToggles } from './toggles';

export const dynamic = 'force-dynamic';

/** §23A.7 — Screen 5: AI Engine Control (model routing & cost optimisation). */
export default async function AdminAiEngine() {
  const recentExecutions = await db.agentExecution.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      agentType: true,
      modelUsed: true,
      status: true,
      durationMs: true,
      acuConsumed: true,
      createdAt: true,
    },
  });

  const split = [
    { name: 'Anthropic Claude', value: 46 },
    { name: 'OpenAI GPT-4o', value: 31 },
    { name: 'Google Gemini', value: 15 },
    { name: 'Vertex AI', value: 8 },
  ];

  const fallbackLog = [
    { at: '07:42 UTC', provider: 'OpenAI → Claude', reason: 'Rate limit (429)', resolved: '38s' },
    { at: '05:17 UTC', provider: 'Gemini → Vertex', reason: 'Timeout P99 breach', resolved: '12s' },
    { at: '01:03 UTC', provider: 'Claude → GPT-4o', reason: 'Provider 5xx', resolved: '41s' },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold text-white">AI Engine Control</h1>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Model split — live routing" subtitle="Percentage of AI calls per provider (§23A.7)">
          <SplitDonut data={split} />
        </Card>
        <Card
          title="Engine mode controls"
          subtitle="Platform-level toggles — all changes recorded to the immutable audit log"
        >
          <EngineModeToggles />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Auto-routing optimisation" subtitle="Current routing logic summary">
          <div className="flex items-center gap-2">
            <Pill tone="ok">ACTIVE</Pill>
            <span className="text-xs text-slate-300">
              Cost-weighted routing: task class → cheapest provider within latency SLA.
            </span>
          </div>
          <ul className="mt-3 space-y-1.5 text-xs text-veryx-muted">
            <li>· Strategic reasoning → Anthropic Claude (quality floor enforced)</li>
            <li>· Structured output / code → OpenAI GPT-4o</li>
            <li>· OCR & multimodal → Google Gemini</li>
            <li>· Bulk classification → Vertex AI (lowest cost tier)</li>
          </ul>
        </Card>
        <Card title="Fallback trigger log" subtitle="Last fallback events with provider, reason, resolution">
          <table className="w-full">
            <thead>
              <tr>
                <th className="vx-table-head">Time</th>
                <th className="vx-table-head">Route</th>
                <th className="vx-table-head">Reason</th>
                <th className="vx-table-head text-right">Resolved in</th>
              </tr>
            </thead>
            <tbody>
              {fallbackLog.map((f, i) => (
                <tr key={i}>
                  <td className="vx-table-cell font-mono text-veryx-muted">{f.at}</td>
                  <td className="vx-table-cell text-white">{f.provider}</td>
                  <td className="vx-table-cell text-veryx-muted">{f.reason}</td>
                  <td className="vx-table-cell text-right font-mono text-status-ok">{f.resolved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card title="Recent inference executions" subtitle="Live agent execution telemetry across all tenants">
        <table className="w-full">
          <thead>
            <tr>
              <th className="vx-table-head">Agent</th>
              <th className="vx-table-head">Model</th>
              <th className="vx-table-head">Status</th>
              <th className="vx-table-head text-right">Duration</th>
              <th className="vx-table-head text-right">ACU</th>
            </tr>
          </thead>
          <tbody>
            {recentExecutions.map((e) => (
              <tr key={e.id}>
                <td className="vx-table-cell text-white">{e.agentType.replace(/_/g, ' ')}</td>
                <td className="vx-table-cell font-mono text-xs text-veryx-muted">{e.modelUsed ?? '—'}</td>
                <td className="vx-table-cell">
                  <Pill tone={e.status === 'completed' ? 'ok' : e.status === 'failed' ? 'high' : 'info'}>
                    {e.status}
                  </Pill>
                </td>
                <td className="vx-table-cell text-right font-mono text-veryx-muted">
                  {e.durationMs ? `${e.durationMs}ms` : '—'}
                </td>
                <td className="vx-table-cell text-right font-mono text-gold-300">{e.acuConsumed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
