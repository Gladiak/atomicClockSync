Release 1.11.0 · 27 October 2026

AtomicClockSync 1.11.0 adds **Bluetooth time synchronization** beside radio transmission in **Synchronize**.

Updated in place on 27 October 2026: the same 1.11.0 package filenames now include six additional themes, the **Pulse Sync** identity and a fluid neon envelope cursor. Download the refreshed packages and verify them with the updated **SHA256SUMS.txt**.

- One compact Bluetooth button and a dialog translated into English, Italian, French, German, Spanish and Japanese.
- **Pulse Sync** logo in the compact/expanded sidebar and Settings, following the selected theme accent, with a matching lime-on-dark app icon and macOS Dock icon.
- A minimal neon dot follows the modulation envelope with a short curved trail, frame-synchronized movement and smooth 100 ms vertical transitions. Its glow follows the selected theme; audio and protocol timing remain unchanged.
- All **84 offline Guide screenshots** refreshed in the six interface languages with Rainbow, Pulse Sync and expanded navigation showing the current section and active menu beside each view, using illustrative local data.
- Fifteen themes in **Settings → Theme**, including **Soft Sage**, **Powder Blue**, **Soft Lavender**, **Warm Sand**, **Rainbow** and **Rainbow Soft**. All six additions retain the original dark base. Rainbow assigns blue to actions, violet to data, mint to the reference and confirmations, orange to transmission/progress and pink to errors, with lighter text variants for readability.
- Always-available **Open logs** popup with refresh and **Copy log**, during attempts and after success or failure. The last 400 technical events remain in memory until the app closes; device addresses, settings payloads and raw driver messages are excluded.
- Unified synchronization history includes persistent Bluetooth attempts with watch/model/module, duration, time reference and distinct sent/failed/cancelled/uncertain outcomes. Bluetooth details are read-only and remain separate from radio GET/ERR statistics. Interrupted pending attempts are preserved on restart.
- Date/time updates only: model-specific procedures preserve existing time configuration; fresh NTP time is obtained immediately before the write. No automatic retries after an uncertain write.
- Explicit Casio model profiles, including **GA-B2100 / 5689**, **Mudmaster GWG-B1000 / 5713** and **GST-B1000D / 5748**. Wear OS is excluded.
- GST-B1000 / 5748 initialization avoids the city-name register rejected by a real device; the corrected procedure completed a time update and the user confirmed OK on macOS.
- Existing radio-only watches, including GW-9500 / 3553, continue to use the five-station radio mode.
- Native Bluetooth backends and bundled runtime for macOS, **Windows 11 x64**, and Linux x64 (**BlueZ >= 5.55**, D-Bus and a BLE adapter required). No separate Python or Node.js installation.
- Updated Synchronize/Bluetooth screenshots, README, changelog and the offline Guide: 17 chapters and 84 localized screenshots.

**Compatibility:** successful GA-B2100C / 5689, GWG-B1000 / 5713 and GST-B1000 / 5748 time updates have been reported on macOS. The 129-profile catalogue is implementation coverage, not 129 hardware-tested models. Other models still await physical confirmation. Some SP/MIP firmware is refused when existing settings cannot be preserved completely. “Time sent” reports a completed Bluetooth write; check the watch itself. Physical Bluetooth validation on Windows/Linux remains pending.

**Downloads:** macOS Apple Silicon ZIP, Windows 11 x64 portable EXE, Linux x64 AppImage/DEB/RPM. Packages are unsigned or locally ad-hoc signed and the macOS app is not notarized. Verify downloads with **SHA256SUMS.txt**.

**Validation:** 105 JavaScript tests and 28 Python Bluetooth tests; native Electron checks for the Bluetooth dialog, six-language illustrated Guide, navigation and desktop/audio behavior. Theme checks cover all fifteen palettes, text contrast, persistence, offline reference state, radio outcomes and uninterrupted muted transmission. Bluetooth UI/protocol tests substitute hardware; physical validation is limited to the watch updates reported above.

The current visual refresh was inspected in native Electron without rerunning the earlier test suites or runtime self-tests; packaged file contents and SHA-256 checksums are checked during publication.

See the [Bluetooth guide](https://github.com/Gladiak/atomicClockSync/blob/main/docs/BLUETOOTH.md), [model catalogue](https://github.com/Gladiak/atomicClockSync/blob/main/docs/BLUETOOTH_MODELS.md) and [changelog](https://github.com/Gladiak/atomicClockSync/blob/main/docs/RELEASE_NOTES.md).
