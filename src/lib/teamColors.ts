/**
 * Source of truth for team accent colors used in component theming.
 * Keys are team slugs (file basenames in src/content/teams).
 *
 * 2026 grid: 11 constructors. Audi replaces Sauber; Cadillac is the new 11th team.
 *
 * Each team has:
 *   primary   — raw brand color. Used for non-text accents (stripes, dividers,
 *               photo edges). May fail 4.5:1 contrast against --asphalt-900.
 *   text      — brightened-for-contrast variant. Used for type and links.
 *               Identical to `primary` for teams whose brand color already
 *               passes WCAG AA contrast (~4.5:1) against --asphalt-900.
 *   secondary — accent / racing-stripe / sponsor color, optional.
 *
 * The `text` variants are hand-tuned for readability on a near-black background;
 * they preserve hue and approximate saturation while lifting lightness.
 */
export const teamColors: Record<
  string,
  { primary: string; text: string; secondary?: string }
> = {
  'red-bull':     { primary: '#1e41ff', text: '#7d99ff', secondary: '#fcd700' },
  ferrari:        { primary: '#dc0000', text: '#ff5050', secondary: '#fff200' },
  mercedes:       { primary: '#27f4d2', text: '#27f4d2', secondary: '#000000' },
  mclaren:        { primary: '#ff8000', text: '#ff8000', secondary: '#47c7fc' },
  'aston-martin': { primary: '#229971', text: '#3fd29f', secondary: '#000000' },
  alpine:         { primary: '#0093cc', text: '#5cc8ed', secondary: '#ff87bc' },
  williams:       { primary: '#64c4ff', text: '#64c4ff', secondary: '#0a3061' },
  'racing-bulls': { primary: '#6692ff', text: '#9ab8ff', secondary: '#1e3a8a' },
  haas:           { primary: '#b6babd', text: '#b6babd', secondary: '#ed1c24' },
  audi:           { primary: '#00d639', text: '#00d639', secondary: '#000000' },
  cadillac:       { primary: '#c9a96e', text: '#c9a96e', secondary: '#000000' },
};

export function getTeamColor(slug: string): string {
  return teamColors[slug]?.primary ?? 'var(--kerb-yellow)';
}

export function getTeamTextColor(slug: string): string {
  return teamColors[slug]?.text ?? teamColors[slug]?.primary ?? 'var(--kerb-yellow)';
}

/**
 * Map jolpica/Ergast constructorId → our team slug.
 * Used when joining live-standings rows back to content collection entries.
 */
const CONSTRUCTOR_ID_TO_SLUG: Record<string, string> = {
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
};

export function constructorIdToSlug(id: string): string | undefined {
  return CONSTRUCTOR_ID_TO_SLUG[id];
}
