# Release notes

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
