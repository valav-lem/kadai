# 0003 · GSP integration, or stop at JSON export?

- **Status:** **Proposed** — decision needed by **15 Sep 2026**
- **Deciders:** Annachi Kadai Co (sponsor) + retained CA
- **Blocks:** W4 scope

## Context

Filing directly to GSTN requires either a GSP (GST Suvidha Provider) subscription with
API credentials, or the government's offline utility, into which a JSON file is loaded by
hand. A GSP costs roughly ₹25k–60k/year and is not in the current ₹18.4L budget.

Goal G2 in the PRD is "GSTR-1 filed within four days of period close." JSON export can meet
that; it costs the owner one manual upload per return.

## Options

1. **JSON export only (M2 scope as planned).** Cheapest, no vendor dependency, one manual step per return.
2. **GSP integration in v1.** One-click filing and ARN retrieval; new recurring cost, vendor onboarding, and a compliance dependency owned by a third party.
3. **JSON now, GSP as a post-go-live increment.** Export ships at M2; GSP is scoped separately once the shop has filed twice through Kadai.

## Recommendation

Option 3. The four-day goal does not need a GSP, and deferring keeps filing off the critical
path — the JSON export path must exist regardless, as the fallback.

## Consequences if deferred

- `GSP_PROVIDER` and credentials stay unset in `.env`; no GSP code in M2.
- The return state machine already models Filed → Acknowledged with an ARN, so a GSP can later fill in what the owner types by hand. No data-model change required.
