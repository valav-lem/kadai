require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'src', 'server', 'db', 'schema.sql');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query("select to_regclass('public.customers') as applied");
    if (rows[0].applied) {
      console.log('Schema already applied, skipping.');
      return;
    }

    const sql = fs.readFileSync(schemaPath, 'utf8');
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('COMMIT');
      console.log('Applied src/server/db/schema.sql');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
