<div align="center">

# VERYX — AI Infrastructure Operating System

**Self-sovereign, production-grade AI-OS for AI-native business operations**

Groupe Nseya Digital · JNN Global Ltd

`80+ AI agents` · `ACU compute billing` · `BitriPay African rails` · `10 domain modules` · `3 command centres`

</div>

---

VERYX is one unified platform built from three specifications:

| Source document | What it contributes |
|---|---|
| **VERYX AI-OS Blueprint v1.0** | Platform vision, 8 user types + RBAC matrix, the AI agent workforce, ACU billing engine, BitriPay gateway, database schema, REST API spec, security & compliance architecture |
| **Domain Coverage §4.1–4.10** | Ten enterprise domain modules (PMO/EPM, Planning, Cost/EVM, Workforce, Risk & Change, Documents, ESG, Assets, Procurement, Product Delivery) on one shared data fabric |
| **Section 23 Dashboard Spec** | Three executive command centres: Super Admin Platform Centre (23A), Business Operations Centre (23B), Project Management Centre (23C) |

Everything runs as **one Next.js 14 full-stack application**: the App Router serves both the REST API (`/api/v1/*`) and the three command-centre UIs, with Prisma as the data layer.

## Quick start

```bash
npm install          # installs deps + generates Prisma client
npm run setup        # creates SQLite db, pushes schema, seeds demo data
npm run dev          # http://localhost:3000
```

Production build: `npm run build && npm start`

### Demo accounts (password: `Veryx!2026`)

| Account | Role | Lands on |
|---|---|---|
| `admin@veryx.io` | Super Admin | `/admin` — Platform Command Centre |
| `owner@nseya-digital.com` | Business Owner | `/business` — Business Operations Centre |
| `pm@nseya-digital.com` | Programme Director | `/projects` — Project Command Centre |

The seed also creates an enterprise admin, developer, merchant and two further tenants
(Kinshasa Logistics SARL, London FinTech Partners) so the Super Admin views show a real
multi-tenant economy: 318 transactions across 35 days, ACU purchase/burn ledger, agent
execution history, threats, recommendations, projects with live EVM, and a
hash-chained audit trail.

## The three command centres (Section 23)

**Super Admin Platform Centre — `/admin`** (§23A)
Command Center KPIs (revenue today/MTD/lifetime, ACUs sold/consumed, AI cost, gross margin),
revenue-vs-cost trend, ACU burn gauge, top tenants, AI recommendation queue ·
System Performance · AI Engine control (model split, engine mode toggles, fallback log) ·
ACU Economy (margin control, pricing governance) · Tenants & Users governance ·
System Threats & Leaks with Act-Now pathways · System Control (feature flags, deployments,
connector health) · Predictive Intelligence (30/60/90-day forecasts with confidence) ·
immutable Audit & Governance layer.

**Business Operations Centre — `/business`** (§23B)
Executive Command Center (8 KPI tiles, business health score, risk summary, team capacity) ·
Performance analytics · Operations workflow command with per-card metrics & pause/optimise/scale
actions · **AI Workforce** — browse and execute all registered agents live · Usage Economy
(value funnel, budget controls, ACU top-up) · Payments (multi-currency wallets, BitriPay rail
status, simulated sandbox payments, fraud-scored transaction monitor) · Team & Access ·
Risk & Alerts + enterprise risk register · the ten Domain Modules · Reports · Integrations ·
What-Happens-Next predictive centre.

**Project Management Centre — `/projects`** (§23C)
Per-project control tower: project header with phase/status, eight EVM KPIs
(Budget vs Actual, EV, CPI, SPI, utilisation), S-curve (planned/actual/AI forecast),
cost performance + budget waterfall, work-package delivery control, risk register with EMV,
active issues, project threat cards, predictive intelligence (delay risk, overrun likelihood,
resource gap, acceleration opportunity) and the governance document register.

## The AI agent workforce (Blueprint §5)

The full registry ships in [`lib/agents/registry.ts`](lib/agents/registry.ts) — executive tier
(CEO/CFO/COO/CTO/CMO/CRO), onboarding, compliance (GDPR/AML/KYC/Regulatory), security
(Fraud/Threat-Hunter/SOC/Vulnerability/Identity), revenue, customer, product, engineering,
quality, operations, intelligence, self-healing infrastructure (Blueprint §17), governance,
payments (Payment/BitriPay) **plus the nine cross-domain agents** (Governance, Planning,
Cost & Finance, Risk & Change, Document, ESG, Asset & Maintenance, Procurement,
Product & Delivery).

Execution pipeline (Blueprint §9.5): route → **bill ACU on queue** → execute → persist trace →
audit. Agents run in deterministic simulation mode out of the box; set `ANTHROPIC_API_KEY` in
`.env` and reasoning is delegated to a live LLM with graceful fallback.

## ACU billing engine (Blueprint §12.2)

Every agent execution debits the tenant's ACU balance atomically with a ledger entry —
the spec's cost table is implemented verbatim (1 ACU standard execution, 5 with tools,
25 chains, 15 Monte Carlo, 50 ESG report …), as are the five purchase tiers
(500 → 200,000 units with volume discounts). `402 ERR_ACU_INSUFFICIENT` is returned when
a tenant's balance can't cover an execution.

## BitriPay gateway (Blueprint §7)

`lib/bitripay.ts` implements the dedicated gateway service: sandbox/production modes,
channel fee model (0.5% + CDF 250 domestic wallet, 1% + CDF 100 mobile money, 1.5% + $0.30
cross-border), idempotent payment initiation, real-time fraud scoring on every transaction,
and **HMAC-SHA256 signed webhooks** verified via `X-BitriPay-Signature` with
timing-safe comparison (`POST /api/v1/webhooks/bitripay`).

## REST API (Blueprint §11)

Envelope: `{ success, data, error: {code,message}, request_id, timestamp }` · Bearer JWT
(15-min access / 30-day rotating refresh) · spec error codes incl. `ERR_ACU_INSUFFICIENT`,
`ERR_ACCOUNT_LOCKED` (5-failure lockout), `ERR_DUPLICATE_KEY` (idempotency).

```
POST /api/v1/auth/register | login | refresh | logout
GET  /api/v1/users/me · PATCH /api/v1/users/me · GET /api/v1/tenants/me
GET  /api/v1/agents · POST /api/v1/agents/{type}/execute
GET  /api/v1/agents/executions · GET /api/v1/agents/executions/{id}
POST /api/v1/payments/initiate · GET /api/v1/payments/{id} · POST /api/v1/payments/{id}/refund
POST /api/v1/payments/links · GET /api/v1/payments/links
GET  /api/v1/acu · POST /api/v1/acu/purchase
POST /api/v1/webhooks/bitripay            (HMAC-verified)
GET  /api/v1/recommendations · PATCH /api/v1/recommendations/{id}
GET  /api/v1/threats · PATCH /api/v1/threats/{id}
GET  /api/v1/workflows · PATCH /api/v1/workflows/{id}   (pause/resume/optimise/scale)
GET  /api/v1/projects · GET /api/v1/projects/{id}
GET  /api/v1/admin/overview · GET /api/v1/business/overview
GET  /api/v1/audit                         (hash-chain verified)
GET  /api/v1/health
```

## Security (Blueprint §13/§18)

bcrypt cost 12 · JWT HS256 with issuer claim and refresh rotation · account lockout after
5 failed logins · RBAC matrix (§3.2) enforced at API **and** page level — no client-side
permission filtering (§23 security rules) · token-bucket rate limiting on auth endpoints ·
Zod validation on every body · idempotency keys on payments · append-only **SHA-256
hash-chained audit log** with integrity verification endpoint · webhook signature
verification with replay-resistant timing-safe compare.

## Architecture

```
veryx/
├── app/
│   ├── api/v1/…            REST API route handlers (Blueprint §11)
│   ├── admin/…             §23A Super Admin Platform Command Centre (9 screens)
│   ├── business/…          §23B Business Operations Command Centre (12 screens)
│   ├── projects/…          §23C Project Management Command Centre
│   ├── login/              JWT session sign-in with demo role quick-select
│   └── page.tsx            Landing page
├── components/             Shell, KPI tiles, insight/threat cards, recharts, client actions
├── lib/
│   ├── agents/             Agent registry + execution engine (ACU-billed, audited)
│   ├── acu.ts              ACU billing engine + purchase tiers
│   ├── bitripay.ts         BitriPay gateway service + HMAC webhooks
│   ├── auth.ts / rbac.ts   JWT sessions + Blueprint §3.2 RBAC matrix
│   ├── audit.ts            Hash-chained immutable audit trail
│   └── api.ts              Spec envelope, error codes, rate limiting, Zod parsing
└── prisma/
    ├── schema.prisma       Unified data model (Blueprint §10 + Domain Coverage entities)
    └── seed.ts             Full demo economy seed
```

**Stack**: Next.js 14 (App Router) · TypeScript strict · Prisma · Tailwind (VERYX navy/gold
design tokens) · Recharts · Zod · jose · bcryptjs.

**Database**: SQLite by default for zero-config local running. The Blueprint's production
target is PostgreSQL 16 — switch `provider` in `prisma/schema.prisma` and point
`DATABASE_URL` at your cluster. Docker users: `docker compose up` starts the app with a
persisted volume.

## Spec-to-code map

| Spec section | Implementation |
|---|---|
| Blueprint §3.2 RBAC matrix | `lib/rbac.ts` |
| Blueprint §5 agents + Domain agents | `lib/agents/registry.ts` |
| Blueprint §6.10 audit trail | `lib/audit.ts` (+ `/admin/audit`) |
| Blueprint §7 BitriPay | `lib/bitripay.ts`, `/business/payments`, webhook route |
| Blueprint §10 schema | `prisma/schema.prisma` |
| Blueprint §11 API | `app/api/v1/**` |
| Blueprint §12 monetisation | `lib/acu.ts`, plans in seed, landing pricing |
| Domain §4.1–4.10 | Prisma entities + `/business/domains` + project control tower |
| Dashboard §23A | `app/admin/**` |
| Dashboard §23B | `app/business/**` |
| Dashboard §23C | `app/projects/**` |

---

© Groupe Nseya Digital | JNN Global Ltd. Confidential — investor & developer grade.
