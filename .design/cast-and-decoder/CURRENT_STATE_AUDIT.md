# Current State Audit — Into the Paddock

> **Generated:** 2026-05-04 via `$impeccable audit`
> **Scope:** Existing site code at `/home/brian/intothepaddock` ahead of the cast-and-decoder redesign
> **Inputs:** `PRODUCT.md`, `DESIGN.md`, `.design/cast-and-decoder/DESIGN_BRIEF.md`, the `src/` tree

The site was thrown together in a couple of days. This audit identifies what to keep, polish, rewrite, or delete before the redesign builds on top. Findings feed directly into `INFORMATION_ARCHITECTURE.md`, the tokens refinement pass, and `TASKS.md`.

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|---|---|---|
| 1 | Accessibility | 2 | `JargonTip` is effectively hover-only on mobile; per-team accent contrast unaudited |
| 2 | Performance | 4 | Astro static, lazy images, subsetted fonts, no obvious regressions |
| 3 | Theming | 3 | Token system is solid; hardcoded hex leaks through homepage section accents and a few pages |
| 4 | Responsive | 3 | `StickyNav` mobile collapse is wired; touch targets and per-component reflow not yet QA'd |
| 5 | Anti-Patterns | 2 | Side-stripe borders, hover-only tooltip, `backdrop-filter` blur in nav, em dashes throughout copy |
| **Total** | | **14/20** | **Good — address weak dimensions before shipping the redesign** |

## Anti-Patterns Verdict

**Pass with reservations.** The site does not look generically AI-generated — the dark asphalt + kerb yellow palette is distinctive, the Barlow Condensed + Inter + JetBrains Mono pairing is intentional, and the kerb-stripe motif is a real piece of visual identity. There's a point of view here.

The slop tells are mostly **policy-level**, not aesthetic-level — the design accidentally reaches for forbidden patterns rather than visibly looking AI-shaped:

- **Side-stripe colored borders** on `.step-analogy`, multiple page elements (`strategy.astro`, `rules.astro`, `tracks/[slug].astro`). The `EntityCard.card-stripe` (4px → 7px on hover) is the same visual pattern as a side-stripe `border-left`, just implemented as an absolute-positioned span.
- **`backdrop-filter: blur(12px)` on the sticky nav** — glassmorphism as default. The DESIGN.md just declared this prohibited.
- **Hover-only `JargonTip` tooltip** that is unreachable on mobile and dies the moment a user taps anywhere outside.
- **Em dashes in nearly every page's body copy** — banned per DESIGN.md and across most explainer content (`rules.astro`, `index.astro`, `404.astro`, `Footer.astro`, `race-weekend.astro`, `strategy.astro`).

These are fixable — and most of them were already on the cleanup list from the grilling session. The audit confirms scope.

## Executive Summary

- Audit Health Score: **14/20** (Good — address weak dimensions)
- Total issues found: **3 P1 (Major)**, **9 P2 (Minor)**, **6 P3 (Polish)**
- The three biggest blocks for the redesign:
  1. `JargonTip` cannot serve the decoder JTBD as currently written. Hover-only is a mobile-killer for the phone-in-hand-during-race scenario.
  2. Side-stripe colored borders are a recurring pattern across 6+ files. They violate the DESIGN.md ban and need a coherent replacement strategy (top-stripe, full borders, or background tints).
  3. Em dashes are everywhere in user-facing copy. The DESIGN.md prohibits them. This is a content-sweep task, not engineering.
- The token system, photographic discipline, accessibility scaffolding (skip link, focus rings, `prefers-reduced-motion`), and Astro performance posture are all in good shape. The redesign extends them; it does not have to rebuild them.

## Detailed Findings by Severity

### P1 — Major (fix before shipping the redesign)

#### [P1] `JargonTip` is hover-only and unreachable on mobile

- **Location:** `src/components/ui/JargonTip.astro` (lines 59–63)
- **Category:** Accessibility / Anti-Pattern / Mobile
- **Impact:** The decoder JTBD specifies "phone-in-hand during a broadcast." The current component renders a tooltip on `:hover` and `:focus-within` only. On mobile, where there is no hover and the inner `<span>` cannot receive focus, the tooltip is effectively invisible. There is no button, no `aria-expanded`, no tap-to-toggle. It's a footnote that only shows up on desktop.
- **WCAG:** 2.5.1 (Pointer Gestures), 2.5.7 (Dragging Movements), 4.1.2 (Name, Role, Value)
- **Recommendation:** Refactor `JargonTip` to use a `<button>` trigger with `aria-expanded` toggling a panel, tap-to-open and Esc-to-close. Source the term content from a new `glossary` Astro content collection (per DESIGN_BRIEF). Add a "more →" link that anchor-jumps to `/decoder#term-slug`.
- **Suggested command:** `$impeccable harden` after the new component is built.

#### [P1] Glassmorphism on `StickyNav` (`backdrop-filter: blur`)

- **Location:** `src/components/nav/StickyNav.astro` (lines 49–51)
- **Category:** Anti-Pattern
- **Impact:** `DESIGN.md` explicitly prohibits glassmorphism as a default. The semi-transparent + 12px blur is a generic SaaS-marketing tic that doesn't carry any of the editorial-cinematic identity the rest of the site is reaching for.
- **Recommendation:** Replace with a solid `var(--asphalt-900)` background. If a tonal lift on scroll is desired, use a `box-shadow: 0 1px 0 0 var(--asphalt-700)` or shift to `var(--asphalt-800)` after a small scroll delta — don't reach for blur.
- **Suggested command:** `$impeccable polish StickyNav`.

#### [P1] Side-stripe colored borders across 6+ files

- **Location:**
  - `src/components/cards/StepCard.astro:79` — `.step-analogy { border-left: 3px solid var(--accent); }`
  - `src/components/ui/StatBlock.astro:26` — `border-left: 2px solid var(--asphalt-600)` (neutral, but turns colored on `:hover`)
  - `src/pages/strategy.astro:276` — `border-left: 3px solid var(--kerb-yellow)`
  - `src/pages/rules.astro:274` — `border-left: 3px solid var(--kerb-yellow)`
  - `src/pages/tracks/[slug].astro:128, 269` — `border-left: 2px solid var(--asphalt-600)` and `border-left: 4px solid var(--kerb-yellow)`
  - `src/components/cards/EntityCard.astro:116-129` — `.card-stripe` is functionally a side stripe: 4px → 7px on hover, colored with `--accent`. Implemented as an absolute element rather than `border-left`, but the visual outcome is identical.
- **Category:** Anti-Pattern (DESIGN.md "side-stripe borders")
- **Impact:** The pattern is widespread enough to be a system-level decision, not isolated incidents. The DESIGN.md ban is "side-stripe colored accents on cards, list items, callouts, alerts" — and that's exactly what these are doing.
- **Recommendation:**
  - For `StepCard.step-analogy`: drop the left stripe; use a leading mono tag (`THINK OF IT LIKE`) plus `background: rgba(252, 231, 0, 0.05)` (already there) and full `--border-thin`.
  - For `StatBlock`: replace the left border with a top hairline (`border-top: 1px solid var(--asphalt-600)`) or remove the border entirely; mono label + tabular numerals already carry the structure.
  - For `EntityCard.card-stripe`: this one is a **judgment call.** It's the most visible side-stripe on the site and serves as the per-team accent indicator. Two options:
    1. **Keep it as a deliberate exception**, document it in DESIGN.md as the one allowed "racing-line stripe" because it carries genuine semantic weight (team identity color), and note the pattern is **not transferable** to other components.
    2. **Move it to the top edge** (`top: 0; left: 0; right: 0; height: 4px`) like `StepCard.step-stripe` already does — keep team color as a top racing-line, not a side rail.
    My recommendation: option 2. Top-edge stripes don't trigger the side-stripe ban and keep the team-color signal at parity. Plus it visually aligns with `StepCard`.
  - For page-level `border-left` accents in `strategy.astro`, `rules.astro`, `tracks/[slug].astro`: replace with full borders, leading icons or mono tags, or background tints.
- **Suggested command:** `$impeccable layout` after individual replacements; or fold into the per-component refactor tasks.

### P2 — Minor (should fix during the redesign)

#### [P2] Em dashes pervasive in user-facing copy

- **Location:** `src/pages/index.astro` (subtitles in section grid, lines 21, 22, 24), `src/pages/404.astro` (lines 6, 10), `src/pages/rules.astro` (lines 28, 32, 40, 42, 43, 49, 53, 60, 79, 135), `src/pages/race-weekend.astro`, `src/pages/strategy.astro`, `src/components/nav/Footer.astro` (lines 11, 28).
- **Category:** Anti-Pattern (DESIGN.md "no em dashes in copy")
- **Impact:** This is a **content-level** sweep, not engineering. The DESIGN.md prohibits em dashes; the existing copy uses them liberally. As the voice pass happens during the build, replace with commas, colons, semicolons, periods, or parentheses. Don't substitute `--` either.
- **Recommendation:** Treat as a content cleanup task per page rather than a single bulk replace, because some em dashes are doing different work (parenthetical, list separator, dramatic pause) and should be replaced contextually.
- **Suggested command:** `$impeccable clarify` per page during the voice pass.

#### [P2] Hardcoded hex colors in homepage section accents and pages

- **Location:**
  - `src/pages/index.astro` lines 18–24 — `accent: '#dc0000'`, `'#27f4d2'`, `'#ff8000'`, `'#b545ff'`, `'#2bbf4d'`, `'#1e41ff'` (per-section identity colors)
  - `src/pages/index.astro` lines 87, 92 — StepCard accents `'#fce700'`, `'#27f4d2'`
  - `src/pages/tracks/index.astro:16` — `'#fce700'`
  - `src/pages/race-weekend.astro:260, 272` — `#d3aaff`, `#7be59a`
- **Category:** Theming
- **Impact:** Token system has clear precedent (`tokens.css`); these one-off hex codes drift from it. Inconsistent themes long-term.
- **Recommendation:** Add a `--section-1-accent` … `--section-7-accent` set of tokens (or a `lib/sectionColors.ts` lookup keyed by slug) for the homepage section identities. Replace the `race-weekend.astro` colors (`#d3aaff`, `#7be59a`) with tokens that already exist (`--sector-purple` brightened? — verify contrast; `--sector-green`?) or add named variants.
- **Suggested command:** `$impeccable extract` to pull these into the design system; then `$impeccable polish` per file.

#### [P2] `NextRaceCountdown` rendered as primary hero visual

- **Location:** `src/pages/index.astro` (Hero `<Fragment slot="visual">`)
- **Category:** IA / Brief Compliance
- **Impact:** DESIGN_BRIEF v1 spec demotes the countdown to a slim "this weekend" band low on the page. Current homepage leads with the countdown widget as the first thing the eye lands on. Wrong job-priority for a job-D landing.
- **Recommendation:** Build a slim `WeekendBand` variant (top-3 standings + countdown + "full standings →") and place it near the homepage footer. Replace the hero visual with a real photograph.
- **Suggested command:** Tracked in TASKS.md as a homepage-redraft sub-task.

#### [P2] `EntityCard.stat-label` uses 0.65rem with 0.14em letter-spacing

- **Location:** `src/components/cards/EntityCard.astro:166-171`
- **Category:** Accessibility / Typography
- **Impact:** 0.65rem ≈ 10.4px. This is below the WCAG-recommended 12px minimum for label text and the body-text 16px floor. With 0.14em letter-spacing on uppercase, character recognition gets harder. The mono "WINS / PODIUMS / TITLES" labels read as small print.
- **Recommendation:** Bump to `var(--fs-200)` (0.75rem ≈ 12px) at minimum. Keep the uppercase + letter-spacing per the DESIGN.md label rule. Same applies to `StatBlock.statblock-label` (0.7rem).
- **Suggested command:** `$impeccable typeset EntityCard StatBlock`.

#### [P2] Per-team accent contrast unaudited against `asphalt-900`

- **Location:** `src/lib/teamColors.ts` and any place setting `--team-primary`
- **Category:** Accessibility
- **Impact:** Some F1 team colors (e.g., dark blues like Williams, dark reds, even Aston Martin's racing green) likely fail 4.5:1 contrast against `--asphalt-900` (#0e0f10). When used for body text or links, the per-team accent may be unreadable.
- **Recommendation:** Run a per-team contrast audit. For each team color that fails, define a brightened-for-text variant (e.g., `--team-primary-text`) and use it for type and links; keep the original brand color for non-text accents (stripes, dividers, photo edges). DESIGN.md already declares this rule; the implementation needs to follow.
- **Suggested command:** `$impeccable audit` (re-run focused on color contrast) once per-team variants are wired.

#### [P2] StickyNav links in uppercase Barlow Condensed

- **Location:** `src/components/nav/StickyNav.astro:85-91`
- **Category:** Typography (sentence-case rule tension)
- **Impact:** The DESIGN.md sentence-case rule applies to H1–H4. Nav labels are a gray area — uppercase nav is common — but they currently read as another piece of "race report" texture. Worth deciding deliberately rather than by default.
- **Recommendation:** **Leave as-is for now**, but flag for a `live` design iteration during the build to A/B sentence-case nav vs. uppercase. The brand mark "INTO THE PADDOCK" stays uppercase as a masthead; nav links can go either way. Defer to a polish-phase decision.
- **Suggested command:** `$impeccable live` during build.

#### [P2] "How to read this site" StepCards live at the bottom of the homepage

- **Location:** `src/pages/index.astro:82–98`
- **Category:** IA / Brief Compliance
- **Impact:** Brief calls for these to merge into a "how the sport works" intro paragraph rather than have their own block at the bottom. Currently they read as a postscript, after the seven-tile grid.
- **Recommendation:** Fold into the demoted "how the sport works" section's eyebrow-paragraph; remove the dedicated StepCard block from the homepage.
- **Suggested command:** Tracked in TASKS.md.

#### [P2] Seven-tile section grid with equal weight on the homepage

- **Location:** `src/pages/index.astro:72–78`
- **Category:** IA / Brief Compliance
- **Impact:** Already on the redesign list — the brief demotes this to a tier-2 "when you're ready, go deeper" section after the cast strip + decoder. Currently it carries equal weight to live data and "what is F1," which is the wrong ranking for a job-D landing.
- **Recommendation:** Keep all seven tiles but render them at smaller scale, lower visual weight, and below the cast strip + decoder + storylines bands. Eyebrow: "When you're ready, go deeper."
- **Suggested command:** Tracked in TASKS.md.

#### [P2] `Footer` already carries trust-line text but in the wrong format

- **Location:** `src/components/nav/Footer.astro:28–29`
- **Category:** Brief Compliance
- **Impact:** "© INTO THE PADDOCK — INDEPENDENT FAN PROJECT / NOT AFFILIATED WITH FORMULA 1, FIA, FOM, OR ANY TEAM." is functionally the trust-line the brief asks for. It's just buried in the © line and uppercase. Effectively done; needs a small reformat.
- **Recommendation:** Restructure the footer-tail to lead with "Independent and unofficial" as a clear standalone line above the © + disclaimer. Drop the em dash. Keep the disclaimer text.
- **Suggested command:** `$impeccable clarify Footer`.

### P3 — Polish (fix if time permits)

- **[P3] `LiveStandingsTable` does not have a `top-3 preview` variant.** Currently full-table only. Brief calls for a slim variant for the homepage band. *Suggested command:* tracked in TASKS.md.
- **[P3] `Hero.hero-visual` uses fixed `min-height: 240px`.** Reasonable, but worth verifying it doesn't crop landscape photographic heros badly. *Suggested command:* `$impeccable adapt Hero` during build.
- **[P3] `EntityCard.card-arrow` uses `▸` glyph.** Functional but inconsistent with potential icon system. Acceptable as-is; replace with inline SVG only if the broader design adopts icons. *Suggested command:* defer.
- **[P3] `KerbDivider` has 6 variants.** Likely under-utilized; some variants (`--inverted`, `--diag`) may never appear in the redesign. Audit usage post-build and trim. *Suggested command:* `$impeccable distill KerbDivider` post-build.
- **[P3] `prefers-reduced-motion` reset is global but not per-component.** Existing global override is fine, but new motion (cast strip carousel snap, decoder search expand, etc.) should use the `--ease-snap` token explicitly so the reset catches them. *Suggested command:* preventive note for build phase.
- **[P3] No favicon variants for dark / light / mask.** `favicon.svg` and `.ico` exist; consider adding `mask-icon` for Safari pinned tabs. *Suggested command:* defer.

## Patterns & Systemic Issues

Recurring problems that indicate system-level decisions, not one-offs:

1. **Side-stripe colored borders are a "Brian-reflex."** They appear in 6+ files (`StepCard`, `StatBlock`, three pages, plus `EntityCard.card-stripe` as the same visual). Replacing per-instance won't stop them recurring during the redesign unless a single replacement pattern is documented as the new default (top-stripe, full border, or no border).
2. **Em dashes are a "Brian-reflex" in copy.** Appears in nearly every Astro file. Worth a single search-and-fix sweep during the voice pass, not a per-page debate.
3. **Hardcoded hex codes carry meaning that should be tokens.** Section accents, page-specific tints — they're not random; they're identity. Promote to tokens or to a `sectionColors` lookup so the system knows about them.
4. **Mobile-first claim isn't yet validated.** `StickyNav` has a hamburger collapse; `Hero` has a single 880px breakpoint. But `JargonTip` is hover-only, touch targets in `EntityCard.stat-label` are sub-12px, and the hero `.countdown-grid` `min-width: 64px` cells may overflow at 320px viewport. Brief promised mobile-first; the implementation is desktop-first with mobile overrides.

## Positive Findings

Things that are working and should be preserved or extended:

- **Token system is genuinely thoughtful.** `tokens.css` distinguishes asphalt tiers, telemetry colors, tyre compounds, flag colors, and per-team accents with named purpose. This is rare in projects of this age.
- **Kerb-stripe motif is real visual identity.** `KerbDivider` and the underlying `kerb.css` are distinctive, atmospheric, and not generic. Keep.
- **Photographic discipline already in place.** `EntityCard` lazy-loads images with responsive `widths`, applies `filter: saturate(0.95)` for atmosphere, has hover-scale on the image with reduced-motion respect. Continue this in `CharacterHero`.
- **Accessibility scaffolding is present.** Skip-link in `BaseLayout`, focus rings via `:focus-visible`, `prefers-reduced-motion` reset in `global.css`, semantic HTML (`<nav>`, `<article>`, `<main>`, `<dl>` for stats). The bones are right; the failures are at the edges.
- **`KerbDivider` and other decorative elements correctly use `aria-hidden`.** Decorative cleanly separated from semantic.
- **`NextRaceCountdown` is `aria-live="polite"`** so screen readers announce updates appropriately.
- **Performance baseline is excellent.** Astro static generation, MDX integration, fontsource subsetting, no client-side framework runtime. Adding the decoder search index and a small `JargonTip` interactive island will not destabilize this.

## Recommended Actions

In priority order. Map each to a TASKS.md item during Phase 5.

1. **[P1]** Refactor `JargonTip` to button-driven, content-collection-backed, tap-friendly, with anchor-jump to `/decoder`. Single biggest unblock for the decoder JTBD. → `$impeccable harden JargonTip` once the new component is in place.
2. **[P1]** Strip `backdrop-filter` from `StickyNav`. Replace with solid `--asphalt-900` and an optional shadow on scroll. → `$impeccable polish StickyNav`.
3. **[P1]** Decide and implement the side-stripe replacement pattern across `StepCard.step-analogy`, `StatBlock`, `strategy.astro`, `rules.astro`, `tracks/[slug].astro`, and `EntityCard.card-stripe`. Document the chosen replacement in DESIGN.md so it doesn't recur. → `$impeccable layout` per file plus a DESIGN.md update.
4. **[P2]** Sweep em dashes from copy. One pass per page during voice pass. → `$impeccable clarify` per file.
5. **[P2]** Promote homepage section accents and page-specific colors to tokens or a `sectionColors` lookup. → `$impeccable extract`.
6. **[P2]** Per-team accent contrast audit; introduce `--team-primary-text` brightened variants where the brand color fails. → `$impeccable audit` (re-scoped) after wiring.
7. **[P2]** Bump `EntityCard.stat-label` and `StatBlock.statblock-label` to `--fs-200` (12px). → `$impeccable typeset`.
8. **[P2]** Demote `NextRaceCountdown` from hero to slim `WeekendBand`; replace homepage hero with photograph. → tracked in TASKS.md as part of homepage redraft.
9. **[P2]** Reformat `Footer` trust-line to lead with "Independent and unofficial." → `$impeccable clarify Footer`.
10. **[P3]** Run `$impeccable polish` on all touched components as the build progresses; final pass before phase 7 review.

Re-run `$impeccable audit` after fixes to see your score improve. Target: 18+/20 by v1 ship.

---

You can ask me to run these one at a time, all at once, or in any order you prefer.
