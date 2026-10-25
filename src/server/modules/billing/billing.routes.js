import * as billingService from './billing.service.js';

export default async function billingRoutes(fastify, _options) {
  fastify.get('/', async (_request, _reply) => {
    const invoices = await billingService.listInvoices();
    return { invoices };
  });

  fastify.get('/:id', async (request, reply) => {
    const invoice = await billingService.getInvoiceById(request.params.id);
    if (!invoice) {
      return reply.status(404).send({ error: 'Invoice not found' });
    }
    return { invoice };
  });

  fastify.post('/', async (request, reply) => {
    try {
      const { booking_id, place_of_supply } = request.body || {};
      const invoice = await billingService.createInvoiceFromBooking(booking_id, { placeOfSupply: place_of_supply });
      return reply.status(201).send({ invoice });
    } catch (err) {
      return reply.status(err.statusCode || 400).send({ error: err.message, invoice_id: err.invoiceId });
    }
  });

  // Starts a payment attempt. UPI returns a QR/intent link to show the
  // customer; razorpay/cashfree return a hosted link and record an
  // 'initiated' event the webhook will later resolve to captured/failed.
  fastify.post('/:id/pay/upi', async (request, reply) => {
    try {
      const result = await billingService.initiateUpiPayment(request.params.id);
      return result;
    } catch (err) {
      return reply.status(err.statusCode || 400).send({ error: err.message });
    }
  });

  fastify.post('/:id/pay/razorpay', async (request, reply) => {
    try {
      const result = await billingService.initiateRazorpayPayment(request.params.id);
      return result;
    } catch (err) {
      return reply.status(err.statusCode || 400).send({ error: err.message });
    }
  });

  fastify.post('/:id/pay/cashfree', async (request, reply) => {
    try {
      const result = await billingService.initiateCashfreePayment(request.params.id);
      return result;
    } catch (err) {
      return reply.status(err.statusCode || 400).send({ error: err.message });
    }
  });

  // Cash, card, or a UPI credit the owner confirmed by eye — no gateway
  // callback exists for these, so the counter is the confirmation.
  fastify.post('/:id/pay/manual', async (request, reply) => {
    try {
      const { method, amount_paise } = request.body || {};
      const invoice = await billingService.recordManualPayment(request.params.id, { method, amountPaise: amount_paise });
      return { invoice };
    } catch (err) {
      return reply.status(err.statusCode || 400).send({ error: err.message });
    }
  });
}
