# Interface localization

The renderer supports `en`, `it`, `fr`, `de`, `es` and `ja`. English is the default. The language is stored separately in `atomic.language` and does not change station encoding, time zones, watch profiles or personal content.

`src/locales/messages.mjs` exports the merged five-language catalog, keyed by original English text. Light Travel messages live in `src/locales/light-travel.mjs` and are merged there. Add every new interface message in all five languages. Preserve every numbered interpolation field (`{0}`, `{1}`, etc.); use `t('Message {0}', value)` instead of concatenating translated grammar. Keep units, station identifiers, DOM IDs, reference keys and stored enum values stable.

`src/i18n.mjs` binds static text nodes and accessible attributes once before views are created. It never scans user-generated DOM or observes all mutations. Dynamic views call `t()` while rendering and subscribe to `onLanguageChange()` to refresh their own text without resetting forms or audio. Use the locale-aware date/number helpers for display. Protocol calculations and SVG numeric coordinates keep their original formats. Only app-generated retained messages may use `localizeStoredMessage()`; never apply it to personal names or notes.

Native menu translations are in `electron/main.cjs`; the preload exposes a validated language IPC request. Japanese font fallback is local; its source and license are documented in [THIRD_PARTY.md](THIRD_PARTY.md).

Run `npm test` to check interpolation coverage and all 32 journey narratives. Run `npm run test:languages` for the real Electron UI across all six languages, all sections, valid ISS data, German/Japanese journeys, nine themes, persistence, localized search, native menus, personal-text preservation and uninterrupted muted transmission. It writes screenshots and layout/residual-English reports to `artifacts/languages/`. All desktop tests use temporary profiles.
