# Localisation

Tamil is a first-class locale, not a translation layer bolted on late. The owner should be
able to run the entire shop — including a GST return — without reading a word of English.

## Rules

1. **No string literals in views.** Every user-facing string is a key in `locales/en.json`
   and `locales/ta.json`, added in the same commit that introduces it.
2. **A missing Tamil key fails the build** (`npm run i18n:check`). There is no silent
   English fallback — a half-Tamil screen is worse than an English one.
3. **Statutory identifiers are never translated or transliterated.** GSTIN, HSN, SAC, ARN
   and return names (GSTR-1, GSTR-3B, CMP-08) appear exactly as the portal writes them,
   in Latin script and Latin numerals, in both locales.
4. **Money and numbers** use Indian digit grouping (₹1,23,456) in both locales. Statutory
   fields stay Latin-numeral regardless of locale.
5. **Typography.** A Tamil face with full conjunct coverage, set one step larger in
   line-height than Latin body copy; never letter-spaced.
6. **Data entry.** Customer names, item names and notes accept Tamil input and search
   correctly in Tamil (normalise before comparison).
7. **Print.** Invoices and receipts print bilingually — Tamil line above, English below.
8. **Switching.** Language is per user, changeable from anywhere, and persists across devices.

## Acceptance

A go-live gate: the owner completes a filing end-to-end with English disabled, unaided.

## Terminology

Statutory Tamil terminology varies between accountants. One reviewer signs off the glossary —
see [glossary-tamil.md](glossary-tamil.md). Do not coin a new term in a PR.
