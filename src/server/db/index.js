import pg from 'pg';

import { loadEnv } from '../load-env.js';

// This module is imported (via the *.service.js files) before
// src/server/index.js's own top-level code runs, so it's this call — not
// index.js's — that actually puts DATABASE_URL into process.env first.
loadEnv();

const connectionString = process.env.DATABASE_URL || 'postgres://kadai:kadai@localhost:5432/kadai';

export const pool = new pg.Pool({
  connectionString,
  ssl: connectionString.includes('supabase.co') ? { rejectUnauthorized: false } : false,
});

export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.DEBUG_SQL) {
    console.log('Executed query', { text, duration, rows: res.rowCount });
  }
  return res;
}

export async function getClient() {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);
  return { client, query, release };
}

export default {
  pool,
  query,
  getClient,
};
