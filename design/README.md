# Design

Kadai's interface follows the **Organic** design system: a cream-and-sand ground, terracotta
and sage accents, Caprasimo headings over Figtree, 16px radii growing into pills.

## Rules

- Take every colour, font, spacing and radius from the design tokens. Never hard-code a hex,
  a font name or a px value the tokens already carry.
- Interactive states are themed, never browser defaults — accent-ramp hover and pressed
  states, and a 2px accent `:focus-visible` ring.
- Left-aligned, asymmetric layouts. Photographs go through the `.washed` wrapper.

## Counter ergonomics — the shop owner is not 25

The dashboard is read across a counter, at arm's length, often in poor light.

- Body text never below 17px; metric figures 46px or larger.
- Hit targets never below 44px.
- Rules 3px, not hairlines. No thin greys — warmth and contrast, not delicacy.
- Tamil set one step larger in line-height than Latin, never letter-spaced.

## Artefacts

Interactive prototypes and printable documents live in the design workspace, not this repo.
Exported PDFs and screenshots belong in `design/exports/`.
