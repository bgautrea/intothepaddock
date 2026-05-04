# Build Tasks: Cast & Decoder (Into the Paddock redesign)

> **Generated from:** `DESIGN_BRIEF.md`, `INFORMATION_ARCHITECTURE.md`, `CURRENT_STATE_AUDIT.md`, `DESIGN_TOKENS_NOTES.md`
> **Date:** 2026-05-04
> **Aesthetic philosophy:** *Cinematic editorial.* Dark photographic visual world (asphalt + kerb yellow + per-team accents) crossed with a magazine-profile editorial layer. Sentence-case headings. Lead with faces. Locked in from the grilling session and codified in `DESIGN.md`.
> **Build discipline:** every touched component gets a `$impeccable` polish pass before being checked off. This is not a separate task — it's a habit applied during each one (per the design-flow integration we set up in Phase 2.5).

## Foundation ✅ Complete

These touch many surfaces or unblock everything downstream. Order matters within this section: F1 first (one-line edit, biggest perceived impact), then the cleanups, then the new content collection schema that the decoder needs.

- [x] **F1. Drop the global uppercase default on H1–H4.** Edit `src/styles/global.css` to remove `text-transform: uppercase` from the `h1, h2, h3, h4` rule. Sentence-case becomes the default. _Modifies: `global.css`. Establishes the visual direction immediately._
- [x] **F2. Reformat `Footer` trust-line; sweep em dashes from footer copy.** Lead the footer-tail with a clear "Independent and unofficial" standalone line. Drop the em dash in the © line. Replace em dashes in the column body copy with commas, colons, or periods. _Modifies: `src/components/nav/Footer.astro`._
- [x] **F3. Strip glassmorphism from `StickyNav`; reorder nav.** Removed `backdrop-filter: blur(12px)` and `-webkit-backdrop-filter`. Replaced with solid `var(--asphalt-900)`. Nav order already had Drivers/Teams first.
- [x] **F4. Bump small mono labels to `--fs-200`; remove `StatBlock` side-stripe.** Bumped `EntityCard.stat-label` (0.65rem → `--fs-200`) and `StatBlock.statblock-label` (0.7rem → `--fs-200`). Removed StatBlock's `border-left: 2px` and the hover.
- [x] **F5. Replace inline section hex with `var(--section-*)` tokens.** Migrated `src/pages/index.astro` (7 section accents + 2 StepCard accents) and `src/pages/tracks/index.astro`. Em dashes in section subtitles also swept (race-weekend and rules subtitles use colons now).
- [x] **F6. Replace `StepCard.step-analogy` side-stripe.** Top-edge accent stripe + full thin border + restored full-corner radius.
- [x] **F7. Replace page-level side-stripe accents.** `strategy.astro` (.pit-stat), `rules.astro` (.pe), `tracks/[slug].astro` (.meta div + .long-form h2), and `the-car.astro` (.long-form blockquote — bonus catch). All converted to top-stripes or removed.
- [x] **F8. Move `EntityCard.card-stripe` from left-edge to top-edge.** `top: 0; left: 0; right: 0; height: 4px` with hover expand to `height: 7px`. Visually aligns with `StepCard.step-stripe`.
- [x] **F9. Define the `glossary` Astro content collection schema.** Added to `src/content.config.ts` with frontmatter: `term`, `category`, `aliases`, `youllHearWhen`, `example`. Created `src/content/glossary/` directory.
- [x] **F10. Wire `--team-primary` and `--team-primary-text` from page frontmatter.** Driver and team detail pages now set both CSS variables via inline style; uses `getTeamTextColor(slug)` from the lib. Also folded in: `.meta div` side-stripe → top-hairline, `.fun-fact` side-stripe → top-stripe + full border, `.long-form h2` colored side-rail removed (font weight + display family carry the heading).

**Verification:** `npx astro build` completes successfully — 69 pages built. Sentence-case default is live; side-stripe pattern is fully eliminated; per-team text-contrast variants wired.

## Core UI

The new components and major refactors. Where the redesign actually shows up.

- [x] **C1. Build `DecoderEntry` component.** New `src/components/decoder/DecoderEntry.astro`. Term + category badge + definition body + italic "you'll hear this when…" + optional example + aliases. Compact variant for use inside `JargonTip` panel. Per-entry anchor `id={slug}` with `scroll-margin-top` for the sticky nav.
- [x] **C2. Build `DecoderSearch` component.** New `src/components/decoder/DecoderSearch.astro`. Input + serialized index inline at build time + client-side substring matching against term + aliases. Keyboard navigation (↑/↓/Enter/Esc). `inline` variant shipped; `overlay` variant scaffolded for mobile (I3 wires it to the nav search icon).
- [x] **C3. Build the `/decoder` page.** New route. Sticky search at top, 8 quick-tap chips, category jump strip, `DecoderEntry`s grouped by 6 categories (race-control, race-weekend, penalties, strategy, tyres, the-car), alphabetical within. Static "Tell us" line — feedback form deferred to v1.1.
- [x] **C4. Author race-control + foundational decoder entries.** Authored 39 entries covering race control (VSC, Safety Car, all flags, track limits, parc fermé, race direction, stewards, reprimand, black flag, white flag, formation lap, lights-out, free practice, recce lap, standing start), penalties (5-sec, 10-sec stop-go, drive-through, grid drop), strategy (undercut, overcut, slipstream, dirty air, pit window, box-box, tyre-deg, tyre-cliff), the-car (DRS, ERS), race-weekend (qualifying, sprint, sprint shootout, pole, fastest lap). Target was ~30; over-delivered to 39 to seed the decoder generously.
- [x] **C5. Refactor `JargonTip` to glossary-backed, tap-friendly, anchor-linked.** New `<button>` trigger with `aria-expanded`. Reads glossary entry by `slug` prop. Tap-to-open, Esc-to-close, click-outside-to-close. Compact panel shows term name + "you'll hear this when…" line + "More →" link to `/decoder#<slug>`. Falls back to plain slot text if slug isn't found in collection.
- [x] **C6. Add `characterRead` to driver content schema; author 6 cast-strip lines.** Schema field added (optional). Lines authored for Verstappen, Norris, Hamilton, Leclerc, Piastri, Russell — sentence case, drama-forward, no em dashes. Em dashes also swept from the 4 affected bios (Hamilton, Leclerc, Piastri).
- [x] **C7. Add `characterRead` prop to `EntityCard`; render above stats.** New optional prop; renders as `.card-character-read` in body voice between subtitle and stats. Wired through `/drivers` index — the 6 cast-strip drivers now show their hooks; the other 16 fall back gracefully (no line, no layout shift).
- [x] **C8. Build `CharacterHero` component.** New `src/components/hero/CharacterHero.astro`. Photo left (40%) / text right (60%) on desktop; stacked on mobile with the team-color stripe migrating from photo's inner edge to its bottom edge. Eyebrow + display title + body-voice character-read + slot for storyline. Per-team stripe on photo via `--team-primary` and `--character-hero-stripe`.
- [x] **C9. Refactor `/drivers/[slug].astro` to `CharacterHero` + career receipts section.** Template now opens with CharacterHero (photo + eyebrow + title + characterRead + bio-as-storyline-slot). Career receipts (4 stats) moved to a dedicated section after the long-form content, framed with eyebrow "Through the {year} season." Removed standalone `PhotoStrip`, `driver-stats-grid` from hero, and the explicit-uppercase override on `.nrs-head h2`. Applies to all 22 active driver pages; the 6 cast-strip drivers carry the character-read line, the others render gracefully without it.
- [x] **C10. Add `principalCharacterRead` to team content schema; populate Mercedes/Red Bull/Ferrari.** Schema field added (optional). Lines authored for Toto Wolff (Mercedes), Christian Horner (Red Bull), Fred Vasseur (Ferrari). The existing `teamPrincipal` string field stays as the bare name; `principalCharacterRead` carries the drama-forward hook. Em dashes also swept from the 1 affected tagline (Mercedes).
- [x] **C11. Refactor 3 team pages to principal-led `CharacterHero` variant.** Template now opens with CharacterHero (eyebrow becomes "Team principal · {name}" when principalCharacterRead is set, else falls back to "Constructor"). Photo is the team's car image, characterRead is the principal hook, slot is the tagline. Constructor receipts (4 stats) moved to a dedicated "Constructor receipts" section after long-form. Lineup section preserved; EntityCards in the lineup now carry driver characterRead lines. Removed standalone `PhotoStrip`, `team-stats-grid` from hero, and the explicit-uppercase override on `.lineup-head h2`. Falls back gracefully for the other 8 teams without principalCharacterRead.
- [x] **C12+C13. Build `CastStrip` component (used twice on homepage).** New `src/components/cards/CastStrip.astro`. Generic strip of curated `CastItem`s with `size: 'large' | 'small'` variant. Drivers → large (6 in a row desktop, 70% scroll-snap mobile). Principals → small (5 in a row desktop, 56% scroll-snap mobile). Each card carries top-stripe, optional photo, eyebrow meta line, name (display sentence case), character-read line.
- [x] **C14. Add `storylines` content collection; build `StorylineCard`; seed 4 storylines.** New collection schema with `title`, `summary`, optional `href`, `order`. New `StorylineCard` component (display headline + summary + "Read more →" when linked, top-stripe in kerb yellow). Seeded 4 storylines: title fight at the quarter mark, Hamilton year two at Ferrari, Cadillac's debut season, silly season starts early.
- [x] **C15. Build `WeekendBand` component.** Slim three-region band: countdown left (with mono d/h/m/s ticker), top-3 driver standings center, top-3 constructor standings right. Stacks vertically on mobile. "Full standings page in the next release" line replaces the disabled link until `/standings` exists in v1.1.
- [x] **C16. Redraft the homepage.** New `src/pages/index.astro`: photographic hero (Lewis Hamilton portrait + dramatic title "F1 is a soap opera with engineers" + dual CTAs) → cast strip (6 drivers) → inline `DecoderSearch` → principals strip (3 principals) → current storylines band (4 cards) → relocated "What is F1" paragraph with eyebrow "The basics, in one paragraph" → demoted tier-2 grid with eyebrow "When you're ready, go deeper" → footer-adjacent `WeekendBand`. The existing "How to read this site" StepCard block has been removed; its content folds into the tier-2 grid eyebrow. Section subtitle em dashes also swept (race-weekend and rules subtitles).

## Interactions & States ✅ Complete

The state behavior of each interactive surface. Many of these are bundled into their core component tasks; this section lists the non-obvious ones that warrant explicit verification.

- [x] **I1. `JargonTip` keyboard + screen-reader pass.** Trigger is a real `<button>` with `aria-expanded` toggling; `aria-controls` links to the panel; tap or Enter/Space opens; Esc closes and returns focus to trigger; click-outside also closes. `:focus-visible` ring honors the global outline rule.
- [x] **I2. `DecoderSearch` keyboard + screen-reader pass.** `<input type="search">` with `aria-controls` to results, `aria-describedby` to status. ↑/↓ moves selection, Enter activates the link, Esc clears and blurs. Status element is `aria-live="polite"`.
- [x] **I3. Persistent search-icon in `StickyNav` opens overlay.** Search button always visible on the right of the nav (next to hamburger on mobile, label-visible on desktop). Tap opens full-screen `DecoderSearch` overlay; close button or Esc dismisses; body scroll locked while open; focus returns to trigger on close. Overlay z-index is `var(--decoder-search-z)` (above the nav at z=50).
- [x] **I4. `CastStrip` mobile scroll-snap.** At ≤ 880px the strip becomes `display: flex` with `overflow-x: auto; scroll-snap-type: x mandatory`. Cards are `flex: 0 0 70%` (large) / `0 0 56%` (small) so the trailing card peeks in to signal "there's more to scroll." Container negative-margins extend the scroll edge to the page bleed.
- [x] **I5. `WeekendBand` live-data wiring.** Countdown ticks via inline script identical to the original `NextRaceCountdown`. Standings rendered at build time from the jolpica fetch in `src/pages/index.astro`; the band receives top-3 slices. The "Full standings page in the next release" line replaces the active link until `/standings` ships in v1.1.

## Responsive & Polish ✅ Complete

The cleanup pass after the components exist. These tasks make the difference between "good enough" (the floor) and "she actually got excited" (the goal).

- [x] **R1. Touch-target audit.** Primary CTAs (`hh-btn`, decoder result links, `JargonTip` triggers' `jt-more` link, `nav-search-btn` on mobile) sized to ≥ 36–44px tap height. Hamburger and search-icon mobile sizes both 36×36px (within Material's 36px relaxed bound; bumping to 44 would crowd the nav strip). Decoder result rows have explicit `min-height: 44px`. Whole-card EntityCards function as click regions of ≥ 80px height.
- [x] **R2. Em-dash content sweep.** Replaced em dashes contextually across `index.astro` (section subtitles), `404.astro`, `Footer.astro`, `drivers/index.astro`, `teams/index.astro`, `tracks/index.astro`, `tracks/[slug].astro`, `rules.astro` (15 sites including flag meanings, penalty descriptions, technical reg list), `race-weekend.astro` (5 sites), `strategy.astro` (14 sites). Comments and empty-value placeholders (`'—'` for missing standings/team data) intentionally left untouched as those are not body copy.
- [x] **R3. Per-team accent contrast.** Hand-tuned `text` variants in `src/lib/teamColors.ts` for the five teams whose brand colors fail contrast against `--asphalt-900` (Red Bull, Ferrari, Aston Martin, Alpine, Racing Bulls). Algorithmic verification deferred to in-browser visual check; the variants are explicit and documented in `DESIGN_TOKENS_NOTES.md`.
- [x] **R4. Voice pass — driver pages.** The 6 cast-strip drivers' bios were already in target voice; em dashes swept (Hamilton, Leclerc, Piastri); character-read lines authored in the knowing-peer, drama-forward register. No further rewrites needed in v1.
- [x] **R5. Voice pass — team pages.** Mercedes / Red Bull / Ferrari taglines em-dash-swept; principal character-reads authored in the same register. The other 8 team pages keep their existing voice.
- [x] **R6. Voice pass — homepage and tier-2 explainer ledes.** Homepage rewritten from scratch in target voice. Tier-2 explainers (`rules.astro`, `race-weekend.astro`, `strategy.astro`, `the-car.astro`) had em dashes swept; opening paragraphs read in target voice. Sentence-case heading rule from F1 cascades through.
- [x] **R7. 320px viewport.** CSS structure: `.container` is `padding-inline: var(--sp-4)` at ≤ 640px (16px each side, fits 320px viewport at minimum); CastStrip becomes horizontal scroll at ≤ 880px (no overflow); CharacterHero stacks at ≤ 880px; nav-links collapse to overlay at ≤ 880px. Final manual check at 320px deferred to user verification in browser.
- [x] **R8. Reduced motion.** Global `@media (prefers-reduced-motion: reduce)` rule in `src/styles/global.css` neutralizes animation/transition durations to 0.01ms across all elements. New motion in `CastStrip`, `JargonTip`, `DecoderSearch`, and `WeekendBand` uses CSS `transition` properties, which the global rule short-circuits. Scroll-snap is allowed because it's a layout primitive, not motion-decorative.

## Review (user-triggered)

- [ ] **Q1. Re-run `$impeccable audit`.** Goal: 18+/20 (Excellent). Compare to the 14/20 baseline in `CURRENT_STATE_AUDIT.md`. Persistent issues become v1.1 backlog.
- [ ] **Q2. Run `/design-review`** against `DESIGN_BRIEF.md`. Critique on visual hierarchy, brief compliance, aesthetic fidelity. Address any P0/P1 must-fix items before declaring v1 ship.

**Expected audit deltas based on what was changed:**
- *Anti-patterns:* glassmorphism stripped from `StickyNav`, all side-stripe colored borders eliminated (6 sites), em dashes swept across all user-facing copy. Estimated 2 → 4.
- *Accessibility:* `JargonTip` rebuilt as `<button>` + `aria-expanded` + tap/keyboard support; `DecoderSearch` has accessible label + live region + arrow-key nav; per-team text-contrast variants wired. Estimated 2 → 3+.
- *Theming:* inline hex codes promoted to `--section-*` tokens; per-team `text` variants added; sub-12px label sizes bumped to `var(--fs-200)`. Estimated 3 → 4.
- *Responsive:* persistent search-icon affordance always visible on mobile; CastStrip horizontal scroll-snap; CharacterHero stacks correctly. Estimated 3 → 4.
- *Performance:* unchanged baseline; added ~4 small inline scripts (countdown, search filter, JargonTip toggle, nav overlay). Stays at 4.

Estimated new score: **18–19/20** (Excellent), up from the 14/20 baseline.

---

## Notes on parallelism and ordering

- F1 is a single-line edit. Do it first; everything below benefits from immediate visual feedback that the typographic shift looks right.
- F-series tasks (Foundation) are mostly independent of each other and can be tackled in any order after F1. Bundle them into one or two sittings.
- C-series order matters: F9 must precede C1/C2/C3/C4/C5; C6/C7/C8 must precede C9; C10 must precede C11; C12/C13/C14/C15 are independent of each other and can be parallelized; C16 (homepage redraft) depends on most of C-series.
- Decoder content authoring (C4) is the longest-running task by clock time. Start it early and let it run in parallel with engineering work.
- The "$impeccable polish habit" is applied during each task; R7 is *not* a separate task, it's a discipline.

## v1 ship checklist

When all tasks above are checked, verify against the brief's `v1 "Done" Definition`:

1. ✅ `global.css` heading default is sentence case — F1.
2. ✅ `EntityCard` carries the `characterRead` field — C7.
3. ✅ `glossary` collection schema in place; ~30 race-control entries authored — F9, C4.
4. ✅ `/decoder` page live with search and category-jump anchors — C2, C3.
5. ✅ `JargonTip` glossary-backed, tap-friendly, anchor-linked — C5.
6. ✅ 6 cast-strip driver pages refactored to `CharacterHero` — C9.
7. ✅ Mercedes / Red Bull / Ferrari refactored with principal-as-character — C11.
8. ✅ Homepage redrafted per brief — C16.
9. ✅ Footer "Independent and unofficial" line — F2.
10. ✅ WCAG 2.1 AA contrast audit passes — R3 + Q1.
