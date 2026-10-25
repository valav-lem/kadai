import * as billingService from './billing.service.js';
import * as razorpay from './gateways/razorpay.js';
import * as cashfree from './gateways/cashfree.js';

/**
 * Maps Razorpay's event envelope onto { event: 'captured' | 'failed' | 'ignored' }.
 * We only ever create Payment Links (never raw Orders) for this
 * integration, so `payload.payment_link.entity` is the primary source for
 * the id and amount; `payload.payment.entity` is consulted as a fallback.
 * Field names (`amount_paid` on a paid link) are per Razorpay's published
 * reference and have NOT been exercised against a live webhook in this
 * change — recheck against a real delivery before relying on this in
 * production.
 */
function extractRazorpayEvent(body) {
  const linkEntity = body?.payload?.payment_link?.entity;
  const paymentEntity = body?.payload?.payment?.entity;
  const gatewayRef = linkEntity?.id || paymentEntity?.order_id;
  const amountPaise = paymentEntity?.amount ?? linkEntity?.amount_paid ?? linkEntity?.amount;

  if (body?.event === 'payment_link.paid' || body?.event === 'payment.captured') {
    return { event: 'captured', gatewayRef, amountPaise };
  }
  if (['payment_link.cancelled', 'payment_link.expired', 'payment.failed'].includes(body?.event)) {
    return { event: 'failed', gatewayRef, amountPaise };
  }
  return { event: 'ignored', gatewayRef, amountPaise };
}

/**
 * Cashfree's webhook payload shape differs across their Payment Links and
 * Payment Gateway products and across API versions. This reads the fields
 * most consistently documented for Payment Links (`data.link_id`,
 * `data.payment.payment_status`, amounts in rupees) but has NOT been
 * exercised against a live webhook — confirm the exact shape against a
 * real delivery (or their webhook simulator) before relying on this.
 */
function extractCashfreeEvent(body) {
  const data = body?.data || {};
  const gatewayRef = data.link_id || data.cf_link_id;
  const paymentStatus = data.payment?.payment_status || data.link_status;
  const amountRupees = data.payment?.payment_amount ?? data.link_amount_paid ?? data.link_amount;
  const amountPaise = typeof amountRupees === 'number' ? Math.round(amountRupees * 100) : undefined;

  let status = paymentStatus;
  if (paymentStatus === 'PAID') status = 'SUCCESS';
  if (paymentStatus === 'EXPIRED') status = 'CANCELLED';

  return { status, gatewayRef, amountPaise };
}

export default async function webhookRoutes(fastify, _options) {
  fastify.post('/razorpay', async (request, reply) => {
    const signature = request.headers['x-razorpay-signature'];
    if (!razorpay.verifyWebhookSignature(request.rawBody ?? '', signature)) {
      request.log.warn('Rejected Razorpay webhook: bad signature');
      return reply.status(401).send({ error: 'invalid signature' });
    }

    const { event, gatewayRef, amountPaise } = extractRazorpayEvent(request.body);
    const result = await billingService.handleRazorpayEvent({ event, gatewayRef, amountPaise });
    if (!result.handled) {
      request.log.info({ gatewayRef, reason: result.reason }, 'Razorpay webhook acknowledged, not applied');
    }
    // Always 200 once the signature checks out — a non-2xx makes Razorpay
    // retry, including for events we deliberately ignore.
    return reply.status(200).send({ received: true });
  });

  fastify.post('/cashfree', async (request, reply) => {
    const timestamp = request.headers['x-webhook-timestamp'];
    const signature = request.headers['x-webhook-signature'];
    if (!cashfree.verifyWebhookSignature(request.rawBody ?? '', timestamp, signature)) {
      request.log.warn('Rejected Cashfree webhook: bad signature');
      return reply.status(401).send({ error: 'invalid signature' });
    }

    const { status, gatewayRef, amountPaise } = extractCashfreeEvent(request.body);
    const result = await billingService.handleCashfreeEvent({ status, gatewayRef, amountPaise });
    if (!result.handled) {
      request.log.info({ gatewayRef, reason: result.reason }, 'Cashfree webhook acknowledged, not applied');
    }
    return reply.status(200).send({ received: true });
  });
}
