import test from 'node:test';
import assert from 'node:assert/strict';
import { createBooking, updateBookingStatus } from './bookings.service.js';

test('Bookings: validates required fields', async () => {
  // Missing customer
  await assert.rejects(
    async () => {
      await createBooking({
        item_id: 1,
        staff_id: 1,
        start_time: new Date().toISOString(),
      });
    },
    { message: 'Customer is required for booking' }
  );

  // Missing item
  await assert.rejects(
    async () => {
      await createBooking({
        customer_id: 1,
        staff_id: 1,
        start_time: new Date().toISOString(),
      });
    },
    { message: 'Catalogue item (service) is required' }
  );

  // Missing staff
  await assert.rejects(
    async () => {
      await createBooking({
        customer_id: 1,
        item_id: 1,
        start_time: new Date().toISOString(),
      });
    },
    { message: 'Staff member is required' }
  );
});

test('Bookings: validates status updates', async () => {
  await assert.rejects(
    async () => {
      await updateBookingStatus(1, 'invalid_status_value');
    },
    /Invalid status/
  );
});
