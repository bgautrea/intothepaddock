# Design Review: Cast & Decoder

> **Reviewed against:** `DESIGN_BRIEF.md` (`.design/cast-and-decoder/DESIGN_BRIEF.md`)
> **Philosophy:** *Cinematic editorial* — dark asphalt + kerb yellow + per-team accents, magazine-profile editorial layer.
> **Date:** 2026-05-04
> **Reviewer:** Q2 of the Q-series, post-Phase-6 build.
> **Companion documents:** `POST_PHASE6_AUDIT.md` (Q1 — technical audit, 16/20).

## Summary

The redesign hits the brief on the headline-level work: the homepage genuinely reads as "DTS without the documentary," driver pages foreground character-read and storyline ahead of stats, and the decoder search is fast and accessible. Two policy gaps prevent calling v1 shipped — **em dashes are visibly rendered across cast pages and tier-2 explainers** (the Phase 6 sweep missed `.md`/`.mdx` content), and **`JargonTip` is built but never deployed inline in any content**, leaving half of the decoder JTBD un-wired. Both fixable in a content pass; neither requires re-architecture.

## Screenshots Captured

All paths under `.design/cast-and-decoder/screenshots/`. Captured at desktop 1280×800, tablet 768×1024, mobile 375×812 with `prefers-reduced-motion: reduce`.

| Screenshot | Breakpoint | What it shows |
| --- | --- | --- |
| `review-homepage-desktop-1280.png` | Desktop | Hero photo + cast strip + principals + decoder + storylines + tier-2 grid + weekend band |
| `review-homepage-tablet-768.png` | Tablet | Same content, 880px-down layout (cast cards visible 2-up with peek) |
| `review-homepage-mobile-375.png` | Mobile | Stacked layout with scroll-snap on cast strip |
| `review-homepage-decoder-active-mobile-375.png` | Mobile (interactive) | Inline decoder search filtered on "parc" → "Parc fermé" |
| `review-decoder-desktop-1280.png` | Desktop | Decoder hero + sticky search + category-anchored entry grid |
| `review-decoder-tablet-768.png` | Tablet | Tablet reflow of category grid |
| `review-decoder-mobile-375.png` | Mobile | Mobile reflow of full decoder page |
| `review-decoder-search-active-desktop-1280.png` | Desktop (interactive) | Search active, "vsc" filtered to Virtual Safety Car + RACE CONTROL meta + Try-one chips |
| `review-decoder-overlay-mobile-375.png` | Mobile (interactive) | Mobile nav-overlay variant of decoder search after tapping nav search button |
| `review-driver-hamilton-desktop-1280.png` | Desktop | CharacterHero (40/60 photo + text), Why he matters, How he drives, Watch for, pull quote, Career receipts, Next on track |
| `review-driver-hamilton-mobile-375.png` | Mobile | Stacked CharacterHero, full body copy with em dashes visible |
| `review-driver-hamilton-tablet-768.png` | Tablet | Tablet CharacterHero reflow |
| `review-team-ferrari-desktop-1280.png` | Desktop | Team page with Ferrari car hero + Vasseur character read + Constructor receipts + Current lineup (Leclerc + Hamilton) |
| `review-team-ferrari-tablet-768.png` | Tablet | Tablet reflow |
| `review-team-ferrari-mobile-375.png` | Mobile | Stacked team page |
| `review-the-car-desktop-1280.png` | Desktop | Tier-2 explainer with cutaway + sectioned body copy |
| `review-the-car-tablet-768.png` | Tablet | Tablet reflow |
| `review-the-car-mobile-375.png` | Mobile | Mobile reflow (long-page) |

## Must Fix (before v1)

### 1. Em dashes are visibly rendered on cast pages and tier-2 content

**See** `screenshots/review-driver-hamilton-mobile-375.png` (line: *"Hamilton holds essentially every accumulated record in F1 — wins, poles, podiums…"*) and `screenshots/review-the-car-desktop-1280.png` (multiple sections in tier-2 body).

The Phase 6 sweep cleaned `.astro` page files but left **300+ em dashes across 56 markdown content files** — driver bios, team bios, track explainers, and `the-car.mdx` (30 alone). DESIGN.md prohibits em dashes in copy; the markdown body is copy. Reader sees them on every cast page and tier-2 deep-dive.

_Fix:_ Per-file content sweep using contextual substitutes. Bundle with the v1.1 voice rewrites only if the timeline allows; otherwise pull forward as a Phase 6 patch. Worst offenders: `the-car.mdx` (30), `monaco.md` (6), `jim-clark.md` (6), `oliver-bearman.md` (6), `michael-schumacher.md` (6). `$impeccable clarify` per file is the cleanest tool.

### 2. `JargonTip` is built but never deployed in any content

**See** `screenshots/review-the-car-desktop-1280.png` and `screenshots/review-driver-hamilton-desktop-1280.png` — body copy contains terms ("undercut," "VSC," "DRS," "parc fermé") that should be wrapped with `<JargonTip slug="…">` per Brief Key Interaction #2 and v1 Done item #5. Grep confirms zero usage outside the component's own definition.

The decoder JTBD has two halves: the destination page (works, see `review-decoder-search-active-desktop-1280.png`) and the inline affordance (component exists, never deployed). v1 Done #5 explicitly requires the refactor *and* the integration. Component is refactor-complete; integration is missing.

_Fix:_ Wrap a curated set of broadcast terms across the active driver/team/tier-2 markdown using `<JargonTip slug="virtual-safety-car">VSC</JargonTip>` style. Start with the highest-frequency terms (VSC, undercut, DRS, parc fermé, blue flag) on the 6 active driver pages, 3 active team pages, and `the-car.mdx`/`strategy.astro`/`race-weekend.astro`/`rules.astro`. ~20-30 wraps total to make the inline affordance feel real.

## Should Fix (during v1.1)

### 3. Mobile decoder nav overlay is a blank state

**See** `screenshots/review-decoder-overlay-mobile-375.png`.

User taps the nav search-icon (correct affordance for "phone-in-hand-during-broadcast"), the overlay opens, and there is nothing to act on except an empty input and a "Browse the full decoder →" link. The homepage inline version has Try-one chips for the 8 most-asked terms; the overlay variant has none. A wasted moment in the highest-friction path.

_Fix:_ Render the same Try-one chips (or a "popular terms" row) inside the overlay when the input is empty. As soon as the user types, swap to the live-filtered list (which already works).

### 4. Lewis Hamilton hero photo predates Ferrari era

**See** `screenshots/review-driver-hamilton-desktop-1280.png` and `…-mobile-375.png`.

The page's character-read promises *"the most successful driver in F1 history, year two at Ferrari, betting his legacy on the move."* The hero photo shows a Mercedes-era silver car #44. Visual tension with the page's framing. Photo curation is on the v1.1 backlog ("Hero photo curation" and "Principal portraits"), so this is a known limitation.

_Fix:_ Source a Hamilton-in-Ferrari (red) image for v1.1. Acceptable in v1 only because photo curation was explicitly deferred.

### 5. `StickyNav` mobile action buttons sub-44px

**See** `screenshots/review-homepage-mobile-375.png`.

Search-icon button and hamburger toggle render at 36px square. WCAG 2.5.5 (AAA) recommends 44px; on mobile, where the search button is the entry point to the decoder JTBD, this is the wrong target to skimp on. Already flagged in Q1.

_Fix:_ Bump `min-width`/`height` to 44px at the mobile breakpoint in `StickyNav.astro:172-205`.

### 6. `/decoder` category sections feel visually dense

**See** `screenshots/review-decoder-desktop-1280.png` and `…-mobile-375.png`.

39 entries laid out as a multi-column grid with thin gutters. Functionally fine, but the categories blur into one another visually — there's no breathing room between "Race control" and "Strategy" and "Tyres" beyond the section header. Brief calls for "scannable" on `/decoder`; right now it's "denseable."

_Fix:_ Add `KerbDivider` or a thicker section spacer between categories. Bump category-header treatment (larger eyebrow + display heading) to break the rhythm.

## Could Improve (post-v1)

### 7. Mobile cast strip lacks an explicit "more here" affordance

**See** `screenshots/review-homepage-mobile-375.png`.

The 1.5-card peek does signal "scrollable," but a faded right-edge gradient or a tiny "1 of 6" dot indicator would make it unambiguous. The cast strip is the homepage's primary tier-1 entry point; it should not require trial-and-error.

_Suggestion:_ Add a 24-32px right-edge fade-out gradient over the last visible card, or a mono "1 / 6" indicator under the strip that updates with scroll.

### 8. `CarCutaway` not sticky on mobile

**See** `screenshots/review-the-car-mobile-375.png`.

The cutaway is the visual anchor for the entire page — anchor links jump to it. On mobile, scrolling deep into the body loses the cutaway entirely. Sticky positioning under the nav (or a "back to diagram" floating button) would keep the visual reference alive.

_Suggestion:_ Wait for v1.1 voice rewrites of `the-car.mdx` to land first, then evaluate; could be a no-op if the rewrite reduces the page to a manageable scroll length.

### 9. Storyline band is good but could carry a quarterly date stamp

**See** `screenshots/review-homepage-desktop-1280.png` (storylines section "What's interesting right now").

Current storylines (Hamilton year two, Cadillac, silly season) read evergreen, but a small mono "AS OF Q2 2026" stamp on the section eyebrow would signal the editorial cadence and prevent staleness drift over time.

_Suggestion:_ Add `<p class="eyebrow mono">As of Q2 2026 — Editorial</p>` to the storylines section header.

## What Works Well

This is not padding. These are the choices that make the redesign land.

- **The IA the brief asked for is the IA you see on the homepage.** Hero → cast strip → principals → decoder → storylines → demoted tier-2 grid → weekend band. No live-data lede, no countdown widget, no seven-tile equal-weight grid. Scroll once and you've met the cast and got the decoder. Job D from the brief is achievable in ~10 seconds. (`review-homepage-desktop-1280.png`)

- **The `CharacterHero` is genuinely cinematic-editorial.** Photo + name display + character-read line + storyline body, with stats demoted below. The Lewis Hamilton page reads like a magazine profile, not a Wikipedia entry. The brief's "DTS without the documentary" lands here. (`review-driver-hamilton-desktop-1280.png`)

- **Decoder search is fast, accessible, and exactly the right shape.** Type "vsc" and you get a single, clearly-categorized result with RACE CONTROL meta. Type "parc" on mobile and the same thing happens inline on the homepage. The keyboard-driven listbox semantics are correct, the 44px result targets are correct, and the empty-state Try-one chips give a discovery path. (`review-decoder-search-active-desktop-1280.png`, `review-homepage-decoder-active-mobile-375.png`)

- **Sentence-case headings carry the warmer editorial register.** The homepage hero "F1 is a soap opera with engineers." reads like a magazine cover. The driver-page subheads "Why he matters" / "How he drives" / "Watch for" read like editorial framing rather than reference structure. The press-release tic is gone.

- **Per-team accents work without being shouty.** Ferrari red on the Hamilton page, Mercedes teal on the team page header — visible enough to signal identity, restrained enough not to overwhelm. The brightened text variants in `teamColors.ts` are doing real WCAG work without making accents feel artificial.

- **Mobile responsive behavior is real, not phoned-in.** Cast strip scroll-snaps with peek. Hero stacks. Weekend band stacks. Nav collapses to hamburger + decoder overlay. The CharacterHero gives up its 40/60 split cleanly. The work shows. (`review-driver-hamilton-mobile-375.png`)

- **Footer trust line is in.** "Independent and unofficial" + disclaimer + photo credits. Done. (`review-homepage-desktop-1280.png` footer)

- **Token system holds.** Section accents (`--section-drivers` … `--section-strategy`) and per-team text-contrast variants (`--team-primary-text`) carry consistently across pages. No drift visible in screenshots.

## Verdict

**Two P1 fixes from clean v1 ship.** Both are content-pass work, not architecture. The em-dash sweep on `.md`/`.mdx` files and the inline `JargonTip` deployment can land in a single sitting (the second is ~30 wraps of `<JargonTip>` across the active content). After those, the brief's v1 Done definition reads complete.

The deferred items in v1.1 (Hamilton-in-Ferrari hero photo, principal portraits, full driver/team rollout, `/your-first-race`, `/standings`, decoder feedback form) remain on the right side of the v1 line. The `StickyNav` 44px touch targets and the decoder overlay chips are P2 polish — pair with the em-dash sweep for a complete v1 patch pass.

---

You can ask me to run the recommended fixes one at a time, all at once, or in any order. After fixes land, re-run `$impeccable audit` (Q1) and `/design-review` (Q2) to confirm the score climbs to 18+/20 and the must-fix list goes empty.
