---
name: Into the Paddock
description: Independent, opinionated guide to Formula 1, in the visual language of the pit wall at twilight
colors:
  asphalt-900: "#0e0f10"
  asphalt-800: "#16181b"
  asphalt-700: "#1f2226"
  asphalt-600: "#2c3037"
  asphalt-500: "#3a3f47"
  kerb-yellow: "#fce700"
  kerb-yellow-dim: "#c4b300"
  kerb-white: "#f5f5f3"
  text-primary: "#f5f5f3"
  text-secondary: "#c8ccd3"
  concrete: "#9ca0a6"
  text-muted: "#6c7079"
  sector-purple: "#b545ff"
  sector-green: "#2ecc71"
  sector-yellow: "#f4d03f"
  flag-red: "#ff2e2e"
  flag-blue: "#2e7bff"
  tyre-soft: "#e10600"
  tyre-medium: "#f3d54e"
  tyre-hard: "#f5f5f3"
  tyre-intermediate: "#2bbf4d"
  tyre-wet: "#2680ff"
typography:
  display:
    fontFamily: "Barlow Condensed, Oswald, Arial Narrow, sans-serif"
    fontSize: "clamp(2.75rem, 6vw, 5.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.005em"
  headline:
    fontFamily: "Barlow Condensed, Oswald, Arial Narrow, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.1
  title:
    fontFamily: "Barlow Condensed, Oswald, Arial Narrow, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.1
  body:
    fontFamily: "Inter Variable, Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "JetBrains Mono Variable, JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    letterSpacing: "0.18em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "16px"
spacing:
  sp-1: "0.25rem"
  sp-2: "0.5rem"
  sp-3: "0.75rem"
  sp-4: "1rem"
  sp-5: "1.25rem"
  sp-6: "1.5rem"
  sp-8: "2rem"
  sp-10: "2.5rem"
  sp-12: "3rem"
  sp-16: "4rem"
  sp-24: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.kerb-yellow}"
    textColor: "{colors.asphalt-900}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 0.75rem"
  card-entity:
    backgroundColor: "{colors.asphalt-800}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "1.5rem"
  hero-visual:
    backgroundColor: "{colors.asphalt-800}"
    rounded: "{rounded.md}"
    padding: "1.5rem"
---

# Design System: Into the Paddock

## 1. Overview

**Creative North Star: "The Pit Wall at Twilight"**

A dark, photographic visual world tinted toward kerb yellow, the color you see at the edge of every circuit. Surfaces feel like asphalt seen from the pit wall during twilight: matte, structured, with strips of high-saturation accent that call out the racing line. Sentence-case editorial typography reads like a magazine profile rather than a press release. The palette is restrained; the photography does the heavy lifting.

The system rejects "race report" minimalism (all-caps everything, mono-coded press-spread aesthetic), the corporate brand-safety of official F1 sites (flat blues, sterile sans-serif, no opinions), and the gradient-and-glass aesthetic of generic SaaS marketing pages.

**Key Characteristics:**

- Dark surfaces (near-black asphalt) tinted toward warm graphite, not pure black.
- One signature accent (kerb yellow) plus per-team accents that override `--team-primary` on driver and team pages.
- Display typography is condensed and confident, but **sentence-case** (not all-caps) by default. Uppercase is reserved as a deliberate accent: eyebrows, badges, "SECTION nn" labels.
- Numerical and structural-label content always in monospace with tabular numerals.
- Photography-led: heros use real images of drivers, team principals, and circuits, never icons-on-gradient.
- Kerb-stripe motif is the signature visual element: alternating yellow/white blocks rendered as a CSS gradient, used as section break.

## 2. Colors

A monochrome dark base with one signature accent and a per-team accent override. The accent never carries 50% of the surface; rarity is the point.

### Primary

- **Kerb Yellow** (`#fce700`): The signature accent. Calls-to-action, focus rings, eyebrow labels, the kerb-stripe motif. Never the dominant surface color.

### Secondary

- **Per-Team Accent** (`var(--team-primary)`): Overridden per page. Carries the team's brand color into eyebrows, dividers, and link underlines on driver and team pages. Defaults to kerb yellow when no team is set. Brightened-for-text variants used where the raw team color fails contrast against `--asphalt-900`.

### Neutral

- **Asphalt-900** (`#0e0f10`): Page background. The default canvas.
- **Asphalt-800** (`#16181b`): Card backgrounds. One step lighter for elevation without shadow.
- **Asphalt-700 / 600 / 500** (`#1f2226`, `#2c3037`, `#3a3f47`): Borders, dividers, secondary surfaces.
- **Kerb White** (`#f5f5f3`): Primary text on dark; the kerb-stripe alternating block.
- **Text-Secondary** (`#c8ccd3`), **Concrete** (`#9ca0a6`), **Text-Muted** (`#6c7079`): Body, lead, and label tiers.

### Tertiary (Telemetry / Data)

- **Sector Purple** (`#b545ff`), **Sector Green** (`#2ecc71`), **Sector Yellow** (`#f4d03f`): Sector-time and timing-screen data.
- **Flag Red** (`#ff2e2e`), **Flag Blue** (`#2e7bff`): Race-control signaling.
- **Tyre Compounds** (`#e10600` soft / `#f3d54e` medium / `#f5f5f3` hard / `#2bbf4d` intermediate / `#2680ff` wet): F1's standard compound colors, for `TyreChip` and strategy content.

### Named Rules

**The Per-Team Accent Rule.** Each driver and team page sets `--team-primary` to that team's brand color. The accent is always *paired* with the team name in text, so color is never the sole signal. Where a team color fails contrast against `--asphalt-900`, a brightened variant is used for type and links; the true brand color is reserved for non-text accents (stripes, dividers, photo edges).

**The Yellow ≤ 10% Rule.** Kerb yellow appears as accent, never as a surface. If more than ~10% of any screen is yellow, the design has crossed from accent into branding noise.

## 3. Typography

**Display Font:** Barlow Condensed (with Oswald, Arial Narrow as fallbacks)
**Body Font:** Inter Variable (with Inter, system-ui as fallbacks)
**Label / Mono Font:** JetBrains Mono Variable (with IBM Plex Mono, ui-monospace as fallbacks)

**Character:** Condensed display set against generous, neutral body; mono carries data and structural labels. The pairing reads as editorial-cinematic: magazine profile crossed with telemetry readout.

### Hierarchy

- **Display** (Barlow Condensed 700, `clamp(2.75rem, 6vw, 5.5rem)`, line-height 1.1): Hero titles. Sentence case by default.
- **Headline** (Barlow Condensed 700, 2rem, line-height 1.1): H2 section heads. Sentence case.
- **Title** (Barlow Condensed 700, 1.5rem, line-height 1.1): H3 sub-sections. Sentence case.
- **Body** (Inter Variable 400, 1rem, line-height 1.55): Reading content. Cap line length at 65–75ch.
- **Lead** (Inter Variable 400, 1.125rem, line-height 1.6): Article ledes; max-width 70ch.
- **Label** (JetBrains Mono Variable 400, 0.75rem, letter-spacing 0.18em, **uppercase**): Eyebrows, badges, structural codes ("SECTION 01"). The only place uppercase survives by default.
- **Mono Numbers** (JetBrains Mono with `font-variant-numeric: tabular-nums`): All numerical content. Standings, timings, lap counts, stats.

### Named Rules

**The Sentence-Case Rule.** H1–H4 are sentence case by default. Uppercase is a deliberate accent, reserved for `.eyebrow` labels, badges, and the `SECTION nn` codes. The earlier global `text-transform: uppercase` rule on H1–H4 is removed; it made every page read as a press release.

**The Mono-for-Numbers Rule.** Every numerical or structural-label string uses JetBrains Mono with tabular numerals. Standings, timings, lap counts, stats, eyebrows. Never inter-mix mono numerals into Inter body copy.

## 4. Elevation

Flat by default. Depth is conveyed through tonal layering (`asphalt-900` → `asphalt-800` → `asphalt-700`) rather than shadows. Two ambient tokens exist for state and hero accent.

### Shadow Vocabulary

- **`--shadow-card`** (`0 1px 0 0 rgba(252, 231, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.35)`): Card hover or featured-card resting state. Tinted with kerb yellow at very low opacity.
- **`--glow-yellow`** (`0 0 24px rgba(252, 231, 0, 0.18)`): Reserved for hero or focus moments. Never as a default state.

### Named Rules

**The Tonal-Layer Rule.** Cards rest on `asphalt-800` against an `asphalt-900` background; nested surfaces step further to `asphalt-700`. No drop shadow at rest. Shadows appear only as a response to state (hover, elevation, focus).

## 5. Components

### Buttons

- **Shape:** Sharp corners. `--radius-sm` (4px) for primary actions; `--radius-md` (8px) for cards.
- **Primary:** Kerb yellow background, asphalt-900 text. Uppercase mono label. Used sparingly: primary CTAs and the skip-link.
- **Hover / Focus:** Outline 2px kerb yellow with 2px offset (already implemented globally on `:focus-visible`). Background lift via tonal change, not shadow.
- **Ghost:** Transparent background, kerb-yellow underline on hover.

### Cards

- **EntityCard:** `--radius-md` (8px), `asphalt-800` background, top-edge accent stripe in `--team-primary`. Used for driver, team, and track listings. Receives a `characterRead` prop in the redesign to render a one-line hook above stats.
- **StorylineCard (new):** Same shape as EntityCard, but with a pull-quote-shaped headline treatment.
- **Internal padding:** `--sp-6` (1.5rem) typical.

### Inputs

- **DecoderSearch (new):** Full-width on mobile, capped at 32rem on desktop. `asphalt-800` background, `--border-thin` border, kerb-yellow focus ring. Accessible label always present (visually hidden when contextual). Tap-friendly; keyboard navigable with `↑/↓` arrows and `Enter` to select.

### Navigation

- **StickyNav:** Pinned at top, `--nav-height` (56px). `asphalt-900` background, kerb-yellow accent on active route. Mobile collapse to be reviewed during impeccable polish.

### Dividers

- **KerbDivider:** Signature element. Repeating yellow / kerb-white blocks via CSS gradient. Variants: thick (14px), default (8px), thin (4px), diagonal, vertical, inverted. Used as section breaks; `aria-hidden="true"`.

### Signature Component: CharacterHero (new)

The driver and team page hero. Photo left (40%), name + character-read line + current storyline right (60%) on desktop; stacked on mobile. Per-team accent stripe on the photo edge. The character-read line is the page's editorial promise, written in body voice, sentence case, not display.

## 6. Do's and Don'ts

### Do:

- **Do** lead every cast page with a photograph, character-read line, and current storyline. Stats live in a sidebar.
- **Do** use sentence-case for H1–H4 by default. Uppercase only for `.eyebrow`, badges, and `SECTION nn` codes.
- **Do** set `--team-primary` per page on driver and team pages and pair color with name in text.
- **Do** use mono with tabular numerals for every numerical or structural-label string.
- **Do** keep body line length 65–75ch.
- **Do** layer surfaces tonally (`asphalt-900` → `asphalt-800` → `asphalt-700`) for depth.
- **Do** respect `prefers-reduced-motion` on any motion (already implemented in `global.css`).
- **Do** make `JargonTip` tap-friendly with keyboard activation. Phone-in-hand-during-race is the primary scenario.

### Don't:

- **Don't** restore the global `text-transform: uppercase` default on H1–H4. It's a press-release tic.
- **Don't** use `#000` or `#fff` directly. The asphalt and kerb-white tokens are tinted toward the brand hue.
- **Don't** use kerb yellow as a surface. ≤ 10% of any screen.
- **Don't** use a per-team accent color for body text without verifying contrast against `asphalt-900`. Use the brightened variant where the brand color fails.
- **Don't** ship a dropdown, tooltip, or interactive element that requires hover. Mobile is the primary scenario.
- **Don't** use side-stripe `border-left` / `border-right` greater than 1px as a colored accent on cards, list items, callouts, or alerts. The kerb-stripe motif is a separate, full-width pattern, not a side stripe.
- **Don't** use gradient text or `background-clip: text` for headlines. Single solid color, emphasis via weight and size.
- **Don't** use glassmorphism or `backdrop-filter: blur` as a default. Rare and purposeful, or nothing.
- **Don't** use the hero-metric template (big number + small label + supporting stats + gradient accent). SaaS cliché.
- **Don't** use identical card grids of icon + heading + text repeated endlessly. The "how the sport works" tile grid is acceptable because it's purposefully demoted to tier 2; do not repeat the pattern in tier-1 sections.
- **Don't** use em dashes in copy. Use commas, colons, semicolons, periods, or parentheses. Also not `--`.
- **Don't** use bounce or elastic easing. Ease-out exponential only.
- **Don't** ship race-by-race news. Reddit and YouTube own that lane.
- **Don't** ship the hero with a countdown widget as the primary visual. Heros are photographs.
