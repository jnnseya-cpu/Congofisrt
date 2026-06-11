import { requirePageSession } from '@/lib/page-auth';
import { Card, Pill } from '@/components/ui';

export const dynamic = 'force-dynamic';

const INTEGRATIONS = [
  { cat: 'ERP Systems', items: ['SAP', 'Oracle', 'MS Dynamics 365'], connected: 1 },
  { cat: 'CRM Systems', items: ['Salesforce', 'HubSpot'], connected: 1 },
  { cat: 'Finance Platforms', items: ['NetSuite', 'Xero', 'QuickBooks'], connected: 1 },
  { cat: 'Data Warehouses', items: ['Snowflake', 'BigQuery', 'Power BI'], connected: 0 },
  { cat: 'Document Management', items: ['SharePoint', 'Google Drive', 'Box'], connected: 1 },
  { cat: 'Communication', items: ['Slack', 'Microsoft Teams', 'Email'], connected: 2 },
  { cat: 'Payments', items: ['BitriPay', 'Stripe', 'Adyen'], connected: 2 },
  { cat: 'Identity & KYC', items: ['Sumsub', 'Veriff', 'Persona'], connected: 1 },
  { cat: 'DevOps', items: ['GitHub Actions', 'Jenkins', 'Sentry', 'PagerDuty'], connected: 2 },
];

/** §23B.9 — Integrations: third-party ecosystem & API connection management. */
export default async function BusinessIntegrations() {
  await requirePageSession();
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <h1 className="text-lg font-semibold text-white">Integrations — API Ecosystem</h1>
        <span className="text-xs text-veryx-muted">
          Circuit breakers + fallback routing on every connector (Blueprint §8.7)
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {INTEGRATIONS.map((g) => (
          <Card key={g.cat} title={g.cat}>
            <div className="space-y-2">
              {g.items.map((item, i) => {
                const connected = i < g.connected;
                return (
                  <div key={item} className="flex items-center justify-between border-b border-veryx-border/40 pb-1.5">
                    <span className="text-xs text-white">{item}</span>
                    <div className="flex items-center gap-1.5">
                      <Pill tone={connected ? 'ok' : 'neutral'}>
                        {connected ? 'connected' : 'available'}
                      </Pill>
                      <button className="vx-btn !px-2 !py-0.5">
                        {connected ? 'Monitor' : 'Connect'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
      <Card title="Per-integration functions" subtitle="§23B.9 management surface">
        <div className="grid gap-2 text-xs text-slate-300 md:grid-cols-3">
          <span>· Connect — OAuth or API-key authorisation</span>
          <span>· Disconnect — revoke with data purge options</span>
          <span>· Monitor — live status, call volume, error rate, latency</span>
          <span>· Test Connection — on-demand health check</span>
          <span>· API Usage Log — request/response history</span>
          <span>· Webhook Logs — delivery history with retry records</span>
        </div>
      </Card>
    </div>
  );
}
