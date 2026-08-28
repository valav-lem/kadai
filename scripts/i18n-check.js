// Fails when a key exists in en.json and is missing from ta.json (or vice versa).
// A half-Tamil screen is worse than an English one — see docs/decisions/0004-tamil-first-locale.md
import { readFileSync } from 'node:fs';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const en = read('../locales/en.json');
const ta = read('../locales/ta.json');

const missingTa = Object.keys(en).filter((k) => !(k in ta));
const orphanTa = Object.keys(ta).filter((k) => !(k in en));

if (missingTa.length || orphanTa.length) {
  if (missingTa.length) console.error('Missing in ta.json:\n  ' + missingTa.join('\n  '));
  if (orphanTa.length) console.error('Not in en.json:\n  ' + orphanTa.join('\n  '));
  process.exit(1);
}
console.log(`Locale parity OK — ${Object.keys(en).length} keys.`);
