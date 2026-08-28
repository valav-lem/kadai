# Server

Node, one process. Domain modules under `modules/`, each owning its own tables and exposing
a service interface. Nothing reaches into another module's tables.

```
modules/
  bookings/    W1  slots, statuses, double-booking guard
  catalogue/   W2  products, services, HSN/SAC, slabs, stock
  customers/   W1  contact, GSTIN, visits, lifetime value
  billing/     W3  tax invoices, credit notes, payments
  gst/         W4  period aggregation, validation, GSTR-1/3B, JSON export
  tally/       W5  voucher generation, ledger mapping, push, day-book import
  storefront/  W6  public booking page, reminders
  locale/      W7  message catalogue, formatting, bilingual print
```

Dependency direction: `gst` and `tally` read from `billing`. Nothing reads from `gst`.

Schema in `db/schema.sql`. Read `../../docs/architecture.md` before adding a module.
