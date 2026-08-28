# Contributing to Kadai

## Ground rules

1. **Nothing statutory is decided in code review.** GST treatment, return contents and
   voucher mapping are decided by the retained chartered accountant. A PR that changes
   them carries a link to that written decision.
2. **Every user-facing string is externalised on the day it is written** — `en.json` and
   `ta.json` in the same commit. A PR that adds an English-only string does not merge.
3. **Append-only means append-only.** No migration deletes or rewrites an invoice, a
   return, an ARN or an import log.

## Branches and commits

- Branch from `main`: `w4/gstr1-validation`, `fix/double-booking-race`.
  The prefix is the workstream (`w1`–`w7`) or `fix` / `chore` / `docs`.
- Conventional commits: `feat(gst): validate GSTIN checksum before filing`.
- Squash on merge. The PR title becomes the changelog line.

## Workstreams

| # | Workstream | Owns |
| --- | --- | --- |
| W1 | Counter | Calendar, bookings, staff, roles |
| W2 | Catalogue | Products, services, stock, slabs |
| W3 | Billing | Invoices, credit notes, payments |
| W4 | Compliance | GSTR-1 / 3B, validation, JSON |
| W5 | Books | Tally push, day-book import |
| W6 | Storefront | Public page, SMS reminders |
| W7 | Tamil | Locale, glossary, bilingual print |

## Definition of done

Shipped means used at the counter for one full trading day without falling back to paper
or a spreadsheet. Until then it is merged, not done.

## Checklist before you open a PR

- [ ] Tests pass locally (`npm test`) and lint is clean (`npm run lint`)
- [ ] Strings in `locales/en.json` **and** `locales/ta.json`
- [ ] No hard-coded GST rate — rates come from the catalogue item
- [ ] Money formatted with Indian digit grouping; statutory fields Latin-numeral
- [ ] Touching a filed return, an ARN or an import log? Link the CA's written decision
- [ ] New architectural choice? Add an ADR under `docs/decisions/`

## Design

The UI follows the Organic design system. Take colour, type, spacing and radius from its
tokens; do not hard-code a hex or a px value the tokens already carry. See `design/README.md`.
