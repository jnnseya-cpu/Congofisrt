import { AGENT_REGISTRY } from '@/lib/agents/registry';
import { ACU_COSTS } from '@/lib/acu';
import { ok, handleError, requireSession } from '@/lib/api';

/** GET /api/v1/agents — list the full agent workforce (filter: ?category=). */
export async function GET(req: Request) {
  try {
    const auth = await requireSession(req);
    if ('response' in auth) return auth.response;
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const agents = AGENT_REGISTRY.filter(
      (a) => !category || a.category.toLowerCase().includes(category.toLowerCase())
    ).map((a) => ({
      type: a.type,
      name: a.name,
      category: a.category,
      description: a.description,
      acu_cost_per_execution: ACU_COSTS[a.acuAction],
    }));
    return ok({ agents, total: agents.length });
  } catch (e) {
    return handleError(e);
  }
}
