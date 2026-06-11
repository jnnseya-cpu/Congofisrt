/**
 * VERYX AI-OS — demo environment seed.
 *
 * Creates a coherent, fully-linked dataset across every module so the three
 * command centres render with live data on first run:
 *   platform tenant + super admin, three enterprise tenants, users per role,
 *   wallets, 5 weeks of transactions, ACU ledger, workflows, recommendations,
 *   threats, portfolios → programmes → projects → work packages/tasks/risks/
 *   issues/CRs/documents, resources + timesheets, assets + work orders,
 *   vendors, ESG data points, sprints/stories/test cases, agent executions,
 *   payment links and a seeded hash-chained audit trail.
 *
 * Default password for every demo account: Veryx!2026
 */
import { PrismaClient } from '@prisma/client';
import { createHash, randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

const PASSWORD = 'Veryx!2026';
const daysAgo = (n: number, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, Math.floor(Math.random() * 50), 0, 0);
  return d;
};

let prevHash: string | null = null;
async function seedAudit(action: string, tenantId: string | null, actorType = 'system') {
  const payload = JSON.stringify({ action, tenantId, at: new Date().toISOString(), prev: prevHash ?? 'GENESIS' });
  const hash = createHash('sha256').update(payload).digest('hex');
  await db.auditLog.create({
    data: { tenantId, actorType, action, hash, prevHash },
  });
  prevHash = hash;
}

async function main() {
  console.log('⏳ Wiping existing data…');
  // Order matters only loosely (no FK constraints in SQLite schema), keep tidy.
  const tables = [
    db.testCase, db.story, db.sprint, db.esgDataPoint, db.vendor, db.workOrder, db.asset,
    db.costAccount, db.timesheet, db.resourceProfile, db.document, db.changeRequest, db.issue,
    db.risk, db.task, db.workPackage, db.project, db.programme, db.portfolio, db.workflow,
    db.threatAlert, db.recommendation, db.acuLedgerEntry, db.agentExecution, db.paymentLink,
    db.transaction, db.wallet, db.apiKey, db.auditLog, db.user, db.subscriptionPlan, db.tenant,
  ] as const;
  for (const t of tables) await (t as { deleteMany: (a?: object) => Promise<unknown> }).deleteMany({});

  console.log('🏷️  Subscription plans (Blueprint §12.1)…');
  await db.subscriptionPlan.createMany({
    data: [
      { name: 'Starter', monthlyPrice: 49, maxUsers: 3, maxAgents: 5, acuPerMonth: 500, apiCallsPerMonth: 10_000, slaUptime: '99.5%', supportLevel: 'Email', sortOrder: 1 },
      { name: 'Growth', monthlyPrice: 149, maxUsers: 10, maxAgents: 20, acuPerMonth: 2_000, apiCallsPerMonth: 100_000, slaUptime: '99.7%', supportLevel: 'Email+Chat', sortOrder: 2 },
      { name: 'Pro', monthlyPrice: 399, maxUsers: 50, maxAgents: 50, acuPerMonth: 8_000, apiCallsPerMonth: 1_000_000, slaUptime: '99.9%', supportLevel: 'Priority', sortOrder: 3 },
      { name: 'Enterprise', monthlyPrice: 1_200, maxUsers: 9_999, maxAgents: 99, acuPerMonth: 30_000, apiCallsPerMonth: 10_000_000, whiteLabel: true, slaUptime: '99.95%', supportLevel: 'Dedicated CSM', sortOrder: 4 },
      { name: 'Sovereign', monthlyPrice: 5_000, maxUsers: 99_999, maxAgents: 99, acuPerMonth: 120_000, apiCallsPerMonth: 100_000_000, whiteLabel: true, slaUptime: '99.99%', supportLevel: 'Dedicated team', sortOrder: 5 },
    ],
  });

  console.log('🏢 Tenants…');
  const platform = await db.tenant.create({
    data: { name: 'VERYX Platform', slug: 'veryx-platform', countryCode: 'GB', kybStatus: 'approved', tier: 'sovereign', acuBalance: 1_000_000, healthScore: 96 },
  });
  const nseya = await db.tenant.create({
    data: { name: 'Nseya Digital Group', slug: 'nseya-digital', countryCode: 'GB', kybStatus: 'approved', tier: 'enterprise', acuBalance: 24_350, healthScore: 84, bitripayMerchantId: 'BTP-MERCH-0001' },
  });
  const kinshasa = await db.tenant.create({
    data: { name: 'Kinshasa Logistics SARL', slug: 'kinshasa-logistics', countryCode: 'CD', kybStatus: 'approved', tier: 'pro', acuBalance: 6_120, healthScore: 71, bitripayMerchantId: 'BTP-MERCH-0002' },
  });
  const lonfin = await db.tenant.create({
    data: { name: 'London FinTech Partners', slug: 'london-fintech', countryCode: 'GB', kybStatus: 'in_review', tier: 'growth', acuBalance: 980, healthScore: 58 },
  });

  console.log('👤 Users (password: Veryx!2026)…');
  const hash = await bcrypt.hash(PASSWORD, 12);
  const mkUser = (tenantId: string | null, email: string, first: string, last: string, role: string, department?: string) =>
    db.user.create({
      data: { tenantId, email, passwordHash: hash, firstName: first, lastName: last, role, department, mfaEnabled: role === 'super_admin' || role === 'enterprise_admin', lastLoginAt: daysAgo(0, 7) },
    });

  const admin = await mkUser(platform.id, 'admin@veryx.io', 'Justin', 'Nseya', 'super_admin', 'Platform Operations');
  const owner = await mkUser(nseya.id, 'owner@nseya-digital.com', 'Amara', 'Nseya', 'business_owner', 'Executive');
  const pm = await mkUser(nseya.id, 'pm@nseya-digital.com', 'Didier', 'Kabongo', 'team_member', 'PMO');
  await mkUser(nseya.id, 'finance@nseya-digital.com', 'Grace', 'Mwamba', 'enterprise_admin', 'Finance');
  await mkUser(nseya.id, 'dev@nseya-digital.com', 'Theo', 'Ilunga', 'developer', 'Engineering');
  await mkUser(nseya.id, 'merchant@nseya-digital.com', 'Chantal', 'Mbuyi', 'merchant', 'Commerce');
  await mkUser(kinshasa.id, 'ceo@kinshasa-logistics.cd', 'Patrice', 'Lumengo', 'business_owner', 'Executive');
  await mkUser(kinshasa.id, 'ops@kinshasa-logistics.cd', 'Marie', 'Tshala', 'team_member', 'Operations');
  await mkUser(lonfin.id, 'founder@londonfintech.co.uk', 'Oliver', 'Hayes', 'business_owner', 'Executive');

  console.log('💱 Wallets…');
  for (const [tenantId, currency, balance] of [
    [nseya.id, 'GBP', 184_220.5], [nseya.id, 'USD', 92_410.0], [nseya.id, 'EUR', 41_880.25], [nseya.id, 'CDF', 412_500_000],
    [kinshasa.id, 'CDF', 268_400_000], [kinshasa.id, 'USD', 31_240],
  ] as const) {
    await db.wallet.create({
      data: { ownerId: tenantId, ownerType: 'tenant', currency, balance: Number(balance), frozenBalance: currency === 'GBP' ? 2_400 : 0 },
    });
  }

  console.log('💳 Transactions — 35 days of payment history…');
  const channels = ['card', 'mpesa', 'cdf_wallet', 'orange', 'airtel', 'card'] as const;
  const tenantsForTx = [
    { t: nseya, base: 8_000 },
    { t: kinshasa, base: 3_200 },
    { t: lonfin, base: 900 },
  ];
  let txCount = 0;
  for (let day = 34; day >= 0; day--) {
    for (const { t, base } of tenantsForTx) {
      const perDay = day === 0 ? 4 : 2 + (day % 3);
      for (let i = 0; i < perDay; i++) {
        const channel = channels[(day + i) % channels.length];
        const amount = Math.round(base * (0.4 + ((day * 7 + i * 13) % 100) / 90) * 100) / 100;
        const failed = (day + i) % 17 === 0;
        const disputed = (day + i) % 29 === 0;
        await db.transaction.create({
          data: {
            tenantId: t.id,
            type: 'payment',
            status: disputed ? 'disputed' : failed ? 'failed' : 'completed',
            amount,
            currency: channel === 'mpesa' || channel === 'cdf_wallet' ? 'CDF' : 'GBP',
            gateway: channel === 'card' ? 'stripe' : 'bitripay',
            channel,
            gatewayReference: `BTP-${randomUUID().slice(0, 12).toUpperCase()}`,
            fraudScore: disputed ? 82 : Math.floor(5 + ((day * 11 + i * 3) % 38)),
            customerRef: `cust-${(day * 5 + i) % 40}`,
            idempotencyKey: `seed-${t.slug}-${day}-${i}`,
            createdAt: daysAgo(day, 8 + (i % 10)),
            completedAt: failed || disputed ? null : daysAgo(day, 8 + (i % 10)),
          },
        });
        txCount++;
      }
    }
  }
  console.log(`   → ${txCount} transactions`);

  console.log('🪙 ACU ledger — purchases + consumption…');
  const acuTenants = [
    { t: nseya, purchase: 10_000, dailyBurn: 420 },
    { t: kinshasa, purchase: 2_000, dailyBurn: 145 },
    { t: lonfin, purchase: 500, dailyBurn: 38 },
  ];
  for (const { t, purchase, dailyBurn } of acuTenants) {
    let balance = 0;
    for (let day = 30; day >= 0; day--) {
      if (day % 10 === 0) {
        balance += purchase;
        await db.acuLedgerEntry.create({
          data: { tenantId: t.id, delta: purchase, reason: `purchase.${purchase}`, balanceAfter: balance, refType: 'purchase', createdAt: daysAgo(day, 9) },
        });
      }
      const burn = Math.round(dailyBurn * (0.7 + ((day * 13) % 10) / 14));
      balance -= burn;
      await db.acuLedgerEntry.create({
        data: { tenantId: t.id, delta: -burn, reason: 'agent.daily_operations', balanceAfter: balance, refType: 'execution', createdAt: daysAgo(day, 16) },
      });
    }
  }

  console.log('🤖 Agent execution history…');
  const agentTypes = ['ceo_agent', 'cfo_agent', 'fraud_detection_agent', 'compliance_agent', 'support_agent', 'governance_agent', 'planning_agent', 'cost_finance_agent', 'esg_agent', 'system_health_agent'];
  for (let i = 0; i < 48; i++) {
    const day = i % 7;
    const agent = agentTypes[i % agentTypes.length];
    await db.agentExecution.create({
      data: {
        tenantId: i % 3 === 0 ? kinshasa.id : nseya.id,
        agentType: agent,
        triggerType: (['scheduled', 'event', 'user_invoked'] as const)[i % 3],
        status: i % 19 === 0 ? 'failed' : 'completed',
        inputPayload: '{}',
        outputPayload: JSON.stringify({ summary: `${agent} completed scheduled analysis.` }),
        acuConsumed: [1, 5, 0.5, 3, 1, 35, 15, 15, 50, 1][i % 10],
        modelUsed: i % 2 === 0 ? 'veryx-sim-1' : 'claude-sonnet-4-6',
        tokensIn: 800 + (i * 97) % 2_000,
        tokensOut: 350 + (i * 61) % 900,
        durationMs: 600 + (i * 211) % 4_200,
        errorMessage: i % 19 === 0 ? 'Upstream connector timeout (retried 3×)' : null,
        traceId: randomUUID(),
        createdAt: daysAgo(day, 6 + (i % 14)),
        completedAt: daysAgo(day, 6 + (i % 14)),
      },
    });
  }

  console.log('⚙️  Workflows (§23B.3)…');
  await db.workflow.createMany({
    data: [
      { tenantId: nseya.id, name: 'Invoice Processing', status: 'running', mode: 'auto', costToday: 142.4, efficiencyScore: 94, timeSavedHours: 312, slaStatus: 'on_track', automationRate: 96, errorRate: 0.4 },
      { tenantId: nseya.id, name: 'Customer Onboarding', status: 'running', mode: 'manual_step', costToday: 88.1, efficiencyScore: 87, timeSavedHours: 168, slaStatus: 'on_track', automationRate: 78, errorRate: 1.2 },
      { tenantId: nseya.id, name: 'Report Generation', status: 'running', mode: 'scheduled', costToday: 36.5, efficiencyScore: 91, timeSavedHours: 95, slaStatus: 'on_track', automationRate: 100, errorRate: 0.1 },
      { tenantId: nseya.id, name: 'Data Reconciliation', status: 'running', mode: 'ai_assisted', costToday: 64.2, efficiencyScore: 89, timeSavedHours: 204, slaStatus: 'at_risk', automationRate: 84, errorRate: 1.8 },
      { tenantId: nseya.id, name: 'Compliance Monitoring', status: 'paused', mode: 'auto', costToday: 0, efficiencyScore: 92, timeSavedHours: 140, slaStatus: 'on_track', automationRate: 90, errorRate: 0.6 },
      { tenantId: nseya.id, name: 'Contract Renewal Pipeline', status: 'delayed', mode: 'manual_step', costToday: 22.7, efficiencyScore: 64, timeSavedHours: 48, slaStatus: 'breached', automationRate: 52, errorRate: 4.1 },
      { tenantId: kinshasa.id, name: 'Customs Clearance', status: 'running', mode: 'ai_assisted', costToday: 51.0, efficiencyScore: 82, timeSavedHours: 130, slaStatus: 'on_track', automationRate: 74, errorRate: 2.0 },
    ],
  });

  console.log('💡 AI recommendations…');
  await db.recommendation.createMany({
    data: [
      // Platform scope (§23A.3)
      { scope: 'platform', agentType: 'revenue_agent', title: 'Raise ACU volume-tier discount threshold', detail: 'Tenants in the 10k tier consume 31% above plan. Moving the 40% discount band from 50k to 75k units protects £3.2k/mo margin without measurable churn risk.', severity: 'high', impact: '+£3,200/month gross margin', action: 'Apply pricing change', confidence: 84 },
      { scope: 'platform', agentType: 'system_health_agent', title: 'Scale agent-engine before Monday peak', detail: 'Queue depth P95 reached 78% of capacity during the last two Monday peaks. Pre-scaling +2 replicas between 07:00–11:00 UTC removes the breach risk.', severity: 'medium', impact: 'Prevents SLA breach (99.9% target)', action: 'Approve auto-scale rule', confidence: 91 },
      { scope: 'platform', agentType: 'retention_agent', title: 'Intervene on London FinTech Partners', detail: 'Engagement score fell to 41/100 and ACU burn stopped 6 days ago. Churn model gives 62% probability within 30 days. Recommended: founder outreach + 500 trial ACU.', severity: 'high', impact: '£1,788 ARR at risk', action: 'Launch retention play', confidence: 76 },
      { scope: 'platform', agentType: 'bitripay_agent', title: 'Re-route Africell traffic to USSD bridge', detail: 'Africell API error rate at 3.8% (threshold 2%). Circuit is half-open; switching to the USSD bridge restores full coverage while the operator resolves.', severity: 'medium', impact: '0.4% of DRC volume affected', action: 'Switch rail', confidence: 88 },
      { scope: 'platform', agentType: 'compliance_agent', title: 'BCC quarterly e-money report due in 9 days', detail: 'Instruction n°58 reporting window opens Monday. Draft auto-generated from settlement ledger — requires compliance officer sign-off before submission.', severity: 'medium', impact: 'Regulatory deadline', action: 'Review draft', confidence: 99 },
      // Business scope (§23B.1) — Nseya
      { tenantId: nseya.id, scope: 'business', agentType: 'cfo_agent', title: 'Re-phase Q3 cloud commitments', detail: 'Cashflow model shows a £38k pinch-point in week 31 driven by annual licence renewals. Shifting the GCP commitment to monthly billing for one quarter clears it.', severity: 'high', impact: 'Avoids £38k working-capital gap', action: 'Approve re-phasing', confidence: 82 },
      { tenantId: nseya.id, scope: 'business', agentType: 'revenue_agent', title: 'Upsell 4 customers to annual plans', detail: 'Four Growth-tier customers exceeded usage quotas 3 consecutive weeks. Annual upgrade offers at 15% discount have an 81% predicted acceptance rate.', severity: 'medium', impact: '+£14,200 ARR', action: 'Send offers', confidence: 81 },
      { tenantId: nseya.id, scope: 'business', agentType: 'workflow_automation_agent', title: 'Automate contract renewal pipeline', detail: 'The Contract Renewal Pipeline workflow is 52% automated vs 90% benchmark — 3 manual steps can be replaced by Document Agent extraction + e-signature triggers.', severity: 'medium', impact: '+£12,400/year efficiency', action: 'Apply optimisation', confidence: 87 },
      { tenantId: nseya.id, scope: 'business', agentType: 'esg_agent', title: 'CSRD double-materiality gaps', detail: 'Two ESRS topics (E4 biodiversity, S2 value-chain workers) lack data owners. Assigning owners now keeps the FY26 CSRD disclosure on schedule.', severity: 'low', impact: 'Reporting completeness', action: 'Assign owners', confidence: 95 },
      // Project scope
      { tenantId: nseya.id, scope: 'project', agentType: 'planning_agent', title: 'Fast-track gateway certification testing', detail: 'Monte Carlo P80 finish slips 12 days past the contractual milestone. Fast-tracking certification testing (+£12k) recovers 9 days with minimal risk coupling.', severity: 'high', impact: '9 days schedule recovery', action: 'Approve fast-track', confidence: 79 },
    ],
  });

  console.log('🚨 Threat alerts…');
  await db.threatAlert.createMany({
    data: [
      // Platform (§23A.6)
      { scope: 'platform', type: 'ACU Overconsumption Risk', severity: 'HIGH', impact: 'Margin erosion — AI cost exceeding revenue generated by ACU sales for tenant Kinshasa Logistics', action: 'Apply consumption cap / trigger ACU pricing review', owner: 'platform', detectedAt: daysAgo(0, 6) },
      { scope: 'platform', type: 'API Cost Spike Detected', severity: 'HIGH', impact: 'Provider invoice will exceed projected monthly budget by £1,840 (Datadog overage + LLM burst)', action: 'Reroute to cheaper model / activate cost protection mode', owner: 'platform', detectedAt: daysAgo(0, 8) },
      { scope: 'platform', type: 'Failing AI Calls / Provider Outage', severity: 'HIGH', impact: 'Africell rail degraded — DRC payment confirmations delayed up to 90s', action: 'Trigger fallback routing / activate secondary provider', owner: 'platform', detectedAt: daysAgo(1, 22) },
      { scope: 'platform', type: 'Suspicious User Activity', severity: 'MEDIUM', impact: 'Credential-stuffing pattern on 3 accounts from datacenter IP range', action: 'Flag accounts / initiate security review / suspend if confirmed', owner: 'platform', detectedAt: daysAgo(1, 4) },
      { scope: 'platform', type: 'Tenant ACU Wallet Depletion', severity: 'MEDIUM', impact: 'London FinTech Partners will be hard-stopped in ~6 days — AI features suspended', action: 'Alert tenant admin / offer top-up / extend grace period', owner: 'platform', detectedAt: daysAgo(0, 9) },
      // Business (§23B.6) — Nseya
      { tenantId: nseya.id, scope: 'business', type: 'Cost Overrun Detected', severity: 'HIGH', impact: 'Monthly operational spend exceeds approved budget by 8% on current trajectory', action: 'Review top-cost workflows — apply spend cap — escalate to CFO', owner: 'finance@nseya-digital.com', detectedAt: daysAgo(0, 7) },
      { tenantId: nseya.id, scope: 'business', type: 'Unusual Usage Spike', severity: 'HIGH', impact: 'AI consumption spiked 3.4× baseline in Data Reconciliation workflow', action: 'Identify responsible workflow — check for runaway automation', owner: 'ops', detectedAt: daysAgo(0, 11) },
      { tenantId: nseya.id, scope: 'business', type: 'Workflow Inefficiency Detected', severity: 'MEDIUM', impact: 'Contract Renewal Pipeline bottleneck adds 3.2 days average cycle time', action: 'Trigger optimisation review — AI recommendation available', owner: 'ops', detectedAt: daysAgo(2, 9) },
      { tenantId: nseya.id, scope: 'business', type: 'Inactive Resources Detected', severity: 'LOW', impact: '2 allocated seats unused for 21 days — £96/mo cost drag', action: 'Reallocate budget — review for access revocation', owner: 'hr', detectedAt: daysAgo(3, 14) },
      // Project scope
      { tenantId: nseya.id, scope: 'project', type: 'Critical Path Delay', severity: 'HIGH', impact: 'Gateway certification slip threatens contracted milestone by 12 days (P80)', action: 'Trigger acceleration plan — reassign resources — escalate to sponsor', owner: 'pm@nseya-digital.com', detectedAt: daysAgo(0, 8) },
      { tenantId: nseya.id, scope: 'project', type: 'Resource Shortage', severity: 'MEDIUM', impact: 'Insufficient specialist capacity (2 FTE) for integration phase starting next month', action: 'Initiate resource procurement — review contractor availability', owner: 'pm@nseya-digital.com', detectedAt: daysAgo(1, 10) },
    ],
  });

  console.log('📁 Portfolio → programme → projects (Domain §4.1)…');
  const portfolio = await db.portfolio.create({
    data: { tenantId: nseya.id, name: 'Digital Infrastructure Portfolio', strategicObjectives: JSON.stringify(['growth', 'resilience', 'compliance']), budget: 4_500_000, currency: 'GBP', ownerId: owner.id },
  });
  const programme = await db.programme.create({
    data: { tenantId: nseya.id, portfolioId: portfolio.id, name: 'Pan-African Payments Programme', sponsorId: owner.id, programmeManager: 'Didier Kabongo', budget: 2_600_000, alignmentScore: 87 },
  });

  const project1 = await db.project.create({
    data: {
      tenantId: nseya.id, programmeId: programme.id, code: 'LON-DC-2026', name: 'London Data Centre Programme',
      methodology: 'hybrid', phase: 'Execution', location: 'London, UK', pmName: 'Didier Kabongo',
      healthRag: 'amber', status: 'at_risk', npv: 1_840_000, irr: 18.4, alignmentScore: 91,
      budget: 1_200_000, actualCost: 742_000, plannedValue: 760_000, earnedValue: 698_000, forecastCost: 1_276_000,
      scheduleProgress: 58, targetProgress: 63, plannedStart: daysAgo(160), plannedFinish: daysAgo(-140),
    },
  });
  const project2 = await db.project.create({
    data: {
      tenantId: nseya.id, programmeId: programme.id, code: 'KIN-PAY-2026', name: 'Kinshasa Payment Corridor Rollout',
      methodology: 'agile', phase: 'Execution', location: 'Kinshasa, DRC', pmName: 'Marie Tshala',
      healthRag: 'green', status: 'on_track', npv: 920_000, irr: 24.1, alignmentScore: 88,
      budget: 680_000, actualCost: 301_000, plannedValue: 295_000, earnedValue: 312_000, forecastCost: 655_000,
      scheduleProgress: 46, targetProgress: 44, plannedStart: daysAgo(120), plannedFinish: daysAgo(-180),
    },
  });

  console.log('📦 Work packages, tasks, risks, issues, CRs, documents…');
  await db.workPackage.createMany({
    data: [
      { projectId: project1.id, code: 'WP-01', name: 'Site enablement & power', status: 'complete', progress: 100, budget: 240_000, costConsumed: 232_000 },
      { projectId: project1.id, code: 'WP-02', name: 'Network core build', status: 'active', progress: 72, budget: 310_000, costConsumed: 248_000 },
      { projectId: project1.id, code: 'WP-03', name: 'Gateway certification', status: 'delayed', progress: 41, budget: 180_000, costConsumed: 121_000 },
      { projectId: project1.id, code: 'WP-04', name: 'Data migration', status: 'active', progress: 38, budget: 260_000, costConsumed: 96_000 },
      { projectId: project1.id, code: 'WP-05', name: 'Service transition', status: 'active', progress: 12, budget: 210_000, costConsumed: 45_000 },
      { projectId: project2.id, code: 'WP-01', name: 'M-Pesa corridor integration', status: 'active', progress: 64, budget: 180_000, costConsumed: 104_000 },
      { projectId: project2.id, code: 'WP-02', name: 'Agent network onboarding', status: 'active', progress: 51, budget: 220_000, costConsumed: 117_000 },
      { projectId: project2.id, code: 'WP-03', name: 'BCC compliance certification', status: 'active', progress: 33, budget: 140_000, costConsumed: 52_000 },
    ],
  });
  await db.task.createMany({
    data: [
      { projectId: project1.id, wbsCode: '1.1', name: 'Power redundancy commissioning', duration: 12, percentComplete: 100, criticalPath: false, totalFloat: 6 },
      { projectId: project1.id, wbsCode: '1.2', name: 'Core switch installation', duration: 18, percentComplete: 84, criticalPath: true, totalFloat: 0 },
      { projectId: project1.id, wbsCode: '1.3.2', name: 'Data migration — wave 2', duration: 21, percentComplete: 35, criticalPath: true, totalFloat: 0 },
      { projectId: project1.id, wbsCode: '2.1.1', name: 'Gateway certification testing', duration: 15, percentComplete: 40, criticalPath: true, totalFloat: 0 },
      { projectId: project1.id, wbsCode: '2.2', name: 'Failover simulation', duration: 8, percentComplete: 0, criticalPath: false, totalFloat: 4 },
      { projectId: project2.id, wbsCode: '1.1', name: 'STK push integration', duration: 10, percentComplete: 90, criticalPath: true, totalFloat: 0 },
      { projectId: project2.id, wbsCode: '1.2', name: 'Agent KYC onboarding flow', duration: 14, percentComplete: 55, criticalPath: false, totalFloat: 5 },
    ],
  });
  await db.risk.createMany({
    data: [
      { tenantId: nseya.id, projectId: project1.id, title: 'Gateway certification slips past contract milestone', category: 'schedule', probability: 4, impact: 5, score: 20, responseStrategy: 'mitigate', quantitativeCostImpact: 84_000 },
      { tenantId: nseya.id, projectId: project1.id, title: 'Legacy data quality forces migration rework', category: 'technical', probability: 3, impact: 4, score: 12, responseStrategy: 'mitigate', quantitativeCostImpact: 46_000 },
      { tenantId: nseya.id, projectId: project1.id, title: 'Power vendor insolvency', category: 'external', probability: 2, impact: 5, score: 10, responseStrategy: 'transfer', quantitativeCostImpact: 120_000 },
      { tenantId: nseya.id, projectId: project1.id, title: 'Specialist network engineer attrition', category: 'organisational', probability: 3, impact: 3, score: 9, responseStrategy: 'accept', quantitativeCostImpact: 22_000 },
      { tenantId: nseya.id, projectId: project2.id, title: 'BCC approval timeline uncertainty', category: 'legal', probability: 3, impact: 4, score: 12, responseStrategy: 'mitigate', quantitativeCostImpact: 38_000 },
      { tenantId: nseya.id, projectId: project2.id, title: 'FX volatility on CDF settlement float', category: 'external', probability: 4, impact: 3, score: 12, responseStrategy: 'transfer', quantitativeCostImpact: 29_000 },
      { tenantId: nseya.id, title: 'Key supplier concentration (cloud)', category: 'external', probability: 2, impact: 4, score: 8, responseStrategy: 'mitigate', quantitativeCostImpact: 64_000 },
      { tenantId: nseya.id, title: 'GDPR DSAR volume exceeding SLA capacity', category: 'legal', probability: 2, impact: 3, score: 6, responseStrategy: 'mitigate', quantitativeCostImpact: 18_000 },
    ],
  });
  await db.issue.createMany({
    data: [
      { projectId: project1.id, title: 'Cert lab access delayed by security clearance', category: 'delivery', priority: 'high', description: 'Two engineers awaiting site clearance for certification lab.' },
      { projectId: project1.id, title: 'Fibre patching defects in row C', category: 'quality', priority: 'medium' },
      { projectId: project1.id, title: 'Migration runbook gaps for wave 3', category: 'planning', priority: 'medium' },
      { projectId: project2.id, title: 'Operator sandbox credentials expired', category: 'technical', priority: 'high' },
    ],
  });
  await db.changeRequest.createMany({
    data: [
      { projectId: project1.id, title: 'Add second certification test rig', type: 'cost', status: 'in_review', scheduleImpactDays: -9, costImpact: 12_000 },
      { projectId: project1.id, title: 'Scope addition: edge PoP racks', type: 'scope', status: 'submitted', scheduleImpactDays: 6, costImpact: 48_000 },
      { projectId: project2.id, title: 'Switch to BCC fast-track review channel', type: 'regulatory', status: 'approved', scheduleImpactDays: -14, costImpact: 6_500 },
    ],
  });
  await db.document.createMany({
    data: [
      { tenantId: nseya.id, projectId: project1.id, name: 'Programme Execution Plan', type: 'plan', revision: 'C', status: 'approved', classification: 'internal' },
      { tenantId: nseya.id, projectId: project1.id, name: 'Gateway Certification Test Spec', type: 'specification', revision: 'B', status: 'under_review', classification: 'confidential' },
      { tenantId: nseya.id, projectId: project1.id, name: 'Migration Wave 2 Runbook', type: 'procedure', revision: 'A', status: 'approved', classification: 'internal' },
      { tenantId: nseya.id, projectId: project1.id, name: 'Power Vendor Contract', type: 'contract', revision: '02', status: 'approved', classification: 'restricted' },
      { tenantId: nseya.id, projectId: project2.id, name: 'BCC Compliance Dossier', type: 'compliance', revision: 'D', status: 'under_review', classification: 'restricted' },
      { tenantId: nseya.id, name: 'Information Security Policy', type: 'policy', revision: '04', status: 'approved', classification: 'internal' },
    ],
  });

  console.log('🧑‍🏭 Resources, timesheets, cost accounts…');
  const resourceRows = [
    ['Didier Kabongo', 'Programme Director', 'PMO', 0],
    ['Marie Tshala', 'Delivery Lead', 'Operations', 1],
    ['Theo Ilunga', 'Platform Engineer', 'Engineering', 2],
    ['Grace Mwamba', 'Finance Controller', 'Finance', 3],
    ['Chantal Mbuyi', 'Merchant Ops Lead', 'Commerce', 4],
  ] as const;
  for (const [name, role, dept] of resourceRows) {
    const r = await db.resourceProfile.create({
      data: {
        tenantId: nseya.id, name, role, department: dept,
        skills: JSON.stringify(['delivery', 'finance', 'engineering'].slice(0, 2)),
        certifications: JSON.stringify([{ name: 'PRINCE2', expires: '2027-03-01' }]),
        capacityHours: 160, allocatedHours: 120 + Math.floor(Math.random() * 50), costRate: 520,
      },
    });
    for (let d = 4; d >= 0; d--) {
      await db.timesheet.create({
        data: { resourceId: r.id, projectId: project1.id, date: daysAgo(d), hours: 7.5, status: d > 1 ? 'approved' : 'submitted' },
      });
    }
  }
  await db.costAccount.createMany({
    data: [
      { projectId: project1.id, wbsElement: 'CA-100 Infrastructure', budget: 550_000, actual: 480_000, etc: 120_000, eac: 600_000, capexOpexSplit: 'capex', glCode: '1500' },
      { projectId: project1.id, wbsElement: 'CA-200 Professional services', budget: 420_000, actual: 198_000, etc: 240_000, eac: 438_000, capexOpexSplit: 'opex', glCode: '6200' },
      { projectId: project1.id, wbsElement: 'CA-300 Licences', budget: 230_000, actual: 64_000, etc: 174_000, eac: 238_000, capexOpexSplit: 'opex', glCode: '6400' },
    ],
  });

  console.log('🏭 Assets, work orders, vendors, ESG…');
  const assetRows = [
    ['UPS System — Hall A', 'electrical', 2, 84_000],
    ['CRAC Unit 4', 'hvac', 3, 41_000],
    ['Core Router Pair', 'network', 1, 122_000],
    ['Diesel Generator G2', 'electrical', 3, 96_000],
    ['Access Control System', 'security', 2, 28_000],
  ] as const;
  for (const [name, category, grade, cost] of assetRows) {
    const a = await db.asset.create({
      data: { tenantId: nseya.id, name, category, conditionGrade: grade, acquisitionCost: cost, bookValue: cost * 0.72, nextPmDate: daysAgo(-20) },
    });
    await db.workOrder.create({
      data: { assetId: a.id, type: grade >= 3 ? 'corrective' : 'preventive', priority: grade >= 3 ? 'high' : 'medium', status: 'open', estimatedHours: 6 },
    });
  }
  await db.vendor.createMany({
    data: [
      { tenantId: nseya.id, legalName: 'Thames Power Solutions Ltd', category: JSON.stringify(['electrical']), avlStatus: 'approved', pqScore: 88, performanceScore: 91, spendYtd: 412_000, riskRating: 'low' },
      { tenantId: nseya.id, legalName: 'Kinshasa Fibre SARL', category: JSON.stringify(['network']), avlStatus: 'approved', pqScore: 81, performanceScore: 77, spendYtd: 186_000, riskRating: 'medium' },
      { tenantId: nseya.id, legalName: 'Atlas Professional Services', category: JSON.stringify(['consulting']), avlStatus: 'approved', pqScore: 92, performanceScore: 95, spendYtd: 240_000, riskRating: 'low' },
      { tenantId: nseya.id, legalName: 'RapidParts Logistics', category: JSON.stringify(['logistics']), avlStatus: 'pending', pqScore: 64, performanceScore: 0, spendYtd: 0, riskRating: 'medium' },
    ],
  });
  await db.esgDataPoint.createMany({
    data: [
      { tenantId: nseya.id, scope: 'scope1', category: 'Fleet diesel', activityData: 18_400, calculatedEmissions: 49.2, reportingPeriod: '2026-Q2', framework: 'TCFD' },
      { tenantId: nseya.id, scope: 'scope1', category: 'Generator fuel', activityData: 9_100, calculatedEmissions: 24.4, reportingPeriod: '2026-Q2', framework: 'CSRD' },
      { tenantId: nseya.id, scope: 'scope2', category: 'Purchased electricity — London DC', activityData: 1_240_000, calculatedEmissions: 256.9, reportingPeriod: '2026-Q2', framework: 'CSRD' },
      { tenantId: nseya.id, scope: 'scope2', category: 'Purchased electricity — Kinshasa office', activityData: 86_000, calculatedEmissions: 41.3, reportingPeriod: '2026-Q2', framework: 'GRI' },
      { tenantId: nseya.id, scope: 'scope3', category: 'Purchased goods & services', activityData: 2_400_000, calculatedEmissions: 812.4, reportingPeriod: '2026-Q2', framework: 'CDP' },
      { tenantId: nseya.id, scope: 'scope3', category: 'Business travel', activityData: 312_000, calculatedEmissions: 96.1, reportingPeriod: '2026-Q2', framework: 'GRI' },
    ],
  });

  console.log('🗂️  Sprints, stories, test cases (§4.10)…');
  const sprint = await db.sprint.create({
    data: { tenantId: nseya.id, name: 'Sprint 14 — Corridor Hardening', status: 'active', startDate: daysAgo(6), endDate: daysAgo(-8), velocity: 42 },
  });
  const storyRows = [
    ['epic', 'Payment corridor resilience', 'in_progress', 0],
    ['story', 'As a merchant, I can retry failed M-Pesa STK pushes', 'in_progress', 5],
    ['story', 'As an ops lead, I see settlement reconciliation breaks in real time', 'in_review', 8],
    ['story', 'As a compliance officer, I export the BCC settlement report', 'done', 3],
    ['story', 'As a developer, webhook retries use exponential backoff', 'todo', 5],
  ] as const;
  for (const [type, title, status, points] of storyRows) {
    const s = await db.story.create({
      data: { tenantId: nseya.id, sprintId: sprint.id, type, title, status, storyPoints: points, acceptanceCriteria: JSON.stringify(['Given/When/Then defined', 'Edge cases covered']) },
    });
    if (type === 'story') {
      await db.testCase.create({
        data: { storyId: s.id, title: `Verify: ${title.slice(0, 48)}`, steps: JSON.stringify(['Arrange', 'Act', 'Assert']), expectedResult: 'Behaviour matches acceptance criteria', status: status === 'done' ? 'pass' : 'not_run' },
      });
    }
  }

  console.log('🔗 Payment links…');
  await db.paymentLink.createMany({
    data: [
      { tenantId: nseya.id, amount: 1_250, currency: 'GBP', description: 'Enterprise onboarding fee', url: 'http://localhost:3000/pay/demo1', status: 'active', expiresAt: daysAgo(-3) },
      { tenantId: nseya.id, currency: 'CDF', description: 'Open-amount merchant QR', url: 'http://localhost:3000/pay/demo2', status: 'active', expiresAt: daysAgo(-30) },
    ],
  });

  console.log('🧾 Seeding hash-chained audit trail…');
  await seedAudit('platform.seeded', null);
  await seedAudit('tenant.created', nseya.id);
  await seedAudit('tenant.created', kinshasa.id);
  await seedAudit('auth.login.success', platform.id, 'user');
  await seedAudit('acu.pricing.reviewed', null, 'user');
  await seedAudit('agent.executed.ceo_agent', nseya.id, 'agent');
  await seedAudit('payment.initiated', nseya.id, 'system');
  await seedAudit('threat.detected.acu_overconsumption', null, 'agent');

  console.log('\n✅ VERYX demo environment ready.');
  console.log('   Super Admin  → admin@veryx.io / Veryx!2026  → /admin');
  console.log('   Biz Owner    → owner@nseya-digital.com / Veryx!2026 → /business');
  console.log('   Programme PM → pm@nseya-digital.com / Veryx!2026 → /projects');
  console.log(`   Users: ${await db.user.count()} · Transactions: ${await db.transaction.count()} · Agents executions: ${await db.agentExecution.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
