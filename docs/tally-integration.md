# Tally integration

Tally remains the book of record. Kadai hands over; it does not keep its own ledger.

## Outbound — vouchers to Tally

1. **Generate** vouchers for a period from invoices and completed jobs.
2. **Map** every voucher to a Tally ledger. Defaults come from the GST slab and are editable
   per row. Any row still mapped to *Suspense* blocks the push.
3. **Confirm.** Nothing is written to Tally until the owner confirms the mapping table.
4. **Push** XML over Tally's HTTP/ODBC interface to a named company.
5. **Report** created ledgers and conflicts back to the owner.

**The XML is always downloadable.** Tally Prime must be running on the LAN for a direct
push; a shop that is cloud-only cannot push, and the file is their path. The desktop
dependency is not ours to remove — see [ADR-0002](decisions/0002-tally-xml-with-file-fallback.md).

## Inbound — purchases from Tally

Accept a Tally day-book XML export, or an Excel sheet, for purchase entries. Every import
writes a log row: file, timestamp, row count, result. Logs are append-only.

## Version risk

Tally's interface differs across Prime versions. Test against **the shop's exact version in
week 2** of W5, before building on any assumption. Record the tested version here:

| Shop | Tally version tested | Date | Result |
| --- | --- | --- | --- |
| _(pilot shop)_ | TBA | — | — |
