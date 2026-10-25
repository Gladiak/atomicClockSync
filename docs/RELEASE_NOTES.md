# Release notes

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
