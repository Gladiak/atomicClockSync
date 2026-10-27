Release 1.11.0 · 27 October 2026

AtomicClockSync 1.11.0 adds **Bluetooth time synchronization** beside radio transmission in **Synchronize**.

- One compact Bluetooth button and a dialog translated into English, Italian, French, German, Spanish and Japanese.
- Date/time updates only: model-specific procedures preserve existing time configuration; fresh NTP time is obtained immediately before the write. No automatic retries after an uncertain write.
- Explicit Casio model profiles, including **GA-B2100 / 5689**, **Mudmaster GWG-B1000 / 5713** and **GST-B1000D / 5748**. Wear OS is excluded.
- GST-B1000 / 5748 initialization avoids the city-name register rejected by a real device; a subsequent macOS trace completed the time write, with watch-level confirmation still pending.
- Existing radio-only watches, including GW-9500 / 3553, continue to use the five-station radio mode.
- Native Bluetooth backends and bundled runtime for macOS, **Windows 11 x64**, and Linux x64 (**BlueZ >= 5.55**, D-Bus and a BLE adapter required). No separate Python or Node.js installation.
- Updated Synchronize/Bluetooth screenshots, README, changelog and the offline Guide: 17 chapters and 84 localized screenshots.

**Compatibility:** successful GA-B2100C / 5689 and GWG-B1000 / 5713 time updates have been reported on macOS. The 129-profile catalogue is implementation coverage, not 129 hardware-tested models. GST-B1000D has a successful physical time-write trace on macOS; its watch-level result and other models still await confirmation. Some SP/MIP firmware is refused when existing settings cannot be preserved completely. “Time sent” reports a completed Bluetooth write; check the watch itself. Physical Bluetooth validation on Windows/Linux remains pending.

**Downloads:** macOS Apple Silicon ZIP, Windows 11 x64 portable EXE, Linux x64 AppImage/DEB/RPM. Packages are unsigned or locally ad-hoc signed and the macOS app is not notarized. Verify downloads with **SHA256SUMS.txt**.

**Validation:** 98 JavaScript tests and 28 Python Bluetooth tests; native Electron checks for the Bluetooth dialog, six-language illustrated Guide, navigation and desktop/audio behavior. Bluetooth UI/protocol tests substitute hardware; physical validation is limited to the watch updates reported above.

See the [Bluetooth guide](https://github.com/Gladiak/atomicClockSync/blob/main/docs/BLUETOOTH.md), [model catalogue](https://github.com/Gladiak/atomicClockSync/blob/main/docs/BLUETOOTH_MODELS.md) and [changelog](https://github.com/Gladiak/atomicClockSync/blob/main/docs/RELEASE_NOTES.md).
