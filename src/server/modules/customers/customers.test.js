import test from 'node:test';
import assert from 'node:assert/strict';
import { createCustomer } from './customers.service.js';

test('Customers: validates mobile length and GSTIN formatting', async () => {
  // Mobile too short
  await assert.rejects(
    async () => {
      await createCustomer({
        name: 'Murugan',
        mobile: '123',
      });
    },
    { message: 'Mobile number must be at least 10 digits' }
  );

  // Invalid GSTIN format
  await assert.rejects(
    async () => {
      await createCustomer({
        name: 'Kannan Traders',
        mobile: '9840123456',
        gstin: 'INVALID_GSTIN',
      });
    },
    { message: 'Invalid GSTIN format. Expected 15-character alphanumeric GSTIN' }
  );
});
