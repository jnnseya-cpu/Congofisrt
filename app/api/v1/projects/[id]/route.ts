import { db } from '@/lib/db';
import { ok, err, handleError, requireSession } from '@/lib/api';

/** GET /api/v1/projects/{id} — full project control-tower payload (§23C). */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSession(req);
    if ('response' in auth) return auth.response;
    const project = await db.project.findUnique({ where: { id: params.id } });
    if (!project) return err('ERR_NOT_FOUND', 'Requested resource does not exist');
    if (auth.session.role !== 'super_admin' && project.tenantId !== auth.session.tenantId) {
      return err('ERR_FORBIDDEN', 'Authenticated user lacks required permission');
    }

    const [workPackages, risks, issues, tasks, changeRequests, documents] = await Promise.all([
      db.workPackage.findMany({ where: { projectId: project.id }, orderBy: { code: 'asc' } }),
      db.risk.findMany({ where: { projectId: project.id }, orderBy: { score: 'desc' } }),
      db.issue.findMany({ where: { projectId: project.id }, orderBy: { createdAt: 'desc' } }),
      db.task.findMany({ where: { projectId: project.id }, orderBy: { wbsCode: 'asc' } }),
      db.changeRequest.findMany({ where: { projectId: project.id } }),
      db.document.findMany({ where: { projectId: project.id }, orderBy: { createdAt: 'desc' } }),
    ]);

    const cpi = project.actualCost > 0 ? project.earnedValue / project.actualCost : 1;
    const spi = project.plannedValue > 0 ? project.earnedValue / project.plannedValue : 1;

    return ok({
      project: {
        ...project,
        cpi,
        spi,
        cost_variance: project.earnedValue - project.actualCost,
        schedule_variance: project.earnedValue - project.plannedValue,
        budget_remaining: project.budget - project.actualCost,
      },
      work_packages: workPackages.map((wp) => ({
        ...wp,
        cpi: wp.costConsumed > 0 ? (wp.budget * (wp.progress / 100)) / wp.costConsumed : 1,
      })),
      risks,
      issues,
      tasks,
      change_requests: changeRequests,
      documents,
    });
  } catch (e) {
    return handleError(e);
  }
}
