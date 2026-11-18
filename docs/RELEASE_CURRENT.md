# AtomicClockSync 2.2.0 — Automatic watch collection and weather trends

Released on **18 November 2026**.

Version 2.2 adds automatic Bluetooth watch collection and compact watch cards, and expands the Clock Observatory with weather trends and aligned forecasts. Existing profiles, settings, reception history, accuracy journals and personal moments remain in the app’s separate local data directory.

## What’s new

- **Automatic Bluetooth collection:** the first successful time send creates a locally linked watch and saves the first matching ShockBase variant with its photo and technical sheet. The suggested colour is marked for review; subsequent sends reuse the local link, and incomplete initial catalogue imports can be retried after a later successful send. Hardware addresses stay inside the native worker; an installation-specific secret derives the local collection link.
- **Variant selection and immediate imports:** Choose variant replaces and saves the model, photo and technical sheet together while preserving personal notes and audio settings. Confirmed photo/sheet imports for an existing unchanged model also save immediately. Manual drafts and model-field edits still require Save settings. The base watch card remains available offline.
- **Compact watch cards:** three watches per row, larger portraits that ignore transparent margins, and a vertical summary of module, weight, dimensions, collection and release date. A document icon opens the technical sheet; one menu groups variant, photo, accuracy, reception lab, history and source actions.
- **Five weather trends:** passive 24-hour charts for humidity, sea-level pressure, wind with dashed gusts, hourly precipitation probability and cloud cover. Percentages use a fixed 0–100 scale, pressure retains a minimum 8 hPa span, and missing samples remain gaps. The daily rain maximum stays distinct from the hourly forecast curve.
- **Clearer temperature and forecasts:** the temperature trend sits inside the current-temperature and feels-like tile. Six hourly and seven daily cards align below, with explicit Min, Max and Rain labels and consistent line-and-fill charts. Expanded hourly data use the validated, bounded weather cache with offline support.
- **Updated six-language Guide:** collection imports, watch cards and weather readings are documented alongside the updated README and English user guide.

## Downloads

| File | Platform |
| --- | --- |
| `AtomicClockSync-2.2.0-arm64-mac.zip` | macOS Apple Silicon |
| `AtomicClockSync-2.2.0-windows-x64-portable.exe` | Windows 11 x64 portable |
| `AtomicClockSync-2.2.0-linux-x86_64.AppImage` | Linux x64 portable |
| `AtomicClockSync-2.2.0-linux-amd64.deb` | Debian / Ubuntu / Mint x64 |
| `AtomicClockSync-2.2.0-linux-x86_64.rpm` | Fedora / openSUSE x64 |

Each package includes Electron and the native Bluetooth worker/runtime; no separate Node.js or Python installation is required. **SHA256SUMS.txt** covers all five packages. The macOS build is locally ad-hoc signed and not notarized; Windows/Linux packages have no platform signing certificate.

## Validation and compatibility

- **168 JavaScript tests and 29 Python Bluetooth tests.** Native Electron checks cover automatic Bluetooth collection, variant imports, compact cards, the Clock Observatory, forecast alignment, weather charts, six languages, fifteen themes, responsive layout, offline/missing data and uninterrupted muted radio transmission.
- The [native release workflow](https://github.com/Gladiak/atomicClockSync/actions/workflows/build-desktop.yml) builds macOS Apple Silicon, Windows x64 and Linux x64 with tests enabled. Before staging downloads it verifies every packaged source/asset, the application version, the bundled Bluetooth runtime self-test and the five-package SHA-256 manifest.
- Bluetooth model coverage and physical validation are unchanged: previously reported GA-B2100C / 5689, GWG-B1000 / 5713 and GST-B1000 / 5748 updates on macOS remain the available hardware evidence. Physical Windows/Linux Bluetooth and audio validation remains pending. Weather values are model forecasts; ISS positions are estimates/reports.

[User guide](https://github.com/Gladiak/atomicClockSync/blob/main/docs/USAGE.en.md) · [Bluetooth guide](https://github.com/Gladiak/atomicClockSync/blob/main/docs/BLUETOOTH.md) · [Full changelog](https://github.com/Gladiak/atomicClockSync/blob/main/docs/RELEASE_NOTES.md)
