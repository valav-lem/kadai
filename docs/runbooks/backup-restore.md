# Runbook · Backup and restore

Invoices, returns, ARNs and import logs are retained **eight financial years** and are
append-only. Losing them is the worst outcome this project can produce.

## Backup

- Nightly encrypted dump, off-site, 02:00 IST. Retention: 30 daily, 12 monthly, 8 yearly.
- Weekly automated check that the newest dump restores into a scratch database and its
  invoice count matches production.

## Restore rehearsal

Rehearsed **before go-live** and **quarterly** thereafter. Record each rehearsal:

| Date | Dump used | Restore time | Invoice count matched | By |
| --- | --- | --- | --- | --- |
| — | — | — | — | — |

## Real restore

1. Put the app in maintenance; tell the owner immediately, in plain language, what is lost and what is not.
2. Restore the newest dump that passed its check into a fresh database.
3. Verify: newest invoice number, filed-return ARNs, import-log tail.
4. Reconcile the gap by hand with the owner — the counter's local queue may still hold bookings and sales made since the dump.
5. Written note to the sponsor and CA if any filed period was touched.
