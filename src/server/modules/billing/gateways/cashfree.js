import { createHmac } from 'node:crypto';

import { timingSafeEqualString } from './webhook-signature.js';

const API_BASE = {
  sandbox: 'https://sandbox.cashfree.com/pg',
  production: 'https://api.cashfree.com/pg',
};
const API_VERSION = '2023-08-01';

function getCredentials() {
  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  if (!appId || !secretKey) {
    const err = new Error('Cashfree is not configured: set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in .env');
    err.statusCode = 503;
    throw err;
  }
  const env = process.env.CASHFREE_ENV === 'production' ? 'production' : 'sandbox';
  return { appId, secretKey, baseUrl: API_BASE[env] };
}

/**
 * Creates a Cashfree Payment Link for an exact amount against one invoice.
 * https://docs.cashfree.com/reference/pglinkscreate
 *
 * NOT exercised against Cashfree's sandbox in this change — no API
 * credentials were available in this environment. Verify against a real
 * test account before relying on it.
 */
export async function createPaymentLink({ linkId, amountPaise, description, customerName, customerContact }) {
  const { appId, secretKey, baseUrl } = getCredentials();

  const res = await fetch(`${baseUrl}/links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-version': API_VERSION,
      'x-client-id': appId,
      'x-client-secret': secretKey,
    },
    body: JSON.stringify({
      link_id: linkId,
      link_amount: amountPaise / 100, // Cashfree takes rupees, not paise
      link_currency: 'INR',
      link_purpose: description,
      customer_details: {
        customer_name: customerName,
        customer_phone: customerContact || '9999999999', // required by the API even when unknown
      },
      link_notify: { send_sms: Boolean(customerContact), send_email: false },
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    const err = new Error(body?.message || 'Cashfree payment link creation failed');
    err.statusCode = 502;
    err.gatewayResponse = body;
    throw err;
  }
  return body; // { link_id, link_url, link_status, ... }
}

/**
 * Cashfree signs webhooks as base64(HMAC-SHA256(timestamp + rawBody)),
 * using the same client secret as the API — not a separate webhook secret.
 * https://docs.cashfree.com/docs/webhooks#verifying-webhook-signature
 */
export function verifyWebhookSignature(rawBody, timestampHeader, signatureHeader) {
  const secret = process.env.CASHFREE_SECRET_KEY;
  if (!secret || !timestampHeader || !signatureHeader) return false;
  const expected = createHmac('sha256', secret)
    .update(timestampHeader + rawBody)
    .digest('base64');
  return timingSafeEqualString(expected, signatureHeader);
}
