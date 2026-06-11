import { z } from 'zod';
import { ok, err, parseBody, handleError, requireSession } from '@/lib/api';
import { canWrite } from '@/lib/rbac';
import { agentByType } from '@/lib/agents/registry';
import { executeAgent, InsufficientAcuError } from '@/lib/agents/engine';

const schema = z.object({
  input: z.record(z.unknown()).default({}),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
});

/** POST /api/v1/agents/{agentType}/execute — run an agent; ACU deducted on queue. */
export async function POST(req: Request, { params }: { params: { agentType: string } }) {
  try {
    const auth = await requireSession(req);
    if ('response' in auth) return auth.response;
    if (!canWrite(auth.session.role, 'ai_agents')) {
      return err('ERR_FORBIDDEN', 'Authenticated user lacks required permission');
    }
    if (!auth.session.tenantId) {
      return err('ERR_FORBIDDEN', 'Agent execution requires a tenant context');
    }
    const agent = agentByType(params.agentType);
    if (!agent) return err('ERR_NOT_FOUND', `Unknown agent type: ${params.agentType}`);

    const body = await parseBody(req, schema);
    const result = await executeAgent({
      tenantId: auth.session.tenantId,
      agentType: agent.type,
      input: body.input,
      actorId: auth.session.sub,
    });
    return ok({
      execution_id: result.executionId,
      status: result.status,
      output: result.output,
      acu_consumed: result.acuConsumed,
      duration_ms: result.durationMs,
      error: result.error ?? null,
    });
  } catch (e) {
    if (e instanceof InsufficientAcuError) {
      return err('ERR_ACU_INSUFFICIENT', e.message, {
        required: e.required,
        available: e.available,
      });
    }
    return handleError(e);
  }
}
