import { z } from 'zod';
import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { ok, err, parseBody, handleError, requireSession } from '@/lib/api';
import { canWrite } from '@/lib/rbac';

const schema = z.object({
  amount: z.number().positive().optional(), // optional → open-amount link
  currency: z.enum(['CDF', 'USD', 'EUR', 'GBP']).default('GBP'),
  expiry_hours: z.number().int().min(1).max(720).default(72),
  description: z.string().max(500).optional(),
});

/** POST /api/v1/payments/links — create a shareable payment link + QR. */
export async function POST(req: Request) {
  try {
    const auth = await requireSession(req);
    if ('response' in auth) return auth.response;
    if (!canWrite(auth.session.role, 'payments')) {
      return err('ERR_FORBIDDEN', 'Authenticated user lacks required permission');
    }
    if (!auth.session.tenantId) return err('ERR_FORBIDDEN', 'Tenant context required');
    const body = await parseBody(req, schema);
    const id = randomUUID().slice(0, 8);
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const link = await db.paymentLink.create({
      data: {
        tenantId: auth.session.tenantId,
        amount: body.amount,
        currency: body.currency,
        description: body.description,
        url: `${base}/pay/${id}`,
        qrCodeUrl: `${base}/api/v1/payments/links/${id}/qr`,
        expiresAt: new Date(Date.now() + body.expiry_hours * 3_600_000),
      },
    });
    return ok(
      {
        link: {
          id: link.id,
          url: link.url,
          qr_code_url: link.qrCodeUrl,
          amount: link.amount,
          currency: link.currency,
          expires_at: link.expiresAt,
        },
      },
      201
    );
  } catch (e) {
    return handleError(e);
  }
}

/** GET /api/v1/payments/links — list tenant payment links. */
export async function GET(req: Request) {
  try {
    const auth = await requireSession(req);
    if ('response' in auth) return auth.response;
    if (!auth.session.tenantId) return err('ERR_FORBIDDEN', 'Tenant context required');
    const links = await db.paymentLink.findMany({
      where: { tenantId: auth.session.tenantId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return ok({ links });
  } catch (e) {
    return handleError(e);
  }
}
