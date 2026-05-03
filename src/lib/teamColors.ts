/**
 * Source of truth for team accent colors used in component theming.
 * Keys are team slugs (file basenames in src/content/teams).
 *
 * 2026 grid: 11 constructors. Audi replaces Sauber; Cadillac is the new 11th team.
 */
export const teamColors: Record<string, { primary: string; secondary?: string }> = {
  'red-bull': { primary: '#1e41ff', secondary: '#fcd700' },
  ferrari: { primary: '#dc0000', secondary: '#fff200' },
  mercedes: { primary: '#27f4d2', secondary: '#000000' },
  mclaren: { primary: '#ff8000', secondary: '#47c7fc' },
  'aston-martin': { primary: '#229971', secondary: '#000000' },
  alpine: { primary: '#0093cc', secondary: '#ff87bc' },
  williams: { primary: '#64c4ff', secondary: '#0a3061' },
  'racing-bulls': { primary: '#6692ff', secondary: '#1e3a8a' },
  haas: { primary: '#b6babd', secondary: '#ed1c24' },
  audi: { primary: '#00d639', secondary: '#000000' },
  cadillac: { primary: '#c9a96e', secondary: '#000000' },
};

export function getTeamColor(slug: string): string {
  return teamColors[slug]?.primary ?? 'var(--kerb-yellow)';
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
