import { requirePageSession } from '@/lib/page-auth';
import { db } from '@/lib/db';
import { fmtGbp } from '@/lib/utils';
import { Card, Pill, ProgressBar } from '@/components/ui';
import { ActionButton } from '@/components/client';

export const dynamic = 'force-dynamic';

const MODE_LABEL: Record<string, string> = {
  auto: 'Running — Auto',
  manual_step: 'Running — Manual Step',
  scheduled: 'Running — Scheduled',
  ai_assisted: 'Running — AI-Assisted',
};

/** §23B.3 — Operations Screen: workflow monitoring & execution intelligence. */
export default async function BusinessOperations() {
  const session = await requirePageSession();
  const workflows = await db.workflow.findMany({
    where: { tenantId: session.tenantId! },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <h1 className="text-lg font-semibold text-white">Operations — Workflow Command</h1>
        <span className="text-xs text-veryx-muted">
          {workflows.filter((w) => w.status === 'running').length} running ·{' '}
          {workflows.filter((w) => w.status === 'paused').length} paused
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {workflows.map((w) => {
          const statusLabel =
            w.status === 'running'
              ? MODE_LABEL[w.mode] ?? 'Running'
              : w.status === 'paused'
                ? 'Paused — Review'
                : 'Delayed — Action Required';
          const slaTone = w.slaStatus === 'on_track' ? 'ok' : w.slaStatus === 'at_risk' ? 'warn' : 'high';
          return (
            <Card key={w.id} title={w.name} subtitle={statusLabel}>
              {/* Per-workflow inline metrics (§23B.3) */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="vx-label">Cost Today</div>
                  <div className="font-mono text-sm text-white">{fmtGbp(w.costToday)}</div>
                </div>
                <div>
                  <div className="vx-label">Efficiency</div>
                  <div className="font-mono text-sm text-white">{w.efficiencyScore}%</div>
                </div>
                <div>
                  <div className="vx-label">Time Saved</div>
                  <div className="font-mono text-sm text-white">{w.timeSavedHours.toFixed(0)}h</div>
                </div>
                <div>
                  <div className="vx-label">SLA Status</div>
                  <Pill tone={slaTone}>{w.slaStatus.replace('_', ' ')}</Pill>
                </div>
                <div>
                  <div className="vx-label">Automation</div>
                  <div className="font-mono text-sm text-gold-300">{w.automationRate}%</div>
                </div>
                <div>
                  <div className="vx-label">Error Rate</div>
                  <div className={`font-mono text-sm ${w.errorRate > 2 ? 'text-status-warn' : 'text-status-ok'}`}>
                    {w.errorRate.toFixed(1)}%
                  </div>
                </div>
              </div>
              <ProgressBar className="mt-3" value={w.automationRate} tone="gold" />
              {/* Action controls per workflow card (§23B.3) */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {w.status === 'running' ? (
                  <ActionButton label="Pause" href={`/api/v1/workflows/${w.id}`} body={{ action: 'pause' }} />
                ) : (
                  <ActionButton label="Resume" href={`/api/v1/workflows/${w.id}`} body={{ action: 'resume' }} variant="primary" />
                )}
                <ActionButton label="Optimise (AI)" href={`/api/v1/workflows/${w.id}`} body={{ action: 'optimise' }} doneLabel="Optimised ✓" />
                <ActionButton label="Scale" href={`/api/v1/workflows/${w.id}`} body={{ action: 'scale' }} />
                <button className="vx-btn">View Audit Trail</button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
