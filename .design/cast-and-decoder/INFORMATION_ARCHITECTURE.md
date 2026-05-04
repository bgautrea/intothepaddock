# Information Architecture: Into the Paddock

> **Reads alongside:** `DESIGN_BRIEF.md`, `CURRENT_STATE_AUDIT.md`, project memory (`MEMORY.md`).
> **Date:** 2026-05-04
> **Scope:** Full site IA for the cast-and-decoder redesign (v1) plus deferred slots (v1.1+).

## Site Map

```
/                                   Home — cast strip, decoder search, storylines, demoted tier-2 grid
├── /drivers                        Drivers index — current grid (by P) + legends (by titles)
│   └── /drivers/<slug>             Driver detail — CharacterHero + storyline + origin + style + stats
├── /teams                          Teams index — current constructors + legendary teams
│   └── /teams/<slug>               Team detail — Principal-as-character + storyline + technical sidebar
├── /the-car                        The Car — cutaway-led tier-2 explainer
├── /race-weekend                   Race Weekend — practice/qualifying/sprint/race tier-2 explainer
├── /rules                          Rules & Regs — points/flags/penalties/parc fermé tier-2 explainer
├── /tracks                         Tracks index — 24 circuits sorted by 2026 calendar round
│   └── /tracks/<slug>              Track detail — CircuitMap + character + lap notes
├── /strategy                       Strategy — tyres/pit/undercut/DRS/ERS tier-2 explainer
├── /decoder                        Decoder — broadcast lexicon, search-first, anchor-organized
│   └── /decoder#<term-slug>        Anchored entry (e.g., /decoder#parc-ferme, /decoder#vsc)
└── /404                            Custom DNF page

  Deferred to v1.1+:
  ├── /standings                    Full standings (drivers + constructors)
  ├── /your-first-race              Universal evergreen for first-time race attendees
  └── /tracks/<slug>#going-to-a-race   Per-track venue-specific rider section
```

**No separate `/cast` route.** The cast is delivered via homepage strips + the existing `/drivers` and `/teams` pages. A standalone `/cast` page would fragment navigation and duplicate content.

**No per-term routes.** `/decoder` is a single anchor-organized page. Sharing an entry uses `/decoder#vsc`, not `/decoder/vsc`.

## Navigation Model

### Primary navigation — `StickyNav`

Seven text items (reordered from the existing nav so the cast comes first), plus a search-icon affordance for the decoder. The search icon opens an inline overlay from any page.

```
[INTO THE PADDOCK]   Drivers · Teams · The Car · Race Weekend · Rules · Tracks · Strategy   [🔍 Decoder]
```

- **Item count:** 7 sections + 1 search affordance. Holds across desktop and mobile.
- **Active state:** kerb-yellow text + 2px underline (current implementation, retained).
- **Decoder is NOT a text nav item.** It's framed as a tool — a search icon at the right edge of the nav that opens the inline `DecoderSearch` overlay. This is structurally different from the seven sections; it's an action, not a destination.
- **Brand mark:** "INTO THE PADDOCK" stays uppercase (masthead exception to the sentence-case rule).

### Secondary navigation

- **Index pages (`/drivers`, `/teams`, `/tracks`)** use grouped sub-headers as wayfinding (Current grid / Legends; Current teams / Legendary teams; By calendar order). No tabs.
- **Detail pages (`/drivers/<slug>`, `/teams/<slug>`, `/tracks/<slug>`)** have **no sidebar nav.** Linear scroll: hero → storyline → narrative → stats sidebar. The next/previous driver pattern is **not** added in v1 — it pulls focus away from the storyline.
- **Tier-2 explainers (`/the-car`, `/race-weekend`, `/rules`, `/strategy`)** have an in-page table-of-contents anchor strip near the top, mono-styled. Helps long pages stay scannable.

### Utility navigation

- Lives in the footer: About, Data attribution (jolpica), Photos attribution (Wikimedia Commons).
- Trust line ("Independent and unofficial") leads the footer-tail above the © and disclaimer.
- No account, no settings, no help (no auth, no user state).

### Mobile navigation

- **Hamburger** for the seven section links — already implemented in `StickyNav` (collapses below 880px). Reorder to put Drivers and Teams first.
- **Persistent search-icon button** at the right of the nav bar, *always visible* on mobile (not collapsed under the hamburger). Tapping opens a full-screen decoder search overlay with input pinned at the top, results below, and a close button. This is the phone-in-hand-during-race surface.
- **Bottom bar:** not used. The persistent top-right search icon serves the same role with less screen real estate.

## Content Hierarchy

Per major page, in priority order. Above-the-fold = first ~720px on desktop / first scroll-position on mobile.

### Home `/`

1. **Hero — photographic, with name + dual CTAs.** Real photo (driver / grid-walk / podium); sentence-case drama-forward title; subtitle in body voice; two CTAs side-by-side: *Meet the cast →* and *Decode the broadcast →*. Above fold.
2. **Cast strip — 6 hand-curated drivers.** Portrait + name + character-read line + team color stripe. Above fold or just below.
3. **Decoder search — live, inline.** Search input + 6–8 quick-tap term chips. *No CTA;* the search itself is the affordance. Just below cast strip on desktop, may push below fold on mobile (acceptable — ranks 3rd).
4. **Principal strip — 4–5 team principals.** Sub-strip beneath the cast strip with the same shape but smaller scale.
5. **Current storylines band — 3–4 cards.** Quarterly-refreshed editorial. Title + 1–2 sentences + optional "read more →".
6. **What is F1 — single short paragraph.** Moves *down* from its current position to introduce the tier-2 grid (re-frames the seven-tile section as "the basics, in one paragraph, plus everywhere else to look").
7. **Tier-2 "How the sport works" grid.** All seven section tiles, demoted in scale, eyebrow "When you're ready, go deeper."
8. **Weekend band — slim, footer-adjacent.** Top-3 driver/constructor standings + countdown to next race + "Full standings →" link (link disabled in v1; enabled in v1.1 once `/standings` exists).

The "How to read this site" StepCards are **removed** as a standalone block. Their content folds into the eyebrow paragraph above the demoted tier-2 grid.

### Drivers `/drivers`

1. Hero (eyebrow "Section 01" + title "The Drivers" + subtitle).
2. **Current grid** — `EntityCard`s sorted by 2026 championship position (already implemented). Each card: portrait + name + team + position badge + **character-read line** (new in this redesign) + 3 stats.
3. **Legends** — same card shape, sorted by championship count.

No filter. No search. The decoder search is one tap away in the nav for term lookup; the drivers index is a curated browse, not a query.

### Driver Detail `/drivers/<slug>`

1. **CharacterHero** — full-bleed dark hero. Portrait left (40%, mobile: top), right (60%, mobile: below): name, character-read one-liner, current storyline (2–3 paragraphs), team color stripe on photo edge.
2. **Origin story.** How they got to F1. The bit DTS would dramatize.
3. **Driving style + rivalries.** How they actually drive (smooth vs aggressive, qualifying specialist vs. racecraft, tyre management). On-track history with current peers.
4. **Career receipts (sidebar / below-fold).** Stats. Wins, podiums, championships, notable moments. Restrained.

### Teams `/teams`

1. Hero (eyebrow "Section 02").
2. **Current constructors** — 11 `EntityCard`s with team photo + name + principal name + character-read line + 3 stats (championships, wins, base location).
3. **Legendary teams** — Brabham, Tyrrell, Lotus, etc. Same shape.

### Team Detail `/teams/<slug>`

1. **CharacterHero variant — principal-led.** Photo of the team principal (not the car). Name + role + character-read one-liner + current storyline. Team color stripe on photo edge.
2. **The team's story.** Founding, era arcs, current chapter.
3. **Roster.** Both drivers, with character-read lines, linking to driver detail.
4. **Technical / engineering sidebar.** Engine, base, championship history. Below fold.

### The Car / Race Weekend / Rules / Strategy (tier-2 explainers)

Each follows the existing pattern, with two redesign updates:

1. **Hero with sentence-case title.** Eyebrow ("Section 0n") + title + subtitle.
2. **Plain-language opener.** First two paragraphs are accessible to a Drive-to-Survive graduate.
3. **In-page TOC anchor strip.** Mono-styled, helps long pages stay scannable.
4. **Section bodies.** Each major topic gets a subhead, body copy, and (where useful) `JargonTip`-marked terms inline.
5. **Side-stripe accent borders are removed** per the audit; replaced with full borders or background tints. Top-stripes only.

### Tracks `/tracks` and `/tracks/<slug>`

- **Index** — sorted by 2026 calendar round (already implemented). Each card: track photo + Grand Prix name + round badge + length/corners/laps.
- **Detail** — CircuitMap hero + lap-character narrative + corner notes + key sections. The "Going to a race here?" rider is reserved as an anchor section but content lands in v1.1.

### Decoder `/decoder`

1. **Sticky search input** at top.
2. **6–8 quick-tap term chips** below the search ("Undercut," "Parc fermé," "Blue flag," "DRS," "VSC," "Track limits," "Slipstream," "Sprint").
3. **Category jump strip** ("Race control · Strategy · Tyres · The car · Race weekend · Penalties").
4. **Entries grouped by category, alphabetical within.** Each entry: term, plain-language definition, "you'll hear this when…" trigger line, optional one-sentence example.
5. **Footer:** "Don't see a term? Tell us." (mailto or future feedback form, deferred.)

## User Flows

### Flow 1 — First-time DTS-graduate visit

1. User lands on `/` from a friend's link or search.
2. Sees photographic hero + "You watched the show. Here's how the sport actually works." + two CTAs.
3. **Path A (cast)**: clicks "Meet the cast →" or scrolls to cast strip → clicks a driver card → lands on driver detail → reads CharacterHero + storyline → may navigate to teammate via roster, or back to cast.
4. **Path B (decoder)**: clicks "Decode the broadcast →" → focuses inline search → types or taps a chip → result selected → anchor-jumps to `/decoder#<term>` → reads entry → may browse adjacent terms.
5. **Path C (browse)**: scrolls past hero → reads What-is-F1 paragraph → enters tier-2 grid → clicks a topic.

### Flow 2 — Returning weekend visitor

1. User lands on `/` Friday before a race.
2. Glances at WeekendBand near footer: countdown shows "Race in 1d 14h," top-3 standings shown.
3. Clicks a featured driver they want to read about, or scrolls up to current storylines band to catch the arc.

### Flow 3 — Mid-broadcast lookup (the phone-in-hand JTBD)

1. User hears "VSC" on the broadcast.
2. Picks up phone, taps a bookmarked `intothepaddock.com` or types it.
3. Lands on home (or any cached page).
4. Taps the persistent **search-icon button** in the top-right of the nav.
5. Full-screen overlay opens with input pinned at top.
6. Types "vsc" → result highlighted → taps result.
7. Anchor-jumps to `/decoder#virtual-safety-car` → reads entry.
8. Closes phone.

**Critical:** steps 1–6 must all be possible with one thumb. No hover. No keyboard required.

### Flow 4 — Following a `JargonTip` from inline content

1. User reads a driver page or a tier-2 explainer.
2. Spots an underlined term ("parc fermé").
3. Taps the term → inline panel expands with the definition + "more →" link.
4. Either dismisses (Esc / tap outside) and continues reading, OR taps "more →" → anchor-jumps to `/decoder#parc-ferme`.
5. Reads the full entry. Hits browser back to return to the original page mid-paragraph.

### Flow 5 — Tier-2 deep dive

1. Curious user clicks `/the-car` from primary nav.
2. Reads the opener.
3. Uses the in-page TOC strip to jump to a specific topic (e.g., "Power Unit").
4. Encounters `JargonTip`-marked terms inline (KERS, MGU-K, MGU-H), taps to expand definitions.

## Naming Conventions

| Concept | Label in UI | Notes |
| --- | --- | --- |
| Drivers section | **Drivers** | Standard term, retained from existing nav. |
| Teams section | **Teams** | Standard term. |
| Team boss | **Team principal** | Used consistently — never "team boss" or "boss" (DTS uses both; the site picks one). |
| Glossary destination | **Decoder** | Tool-shaped framing, not "glossary" or "dictionary." |
| Glossary entry | **Term** | "Term" in body copy; "decoder entry" only when distinguishing from inline tooltip. |
| Inline jargon affordance | (no label) | Dotted yellow underline + tap. |
| Cast strip on homepage | **Meet the cast** | Editorial label for the homepage strip. |
| Principal strip on homepage | **Meet the principals** | Editorial label. |
| Tier-2 grid eyebrow | **When you're ready, go deeper** | Frames the seven-tile grid as secondary, not primary. |
| Live-data band | **Following along this weekend?** | Conversational, soft hook. |
| Race-weekend page | **Race Weekend** | Standard. |
| Cars / The Car page | **The Car** | Singular. Reads as a topic, not a list. |
| Live standings | **Standings** | Section name on the deferred `/standings` page; the homepage band has its own framing. |
| Champion / champ / world champion | **Champion** | Pick "champion." Don't mix in "champ" or "title-holder." |
| Constructor / team / outfit | **Team** in nav and headlines; **constructor** in technical / standings contexts. | Both are used in F1; "team" is the warmer reader-facing word. |
| Pit lane / pit road | **Pit lane** | "Pit road" is a NASCAR-ism. |
| Race day, race weekend, race | **Race** for the Sunday event; **Race Weekend** for the Friday-to-Sunday format; **Round nn** for calendar position. | Use "Round 7" only in mono-labeled UI (countdowns, badges); body copy says "Round 7" or "the seventh race of the season." |

## Component Reuse Map

| Component | Used on | Behavior differences |
| --- | --- | --- |
| `BaseLayout` | Every page | None. |
| `StickyNav` | Every page | Active route highlight; mobile hamburger collapse below 880px; persistent search-icon button (new). |
| `Footer` | Every page | None. |
| `Hero` | Tier-2 explainer pages, listing pages (`/drivers`, `/teams`, `/tracks`), `/decoder` | Eyebrow + title + subtitle; no photographic primary visual. |
| `CharacterHero` (new) | `/drivers/<slug>`, `/teams/<slug>` | Photo + name + character-read + current storyline. Per-team accent stripe on photo edge. |
| `KerbDivider` | Every page (multiple per page) | Variants: `thick`, `default`, `thin`. Decorative; `aria-hidden`. |
| `EntityCard` | `/drivers`, `/teams`, `/tracks` | New `characterRead` prop renders a one-line hook above stats. |
| `CastStrip` (new) | `/` only | Hand-curated 6 drivers. Mobile: 1.2 visible + horizontal scroll-snap. |
| `PrincipalStrip` (new) | `/` only | Hand-curated 4–5 principals. Same shape as `CastStrip`, smaller scale. |
| `DecoderSearch` (new) | `/`, `/decoder` | Same component; on `/` it's contextual; on `/decoder` it's sticky at top. Mobile-overlay variant for the persistent nav search icon. |
| `DecoderEntry` (new) | `/decoder`, expanded `JargonTip` | Reads from `glossary` content collection. |
| `StorylineCard` (new) | `/` only | Card variant for the homepage storylines band. |
| `WeekendBand` (new) | `/` only | Footer-adjacent slim band: top-3 standings + countdown. Replaces the full `LiveStandingsTable` + hero `NextRaceCountdown`. |
| `JargonTip` | Any page with inline broadcast vocabulary | Tap-friendly, keyboard-activatable. Reads from `glossary` collection. Anchor-links to `/decoder#<term>`. |
| `AnalogyCallout` | Tier-2 explainers | No change. |
| `SectorBadge` | Tier-2 (race weekend, strategy) | No change. |
| `StatBlock` | Tier-2, sidebar of cast pages | Side-stripe `border-left` removed per audit; replaced with top hairline or no border. |
| `TyreChip` | `/strategy`, `/race-weekend` | No change. |
| `PhotoStrip` | Cast pages, tier-2 explainers | Promote: also used on homepage cast strip / principal strip. |
| `LiveStandingsTable` | `/standings` (deferred), `/` (top-3 variant via `WeekendBand`) | Two variants: full table, top-3 preview. |
| `NextRaceCountdown` | Inside `WeekendBand` on `/` | Visual demoted from hero card to slim mono row. |
| `CarCutaway` | `/the-car` | No change. |
| `CircuitMap` | `/tracks/<slug>` | No change. |
| `StepCard` | (removed from `/`) | If retained anywhere, move analogy block off side-stripe pattern. May be deleted in v1 if no remaining users. |

## Content Growth Plan

| Section | Cardinality | Growth pattern | IA accommodation |
| --- | --- | --- | --- |
| `/drivers` | ~22 active + ~5 legends | Annual driver-market churn; legends accumulate slowly | Existing two-section split (current grid / legends) absorbs both. No pagination needed for foreseeable future. |
| `/teams` | 11 constructors + ~5 legendary | Cadillac entered 2026; otherwise stable | Same as drivers. |
| `/tracks` | 24 calendar (2026) + future | Calendar shifts annually; new circuits possible (Madring) | Sort by `calendarRound`; cards with no calendar slot fall to end. |
| `/decoder` | 80–150 by v1; can grow indefinitely | Open-ended. New broadcast slang and reg changes generate terms. | Single anchor-organized page + search. Pagefind indexes incrementally on build. Above ~300 terms, consider category-paged sub-routes (deferred). |
| Homepage current storylines | 3–4 cards at a time | Quarterly refresh | Dedicated `currentStorylines` content collection or top-of-file constant. Old storylines aren't archived; they're rotated out. |
| Homepage cast strip | 6 drivers + 4–5 principals | Quarterly hand-curation | Same editorial moment as storylines; one config file or content collection. |

## URL Strategy

### Patterns

- **Section index:** `/<section>` (e.g., `/drivers`, `/teams`, `/decoder`).
- **Detail (slugged):** `/<section>/<slug>` (e.g., `/drivers/lewis-hamilton`, `/teams/mercedes`, `/tracks/silverstone`).
- **Anchor in single-page reference:** `/decoder#<term-slug>` (e.g., `/decoder#parc-ferme`, `/decoder#virtual-safety-car`).
- **In-page section anchor (tier-2):** `/<page>#<topic>` (e.g., `/the-car#power-unit`, `/race-weekend#sprint`).

### Slug rules

- Lowercase only.
- Hyphen-separated; never underscores.
- ASCII-safe (the existing code already strips diacritics for matching against jolpica `driverId` values like `max_verstappen` vs. our slug `max-verstappen`).
- Stable. Once a slug ships, don't rename it; redirect instead.
- Glossary slugs use the canonical broadcast form (`parc-ferme`, not `parc-ferm` or `parc-ferme-rules`).
- Decoder synonym handling: secondary names (e.g., "Virtual Safety Car" = "VSC") live in the entry's frontmatter `aliases` list and feed the search index. They do **not** create separate routes.

### Dynamic segments

- `[slug]` for `/drivers/[slug]`, `/teams/[slug]`, `/tracks/[slug]`. Resolved from corresponding `src/content/<collection>/` entries.

### Query parameters

- Reserved for future filtering (e.g., `?era=1990s` on legends, `?category=race-control` on decoder). Not used in v1.
- Avoid query-parameter-only pages; every meaningful destination has a URL.

### Redirects (planned)

- None in v1; existing routes retain their slugs.
- v1.1: `/glossary` → 301 → `/decoder` (in case anyone bookmarks the term "glossary" externally).
