import { db } from '@/lib/db';
import { fmtGbp, fmtNum } from '@/lib/utils';
import { Card, Pill, ProgressBar } from '@/components/ui';

export const dynamic = 'force-dynamic';

/** §23A.9 — Screen 7: Tenants and Users (who controls what). */
export default async function AdminTenants() {
  const [tenants, userCounts, revenueByTenant] = await Promise.all([
    db.tenant.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'asc' } }),
    db.user.groupBy({ by: ['tenantId'], _count: { id: true }, where: { status: 'active' } }),
    db.transaction.groupBy({
      by: ['tenantId'],
      _sum: { amount: true },
      where: { type: 'payment', status: 'completed' },
    }),
  ]);
  const usersOf = new Map(userCounts.map((u) => [u.tenantId, u._count.id]));
  const revOf = new Map(revenueByTenant.map((r) => [r.tenantId, r._sum.amount ?? 0]));
  const totalUsers = userCounts.reduce((s, u) => s + u._count.id, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <h1 className="text-lg font-semibold text-white">Tenants & Users — Governance</h1>
        <span className="text-xs text-veryx-muted">
          {tenants.length} enterprise tenants · {totalUsers} active users
        </span>
      </div>

      <Card title="Client revenue table" subtitle="Per-tenant subscription + ACU + lifetime value with action controls (§23A.9)">
        <table className="w-full">
          <thead>
            <tr>
              <th className="vx-table-head">Tenant</th>
              <th className="vx-table-head">Tier</th>
              <th className="vx-table-head">KYB</th>
              <th className="vx-table-head text-right">Users</th>
              <th className="vx-table-head text-right">Lifetime revenue</th>
              <th className="vx-table-head text-right">ACU balance</th>
              <th className="vx-table-head">Health</th>
              <th className="vx-table-head text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => {
              const health = t.healthScore;
              return (
                <tr key={t.id}>
                  <td className="vx-table-cell">
                    <div className="font-medium text-white">{t.name}</div>
                    <div className="font-mono text-[11px] text-veryx-muted">{t.slug}</div>
                  </td>
                  <td className="vx-table-cell">
                    <Pill tone="gold">{t.tier}</Pill>
                  </td>
                  <td className="vx-table-cell">
                    <Pill tone={t.kybStatus === 'approved' ? 'ok' : t.kybStatus === 'rejected' ? 'high' : 'warn'}>
                      {t.kybStatus}
                    </Pill>
                  </td>
                  <td className="vx-table-cell text-right font-mono text-white">{usersOf.get(t.id) ?? 0}</td>
                  <td className="vx-table-cell text-right font-mono text-gold-300">
                    {fmtGbp(revOf.get(t.id) ?? 0, true)}
                  </td>
                  <td className="vx-table-cell text-right font-mono text-white">{fmtNum(t.acuBalance, true)}</td>
                  <td className="vx-table-cell w-28">
                    <ProgressBar value={health} tone={health > 70 ? 'ok' : health > 40 ? 'warn' : 'high'} />
                    <span className="text-[10px] text-veryx-muted">{health}/100</span>
                  </td>
                  <td className="vx-table-cell text-right">
                    <div className="flex justify-end gap-1.5">
                      <button className="vx-btn !px-2 !py-1">View</button>
                      <button className="vx-btn !px-2 !py-1">Adjust ACU</button>
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
    </div>
  );
}
