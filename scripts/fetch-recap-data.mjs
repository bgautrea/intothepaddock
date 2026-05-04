#!/usr/bin/env node
/**
 * Fetches Jolpica + OpenF1 data for one race and writes the panel snapshot
 * consumed by the recap pages.
 *
 * Usage:
 *   node scripts/fetch-recap-data.mjs --year=2025 --round=8 --slug=2025-monaco
 *
 * --slug is the canonical recap slug (matches src/content/race-recaps/<slug>.mdx).
 * If --slug is omitted it's derived from --year and the track for that round.
 *
 * Output: data/snapshots/race-recaps/<slug>.json
 *
 * Failure modes:
 *  - Jolpica unreachable → exit 1 (results are essential).
 *  - OpenF1 unreachable → write panel without sectors/topSpeeds; hasTelemetry=false.
 *
 * The script is idempotent. Re-running for the same race overwrites the snapshot.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const JOLPICA = process.env.JOLPICA_BASE_URL ?? 'https://api.jolpi.ca/ergast/f1';
const OPENF1 = process.env.OPENF1_BASE_URL ?? 'https://api.openf1.org/v1';
const OUT_DIR = resolve(process.cwd(), 'data/snapshots/race-recaps');

// Declared up here so the throttle state is initialized before any top-level
// await reaches the OpenF1 fetcher. Otherwise the `let` would still be in the
// temporal dead zone when fetchJsonThrottled runs.
let lastOpenF1Call = 0;

const args = parseArgs(process.argv.slice(2));
const year = Number(args.year);
const round = Number(args.round);
if (!Number.isFinite(year) || !Number.isFinite(round)) {
  console.error('Usage: node scripts/fetch-recap-data.mjs --year=YYYY --round=N [--slug=YYYY-track]');
  process.exit(2);
}

await mkdir(OUT_DIR, { recursive: true });

const jolpica = await fetchJolpica(year, round);
const slug = args.slug ?? deriveSlug(year, jolpica);

let openf1 = null;
try {
  openf1 = await fetchOpenF1(year, round, jolpica);
} catch (err) {
  console.warn(`[recap] OpenF1 unavailable: ${err.message}. Proceeding Jolpica-only.`);
}

const panel = buildPanel({ slug, jolpica, openf1 });
const out = resolve(OUT_DIR, `${slug}.json`);
await writeFile(out, JSON.stringify(panel, null, 2));
console.log(`[recap] wrote ${out}`);

// ─── argv ───────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = {};
  for (const a of argv) {
    const m = /^--([^=]+)(?:=(.*))?$/.exec(a);
    if (m) out[m[1]] = m[2] ?? true;
  }
  return out;
}

function deriveSlug(year, j) {
  const trackSlug = jolpicaCircuitToSlug(j.results?.Circuit?.circuitId);
  if (!trackSlug) {
    throw new Error(`Could not derive slug from circuitId=${j.results?.Circuit?.circuitId}; pass --slug explicitly.`);
  }
  return `${year}-${trackSlug}`;
}

// Jolpica circuitId → our track slug. Not exhaustive; falls through to the raw id.
function jolpicaCircuitToSlug(id) {
  if (!id) return null;
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
    mexico: 'mexico-city',
    interlagos: 'interlagos',
    americas: 'austin',
    rodriguez: 'mexico-city',
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

// ─── Jolpica ────────────────────────────────────────────────────────────

async function fetchJolpica(year, round) {
  const [results, allLaps, allPitStops, qualifying] = await Promise.all([
    fetchJson(`${JOLPICA}/${year}/${round}/results.json?limit=100`),
    fetchAllJolpicaLaps(year, round),
    fetchAllJolpicaPits(year, round),
    fetchJson(`${JOLPICA}/${year}/${round}/qualifying.json?limit=100`).catch(() => null),
  ]);
  const race = results.MRData.RaceTable.Races[0];
  if (!race) throw new Error(`Jolpica returned no race for ${year} round ${round}`);
  return {
    raceName: race.raceName,
    season: race.season,
    round: race.round,
    Circuit: race.Circuit,
    date: race.date,
    time: race.time,
    results: race,
    Results: race.Results,
    Laps: allLaps,
    PitStops: allPitStops,
    Qualifying: qualifying?.MRData?.RaceTable?.Races[0]?.QualifyingResults ?? [],
  };
}

// Jolpica caps `limit` at 100. Paginate by lap-record offset until we've
// collected `total` rows, then merge into a single Laps[] (de-duplicated by lap number).
async function fetchAllJolpicaLaps(year, round) {
  const lapsByNumber = new Map();
  let offset = 0;
  const pageSize = 100;
  while (true) {
    const page = await fetchJson(`${JOLPICA}/${year}/${round}/laps.json?limit=${pageSize}&offset=${offset}`);
    const total = parseInt(page.MRData.total, 10);
    const races = page.MRData.RaceTable.Races[0];
    const laps = races?.Laps ?? [];
    for (const lap of laps) {
      const existing = lapsByNumber.get(lap.number);
      if (existing) {
        // Merge timings from another page's same-numbered lap.
        existing.Timings.push(...lap.Timings);
      } else {
        lapsByNumber.set(lap.number, { number: lap.number, Timings: [...lap.Timings] });
      }
    }
    offset += pageSize;
    if (offset >= total) break;
    if (offset > 5000) {
      console.warn('[recap] aborting Jolpica laps pagination at offset 5000 (sanity cap)');
      break;
    }
  }
  return [...lapsByNumber.values()].sort((a, b) => parseInt(a.number, 10) - parseInt(b.number, 10));
}

async function fetchAllJolpicaPits(year, round) {
  const all = [];
  let offset = 0;
  const pageSize = 100;
  while (true) {
    const page = await fetchJson(`${JOLPICA}/${year}/${round}/pitstops.json?limit=${pageSize}&offset=${offset}`);
    const total = parseInt(page.MRData.total, 10);
    const stops = page.MRData.RaceTable.Races[0]?.PitStops ?? [];
    all.push(...stops);
    offset += pageSize;
    if (offset >= total) break;
    if (offset > 1000) break;
  }
  return all;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'intothepaddock-recap/0.1' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

// ─── OpenF1 ─────────────────────────────────────────────────────────────

async function fetchOpenF1(year, round, jolpica) {
  // Find the meeting (race weekend) by year + circuit. OpenF1's location names
  // don't always match Jolpica's; match on country first, then circuit short name.
  const country = jolpica.Circuit.Location.country;
  const meetings = await fetchJsonThrottled(`${OPENF1}/meetings?year=${year}`);
  const meeting = meetings.find((m) => m.country_name === country)
    ?? meetings.find((m) => m.location === jolpica.Circuit.Location.locality);
  if (!meeting) throw new Error(`No OpenF1 meeting for ${year} ${country}`);

  const sessions = await fetchJsonThrottled(`${OPENF1}/sessions?meeting_key=${meeting.meeting_key}&session_type=Race`);
  const race = sessions[sessions.length - 1];
  if (!race) throw new Error(`No OpenF1 race session in meeting ${meeting.meeting_key}`);

  // Serialize. OpenF1 throttles bursts, and these payloads aren't time-critical at build time.
  const drivers = await fetchJsonThrottled(`${OPENF1}/drivers?session_key=${race.session_key}`);
  const laps = await fetchJsonThrottled(`${OPENF1}/laps?session_key=${race.session_key}`);
  const pits = await fetchJsonThrottled(`${OPENF1}/pit?session_key=${race.session_key}`);

  return { meeting, session: race, drivers, laps, pits };
}

async function fetchJsonThrottled(url) {
  const minGapMs = 600;
  const wait = Math.max(0, minGapMs - (Date.now() - lastOpenF1Call));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastOpenF1Call = Date.now();
  // Retry once on 429 with backoff.
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(url, { headers: { 'user-agent': 'intothepaddock-recap/0.1' } });
    if (res.ok) return res.json();
    if (res.status === 429 && attempt === 0) {
      await new Promise((r) => setTimeout(r, 3000));
      continue;
    }
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  }
}

// ─── Panel construction ────────────────────────────────────────────────

function buildPanel({ slug, jolpica, openf1 }) {
  return {
    slug,
    meta: {
      season: parseInt(jolpica.season, 10),
      round: parseInt(jolpica.round, 10),
      raceName: jolpica.raceName,
      circuitRef: jolpicaCircuitToSlug(jolpica.Circuit.circuitId) ?? jolpica.Circuit.circuitId,
      raceDate: jolpica.date,
      raceTime: jolpica.time ?? null,
    },
    results: buildResults(jolpica),
    fastestLap: buildFastestLap(jolpica),
    biggestMovers: buildBiggestMovers(jolpica),
    pitStops: buildPitStops(jolpica),
    stintAnalysis: buildStintAnalysis(jolpica),
    sectorLeaders: openf1 ? buildSectorLeaders(openf1) : { s1: null, s2: null, s3: null },
    topSpeeds: openf1 ? buildTopSpeeds(openf1) : [],
    hasTelemetry: Boolean(openf1),
    generatedAt: new Date().toISOString(),
  };
}

function buildResults(j) {
  return j.Results.map((r) => ({
    position: parseInt(r.position, 10),
    driverId: r.Driver.driverId,
    driverName: `${r.Driver.givenName} ${r.Driver.familyName}`,
    teamSlug: constructorIdToSlug(r.Constructor.constructorId),
    gapToLeader: r.Time?.time, // string like "+12.345" for finishers behind P1
    status: r.status, // "Finished", "+1 Lap", "DNF", etc.
  }));
}

function buildFastestLap(j) {
  // Jolpica marks the fastest lap on one Result row with FastestLap.rank === '1'.
  for (const r of j.Results) {
    if (r.FastestLap?.rank === '1') {
      return {
        driverId: r.Driver.driverId,
        driverName: `${r.Driver.givenName} ${r.Driver.familyName}`,
        lap: parseInt(r.FastestLap.lap, 10),
        time: r.FastestLap.Time.time,
      };
    }
  }
  return null;
}

function buildBiggestMovers(j) {
  const moves = j.Results
    .filter((r) => r.grid && r.position)
    .map((r) => {
      const startPos = parseInt(r.grid, 10);
      const endPos = parseInt(r.position, 10);
      return {
        driverId: r.Driver.driverId,
        driverName: `${r.Driver.givenName} ${r.Driver.familyName}`,
        startPos,
        endPos,
        change: startPos - endPos, // positive = gained positions
      };
    })
    .filter((m) => m.startPos > 0); // pit-lane starters have grid=0; skip
  const gainers = [...moves].sort((a, b) => b.change - a.change).slice(0, 3);
  const losers = [...moves].sort((a, b) => a.change - b.change).slice(0, 3);
  return { gainers, losers };
}

function buildPitStops(j) {
  const byDriver = new Map();
  for (const p of j.PitStops) {
    const d = byDriver.get(p.driverId) ?? { driverId: p.driverId, driverName: p.driverId, stops: [] };
    d.stops.push({ lap: parseInt(p.lap, 10), durationSec: parseFloat(p.duration) || undefined });
    byDriver.set(p.driverId, d);
  }
  // Backfill driverName from results (PitStops payload uses driverId as label).
  for (const r of j.Results) {
    const d = byDriver.get(r.Driver.driverId);
    if (d) d.driverName = `${r.Driver.givenName} ${r.Driver.familyName}`;
  }
  return [...byDriver.values()].sort((a, b) => a.driverName.localeCompare(b.driverName));
}

function buildStintAnalysis(j) {
  // For each driver, slice their lap-times into stints using pit-stop laps as boundaries.
  // Compute per-stint fastest lap and average pace; compute consistency (stdev) overall.
  const lapsByDriver = new Map();
  for (const lap of j.Laps) {
    const lapNum = parseInt(lap.number, 10);
    for (const t of lap.Timings) {
      const arr = lapsByDriver.get(t.driverId) ?? [];
      const sec = parseLapTime(t.time);
      if (sec) arr.push({ lap: lapNum, sec });
      lapsByDriver.set(t.driverId, arr);
    }
  }

  const pitLapsByDriver = new Map();
  for (const p of j.PitStops) {
    const arr = pitLapsByDriver.get(p.driverId) ?? [];
    arr.push(parseInt(p.lap, 10));
    pitLapsByDriver.set(p.driverId, arr);
  }

  const out = [];
  for (const r of j.Results) {
    const id = r.Driver.driverId;
    const laps = (lapsByDriver.get(id) ?? []).sort((a, b) => a.lap - b.lap);
    if (laps.length === 0) continue;
    const pitLaps = (pitLapsByDriver.get(id) ?? []).sort((a, b) => a - b);
    const stints = sliceStints(laps, pitLaps);
    const consistencySec = laps.length >= 5 ? stdev(laps.map((l) => l.sec)) : undefined;
    out.push({
      driverId: id,
      driverName: `${r.Driver.givenName} ${r.Driver.familyName}`,
      stints,
      consistencySec,
    });
  }
  return out;
}

function sliceStints(laps, pitLaps) {
  const stints = [];
  let stintStart = laps[0].lap;
  let buf = [];
  for (const l of laps) {
    if (pitLaps.includes(l.lap)) {
      // pit lap closes the previous stint
      if (buf.length > 0) {
        stints.push(makeStint(stintStart, buf));
      }
      buf = [];
      stintStart = l.lap + 1;
      continue;
    }
    buf.push(l);
  }
  if (buf.length > 0) {
    stints.push(makeStint(stintStart, buf));
  }
  return stints;
}

function makeStint(startLap, laps) {
  const fastest = laps.reduce((best, l) => (l.sec < best.sec ? l : best), laps[0]);
  const avg = laps.reduce((s, l) => s + l.sec, 0) / laps.length;
  return {
    startLap,
    endLap: laps[laps.length - 1].lap,
    fastestLapTime: formatLapTime(fastest.sec),
    avgPaceSec: round3(avg),
  };
}

function openf1DriverName(d) {
  // OpenF1 returns surnames in ALL CAPS. Normalize to title case for display.
  const last = d.last_name ? titleCase(d.last_name) : '';
  const first = d.first_name ?? '';
  return `${first} ${last}`.trim();
}

function titleCase(s) {
  // Handles compound surnames like "DEL VALLE" → "Del Valle".
  return s
    .toLowerCase()
    .split(/(\s|-)/)
    .map((part) => (part === ' ' || part === '-' ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join('');
}

function buildSectorLeaders(o) {
  const driverByNum = new Map(o.drivers.map((d) => [d.driver_number, d]));
  let bestS1 = null, bestS2 = null, bestS3 = null;
  for (const lap of o.laps) {
    const d = driverByNum.get(lap.driver_number);
    if (!d) continue;
    const id = (d.last_name ?? d.name_acronym ?? `#${d.driver_number}`).toLowerCase();
    const name = openf1DriverName(d);
    const pick = (cur, t) =>
      t && Number.isFinite(t) && (!cur || t < cur.timeSec)
        ? { driverId: id, driverName: name, timeSec: t }
        : cur;
    bestS1 = pick(bestS1, lap.duration_sector_1);
    bestS2 = pick(bestS2, lap.duration_sector_2);
    bestS3 = pick(bestS3, lap.duration_sector_3);
  }
  return { s1: bestS1, s2: bestS2, s3: bestS3 };
}

function buildTopSpeeds(o) {
  const driverByNum = new Map(o.drivers.map((d) => [d.driver_number, d]));
  const maxByDriver = new Map();
  for (const lap of o.laps) {
    const speed = lap.st_speed;
    if (!speed || !Number.isFinite(speed)) continue;
    const cur = maxByDriver.get(lap.driver_number) ?? 0;
    if (speed > cur) maxByDriver.set(lap.driver_number, speed);
  }
  const rows = [];
  for (const [num, speed] of maxByDriver) {
    const d = driverByNum.get(num);
    if (!d) continue;
    rows.push({
      driverId: (d.last_name ?? d.name_acronym ?? `#${num}`).toLowerCase(),
      driverName: openf1DriverName(d),
      speedKmh: Math.round(speed),
    });
  }
  return rows.sort((a, b) => b.speedKmh - a.speedKmh).slice(0, 10);
}

// ─── helpers ────────────────────────────────────────────────────────────

function constructorIdToSlug(id) {
  const map = {
    red_bull: 'red-bull',
    ferrari: 'ferrari',
    mercedes: 'mercedes',
    mclaren: 'mclaren',
    aston_martin: 'aston-martin',
    alpine: 'alpine',
    williams: 'williams',
    rb: 'racing-bulls',
    haas: 'haas',
    audi: 'audi',
    cadillac: 'cadillac',
    sauber: 'audi', // Sauber → Audi continuity from 2026
  };
  return map[id];
}

function parseLapTime(s) {
  // Jolpica returns lap times like "1:23.456" or "83.456"
  if (!s) return null;
  const parts = s.split(':');
  if (parts.length === 2) return parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
  return parseFloat(parts[0]);
}

function formatLapTime(sec) {
  const m = Math.floor(sec / 60);
  const s = (sec - m * 60).toFixed(3);
  return m > 0 ? `${m}:${s.padStart(6, '0')}` : s;
}

function round3(n) {
  return Math.round(n * 1000) / 1000;
}

function stdev(xs) {
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  const variance = xs.reduce((a, b) => a + (b - mean) ** 2, 0) / xs.length;
  return round3(Math.sqrt(variance));
}
