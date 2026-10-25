import test from 'node:test';
import assert from 'node:assert/strict';

import { computeGstSplit, invoiceNumberPrefix, createInvoiceFromBooking, recordManualPayment } from './billing.service.js';

test('Billing: splits GST into CGST+SGST for an intra-state sale', () => {
  const result = computeGstSplit(25000, 18, '33', '33');
  assert.equal(result.total_gst_paise, 4500);
  assert.equal(result.cgst_paise, 2250);
  assert.equal(result.sgst_paise, 2250);
  assert.equal(result.igst_paise, 0);
});

test('Billing: splits GST into IGST for an inter-state sale', () => {
  const result = computeGstSplit(25000, 18, '27', '33');
  assert.equal(result.total_gst_paise, 4500);
  assert.equal(result.cgst_paise, 0);
  assert.equal(result.sgst_paise, 0);
  assert.equal(result.igst_paise, 4500);
});

test('Billing: an odd total GST still splits into two halves that sum to the whole', () => {
  const result = computeGstSplit(101, 100, '33', '33'); // contrived to land on an odd total_gst_paise: 101
  assert.equal(result.total_gst_paise, 101);
  assert.equal(result.cgst_paise + result.sgst_paise, 101);
});

test('Billing: computeGstSplit rejects a negative taxable amount', () => {
  assert.throws(() => computeGstSplit(-100, 18, '33', '33'), /non-negative integer/);
});

test('Billing: invoice number prefix is scoped to the Indian financial year (Apr-Mar)', () => {
  assert.equal(invoiceNumberPrefix(new Date('2026-04-01T00:00:00+05:30')), 'INV/2627/');
  assert.equal(invoiceNumberPrefix(new Date('2026-03-31T23:59:00+05:30')), 'INV/2526/');
});

test('Billing: createInvoiceFromBooking requires a booking_id', async () => {
  await assert.rejects(
    async () => createInvoiceFromBooking(undefined),
    { message: 'booking_id is required' }
  );
});

test('Billing: recordManualPayment rejects a gateway method (no manual confirmation for those)', async () => {
  await assert.rejects(
    async () => recordManualPayment(1, { method: 'razorpay', amountPaise: 1000 }),
    /recordManualPayment only accepts/
  );
});
