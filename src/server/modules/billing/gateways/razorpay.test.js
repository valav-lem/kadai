import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';

import { verifyWebhookSignature } from './razorpay.js';

const SECRET = 'test_webhook_secret';

test('Razorpay: accepts a correctly signed payload', () => {
  process.env.RAZORPAY_WEBHOOK_SECRET = SECRET;
  const rawBody = JSON.stringify({ event: 'payment_link.paid' });
  const signature = createHmac('sha256', SECRET).update(rawBody).digest('hex');

  assert.equal(verifyWebhookSignature(rawBody, signature), true);
  delete process.env.RAZORPAY_WEBHOOK_SECRET;
});

test('Razorpay: rejects a tampered payload', () => {
  process.env.RAZORPAY_WEBHOOK_SECRET = SECRET;
  const rawBody = JSON.stringify({ event: 'payment_link.paid' });
  const signature = createHmac('sha256', SECRET).update(rawBody).digest('hex');
  const tamperedBody = JSON.stringify({ event: 'payment_link.paid', amount: 999999999 });

  assert.equal(verifyWebhookSignature(tamperedBody, signature), false);
  delete process.env.RAZORPAY_WEBHOOK_SECRET;
});

test('Razorpay: rejects when the webhook secret is not configured', () => {
  delete process.env.RAZORPAY_WEBHOOK_SECRET;
  const rawBody = JSON.stringify({ event: 'payment_link.paid' });
  assert.equal(verifyWebhookSignature(rawBody, 'anything'), false);
});
