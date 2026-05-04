#!/usr/bin/env node
/**
 * Resolves which race the recap workflow should target.
 *
 * Usage:
 *   node scripts/detect-recap-target.mjs                         (auto: most recent race in last 48h)
 *   node scripts/detect-recap-target.mjs --year=2026 --round=8   (explicit)
 *   node scripts/detect-recap-target.mjs --slug=2026-monaco      (explicit slug; year+round derived)
 *
 * Output (stdout, one per line, suitable for GITHUB_OUTPUT redirection):
 *   detected=true|false
 *   year=YYYY
 *   round=N
 *   slug=YYYY-track
 *   race_date=YYYY-MM-DD
 *
 * Exit code is always 0; consumers branch on the `detected` value.
 */

const JOLPICA = process.env.JOLPICA_BASE_URL ?? 'https://api.jolpi.ca/ergast/f1';

const args = parseArgs(process.argv.slice(2));

let race = null;

if (args.year && args.round) {
  race = await fetchRace(Number(args.year), Number(args.round));
} else if (args.slug) {
  const m = /^(\d{4})-(.+)$/.exec(args.slug);
  if (!m) {
    fail(`Bad slug ${args.slug}; expected YYYY-track-name`);
  }
  const year = Number(m[1]);
  const trackHint = m[2];
  const schedule = await fetchSchedule(year);
  race = schedule.find((r) => circuitToSlug(r.Circuit.circuitId) === trackHint);
  if (!race) fail(`No race in ${year} matching circuit slug ${trackHint}`);
} else {
  // Auto-detect: most recent race that finished in the last 48h.
  const schedule = await fetchSchedule();
  const now = Date.now();
  const TWO_DAYS = 48 * 60 * 60 * 1000;
  race = [...schedule].reverse().find((r) => {
    const start = new Date(`${r.date}T${r.time ?? '00:00:00Z'}`).getTime();
    return start <= now && (now - start) <= TWO_DAYS;
  });
}

if (!race) {
  console.log('detected=false');
  process.exit(0);
}

const slug = args.slug ?? `${race.season}-${circuitToSlug(race.Circuit.circuitId)}`;
console.log('detected=true');
console.log(`year=${race.season}`);
console.log(`round=${race.round}`);
console.log(`slug=${slug}`);
console.log(`race_date=${race.date}`);

// ─── helpers ────────────────────────────────────────────────────────────

async function fetchSchedule(year) {
  const url = year ? `${JOLPICA}/${year}.json?limit=30` : `${JOLPICA}/current.json?limit=30`;
  const res = await fetch(url, { headers: { 'user-agent': 'intothepaddock-detect/0.1' } });
  if (!res.ok) fail(`Jolpica HTTP ${res.status} for ${url}`);
  const data = await res.json();
  return data.MRData.RaceTable.Races;
}

async function fetchRace(year, round) {
  const url = `${JOLPICA}/${year}/${round}.json`;
  const res = await fetch(url, { headers: { 'user-agent': 'intothepaddock-detect/0.1' } });
  if (!res.ok) fail(`Jolpica HTTP ${res.status} for ${url}`);
  const data = await res.json();
  return data.MRData.RaceTable.Races[0] ?? null;
}

function circuitToSlug(id) {
  // Mirrors the table in fetch-recap-data.mjs. Kept in sync by hand.
  const map = {
    monaco: 'monaco',
    silverstone: 'silverstone',
    monza: 'monza',
    spa: 'spa',
    suzuka: 'suzuka',
    catalunya: 'catalunya',
    yas_marina: 'yas-marina',
    marina_bay: 'marina-bay',
    red_bull_ring: 'red-bull-ring',
    rodriguez: 'mexico-city',
    interlagos: 'interlagos',
    americas: 'austin',
    villeneuve: 'montreal',
    BAK: 'baku',
    baku: 'baku',
    miami: 'miami',
    vegas: 'las-vegas',
    losail: 'losail',
    lusail: 'losail',
    zandvoort: 'zandvoort',
    hungaroring: 'hungaroring',
    shanghai: 'shanghai',
    albert_park: 'melbourne',
    bahrain: 'sakhir',
    jeddah: 'jeddah',
    imola: 'imola',
    madrid: 'madrid',
  };
  return map[id] ?? id.replace(/_/g, '-');
}

function parseArgs(argv) {
  const out = {};
  for (const a of argv) {
    const m = /^--([^=]+)(?:=(.*))?$/.exec(a);
    if (m) out[m[1]] = m[2] ?? true;
  }
  return out;
}

function fail(msg) {
  console.error(`[detect] ${msg}`);
  process.exit(1);
}
