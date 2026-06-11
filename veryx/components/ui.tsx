import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

// ── Shared dashboard primitives (Section 23 rendering rules) ─────────────────

export function Card({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('vx-card p-4', className)}>
      {(title || action) && (
        <header className="mb-3 flex items-start justify-between gap-2">
          <div>
            {title && <h3 className="text-sm font-semibold text-white">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-veryx-muted">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

/** Every KPI tile carries a trend indicator (spec: §23 intro). */
export function KpiTile({
  label,
  value,
  trend,
  delta,
  hint,
}: {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'flat';
  delta?: string;
  hint?: string;
}) {
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;
  const trendCls =
    trend === 'up' ? 'text-status-ok' : trend === 'down' ? 'text-status-high' : 'text-veryx-muted';
  return (
    <div className="vx-card flex flex-col gap-1 p-4">
      <span className="vx-label">{label}</span>
      <span className="vx-kpi-value">{value}</span>
      <span className="flex items-center gap-1 text-xs">
        {trend && <TrendIcon className={cn('h-3.5 w-3.5', trendCls)} />}
        {delta && <span className={trendCls}>{delta}</span>}
        {hint && <span className="text-veryx-muted">{hint}</span>}
      </span>
    </div>
  );
}

export function Pill({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'ok' | 'warn' | 'high' | 'info' | 'gold' | 'neutral';
}) {
  const tones: Record<string, string> = {
    ok: 'border-status-ok/40 bg-status-ok/10 text-status-ok',
    warn: 'border-status-warn/40 bg-status-warn/10 text-status-warn',
    high: 'border-status-high/40 bg-status-high/10 text-status-high',
    info: 'border-status-info/40 bg-status-info/10 text-status-info',
    gold: 'border-gold-400/40 bg-gold-400/10 text-gold-300',
    neutral: 'border-veryx-border bg-white/5 text-slate-300',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium',
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

/** 7-day inline sparkline (pure SVG — no client JS needed). */
export function Sparkline({
  points,
  className,
  stroke = '#dfa629',
}: {
  points: number[];
  className?: string;
  stroke?: string;
}) {
  if (points.length < 2) return null;
  const w = 80;
  const h = 24;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / range) * (h - 4) - 2;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn('h-6 w-20', className)} aria-hidden>
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ProgressBar({
  value,
  tone = 'gold',
  className,
}: {
  value: number; // 0–100
  tone?: 'gold' | 'ok' | 'warn' | 'high' | 'info';
  className?: string;
}) {
  const tones: Record<string, string> = {
    gold: 'bg-gold-400',
    ok: 'bg-status-ok',
    warn: 'bg-status-warn',
    high: 'bg-status-high',
    info: 'bg-status-info',
  };
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-white/10', className)}>
      <div
        className={cn('h-full rounded-full transition-all', tones[tone])}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function LiveDot({ tone = 'ok' }: { tone?: 'ok' | 'warn' | 'high' }) {
  const tones = { ok: 'bg-status-ok', warn: 'bg-status-warn', high: 'bg-status-high' };
  return <span className={cn('inline-block h-2 w-2 animate-pulseDot rounded-full', tones[tone])} />;
}
