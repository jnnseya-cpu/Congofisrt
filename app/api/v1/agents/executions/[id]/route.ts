import { db } from '@/lib/db';
import { ok, err, handleError, requireSession } from '@/lib/api';

/** GET /api/v1/agents/executions/{id} — full execution trace incl. output. */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSession(req);
    if ('response' in auth) return auth.response;
    const execution = await db.agentExecution.findUnique({ where: { id: params.id } });
    if (!execution) return err('ERR_NOT_FOUND', 'Requested resource does not exist');
    if (auth.session.role !== 'super_admin' && execution.tenantId !== auth.session.tenantId) {
      return err('ERR_FORBIDDEN', 'Authenticated user lacks required permission');
    }
    return ok({
      execution: {
        id: execution.id,
        agent_type: execution.agentType,
        status: execution.status,
        input: JSON.parse(execution.inputPayload),
        output: execution.outputPayload ? JSON.parse(execution.outputPayload) : null,
        acu_consumed: execution.acuConsumed,
        model_used: execution.modelUsed,
        duration_ms: execution.durationMs,
        error_message: execution.errorMessage,
        trace_id: execution.traceId,
        created_at: execution.createdAt,
        completed_at: execution.completedAt,
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
