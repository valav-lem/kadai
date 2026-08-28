# GST compliance

## What Kadai is responsible for

Producing correct GSTR-1 and GSTR-3B figures **from the invoices it issued**, exporting them
in a form the portal accepts, and keeping a permanent record of what was filed. Kadai is not
an accounting ledger and does not interpret the law — the retained chartered accountant does.

## Where a rate comes from

The catalogue item, always. Every product carries an HSN code and every service a SAC code,
plus one GST slab (5 / 12 / 18 / 28%). Billing copies the rate onto the invoice line and
freezes it. An invoice may never carry a rate that was typed in.

## Return workflow

```
Review ──▶ Filed ──▶ Acknowledged
```

The current step is always visible. Moving to **Filed** requires every validation to pass.
Moving to **Acknowledged** requires an ARN, recorded permanently with the period, return
type, filing date and tax paid.

## Pre-filing validations

| Check | Failure blocks filing |
| --- | --- |
| Shop GSTIN checksum valid | Yes |
| Customer GSTIN checksum valid (B2B lines) | Yes |
| Every invoice line has an HSN or SAC | Yes |
| Line rate matches the catalogue item's current slab | Warns, owner must acknowledge |
| No completed job left unbilled in the period | Yes |
| Place-of-supply set on every B2B line | Yes |
| CGST + SGST vs IGST consistent with place of supply | Yes |

## Export

A GSTN offline-utility-compatible JSON can be produced at any stage, including before
filing, so the accountant can review it independently. Direct filing through a GSP is an
open decision — see [ADR-0003](decisions/0003-gsp-integration-or-json-export.md).

## Open statutory questions

- **CMP-08 / composition scheme** — in scope for v1? Owner: CA, needed by 15 Sep.
- **Advance receipts on bookings** — GST attracts on receipt; confirm treatment before M2. Owner: CA, needed by 1 Oct.

Neither is implemented until answered in writing.
