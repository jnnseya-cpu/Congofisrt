import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtGbp(value: number, compact = false): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value);
}

export function fmtNum(value: number, compact = false): string {
  return new Intl.NumberFormat('en-GB', {
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value);
}

export function fmtPct(value: number, dp = 1): string {
  return `${value.toFixed(dp)}%`;
}

export const severityColor = (severity: string) =>
  ({
    HIGH: 'text-status-high border-status-high/40 bg-status-high/10',
    high: 'text-status-high border-status-high/40 bg-status-high/10',
    MEDIUM: 'text-status-warn border-status-warn/40 bg-status-warn/10',
    medium: 'text-status-warn border-status-warn/40 bg-status-warn/10',
    LOW: 'text-status-info border-status-info/40 bg-status-info/10',
    low: 'text-status-info border-status-info/40 bg-status-info/10',
    info: 'text-veryx-muted border-veryx-border bg-white/5',
  })[severity] ?? 'text-veryx-muted border-veryx-border bg-white/5';

export const ragColor = (rag: string) =>
  ({
    green: 'bg-status-ok',
    amber: 'bg-status-warn',
    red: 'bg-status-high',
    on_track: 'bg-status-ok',
    at_risk: 'bg-status-warn',
    delayed: 'bg-status-high',
    critical: 'bg-status-high',
  })[rag] ?? 'bg-veryx-muted';
