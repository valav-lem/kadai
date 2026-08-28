# 0001 · One web app, one database, no microservices

- **Status:** Accepted
- **Date:** 2026-08-11
- **Deciders:** Sunil Kadam (sponsor), lead engineer

## Context

Kadai serves a single shop. The team is two engineers and a half-time designer over four
months. Support after go-live is the same two people.

## Decision

One web application, one Postgres database, one deployment unit. Domain separation is
enforced by module boundaries in code (`bookings`, `catalogue`, `billing`, `gst`,
`tally`, `storefront`, `locale`), not by network boundaries.

## Consequences

- A local transaction spans billing and compliance; no distributed consistency problem to solve.
- One thing to deploy, back up, restore and reason about at 8pm when the shop is filing.
- Multi-tenant or multi-branch operation would need real work later. That is out of scope and accepted as future cost.
- Module boundaries must be defended in review, since nothing physical enforces them.
