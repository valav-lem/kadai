# Architecture

## Shape

One web app, one Postgres database, one deployment. The shop is a single tenant; premature
distribution buys nothing and costs a support burden.

```
browser (counter UI)  ──┐
browser (/book public) ─┼──▶  API (Node)  ──▶  Postgres
                        │           │
                        │           ├──▶ Tally Prime (XML over HTTP, LAN)
                        │           ├──▶ GSTN offline utility (JSON file out)
                        │           └──▶ SMS provider
                        └── local queue (IndexedDB) for offline bookings
```

## Domain modules

| Module | Responsibility | Workstream |
| --- | --- | --- |
| `bookings` | Slots, statuses, double-booking guard, staff assignment | W1 |
| `catalogue` | Products, services, HSN/SAC, GST slab, stock, reorder points | W2 |
| `customers` | Contact, GSTIN, visits, lifetime value | W1 |
| `billing` | Tax invoices, credit notes, payments | W3 |
| `gst` | Period aggregation, validation, GSTR-1/3B state machine, JSON export | W4 |
| `tally` | Voucher generation, ledger mapping, push, day-book import | W5 |
| `storefront` | Public booking page, reminders | W6 |
| `locale` | Message catalogue, formatting, bilingual print | W7 |

Modules talk through their own service interface, never by reaching into another module's
tables. `gst` and `tally` read from `billing`; nothing reads from `gst`.

## Invariants

1. **A GST rate is never entered on an invoice.** It is read from the catalogue item at the
   moment of billing and frozen on the invoice line.
2. **Double-booking is impossible, not discouraged.** Enforced by a database exclusion
   constraint on (staff, time range), not by application checks alone.
3. **Statutory records are append-only.** Corrections are new rows (credit note, revised
   return), never updates. No migration deletes them.
4. **Nothing is written to Tally without an explicit owner confirmation** of the mapping table.
5. **Every user-facing string resolves through the catalogue.** A missing Tamil key is a
   build failure, not a silent English fallback.

## Offline tolerance

The counter queues bookings and sales in IndexedDB and reconciles on reconnect, resolving
slot conflicts server-side by first-write-wins with an owner-visible conflict list.
Compliance screens (GST, Tally) require connectivity and say so plainly.

## Retention & backup

Invoices, returns, ARNs and import logs retained eight financial years. Nightly encrypted
backup off-site; a restore is rehearsed before go-live and quarterly thereafter
(see `runbooks/backup-restore.md`).
