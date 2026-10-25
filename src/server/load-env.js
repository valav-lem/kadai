import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '../..');

/**
 * Load .env into process.env, without a runtime dependency for it and
 * without overwriting anything the shell already exported.
 *
 * Shared by src/server/index.js, src/server/db/index.js, scripts/migrate.js
 * and scripts/seed.js — it used to be copy-pasted into each, and the copies
 * drifted: a fix applied to one left the others parsing trailing comments
 * (`SHOP_STATE_CODE=33  # Tamil Nadu`) straight into the value. One function,
 * loaded everywhere, so that can't happen again.
 *
 * A quoted value is taken verbatim; an unquoted one is cut at the first
 * whitespace-preceded '#'. The whitespace requirement matters — '#' is legal
 * inside a password or a URL, and DATABASE_URL must survive intact.
 */
export function loadEnv() {
  const envPath = resolve(rootDir, '.env');
  if (!existsSync(envPath)) return;

  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;

    const [key, ...rest] = trimmed.split('=');
    // Trimming before stripping a trailing comment would eat the very
    // whitespace the comment-detector looks for — e.g. an empty value
    // (`SHOP_UPI_ID=                 # a VPA`) would trim down to a string
    // that starts with '#', with no leading whitespace left for `\s+#` to
    // match. So: strip the comment on the raw joined string first, trim once
    // at the end.
    let val = rest.join('=');
    const quoted = /^\s*(['"])([\s\S]*)\1\s*$/.exec(val);
    val = quoted ? quoted[2] : val.replace(/\s+#.*$/, '').trim();

    const trimmedKey = key.trim();
    if (!process.env[trimmedKey]) {
      process.env[trimmedKey] = val;
    }
  }
}
