import Link from 'next/link';
import { LiveDot, Pill, Sparkline } from './ui';
import { LogoutButton, UtcClock } from './client';
import { NavLinks, type PlainNavItem } from './NavLinks';

/**
 * Command Centre shell (§23A.1/23A.2/23A.4):
 * persistent top control bar, left navigation sidebar, bottom-left platform
 * status mini-card, and the routed screen content.
 */
export function Shell({
  contextLabel,
  contextTone = 'gold',
  nav,
  userEmail,
  acuRate,
  alertCount,
  children,
}: {
  contextLabel: string;
  contextTone?: 'gold' | 'info';
  nav: PlainNavItem[];
  userEmail: string;
  acuRate?: string;
  alertCount?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left navigation sidebar (§23A.2) */}
      <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col border-r border-veryx-border bg-veryx-panel/90 backdrop-blur">
        <Link href="/" className="flex items-center gap-2 px-5 py-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-400 font-mono text-sm font-bold text-navy-950">
            VX
          </span>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-wide text-white">VERYX</div>
            <div className="text-[10px] uppercase tracking-widest text-veryx-muted">AI-OS</div>
          </div>
        </Link>
        <NavLinks items={nav} />
        {/* Platform status mini card (§23A.4) */}
        <div className="m-3 rounded-xl border border-veryx-border bg-navy-900/70 p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-status-ok">
            <LiveDot tone="ok" /> All Systems Operational
          </div>
          <div className="mt-1.5 flex items-end justify-between">
            <div>
              <div className="font-mono text-sm font-semibold text-white">99.97%</div>
              <div className="text-[10px] text-veryx-muted">30-day uptime · 12d since incident</div>
            </div>
            <Sparkline points={[99.94, 99.97, 99.99, 99.96, 99.98, 99.97, 99.97]} stroke="#22c55e" />
          </div>
        </div>
      </aside>

      <div className="ml-60 flex min-h-screen flex-1 flex-col">
        {/* Global header — top control bar (§23A.1) */}
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-veryx-border bg-veryx-panel/80 px-6 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <Pill tone={contextTone}>{contextLabel}</Pill>
            <span className="flex items-center gap-1.5 text-xs text-status-ok">
              <LiveDot tone="ok" /> Systems Active
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-veryx-muted">
            {typeof alertCount === 'number' && alertCount > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-status-high/20 px-1.5 font-mono text-[11px] font-semibold text-status-high">
                  {alertCount}
                </span>
                alerts
              </span>
            )}
            {acuRate && (
              <span className="font-mono text-gold-300">
                {acuRate} <span className="text-veryx-muted">ACU today</span>
              </span>
            )}
            <UtcClock />
            <span className="hidden text-slate-300 sm:inline">{userEmail}</span>
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 px-6 py-6">{children}</main>
        <footer className="border-t border-veryx-border px-6 py-3 text-[11px] text-veryx-muted">
          VERYX AI Infrastructure Operating System · Groupe Nseya Digital | JNN Global Ltd
        </footer>
      </div>
    </div>
  );
}
