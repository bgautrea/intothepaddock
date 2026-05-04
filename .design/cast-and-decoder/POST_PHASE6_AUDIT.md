# Post-Phase-6 Audit — Into the Paddock

> **Generated:** 2026-05-04 via `$impeccable audit` (Q1 in the Q-series)
> **Compares against:** `CURRENT_STATE_AUDIT.md` (14/20 baseline, captured pre-redesign)
> **Build verified:** `npx astro build` clean, 70 pages, 12.27s

The cast-and-decoder Phase 6 build closed most of the baseline P1 / P2 issues. This re-score documents what improved, what's still open, and what to target before declaring v1 shipped.

## Audit Health Score

| # | Dimension | Baseline | Now | Delta | Key Finding |
|---|---|---|---|---|---|
| 1 | Accessibility | 2 | **3** | +1 | `JargonTip` is now button-driven and tap-friendly; `StickyNav` 36px buttons remain the only sub-44px touch targets |
| 2 | Performance | 4 | **4** | 0 | Astro static, build clean, decoder index inlined at build-time |
| 3 | Theming | 3 | **3** | 0 | Section accents tokenised; `rules.astro` flag swatches and `race-weekend.astro` brightened sector colors still hardcoded |
| 4 | Responsive | 3 | **3** | 0 | Decoder result links hit 44px; CharacterHero / 320px viewport not yet browser-verified |
| 5 | Anti-Patterns | 2 | **3** | +1 | Glassmorphism, side-stripes, hover-only `JargonTip` all gone; **em dashes survive in `.md` content** |
| **Total** | | **14/20** | **16/20** | **+2** | **Good — close one P1 (em-dash sweep) and one P2 (rules flag tokens) for 18+** |

**Rating band:** 16/20 — Good, address weak dimensions before shipping. Baseline forecast (18-19) was optimistic; the markdown em-dash residue is the gap.

## Anti-Patterns Verdict

**Pass with one residual policy violation.** Almost every aesthetic-level slop tell from the baseline is gone:

- ✅ **Glassmorphism removed** — `StickyNav` is now solid `var(--asphalt-900)` with a thin border. No `backdrop-filter` anywhere in `src/`.
- ✅ **Side-stripe colored borders eliminated** — `EntityCard.card-stripe` and `StepCard.step-stripe` are top-edge. `StepCard.step-analogy` uses a `border-top` (not `border-left`). `StatBlock` has no left rail. Page-level `border-left` accents are gone from `strategy.astro`, `rules.astro`, `tracks/[slug].astro`.
- ✅ **`JargonTip` is keyboard- and tap-driven** — real `<button>` with `aria-expanded`, content-collection-backed, Esc closes, click-outside closes. The decoder JTBD is now serviceable on phone.
- ✅ **Sentence-case headings** — global `text-transform: uppercase` is off; uppercase survives only on labels, eyebrows, and the masthead, as intended.
- ✅ **No gradient text, no hero-metric templates, no identical card grids in tier-1 IA, no bounce easing.**

The one remaining policy violation: **em dashes in `.md` content collections**.

## Em-Dash Sweep Was Incomplete (P1)

The Phase 6 sweep cleaned `.astro` page files (zero em dashes in those today), but the `.md` and `.mdx` content collections were not touched. They carry **300+ em dashes across 56 files**:

| File category | Em dashes | Worst offenders |
|---|---|---|
| `src/content/topics/the-car.mdx` | 30 | the deepest tier-2 explainer |
| `src/content/drivers/*.md` (24 files) | ~120 total | `jim-clark.md`, `oliver-bearman.md`, `michael-schumacher.md` (6 each) |
| `src/content/tracks/*.md` (24 files) | ~110 total | `monaco.md` (6); most others 4-5 |
| `src/content/teams/*.md` (8 files) | ~13 total | `audi.md` (3); `williams.md`, `racing-bulls.md`, `haas.md`, `alpine.md` (2 each) |

Body copy on every cast page is rendered through MDX from these markdown files. From the reader's perspective, this *is* user-facing copy — the DESIGN.md ban applies. Examples:

- `lewis-hamilton.md:23` — *"Hamilton holds essentially every accumulated record in F1 — wins, poles, podiums, points-finishes, fastest laps."*
- `ferrari.md:20` — *"They've won 16 constructors' championships — more than anyone — and built dynasties around Niki Lauda…"*
- `the-car.mdx:38` — *"A 'graining' tyre — one that has overheated and is shedding rubber crumbs — can lose 1.5 seconds a lap…"*

The fix is a content-pass per file, not a bulk replace — many of these em dashes are doing different work (parenthetical, list separator, dramatic pause) and the right substitute differs by case. `$impeccable clarify` per file during the v1.1 voice pass is the cleanest way; but if `/design-review` (Q2) flags this as a v1 blocker, it becomes a Phase 6 patch.

## Detailed Findings by Severity

### P1 — Major (close before declaring v1 shipped)

#### [P1] Em dashes pervasive across 56 markdown content files

- **Location:** `src/content/{drivers,teams,tracks}/*.md` and `src/content/topics/the-car.mdx`
- **Category:** Anti-Pattern (DESIGN.md "no em dashes in copy")
- **Impact:** The `.astro` sweep is complete, but the body copy that renders through MDX still uses em dashes liberally. `the-car.mdx` alone has 30, including in dramatic-pause and parenthetical positions. Reader sees them on every cast page and tier-2 deep-dive.
- **Recommendation:** Per-file content sweep using contextual substitutes (commas, colons, semicolons, periods, parentheses). Treat as part of the Tier-2 voice rewrites slated for v1.1, or pull forward as a Phase 6 patch if `/design-review` (Q2) flags it.
- **Suggested command:** `$impeccable clarify` per content file during the voice pass.

### P2 — Minor (should fix during v1.1)

#### [P2] `rules.astro` flag swatches use raw hex, duplicating existing tokens

- **Location:** `src/pages/rules.astro:328-353`
- **Category:** Theming
- **Impact:** Flag swatches `.flag-swatch--yellow`, `--red`, `--blue`, `--green`, `--white`, `--black` use raw hex codes (`#f4d03f`, `#ff2e2e`, `#2e7bff`, `#2ecc71`, `#f5f5f3`, `#0e0f10`) that already exist as `--sector-yellow`, `--flag-red`, `--flag-blue`, `--sector-green`, `--kerb-white`, `--asphalt-900`. The chequered-flag and meatball-flag gradients also reassemble these from raw hex. Drift risk if any token shifts.
- **Recommendation:** Replace with `var()` references. The chequered gradient remains the trickiest because gradients can't easily inline tokens; consider an `--asphalt-900` and `--kerb-white` substitution or extract into a small named gradient token.
- **Suggested command:** `$impeccable polish rules.astro` or fold into the v1.1 backlog.

#### [P2] `race-weekend.astro` `block--quali` and `block--sprint` use brightened raw hex

- **Location:** `src/pages/race-weekend.astro:258, 270`
- **Category:** Theming
- **Impact:** `#d3aaff` (brightened sector-purple) and `#7be59a` (brightened sector-green) are used as body-text colors over a tinted background. They're contrast-corrected variants of `--sector-purple` and `--sector-green` but never made into tokens.
- **Recommendation:** Add `--sector-purple-text` and `--sector-green-text` brightened-for-text variants in `tokens.css`, mirroring the `--team-primary-text` pattern that already exists for team colors.
- **Suggested command:** `$impeccable extract` to promote, then update the call sites.

#### [P2] `StickyNav` action buttons are 36px (sub-44px touch target)

- **Location:** `src/components/nav/StickyNav.astro:172-173, 195-205`
- **Category:** Accessibility / Responsive
- **Impact:** The decoder-search trigger and the mobile-menu toggle are both 36×36px. WCAG 2.5.5 (AAA) recommends 44×44px; 2.5.8 (AA, level AA in WCAG 2.2) requires 24×24px so this isn't a strict failure. But on mobile, where the search button is the entry point to the decoder JTBD, 44px would be a meaningful target upgrade and align with `DecoderSearch.ds-result-link` which already hits 44px.
- **Recommendation:** Bump `min-width` and `height` on `.nav-search-btn` and `.nav-toggle` to 44px on the mobile breakpoint. Desktop can remain at 36px since the click target is mouse-driven.
- **Suggested command:** `$impeccable adapt StickyNav` for the mobile breakpoint.

### P3 — Polish (fix if time permits during v1.1)

- **[P3] `JargonTip.jt-more` link is 28px tall (`min-height: 28px`).** Inside an already-open panel on a tap surface, so probably fine; bump to 36-44px if a polish pass touches it.
- **[P3] Body line-length max-width is set per-component, not via a shared utility.** Hero (56ch), CharacterHero (56-60ch), homepage prose (60-70ch) all hit the 65-75ch range, but a `.prose` utility class would prevent drift. Could consolidate post-launch.
- **[P3] `prefers-reduced-motion` is global-only.** The `global.css` reset disables all transitions/animations under reduced motion. New motion (`CastStrip` scroll-snap, `EntityCard` hover-lift, `DecoderSearch` focus-within) inherits the reset, but per-component opt-in would be more explicit. Defer.
- **[P3] `LiveStandingsTable` full-table variant is dead code on the homepage.** Replaced by `WeekendBand`. Either ship `/standings` to keep the variant alive (already on the v1.1 backlog) or delete. No active impact.

## Patterns & Systemic Issues

1. **Content-collection sweeps don't follow `.astro` sweeps.** The em-dash issue makes this concrete: when DESIGN.md adds a copy rule, the script that polices it has to traverse `.md`, `.mdx`, AND `.astro`. Worth writing a one-liner check (`grep -r "—" src/content/ | wc -l`) into a pre-commit hook or `$impeccable audit` rerun.
2. **The token-vs-hex line is now drawn at SVG vs CSS.** SVG illustrations (`CarCutaway`, `CircuitMap`) keep raw hex inline because tokens don't inline cleanly into SVG attributes. CSS / Astro everywhere else uses `var()`. This is a defensible split; just document it in `DESIGN.md` so the convention sticks.
3. **Touch-target consistency is uneven.** `DecoderSearch` results hit 44px; `StickyNav` action buttons sit at 36px; `JargonTip.jt-more` sits at 28px. Worth a single pass to converge on 44px for primary mobile interactive targets.

## Positive Findings (preserve and extend)

- **Section accent token system is genuinely clean** — `--section-drivers` … `--section-strategy` give every tier-1 entry-point a tokenised identity color that the homepage and section ledes both reference.
- **Per-team text-contrast variants are wired correctly** — `teamColors.ts` carries both `primary` (raw brand) and `text` (brightened-for-AA) for all 11 constructors. Mercedes, McLaren, Williams, Haas, Audi, Cadillac sit at parity (their brand colors already pass); the rest carry hand-tuned brightened variants.
- **`JargonTip` is now best-in-class for the format** — content-collection-backed, button-triggered, panel-positioned, Esc + click-outside close, fallback to plain `<slot/>` if a slug is missing so a typo never breaks a page.
- **`DecoderSearch` is fast, accessible, and tiny** — listbox semantics, arrow-key navigation, `aria-live` status updates, Esc clears, 44px result targets, full inline index for sub-200 entries.
- **Build remains tight** — 70 pages in 12.27s. Decoder index adds zero runtime weight (serialised at build).

## Recommended Actions (priority order)

1. **[P1] `$impeccable clarify` per markdown content file.** The em-dash sweep on `.md`/`.mdx`. Bundle with the v1.1 Tier-2 voice rewrites; pull forward only if `/design-review` (Q2) flags it.
2. **[P2] `$impeccable extract` brightened sector text tokens.** Add `--sector-purple-text` and `--sector-green-text` to `tokens.css`; update `race-weekend.astro` call sites.
3. **[P2] `$impeccable polish rules.astro`.** Replace flag-swatch raw hex with existing token references.
4. **[P2] `$impeccable adapt StickyNav`.** Bump mobile action buttons to 44×44px.
5. **[P3] `$impeccable polish` final pass** before v1 ship.

After Q1 fixes, target: **18-19/20** by v1 ship.

---

## Q-Series Status

- **Q1 — `$impeccable audit`:** ✅ Complete. Score 16/20 (+2 vs. baseline).
- **Q2 — `/design-review`:** Pending. User-triggered only per design-flow rules. Run when ready to critique against `DESIGN_BRIEF.md`. Outputs `DESIGN_REVIEW.md` plus screenshots in `.design/cast-and-decoder/screenshots/`. Address any P0/P1 must-fix items before declaring v1 shipped.

You can ask me to run any of the recommended commands one at a time, all at once, or in any order you prefer. Re-run `$impeccable audit` after fixes to see the score climb.
