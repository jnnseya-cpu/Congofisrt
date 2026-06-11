import { db } from '@/lib/db';
import { ok, err, handleError, requireSession } from '@/lib/api';

/** GET /api/v1/business/overview — Business Operations Command Center data (§23B.1). */
export async function GET(req: Request) {
  try {
    const auth = await requireSession(req);
    if ('response' in auth) return auth.response;
    if (!auth.session.tenantId) return err('ERR_FORBIDDEN', 'Tenant context required');
    const tenantId = auth.session.tenantId;

    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [revToday, revMonth, revLifetime, tenant, workflows, executions, teamCount, openThreats] =
      await Promise.all([
        db.transaction.aggregate({
          _sum: { amount: true },
          where: { tenantId, type: 'payment', status: 'completed', createdAt: { gte: dayStart } },
        }),
        db.transaction.aggregate({
          _sum: { amount: true },
          where: { tenantId, type: 'payment', status: 'completed', createdAt: { gte: monthStart } },
        }),
        db.transaction.aggregate({
          _sum: { amount: true },
          where: { tenantId, type: 'payment', status: 'completed' },
        }),
        db.tenant.findUniqueOrThrow({ where: { id: tenantId } }),
        db.workflow.findMany({ where: { tenantId } }),
        db.agentExecution.count({ where: { tenantId, createdAt: { gte: dayStart } } }),
        db.user.count({ where: { tenantId, status: 'active' } }),
        db.threatAlert.count({ where: { tenantId, scope: 'business', status: 'open' } }),
      ]);

    const active = workflows.filter((w) => w.status === 'running').length;
    const avgAutomation =
      workflows.length > 0
        ? workflows.reduce((s, w) => s + w.automationRate, 0) / workflows.length
        : 0;
    const opSpend = workflows.reduce((s, w) => s + w.costToday, 0);
    const monthRevenue = revMonth._sum.amount ?? 0;
    const margin = monthRevenue > 0 ? ((monthRevenue - opSpend * 30) / monthRevenue) * 100 : 0;

    return ok({
      kpis: {
        revenue_today_gbp: revToday._sum.amount ?? 0,
        revenue_month_gbp: monthRevenue,
        revenue_lifetime_gbp: revLifetime._sum.amount ?? 0,
        operational_spend_gbp: opSpend,
        profit_margin_pct: Math.max(0, Math.min(95, margin)),
        ai_automation_rate_pct: avgAutomation,
        workflows_active: active,
        pending_approvals: openThreats,
        agent_executions_today: executions,
        team_active: teamCount,
        acu_balance: tenant.acuBalance,
        health_score: tenant.healthScore,
      },
      workflows,
    });
  } catch (e) {
    return handleError(e);
  }
}
