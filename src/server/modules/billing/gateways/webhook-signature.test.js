import test from 'node:test';
import assert from 'node:assert/strict';

import { timingSafeEqualString } from './webhook-signature.js';

test('timingSafeEqualString: matches identical strings', () => {
  assert.equal(timingSafeEqualString('abc123', 'abc123'), true);
});

test('timingSafeEqualString: rejects a different string of the same length', () => {
  assert.equal(timingSafeEqualString('abc123', 'abc124'), false);
});

test('timingSafeEqualString: rejects differing lengths without throwing', () => {
  assert.equal(timingSafeEqualString('abc', 'abcd'), false);
});

test('timingSafeEqualString: rejects non-string input without throwing', () => {
  assert.equal(timingSafeEqualString('abc', undefined), false);
  assert.equal(timingSafeEqualString(undefined, 'abc'), false);
});
