# Web

Two surfaces from one build:

- **Counter** — the owner and staff panel: dashboard, calendar, catalogue, customers, GST, Tally.
- **/book** — the public booking page: bookable services, open slots, GST-inclusive total.

## Rules

- Every string comes from the message catalogue. No literals in views.
- Colour, type, spacing and radius come from the Organic design tokens — never a raw hex or px.
- Counter targets are never below 44px; body text never below 17px (the owner is not 25).
- The counter queues bookings and sales offline; compliance screens require connectivity and say so.
