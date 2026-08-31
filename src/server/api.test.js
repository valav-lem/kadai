import test from 'node:test';
import assert from 'node:assert/strict';
import fastify from './index.js';

test('API: health check returns ok', async () => {
  const response = await fastify.inject({
    method: 'GET',
    url: '/api/health',
  });

  assert.equal(response.statusCode, 200);
  const json = JSON.parse(response.body);
  assert.equal(json.status, 'ok');
  assert.equal(json.app, 'kadai');
});

test('API: shop config returns legal identity and UPI ID', async () => {
  const response = await fastify.inject({
    method: 'GET',
    url: '/api/shop',
  });

  assert.equal(response.statusCode, 200);
  const json = JSON.parse(response.body);
  assert.ok(json.shop);
  assert.ok(json.shop.upi_id);
  assert.ok(json.shop.legal_name);
});

test.after(async () => {
  await fastify.close();
});
