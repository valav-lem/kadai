import Fastify from 'fastify';
import cors from '@fastify/cors';

// Imported first and called immediately: the route modules below import
// src/server/db/index.js, which needs DATABASE_URL already in process.env by
// the time its own top-level code runs (ESM evaluates imports before the
// importing module's body). db/index.js calls loadEnv() too, so whichever of
// the two runs first wins — this call just makes it explicit here as well.
import { loadEnv } from './load-env.js';
loadEnv();

import staffRoutes from './modules/staff/staff.routes.js';
import catalogueRoutes from './modules/catalogue/catalogue.routes.js';
import customersRoutes from './modules/customers/customers.routes.js';
import bookingsRoutes from './modules/bookings/bookings.routes.js';
import billingRoutes from './modules/billing/billing.routes.js';
import webhookRoutes from './modules/billing/webhooks.routes.js';

const fastify = Fastify({
  logger: process.env.NODE_ENV === 'test' ? false : true,
});

// Enable CORS for web development
await fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});

// Replaces the default JSON body parser with one that also stashes the raw
// request string on request.rawBody. Every other route ignores it; the
// Razorpay/Cashfree webhook routes need it because their signatures are
// computed over the exact bytes sent, not over our re-serialized copy of
// the parsed object.
fastify.addContentTypeParser('application/json', { parseAs: 'string' }, (request, body, done) => {
  request.rawBody = body;
  if (!body) {
    done(null, undefined);
    return;
  }
  try {
    done(null, JSON.parse(body));
  } catch (err) {
    err.statusCode = 400;
    done(err, undefined);
  }
});

// Health check
fastify.get('/api/health', async () => {
  return { status: 'ok', time: new Date().toISOString(), app: 'kadai' };
});

// Shop identity configuration
fastify.get('/api/shop', async () => {
  return {
    shop: {
      legal_name: process.env.SHOP_LEGAL_NAME || 'Annachi Kadai Co · அண்ணாச்சி கடை',
      gstin: process.env.SHOP_GSTIN || '33AAAAA0000A1Z5',
      state_code: process.env.SHOP_STATE_CODE || '33',
      address: process.env.SHOP_ADDRESS || '12, Bazaar Street, Virudhunagar, Tamil Nadu - 626001',
      upi_id: process.env.SHOP_UPI_ID || 'annachikadai@okhdfcbank',
      default_locale: process.env.DEFAULT_LOCALE || 'ta',
    },
  };
});

// Register Domain Modules
await fastify.register(staffRoutes, { prefix: '/api/staff' });
await fastify.register(catalogueRoutes, { prefix: '/api/catalogue' });
await fastify.register(customersRoutes, { prefix: '/api/customers' });
await fastify.register(bookingsRoutes, { prefix: '/api/bookings' });
await fastify.register(billingRoutes, { prefix: '/api/invoices' });
await fastify.register(webhookRoutes, { prefix: '/api/webhooks' });

// Global Error Handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  const statusCode = error.statusCode || 500;
  reply.status(statusCode).send({
    error: error.message || 'Internal Server Error',
    code: error.code || 'INTERNAL_ERROR',
  });
});

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

const isMainModule = process.argv[1] && process.argv[1].endsWith('index.js') && !process.argv[1].includes('.test.');
if (isMainModule && process.env.NODE_ENV !== 'test') {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`Kadai API Server running at http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

export default fastify;