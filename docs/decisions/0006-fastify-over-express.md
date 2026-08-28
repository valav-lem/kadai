# 0006 · Fastify over Express for the API server

- **Status:** Accepted
- **Date:** 2026-08-28
- **Deciders:** Annachi Kadai Co, lead engineer

## Context

The API was scaffolded on Express. Payment gateway integration (see
[ADR-0007](0007-payment-collection-via-gateway.md)) means the server will soon carry
webhook endpoints from Razorpay and Cashfree that must validate signed payloads against a
strict schema and respond correctly under retries, plus the UPI intent/QR flow. Express has
no native request/response schema validation; that logic would be hand-rolled per route.

## Decision

Use Fastify instead. It validates requests and serializes responses against JSON Schema at
the route level, which keeps webhook payload handling declarative rather than imperative,
and its plugin encapsulation model fits the domain-module boundary already described in
`docs/architecture.md` (each module registers its own routes and schemas without reaching
into another's).

## Consequences

- `src/server/index.js` and any future route modules use Fastify's route/plugin API, not
  Express middleware conventions.
- Payment webhook routes should define an explicit JSON Schema for the gateway payload as
  they're built, rather than parsing `req.body` unchecked.
- No functional change to the counter or public booking page; this is server-internal.
