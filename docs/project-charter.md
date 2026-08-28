# Kadai · கடை — Project Charter & Plan

> v1.0 · 11 Aug 2026 · Annachi Kadai Co · Owner: Annachi Kadai Co
> Phase **Build · M1** · 16 weeks · Budget **₹18.4L** · Go-live **22 Dec 2026**

Operational companion to the [PRD](prd.md). The PRD says *what* we are building and why;
this says who builds it, in what order, with what money, against which risks, and how we
will know it worked.

## 1 · Charter — திட்ட நோக்கம்

**Mandate.** Replace the three disconnected books of a retail-plus-service shop — paper
diary, billing app, accountant's shoebox — with one panel that runs the counter and closes
the month. Success is judged on the shop floor, not in the codebase: the owner files GSTR-1
within four days of period close, without help, in Tamil if they prefer.

**Sponsor & decision rights.** Annachi Kadai Co is sponsor and sole product decision-maker.
Statutory interpretation is decided by the retained chartered accountant, not by the team.
Anything affecting filed returns needs both signatures.

**In scope:** bookings, catalogue with HSN/SAC and slabs, customers, invoicing,
GSTR-1 / 3B workflow, Tally hand-off, public booking page, Tamil locale, roles.
**Out of scope:** e-way bills, payroll, multi-branch inventory, our own accounting ledger,
e-commerce checkout.

## 2 · Workstreams — பணிப்பிரிவுகள்

| # | Workstream | Owns | Exit criterion |
| --- | --- | --- | --- |
| W1 | Counter | Calendar, bookings, staff, roles | A walk-in booked in 4 taps; no double-booking possible |
| W2 | Catalogue | Products, services, stock, slabs | Every item carries HSN/SAC and a slab; stock decrements on sale |
| W3 | Billing | Invoices, credit notes, payments | Completed job produces a compliant tax invoice unattended |
| W4 | Compliance | GSTR-1 / 3B, validation, JSON | A full period passes validation and files with an ARN recorded |
| W5 | Books | Tally push, day-book import | 142 vouchers pushed with zero manual re-entry |
| W6 | Storefront | Public page, SMS reminders | Customer books online; it lands as Pending in the calendar |
| W7 | Tamil | Locale, glossary, bilingual print | Owner completes a filing end-to-end with English disabled |

## 3 · Timeline — கால அளவு

| Milestone | Workstreams | Gate | Date |
| --- | --- | --- | --- |
| M1 Counter | W1, W2 | Shop runs a full day in Kadai, paper diary closed | 26 Sep 2026 |
| M2 Compliance | W3, W4 | CA signs off one dry-run return for Aug | 31 Oct 2026 |
| M3 Books | W5 | Accountant accepts a pushed period without corrections | 28 Nov 2026 |
| M4 Storefront & Tamil | W6, W7 | Tamil-only filing test passes; 10 online bookings taken | 19 Dec 2026 |
| Go-live | — | Sponsor sign-off; support rota in place | 22 Dec 2026 |

**Sequencing rule.** Nothing in W4 starts before W3 produces real invoices — a returns
workflow built on fixtures always mis-models the shop. W7 runs as a thin thread from week
one (every string externalised on the day it is written) and lands as a milestone only for
glossary review and bilingual print.

## 4 · Team & responsibilities

| Role | Who | Commitment | Accountable for |
| --- | --- | --- | --- |
| Sponsor / PO | Annachi Kadai Co | 6 hr/week | Scope calls, priority, acceptance |
| Lead engineer | TBA | Full-time | Architecture, W3–W5, releases |
| Engineer | TBA | Full-time | W1, W2, W6 |
| Designer | TBA | Half-time | Counter ergonomics, elder-readable type, Tamil layout |
| Chartered accountant | Retained | 4 hr/month | Statutory correctness, return sign-off, Tamil glossary |
| Pilot staff | Asha, Ravi, Meera | 2 hr/week | Counter testing, walk-in flow feedback |

## 5 · Technical approach

- **Shape.** One web app, one database, no microservices. The shop is a single tenant; premature distribution buys nothing and costs a support burden. → [ADR-0001](decisions/0001-single-web-app.md)
- **Offline tolerance.** The counter must take a booking when the connection drops: bookings and sales queue locally and reconcile on reconnect. Compliance screens may require connectivity. → [ADR-0005](decisions/0005-offline-first-counter.md)
- **Tally.** XML over Tally's HTTP/ODBC interface to a named company, with the generated XML always downloadable as a fallback. → [ADR-0002](decisions/0002-tally-xml-with-file-fallback.md)
- **GSTN.** M2 ships offline-utility JSON. A GSP integration is a deliberate later decision (§7) so it never blocks filing. → [ADR-0003](decisions/0003-gsp-integration-or-json-export.md)
- **Localisation.** No string literals in views; one message catalogue per locale; statutory identifiers never pass through translation. → [ADR-0004](decisions/0004-tamil-first-locale.md)
- **Data retention.** Invoices, returns, ARNs and import logs are append-only and retained eight financial years. Nothing statutory is ever hard-deleted.

## 6 · Budget — செலவு மதிப்பீடு

| Line | Basis | Amount |
| --- | --- | ---: |
| Engineering | 2 engineers × 4 months | ₹12,80,000 |
| Design | Half-time × 4 months | ₹2,40,000 |
| CA retainer | 4 months | ₹60,000 |
| Infrastructure & SMS | Hosting, backups, 12 months of messages | ₹96,000 |
| Contingency | 10% on the above | ₹1,67,600 |
| **Total** | Through go-live | **₹18,43,600** |

Excluded: a GSP subscription (₹25k–60k/yr if §7 resolves in favour), and any Tally licence
upgrade the shop's version requires.

## 7 · Open decisions

| Decision | Owner | Blocks | Needed by |
| --- | --- | --- | ---: |
| GSP integration, or stop at JSON export? | Sponsor + CA | W4 scope | 15 Sep |
| Composition scheme (CMP-08) in v1? | CA | W4 data model | 15 Sep |
| GST treatment of advance receipts on bookings | CA | W3 invoicing | 1 Oct |
| Tamil terminology for statutory concepts — one reviewer | Sponsor | W7 glossary | 1 Nov |
| Payment collection: UPI intent link or gateway? | Sponsor | W3, W6 | 15 Oct |

## 8 · Risk register

| Risk | P × I | Mitigation |
| --- | --- | --- |
| Tally interface differs across Prime versions | High × High | Test against the shop's exact version in week 2; always offer XML download |
| Filed return proves wrong after go-live | Low × Severe | Two dry-run periods before any live filing; CA sign-off gate at M2 |
| Staff revert to the paper diary | Medium × High | Counter flow tested with staff weekly from M1; paper closed only after a clean full day |
| Tamil shipped as an afterthought | Medium × High | Strings externalised from week one; Tamil-only acceptance test is a go-live gate |
| Sponsor is also the shopkeeper — review time slips | High × Medium | Fixed 90-minute Monday review before opening; async approvals otherwise |
| Scope creep from adjacent asks (payroll, branches) | Medium × Medium | Parked in a named backlog; no mid-milestone additions |

## 9 · Governance & acceptance

- **Cadence.** Monday 90-minute review with the sponsor; monthly CA session; a written milestone gate memo at each of M1–M4.
- **Change control.** Anything that moves a milestone date or the budget needs sponsor sign-off in writing. Statutory changes need the CA too.
- **Definition of done.** Shipped means used at the counter for one full trading day without falling back to paper or a spreadsheet.
- **Acceptance at go-live.** (i) a Tamil-only filing completed unaided, (ii) a period pushed to Tally with no manual entry, (iii) 4-tap walk-in booking verified by two staff, (iv) restore-from-backup rehearsed successfully.

---

Sign-off: **Annachi Kadai Co · Sponsor** ______________ · **Chartered Accountant** ______________
