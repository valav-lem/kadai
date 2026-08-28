import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

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
