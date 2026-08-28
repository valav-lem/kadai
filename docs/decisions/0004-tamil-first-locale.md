# 0004 · Tamil as a first-class locale, enforced at build time

- **Status:** Accepted
- **Date:** 2026-08-11
- **Deciders:** Annachi Kadai Co, designer, lead engineer

## Context

Bilingual products routinely ship the second language late and half-done: a Tamil menu over
English dialogs and English validation messages. The shop owner's ability to file unaided
in Tamil is a go-live acceptance criterion, not a nice-to-have.

## Decision

- No string literals in views; every string is a catalogue key added in the same commit.
- `npm run i18n:check` fails the build on a key present in `en.json` and missing in `ta.json`. No silent English fallback.
- Statutory identifiers (GSTIN, HSN, SAC, ARN, return names) never pass through translation, in either locale.
- Money uses Indian digit grouping in both locales; statutory fields stay Latin-numeral.

## Consequences

- Every feature PR carries a Tamil string, so translation debt cannot accumulate.
- A blocked build when the glossary term is undecided — accepted; that is the pressure that keeps §7's glossary reviewer engaged.
- Layouts must tolerate longer Tamil strings and a larger line-height from the start.
