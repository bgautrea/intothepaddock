# Design Tokens — Refinement Notes

> **Phase 4 deliverable.** This is *not* a regenerated tokens file; the existing `src/styles/tokens.css` system is solid and the redesign extends it. This document captures the audit findings and the additions made during the cast-and-decoder phase 4 pass.
> **Date:** 2026-05-04
> **Reads alongside:** `DESIGN.md` (root), `tokens.css` (the canonical source), `src/lib/teamColors.ts`.

## Decision: refine, don't regenerate

The existing token system already handles:

- Asphalt surface tiers (`--asphalt-900` → `--asphalt-500`)
- Kerb yellow + per-team accent override (`--team-primary`)
- Telemetry, tyre-compound, and flag-color palettes
- 8-step spacing scale (`--sp-1` → `--sp-24`)
- Display / body / mono type stack with a `--fs-200` → `--fs-900` ramp
- Border, radius, shadow, and motion primitives

The audit (`CURRENT_STATE_AUDIT.md`) flagged token-adjacent gaps but no fundamental token-system problems. So this phase adds tokens to fill the gaps; it does not redefine the existing palette or scale.

## Audit findings folded in

From `CURRENT_STATE_AUDIT.md`:

1. **[P2] Hardcoded hex codes** for homepage section accents (`#dc0000`, `#27f4d2`, `#ff8000`, `#b545ff`, `#2bbf4d`, `#1e41ff`) and a couple of pages. → **Resolved by adding section accent tokens** (see Additions §1 below). Page-level inline hex codes (`race-weekend.astro`'s `#d3aaff`, `#7be59a`) are flagged for fix during Phase 6 component pass; the tokens-phase decision is to *not* invent ad-hoc tokens for these — they should be replaced with existing `--sector-purple` / `--sector-green` (or brightened variants) when those pages are touched.

2. **[P2] Per-team accent contrast unaudited.** → **Resolved by adding `text` variants to `src/lib/teamColors.ts`** (see Additions §2 below) plus a `--team-primary-text` CSS custom property in `tokens.css`.

3. **[P2] EntityCard / StatBlock label sizes are sub-12px** (0.65rem and 0.7rem with letter-spacing). → **Not a token issue — a usage issue.** The components hardcode `font-size: 0.65rem` instead of using `--fs-200` (0.75rem). Fix during Phase 6 component pass; the `--fs-200` token is correct as-is.

4. **[P2] Nav and other components rely on inline transitions** rather than the existing `--ease-snap` / `--dur-fast` tokens. Mostly already correct; component pass should verify.

5. **No new spacing, border, or radius tokens needed.** The 8-step `--sp-*` scale and the three radius tokens (`sm`, `md`, `lg`) are sufficient for every new component.

## Additions

### 1. Section accent tokens (homepage tile grid + per-section eyebrows)

Added to `:root` in `src/styles/tokens.css`:

```css
--section-drivers: var(--kerb-yellow);  /* Section 01 — inherits the brand accent */
--section-teams: #dc0000;               /* Section 02 — Ferrari red */
--section-car: #27f4d2;                 /* Section 03 — Mercedes cyan */
--section-race-weekend: #ff8000;        /* Section 04 — McLaren orange */
--section-rules: var(--sector-purple);  /* Section 05 — sector purple #b545ff */
--section-tracks: #2bbf4d;              /* Section 06 — racing green */
--section-strategy: #1e41ff;            /* Section 07 — Red Bull blue */
```

**Why named per-section instead of a flat `--accent-1` … `--accent-7`:** the names carry meaning. If `Strategy` ever moves position in the IA, the token doesn't need renaming. Two section colors (`drivers`, `rules`) already alias an existing token; the rest are inline-defined here because they're identity values, not derived ones.

**Migration:** the inline `accent: '#dc0000'` etc. literals in `src/pages/index.astro` (and the `#fce700` in `src/pages/tracks/index.astro`) get replaced with `var(--section-teams)` etc. during Phase 6.

### 2. Per-team text-contrast variants

Added to `src/lib/teamColors.ts` as a `text` field on every entry:

```ts
'red-bull':     { primary: '#1e41ff', text: '#7d99ff', secondary: '#fcd700' },
ferrari:        { primary: '#dc0000', text: '#ff5050', secondary: '#fff200' },
'aston-martin': { primary: '#229971', text: '#3fd29f', secondary: '#000000' },
alpine:         { primary: '#0093cc', text: '#5cc8ed', secondary: '#ff87bc' },
'racing-bulls': { primary: '#6692ff', text: '#9ab8ff', secondary: '#1e3a8a' },
// teams whose brand color already passes contrast keep text === primary:
mercedes:       { primary: '#27f4d2', text: '#27f4d2', ... },
mclaren:        { primary: '#ff8000', text: '#ff8000', ... },
williams:       { primary: '#64c4ff', text: '#64c4ff', ... },
haas:           { primary: '#b6babd', text: '#b6babd', ... },
audi:           { primary: '#00d639', text: '#00d639', ... },
cadillac:       { primary: '#c9a96e', text: '#c9a96e', ... },
```

Plus a getter:

```ts
export function getTeamTextColor(slug: string): string;
```

**The five teams with distinct text variants:**
- **Red Bull** `#1e41ff` → `#7d99ff` — saturated dark blue fails ~3:1 against asphalt.
- **Ferrari** `#dc0000` → `#ff5050` — pure red is borderline; the brightened variant gives breathing room for body text and links.
- **Aston Martin** `#229971` → `#3fd29f` — the racing green is the textbook borderline F1 color.
- **Alpine** `#0093cc` → `#5cc8ed` — saturated mid-blue, similar issue to Red Bull.
- **Racing Bulls** `#6692ff` → `#9ab8ff` — passable for large text but tight for body.

**Variants are hand-tuned, not algorithmically derived.** OKLCH-style lightness shifts often desaturate visibly; manual selection preserves the team-color *feel* better.

**Use rule:** components that put a team color on text or link content read from `getTeamTextColor()` and set `--team-primary-text`. Components that use a team color for non-text accents (the 4px `card-stripe`, `KerbDivider` overlays, photo-edge stripes on `CharacterHero`) read from `getTeamColor()` / `--team-primary`.

### 3. New CSS custom properties for redesign components

Added to `:root`:

```css
--team-primary-text: var(--kerb-yellow);  /* default; overridden per page */
--character-hero-stripe: 4px;             /* CharacterHero accent stripe width */
--decoder-search-bg: var(--asphalt-800);  /* DecoderSearch input/results bg */
--decoder-search-z: 60;                   /* above StickyNav (z=50) */
--weekend-band-height: 56px;              /* slim band, matches --nav-height */
```

The `--weekend-band-height` deliberately matches `--nav-height` (56px) so the band feels like a structural element, not a content block.

`--decoder-search-z` is one above the existing nav `z-index: 50` so the mobile search overlay covers the nav (intended — the search is full-attention).

### 4. No font-stack changes

`Inter Variable` + `JetBrains Mono Variable` + `Barlow Condensed` (via fontsource subsets) is the locked stack. No additions, no swaps, no Google Fonts links.

### 5. No motion-token changes

`--ease-snap` (cubic-bezier(0.2, 0.8, 0.2, 1)) and `--dur-fast` / `--dur-base` (120ms / 200ms) are the canonical motion primitives. New components use these. The audit's reduced-motion findings are already handled in `global.css`.

## Open token questions deferred to Phase 6

- **Should the `text` variants from `teamColors.ts` also expose a `--team-primary-text` CSS custom property at the page level, set in `Astro.set` on the page frontmatter?** Likely yes; the cleanest pattern is to set both `--team-primary` and `--team-primary-text` from the same getter call. Confirmed during Phase 6.
- **Do any tier-2 explainer pages (`race-weekend`, `strategy`) want their own `--page-accent` token?** Currently they hardcode page-specific tints (`#d3aaff`, `#7be59a`). Either replace with existing telemetry tokens (`--sector-purple`, `--sector-green`) or define a `--page-accent` per page. Defer until those pages get their voice pass.
- **Should `KerbDivider` variants gain a `--kerb-block-size` token to make the stripe block size configurable from the outside, instead of being hardcoded inside `kerb.css`?** Probably no — the variants (thick / default / thin) are deliberate. Resist over-tokenizing.

## What did NOT change

- `--asphalt-*` palette: unchanged.
- `--kerb-*` palette: unchanged.
- `--text-*` tiers: unchanged.
- `--sector-*`, `--flag-*`, `--tyre-*` palettes: unchanged.
- Spacing scale: unchanged.
- Type ramp `--fs-200` → `--fs-900`: unchanged.
- Border, radius, shadow, motion tokens: unchanged.

The token system is the part of the existing site that was already working.
