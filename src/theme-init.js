// Apply the saved palette before the stylesheet paints. Theme is independent
// of watch profiles and signal settings. Unknown IDs fall back to CSS defaults.
try {
  const theme = JSON.parse(localStorage.getItem('atomic.theme'));
  if (typeof theme === 'string' && /^[a-z-]{1,24}$/.test(theme)) document.documentElement.dataset.theme = theme;
} catch { /* First launch, unavailable storage or invalid saved value: use lime. */ }
