import Link from 'next/link';
import { AGENT_REGISTRY } from '@/lib/agents/registry';
import { Pill } from '@/components/ui';
import {
  Bot,
  CircuitBoard,
  Coins,
  Globe2,
  LayoutDashboard,
  Lock,
  ShieldCheck,
  Workflow,
} from 'lucide-react';

const MODULES = [
  ['4.1', 'Governance & Control (PMO/EPM)', 'Portfolio prioritisation, NPV/IRR appraisal, stage-gate governance'],
  ['4.2', 'Planning & Scheduling', 'Gantt, CPM/PERT, baselines, Monte Carlo schedule risk'],
  ['4.3', 'Cost & Financial Control', 'ANSI/EIA-748 EVM, cashflow, multi-currency, ERP/GL sync'],
  ['4.4', 'Resource & Workforce', 'Skills matrices, capacity, timesheets, certifications, visas'],
  ['4.5', 'Risk, Issue & Change', 'Quantitative registers, Monte Carlo cost risk, CCB workflow'],
  ['4.6', 'Document & Collaboration', 'DMS, transmittals, RFIs, AI meeting minutes, mobile'],
  ['4.7', 'Sustainability & ESG', 'Scope 1/2/3 carbon, TCFD/CSRD/GRI reporting, incidents'],
  ['4.8', 'Operations & Assets', 'Asset registers, predictive maintenance, work orders, SLAs'],
  ['4.9', 'Procurement & Vendors', 'PQ, RFx, bid evaluation, supplier scoring, spend analytics'],
  ['4.10', 'Product & Delivery', 'Roadmaps, backlogs, agile boards, CI/CD, test management'],
] as const;

const TIERS = [
  { name: 'Starter', price: '£49', users: '3 users', agents: '5 agents', acu: '500 ACU/mo' },
  { name: 'Growth', price: '£149', users: '10 users', agents: '20 agents', acu: '2,000 ACU/mo' },
  { name: 'Pro', price: '£399', users: '50 users', agents: '50 agents', acu: '8,000 ACU/mo' },
  { name: 'Enterprise', price: '£1,200', users: 'Unlimited', agents: '80+ agents', acu: '30,000 ACU/mo' },
] as const;

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <header className="flex items-center justify-between py-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-400 font-mono text-sm font-bold text-navy-950">
            VX
          </span>
          <div className="leading-tight">
            <div className="text-base font-bold tracking-wide text-white">VERYX</div>
            <div className="text-[10px] uppercase tracking-widest text-veryx-muted">
              AI Infrastructure OS
            </div>
          </div>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/api/v1/health" className="vx-btn">
            API status
          </Link>
          <Link href="/login" className="vx-btn-primary">
            Open Command Centre
          </Link>
        </nav>
      </header>

      <section className="py-16 text-center">
        <Pill tone="gold">Groupe Nseya Digital · JNN Global Ltd</Pill>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight text-white md:text-5xl">
          The operating system for{' '}
          <span className="bg-gradient-to-r from-gold-300 to-gold-500 bg-clip-text text-transparent">
            AI-native business operations
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-300">
          VERYX is a self-sovereign AI Infrastructure Operating System: an autonomous AI workforce
          of {AGENT_REGISTRY.length}+ coordinated agents, proprietary ACU compute billing, BitriPay
          African payment rails, ten unified enterprise domain modules and three executive command
          centres — one platform, one data fabric, one audit trail.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/login" className="vx-btn-primary !px-5 !py-2.5 !text-sm">
            Launch the demo environment
          </Link>
          <a href="#modules" className="vx-btn !px-5 !py-2.5 !text-sm">
            Explore the platform
          </a>
        </div>
      </section>

      <section className="grid gap-4 py-10 md:grid-cols-4">
        {[
          { icon: Bot, k: `${AGENT_REGISTRY.length}+`, v: 'Coordinated AI agents' },
          { icon: Coins, k: 'ACU', v: 'Usage-based compute billing' },
          { icon: Globe2, k: 'BitriPay', v: 'M-Pesa · Airtel · Orange · CDF' },
          { icon: ShieldCheck, k: '5×', v: 'GDPR · FCA · BCC · PCI · AML6' },
        ].map(({ icon: Icon, k, v }) => (
          <div key={v} className="vx-card flex items-center gap-3 p-4">
            <Icon className="h-7 w-7 text-gold-300" />
            <div>
              <div className="font-mono text-lg font-bold text-white">{k}</div>
              <div className="text-xs text-veryx-muted">{v}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="py-10">
        <h2 className="text-center text-2xl font-bold text-white">Three Command Centres</h2>
        <p className="mt-2 text-center text-sm text-veryx-muted">
          Section 23 — every screen read-write, every KPI with trend, every risk with an Act-Now pathway.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: CircuitBoard,
              t: 'Super Admin Platform Centre',
              d: 'Revenue control, AI cost governance, ACU economy, tenant oversight, threat detection and predictive platform intelligence.',
              href: '/admin',
            },
            {
              icon: LayoutDashboard,
              t: 'Business Operations Centre',
              d: 'ERP control tower: workflows, usage economy, team governance, risk command and 30/60/90-day forecasting.',
              href: '/business',
            },
            {
              icon: Workflow,
              t: 'Project Management Centre',
              d: 'Single-project control tower: EVM, S-curves, work packages, risk registers and delivery accountability.',
              href: '/projects',
            },
          ].map(({ icon: Icon, t, d, href }) => (
            <Link key={t} href={href} className="vx-card group p-5 transition hover:shadow-glow">
              <Icon className="h-6 w-6 text-gold-300" />
              <h3 className="mt-3 text-sm font-semibold text-white group-hover:text-gold-200">{t}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">{d}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="modules" className="py-10">
        <h2 className="text-center text-2xl font-bold text-white">
          Ten domain modules · one unified OS
        </h2>
        <p className="mt-2 text-center text-sm text-veryx-muted">
          Sections 4.1–4.10 — a common data fabric, agent orchestration layer and ACU billing rail.
        </p>
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {MODULES.map(([code, name, desc]) => (
            <div key={code} className="vx-card flex items-start gap-3 p-4">
              <span className="rounded-md bg-gold-400/15 px-2 py-1 font-mono text-xs font-bold text-gold-300">
                {code}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-white">{name}</h3>
                <p className="mt-1 text-xs text-slate-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-10">
        <h2 className="text-center text-2xl font-bold text-white">Subscription tiers</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {TIERS.map((t) => (
            <div key={t.name} className="vx-card p-5 text-center">
              <h3 className="text-sm font-semibold text-gold-300">{t.name}</h3>
              <div className="mt-2 font-mono text-3xl font-bold text-white">{t.price}</div>
              <div className="text-[11px] text-veryx-muted">per month</div>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
                <li>{t.users}</li>
                <li>{t.agents}</li>
                <li>{t.acu}</li>
                <li>BitriPay included</li>
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="flex items-center justify-between border-t border-veryx-border py-8 text-xs text-veryx-muted">
        <span className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5" /> Zero Trust · AES-256 · hash-chained audit
        </span>
        <span>VERYX v1.0 · Groupe Nseya Digital | JNN Global Ltd</span>
      </footer>
    </div>
  );
}
