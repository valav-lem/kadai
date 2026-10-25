import { query, getClient } from '../../db/index.js';
import { getBookingById } from '../bookings/bookings.service.js';

import * as upi from './gateways/upi.js';
import * as razorpay from './gateways/razorpay.js';
import * as cashfree from './gateways/cashfree.js';

const PAYMENT_METHODS = ['upi', 'razorpay', 'cashfree', 'cash', 'card'];
const MANUAL_METHODS = ['upi', 'cash', 'card']; // no gateway callback — staff confirms by eye

/**
 * CGST+SGST when the sale is inside the shop's own state, IGST when it
 * isn't. This is the ordinary place-of-supply rule, not a judgment call —
 * the open statutory question (ADR-0007) is the tax treatment of *advance*
 * receipts, which this invoice-only flow never collects.
 */
export function computeGstSplit(taxablePaise, gstSlabPercent, placeOfSupply, shopStateCode) {
  if (!Number.isInteger(taxablePaise) || taxablePaise < 0) {
    throw new Error('taxablePaise must be a non-negative integer');
  }
  const totalGstPaise = Math.round((taxablePaise * Number(gstSlabPercent)) / 100);

  if (placeOfSupply === shopStateCode) {
    const cgst = Math.round(totalGstPaise / 2);
    return { cgst_paise: cgst, sgst_paise: totalGstPaise - cgst, igst_paise: 0, total_gst_paise: totalGstPaise };
  }
  return { cgst_paise: 0, sgst_paise: 0, igst_paise: totalGstPaise, total_gst_paise: totalGstPaise };
}

/** `INV/<financial year>/` — GST invoices must carry a sequential, FY-scoped number. */
export function invoiceNumberPrefix(date = new Date()) {
  const month = date.getMonth() + 1; // Jan = 1
  const fyStartYear = month >= 4 ? date.getFullYear() : date.getFullYear() - 1;
  const fy = `${String(fyStartYear).slice(2)}${String(fyStartYear + 1).slice(2)}`;
  return `INV/${fy}/`;
}

function placeOfSupplyFor(booking, explicitPlaceOfSupply) {
  if (explicitPlaceOfSupply) return explicitPlaceOfSupply;
  if (booking.customer_gstin) return booking.customer_gstin.slice(0, 2);
  return process.env.SHOP_STATE_CODE || '33';
}

export async function createInvoiceFromBooking(bookingId, { placeOfSupply: explicitPlaceOfSupply } = {}) {
  if (!bookingId) {
    throw new Error('booking_id is required');
  }

  const booking = await getBookingById(bookingId);
  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }
  if (booking.status === 'cancelled') {
    const err = new Error('Cannot invoice a cancelled booking');
    err.statusCode = 400;
    throw err;
  }

  const existing = await query('SELECT invoice_id FROM invoice_lines WHERE booking_id = $1', [bookingId]);
  if (existing.rows.length > 0) {
    const err = new Error('This booking has already been invoiced');
    err.statusCode = 409;
    err.invoiceId = existing.rows[0].invoice_id;
    throw err;
  }

  const placeOfSupply = placeOfSupplyFor(booking, explicitPlaceOfSupply);
  const shopStateCode = process.env.SHOP_STATE_CODE || '33';
  const taxablePaise = Number(booking.price_paise);
  const gst = computeGstSplit(taxablePaise, booking.gst_slab, placeOfSupply, shopStateCode);
  const totalPaise = taxablePaise + gst.total_gst_paise;
  const prefix = invoiceNumberPrefix();

  const { client, query: txQuery, release } = await getClient();
  try {
    await txQuery('BEGIN');

    // Computing "next sequence in this FY" and inserting aren't truly
    // atomic under concurrent writers (two transactions can both see the
    // same max before either commits) — acceptable for a single counter,
    // so the fix is a retry on the unique(number) violation rather than a
    // lock. See the catch block below.
    const invoiceRes = await txQuery(
      `
      with next_seq as (
        select coalesce(max(substring(number from '(\\d+)$')::int), 0) + 1 as seq
        from invoices
        where number like $1 || '%'
      )
      insert into invoices (number, customer_id, place_of_supply, total_paise, cgst_paise, sgst_paise, igst_paise)
      select $1 || lpad(next_seq.seq::text, 4, '0'), $2, $3, $4, $5, $6, $7
      from next_seq
      returning id, number;
      `,
      [prefix, booking.customer_id, placeOfSupply, totalPaise, gst.cgst_paise, gst.sgst_paise, gst.igst_paise]
    );
    const invoice = invoiceRes.rows[0];

    await txQuery(
      `
      insert into invoice_lines (invoice_id, item_id, booking_id, description, hsn_sac, qty, rate_paise, gst_slab)
      values ($1, $2, $3, $4, $5, 1, $6, $7);
      `,
      [invoice.id, booking.item_id, bookingId, booking.item_name, booking.item_sac, booking.price_paise, booking.gst_slab]
    );

    await txQuery('COMMIT');
    return getInvoiceById(invoice.id);
  } catch (err) {
    await txQuery('ROLLBACK').catch(() => {});
    if (err.code === '23505') {
      const conflict = new Error('Invoice number was claimed concurrently — retry the request');
      conflict.statusCode = 409;
      throw conflict;
    }
    throw err;
  } finally {
    release();
  }
}

export async function getInvoiceById(id) {
  const invoiceRes = await query(
    `
    select i.*, c.name as customer_name, c.mobile as customer_mobile, c.gstin as customer_gstin
    from invoices i
    join customers c on c.id = i.customer_id
    where i.id = $1;
    `,
    [id]
  );
  const invoice = invoiceRes.rows[0];
  if (!invoice) return null;

  const [linesRes, paymentsRes] = await Promise.all([
    query('select * from invoice_lines where invoice_id = $1 order by id', [id]),
    query('select * from payments where invoice_id = $1 order by recorded_at', [id]),
  ]);

  const paidPaise = paymentsRes.rows
    .filter((p) => p.status === 'captured')
    .reduce((sum, p) => sum + Number(p.amount_paise), 0);

  return {
    ...invoice,
    lines: linesRes.rows,
    payments: paymentsRes.rows,
    paid_paise: paidPaise,
    balance_paise: Number(invoice.total_paise) - paidPaise,
  };
}

export async function listInvoices() {
  const res = await query(`
    select
      i.id, i.number, i.issued_at, i.total_paise, i.place_of_supply,
      c.name as customer_name,
      coalesce(p.paid_paise, 0) as paid_paise
    from invoices i
    join customers c on c.id = i.customer_id
    left join (
      select invoice_id, sum(amount_paise) as paid_paise
      from payments
      where status = 'captured'
      group by invoice_id
    ) p on p.invoice_id = i.id
    order by i.issued_at desc;
  `);

  return res.rows.map((row) => ({
    ...row,
    paid_paise: Number(row.paid_paise),
    balance_paise: Number(row.total_paise) - Number(row.paid_paise),
  }));
}

async function recordPaymentEvent({ invoiceId, method, status, amountPaise, gateway = null, gatewayRef = null, payload = null }) {
  if (!PAYMENT_METHODS.includes(method)) {
    throw new Error(`Invalid payment method: ${method}`);
  }
  if (!Number.isInteger(amountPaise) || amountPaise <= 0) {
    throw new Error('amountPaise must be a positive integer');
  }

  try {
    const res = await query(
      `
      insert into payments (invoice_id, method, status, amount_paise, gateway, gateway_ref, payload)
      values ($1, $2, $3, $4, $5, $6, $7)
      returning *;
      `,
      [invoiceId, method, status, amountPaise, gateway, gatewayRef, payload ? JSON.stringify(payload) : null]
    );
    return res.rows[0];
  } catch (err) {
    if (err.code === '23503') { // invoice_id foreign key
      const notFound = new Error('Invoice not found');
      notFound.statusCode = 404;
      throw notFound;
    }
    if (err.code === '23505' && status === 'captured') {
      // idx_payments_captured_once — a webhook retry for an attempt already
      // marked captured. Not an error: return the event already on record.
      const existing = await query(
        'select * from payments where gateway = $1 and gateway_ref = $2 and status = $3',
        [gateway, gatewayRef, 'captured']
      );
      return existing.rows[0] || null;
    }
    throw err;
  }
}

async function requireInvoiceWithBalance(invoiceId) {
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    const err = new Error('Invoice not found');
    err.statusCode = 404;
    throw err;
  }
  if (invoice.balance_paise <= 0) {
    const err = new Error('Invoice is already fully paid');
    err.statusCode = 400;
    throw err;
  }
  return invoice;
}

export async function initiateUpiPayment(invoiceId) {
  const invoice = await requireInvoiceWithBalance(invoiceId);
  const vpa = process.env.SHOP_UPI_ID;
  const payeeName = process.env.SHOP_LEGAL_NAME || 'Kadai';

  const upiUri = upi.buildUpiUri({
    vpa,
    payeeName,
    amountPaise: invoice.balance_paise,
    note: invoice.number,
    referenceId: invoice.number,
  });
  const qrDataUrl = await upi.buildUpiQrDataUrl(upiUri);

  return { upi_uri: upiUri, qr_data_url: qrDataUrl, amount_paise: invoice.balance_paise };
}

export async function initiateRazorpayPayment(invoiceId) {
  const invoice = await requireInvoiceWithBalance(invoiceId);

  const link = await razorpay.createPaymentLink({
    amountPaise: invoice.balance_paise,
    description: `Invoice ${invoice.number}`,
    referenceId: invoice.number,
    customerName: invoice.customer_name,
    customerContact: invoice.customer_mobile,
  });

  await recordPaymentEvent({
    invoiceId,
    method: 'razorpay',
    status: 'initiated',
    amountPaise: invoice.balance_paise,
    gateway: 'razorpay',
    gatewayRef: link.id,
    payload: link,
  });

  return { payment_link: link.short_url, gateway_ref: link.id };
}

export async function initiateCashfreePayment(invoiceId) {
  const invoice = await requireInvoiceWithBalance(invoiceId);
  const linkId = `${invoice.number.replace(/[^A-Za-z0-9]/g, '_')}_${Date.now()}`;

  const link = await cashfree.createPaymentLink({
    linkId,
    amountPaise: invoice.balance_paise,
    description: `Invoice ${invoice.number}`,
    customerName: invoice.customer_name,
    customerContact: invoice.customer_mobile,
  });

  const gatewayRef = link.link_id || linkId;
  await recordPaymentEvent({
    invoiceId,
    method: 'cashfree',
    status: 'initiated',
    amountPaise: invoice.balance_paise,
    gateway: 'cashfree',
    gatewayRef,
    payload: link,
  });

  return { payment_link: link.link_url, gateway_ref: gatewayRef };
}

/**
 * For the two methods with no gateway callback: a UPI credit the owner saw
 * land in their own banking app, or cash/card handled at the counter. The
 * counter staff is the confirmation, same as ticking off a till receipt.
 */
export async function recordManualPayment(invoiceId, { method, amountPaise }) {
  if (!MANUAL_METHODS.includes(method)) {
    throw new Error(`recordManualPayment only accepts ${MANUAL_METHODS.join(', ')}`);
  }
  const invoice = await requireInvoiceWithBalance(invoiceId);
  if (!Number.isInteger(amountPaise) || amountPaise <= 0) {
    throw new Error('amountPaise must be a positive integer');
  }
  if (amountPaise > invoice.balance_paise) {
    const err = new Error(`amountPaise (${amountPaise}) exceeds the outstanding balance (${invoice.balance_paise})`);
    err.statusCode = 400;
    throw err;
  }

  await recordPaymentEvent({ invoiceId, method, status: 'captured', amountPaise });
  return getInvoiceById(invoiceId);
}

async function findInitiatedPayment(gateway, gatewayRef) {
  const res = await query(
    'select * from payments where gateway = $1 and gateway_ref = $2 order by recorded_at desc limit 1',
    [gateway, gatewayRef]
  );
  return res.rows[0] || null;
}

/**
 * `event` is one of Razorpay's payment_link.* / payment.captured family;
 * only the ones that mean "money moved" or "money won't move" are handled
 * here. Unrecognised events are acknowledged (200) and ignored, not errored
 * — Razorpay retries on anything but 2xx, including events we don't care
 * about yet.
 */
export async function handleRazorpayEvent({ event, gatewayRef, amountPaise }) {
  const existing = await findInitiatedPayment('razorpay', gatewayRef);
  if (!existing) {
    return { handled: false, reason: 'unknown gateway_ref' };
  }

  if (event === 'captured') {
    await recordPaymentEvent({
      invoiceId: existing.invoice_id,
      method: 'razorpay',
      status: 'captured',
      amountPaise: amountPaise ?? Number(existing.amount_paise),
      gateway: 'razorpay',
      gatewayRef,
      payload: { event },
    });
    return { handled: true };
  }
  if (event === 'failed') {
    await recordPaymentEvent({
      invoiceId: existing.invoice_id,
      method: 'razorpay',
      status: 'failed',
      amountPaise: amountPaise ?? Number(existing.amount_paise),
      gateway: 'razorpay',
      gatewayRef,
      payload: { event },
    });
    return { handled: true };
  }
  return { handled: false, reason: `ignored event: ${event}` };
}

export async function handleCashfreeEvent({ status, gatewayRef, amountPaise }) {
  const existing = await findInitiatedPayment('cashfree', gatewayRef);
  if (!existing) {
    return { handled: false, reason: 'unknown gateway_ref' };
  }

  if (status === 'SUCCESS') {
    await recordPaymentEvent({
      invoiceId: existing.invoice_id,
      method: 'cashfree',
      status: 'captured',
      amountPaise: amountPaise ?? Number(existing.amount_paise),
      gateway: 'cashfree',
      gatewayRef,
      payload: { status },
    });
    return { handled: true };
  }
  if (status === 'FAILED' || status === 'CANCELLED') {
    await recordPaymentEvent({
      invoiceId: existing.invoice_id,
      method: 'cashfree',
      status: 'failed',
      amountPaise: amountPaise ?? Number(existing.amount_paise),
      gateway: 'cashfree',
      gatewayRef,
      payload: { status },
    });
    return { handled: true };
  }
  return { handled: false, reason: `ignored status: ${status}` };
}
