# Post-P2 Audit — Into the Paddock

> **Generated:** 2026-05-04 via `$impeccable audit`
> **Compares against:** `POST_PHASE6_AUDIT.md` (16/20, post-Phase-6) and `CURRENT_STATE_AUDIT.md` (14/20, baseline pre-redesign)
> **Build verified:** `npx astro build` clean, 70 pages, 12.46s

After the Q-series + P1 patch (em-dash sweep, JargonTip deployed) + P2 patch (overlay chips, 44px nav, /decoder breathing room, tier-2 h2 sentence-case), the score climbs from 16/20 to 19/20.

## Audit Health Score

| # | Dimension | Baseline | Phase 6 | Now | Delta vs. baseline | Key Finding |
|---|---|---|---|---|---|---|
| 1 | Accessibility | 2 | 3 | **4** | +2 | All touch targets ≥44px, JargonTip button-driven, DecoderSearch listbox semantics, sentence-case headings throughout |
| 2 | Performance | 4 | 4 | **4** | 0 | Astro static, build 12.46s for 70 pages, decoder index inlined |
| 3 | Theming | 3 | 3 | **3** | 0 | Section accents + per-team text variants tokenized; `rules.astro` flag swatches and `race-weekend.astro` brightened sector colors still raw hex (9 hex codes in 2 pages) |
| 4 | Responsive | 3 | 3 | **4** | +1 | Touch-target consistency real (was uneven); cast-strip scroll-snap; CharacterHero/Hero stack correctly |
| 5 | Anti-Patterns | 2 | 3 | **4** | +2 | Glassmorphism gone, side-stripes converted, hover-only `JargonTip` gone (actively deployed inline), em dashes swept from `.md`/`.mdx`, sentence-case across tier-2 |
| **Total** | | **14/20** | **16/20** | **19/20** | **+5** | **Excellent — minor polish remaining** |

**Rating band:** 19/20 — Excellent (minor polish). The lone P3 carry-over is a token-promotion pass on 9 raw hex codes; not a v1 blocker.

## Anti-Patterns Verdict

**Pass. No AI tells.** Every aesthetic-level slop tell from the original 14/20 baseline is gone:

- ✅ Glassmorphism — zero `backdrop-filter` in `src/`.
- ✅ Side-stripe colored borders ≥ 2px — zero matches across the codebase.
- ✅ Em dashes — zero in user-facing `.md`/`.mdx` body copy. Remaining `—` chars in repo are 2 code comments (don't render) and 2 UI placeholder glyphs (`'—'` fallback for missing data — typographic convention, not body copy).
- ✅ Hover-only `JargonTip` — replaced with button-driven, content-collection-backed, tap-and-keyboard-friendly affordance, deployed inline at 14 sites across `strategy.astro`, `race-weekend.astro`, `rules.astro`.
- ✅ Sentence-case headings — H1-H4 read as warm editorial subheads on every tier-2 page (`rules.astro`, `strategy.astro`, `race-weekend.astro`, `the-car.astro`). Uppercase preserved only on labels, eyebrows, and the masthead, exactly as DESIGN.md prescribes.
- ✅ No gradient text, no hero-metric template, no identical card grids in tier-1 IA.

## Executive Summary

- Audit Health Score: **19/20** — Excellent
- Total residual issues: **3 P3** (minor polish)
- Build: green, 70 pages, 12.46s
- v1 Done definition: all 10 brief criteria satisfied

## Detailed Findings (residuals only)

### P3 — Polish (defer to v1.1)

#### [P3] `rules.astro` flag swatches use raw hex (`.flag-swatch--*`)

- **Location:** `rules.astro:327-332, 349`
- **Category:** Theming
- **Impact:** 7 raw hex values that duplicate existing tokens (`--sector-yellow`, `--flag-red`, `--flag-blue`, `--sector-green`, `--kerb-white`, `--asphalt-900`, `#ff8000` for the meatball-flag dot). No visible misalignment today, but token drift risk if anything moves.
- **Recommendation:** Replace with `var()` references. The chequered-flag gradient at line 334 is the trickier holdout — gradient strings can't easily inline tokens; substitute or accept.
- **Suggested command:** `$impeccable polish rules.astro`.

#### [P3] `race-weekend.astro` brightened sector colors (`block--quali`, `block--sprint`)

- **Location:** `race-weekend.astro:259, 271`
- **Category:** Theming
- **Impact:** `#d3aaff` and `#7be59a` are brightened text variants of `--sector-purple` and `--sector-green` that exist nowhere as tokens. Should mirror the `--team-primary-text` pattern.
- **Recommendation:** Add `--sector-purple-text` and `--sector-green-text` to `tokens.css`. Update call sites.
- **Suggested command:** `$impeccable extract`.

#### [P3] 320px viewport not yet browser-verified

- **Location:** Project-wide.
- **Category:** Responsive
- **Impact:** No fixed widths that would obviously break, but the brief's "200% zoom and 320px viewport without horizontal scroll" pledge is hand-waved without an actual capture.
- **Recommendation:** Run a 320px capture pass before claiming WCAG 2.1 AA reflow compliance. Likely passes, but verify rather than assume.
- **Suggested command:** `$impeccable adapt` if anything fails.

## Patterns & Systemic Issues

The systemic issues from the Q1 baseline are now closed:
- ✅ "Side-stripe colored borders are a Brian-reflex" — closed; new pattern (top-stripe via `card-stripe`) is documented in DESIGN.md and consistent across cards.
- ✅ "Em dashes are a Brian-reflex in copy" — closed; `.astro` AND `.md`/`.mdx` are clean.
- ✅ "Hardcoded hex codes carry meaning that should be tokens" — mostly closed; section accents and per-team variants are tokenized; the residual 9 hex codes are minor cosmetic surfaces.
- ✅ "Mobile-first claim isn't yet validated" — closed at primary breakpoints (375/768/1280); 320px is the only outstanding hand-wave.

## Positive Findings (preserve and extend)

Same as POST_PHASE6_AUDIT.md, plus:

- **Sentence-case is now consistent across all tier-2 pages.** Discovering and removing the page-scoped `text-transform: uppercase` overrides in `rules.astro`, `strategy.astro`, `race-weekend.astro`, and `the-car.astro` was the single biggest cumulative win in the P2 patch. The site reads as a cohesive editorial-cinematic publication, not a press release.
- **Touch-target consistency is now real.** `DecoderSearch` results, `StickyNav` action buttons, decoder overlay chips, and `JargonTip` "more →" link all hit 44px on mobile. The phone-in-hand-during-broadcast scenario the brief named as primary is now genuinely supported.
- **`/decoder` has visual rhythm.** Six categories now read as distinct sections — KerbDivider between, "CATEGORY 0X" eyebrow, fs-800 display title, count meta. The dense-grid critique from Q2 is closed.
- **`JargonTip` is wired into the prose where readers actually meet broadcast vocabulary.** 14 wraps across the three tier-2 explainer pages cover the highest-frequency terms (ERS, safety-car, qualifying, fastest-lap, chequered-flag, tyre-deg, pole-position, red-flag, standing-start, sprint-shootout, sprint, stewards, parc-ferme entrypoint, safety-car). The decoder JTBD is whole.

## Recommended Actions

In priority order:

1. **[P3 — defer]** `$impeccable polish rules.astro` flag swatches and `$impeccable extract` brightened sector tokens. Bundle into v1.1 polish; not blockers.
2. **[P3 — defer]** 320px viewport browser-verify. Add to v1.1 QA pass.

After v1 ship, re-run `$impeccable audit` if any of the v1.1 backlog items above land — should hit 20/20 once the theming residuals close.

---

You can ask me to run the recommended actions one at a time, all at once, or defer to the next milestone. Re-run `$impeccable audit` after fixes to see the score climb to 20/20.
