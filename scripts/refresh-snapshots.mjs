#!/usr/bin/env node
/**
 * Refreshes the committed jolpica snapshots in data/snapshots/.
 * Designed to be run by GitHub Actions (cron 0 6 * * *) which then commits any changes.
 *
 * Usage: `node scripts/refresh-snapshots.mjs`
 *
 * Fails silently (exit 0) on individual endpoint errors so a partial outage doesn't break CI.
 * Logs errors to stderr.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const BASE = process.env.JOLPICA_BASE_URL ?? 'https://api.jolpi.ca/ergast/f1';
const OUT_DIR = resolve(process.cwd(), 'data/snapshots');

const targets = [
  { url: `${BASE}/current.json?limit=30`, file: 'season-schedule.json' },
  { url: `${BASE}/current/driverstandings.json?limit=30`, file: 'driver-standings.json' },
  { url: `${BASE}/current/constructorstandings.json?limit=30`, file: 'constructor-standings.json' },
];

await mkdir(OUT_DIR, { recursive: true });

let failures = 0;
for (const { url, file } of targets) {
  try {
    console.log(`[snapshot] ${url}`);
    const res = await fetch(url, { headers: { 'user-agent': 'intothepaddock-snapshot/0.1' } });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const text = await res.text();
    JSON.parse(text); // sanity-parse; throws on garbage
    const out = resolve(OUT_DIR, file);
    await writeFile(out, text);
    console.log(`  → wrote ${out} (${text.length} bytes)`);
  } catch (err) {
    failures += 1;
    console.error(`  ✗ ${file}: ${(err).message}`);
  }
}

if (failures === targets.length) {
  console.error(`[snapshot] all ${failures} targets failed; exiting non-zero`);
  process.exit(1);
}
console.log(`[snapshot] done. ${targets.length - failures}/${targets.length} updated.`);
