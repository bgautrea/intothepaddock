/**
 * Loader for race-recap panel snapshots.
 *
 * The structured "what the data said" panel lives at
 * data/snapshots/race-recaps/<slug>.json, written by scripts/fetch-recap-data.mjs.
 * Pages call getRecapPanel(slug) at build time to render the panel for a given race.
 *
 * If the snapshot is missing or malformed, returns null so the page can render
 * prose-only without crashing the build.
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_DIR = resolve(__dirname, '../../data/snapshots/race-recaps');

export interface ResultRow {
  position: number;
  driverId: string;
  driverName: string;
  teamSlug?: string;
  gapToLeader?: string;
  status: string;
}

export interface FastestLap {
  driverId: string;
  driverName: string;
  lap: number;
  time: string;
}

export interface MoverRow {
  driverId: string;
  driverName: string;
  startPos: number;
  endPos: number;
  change: number;
}

export interface PitStopSummary {
  driverId: string;
  driverName: string;
  stops: Array<{ lap: number; durationSec?: number }>;
}

export interface Stint {
  startLap: number;
  endLap: number;
  fastestLapTime?: string;
  avgPaceSec?: number;
}

export interface DriverStintAnalysis {
  driverId: string;
  driverName: string;
  stints: Stint[];
  /** Driver's standard deviation of lap times (consistency); lower = steadier. */
  consistencySec?: number;
}

export interface SectorLeader {
  driverId: string;
  driverName: string;
  timeSec: number;
}

export interface TopSpeedRow {
  driverId: string;
  driverName: string;
  speedKmh: number;
}

export interface RecapMeta {
  season: number;
  round: number;
  raceName: string;
  circuitRef: string;
  raceDate: string;
  raceTime?: string | null;
}

export interface RecapPanel {
  /** Source-of-truth slug; matches the recap collection entry id. */
  slug: string;
  meta: RecapMeta;
  results: ResultRow[];
  fastestLap: FastestLap | null;
  biggestMovers: { gainers: MoverRow[]; losers: MoverRow[] };
  pitStops: PitStopSummary[];
  stintAnalysis: DriverStintAnalysis[];
  sectorLeaders: { s1: SectorLeader | null; s2: SectorLeader | null; s3: SectorLeader | null };
  topSpeeds: TopSpeedRow[];
  /** Whether OpenF1 data was available; if false, sectors/topSpeeds are absent. */
  hasTelemetry: boolean;
  generatedAt: string;
}

export function getRecapPanel(slug: string): RecapPanel | null {
  const path = resolve(SNAPSHOT_DIR, `${slug}.json`);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as RecapPanel;
  } catch (err) {
    console.warn(`[recap] failed to parse panel snapshot ${path}: ${(err as Error).message}`);
    return null;
  }
}
