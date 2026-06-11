import { db } from '@/lib/db';
import { ok, handleError, requireSession } from '@/lib/api';
import { acuEconomyStats } from '@/lib/acu';

/** GET /api/v1/admin/overview — Super Admin Command Center data (§23A.3/23A.5). */
export async function GET(req: Request) {
  try {
    const auth = await requireSession(req, ['super_admin']);
    if ('response' in auth) return auth.response;

    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [
      revenueToday,
      revenueMtd,
      revenueLifetime,
      activeTenants,
      activeUsers,
      acuSoldToday,
      acuConsumedToday,
      executionsToday,
      tenants,
      economy,
    ] = await Promise.all([
      db.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'payment', status: 'completed', createdAt: { gte: dayStart } },
      }),
      db.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'payment', status: 'completed', createdAt: { gte: monthStart } },
      }),
      db.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'payment', status: 'completed' },
      }),
      db.tenant.count({ where: { deletedAt: null } }),
      db.user.count({ where: { status: 'active', deletedAt: null } }),
      db.acuLedgerEntry.aggregate({
        _sum: { delta: true },
        where: { delta: { gt: 0 }, createdAt: { gte: dayStart } },
      }),
      db.acuLedgerEntry.aggregate({
        _sum: { delta: true },
        where: { delta: { lt: 0 }, createdAt: { gte: dayStart } },
      }),
      db.agentExecution.count({ where: { createdAt: { gte: dayStart } } }),
      db.tenant.findMany({
        where: { deletedAt: null },
        orderBy: { acuBalance: 'desc' },
        take: 5,
        select: { id: true, name: true, tier: true, acuBalance: true, healthScore: true },
      }),
      acuEconomyStats(),
    ]);

    const today = revenueToday._sum.amount ?? 0;
    const consumedToday = Math.abs(acuConsumedToday._sum.delta ?? 0);
    const aiCostToday = consumedToday * 0.011;
    const grossMarginToday = today > 0 ? ((today - aiCostToday) / today) * 100 : 0;

    return ok({
      kpis: {
        revenue_today_gbp: today,
        revenue_mtd_gbp: revenueMtd._sum.amount ?? 0,
        revenue_lifetime_gbp: revenueLifetime._sum.amount ?? 0,
        active_tenants: activeTenants,
        active_users: activeUsers,
        acus_sold_today: acuSoldToday._sum.delta ?? 0,
        acus_consumed_today: consumedToday,
        ai_cost_today_gbp: aiCostToday,
        gross_margin_today_pct: grossMarginToday,
        agent_executions_today: executionsToday,
      },
      top_tenants: tenants,
      acu_economy: economy,
      // Model routing split for the AI Engine screen (§23A.7).
      provider_split: [
        { provider: 'Anthropic Claude', share_pct: 46, cost_per_1k_actions_gbp: 14.2 },
        { provider: 'OpenAI GPT-4o', share_pct: 31, cost_per_1k_actions_gbp: 11.8 },
        { provider: 'Google Gemini', share_pct: 15, cost_per_1k_actions_gbp: 8.4 },
        { provider: 'Vertex AI', share_pct: 8, cost_per_1k_actions_gbp: 6.9 },
      ],
    });
  } catch (e) {
    return handleError(e);
  }
}
