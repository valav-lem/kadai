# 0005 · The counter works offline; compliance screens do not

- **Status:** Accepted
- **Date:** 2026-08-11
- **Deciders:** Sunil Kadam, lead engineer

## Context

The shop's connection drops. A customer standing at the counter cannot be told "the internet
is down." Conversely, a GST return filed against stale local data would be a statutory error.

## Decision

Bookings and sales queue locally (IndexedDB) and reconcile on reconnect. Slot conflicts
resolve server-side, first-write-wins, with an owner-visible conflict list. GST and Tally
screens require connectivity and say so plainly rather than degrading.

## Consequences

- Two write paths for bookings and sales; conflict UI is real work in W1.
- Invoice numbering must tolerate offline issuance — sequence reserved per device.
- No ambiguity about whether a return was computed from complete data.
