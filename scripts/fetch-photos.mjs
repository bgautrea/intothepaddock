#!/usr/bin/env node
// Fetches Wikimedia Commons-licensed photos for drivers, teams, and tracks.
// Reads scripts/photo-manifest.json, queries Wikipedia + Commons APIs, validates
// licenses against an allow-list, downloads + optimizes, and emits credits.
//
// Usage: node scripts/fetch-photos.mjs [--type drivers|teams|tracks] [--slug foo]
//        node scripts/fetch-photos.mjs --dry-run     # don't write files, just report
//        node scripts/fetch-photos.mjs --update-frontmatter   # also patch .md files
//
// Output:
//   src/assets/photos/<type>/<slug>.jpg          (resized JPEG, <500KB target)
//   src/assets/photos/_CREDITS.md                (regenerated table)
//   scripts/.photos-state.json                   (cached imageinfo per slug)

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const MANIFEST = path.join(ROOT, 'scripts/photo-manifest.json');
const PHOTOS_DIR = path.join(ROOT, 'src/assets/photos');
const CREDITS_PATH = path.join(PHOTOS_DIR, '_CREDITS.md');
const STATE_PATH = path.join(__dirname, '.photos-state.json');
const CONTENT_DIR = path.join(ROOT, 'src/content');

const UA = 'IntoThePaddockBuilder/1.0 (https://intothepaddock.com; brian.gautreau@gmail.com)';

const ACCEPTED_LICENSES = new Set([
  'cc0',
  'cc by 1.0', 'cc by 2.0', 'cc by 2.5', 'cc by 3.0', 'cc by 4.0',
  'cc by-sa 1.0', 'cc by-sa 2.0', 'cc by-sa 2.5', 'cc by-sa 3.0', 'cc by-sa 4.0',
  'public domain', 'pd', 'pd-self', 'pd-old',
]);

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has('--dry-run');
const UPDATE_FM = args.has('--update-frontmatter');
const FILTER_TYPE = (() => {
  const i = process.argv.indexOf('--type');
  return i > -1 ? process.argv[i + 1] : null;
})();
const FILTER_SLUG = (() => {
  const i = process.argv.indexOf('--slug');
  return i > -1 ? process.argv[i + 1] : null;
})();

async function main() {
  const manifest = JSON.parse(await fs.readFile(MANIFEST, 'utf8'));
  const state = await loadState();

  const types = ['drivers', 'teams', 'tracks'].filter((t) => !FILTER_TYPE || t === FILTER_TYPE);

  const results = [];
  for (const type of types) {
    const entries = manifest[type].filter((e) => !FILTER_SLUG || e.slug === FILTER_SLUG);
    for (const entry of entries) {
      try {
        const r = await processOne(type, entry, state);
        results.push(r);
        process.stdout.write(`  ${r.status === 'ok' ? '✓' : r.status === 'skip' ? '·' : '✗'} ${type}/${entry.slug} — ${r.note ?? ''}\n`);
      } catch (err) {
        results.push({ type, slug: entry.slug, status: 'error', note: err.message });
        process.stdout.write(`  ✗ ${type}/${entry.slug} — ${err.message}\n`);
      }
      await sleep(400); // be polite to Wikimedia CDN
    }
  }

  if (!DRY_RUN) {
    await saveState(state);
    await regenerateCredits(state);
    if (UPDATE_FM) {
      await updateAllFrontmatter(state);
    }
  }

  const ok = results.filter((r) => r.status === 'ok').length;
  const skip = results.filter((r) => r.status === 'skip').length;
  const err = results.filter((r) => r.status === 'error').length;
  console.log(`\n${ok} fetched, ${skip} skipped, ${err} errors.`);
  if (err > 0) process.exit(1);
}

async function processOne(type, entry, state) {
  const { slug, wp, commonsFile } = entry;
  const cached = state[`${type}/${slug}`];
  const targetPath = path.join(PHOTOS_DIR, type, `${slug}.jpg`);
  const exists = await fileExists(targetPath);

  if (cached && exists && !args.has('--force')) {
    return { type, slug, status: 'skip', note: `cached (${cached.licenseShortName})` };
  }

  // Step 1: resolve a Commons file title — manifest override wins, otherwise
  // ask Wikipedia for the article's main pageimage.
  const fileTitle = commonsFile ?? (await wikipediaPageImage(wp));
  if (!fileTitle) {
    return { type, slug, status: 'error', note: `no pageimage for ${wp}` };
  }

  // Step 2: Commons → metadata
  const meta = await commonsImageInfo(fileTitle);
  if (!meta) {
    return { type, slug, status: 'error', note: `no commons info for ${fileTitle}` };
  }

  // Step 3: Validate license
  const lic = (meta.LicenseShortName || '').toLowerCase().trim();
  if (!ACCEPTED_LICENSES.has(lic) && !lic.startsWith('cc by') && !lic.startsWith('cc0') && !lic.includes('public domain')) {
    return { type, slug, status: 'error', note: `unacceptable license "${meta.LicenseShortName}" for ${fileTitle}` };
  }

  // Step 4: Download + resize
  if (!DRY_RUN) {
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    const buf = await fetchBuffer(meta.url);
    await sharp(buf)
      .resize({ width: type === 'drivers' ? 900 : 1600, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(targetPath);
  }

  state[`${type}/${slug}`] = {
    type,
    slug,
    fileTitle,
    sourceUrl: meta.descriptionUrl,
    originalUrl: meta.url,
    artist: stripHtml(meta.Artist || 'Unknown'),
    licenseShortName: meta.LicenseShortName,
    licenseUrl: meta.LicenseUrl || null,
    fetchedAt: new Date().toISOString(),
  };

  return { type, slug, status: 'ok', note: meta.LicenseShortName };
}

async function wikipediaPageImage(title) {
  // pithumbsize=1600 to get the highest-res CDN thumbnail; we'll fetch original
  // separately via Commons imageinfo.
  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.search = new URLSearchParams({
    action: 'query',
    prop: 'pageimages',
    piprop: 'name',
    titles: title,
    format: 'json',
    formatversion: '2',
    redirects: '1',
  }).toString();
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`wikipedia ${r.status}`);
  const j = await r.json();
  const page = j.query?.pages?.[0];
  return page?.pageimage ? `File:${page.pageimage}` : null;
}

async function commonsImageInfo(fileTitle) {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.search = new URLSearchParams({
    action: 'query',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|mime',
    iiurlwidth: '1600',
    titles: fileTitle,
    format: 'json',
    formatversion: '2',
    redirects: '1',
  }).toString();
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`commons ${r.status}`);
  const j = await r.json();
  const page = j.query?.pages?.[0];
  const ii = page?.imageinfo?.[0];
  if (!ii) return null;
  const ext = ii.extmetadata || {};
  return {
    url: ii.thumburl || ii.url,
    descriptionUrl: ii.descriptionurl,
    mime: ii.mime,
    LicenseShortName: ext.LicenseShortName?.value,
    LicenseUrl: ext.LicenseUrl?.value,
    Artist: ext.Artist?.value,
    Credit: ext.Credit?.value,
  };
}

async function fetchBuffer(url) {
  // Wikimedia's CDN rate-limits hot bursts, especially for SVG-rendered PNG
  // thumbnails. Retry on 429 with exponential backoff.
  for (let attempt = 0; attempt < 5; attempt++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (r.ok) return Buffer.from(await r.arrayBuffer());
    if (r.status === 429 || r.status === 503) {
      const wait = 1000 * Math.pow(2, attempt);
      await sleep(wait);
      continue;
    }
    throw new Error(`download ${r.status} for ${url}`);
  }
  throw new Error(`download exhausted retries for ${url}`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function stripHtml(s) {
  return String(s)
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function loadState() {
  try {
    return JSON.parse(await fs.readFile(STATE_PATH, 'utf8'));
  } catch {
    return {};
  }
}

async function saveState(state) {
  await fs.writeFile(STATE_PATH, JSON.stringify(state, null, 2));
}

async function regenerateCredits(state) {
  const rows = Object.values(state).sort((a, b) => {
    if (a.type !== b.type) return a.type.localeCompare(b.type);
    return a.slug.localeCompare(b.slug);
  });
  const tableRows = rows
    .map((r) => `| \`${r.type}/${r.slug}.jpg\` | [Source](${r.sourceUrl}) | ${r.artist} | ${r.licenseShortName} |`)
    .join('\n');

  const body = `# Photo credits

All photographs in this directory are sourced from **Wikimedia Commons** under
permissive licenses (CC BY, CC BY-SA, or CC0/public domain). Each row in the
table below documents one photo: where it came from, who took it, and the
license it was released under.

Photos are fetched and validated by \`scripts/fetch-photos.mjs\`. The license
allow-list rejects any image that is not CC BY, CC BY-SA, CC0, or marked
public domain.

## Folder convention

| Folder | File | Slug match |
|---|---|---|
| \`drivers/\` | \`<driver-slug>.jpg\` | \`src/content/drivers/<driver-slug>.md\` |
| \`teams/\` | \`<team-slug>.jpg\` | \`src/content/teams/<team-slug>.md\` |
| \`tracks/\` | \`<track-slug>.jpg\` | \`src/content/tracks/<track-slug>.md\` |

## Credits

| File | Source | Author | License |
|---|---|---|---|
${tableRows}
`;
  await fs.writeFile(CREDITS_PATH, body);
}

// ---------------------------------------------------------------------------
// Frontmatter patcher: rewrites driver/team/track .md files to point at the
// downloaded portrait/car/photo + credit. Idempotent: only adds keys that
// aren't already present, and rewrites stale credit strings if the underlying
// state changes.
// ---------------------------------------------------------------------------

async function updateAllFrontmatter(state) {
  const TYPES = {
    drivers: { imgKey: 'portrait', creditKey: 'portraitCredit' },
    teams:   { imgKey: 'car',      creditKey: 'carCredit' },
    tracks:  { imgKey: 'photo',    creditKey: 'photoCredit' },
  };

  for (const [type, keys] of Object.entries(TYPES)) {
    const dir = path.join(CONTENT_DIR, type);
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.md'));
    for (const f of files) {
      const slug = f.replace(/\.md$/, '');
      const s = state[`${type}/${slug}`];
      if (!s) continue;

      const filePath = path.join(dir, f);
      const md = await fs.readFile(filePath, 'utf8');
      const m = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!m) continue;
      let fm = m[1];
      const body = m[2];

      const imgPath = `../../assets/photos/${type}/${slug}.jpg`;
      const credit = formatCredit(s);

      fm = upsertScalar(fm, keys.imgKey, imgPath);
      fm = upsertScalar(fm, keys.creditKey, credit);

      const newMd = `---\n${fm}\n---\n${body}`;
      if (newMd !== md) {
        await fs.writeFile(filePath, newMd);
      }
    }
  }
}

function formatCredit(s) {
  return `Photo: ${s.artist} (${s.licenseShortName}) via Wikimedia Commons`;
}

function upsertScalar(fm, key, rawValue) {
  // YAML scalar with single quotes around value; safe for paths and credit text
  // containing parentheses/colons. Escape any embedded single quotes by doubling.
  const escaped = String(rawValue).replace(/'/g, "''");
  const line = `${key}: '${escaped}'`;
  const re = new RegExp(`^${key}: .*$`, 'm');
  if (re.test(fm)) {
    return fm.replace(re, line);
  }
  return fm.trimEnd() + `\n${line}`;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
