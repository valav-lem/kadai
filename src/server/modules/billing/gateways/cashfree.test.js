import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';

import { verifyWebhookSignature } from './cashfree.js';

const SECRET = 'test_cashfree_secret';

test('Cashfree: accepts a correctly signed payload (base64 HMAC over timestamp+body)', () => {
  process.env.CASHFREE_SECRET_KEY = SECRET;
  const rawBody = JSON.stringify({ data: { link_id: 'link_123' } });
  const timestamp = '1700000000';
  const signature = createHmac('sha256', SECRET).update(timestamp + rawBody).digest('base64');

  assert.equal(verifyWebhookSignature(rawBody, timestamp, signature), true);
  delete process.env.CASHFREE_SECRET_KEY;
});

test('Cashfree: rejects a signature computed with the wrong timestamp', () => {
  process.env.CASHFREE_SECRET_KEY = SECRET;
  const rawBody = JSON.stringify({ data: { link_id: 'link_123' } });
  const signature = createHmac('sha256', SECRET).update('1700000000' + rawBody).digest('base64');

  assert.equal(verifyWebhookSignature(rawBody, '1700000001', signature), false);
  delete process.env.CASHFREE_SECRET_KEY;
});

test('Cashfree: rejects when the secret is not configured', () => {
  delete process.env.CASHFREE_SECRET_KEY;
  assert.equal(verifyWebhookSignature('{}', '1700000000', 'anything'), false);
});
