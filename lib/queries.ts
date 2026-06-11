import { db } from './db';

// Shared server-side aggregations used by the command-centre pages.

export function dayStart(offsetDays = 0): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d;
}

export function monthStart(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Daily revenue / AI-cost / margin series for the trend chart. */
export async function revenueSeries(days: number, tenantId?: string) {
  const since = dayStart(-(days - 1));
  const [transactions, ledger] = await Promise.all([
    db.transaction.findMany({
      where: {
        type: 'payment',
        status: 'completed',
        createdAt: { gte: since },
        ...(tenantId ? { tenantId } : {}),
      },
      select: { amount: true, createdAt: true },
    }),
    db.acuLedgerEntry.findMany({
      where: { delta: { lt: 0 }, createdAt: { gte: since }, ...(tenantId ? { tenantId } : {}) },
      select: { delta: true, createdAt: true },
    }),
  ]);
  const series: { day: string; revenue: number; cost: number; margin: number }[] = [];
  for (let i = 0; i < days; i++) {
    const start = dayStart(-(days - 1 - i));
    const end = dayStart(-(days - 2 - i));
    const revenue = transactions
      .filter((t) => t.createdAt >= start && t.createdAt < end)
      .reduce((s, t) => s + t.amount, 0);
    const acu = ledger
      .filter((l) => l.createdAt >= start && l.createdAt < end)
      .reduce((s, l) => s + Math.abs(l.delta), 0);
    const cost = acu * 0.011;
    series.push({
      day: start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      revenue: Math.round(revenue),
      cost: Math.round(cost * 100) / 100,
      margin: Math.round((revenue - cost) * 100) / 100,
    });
  }
  return series;
}

export async function revenueBetween(start: Date, end: Date | null, tenantId?: string) {
  const agg = await db.transaction.aggregate({
    _sum: { amount: true },
    where: {
      type: 'payment',
      status: 'completed',
      createdAt: { gte: start, ...(end ? { lt: end } : {}) },
      ...(tenantId ? { tenantId } : {}),
    },
  });
  return agg._sum.amount ?? 0;
}

export async function acuConsumedSince(start: Date, tenantId?: string) {
  const agg = await db.acuLedgerEntry.aggregate({
    _sum: { delta: true },
    where: { delta: { lt: 0 }, createdAt: { gte: start }, ...(tenantId ? { tenantId } : {}) },
  });
  return Math.abs(agg._sum.delta ?? 0);
}

export async function acuPurchasedSince(start: Date, tenantId?: string) {
  const agg = await db.acuLedgerEntry.aggregate({
    _sum: { delta: true },
    where: { delta: { gt: 0 }, createdAt: { gte: start }, ...(tenantId ? { tenantId } : {}) },
  });
  return agg._sum.delta ?? 0;
}

export async function openThreatCount(scope: string, tenantId?: string | null) {
  return db.threatAlert.count({
    where: { scope, status: 'open', ...(tenantId !== undefined ? { tenantId } : {}) },
  });
}
