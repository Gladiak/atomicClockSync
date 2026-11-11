# AtomicClockSync 2.1.0 — Ambient weather and lunar calendar

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

[User guide](https://github.com/Gladiak/atomicClockSync/blob/main/docs/USAGE.en.md) · [Bluetooth guide](https://github.com/Gladiak/atomicClockSync/blob/main/docs/BLUETOOTH.md) · [Full changelog](https://github.com/Gladiak/atomicClockSync/blob/main/docs/RELEASE_NOTES.md)
