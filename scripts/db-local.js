// Local development database — NOT for production, NOT for anything statutory.
//
// Runs PGlite (Postgres compiled to WASM) behind pglite-socket's own CLI,
// which speaks the real Postgres wire protocol over a TCP port. The app's
// `pg` client and `scripts/migrate.js`/`scripts/seed.js` connect to it
// exactly as they would a real Postgres server; nothing in src/server/
// needs to know the difference.
//
// Spawns the packaged CLI rather than using PGliteSocketServer directly:
// that class serves one connection at a time, and `pg.Pool` opens more than
// one (a pooled connection from one request can still be open when the next
// request's own connection arrives), which showed up as requests failing
// mid-transaction with "Connection terminated unexpectedly". The CLI's
// built-in multiplexer (-m) serializes concurrent logical connections onto
// the single underlying PGlite instance instead of dropping one.
//
// Why PGlite at all: this machine has neither a Postgres package installed
// nor passwordless sudo/docker-group access to add one, and the shared
// Supabase project's host stopped resolving (see docs/decisions — the dev
// DB conversation). This is a stopgap so development isn't blocked on
// either; swap DATABASE_URL back to a real Postgres (Supabase or otherwise)
// whenever one is available.
//
// Data persists under .data/pglite/ (gitignored) across restarts.

import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

const dataDir = resolve(rootDir, '.data/pglite');
const port = process.env.LOCAL_DB_PORT || '54329';
const host = process.env.LOCAL_DB_HOST || '127.0.0.1';
const cliPath = resolve(rootDir, 'node_modules/@electric-sql/pglite-socket/dist/scripts/server.js');

console.log(`Starting local dev Postgres (PGlite) at ${dataDir}`);
const child = spawn(
  process.execPath,
  [
    cliPath,
    '-d', dataDir,
    '-p', port,
    '-h', host,
    '-m', '10',
    '-e', 'btree_gist', // schema.sql's booking-overlap EXCLUDE constraint needs this
  ],
  { stdio: 'inherit' }
);

child.on('exit', (code) => process.exit(code ?? 0));

const forward = (signal) => () => child.kill(signal);
process.on('SIGINT', forward('SIGINT'));
process.on('SIGTERM', forward('SIGTERM'));
