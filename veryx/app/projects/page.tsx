import Link from 'next/link';
import { requirePageSession } from '@/lib/page-auth';
import { db } from '@/lib/db';
import { fmtGbp } from '@/lib/utils';
import { Card, Pill, ProgressBar } from '@/components/ui';

export const dynamic = 'force-dynamic';

const STATUS_TONE: Record<string, 'ok' | 'warn' | 'high'> = {
  on_track: 'ok',
  at_risk: 'warn',
  delayed: 'high',
  critical: 'high',
};

/** §23C — project selector: one control tower per live project. */
export default async function ProjectsIndex() {
  const session = await requirePageSession();
  const projects = await db.project.findMany({
    where: { tenantId: session.tenantId! },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-white">Project Portfolio</h1>
        <p className="mt-1 text-xs text-veryx-muted">
          Select a project to open its single-project control tower (§23C) — governance, cost,
          risk, schedule and resource intelligence.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {projects.map((p) => {
          const cpi = p.actualCost > 0 ? p.earnedValue / p.actualCost : 1;
          return (
            <Link key={p.id} href={`/projects/${p.id}`}>
              <Card className="transition hover:shadow-glow">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono text-[11px] text-gold-300">{p.code}</div>
                    <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                    <p className="mt-0.5 text-[11px] text-veryx-muted">
                      {p.phase} · {p.location ?? '—'} · PM: {p.pmName ?? '—'}
                    </p>
                  </div>
                  <Pill tone={STATUS_TONE[p.status] ?? 'neutral'}>{p.status.replace('_', ' ')}</Pill>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="vx-label">Budget</div>
                    <div className="font-mono text-white">{fmtGbp(p.budget, true)}</div>
                  </div>
                  <div>
                    <div className="vx-label">CPI</div>
                    <div className={`font-mono ${cpi >= 1 ? 'text-status-ok' : cpi >= 0.9 ? 'text-status-warn' : 'text-status-high'}`}>
                      {cpi.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="vx-label">Progress</div>
                    <div className="font-mono text-white">{p.scheduleProgress}%</div>
                  </div>
                </div>
                <ProgressBar
                  className="mt-2"
                  value={p.scheduleProgress}
                  tone={p.healthRag === 'green' ? 'ok' : p.healthRag === 'amber' ? 'warn' : 'high'}
                />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
