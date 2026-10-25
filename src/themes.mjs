export const THEMES = Object.freeze([
  { id: 'lime', name: 'Lime Green' },
  { id: 'cyan', name: 'Cyan Blue' },
  { id: 'fuchsia', name: 'Fuchsia Pink' },
  { id: 'ruby', name: 'Ruby Red' },
  { id: 'gold', name: 'Champagne Gold' },
  { id: 'aqua', name: 'Seafoam Teal' },
  { id: 'amethyst', name: 'Amethyst Purple' },
  { id: 'lava', name: 'Lava Orange' },
  { id: 'atlantic', name: 'Atlantic Blue' },
].map(Object.freeze));

export function applyTheme(id, root = document.documentElement) {
  const theme = THEMES.find(item => item.id === id) || THEMES[0];
  root.dataset.theme = theme.id;
  return theme.id;
}
