import { db } from '@/lib/db';
import { verifyChain } from '@/lib/audit';
import { Card, Pill } from '@/components/ui';

export const dynamic = 'force-dynamic';

/** §23A.12 — Screen 10: Audit and Governance Layer (immutable log). */
export default async function AdminAudit() {
  const [logs, chain, total] = await Promise.all([
    db.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 40 }),
    verifyChain(),
    db.auditLog.count(),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <h1 className="text-lg font-semibold text-white">Audit & Governance Layer</h1>
        <div className="flex items-center gap-2 text-xs">
          <Pill tone={chain.valid ? 'ok' : 'high'}>
            {chain.valid ? `Hash chain intact · ${chain.checked} verified` : 'CHAIN BREACH DETECTED'}
          </Pill>
          <span className="text-veryx-muted">{total} records · tamper-proof · exportable</span>
        </div>
      </div>

      <Card
        title="Immutable platform audit log"
        subtitle="Every admin action, agent execution, pricing change and security event — SHA-256 hash-chained (§23A.12)"
      >
        <table className="w-full">
          <thead>
            <tr>
              <th className="vx-table-head">Timestamp (UTC)</th>
              <th className="vx-table-head">Action</th>
              <th className="vx-table-head">Actor</th>
              <th className="vx-table-head">Resource</th>
              <th className="vx-table-head">Record hash</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td className="vx-table-cell font-mono text-xs text-veryx-muted">
                  {l.createdAt.toISOString().slice(0, 19).replace('T', ' ')}
                </td>
                <td className="vx-table-cell text-white">{l.action}</td>
                <td className="vx-table-cell">
                  <Pill
                    tone={
                      l.actorType === 'agent' ? 'gold' : l.actorType === 'system' ? 'info' : 'neutral'
                    }
                  >
                    {l.actorType}
                  </Pill>
                </td>
                <td className="vx-table-cell text-xs text-veryx-muted">
                  {l.resourceType ?? '—'}
                </td>
                <td className="vx-table-cell font-mono text-[10px] text-veryx-muted">
                  {l.hash.slice(0, 16)}…
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
