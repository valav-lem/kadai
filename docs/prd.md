# Kadai · கடை — Product Requirements

> v1.0 · August 2026 · Confidential · Owner: Annachi Kadai Co · Target: Pilot, Q4 2026

Kadai is a bookings-first back office for the Indian neighbourhood business that sells goods
*and* time. One panel holds the appointment book, the product and service catalogue, the
customer ledger, GST returns and the Tally hand-off — so the owner never leaves the counter
to stay compliant.

## 1 · The problem — பிரச்சினை

A retail-plus-service shop runs three books that never agree: a paper appointment diary, a
billing app that knows nothing about slots, and an accountant who receives a shoebox on the
8th of every month. Reconciliation is manual, GSTR-1 goes out late, and the owner discovers
a stockout only when a customer is standing in front of them.

- Bookings live outside the system that issues invoices, so revenue can't be forecast from the diary.
- HSN and SAC codes are entered per invoice instead of per catalogue item, producing rate mismatches at filing time.
- Tally entry is re-typed from bills — the largest recurring source of error and of the accountant's fee.

## 2 · Goals — இலக்குகள்

| Goal | Measure | Target |
| --- | --- | --- |
| One book for time and stock | Bookings created inside Kadai | > 95% |
| Filing without an all-nighter | Days from period close to GSTR-1 filed | ≤ 4 |
| No re-typing into Tally | Vouchers pushed vs. keyed by hand | 100% pushed |
| Counter-speed operation | Taps to create a walk-in booking | ≤ 4 |
| Works in the owner's language | Full UI parity in Tamil | 100% of strings |

**Non-goals for v1:** e-way bills, payroll, multi-branch inventory transfer, e-commerce
storefront, and any accounting ledger of our own — Tally remains the book of record.

## 3 · Who it is for — யாருக்கு

- **The owner (primary).** Sets prices and GST rates, watches the day, files returns. Wants the whole shop on one screen and no accountant surprises.
- **Counter staff (daily).** Books walk-ins, marks arrivals and completions, sells products. Should never see compliance screens.
- **The accountant (occasional).** Reviews the return, pulls the JSON, imports vouchers. Needs an audit trail more than a dashboard.

## 4 · Requirements — தேவைகள்

### 4.1 Booking calendar · முன்பதிவு நாட்காட்டி

- Week grid across working hours, one column per day, filterable by staff member; staff are colour-coded.
- Clicking an empty cell opens a booking form pre-filled with that day, hour and staff.
- A booking carries customer, service, staff, duration and a status of Pending → Confirmed → Arrived → Completed.
- Double-booking a staff member in one slot must be **blocked, not warned**.
- Completing a booking creates a draft tax invoice at the catalogue's rate and GST slab.

### 4.2 Products & services · பொருட்கள் மற்றும் சேவைகள்

- Two catalogues in one list, switched by tab: products carry an HSN code and stock; services carry a SAC code and a duration.
- Every item stores its GST slab (5 / 12 / 18 / 28%) once, at the item — never at the invoice.
- A per-item *bookable online* switch controls what the public page shows.
- Stock decrements on sale; items at or below their reorder point surface on the dashboard.
- Search spans name, description, HSN and SAC.

### 4.3 GST filing · ஜிஎஸ்டி தாக்கல்

- Period selector; per-period totals for taxable value, CGST, SGST and IGST derived from invoices, not entered.
- GSTR-1 and GSTR-3B each move through **Review → Filed → Acknowledged**, with the current step always visible.
- Validation before filing: GSTIN checksum, missing HSN/SAC, rate mismatch against the catalogue, unbilled completed jobs.
- Export a GSTN-offline-utility-compatible JSON at any stage.
- Filing history retains period, return type, ARN, filing date and tax paid, permanently.

### 4.4 Tally import · டேலி இறக்குமதி

- Generate vouchers for a period from invoices and completed jobs; nothing is written to Tally until the owner confirms.
- A mapping table pairs every voucher with a Tally ledger, defaulted by GST slab and editable per row; anything mapped to Suspense blocks the push.
- Push over Tally's XML/ODBC interface to a named company; report created ledgers and conflicts.
- Inbound: accept a Tally day-book XML or an Excel sheet for purchase entries.
- An import log keeps file, timestamp, row count and result.

### 4.5 Customers, staff and the public page

- Customer record: name, mobile, optional GSTIN, visit count, lifetime value, booking history. B2B customers are those with a GSTIN.
- Roles: Owner (all), Staff (calendar, catalogue read, customers), Accountant (GST, Tally, read-only elsewhere).
- A customer-facing page at `/book` shows bookable services, open slots and a GST-inclusive total; a confirmation lands in the owner's calendar as Pending.
- SMS/WhatsApp confirmation and a same-day reminder.

## 5 · Tamil support — தமிழ் ஆதரவு

Tamil is a first-class locale, not a translation layer bolted on late. The owner should be
able to run the entire shop — including a GST return — without reading a word of English.

| Area | Requirement |
| --- | --- |
| Coverage | Every UI string, validation message, empty state and toast ships in Tamil; no mixed-language screens. |
| Typography | A Tamil face with full conjunct coverage, set one step larger in line-height than Latin body copy; never letter-spaced. |
| Data entry | Customer names, item names and notes accept Tamil input and search correctly in Tamil. |
| Numbers & money | Indian digit grouping (₹1,23,456) in both locales; statutory fields stay Latin-numeral. |
| Statutory text | Return names, ARNs, HSN/SAC and GSTIN remain untranslated — they must match the portal exactly. |
| Documents | Invoices and receipts print bilingually: Tamil line above, English below. |
| Switching | Language is per user, changeable from anywhere, and persists across devices. |

## 6 · Release plan — வெளியீட்டுத் திட்டம்

| Phase | Scope | When |
| --- | --- | --- |
| M1 — Counter | Calendar, catalogue, customers, roles | Sep 2026 |
| M2 — Compliance | Invoicing, GSTR-1 / 3B workflow, JSON export | Oct 2026 |
| M3 — Books | Tally push and inbound day-book import | Nov 2026 |
| M4 — Storefront & Tamil | Public booking page, reminders, full Tamil locale | Dec 2026 |

## 7 · Risks & open questions

- Tally's interface differs across Prime versions and requires the desktop app running — a cloud-only shop cannot push. *Mitigation:* always offer the XML file as a fallback.
- Direct GSTN filing needs a GSP or the offline utility. **Open:** GSP for v1, or stop at JSON export? → [ADR-0003](decisions/0003-gsp-integration-or-json-export.md)
- Composition-scheme shops need CMP-08, not 3B. **Open:** in scope for v1?
- Advance receipts for bookings attract GST on receipt. **Open:** confirm treatment with the accountant before M2.
- Tamil terminology for statutory concepts varies between accountants — glossary needs one reviewer to sign off.
