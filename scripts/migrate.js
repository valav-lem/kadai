import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

import { loadEnv } from '../src/server/load-env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

loadEnv();

const connectionString = process.env.DATABASE_URL || 'postgres://kadai:kadai@localhost:5432/kadai';

async function migrate() {
  console.log(`🔌 Connecting to database: ${connectionString.replace(/:[^:@]+@/, ':***@')}`);
  const client = new pg.Client({
    connectionString,
    ssl: connectionString.includes('supabase.co') ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('✅ Connected.');

    const schemaSql = readFileSync(resolve(rootDir, 'src/server/db/schema.sql'), 'utf8');
    console.log('📜 Executing src/server/db/schema.sql...');

    // Execute schema in transaction
    await client.query('BEGIN');
    await client.query(schemaSql);
    await client.query('COMMIT');

    console.log('🎉 Migration successful! All tables, enums and constraints created.');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => { });
    console.error('❌ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

migrate();
