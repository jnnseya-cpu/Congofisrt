import { db } from '@/lib/db';
import { ok, err, handleError } from '@/lib/api';
import { verifyWebhookSignature, BITRIPAY_EVENTS, type BitriPayEvent } from '@/lib/bitripay';
import { audit } from '@/lib/audit';

/**
 * POST /api/v1/webhooks/bitripay — inbound BitriPay event processor.
 * Signature must be presented in X-BitriPay-Signature (HMAC-SHA256, §7.6);
 * unsigned or tampered payloads are rejected before any processing.
 */
export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-bitripay-signature');
    const payload = await req.text();
    if (!signature || !verifyWebhookSignature(payload, signature)) {
      return err('ERR_FORBIDDEN', 'Invalid webhook signature');
    }

    const event = JSON.parse(payload) as {
      event: BitriPayEvent;
      data: Record<string, unknown>;
    };
    if (!BITRIPAY_EVENTS.includes(event.event)) {
      return err('ERR_VALIDATION', `Unknown event type: ${event.event}`);
    }

    // Settle / fail transactions on terminal payment events.
    const txId = event.data?.transaction_id as string | undefined;
    if (txId && (event.event === 'payment.completed' || event.event === 'payment.failed')) {
      await db.transaction.updateMany({
        where: { gatewayReference: txId },
        data: {
          status: event.event === 'payment.completed' ? 'completed' : 'failed',
          completedAt: event.event === 'payment.completed' ? new Date() : null,
        },
      });
    }

    await audit({
      actorType: 'system',
      action: `bitripay.webhook.${event.event}`,
      resourceType: 'webhook',
      changes: event.data,
    });
    return ok({ received: true, event: event.event });
  } catch (e) {
    return handleError(e);
  }
}
