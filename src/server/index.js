import Fastify from 'fastify';
import cors from '@fastify/cors';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import staffRoutes from './modules/staff/staff.routes.js';
import catalogueRoutes from './modules/catalogue/catalogue.routes.js';
import customersRoutes from './modules/customers/customers.routes.js';
import bookingsRoutes from './modules/bookings/bookings.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '../..');

// Load .env
const envPath = resolve(rootDir, '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...rest] = trimmed.split('=');
      const val = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

const fastify = Fastify({
  logger: process.env.NODE_ENV === 'test' ? false : true,
});

// Enable CORS for web development
await fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
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