# 0008 · The shipped UI diverges from the Organic design system

- **Status:** **Proposed** — the team must pick a direction; this ADR only records the conflict
- **Date:** 2026-09-19
- **Deciders:** Annachi Kadai Co, lead engineer, design

## Context

`design/README.md` specifies the **Organic** design system: a cream-and-sand ground,
terracotta and sage accents, Caprasimo headings over Figtree, 16px radii growing into pills.
It also carries a set of *counter ergonomics* rules that are not taste but a product mandate
— the dashboard is read across a counter, at arm's length, often in poor light, by an owner
who is not 25.

The React + Material UI counter merged in PRs #1–#3 ships a different system: a Modern SaaS
palette (`--color-canvas: #F8FAFC`, `--color-slate: #2563EB`, `--color-border: #E2E8F0`) set
in Plus Jakarta Sans and Inter. This was not a decision anyone recorded; two strands of work
simply arrived at different answers, and the merged one is what runs today.

Some of the divergence is pure aesthetics and reasonable people can differ. The rest
contradicts rules written down as requirements:

| Rule in `design/README.md` | Shipped in `src/web/styles/` |
| --- | --- |
| Body text never below 17px | `--font-size-base: 15px`; MUI `fontSize: 14`; components at `0.85rem`–`0.95rem` |
| Metric figures 46px or larger | `--font-size-metric: 36px` |
| Hit targets never below 44px | `--min-hit-target: 40px` |
| Rules 3px, not hairlines. No thin greys | `--border-rule-thick: 1px`, `--color-border: #E2E8F0` |
| Tamil one step larger in line-height, **never letter-spaced** | `--line-height-tamil: 1.6` vs Latin `1.5`; `theme.js` applies `letterSpacing: -0.01em`…`-0.03em` to every heading variant |
| Cream-and-sand ground, terracotta and sage | Near-white `#F8FAFC`/`#FFFFFF`; blue `#2563EB` carries the "confirmed" state |
| Caprasimo over Figtree | Plus Jakarta Sans over Inter |

`main.css` does try to defend the Tamil rule with `body.lang-ta { letter-spacing: 0 !important }`,
but that does not reach MUI headings: `letter-spacing` is inherited, and an element carrying its
own declaration uses that declaration regardless of an ancestor's `!important`. Every `h1`–`h6`
rendered through the MUI theme is letter-spaced in Tamil too.

Worth noting separately: `--font-size-metric`, `--min-hit-target` and `--border-rule-thick` are
declared in `tokens.css` and referenced nowhere. Component sizing comes straight from
`theme.js`, so the tokens file reads as the contract while the theme is what actually renders.

A separate but related problem: `src/web/index.html` loads all three families from the Google
Fonts CDN. [ADR-0005](0005-offline-first-counter.md) requires the counter to work offline, so
a shop with a dropped connection gets an unpredictable system fallback — including for Tamil.
Self-hosting via `@fontsource` packages avoids this regardless of which typefaces win.

## Decision

**Not yet made.** This ADR exists so the conflict is visible and is not rediscovered in six
months. The options, as they stand:

1. **Re-skin to Organic.** Keep the React components and data flow; swap the token values and
   the MUI theme back to `design/README.md`.
2. **Adopt the SaaS direction.** Rewrite `design/README.md` to match what shipped, and retire
   the Organic system.
3. **Split the difference.** Take the SaaS palette and typography, but restore the counter
   ergonomics rules — those are an accessibility floor for the actual user, not a style.

Whichever is chosen, the losing artefact gets retired rather than left to rot: either
`design/README.md` is rewritten, or `tokens.css` and `theme.js` are brought into line.

## Consequences

- Until this is resolved, `design/README.md` does **not** describe the running application.
  Treat it as aspirational, not as the spec, and do not cite it in review as though the code
  is in breach of an agreed decision.
- The counter-ergonomics rows above should be settled on their own merits even if the palette
  question stays open — they were written for a specific user in specific lighting, and the
  shipped values are below every one of those floors.
- The Google Fonts dependency should be resolved independently of the palette question; it is
  an offline-tolerance defect under ADR-0005, not a matter of taste.
- No code changes are made by this ADR.
