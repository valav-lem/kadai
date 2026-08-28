# 0002 · Tally push over XML, with the file always downloadable

- **Status:** Accepted
- **Date:** 2026-08-11
- **Deciders:** Annachi Kadai Co, lead engineer, CA

## Context

Tally Prime exposes an XML/ODBC interface over HTTP, but only while the desktop application
is running on the LAN. The interface also differs across Prime versions. A shop whose
accountant keeps Tally on their own machine cannot be pushed to at all.

## Decision

Push vouchers as XML to a named Tally company over HTTP when it is reachable — and
**always** make the same generated XML available as a download, at every step, whether or
not the push succeeded.

## Consequences

- The hand-off never hard-fails: the worst case is a file emailed to the accountant.
- We test against the pilot shop's exact Tally version in week 2 of W5 before building further.
- Two code paths to maintain, and the file path must stay first-class rather than becoming a neglected fallback.
- Nothing is written to Tally without explicit owner confirmation of the ledger mapping.
