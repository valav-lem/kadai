# 0007 · Invoice payment collection via UPI, Razorpay and Cashfree

- **Status:** Accepted (billing/W3 only) — storefront/W6 deposits still open
- **Date:** 2026-08-28
- **Deciders:** Annachi Kadai Co (sponsor)

## Context

Charter §7 left "Payment collection: UPI intent link or gateway?" open, blocking both W3
(billing) and W6 (storefront), due 15 Oct. The sponsor has now scoped the near-term need:
collecting payment against an invoice that already exists — a UPI QR or a Razorpay/Cashfree
payment link the counter or accountant sends against an issued invoice — not a shopping-cart
checkout. That keeps this inside the `billing` module (W3) and off the project's declared
out-of-scope list, which excludes e-commerce checkout flows.

Whether the public booking page (`/book`, W6) collects an advance/deposit before an invoice
exists is a separate, still-open question — that would be a checkout-adjacent flow and needs
its own decision, not assumed by this ADR.

## Decision

Support UPI intent/QR and gateway links (Razorpay, Cashfree) as payment methods against an
already-issued invoice, owned by `billing`. A gateway webhook or UPI callback updates the
invoice's payment status; it never creates or backdates the invoice itself, and never
mutates a filed invoice row — payment status changes are new rows/events, consistent with
the append-only rule in `docs/architecture.md`.

Any change to what counts as "paid" for GST purposes (e.g. advance receipts, partial
payment treatment) is a statutory question and needs the retained CA's sign-off before it
ships — this ADR covers the integration mechanism, not the tax treatment.

## Consequences

- `billing` gains outbound calls to Razorpay/Cashfree APIs and inbound webhook routes
  (see [ADR-0006](0006-fastify-over-express.md) for why Fastify).
- Gateway credentials are secrets: follow the existing `.env` convention, never committed.
- The W6 storefront deposit question stays open in charter §7 until decided separately.
- GST treatment of advance receipts (already an open item, due 1 Oct) must be resolved with
  the CA before any deposit/advance-payment path ships, not just this invoice-collection path.
