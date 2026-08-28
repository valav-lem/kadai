# Decision log

Architecture Decision Records. One file per decision, numbered, never deleted — a
superseded ADR gets a `Superseded by` line and stays.

Write one when a choice would otherwise be re-litigated in six months: a technology, a
boundary, an invariant, or a statutory interpretation that shapes the data model.

| # | Decision | Status |
| --- | --- | --- |
| [0001](0001-single-web-app.md) | One web app, one database, no microservices | Accepted |
| [0002](0002-tally-xml-with-file-fallback.md) | Tally push over XML, with the file always downloadable | Accepted |
| [0003](0003-gsp-integration-or-json-export.md) | GSP integration, or stop at JSON export? | **Proposed** — needed by 15 Sep |
| [0004](0004-tamil-first-locale.md) | Tamil as a first-class locale, enforced at build time | Accepted |
| [0005](0005-offline-first-counter.md) | The counter works offline; compliance screens do not | Accepted |

## Template

```markdown
# NNNN · Title

- **Status:** Proposed | Accepted | Superseded by ADR-NNNN
- **Date:** YYYY-MM-DD
- **Deciders:**

## Context
## Decision
## Consequences
```
