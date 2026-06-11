import { z } from 'zod';
import { db } from '@/lib/db';
import { ok, err, parseBody, handleError, requireSession } from '@/lib/api';
import { audit } from '@/lib/audit';
import { executeAgent } from '@/lib/agents/engine';

const schema = z.object({
  action: z.enum(['pause', 'resume', 'optimise', 'scale']),
});

/** PATCH /api/v1/workflows/{id} — workflow card action controls (§23B.3). */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSession(req);
    if ('response' in auth) return auth.response;
    const wf = await db.workflow.findUnique({ where: { id: params.id } });
    if (!wf) return err('ERR_NOT_FOUND', 'Requested resource does not exist');
    if (wf.tenantId !== auth.session.tenantId && auth.session.role !== 'super_admin') {
      return err('ERR_FORBIDDEN', 'Authenticated user lacks required permission');
    }
    const body = await parseBody(req, schema);

    let optimisation: unknown = null;
    let data: Record<string, unknown> = {};
    if (body.action === 'pause') data = { status: 'paused' };
    if (body.action === 'resume') data = { status: 'running' };
    if (body.action === 'scale') data = { automationRate: Math.min(99, wf.automationRate + 5) };
    if (body.action === 'optimise') {
      // Workflow Automation Agent analyses the workflow and proposes improvements.
      const result = await executeAgent({
        tenantId: wf.tenantId,
        agentType: 'workflow_automation_agent',
        triggerType: 'user_invoked',
        input: { workflow: wf.name, efficiency: wf.efficiencyScore },
        actorId: auth.session.sub,
      });
      optimisation = result.output;
      data = { efficiencyScore: Math.min(99, wf.efficiencyScore + 2) };
    }

    const updated = await db.workflow.update({ where: { id: wf.id }, data });
    await audit({
      tenantId: wf.tenantId,
      actorId: auth.session.sub,
      actorType: 'user',
      action: `workflow.${body.action}`,
      resourceType: 'workflow',
      resourceId: wf.id,
    });
    return ok({ workflow: updated, optimisation });
  } catch (e) {
    return handleError(e);
  }
}
