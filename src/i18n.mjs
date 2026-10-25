import { messages } from './locales/messages.mjs';

export const LANGUAGES = Object.freeze([
  { id: 'en', name: 'English', locale: 'en-GB' },
  { id: 'it', name: 'Italiano', locale: 'it-IT' },
  { id: 'fr', name: 'Français', locale: 'fr-FR' },
  { id: 'de', name: 'Deutsch', locale: 'de-DE' },
  { id: 'es', name: 'Español', locale: 'es-ES' },
  { id: 'ja', name: '日本語', locale: 'ja-JP' },
]);
let language = 'en';
try { const saved = JSON.parse(globalThis.localStorage?.getItem('atomic.language') || 'null'); if (LANGUAGES.some(item => item.id === saved)) language = saved; } catch { /* Use English if storage is unavailable. */ }
const listeners = new Set(), formats = new Map();
const originalMessages = new Map();
for (const [source, translations] of Object.entries(messages)) for (const value of Object.values(translations)) if (!originalMessages.has(value)) originalMessages.set(value, source);
export const getLanguage = () => language;
export const locale = () => LANGUAGES.find(item => item.id === language).locale;
export function t(source, ...values) {
  if (typeof source !== 'string') return source;
  const translated = language === 'en' ? source : messages[source]?.[language] ?? source;
  return translated.replace(/\{(\d+)\}/g, (match, index) => index < values.length ? String(values[index]) : match);
}
// For app-generated messages previously saved in history or retained between
// renders. Never apply this to watch names, personal notes or capsule messages.
export const localizeStoredMessage = value => t(originalMessages.get(value) ?? value);
export function onLanguageChange(callback) { listeners.add(callback); return () => listeners.delete(callback); }
export function setLanguage(id) {
  if (!LANGUAGES.some(item => item.id === id)) return false;
  let saved = true;
  try { localStorage.setItem('atomic.language', JSON.stringify(id)); } catch { saved = false; }
  if (id !== language) { language = id; document.documentElement.lang = id; for (const listener of listeners) listener(id); }
  return saved;
}
function formatter(type, options, englishLocale = 'en-GB') {
  const get = () => {
    const formatLocale = language === 'en' ? englishLocale : locale();
    const key = `${type}:${formatLocale}:${JSON.stringify(options)}`;
    if (!formats.has(key)) formats.set(key, new Intl[type](formatLocale, options));
    return formats.get(key);
  };
  return { format: value => get().format(value), formatToParts: value => get().formatToParts(value) };
}
export const dateTimeFormat = (options, englishLocale) => formatter('DateTimeFormat', options, englishLocale);
export const numberFormat = options => formatter('NumberFormat', options);
export const decimal = (value, digits) => numberFormat({ minimumFractionDigits:digits, maximumFractionDigits:digits, useGrouping:false }).format(value);

// Bind original static text nodes once, without replacing elements or event
// handlers. Dynamic views render with t(); user-entered text is never scanned.
export function localizeDocument(root = document) {
  const text = [], attributes = [];
  const walker = document.createTreeWalker(root.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode, source = node.data.trim();
    if (!node.parentElement.closest('script,style,[translate="no"]') && Object.hasOwn(messages, source)) {
      text.push({ node, source, before: node.data.match(/^\s*/)[0], after: node.data.match(/\s*$/)[0] });
    }
  }
  for (const node of root.querySelectorAll('[title],[placeholder],[aria-label]')) for (const name of ['title','placeholder','aria-label']) {
    const source = node.getAttribute(name);
    if (source && Object.hasOwn(messages, source)) attributes.push({ node, name, source });
  }
  const apply = () => {
    document.documentElement.lang = language;
    for (const item of text) if (item.node.isConnected) item.node.data = item.before + t(item.source) + item.after;
    for (const item of attributes) if (item.node.isConnected) item.node.setAttribute(item.name, t(item.source));
  };
  apply(); onLanguageChange(apply);
}
