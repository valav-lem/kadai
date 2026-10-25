import crypto from 'node:crypto';

/**
 * Constant-time string comparison for webhook signatures. A plain `===`
 * leaks timing information proportional to how many leading characters
 * match, which is enough to brute-force a signature byte-by-byte.
 *
 * `crypto.timingSafeEqual` throws if its two buffers differ in length, so a
 * length mismatch is checked (and rejected) first — that branch depends only
 * on length, not content, so it doesn't reopen the timing side-channel.
 */
export function timingSafeEqualString(expected, received) {
  if (typeof expected !== 'string' || typeof received !== 'string') return false;
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(received, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
