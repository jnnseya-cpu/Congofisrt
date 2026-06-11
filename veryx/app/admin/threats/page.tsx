import { db } from '@/lib/db';
import { Card } from '@/components/ui';
import { ThreatCard } from '@/components/cards';

export const dynamic = 'force-dynamic';

/** §23A.6 — Screen 4: System Threats and Leaks (risk command screen). */
export default async function AdminThreats() {
  const threats = await db.threatAlert.findMany({
    where: { scope: 'platform', status: { not: 'resolved' } },
    orderBy: [{ severity: 'asc' }, { detectedAt: 'desc' }],
  });
  const resolved = await db.threatAlert.count({ where: { scope: 'platform', status: 'resolved' } });

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <h1 className="text-lg font-semibold text-white">System Threats & Leaks</h1>
        <span className="text-xs text-veryx-muted">
          {threats.length} open · {resolved} resolved — commercial & technical threat triage
        </span>
      </div>

      {threats.length === 0 ? (
        <Card title="No open threats">
          <p className="text-xs text-veryx-muted">
            All platform threats resolved. Detection continues across ACU overconsumption, API cost
            spikes, provider outages, suspicious activity, revenue drops and wallet depletion.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {threats.map((t) => (
            <ThreatCard key={t.id} threat={t} />
          ))}
        </div>
      )}
    </div>
  );
}
