import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const drivers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/drivers' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      number: z.number().int().min(1).max(99),
      team: reference('teams'),
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
      tagline: z.string(),
    }),
});

const tracks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tracks' }),
  schema: z.object({
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

export const collections = { drivers, teams, tracks, topics };
