## What and why

<!-- One paragraph. What changes at the counter, not what changed in the code. -->

**Workstream:** W_ · **Milestone:** M_ · **Closes:** #

## Checklist

- [ ] Tests pass and lint is clean
- [ ] Strings added to `locales/en.json` **and** `locales/ta.json`
- [ ] No hard-coded GST rate — rates come from the catalogue item
- [ ] Money formatted with Indian digit grouping; statutory fields Latin-numeral
- [ ] No migration deletes or rewrites an invoice, return, ARN or import log
- [ ] Design follows the Organic tokens — no hard-coded hex or px the tokens carry
- [ ] New architectural choice recorded as an ADR under `docs/decisions/`

## Statutory impact

<!-- Does this change what appears on an invoice or in a filed return? If yes, link the
     CA's written decision. If no, write "none". -->

## How it was tested

<!-- Include the counter path you walked, not just unit tests. -->
