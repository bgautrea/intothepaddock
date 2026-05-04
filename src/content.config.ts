import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const drivers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/drivers' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      number: z.number().int().min(1).max(99),
      team: reference('teams').optional(),
      legendaryTeam: z.string().optional(),
      nationality: z.string(),
      dob: z.coerce.date(),
      birthplace: z.string(),
      debutSeason: z.number().int(),
      careerWins: z.number().int().default(0),
      careerPodiums: z.number().int().default(0),
      careerPoles: z.number().int().default(0),
      championships: z.number().int().default(0),
      status: z.enum(['active', 'legend', 'retired']).default('active'),
      portrait: image().optional(),
      portraitCredit: z.string().optional(),
      bio: z.string(),
      funFact: z.string().optional(),
      /**
       * One-line drama-forward hook for cast pages and listings.
       * Sentence case, no em dashes. ~12–25 words. Optional in v1
       * (only the 6 cast-strip drivers carry one); required in v1.1
       * once every active driver is profiled.
       */
      characterRead: z.string().optional(),
    }),
});

const teams = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/teams' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      shortName: z.string(),
      base: z.string(),
      teamPrincipal: z.string(),
      foundedSeason: z.number().int(),
      powerUnit: z.string(),
      championships: z.number().int().default(0),
      constructorTitles: z.number().int().default(0),
      primaryColor: z
        .string()
        .regex(/^#[0-9a-f]{6}$/i, 'Use a 6-digit hex like #ff1801'),
      secondaryColor: z
        .string()
        .regex(/^#[0-9a-f]{6}$/i)
        .optional(),
      car: image().optional(),
      carCredit: z.string().optional(),
      tagline: z.string(),
      /**
       * One-line drama-forward hook framing the team principal as the
       * page's protagonist. Sentence case, no em dashes. ~12–25 words.
       * Optional in v1 (Mercedes / Red Bull / Ferrari only); the rest of
       * the grid lands in v1.1.
       */
      principalCharacterRead: z.string().optional(),
    }),
});

const tracks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tracks' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      grandPrix: z.string(),
      country: z.string(),
      city: z.string(),
      lengthKm: z.number(),
      laps: z.number().int(),
      raceDistanceKm: z.number(),
      corners: z.number().int(),
      drsZones: z.number().int(),
      lapRecord: z
        .object({
          time: z.string(),
          driver: z.string(),
          year: z.number().int(),
        })
        .optional(),
      firstGp: z.number().int(),
      geojsonFile: z.string().optional(),
      calendarRound: z.number().int().optional(),
      nickname: z.string().optional(),
      difficulty: z.enum(['low', 'medium', 'high', 'legendary']).optional(),
      overtakingDifficulty: z.enum(['easy', 'medium', 'hard', 'brutal']).optional(),
      photo: image().optional(),
      photoCredit: z.string().optional(),
    }),
});

const topics = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/topics' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    slug: z.enum(['the-car', 'race-weekend', 'rules', 'strategy']),
    heroVisual: z
      .enum(['car-cutaway', 'race-weekend-timeline', 'flags-grid', 'strategy-board'])
      .optional(),
  }),
});

/**
 * Decoder glossary. Each entry is one broadcast vocabulary term:
 * - `term`: the canonical name as the broadcast says it ("Virtual Safety Car").
 * - `category`: groups entries on /decoder. Anchor IDs derive from this.
 * - `aliases`: alternate names ("VSC", "virtual safety") feed the decoder
 *   search synonyms. They do NOT create separate routes.
 * - `youllHearWhen`: the trigger line — the broadcast moment that surfaces
 *   the term. The thing that makes the decoder a decoder, not a glossary.
 * - `example`: optional one-sentence example or analogy.
 *
 * Body content is the plain-language definition (1–2 sentences typical).
 */
const glossary = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/glossary' }),
  schema: z.object({
    term: z.string(),
    category: z.enum([
      'race-control',
      'strategy',
      'tyres',
      'the-car',
      'race-weekend',
      'penalties',
    ]),
    aliases: z.array(z.string()).optional().default([]),
    youllHearWhen: z.string(),
    example: z.string().optional(),
  }),
});

/**
 * Current storylines. The homepage band that frames "what's actually
 * interesting about this season right now," refreshed quarterly. Each
 * storyline is one card on the homepage; the optional `href` links to
 * a deeper article when one exists, otherwise the card carries the full
 * text and the body becomes the summary.
 *
 * Editorial cadence: 3–4 active at a time, refreshed at the same moment
 * the homepage cast strip is re-curated.
 */
const storylines = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/storylines' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    href: z.string().optional(),
    order: z.number().int().default(99),
  }),
});

export const collections = { drivers, teams, tracks, topics, glossary, storylines };
