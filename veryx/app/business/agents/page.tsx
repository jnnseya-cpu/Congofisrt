import { requirePageSession } from '@/lib/page-auth';
import { db } from '@/lib/db';
import { AGENT_REGISTRY, agentCategories } from '@/lib/agents/registry';
import { ACU_COSTS } from '@/lib/acu';
import { Card, Pill } from '@/components/ui';
import { AgentRunner } from '@/components/client';
import { fmtNum } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/** Blueprint §6.5 — AI Agent Management: library browser + execution monitor. */
export default async function BusinessAgents() {
  const session = await requirePageSession();
  const tenantId = session.tenantId!;
  const [executions, tenant] = await Promise.all([
    db.agentExecution.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    db.tenant.findUniqueOrThrow({ where: { id: tenantId }, select: { acuBalance: true } }),
  ]);
  const categories = agentCategories();

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <h1 className="text-lg font-semibold text-white">AI Workforce — {AGENT_REGISTRY.length} Agents</h1>
        <span className="text-xs text-veryx-muted">
          ACU balance: <span className="font-mono text-gold-300">{fmtNum(tenant.acuBalance, true)}</span> ·
          executions are billed on queue
        </span>
      </div>

      <Card title="Recent executions" subtitle="Live agent telemetry for this workspace (Blueprint §6.5)">
        <table className="w-full">
          <thead>
            <tr>
              <th className="vx-table-head">Agent</th>
              <th className="vx-table-head">Trigger</th>
              <th className="vx-table-head">Status</th>
              <th className="vx-table-head text-right">ACU</th>
              <th className="vx-table-head text-right">Duration</th>
              <th className="vx-table-head text-right">When</th>
            </tr>
          </thead>
          <tbody>
            {executions.map((e) => (
              <tr key={e.id}>
                <td className="vx-table-cell text-white">{e.agentType.replace(/_/g, ' ')}</td>
                <td className="vx-table-cell text-xs text-veryx-muted">{e.triggerType}</td>
                <td className="vx-table-cell">
                  <Pill tone={e.status === 'completed' ? 'ok' : e.status === 'failed' ? 'high' : 'info'}>
                    {e.status}
                  </Pill>
                </td>
                <td className="vx-table-cell text-right font-mono text-gold-300">{e.acuConsumed}</td>
                <td className="vx-table-cell text-right font-mono text-veryx-muted">
                  {e.durationMs ? `${e.durationMs}ms` : '—'}
                </td>
                <td className="vx-table-cell text-right font-mono text-xs text-veryx-muted">
                  {e.createdAt.toISOString().slice(11, 19)}
                </td>
              </tr>
            ))}
            {executions.length === 0 && (
              <tr>
                <td className="vx-table-cell text-xs text-veryx-muted" colSpan={6}>
                  No executions yet — run any agent below.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {categories.map((cat) => (
        <section key={cat}>
          <h2 className="mb-3 text-sm font-semibold text-gold-300">{cat}</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {AGENT_REGISTRY.filter((a) => a.category === cat).map((agent) => (
              <Card key={agent.type} title={agent.name}>
                <p className="min-h-8 text-xs leading-relaxed text-slate-400">{agent.description}</p>
                <div className="mt-3">
                  <AgentRunner agentType={agent.type} acuCost={ACU_COSTS[agent.acuAction]} />
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
