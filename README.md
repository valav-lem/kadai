# Kadai · கடை

One back office for the Indian neighbourhood business that sells goods **and** time.
Appointment book, product and service catalogue, customer ledger, GST returns and the
Tally hand-off live in a single panel, so the owner never leaves the counter to stay compliant.

> Status: **pre-M1** · Pilot target Q4 2026 · Languages: English + தமிழ்

## Why

A retail-plus-service shop runs three books that never agree — a paper diary, a billing app
that knows nothing about slots, and an accountant who receives a shoebox on the 8th. Kadai
collapses them into one.

## Scope

**In:** bookings, catalogue with HSN/SAC and GST slabs, customers, invoicing, GSTR-1 / 3B
workflow, Tally hand-off, public booking page, Tamil locale, roles.

**Out (v1):** e-way bills, payroll, multi-branch inventory, our own accounting ledger,
e-commerce checkout. Tally remains the book of record.

## Repository map

| Path | What lives there |
| --- | --- |
| `docs/` | PRD, charter, architecture, compliance and integration notes |
| `docs/decisions/` | Architecture Decision Records (ADRs) |
| `docs/runbooks/` | Release, backup/restore, filing-day procedures |
| `src/server/` | API, domain modules, database schema |
| `src/web/` | Counter UI and the public booking page |
| `locales/` | Message catalogues — `en.json`, `ta.json` |
| `design/` | Design-system notes and exported artefacts |

## Getting started

```bash
cp .env.example .env
npm install
npm run db:migrate
npm run dev            # counter UI at :5173, API at :3000
```

## Documents

- [Product Requirements](docs/prd.md) — what we build and why
- [Project Charter & Plan](docs/project-charter.md) — who, when, budget, risk
- [Architecture](docs/architecture.md)
- [GST compliance](docs/gst-compliance.md) · [Tally integration](docs/tally-integration.md)
- [Localisation](docs/localisation.md) · [Tamil glossary](docs/glossary-tamil.md)
- [Decision log](docs/decisions/README.md)

## Milestones

| Milestone | Scope | Gate | Date |
| --- | --- | --- | --- |
| M1 Counter | Calendar, catalogue, customers, roles | Shop runs a full day in Kadai, paper diary closed | 26 Sep 2026 |
| M2 Compliance | Invoicing, GSTR-1 / 3B, JSON export | CA signs off one dry-run return | 31 Oct 2026 |
| M3 Books | Tally push and day-book import | Accountant accepts a pushed period uncorrected | 28 Nov 2026 |
| M4 Storefront & Tamil | Public page, reminders, full Tamil locale | Tamil-only filing test passes | 19 Dec 2026 |
| Go-live | — | Sponsor sign-off; support rota in place | 22 Dec 2026 |

## Conventions

- No string literals in views — every user-facing string goes through the message catalogue.
- Statutory identifiers (GSTIN, HSN, SAC, ARN, return names) are **never** translated or localised.
- Invoices, returns, ARNs and import logs are append-only, retained eight financial years.

## Licence

Proprietary — © Kadam & Co., Pune. See [LICENSE](LICENSE).
