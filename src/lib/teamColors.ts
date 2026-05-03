/**
 * Source of truth for team accent colors used in component theming.
 * Keys are team slugs (file basenames in src/content/teams).
 */
export const teamColors: Record<string, { primary: string; secondary?: string }> = {
  'red-bull': { primary: '#1e41ff', secondary: '#fcd700' },
  ferrari: { primary: '#dc0000', secondary: '#fff200' },
  mercedes: { primary: '#27f4d2', secondary: '#000000' },
  mclaren: { primary: '#ff8000', secondary: '#47c7fc' },
  'aston-martin': { primary: '#229971', secondary: '#000000' },
  alpine: { primary: '#0093cc', secondary: '#ff87bc' },
  williams: { primary: '#64c4ff', secondary: '#0a3061' },
  rb: { primary: '#6692ff', secondary: '#1e3a8a' },
  haas: { primary: '#b6babd', secondary: '#ed1c24' },
  'kick-sauber': { primary: '#52e252', secondary: '#000000' },
};

export function getTeamColor(slug: string): string {
  return teamColors[slug]?.primary ?? 'var(--kerb-yellow)';
}
