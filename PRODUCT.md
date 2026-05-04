# Product

## Register

brand

## Users

DTS-graduate casual Formula 1 fans. They've watched *Drive to Survive*, are starting to tune into broadcasts, and want to understand the cast and the language without being condescended to. The originating user is the project owner's wife, attending the USGP in October 2026 as her first live race; she's representative of an audience that's into the *drama* of F1, not the engineering trivia.

She uses the site in three contexts:

1. Sitting down to onboard from DTS into the actual sport (longform reading).
2. Phone-in-hand during a broadcast, looking up "what does parc fermé mean?" in seconds.
3. Following the season's storylines without committing to weekly news habits.

## Product Purpose

`intothepaddock.com` is an independent, opinionated guide to Formula 1 for fans who started with *Drive to Survive* and want to know how the sport actually works. Three primary on-ramps: meet the cast (drivers and team principals as characters), decode the broadcast (instant lookup of the broadcast lexicon), and learn how the sport works (engineering and rules backbone).

Success looks like: a DTS-graduate spends 20 minutes on the site and walks away with a real grasp of personalities, storylines, and core terminology, and comes back when she hears something on TV she doesn't recognize.

Explicitly **not** a Wikipedia, encyclopedia, news site, or fan blog. Does not compete with race-by-race coverage on Reddit / YouTube, and does not try to replicate official `f1.com` content.

## Brand Personality

Three words: **confident, warm, drama-forward.**

Voice: institutional, with personality. The byline is "Into the Paddock," not a personal blog. The site has takes and shows them. Every opinion gets a paragraph of why behind it; evidence and interpretation are kept distinct. Posture toward the reader is *knowing peer*, never *patient teacher*. Second-person sparingly; narrative third-person where the focus is on people.

DTS is the on-ramp; the site references DTS framings to *correct or extend* them, never to embrace verbatim or pretend the show doesn't exist.

## Anti-references

This site explicitly should NOT feel like:

- **Wikipedia**: neutral, comprehensive, voiceless.
- **Official `f1.com`**: corporate, brand-safe, dry, brand-managed.
- **`r/F1`**: chaotic, partisan, assumes deep priors.
- **`The Race` / `RaceFans`**: race-by-race news treadmill that the site explicitly does not compete in.
- **Generic AI tool marketing pages**: gradient text, hero-metric templates, identical card grids, glassmorphism.
- **"Race report" minimalism**: all-caps everywhere, mono-coded press-spread aesthetic with no narrative.

## Design Principles

1. **Cast over roster.** Every page leads with personality and current storyline. Stats are sidebar. Resolves the tension between completeness and narrative in favor of narrative.

2. **Decode in seconds, not paragraphs.** The broadcast lexicon is searchable, scannable, and one tap away from any page. Resolves the tension between comprehensiveness and immediacy in favor of immediacy.

3. **Opinions, with rigor.** The site has takes; every take shows its work. Evidence and interpretation are kept distinct. Resolves the tension between neutrality and personality in favor of personality with discipline.

4. **Lead with faces.** Heros are photographs of people, not widgets. DTS sold the audience on faces and machines; the site honors that.

5. **Evergreen over treadmill.** Cast and decoder content is written once and refreshed annually on team moves. A quarterly editorial moment refreshes the homepage storylines band. No race-by-race news.

## Accessibility & Inclusion

- WCAG 2.1 AA. Body text contrast ≥ 4.5:1; large text ≥ 3:1.
- Per-team accent colors must pass contrast against `--asphalt-900` background; brightened-for-text variants are used where the brand color fails.
- Keyboard navigable; visible focus rings (`outline: 2px solid var(--kerb-yellow)`).
- `prefers-reduced-motion` respected for any motion.
- `JargonTip` and decoder search are tap-friendly, never hover-only. The phone-in-hand-during-race scenario governs decisions when there's tension.
- Color is never the sole signal of meaning (team accent always paired with team name in text; tyre compound chips include the compound name, not just a color dot).
- Layouts must work at 200% zoom and 320px viewport without horizontal scroll.
