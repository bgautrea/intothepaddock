#!/usr/bin/env node
/**
 * Drafts the prose body of a race recap using GitHub Models.
 *
 * Usage:
 *   node scripts/draft-recap-prose.mjs --slug=2025-monaco
 *
 * Inputs:
 *   data/snapshots/race-recaps/<slug>.json    (required, from fetch-recap-data.mjs)
 *   data/race-notes/<slug>.md                 (optional, user's bullet notes)
 *
 * Output:
 *   src/content/race-recaps/<slug>.draft.mdx  (frontmatter + prose)
 *
 * Backend: GitHub Models. Reads GITHUB_TOKEN from env (the workflow sets this
 * automatically). Endpoint and model are overridable via LLM_ENDPOINT and
 * LLM_MODEL for local testing.
 *
 * Failure modes:
 *   - Panel JSON missing → exit 2 (fix by running fetch-recap-data.mjs first).
 *   - GITHUB_TOKEN missing → exit 3.
 *   - LLM call fails after retry → exit 4 (workflow opens PR with panel only).
 *
 * Voice: locked decoder / ELI5, sentence case, no em dashes. Up to 6 sentences.
 * Jargon terms in the glossary collection are wrapped with <JargonTip> components.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const ENDPOINT = process.env.LLM_ENDPOINT ?? 'https://models.github.ai/inference/chat/completions';
const MODEL = process.env.LLM_MODEL ?? 'openai/gpt-4o-mini';
// Prefer MODELS_TOKEN (the dedicated Models PAT) and fall back to GITHUB_TOKEN
// so locally-exported tokens keep working without renaming.
const TOKEN = process.env.MODELS_TOKEN ?? process.env.GITHUB_TOKEN;
const ROOT = process.cwd();

const args = parseArgs(process.argv.slice(2));
const slug = args.slug;
if (!slug) {
  console.error('Usage: node scripts/draft-recap-prose.mjs --slug=YYYY-track');
  process.exit(2);
}

const panelPath = resolve(ROOT, `data/snapshots/race-recaps/${slug}.json`);
if (!existsSync(panelPath)) {
  console.error(`[draft] panel snapshot missing at ${panelPath}; run fetch-recap-data.mjs first.`);
  process.exit(2);
}

if (!TOKEN) {
  console.error('[draft] MODELS_TOKEN (or GITHUB_TOKEN) not set in env.');
  process.exit(3);
}

const panel = JSON.parse(readFileSync(panelPath, 'utf8'));
const notesPath = resolve(ROOT, `data/race-notes/${slug}.md`);
const notes = existsSync(notesPath) ? readFileSync(notesPath, 'utf8').trim() : '';
const glossarySlugs = readdirSync(resolve(ROOT, 'src/content/glossary'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => f.replace(/\.md$/, ''))
  .sort();

const [season, ...trackParts] = slug.split('-');
const trackSlug = trackParts.join('-');

const draftMdx = await draft({ slug, season, trackSlug, panel, notes, glossarySlugs });

const outPath = resolve(ROOT, `src/content/race-recaps/${slug}.draft.mdx`);
writeFileSync(outPath, draftMdx);
console.log(`[draft] wrote ${outPath}`);

// ─── prompt construction + LLM call ─────────────────────────────────────

async function draft({ slug, season, trackSlug, panel, notes, glossarySlugs }) {
  const system = systemPrompt(glossarySlugs);
  const user = userPrompt({ slug, season, trackSlug, panel, notes });

  const prose = await callLLM({ system, user });
  const sentences = countSentences(prose);
  const ok = sentences >= 3 && sentences <= 8;
  let final = prose;
  let needsReview = false;

  if (!ok) {
    console.warn(`[draft] first attempt produced ${sentences} sentences; re-prompting once.`);
    const retry = await callLLM({
      system,
      user: user + `\n\nIMPORTANT: your previous draft had ${sentences} sentences. Produce 5 sentences (acceptable range 3-7).`,
    });
    const retrySentences = countSentences(retry);
    if (retrySentences >= 3 && retrySentences <= 8) {
      final = retry;
    } else {
      console.warn(`[draft] retry also off (${retrySentences} sentences); shipping with marker.`);
      needsReview = true;
    }
  }

  return mdxFrontmatter({ panel, notesIncluded: Boolean(notes), needsReview }) + '\n\n' + final.trim() + '\n';
}

function systemPrompt(glossarySlugs) {
  return [
    "You write race recaps for Into the Paddock, an F1 educational guide for fans who watched Drive to Survive and now want to actually understand what's happening on track.",
    '',
    'Voice rules:',
    "- Sentence case. Never use em dashes (—). Use commas, parentheses, or short clauses instead.",
    '- 5 sentences. Acceptable range 4-7.',
    '- The recap is the 5-sentence story of the race, in plain language. Not a bullet list. A paragraph.',
    "- Lead with what actually happened, then complicate it with the data (who was fast where, who lost it, who got lucky).",
    '- Tone: knowing but not arrogant. "Opinions with rigor." Pretend you are explaining it to a friend who watches but does not yet read the timing screens.',
    '- DO NOT quote pundits or other writers. The take is yours, drawn from the underlying public facts.',
    '',
    'Jargon: when you use F1 vocabulary that a casual fan might not know, wrap the term in a <JargonTip slug="..."> component. The slug must come from this list:',
    glossarySlugs.join(', '),
    '',
    'Examples:',
    '- The <JargonTip slug="undercut">undercut</JargonTip> nearly worked.',
    '- A late <JargonTip slug="virtual-safety-car">virtual safety car</JargonTip> reset everything.',
    '',
    'Do not over-tag. Common terms (lap, pole, podium, race) do not need tags. Only words a Drive-to-Survive graduate plausibly does not know.',
    '',
    "Output: just the prose body. No frontmatter, no markdown headings. The component imports are added by the build pipeline.",
  ].join('\n');
}

function userPrompt({ slug, season, trackSlug, panel, notes }) {
  const top = panel.results.slice(0, 5);
  const fl = panel.fastestLap;
  const sl = panel.sectorLeaders;
  const ts = panel.topSpeeds.slice(0, 3);
  const gainers = panel.biggestMovers.gainers;
  const losers = panel.biggestMovers.losers;

  return [
    `Race: ${season} ${slug.replace(/^\d+-/, '')} (slug ${slug})`,
    '',
    'Top 5 finishing order:',
    ...top.map((r) => `  P${r.position} · ${r.driverName} (${r.teamSlug ?? '?'}) · gap ${r.gapToLeader ?? r.status}`),
    '',
    fl ? `Fastest lap: ${fl.driverName} on lap ${fl.lap} (${fl.time}).` : 'Fastest lap: n/a',
    '',
    panel.hasTelemetry
      ? `Sector leaders: S1 ${sl.s1?.driverName ?? 'n/a'} (${sl.s1?.timeSec ?? 'n/a'}s), S2 ${sl.s2?.driverName ?? 'n/a'} (${sl.s2?.timeSec ?? 'n/a'}s), S3 ${sl.s3?.driverName ?? 'n/a'} (${sl.s3?.timeSec ?? 'n/a'}s).`
      : 'Sector data: not available for this race.',
    '',
    panel.hasTelemetry && ts.length > 0
      ? `Top speeds (km/h): ${ts.map((t) => `${t.driverName} ${t.speedKmh}`).join(', ')}.`
      : '',
    '',
    `Biggest gainers: ${gainers.map((g) => `${g.driverName} (+${g.change})`).join(', ')}.`,
    `Biggest losers: ${losers.map((l) => `${l.driverName} (${l.change})`).join(', ')}.`,
    '',
    notes
      ? `My notes from watching the race (use these as the story scaffolding; the LLM does not see the race, you do):\n\n${notes}`
      : '(No race notes were provided for this race. Draft from data alone; the prose will be more clinical.)',
    '',
    'Now write the 5-sentence recap.',
  ].filter(Boolean).join('\n');
}

async function callLLM({ system, user }) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${TOKEN}`,
        'content-type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.6,
        max_tokens: 600,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      const text = json.choices?.[0]?.message?.content;
      if (typeof text === 'string' && text.trim()) return text.trim();
      throw new Error('LLM returned empty content');
    }
    if (res.status === 429 && attempt < 2) {
      await new Promise((r) => setTimeout(r, (attempt + 1) * 4000));
      continue;
    }
    const body = await res.text();
    throw new Error(`LLM HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
  throw new Error('LLM exhausted retries');
}

function countSentences(text) {
  // Plain heuristic. Strips JargonTip wrappers first so component punctuation
  // doesn't inflate the count, then splits on terminal punctuation.
  const stripped = text.replace(/<\/?JargonTip[^>]*>/g, '');
  const matches = stripped.match(/[.!?]+(\s|$)/g);
  return matches ? matches.length : 0;
}

function mdxFrontmatter({ panel, notesIncluded, needsReview }) {
  const m = panel.meta;
  return [
    '---',
    `season: ${m.season}`,
    `round: ${m.round}`,
    `raceName: ${m.raceName}`,
    `circuitRef: ${m.circuitRef}`,
    `raceDate: ${m.raceDate}`,
    'draftStatus: draft',
    `notesIncluded: ${notesIncluded}`,
    needsReview ? '# NOTE: LLM produced out-of-range output; please rewrite the prose below.' : '',
    '---',
    '',
    "import JargonTip from '../../components/ui/JargonTip.astro';",
  ].filter(Boolean).join('\n');
}

function parseArgs(argv) {
  const out = {};
  for (const a of argv) {
    const m = /^--([^=]+)(?:=(.*))?$/.exec(a);
    if (m) out[m[1]] = m[2] ?? true;
  }
  return out;
}
