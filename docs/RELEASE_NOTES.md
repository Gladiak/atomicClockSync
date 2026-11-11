# Release notes

## 2.1.0 — Ambient weather and lunar calendar

Released on **11 November 2026**.

Version 2.1 turns the full-screen Clock Observatory into an ambient weather station with a live lunar calendar and a sky that follows the selected city. Existing profiles, settings, reception history, accuracy journals and personal moments remain in the app’s separate local data directory.

## What’s new

- **Ambient weather station:** temperature and perceived temperature, humidity and dew point, sea-level pressure with its three-hour model change, wind direction and gusts, daily rain probability and forecast precipitation total, cloud cover and visibility. A passive 24-hour temperature curve, six upcoming hourly slots and seven forecast days keep readings visible around the central clock without scrolling or time sliders.
- **Centered lunar calendar:** weekday and date sit beside a photographic NASA/LRO Moon with its live phase, illumination and waxing/waning label. The calendar stays centered below the clock across languages and window sizes; sky preview dates never change it.
- **Living sky:** the full-screen background follows local solar altitude, with subtle cloud drift based on available model cloud cover and restrained stars at night. Reduced-motion preferences stop the animation; hidden scenes pause it. Missing cloud estimates never fabricate clouds.
- **Solar arc and countdown:** sunrise, sunset and day length accompany a local solar arc with a position marker and countdown to the next sunrise or sunset. Polar day and night have explicit states. These calculations remain available offline.
- **Reliable forecasts:** the expanded weather readings use the existing validated native service and shared bounded cache. Missing and expired values remain unavailable, delayed responses cannot overwrite a newly selected city, and model validity/download times remain visible. The dashboard retains its interactive temperature curve.
- **Updated documentation:** refreshed Clock Observatory screenshots in all six offline Guide languages, README screenshots and the English user guide describe the new station and calendar using isolated, illustrative sample data.

## Downloads

| File | Platform |
| --- | --- |
| `AtomicClockSync-2.1.0-arm64-mac.zip` | macOS Apple Silicon |
| `AtomicClockSync-2.1.0-windows-x64-portable.exe` | Windows 11 x64 portable |
| `AtomicClockSync-2.1.0-linux-x86_64.AppImage` | Linux x64 portable |
| `AtomicClockSync-2.1.0-linux-amd64.deb` | Debian / Ubuntu / Mint x64 |
| `AtomicClockSync-2.1.0-linux-x86_64.rpm` | Fedora / openSUSE x64 |

Each package includes Electron and the native Bluetooth worker/runtime; no separate Node.js or Python installation is required. **SHA256SUMS.txt** covers all five packages. The macOS build is locally ad-hoc signed and not notarized; Windows/Linux packages have no platform signing certificate.

## Validation and compatibility

- **152 JavaScript tests and 28 Python Bluetooth tests.** Native Electron checks cover the ambient station, centered calendar, live Moon, solar arc/countdown, six languages, fifteen themes, seven window sizes, reduced motion, hidden-scene pause, twilight/night/polar/offline/missing states, delayed city responses, preview isolation and uninterrupted muted radio transmission.
- The [native release workflow](https://github.com/Gladiak/atomicClockSync/actions/workflows/build-desktop.yml) builds macOS Apple Silicon, Windows x64 and Linux x64 with tests enabled. Before staging downloads it verifies every packaged source/asset, the application version, the bundled Bluetooth runtime self-test and the five-package SHA-256 manifest.
- Bluetooth model coverage and physical validation are unchanged: previously reported GA-B2100C / 5689, GWG-B1000 / 5713 and GST-B1000 / 5748 updates on macOS remain the available hardware evidence. Physical Windows/Linux Bluetooth and audio validation remains pending. Weather values are model forecasts; ISS positions are estimates/reports.

## 2.0.0 — Personal dashboard, collection and observatory

Released on 4 November 2026.

Version 2.0 brings a personal dashboard, a photographic watch collection and a cleaner observatory around the existing radio and Bluetooth synchronization tools. Existing profiles, settings, reception history, accuracy journals and personal moments remain in the app’s separate local data directory.

## What’s new

- **Your now:** live city-local reference clock, sunrise/sunset and day length, the selected watch’s centered portrait, current weather, photographic Earth and Moon, and current ISS position/speed/altitude from a valid orbital estimate or recent report.
- **Clock Observatory:** equal-size hours, minutes and seconds in the bundled Manrope font, city coordinates and time zone, weather, a 24-hour temperature curve, hourly outlook and five-day forecast. Earth, Moon and Light Travel share a restrained full-screen HUD with controls that fade when idle.
- **Weather and atmosphere:** subtle day, twilight and night gradients follow the city’s actual solar altitude and preserve the selected theme. The dashboard switches between **24 h / 5 days**. Curves support pointer/touch and keyboard inspection, local time labels, real elapsed-hour spacing across DST and explicit gaps for missing data. Weather uses the existing bounded native cache; expired estimates are hidden.
- **Personal collection:** search and watch tiles stay on the collection page; New watch and editing use a modal. Save settings preserves the active selection. The watch/check icon selects the active watch and stays accented after restart.
- **Optional ShockBase imports:** centered/resized local watch photos, source credits and normalized technical sheets. Exact model/variant/module checks protect imports and saving; regional suffixes are recognized. Measurements, feature states and official Casio manual links share one schema. The sheet replaces the editor content, with Back/Escape, a double-arrow update and red trash action.
- **Photographic sky:** local NASA Blue Marble Earth with Satellite/Map layers, illustrative city lights and zoom/pan; a photographic NASA/LRO lunar surface with calculated illumination. The home cards use the same visuals as their observatories. Shared sky previews never change the live clock or transmitted time.
- **Consistent finish:** fifteen palettes, quieter theme accents, sharper corners across panels/dialogs/controls, and focus indicators reserved for keyboard navigation. Pointer clicks and pointer-driven modal returns leave no focus ring. The macOS development launcher uses the AtomicClockSync identity and icon.
- **Updated documentation:** nineteen offline Guide chapters, 107 translated prose passages and 96 regenerated screenshots across six languages. New dashboard/Clock chapters have contextual links to the actual tools. README and English user guide include the current collection, weather, privacy and observatory flows. Images use isolated, illustrative sample data.

## Downloads

| File | Platform |
| --- | --- |
| `AtomicClockSync-2.0.0-arm64-mac.zip` | macOS Apple Silicon |
| `AtomicClockSync-2.0.0-windows-x64-portable.exe` | Windows 11 x64 portable |
| `AtomicClockSync-2.0.0-linux-x86_64.AppImage` | Linux x64 portable |
| `AtomicClockSync-2.0.0-linux-amd64.deb` | Debian / Ubuntu / Mint x64 |
| `AtomicClockSync-2.0.0-linux-x86_64.rpm` | Fedora / openSUSE x64 |

Each package includes Electron and the native Bluetooth worker/runtime; no separate Node.js or Python installation is required. **SHA256SUMS.txt** covers all five packages. The macOS build is locally ad-hoc signed and not notarized; Windows/Linux packages have no platform signing certificate.

## Validation and compatibility

- **143 JavaScript tests and 28 Python Bluetooth tests.** Native Electron checks cover the updated Guide, six languages, fifteen themes, dashboard and Clock weather, offline/stale states, delayed city responses, DST/polar calculations and uninterrupted muted radio transmission.
- Windows and Linux packages were built and verified by the [release workflow](https://github.com/Gladiak/atomicClockSync/actions/runs/41868710203) with tests enabled. A [GitHub Actions outage](https://www.githubstatus.com/incidents/xr3myzj7ms51) left its macOS job queued, so the Apple Silicon package was built and verified locally from the same `v2.0.0` source commit (`da45a20`). All three platforms passed packaged source/asset, version and bundled Bluetooth runtime self-tests; all five package checksums were validated before upload.
- This release does not extend the verified Bluetooth model registry or claim new physical watch validation. Previously reported successful GA-B2100C / 5689, GWG-B1000 / 5713 and GST-B1000 / 5748 updates on macOS remain the available hardware evidence. Physical Windows/Linux Bluetooth and audio validation remains pending. ISS positions are estimates/reports, not onboard telemetry; weather values are model forecasts, not sensor observations.


## 1.11.0 — Bluetooth time synchronization

Released on 27 October 2026.

Updated in place on 27 October 2026: the downloadable 1.11.0 packages and SHA-256 checksums are refreshed with the six new themes and Pulse Sync identity, keeping the same filenames and version number.

- Applied the Pulse Sync clock-and-radio-pulse mark to the compact/expanded sidebar and Settings, with theme-aware accents, a matching 1024 px lime app icon and the macOS Dock icon. The icon is regenerated from the shared SVG mark with `npm run build:icon`. This branding-only package refresh skips test suites and runtime self-tests, while retaining packaged-file and checksum checks.
- Refreshed all 84 offline Guide screenshots in English, Italian, French, German, Spanish and Japanese with Rainbow, Pulse Sync and the current sidebar. Documentation captures use an isolated sample profile and a clock inside the bundled orbital snapshot's validity window.
- Expanded navigation in all manual and README screenshots, opening the current section and showing the active menu. A shared documentation-only capture layout keeps the normal content width beside the sidebar without obscuring controls.
- Replaced the white envelope playhead with a minimal theme-colored neon dot and a short curved trail. The cursor renders with animation frames and smooth 100 ms vertical transitions across all five stations, retaining the exact envelope and audio timing. Waveform geometry is cached between window/station/profile changes; rendering pauses outside Synchronize or when the document is hidden. The cursor stays round when the SVG stretches, and reduced-motion mode omits the trail and halo.

- Added Soft Sage, Powder Blue, Soft Lavender and Warm Sand pastel accents on the original dark surfaces, plus Rainbow and Rainbow Soft with stable color roles for actions, data, reference/confirmation, transmission/progress and errors. All fifteen themes are localized, persist independently of watch settings and can change during transmission. Desktop checks cover contrast, dark surfaces, semantic colors, offline reference state, GET/ERR history and muted audio isolation.

- Updated Synchronize and Bluetooth screenshots, the six-language offline Guide, README and user guide for the new Bluetooth mode.
- Added one Bluetooth button beside radio transmission and a compact translated dialog for explicit Casio family profiles, including GA-B2100 / 5689 and GWG-B1000 / 5713. Discovery ends as soon as a supported watch appears; detected watches are immediately selectable instead of waiting for the scan timeout.
- Added a native local BLE worker for macOS, Windows 11 and Linux. The time-only allowlist reads and echoes existing time configuration byte-for-byte before writing date/time; fresh NTP is required. Writes are not retried automatically, and uncertain outcomes ask the user to check the watch.
- Added standard two/six-slot, no-city, analogue/second-dial and dedicated current-time adapters; SP/MIP requires complete unchanged settings snapshots and refuses unsupported firmware. Wear OS is excluded. Unknown models can only use an actual dedicated time service. The dialog shows physical-validation status and asks for the watch’s current UTC offset only when it cannot be read.
- Moved the NTP check to the end of watch initialization so longer handshakes do not age the reference.
- Added always-available Bluetooth diagnostics: a translated popup with refresh/copy, usable before/during attempts and after success/failure. The last 400 events are retained in memory across retries; addresses, settings payloads and raw driver text are excluded. Opening or closing the popup does not cancel Bluetooth.
- Added Bluetooth attempts to the synchronization timeline, with a separate persistent local archive, model/module, duration, time reference and sent/failed/cancelled/uncertain outcomes. Read-only details cannot restore radio settings or assign radio GET/ERR results. Clear/undo covers both archives; pending attempts survive restart as uncertain. Reception Lab and Watch Accuracy keep their existing radio-only trial semantics.
- Fixed the GWG-B1000 / 5713 profile to initialize home/world time only: the inherited six-clock sequence timed out on `1d02`. A real macOS debug run completed the corrected sequence and the user confirmed OK on the watch. Added opt-in `npm run start:debug` protocol logs for real-device diagnostics.
- Added GST-B1000D / 5748 instructions (B for 2.5 seconds; C for 0.5 seconds for immediate time correction) and prefer its dedicated writable current-time service when exposed. The upstream 5631 module attribution is not used.
- Corrected GST-B1000 / 5748 initialization after a live trace rejected the unsupported city-name register `1f00` with `ff81`. Its full profile now preserves the accepted DST and two zone records without querying city names; a regression test covers the rejection. A subsequent macOS device trace completed initialization and the time write without errors; the user subsequently confirmed successful operation and OK on the watch.
- Added worker packaging, platform build checks, dependency notices, a three-platform build workflow and Bluetooth setup documentation. A user confirmed a GA-B2100C / 5689 time update on macOS on 27 October 2026; full settings-preservation and native Windows validation remain pending.

Validation: 105 JavaScript tests, 28 Python Bluetooth protocol/adapter tests and native Electron checks for the Bluetooth dialog, six-language illustrated Guide, navigation and desktop/audio behavior. Bluetooth UI/protocol tests substitute hardware; the reported GA-B2100C, GWG-B1000 and GST-B1000 time updates provide separate physical evidence on macOS.

## 1.10.0 — Watch Accuracy, illustrated Guide and 96 historical journeys

Updated in place on 26 October 2026: this version keeps the same package filenames; the downloadable builds and SHA-256 checksums are replaced with the refreshed application.

- Pinned Settings and renamed Guide outside the collapsible groups, keeping both available as footer icons in compact mode. Expanded Guide into sixteen narrative chapters with practical examples, contextual help, chapter navigation/persistence and real localized screenshots with a zoom preview. All 80 prose passages and 78 screenshots cover the six supported languages; screenshot capture uses temporary sample data without focused title outlines.
- Added a minimal icon rail that automatically expands on hover or keyboard focus and folds on leave. The overlay keeps content geometry stable. Signals, Watches and Explore use short labels and animated submenus, with one open group at a time and remembered disclosure state. Active-group icons, an edge chevron, keyboard access, reduced motion and six-language checks are included. Hover and selection use a thin vertical accent line with transparent row backgrounds; the compact footer keeps the app version centred.
- Added a per-watch manual offset journal with an original interactive graph, last measured offset, daily drift fit, observed scatter and clearly identified short-horizon extrapolations.
- Added local/UTC reference clocks and contemporary NTP snapshots. Backdated/retimed entries remain unverified; manual reading resolution and optional wear, position, temperature and personal notes are retained.
- Separated observation periods at synchronization, adjustment and maintenance events without assuming zero offset. Added point editing, confirmed deletion with period-merge explanation and undo.
- Connected profiles, manually confirmed GET trials and filtered Reception Lab views. Watch IDs preserve identity across renames; archived profiles keep their journals. GET links pre-fill events for review and never save automatic zero readings.
- Added per-watch JSON/CSV exports, spreadsheet-formula protection for text and recovery export for unsupported/corrupt archive data. Existing profiles and transmission settings remain intact.
- Added all six languages, nine-theme UI and eleven numerical/data tests plus native journal, reference, export, layout, persistence and audio-isolation checks.


- Tripled Time Machine from 32 to 96 journeys, adding 64 dated records across relativity, quantum timescales, atomic clocks, UTC/GPS, astronomy and space exploration. Added Time science and Astronomy filters, seven new vector illustrations and a capsule scene using the existing artwork.
- Added five-language translations for every new narrative and caption, plus a chronological catalogue of all 96 events and their 87 institutional/publication references. New records deliberately use day precision; receipt/publication/announcement dates and UTC/local-date differences are identified explicitly.
- Added offline per-watch/station statistics from explicitly entered GET/ERR outcomes, with separate unverified counts. Groups preserve watch identity and recorded conditions, prioritize verified sample size and mark small samples; missing snapshots, interrupted audio and live volume changes are excluded from groups.
- Added A/B snapshot comparison, highlighted setting differences, actual transmission duration and links to edit historical outcomes. Missing manual notes and inconsistent conditions are identified without implying a controlled experiment.
- Added baseline preparation changing exactly one supported audio setting. Saved profile settings remain intact; preparation does not start transmission, cannot run during a session and blocks removed profiles or unavailable outputs.
- Added six-language/nine-theme UI, a dedicated sidebar icon and a compact explanation panel. Added eight unit tests and a native laboratory suite for statistics, edge cases, preparation, history updates, persistence and audio isolation.

Validation: 86 unit tests; native desktop, navigation, Reception Lab, Watch Accuracy and full illustrated Guide checks across six languages and nine themes. Individual macOS Apple Silicon, Windows x64 portable and Linux x64 AppImage, DEB and RPM downloads are provided with SHA-256 checksums. macOS is ad-hoc signed without notarization; Windows is unsigned. Linux packaged UI and muted audio are tested in Docker; native Windows execution, RPM installation and physical watch reception remain untested.

## 1.9.0 — Light Travel, languages and fluid navigation

- Added Light Travel: an original cinematic Solar System with nine selectable light sources, an animated photon trail, arrival ripples and source departure/reflection versus Earth reception clocks. Date-dependent light times are calculated offline, with UTC previews from 1900–2100 and a six-month jump.
- Added fixed-observation replay at 1×/10×/100×/1000× or a twelve-second overview, pause/resume, continuous speed changes and automatic pause when leaving or hiding the view. Integrated six languages, nine themes, reduced motion, keyboard controls and an in-app science explanation.
- Validated light-time calculations against four independent JPL Horizons observer-centre reference samples; added replay/date unit coverage and native UI, language, theme and transmission-isolation checks.
- Added English, Italian, French, German, Spanish and Japanese under Settings → Language, with immediate switching and independent local persistence. Localized static UI, dynamic messages, time/number formatting, astronomy, all 32 historical journeys and native menus. Personal names, notes, capsules and protocol identifiers remain intact.
- Included Noto Sans JP under SIL OFL 1.1 for offline Japanese glyph coverage. Adapted navigation wrapping, settings scrolling and Japanese synchronization spacing; added six-language layout, residual-English, persistence and live-audio validation.
- Renamed the Electron application, native menu, window title and future package product name to **AtomicClockSync**. Existing profiles, preferences, history, time capsules and ISS cache retain their existing storage directory.
- Enlarged the titlebar app name to 13 px with a stronger weight and contrast.
- Added directional slide/scale/fade section entrances, coordinated heading motion and a sliding sidebar selection indicator. Navigation and focus update immediately; rapid clicks cancel obsolete animations. Live transmission continues independently.
- Respect reduced-motion preferences, including changes while an animation is running. Repeat clicks on the current section do not restart motion.
- Added a visible Electron navigation check covering identity, temporary-profile preservation, rapid clicks, focus handoff, reduced motion, sidebar alignment and uninterrupted muted audio.

Validation: 65 unit tests, including comparisons with independent JPL light-time samples; native desktop, World View, ISS, Moon/Time Machine, Back in Time, navigation, six-language and Light Travel suites. Linux x64 AppImage tested on Ubuntu 22.04 in Docker with a virtual display and muted AudioWorklet audio. DEB/RPM metadata and application payload checked against that AppImage. Windows x64 portable archive and embedded sources verified; Windows runtime and native Fedora/openSUSE installation remain untested.

Individual downloads: `AtomicClockSync-1.9.0-arm64-mac.zip`, `AtomicClockSync-1.9.0-windows-x64-portable.exe`, `AtomicClockSync-1.9.0-linux-x86_64.AppImage`, `AtomicClockSync-1.9.0-linux-amd64.deb`, `AtomicClockSync-1.9.0-linux-x86_64.rpm` and `SHA256SUMS.txt`. macOS uses an ad-hoc signature without notarization; Windows is unsigned. Existing local data keeps its original storage location. No combined platform archive is distributed.

## 1.8.0 — Moon Observatory and Time Machine

- Added an offline Moon Observatory with original procedural lunar artwork, calculated phase and illumination, distance, age, local altitude/azimuth, moonrise/moonset, a full-Moon countdown and four upcoming quarter phases.
- Shared the observing city with World View and ISS; added an independent 1900–2100 UTC date/time preview and Live reset.
- Added historical journeys with original illustrated scenes, primary-source links, search/category filters, historical clock reconstruction and elapsed counters that respect documented date/time precision.
- Added locally saved personal memories, future countdowns and time capsules with scheduled message reveal, editing and confirmed deletion. Capsule storage is not encrypted.
- Expanded the archive to 32 chronologically ordered journeys across Space, Discovery and Timekeeping, with 31 primary-source links and 17 illustration families.
- Removed the selected-station panel from the sidebar to reserve room for future sections; station details remain in Synchronize.
- Collected historical journeys, personal keepsakes and the existing Back in Time film dashboard under Time Machine, with a distinct lunar icon and compact navigation.

Validation: 58 unit tests and a dedicated observatory suite covering local lunar events, date previews, historical precision, personal CRUD/persistence, capsule sealing, all nine themes, the fixed window and real muted AudioWorklet isolation.

Packages: `Atomic Clock Sync-1.8.0-arm64-mac.zip`, `Atomic Clock Sync-1.8.0-windows-x64-portable.exe`, and `SHA256SUMS.txt`. macOS arm64 is runtime-tested. Windows x64 is checked for package integrity and embedded sources but has not been run on Windows. Mac signing is ad-hoc and not notarized; Windows is unsigned.

Linux distribution added: `Atomic Clock Sync-1.8.0-linux-x86_64.AppImage` and `Atomic Clock Sync-1.8.0-linux-amd64.deb`, published separately with hashes in `SHA256SUMS.txt`. Both target Intel/AMD x64. Built using a pinned official Electron Builder Docker image on Ubuntu 22.04. Verified matching embedded sources and package payloads; tested the packaged UI, Moon Observatory, 32 historical journeys, World View and muted AudioWorklet transmission on a virtual display. Container testing uses `--no-sandbox`; normal launch retains sandboxing. Linux hardware audio and physical watch reception remain untested. Added `npm run dist:linux:docker`.

Distribution now uses individual platform packages only. Removed the combined Mac/Windows ZIP from 1.8.0 and replaced the bundling command with `npm run checksums` for current-version platform packages.

Added `Atomic Clock Sync-1.8.0-linux-x86_64.rpm` for RPM-based distributions and included RPM in the Linux build and checksum commands. RPM architecture, version, metadata and embedded application payload are verified against the tested Linux application; native Fedora/openSUSE installation and desktop integration remain untested.

## 1.7.0 — Back in Time

- Added a Hill Valley time laboratory inspired by Back to the Future, with original red, green and amber seven-segment time circuits and a vector flux capacitor.
- Added five movie destinations spanning 1885, 1955, 1985 and 2015, elapsed-day counters on every card and a live days/hours/minutes/seconds counter for the selected moment.
- Added an animated 88 MPH jump, a “GRANDE GIOVE!!” arrival screen, a cinematic destination preview and return to the present. Departures are recorded on the amber circuit; leaving during acceleration cancels the jump.
- Kept cinematic previews separate from the real app time reference, audio transmission and watch settings. All circuits use California time, support offline operation and respect reduced-motion preferences.
- Replaced the sidebar's text symbols with nine distinct SVG icons for synchronization, watches, signal, world, ISS, time travel, history, settings and guide. Kept consistent strokes, alignment and theme colors in the fixed desktop window.

Validation: 51 unit tests, the desktop suite and the Back in Time suite. Checks cover Pacific dates, DST and leap-day durations, five destinations, all nine themes, fixed-window layout, live counters, jump/return/cancellation, focus handling, reduced motion and real muted AudioWorklet isolation.

Packages: `Atomic Clock Sync-1.7.0-arm64-mac.zip`, `Atomic Clock Sync-1.7.0-windows-x64-portable.exe`, `Atomic Clock Sync-1.7.0-macOS-Windows.zip`, and `SHA256SUMS.txt`. macOS arm64 is runtime-tested. Windows x64 is checked for package integrity and embedded sources but has not been run on Windows. Mac signing is ad-hoc and not notarized; Windows is unsigned.

## 1.6.0 — ISS Orbital Observatory

- Added a dedicated ISS section with Tracking, Passes, Station and Time in Orbit views.
- Added online-updated orbital estimates, modeled ground tracks, horizon footprint, altitude, velocity, illumination, direction, orbit period and country/ocean labels.
- Added a persistent orbit cache, GP/TLE fallback, response validation, request coalescing, provider-friendly refresh intervals, backoff and Retry-After support. Online, offline prediction, report-only, stale and unavailable states are explicit.
- Added local pass prediction for the World View city, potential-visibility filtering, countdowns, pagination, a sky plot and independent pass/orbit previews.
- Added an original vector station schematic, official mission/crew/video links, and an educational gravitational/kinematic clock-shift explorer linked to ACES.
- Kept the fixed 1100 × 740 window, all nine themes and audio transmission isolated from ISS exploration. No geolocation or API key is required; observer coordinates stay local.

Validation: 48 unit tests plus the desktop, World View and ISS suites. Tests exercise real muted AudioWorklet transmission, nine themes and layout, offline/cache/stale/report states, visibility calculations and orbital agreement with a separately retrieved position report. ISS UI tests use controlled fixtures and do not query external providers.

Packages: `Atomic Clock Sync-1.6.0-arm64-mac.zip`, `Atomic Clock Sync-1.6.0-windows-x64-portable.exe`, `Atomic Clock Sync-1.6.0-macOS-Windows.zip`, and `SHA256SUMS.txt`. macOS arm64 is runtime-tested. Windows x64 is checked for package integrity and embedded sources but has not been run on Windows. Mac signing is ad-hoc and not notarized; Windows is unsigned.

## 1.5.0 — A world between light and time

- Added World View: a fully offline vector Earth with country boundaries, astronomical day/night shading, gradual twilight and amber city lights.
- Added 171,637 searchable localities with a lazy-loaded worker index, accent/native-name matching, keyboard selection and persistent city choice.
- Added local city clocks, sunrise, sunset, daylight duration and polar day/night handling, including DST and local calendar-day boundaries.
- Added five interactive station markers, great-circle distance, explicit station selection and approximate Casio coverage overlays (off/selected/all).
- Added independent UTC preview, one-day-per-minute playback, Live reset and computed equinox/solstice presets for 1900–2100.
- Kept preview independent of the audio engine, settings and watch profiles; station changes stay locked during transmission.
- Added source attribution, data provenance, software license notices and reproducible asset-generation scripts.

Validation: 38 unit tests plus the full desktop and World View suites. The atlas is checked offline, across nine themes and in the fixed 1100 × 740 window, including real muted AudioWorklet transmission. City-light brightness and radio rings are illustrative, not live measurements.

Packages: `Atomic Clock Sync-1.5.0-arm64-mac.zip`, `Atomic Clock Sync-1.5.0-windows-x64-portable.exe`, `Atomic Clock Sync-1.5.0-macOS-Windows.zip`, and `SHA256SUMS.txt`. macOS arm64 is runtime-tested; Windows is built and checked for integrity but has not been run on Windows. Mac signing is ad-hoc and not notarized; Windows is unsigned.

## 1.4.0 — English project release

The interface, application messages, theme names, time formatting and primary documentation are now in English. Existing watch profiles, settings, theme IDs and trial history remain compatible. User-entered names and notes are preserved.

Included features:

- BPC, JJY 60 kHz, WWVB, DCF77 and MSF time-code simulation.
- NTP checking with a system-clock fallback.
- Per-watch profiles and restoration of successful settings.
- Left, right or both audio channels, plus a selected-channel output test.
- Paginated trial history with configuration snapshots and manual GET/ERR outcomes.
- Nine persistent themes, including the light Atlantic Blue theme.
- A fixed 1100 × 740 desktop window.

### Distribution files

- `Atomic Clock Sync-1.4.0-arm64-mac.zip`
- `Atomic Clock Sync-1.4.0-windows-x64-portable.exe`
- `Atomic Clock Sync-1.4.0-macOS-Windows.zip`
- `SHA256SUMS.txt`

The combined ZIP includes the two platform packages, English instructions and their checksums. Node.js is not needed to run packaged apps.

### Validation and platform status

macOS Apple Silicon is the tested runtime platform. Windows x64 is built and checked for archive integrity, embedded source consistency and executable architecture; it has not been run on Windows. Linux packaging is configured but unvalidated.

The Mac build uses a local ad-hoc signature and is not notarized. The Windows executable is not digitally signed.

Physical reception depends on audio hardware and watch placement. Automated protocol and PCM tests do not establish hardware compatibility. User confirmation is required for a successful reception outcome.

## 1.3.0

Added nine interface themes, live theme switching, saved theme selection, themed controls and contrast/layout validation.

## 1.2.0

Added stereo channel selection, watch profiles, successful configuration restore and complete paginated trial history with immutable settings snapshots.
