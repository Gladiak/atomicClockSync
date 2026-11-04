# AtomicClockSync 2.0.0 — Your time, your watches, your observatory

Released on **4 November 2026**.

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

[User guide](https://github.com/Gladiak/atomicClockSync/blob/main/docs/USAGE.en.md) · [Bluetooth guide](https://github.com/Gladiak/atomicClockSync/blob/main/docs/BLUETOOTH.md) · [Full changelog](https://github.com/Gladiak/atomicClockSync/blob/main/docs/RELEASE_NOTES.md)
