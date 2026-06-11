import { requirePageSession } from '@/lib/page-auth';
import { db } from '@/lib/db';
import { Card, Pill } from '@/components/ui';

export const dynamic = 'force-dynamic';

/** §23B.5 — Team and Access: identity, workforce governance, access control. */
export default async function BusinessTeam() {
  const session = await requirePageSession();
  const users = await db.user.findMany({
    where: { tenantId: session.tenantId!, deletedAt: null },
    orderBy: { createdAt: 'asc' },
  });

  const activityOf = (i: number) => (['High', 'Medium', 'High', 'Idle', 'Medium'] as const)[i % 5];
  const riskOf = (i: number) => (['None', 'None', 'None', 'Flagged', 'None'] as const)[i % 5];

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <h1 className="text-lg font-semibold text-white">Team & Access — Identity Governance</h1>
        <button className="vx-btn-primary">Create User</button>
      </div>

      <Card
        title="User directory"
        subtitle="Named identity RBAC — suspend, role and permission management with audit history (§23B.5)"
      >
        <table className="w-full">
          <thead>
            <tr>
              <th className="vx-table-head">Identity</th>
              <th className="vx-table-head">Role</th>
              <th className="vx-table-head">Activity</th>
              <th className="vx-table-head">Risk signal</th>
              <th className="vx-table-head">MFA</th>
              <th className="vx-table-head">Status</th>
              <th className="vx-table-head text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const activity = activityOf(i);
              const risk = riskOf(i);
              return (
                <tr key={u.id}>
                  <td className="vx-table-cell">
                    <div className="font-medium text-white">
                      {u.firstName} {u.lastName}
                    </div>
                    <div className="text-[11px] text-veryx-muted">
                      {u.email}
                      {u.department ? ` · ${u.department}` : ''}
                    </div>
                  </td>
                  <td className="vx-table-cell">
                    <Pill tone="gold">{u.role.replace(/_/g, ' ')}</Pill>
                  </td>
                  <td className="vx-table-cell">
                    <Pill tone={activity === 'High' ? 'ok' : activity === 'Medium' ? 'info' : 'neutral'}>
                      {activity}
                    </Pill>
                  </td>
                  <td className="vx-table-cell">
                    <Pill tone={risk === 'None' ? 'neutral' : 'warn'}>{risk}</Pill>
                  </td>
                  <td className="vx-table-cell">
                    <Pill tone={u.mfaEnabled ? 'ok' : 'warn'}>{u.mfaEnabled ? 'on' : 'off'}</Pill>
                  </td>
                  <td className="vx-table-cell">
                    <Pill tone={u.status === 'active' ? 'ok' : 'high'}>{u.status}</Pill>
                  </td>
                  <td className="vx-table-cell text-right">
                    <div className="flex justify-end gap-1.5">
                      <button className="vx-btn !px-2 !py-1">Role</button>
                      <button className="vx-btn !px-2 !py-1">Access review</button>
                      <button className="vx-btn !border-status-high/40 !px-2 !py-1 !text-status-high">
                        Suspend
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card title="Access governance" subtitle="Principle of least privilege — AI-assisted access review (§23B.5)">
        <div className="grid gap-3 text-xs md:grid-cols-3">
          {[
            ['Access Review', 'AI-assisted review against least-privilege principle', 'Run review'],
            ['Permission Assignment', 'Add or remove module access within plan entitlement', 'Manage'],
            ['Audit History', 'Complete action log for any user identity', 'Open log'],
          ].map(([t, d, cta]) => (
            <div key={t} className="vx-card p-3">
              <div className="font-medium text-white">{t}</div>
              <p className="mt-1 text-[11px] text-veryx-muted">{d}</p>
              <button className="vx-btn mt-2">{cta}</button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
