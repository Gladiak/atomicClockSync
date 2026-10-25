export const THEMES = Object.freeze([
  { id: 'lime', name: 'Verde Lime' },
  { id: 'cyan', name: 'Azzurro Ciano' },
  { id: 'fuchsia', name: 'Rosa Fucsia' },
  { id: 'ruby', name: 'Rosso Rubino' },
  { id: 'gold', name: 'Oro Champagne' },
  { id: 'aqua', name: 'Verde Acqua' },
  { id: 'amethyst', name: 'Viola Ametista' },
  { id: 'lava', name: 'Arancio Lava' },
  { id: 'atlantic', name: 'Blu Atlantico' },
].map(Object.freeze));

export function applyTheme(id, root = document.documentElement) {
  const theme = THEMES.find(item => item.id === id) || THEMES[0];
  root.dataset.theme = theme.id;
  return theme.id;
}
