import test from 'node:test';
import assert from 'node:assert/strict';

import { buildUpiUri } from './upi.js';

test('UPI: builds a upi://pay intent link with percent-encoded, not form-encoded, spaces', () => {
  const uri = buildUpiUri({
    vpa: 'annachikadai@okhdfcbank',
    payeeName: 'Annachi Kadai Co',
    amountPaise: 25000,
    note: 'Invoice INV/2526/0001',
    referenceId: 'INV/2526/0001',
  });

  assert.match(uri, /^upi:\/\/pay\?/);
  assert.match(uri, /pa=annachikadai%40okhdfcbank/);
  assert.match(uri, /am=250\.00/);
  assert.match(uri, /cu=INR/);
  // encodeURIComponent, not URLSearchParams: spaces must be %20, never '+'.
  assert.match(uri, /pn=Annachi%20Kadai%20Co/);
  assert.doesNotMatch(uri, /\+/);
});

test('UPI: refuses to build a link with no configured VPA', () => {
  assert.throws(
    () => buildUpiUri({ vpa: '', payeeName: 'Kadai', amountPaise: 1000 }),
    (err) => err.statusCode === 503 && /SHOP_UPI_ID/.test(err.message)
  );
});

test('UPI: rejects a non-positive amount', () => {
  assert.throws(
    () => buildUpiUri({ vpa: 'shop@upi', amountPaise: 0 }),
    /positive integer/
  );
});
