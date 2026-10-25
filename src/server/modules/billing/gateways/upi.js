import QRCode from 'qrcode';

/**
 * A static UPI intent link — no gateway, no account, no webhook. The
 * customer scans it (or taps it on their own phone), their UPI app opens
 * pre-filled, and the shop sees the credit arrive like any other UPI
 * payment. Because there's no callback, confirming it is a manual step —
 * see `recordManualPayment` in billing.service.js.
 *
 * Builds the URI string by hand rather than with URLSearchParams:
 * URLSearchParams encodes spaces as '+' (the application/x-www-form-urlencoded
 * convention), but UPI apps expect '%20'. encodeURIComponent gives the
 * right encoding for a URI.
 */
export function buildUpiUri({ vpa, payeeName, amountPaise, note, referenceId }) {
  if (!vpa) {
    const err = new Error('UPI is not configured: set SHOP_UPI_ID in .env');
    err.statusCode = 503;
    throw err;
  }
  if (!Number.isInteger(amountPaise) || amountPaise <= 0) {
    throw new Error('amountPaise must be a positive integer');
  }

  const amount = (amountPaise / 100).toFixed(2);
  const params = {
    pa: vpa,
    pn: payeeName || 'Kadai',
    am: amount,
    cu: 'INR',
    tn: note || undefined,
    tr: referenceId || undefined,
  };

  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return `upi://pay?${query}`;
}

/** PNG data URL of the UPI URI as a QR code, ready for an <img src>. */
export async function buildUpiQrDataUrl(upiUri) {
  return QRCode.toDataURL(upiUri, { margin: 1, width: 320 });
}
