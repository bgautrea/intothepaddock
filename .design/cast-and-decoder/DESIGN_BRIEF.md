# Design Brief: Cast & Decoder (Into the Paddock redesign)

> **Feature slug:** `cast-and-decoder`
> **Project:** intothepaddock.com — independent guide to Formula 1
> **Date:** 2026-05-04
> **Origin:** Output of grilling session (see `MEMORY.md` → `project_audience.md`, `project_design_locks.md`)

## Problem

She watched *Drive to Survive*. Now she's tuning into actual race broadcasts and going to her first live race in October. The commentary is dense with terms nobody explains ("undercut," "parc fermé," "blue flag," "VSC"). The personalities and storylines DTS gave her are missing on race day. The official sites read like a corporate press release. Wikipedia is a flat roster. Reddit is chaotic and assumes you've been watching for a decade. YouTube fragments her attention into 12-minute shards. She wants the cast and the context — fast — without being condescended to or buried in stats.

## Solution

A site that reads like *Drive to Survive without the documentary*: drivers and team principals are characters with personalities, current storylines, and rivalries; the broadcast vocabulary is one tap away from any page; the engineering and rules backbone is there for when she wants to go deeper. Not an encyclopedia, not a news site, not a fan blog. An opinionated, evergreen-heavy guide with three on-ramps: meet the cast, decode the broadcast, learn how the sport works.

## Experience Principles

1. **Cast over roster** — every page leads with personality and current storyline. Stats live in a sidebar. Resolves the tension between completeness and narrative in favor of narrative.

2. **Decode in seconds, not paragraphs** — broadcast vocabulary is searchable from the homepage, scannable on `/decoder`, and one tap away inline anywhere on the site. Resolves the tension between comprehensiveness and immediacy in favor of immediacy.

3. **Opinions, with rigor** — the site has takes; every take shows its work. Evidence and interpretation are kept distinct. Resolves the tension between neutrality and personality in favor of personality with discipline.

## Aesthetic Direction

- **Philosophy:** *Cinematic editorial.* A dark visual world (asphalt + kerb yellow + per-team accents) crossed with a magazine-profile editorial layer (sentence-case headings, photographic heros, pull-quotes on cast pages, drama-forward captions). Not "race report" minimalism, not "official" corporate, not "fan blog" chaos.

- **Tone:** Confident, warm, knowing-peer. Drama-forward; never breathless; never condescending. The site has opinions and shows them, but it argues them rather than asserting them.

- **Reference points:**
  - *The Athletic* — sports as narrative; opinionated longform; character-driven coverage.
  - *Drive to Survive* — cinematic dark visual world; narrative posture; willingness to dramatize.
  - *Stratechery* — institutional voice with confident takes; argument backed by paragraphs, not headlines.
  - *Pitchfork* — sentence-case headlines; opinion as currency; aesthetic seriousness.

- **Anti-references:**
  - Wikipedia — neutral, comprehensive, voiceless.
  - Official `f1.com` — corporate, brand-safe, dry.
  - r/F1 — chaotic, partisan, assumes deep priors.
  - The Race / RaceFans — race-by-race news treadmill; the lane this site explicitly does not compete in.

## Existing Patterns

The site already has a coherent design system. The brief extends it; it does not replace it.

- **Stack:** Astro 6 + MDX. No Tailwind, no UI framework. Pure CSS with custom properties.
- **Style files:** `src/styles/tokens.css` (design tokens), `src/styles/global.css` (resets, typography, utilities), `src/styles/kerb.css` (the kerb-stripe motif used as section dividers).
- **Typography:**
  - Display — Barlow Condensed (currently `text-transform: uppercase` on H1–H4 globally; **this default is being dropped** in favor of sentence case).
  - Body — Inter Variable.
  - Mono / numbers / labels — JetBrains Mono Variable.
  - Type scale — `--fs-200` (0.75rem) through `--fs-900` (clamp(2.75rem, 6vw, 5.5rem)).
- **Colors:**
  - Surfaces — `--asphalt-900` (#0e0f10) through `--asphalt-500`.
  - Accent — `--kerb-yellow` (#fce700) + `--kerb-yellow-dim`; `--kerb-white` (#f5f5f3).
  - Text — `--text-primary`, `--text-secondary`, `--concrete`, `--text-muted`.
  - Per-team accents — set per page via `--team-primary` (defaults to kerb yellow).
  - Telemetry — `--sector-purple`, `--sector-green`, `--sector-yellow`.
  - Tyre compounds — soft/medium/hard/intermediate/wet variables.
  - Flags — `--flag-red`, `--flag-blue`.
- **Spacing:** 8-step scale `--sp-1` through `--sp-24`.
- **Layout:** `--container-max: 1200px`; `--nav-height: 56px`; `.container` utility class.
- **Borders/radii:** `--radius-sm/md/lg`; `--border-thin`, `--border-bright`.
- **Shadows:** `--shadow-card`, `--glow-yellow`.
- **Motion:** `--ease-snap` cubic-bezier(0.2, 0.8, 0.2, 1); `--dur-fast` 120ms, `--dur-base` 200ms.
- **Existing components** (`src/components/`):
  - `cards/` — `EntityCard`, `StepCard`
  - `hero/` — `Hero`, `CarCutaway`, `CircuitMap`
  - `live/` — `NextRaceCountdown`, `LiveStandingsTable`
  - `nav/` — `StickyNav`, `Footer`
  - `ui/` — `KerbDivider`, `JargonTip`, `AnalogyCallout`, `SectorBadge`, `StatBlock`, `TyreChip`, `PhotoStrip`
- **Content collections** (`src/content/`): `drivers`, `teams`, `tracks` (per `content.config.ts`). Adding `glossary` collection in this redesign.
- **Data:** `src/lib/jolpica.ts` for live race / standings data; `src/lib/teamColors.ts` for accent fallbacks.

## Component Inventory

| Component | Status | Notes |
| --- | --- | --- |
| `BaseLayout` | Modify | Sentence-case heading change cascades through here via `global.css`. |
| `StickyNav` | Keep | On `--nav-height` token; review mobile collapse during impeccable. |
| `Footer` | Modify | Add "Independent and unofficial" trust line. |
| `Hero` | Modify | Support photographic primary visual; sub-variant for cast pages (CharacterHero). |
| `KerbDivider` | Keep | Strong visual signature; reuse as section break; `kerb.css` motif intact. |
| `EntityCard` | Modify | Add `characterRead` prop and render one-line hook above stats. |
| `StepCard` | Keep | Used in "how to read this site" merged into "how the sport works" intro. |
| `JargonTip` | Modify | Read from `glossary` collection (single source of truth); tap-friendly, not hover-only; link to `/decoder#term-slug`. |
| `AnalogyCallout` | Keep | Tier-2 explainer primitive. |
| `SectorBadge` | Keep | Niche; used in tier-2 strategy/race-weekend content. |
| `StatBlock` | Keep | Demoted to sidebar role on cast pages. |
| `TyreChip` | Keep | Niche; used in strategy/tyres content. |
| `PhotoStrip` | Modify | Promote to homepage cast strip and per-driver/team page imagery. |
| `NextRaceCountdown` | Modify | Demote from hero widget to slim band component for homepage "this weekend" rail. |
| `LiveStandingsTable` | Modify | Variant for "top 3" homepage preview; full-table variant lives on dedicated page. |
| `CarCutaway` | Keep | Used on `/the-car`. |
| `CircuitMap` | Keep | Used on `/tracks/[slug]`. |
| **`DecoderSearch`** | New | Live keyword search input + results list. Used on homepage and `/decoder`. Backed by Pagefind or MiniSearch index built from glossary collection. |
| **`DecoderEntry`** | New | Render a single glossary entry — term, definition, "you'll hear this when…" line, optional example. Used on `/decoder` and inside expanded `JargonTip`. |
| **`/decoder` page** | New | Anchor-categorized list of all glossary entries + sticky search + 6–8 quick-tap chips. |
| **`CastStrip`** | New | Homepage strip of 6 hand-curated drivers with portrait + character-read. Editorial selection, refreshed quarterly. |
| **`PrincipalStrip`** | New | Homepage sub-strip of 4–5 team principals with portrait + character-read. |
| **`StorylineCard`** | New | Card for the homepage "current storylines" band. Headline + 1–2 sentences + optional "read more →". Quarterly editorial. |
| **`CharacterHero`** | New | Driver/team page hero variant: photo + name + one-line character-read + current storyline. Replaces existing `Hero` for cast pages. |
| **`PullQuote`** | New | Magazine-style pull-quote primitive for cast pages. |
| **`WeekendBand`** | New | Slim mono band: top-3 driver/constructor standings + countdown + "full standings →". Replaces the full standings tables on the homepage. |

## Key Interactions

1. **Homepage decoder search.** User types in the inline search input. Results filter live below the input as they type (debounced 100ms). Tapping a result anchor-jumps to the corresponding entry on `/decoder`. Search is keyboard-navigable with up/down arrow keys; Enter selects.

2. **Inline `JargonTip`.** Any decoder term wrapped in `<JargonTip>` on any page. Default state: term is underlined with a subtle dotted yellow underline. Tap (mobile) or focus/click (desktop) expands a small inline definition card with the term, plain-language definition, and a "more →" link. The "more →" link anchor-jumps to `/decoder#term-slug`. Tapping outside or pressing Esc collapses the card.

3. **Cast strip and principal strip.** On the homepage, 6 driver portraits in a row (desktop) or horizontally-scrolling snap-to-card row (mobile). Each card shows portrait + name + character-read line + team color stripe. Tap → navigates to `/drivers/<slug>`. The principal sub-strip beneath behaves identically but links to `/teams/<slug>`.

4. **Storyline cards.** 3–4 cards in a row (desktop) or stacked (mobile). Headline + 1–2 sentences + optional "read more →". If a storyline has a destination article, the card links there; if not, the storyline lives entirely in the card body.

5. **Weekend band.** Always visible near the homepage footer. Shows top 3 in each championship + countdown to next race + "full standings →" link. No inline expansion — purely an at-a-glance hook back to live data.

6. **Character hero (cast pages).** Driver or team page opens with the new `CharacterHero` — full-bleed dark hero with portrait left, name + character-read + current storyline right (desktop); stacked on mobile. Career stats and historical depth scroll below.

7. **Skip-link.** Already implemented in `BaseLayout`; preserved.

## Responsive Behavior

Mobile-first. The phone-in-hand-during-race scenario governs decisions when there's tension.

- **Breakpoints (suggested, to be locked in tokens phase):** mobile ≤ 640px, tablet 641–880px, desktop ≥ 881px. The existing code uses `880px` and `640px` breakpoints in component-scoped media queries — reuse these for consistency.
- **Homepage:**
  - Cast strip: 6 cards in a row on desktop; on mobile, 1.2 cards visible with horizontal scroll-snap to give "there's more" affordance.
  - Decoder search: full-width input on mobile; capped width on desktop.
  - Weekend band: top 3 stacked vertically on mobile; horizontal on desktop.
  - "How the sport works" tile grid: existing `auto-fill, minmax(280px, 1fr)` behavior — keep.
- **Cast pages (driver/team):**
  - `CharacterHero`: photo above text on mobile; side-by-side (40/60 split) on desktop.
  - Stats sidebar: stacks below content on mobile; right rail on desktop.
- **Decoder page:**
  - Sticky search input at top on all breakpoints.
  - Category jump chips: horizontal scroll on mobile; wrapping rows on desktop.
- **Sticky nav:** review during impeccable phase — current implementation may need a hamburger on mobile.

## Accessibility Requirements

- **WCAG 2.1 AA.** Non-negotiable.
- **Contrast:**
  - Body text ≥ 4.5:1 against background.
  - Large text (≥ 18.66px regular or ≥ 14px bold) ≥ 3:1.
  - **Per-team accent colors must pass contrast against `--asphalt-900` background.** Some current team colors (e.g., dark blues) may fail; the impeccable audit covers this. Where a team color fails, use a brightened-for-contrast variant for text/links and reserve the true brand color for non-text accents (stripes, dividers).
- **Keyboard navigation:**
  - All interactive elements reachable via Tab; visible focus rings (existing: `outline: 2px solid var(--kerb-yellow); outline-offset: 2px`).
  - Decoder search: ↑/↓ arrows navigate results; Enter selects; Esc closes.
  - `JargonTip`: keyboard-activatable; never hover-only.
- **Skip link:** already implemented in `BaseLayout`; preserve.
- **Reduced motion:** already respected via `@media (prefers-reduced-motion: reduce)` in `global.css`; preserve and extend to any new motion.
- **Screen reader:**
  - Decoder search results announced via `aria-live="polite"`.
  - `JargonTip` uses `<button>` with `aria-expanded` and `aria-controls` linking to the inline panel.
  - Cast portraits: `alt` text uses the driver/principal's full name and one-line character read where appropriate (e.g., `alt="Lewis Hamilton — the most successful driver in F1 history, year two at Ferrari"`).
  - Decorative kerb stripes and visual flourishes: `aria-hidden="true"`.
- **Color is never the sole signal:** team accent colors are always paired with team name in text; tyre compound chips include the compound name, not just the color dot.
- **Reflow / zoom:** layouts must work at 200% zoom and 320px viewport width without horizontal scroll.

## Out of Scope (v1)

The following are explicitly **not** part of the v1 redesign. They land in v1.1 or later.

- The remaining ~16 driver pages beyond the 6 featured in the homepage cast strip.
- The remaining ~8 team pages beyond Mercedes (Toto), Red Bull (Horner-or-successor), and Ferrari (Vasseur).
- `/your-first-race` universal evergreen page + per-track "Going to a race here?" riders.
- Semantic / vector search on the decoder. v1 uses Pagefind or MiniSearch keyword search with a hand-curated synonym list.
- Race-by-race editorial coverage, post-race recaps, news posts.
- Runtime LLM features (Q&A, summarization). Author-time use of Claude to draft content is fine and encouraged.
- Quarterly editorial automation / cron. v1 is manually refreshed.
- USGP-specific or other per-race content pages.
- Authentication, comments, user accounts, newsletter, RSS.
- Multi-language / i18n.
- Tier-2 expansion: full rewrites of `/the-car`, `/race-weekend`, `/rules`, `/strategy`, `/tracks` content. Existing content stays; voice pass during build is opportunistic, not exhaustive.

## v1 "Done" Definition

The v1 redesign ships when:

1. `global.css` heading default is sentence case (not uppercase).
2. `EntityCard` carries the `characterRead` field and renders the one-liner.
3. `glossary` content collection schema is in place; ~30 race-control vocabulary entries authored.
4. `/decoder` page is live with search and category-jump anchors.
5. `JargonTip` is refactored to read from the glossary collection, is tap-friendly, and links to `/decoder#term-slug`.
6. 6 cast-strip driver pages are refactored to the `CharacterHero` model.
7. 3 team pages (Mercedes, Red Bull, Ferrari) are refactored with principal-as-character lede.
8. Homepage is redrafted: photographic hero, cast strip, principal strip, live decoder search, current storylines band (4 cards seeded), demoted "how the sport works" grid, slim weekend band.
9. Footer carries "Independent and unofficial" line.
10. WCAG 2.1 AA contrast audit passes (per-team accent variants resolved).
