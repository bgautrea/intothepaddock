/**
 * jolpica-f1 client (community continuation of the Ergast API).
 * Build-time only. Falls back to committed snapshots in /data/snapshots if the network fails.
 *
 * Endpoints used:
 *   - /ergast/f1/current.json                          → season schedule
 *   - /ergast/f1/current/driverstandings.json          → current driver standings
 *   - /ergast/f1/current/constructorstandings.json     → current constructor standings
 *
 * Snapshots are refreshed nightly by scripts/refresh-snapshots.mjs (CI cron).
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const BASE = process.env.JOLPICA_BASE_URL ?? 'https://api.jolpi.ca/ergast/f1';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_DIR = resolve(__dirname, '../../data/snapshots');

// Per-build memoization so we don't double-hit the API for the same endpoint.
const memCache = new Map<string, unknown>();

interface FetchOpts {
  url: string;
  snapshotFile: string;
}

async function safeFetch<T>({ url, snapshotFile }: FetchOpts): Promise<T> {
  if (memCache.has(url)) return memCache.get(url) as T;

  try {
    const res = await fetch(url, { headers: { 'user-agent': 'intothepaddock-build/0.1' } });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const json = (await res.json()) as T;
    memCache.set(url, json);
    return json;
  } catch (err) {
    console.warn(`[jolpica] ${url} failed (${(err as Error).message}); using snapshot ${snapshotFile}`);
    const snap = readSnapshot<T>(snapshotFile);
    memCache.set(url, snap);
    return snap;
  }
}

function readSnapshot<T>(file: string): T {
  const path = resolve(SNAPSHOT_DIR, file);
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

// Loose types — we keep payloads structural rather than fully describing every Ergast field.
interface MRDataEnvelope<K extends string, V> {
  MRData: { [P in K]: V } & Record<string, unknown>;
}

export interface Race {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time?: string;
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: { locality: string; country: string };
  };
}

export interface DriverStanding {
  position: string;
  points: string;
  wins: string;
  Driver: {
    driverId: string;
    givenName: string;
    familyName: string;
    permanentNumber?: string;
    code?: string;
  };
  Constructors: Array<{ constructorId: string; name: string }>;
}

export interface ConstructorStanding {
  position: string;
  points: string;
  wins: string;
  Constructor: { constructorId: string; name: string };
}

export async function getSeasonSchedule(): Promise<Race[]> {
  const data = await safeFetch<
    MRDataEnvelope<'RaceTable', { season: string; Races: Race[] }>
  >({
    url: `${BASE}/current.json?limit=30`,
    snapshotFile: 'season-schedule.json',
  });
  return data.MRData.RaceTable.Races;
}

export async function getNextRace(): Promise<Race | null> {
  const races = await getSeasonSchedule();
  const now = Date.now();
  // "Next" = first race whose start instant is still in the future. Comparing
  // by full datetime (not just date) means the countdown advances to the next
  // round the moment lights-out happens, instead of staying parked on a race
  // that already ran.
  return races.find((r) => new Date(raceStartISO(r)).getTime() > now) ?? null;
}

export async function getDriverStandings(): Promise<DriverStanding[]> {
  const data = await safeFetch<
    MRDataEnvelope<
      'StandingsTable',
      { StandingsLists: Array<{ DriverStandings: DriverStanding[] }> }
    >
  >({
    url: `${BASE}/current/driverstandings.json?limit=30`,
    snapshotFile: 'driver-standings.json',
  });
  return data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];
}

export async function getConstructorStandings(): Promise<ConstructorStanding[]> {
  const data = await safeFetch<
    MRDataEnvelope<
      'StandingsTable',
      { StandingsLists: Array<{ ConstructorStandings: ConstructorStanding[] }> }
    >
  >({
    url: `${BASE}/current/constructorstandings.json?limit=30`,
    snapshotFile: 'constructor-standings.json',
  });
  return data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? [];
}

export function raceStartISO(race: Race): string {
  // Concatenate date + time fields into a single ISO 8601 timestamp.
  return `${race.date}T${race.time ?? '00:00:00Z'}`;
}
