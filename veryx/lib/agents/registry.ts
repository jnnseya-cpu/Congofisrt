// ── VERYX Agent Registry ─────────────────────────────────────────────────────
// Complete agent workforce: Blueprint §5.9 registry + Domain Coverage
// cross-domain agents (§4.x). Each agent is addressable as `<snake_case>_agent`
// via POST /api/v1/agents/{agentType}/execute.

import type { AcuAction } from '../acu';

export interface AgentDefinition {
  type: string; // canonical id, e.g. "ceo_agent"
  name: string;
  category: string;
  description: string;
  acuAction: AcuAction; // billing class for a standard execution
  /** Generates a deterministic, business-shaped result in simulation mode. */
  simulate: (input: Record<string, unknown>) => Record<string, unknown>;
}

const out = (summary: string, extras: Record<string, unknown> = {}) => ({
  summary,
  generated_at: new Date().toISOString(),
  ...extras,
});

function basic(
  type: string,
  name: string,
  category: string,
  description: string,
  acuAction: AcuAction = 'agent_standard',
  simulate?: AgentDefinition['simulate']
): AgentDefinition {
  return {
    type,
    name,
    category,
    description,
    acuAction,
    simulate:
      simulate ??
      ((input) =>
        out(`${name} completed its analysis.`, {
          findings: [
            `${name} reviewed the latest tenant signals and found no critical anomalies.`,
            'Recommended actions have been queued to the AI recommendation feed.',
          ],
          input_echo: input,
        })),
  };
}

export const AGENT_REGISTRY: AgentDefinition[] = [
  // ── Executive tier (Blueprint §5.1) ──
  {
    type: 'ceo_agent',
    name: 'CEO Agent',
    category: 'Executive',
    description: 'Strategic intelligence and executive briefing — your AI Chief of Staff.',
    acuAction: 'agent_with_tools',
    simulate: () =>
      out('Morning briefing generated.', {
        briefing: {
          revenue_delta_24h: '+4.2%',
          top_risks: [
            'ACU burn rate trending 12% above forecast in 2 tenants',
            'Contract renewal pipeline has 3 deals slipping beyond quarter end',
          ],
          top_opportunities: [
            'Upsell signal: 4 Growth-tier tenants exceeded agent quota 3 weeks running',
            'DRC corridor volume up 18% — consider BitriPay fee tier review',
          ],
          recommended_actions: [
            'Approve Pricing Agent proposal #PR-118 (ACU volume discount tier)',
            'Schedule enterprise pilot review with tenant "Kinshasa Logistics"',
          ],
        },
      }),
  },
  {
    type: 'cfo_agent',
    name: 'CFO Agent',
    category: 'Executive',
    description: 'Financial intelligence, treasury management and cash-flow forecasting.',
    acuAction: 'predictive_forecast',
    simulate: () =>
      out('Cash flow forecast refreshed.', {
        forecast: {
          horizon_days: 90,
          mrr_projection_gbp: [68_000, 74_500, 81_200],
          cash_runway_months: 14.5,
          variance_alerts: ['Cloud spend +£1,840 vs budget (Datadog overage)'],
        },
      }),
  },
  basic('coo_agent', 'COO Agent', 'Executive', 'Operational oversight and efficiency optimisation.'),
  basic('cto_agent', 'CTO Agent', 'Executive', 'Technology stack health and engineering performance.'),
  {
    type: 'cmo_agent',
    name: 'CMO Agent',
    category: 'Executive',
    description: 'Marketing intelligence and autonomous campaign orchestration.',
    acuAction: 'agent_with_tools',
    simulate: () =>
      out('Campaign portfolio reviewed.', {
        campaigns: [
          { name: 'DRC SME Launch', cac_gbp: 31.5, trend: 'improving', action: 'scale +20%' },
          { name: 'UK Developer Tier', cac_gbp: 54.2, trend: 'flat', action: 'refresh creative' },
        ],
      }),
  },
  basic('cro_agent', 'CRO Agent', 'Executive', 'Revenue growth and commercial performance.'),

  // ── Onboarding (Blueprint §5.2) ──
  {
    type: 'onboarding_agent',
    name: 'Onboarding Agent',
    category: 'Onboarding',
    description: 'End-to-end user activation: registration → KYC → personalised first value.',
    acuAction: 'agent_with_tools',
    simulate: (input) =>
      out('Onboarding flow executed.', {
        steps: ['registration_captured', 'kyc_triggered', 'risk_scored', 'account_activated', 'welcome_sequence_sent'],
        kyc_tier: 2,
        activation_time_seconds: 212,
        input_echo: input,
      }),
  },

  // ── Compliance (Blueprint §5.3) ──
  {
    type: 'compliance_agent',
    name: 'Compliance Agent',
    category: 'Compliance',
    description: 'Continuous GDPR / AML / KYC / BCC / FCA / PCI-DSS enforcement.',
    acuAction: 'compliance_screening',
    simulate: () =>
      out('Compliance sweep complete.', {
        frameworks: { GDPR: 'compliant', AML6: 'compliant', BCC_58: 'compliant', PCI_DSS: 'SAQ-D aligned', FCA_EME: 'architecture-ready' },
        open_dsars: 1,
        sars_drafted: 0,
      }),
  },
  basic('gdpr_agent', 'GDPR Agent', 'Compliance', 'Data subject rights and privacy compliance.', 'compliance_screening'),
  basic('aml_agent', 'AML Agent', 'Compliance', 'Anti-money-laundering screening and SAR drafting.', 'compliance_screening'),
  basic('kyc_agent', 'KYC Agent', 'Compliance', 'Identity verification and due-diligence management.', 'compliance_screening'),
  basic('regulatory_agent', 'Regulatory Agent', 'Compliance', 'Regulatory change monitoring across UK/EU/DRC.'),

  // ── Security (Blueprint §5.4 + registry) ──
  {
    type: 'fraud_detection_agent',
    name: 'Fraud Detection Agent',
    category: 'Security',
    description: 'Real-time multi-layer ML fraud scoring on every payment flow.',
    acuAction: 'fraud_score',
    simulate: (input) => {
      const amount = Number((input as { amount?: number }).amount ?? 100);
      const score = Math.min(96, Math.round((amount > 10_000 ? 55 : 12) + Math.random() * 18));
      return out('Transaction scored.', {
        fraud_score: score,
        decision: score > 70 ? 'block' : score > 40 ? 'flag' : 'approve',
        signals: ['device_trust: high', 'velocity: normal', 'geo: coherent'],
      });
    },
  },
  basic('threat_hunter_agent', 'Threat Hunter Agent', 'Security', 'Proactive threat identification and cyber intelligence.'),
  basic('soc_agent', 'SOC Agent', 'Security', 'Security operations monitoring and response.'),
  basic('vulnerability_agent', 'Vulnerability Agent', 'Security', 'Continuous code and infrastructure vulnerability scanning.'),
  basic('identity_agent', 'Identity Agent', 'Security', 'Identity anomaly detection and access-control enforcement.'),

  // ── Revenue (Blueprint §5.5 + registry) ──
  {
    type: 'revenue_agent',
    name: 'Revenue Agent',
    category: 'Revenue',
    description: 'Pricing optimisation, upsell identification and churn prevention.',
    acuAction: 'agent_with_tools',
    simulate: () =>
      out('Commercial scan complete.', {
        upsell_candidates: 4,
        churn_interventions_queued: 2,
        nrr_projection: '114%',
      }),
  },
  basic('pricing_agent', 'Pricing Agent', 'Revenue', 'Dynamic pricing and margin optimisation.'),
  basic('monetisation_agent', 'Monetisation Agent', 'Revenue', 'New revenue stream discovery and modelling.'),
  basic('sales_agent', 'Sales Agent', 'Revenue', 'Pipeline management and deal acceleration.'),

  // ── Customer (Blueprint §5.6 + registry) ──
  {
    type: 'support_agent',
    name: 'Support Agent',
    category: 'Customer',
    description: 'First-line autonomous support resolving 70–85% of queries.',
    acuAction: 'agent_standard',
    simulate: (input) =>
      out('Query resolved.', {
        resolution: 'Answered from knowledge base with account context.',
        escalated: false,
        csat_survey_sent: true,
        input_echo: input,
      }),
  },
  basic('success_agent', 'Success Agent', 'Customer', 'Proactive customer health monitoring and intervention.'),
  basic('retention_agent', 'Retention Agent', 'Customer', 'Churn prevention and win-back campaign execution.'),

  // ── Product (registry) ──
  basic('product_architect_agent', 'Product Architect Agent', 'Product', 'Feature gap analysis and roadmap intelligence.'),
  basic('ux_agent', 'UX Agent', 'Product', 'User journey analysis and conversion optimisation.'),
  basic('journey_agent', 'Journey Agent', 'Product', 'End-to-end customer journey mapping.'),
  basic('feature_agent', 'Feature Agent', 'Product', 'Feature prioritisation by usage and revenue impact.'),

  // ── Engineering (registry) ──
  basic('frontend_agent', 'Frontend Agent', 'Engineering', 'UI performance monitoring and component quality.'),
  basic('backend_agent', 'Backend Agent', 'Engineering', 'API performance, error tracking and service health.'),
  basic('infrastructure_agent', 'Infrastructure Agent', 'Engineering', 'Cloud resource optimisation and cost management.'),
  basic('database_agent', 'Database Agent', 'Engineering', 'Query performance, schema optimisation, data integrity.'),
  basic('api_agent', 'API Agent', 'Engineering', 'Integration health monitoring and documentation upkeep.'),

  // ── Quality (registry) ──
  basic('qa_agent', 'QA Agent', 'Quality', 'Automated regression testing and quality gates.'),
  basic('testing_agent', 'Testing Agent', 'Quality', 'Test generation and coverage analysis.'),
  basic('performance_agent', 'Performance Agent', 'Quality', 'Load testing, latency monitoring, capacity planning.'),

  // ── Operations (registry) ──
  basic('workflow_automation_agent', 'Workflow Automation Agent', 'Operations', 'Cross-platform workflow design and execution.'),
  basic('operations_agent', 'Operations Agent', 'Operations', 'Process efficiency monitoring and bottleneck resolution.'),

  // ── Intelligence (registry §5.7) ──
  basic('data_intelligence_agent', 'Data Intelligence Agent', 'Intelligence', 'Cross-platform data synthesis and insights.', 'report_generation'),
  basic('research_agent', 'Research Agent', 'Intelligence', 'Market, competitor and industry intelligence.', 'agent_with_tools'),
  {
    type: 'predictive_growth_agent',
    name: 'Predictive Growth Agent',
    category: 'Intelligence',
    description: 'Growth opportunity and market-expansion intelligence.',
    acuAction: 'predictive_forecast',
    simulate: () =>
      out('Growth vectors identified.', {
        opportunities: [
          { vector: 'Kenya M-Pesa corridor', confidence: 0.81, revenue_potential_gbp: 240_000 },
          { vector: 'UK accountancy white-label', confidence: 0.74, revenue_potential_gbp: 150_000 },
        ],
      }),
  },
  basic('knowledge_agent', 'Knowledge Agent', 'Intelligence', 'Organisational knowledge capture and lesson surfacing.'),

  // ── Infrastructure / self-healing (Blueprint §17) ──
  {
    type: 'system_health_agent',
    name: 'System Health Agent',
    category: 'Infrastructure',
    description: 'Platform uptime, latency and error-rate monitoring with auto-actions.',
    acuAction: 'agent_standard',
    simulate: () =>
      out('Health probe sweep complete.', {
        services_green: 23,
        services_amber: 1,
        services_red: 0,
        p95_latency_ms: 184,
        actions_taken: ['scaled payment-service +1 replica (queue depth)'],
      }),
  },
  basic('bug_detection_agent', 'Bug Detection Agent', 'Infrastructure', 'Continuous defect and regression identification.'),
  basic('auto_repair_agent', 'Auto-Repair Agent', 'Infrastructure', 'Autonomous service patching and redeployment.'),
  basic('infra_optimisation_agent', 'Infra Optimisation Agent', 'Infrastructure', 'Compute, storage and cloud-cost optimisation.'),
  basic('release_agent', 'Release Agent', 'Infrastructure', 'Deployment, canary testing and rollback management.'),

  // ── Governance (registry + §17.6) ──
  basic('ai_governance_agent', 'AI Governance Agent', 'Governance', 'AI behaviour policy enforcement and audit.'),

  // ── Payment (registry + §7) ──
  {
    type: 'payment_agent',
    name: 'Payment Agent',
    category: 'Payment',
    description: 'Transaction routing, settlement and reconciliation.',
    acuAction: 'agent_with_tools',
    simulate: () =>
      out('Settlement reconciliation complete.', {
        reconciled: 412,
        unmatched: 2,
        next_settlement: 'T+1 batch — 18:00 UTC',
      }),
  },
  {
    type: 'bitripay_agent',
    name: 'BitriPay Agent',
    category: 'Payment',
    description: 'BitriPay gateway health and African payment-rail management.',
    acuAction: 'agent_standard',
    simulate: () =>
      out('Rail health verified.', {
        rails: { mpesa: 'up', airtel_money: 'up', orange_money: 'up', africell: 'degraded', cdf_wallet: 'up' },
        action: 'Africell circuit half-open — retry window 5m',
      }),
  },

  // ── Domain agents (Domain Coverage §4.1–4.10) ──
  {
    type: 'governance_agent',
    name: 'Governance Agent',
    category: 'Domain — PMO/EPM',
    description: 'Portfolio prioritisation, stage-gate review packs, alignment drift detection (§4.1).',
    acuAction: 'board_pack',
    simulate: () =>
      out('Gate review pack assembled.', {
        gate: 'Gate 3 — Execution',
        recommendation: 'GO (conditional)',
        conditions: ['Close R-204 mitigation before month end'],
        portfolio_alignment_pct: 87,
      }),
  },
  {
    type: 'planning_agent',
    name: 'Planning Agent',
    category: 'Domain — Planning',
    description: 'CPM recalculation, recovery schedules, resource levelling (§4.2).',
    acuAction: 'monte_carlo',
    simulate: () =>
      out('Schedule risk simulation complete (10,000 iterations).', {
        p50_finish: '2026-11-14',
        p80_finish: '2026-12-02',
        critical_tasks: ['WBS 1.3.2 Data migration', 'WBS 2.1.1 Gateway certification'],
        recovery_options: ['Fast-track testing (+£12k, −9 days)', 'Add 2 engineers (+£18k, −14 days)'],
      }),
  },
  {
    type: 'cost_finance_agent',
    name: 'Cost & Finance Agent',
    category: 'Domain — Cost Control',
    description: 'EVM calculation, EAC forecasting, cashflow pinch-point alerts (§4.3).',
    acuAction: 'predictive_forecast',
    simulate: () =>
      out('EVM refresh complete.', {
        cpi: 0.94,
        spi: 0.91,
        eac_gbp: 1_276_000,
        vac_gbp: -76_000,
        alert: 'CPI below 0.95 threshold — recovery feasibility assessment attached',
      }),
  },
  {
    type: 'risk_change_agent',
    name: 'Risk & Change Agent',
    category: 'Domain — Risk',
    description: 'Proactive risk identification and change-request impact analysis (§4.5).',
    acuAction: 'monte_carlo',
    simulate: () =>
      out('Risk scan complete.', {
        new_risks_suggested: 2,
        emv_total_gbp: 184_000,
        contingency_adequacy: 'P72 — below P80 target',
      }),
  },
  {
    type: 'document_agent',
    name: 'Document Agent',
    category: 'Domain — Documents',
    description: 'Auto-classification, semantic search, meeting transcription (§4.6).',
    acuAction: 'document_page',
    simulate: (input) =>
      out('Document processed.', {
        classification: 'Contract — Professional Services',
        extracted: { milestones: 4, payment_dates: 3, sla_clauses: 6, renewal_trigger: '2027-03-31' },
        input_echo: input,
      }),
  },
  {
    type: 'esg_agent',
    name: 'ESG Agent',
    category: 'Domain — ESG',
    description: 'Emission calculations, framework mapping, regulatory deadlines (§4.7).',
    acuAction: 'esg_report',
    simulate: () =>
      out('GHG inventory updated.', {
        scope1_tco2e: 128.4,
        scope2_tco2e: 342.9,
        scope3_tco2e: 1_204.6,
        frameworks_ready: ['TCFD', 'CSRD/ESRS', 'GRI'],
        next_deadline: 'CDP submission — 2026-07-28',
      }),
  },
  {
    type: 'asset_maintenance_agent',
    name: 'Asset & Maintenance Agent',
    category: 'Domain — Assets',
    description: 'Predictive maintenance triggers, IoT anomaly detection, lifecycle cost (§4.8).',
    acuAction: 'predictive_maintenance',
    simulate: () =>
      out('Fleet condition analysed.', {
        assets_analysed: 42,
        predicted_failures_30d: 1,
        work_orders_raised: 3,
        energy_anomalies: ['HVAC-7 running outside schedule — est. £240/mo waste'],
      }),
  },
  {
    type: 'procurement_agent',
    name: 'Procurement Agent',
    category: 'Domain — Procurement',
    description: 'PQ review, bid-evaluation consistency, maverick-spend alerts (§4.9).',
    acuAction: 'supplier_pq_review',
    simulate: () =>
      out('Vendor intelligence refreshed.', {
        pq_reviews_completed: 2,
        maverick_spend_flagged_gbp: 8_420,
        consolidation_opportunity: 'Merge 3 stationery vendors — est. saving £6.2k/yr',
      }),
  },
  {
    type: 'product_delivery_agent',
    name: 'Product & Delivery Agent',
    category: 'Domain — Product',
    description: 'Backlog grooming, story writing, stand-up summaries, DORA metrics (§4.10).',
    acuAction: 'user_story',
    simulate: () =>
      out('Sprint intelligence generated.', {
        standup_summary: 'Velocity on track (38/42 pts). 1 story blocked on API dependency.',
        dora: { deploy_freq: '4.2/wk', lead_time_hours: 26, change_fail_pct: 3.1, mttr_minutes: 42 },
        stories_drafted: 3,
      }),
  },
];

export const agentByType = (type: string) =>
  AGENT_REGISTRY.find((a) => a.type === type) ?? null;

export const agentCategories = () =>
  Array.from(new Set(AGENT_REGISTRY.map((a) => a.category)));
