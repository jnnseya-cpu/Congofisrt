import { db } from '@/lib/db';
import { ok, err, handleError, requireSession } from '@/lib/api';

/** GET /api/v1/agents/executions — execution history (filters: agent_type, status). */
export async function GET(req: Request) {
  try {
    const auth = await requireSession(req);
    if ('response' in auth) return auth.response;
    if (!auth.session.tenantId && auth.session.role !== 'super_admin') {
      return err('ERR_FORBIDDEN', 'Tenant context required');
    }
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
    const limit = Math.min(100, Number(url.searchParams.get('limit') ?? 20));
    const where = {
      ...(auth.session.role === 'super_admin' ? {} : { tenantId: auth.session.tenantId! }),
      ...(url.searchParams.get('agent_type') ? { agentType: url.searchParams.get('agent_type')! } : {}),
      ...(url.searchParams.get('status') ? { status: url.searchParams.get('status')! } : {}),
    };
    const [executions, total] = await Promise.all([
      db.agentExecution.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.agentExecution.count({ where }),
    ]);
    return ok({
      executions: executions.map((e) => ({
        id: e.id,
        agent_type: e.agentType,
        trigger_type: e.triggerType,
        status: e.status,
        acu_consumed: e.acuConsumed,
        model_used: e.modelUsed,
        duration_ms: e.durationMs,
        created_at: e.createdAt,
      })),
      total,
      page,
      limit,
    });
  } catch (e) {
    return handleError(e);
  }
}
