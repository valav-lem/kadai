import { createHmac } from 'node:crypto';

import { timingSafeEqualString } from './webhook-signature.js';

const API_BASE = 'https://api.razorpay.com/v1';

function getCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    const err = new Error('Razorpay is not configured: set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
    err.statusCode = 503;
    throw err;
  }
  return { keyId, keySecret };
}

/**
 * Creates a Razorpay Payment Link for an exact amount against one invoice.
 * https://razorpay.com/docs/api/payments/payment-links/create/
 *
 * NOT exercised against Razorpay's sandbox in this change — no API keys were
 * available in this environment. Verify against a real test key before
 * relying on it; the request shape and amount units (paise, same as our
 * schema) are correct per their published API reference.
 */
export async function createPaymentLink({ amountPaise, description, referenceId, customerName, customerContact }) {
  const { keyId, keySecret } = getCredentials();
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  const res = await fetch(`${API_BASE}/payment_links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: 'INR',
      description,
      reference_id: referenceId,
      customer: {
        name: customerName,
        contact: customerContact || undefined,
      },
      notify: { sms: Boolean(customerContact), email: false },
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    const err = new Error(body?.error?.description || 'Razorpay payment link creation failed');
    err.statusCode = 502;
    err.gatewayResponse = body;
    throw err;
  }
  return body; // { id, short_url, status, ... }
}

/**
 * Razorpay signs webhooks with HMAC-SHA256 (hex) over the raw request body,
 * using the webhook secret configured in the Razorpay dashboard — a
 * different secret from the API key pair.
 * https://razorpay.com/docs/webhooks/validate-test/
 */
export function verifyWebhookSignature(rawBody, signatureHeader) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  return timingSafeEqualString(expected, signatureHeader);
}
