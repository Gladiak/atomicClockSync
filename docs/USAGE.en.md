# Atomic Clock Sync — User Guide

[Project overview](../README.md)

This guide is the English translation and update of the original Italian manual.

AtomicClockSync is a **JavaScript and Electron desktop app** that synchronizes compatible Casio watches through Bluetooth or by simulating the time codes of five stations through audio. It uses a fixed **1100 × 740** window with separate compact views. The interface supports English, Italian, French, German, Spanish and Japanese. This is an independent implementation inspired by [Clock Wave](https://cw.rzapps.com/).

## Ready-to-use applications

Current version: **1.11.0**, refreshed on 27 October 2026 to include six additional themes. Download the individual packages and updated checksums from [GitHub Releases](https://github.com/Gladiak/atomicClockSync/releases/tag/v1.11.0); the filenames and version number are unchanged.

- macOS Apple Silicon: `release/mac-arm64/AtomicClockSync.app` or `release/AtomicClockSync-1.11.0-arm64-mac.zip`.
- Windows x64 portable: `release/AtomicClockSync-1.11.0-windows-x64-portable.exe`.
- Linux x64 portable: `release/AtomicClockSync-1.11.0-linux-x86_64.AppImage`.
- Debian/Ubuntu/Mint x64: `release/AtomicClockSync-1.11.0-linux-amd64.deb`.
- Fedora/openSUSE x64: `release/AtomicClockSync-1.11.0-linux-x86_64.rpm`.
- Integrity hashes: `release/SHA256SUMS.txt`.

The packaged apps include Electron and the Bluetooth/Python runtime and do not require Node.js or Python. On macOS, extract the app and open it or copy it to Applications. The Mac build has a local ad-hoc signature and is not notarized. Distribution with a Developer ID signature and notarization requires the appropriate signing credentials.

The Windows 11 x64 target requires a native Windows BLE worker built with the application on Windows. Physical Bluetooth and audio validation on a Windows desktop remain pending. It has no Windows digital signature. The portable executable requires no installation; profiles and history are stored in the local user profile rather than inside the executable.

On Linux, make the AppImage executable with `chmod +x` and launch it, or install the DEB with `sudo apt install './AtomicClockSync-1.11.0-linux-amd64.deb'`. For RPM, use `sudo dnf install './AtomicClockSync-1.11.0-linux-x86_64.rpm'` on Fedora or `sudo zypper install './AtomicClockSync-1.11.0-linux-x86_64.rpm'` on openSUSE. The Linux packages target Intel/AMD x64; ARM64 is not included. All platforms are distributed as individual downloads. Linux package contents and a real packaged UI have been checked on Ubuntu 22.04 x64 inside Docker with a virtual display and muted audio; physical audio and watch reception require a separate desktop test. RPM metadata and payload are verified; native RPM installation and desktop integration remain untested. The container test uses `--no-sandbox`; normal launch retains Chromium sandboxing.

## Stations

| Station | Location | Radio carrier | Audio tone | Time code | Example Casio home cities |
| --- | --- | --- | --- | --- | --- |
| BPC | Shangqiu, Henan, China | 68.5 kHz | 13,700 Hz · fifth harmonic | Beijing time, UTC+8; 20-second cycles | BJS / HKG |
| JJY | Haganeyama, Fukuoka area, Japan | 60 kHz | 20,000 Hz · third harmonic | JST, UTC+9; 60-second cycles | TYO |
| WWVB | Fort Collins, Colorado, United States | 60 kHz | 20,000 Hz · third harmonic | UTC; the watch applies its home city time zone | NYC / CHI / DEN / LAX |
| DCF77 | Mainflingen, Germany | 77.5 kHz | 15,500 Hz · fifth harmonic | CET / CEST; next minute | ROM / BER / PAR |
| MSF | Anthorn, Cumbria, United Kingdom | 60 kHz | 20,000 Hz · third harmonic | GMT / BST; next minute | LON |

Available home cities and automatic station selection depend on the Casio module. Check its manual. For a watch configured for Italy, **DCF77 is the suggested starting point**. Using a station from another region requires a compatible home city and can change the main time displayed by the watch. JJY currently supports the 60 kHz station, not the 40 kHz station.

**BPC compatibility is experimental.** Its binary/quaternary encoding, markers and parity are implemented and compared with recorded reference frames, but physical reception on watches has not been validated. Each of the five station choices has its own encoder and modulation envelope; selecting one changes the actual time code.

## First synchronization

1. In **Synchronize**, choose a station. The app updates the time zone, date, audio frequency, time code and suggested home cities. For DCF77, select a compatible European home city on the watch.
2. Click **Check time** for the NTP check. If the network is unavailable, the app can use the system clock and explicitly identifies it as unverified.
3. Place the antenna side of the watch, often the 12 o’clock side, approximately **1–5 cm** from a built-in speaker or **wired** earphone. Avoid Bluetooth and AirPlay because they can introduce latency and filtering.
4. Start manual reception following the watch module manual, then start transmission in the app. Begin with app volume around 30% and moderate system volume. The tone can be audible; keep it away from your ears.
5. Wait several complete minutes without moving the watch. Sessions contain 5, 10 or 15 complete minutes; initial alignment can add almost another minute. BPC transmits three 20-second cycles per minute.
6. Check the result on the **watch display**. Click **My Casio received** only after successful reception. The app cannot determine reception automatically.

During transmission, station, output device, waveform, channel, profiles and manual timing correction are locked. Volume remains adjustable once audio preparation finishes, and its changes are recorded in the trial. Press Escape to stop. Transmission can continue while navigating between views or using other applications.

## Bluetooth synchronization

Open **Synchronize → Bluetooth** with radio stopped. Keep the watch nearby,
disconnect CASIO WATCHES and enable the connection mode described in its manual.
Select the watch and press **Update time**. The app obtains fresh NTP time after
preparing the watch, sends date/time once and disconnects. There is no audio.

GA-B2100 / 5689: hold C at least 3 seconds until CNCT flashes. GWG-B1000 / 5713:
hold B at least 5 seconds until CNCT. GST-B1000D / 5748: hold B at least 2.5
seconds until R for the full connection, or C about 0.5 seconds for immediate
time correction; the seconds hand moves to C on connection. Instructions and
physical-validation status appear after selection. GW-9500 / 3553 has no BLE:
use its Multiband 6 radio mode.

Only date/time changes. Existing Home City, zones, DST rules, alarms, timers,
reminders, sensor settings and location records are preserved by the protocol.
If the watch’s current offset cannot be read, explicitly select its current UTC
offset including active summer time, reconnect the watch and update again.
The computer’s timezone is never silently substituted.

Check the watch after “Time sent”: this reports transport completion, not a
watch-level OK or accuracy measurement. An interrupted write can be ambiguous;
check before trying again. The app never retries time writes automatically.
Closing, locking, suspending or quitting cancels Bluetooth. Radio transmission
and Bluetooth are mutually exclusive. Bluetooth does not create radio GET trials
or journal measurements automatically.

Bluetooth **Update time** attempts now appear in **History** alongside radio
trials. Details show model/module, duration, reference and the app's outcome:
sent, failed, cancelled or uncertain. These records survive restarting the app;
an interrupted pending update becomes uncertain. Bluetooth entries do not count
toward Reception Lab's radio GET/ERR rates. Clear/undo covers both types.

**Open logs** is always available in the Bluetooth dialog, including after a
successful update. Its popup keeps the last 400 technical events for the current
app session. Use **Refresh log** or **Copy log** to inspect or share the report;
closing it leaves Bluetooth running. Addresses and setting payloads are excluded.
The report is cleared when you quit the app and is never uploaded automatically.

The support is experimental and independent of Casio. GA-B2100C, GWG-B1000 and GST-B1000
have physical time-update confirmations on macOS; other profiles still need
watch tests. Wear OS is excluded. Unknown models need an actual writable
dedicated time service; SP/MIP firmware that omits required settings snapshots
is refused. See [full Bluetooth scope and requirements](BLUETOOTH.md) and the
[129-profile model catalogue](BLUETOOTH_MODELS.md).

## Audio channels

In **Synchronize → Channel**, choose **Both**, **Left** or **Right**. The excluded PCM channel is set to zero; the active channel retains its amplitude.

**Settings → Test output** plays a low-volume 440 Hz tone through the selected channel. Use it to check how the logical output channels correspond to your physical speakers. Channel selection is locked during transmission.

## Watch profiles

Open **My watches** and create a profile with a name, model, home city, placement note and optional system-volume note.

**Save current settings** also stores the station, output device, channel, app volume, waveform, session duration and manual output advance. Home city, system volume and placement are manual notes: the app does not read or change those settings on the watch or operating system.

Select a watch from the toolbar in **Synchronize** to restore its profile. Further adjustments are temporary until you save that profile again. Profile deletion can be undone and does not delete existing trials.

A trial marked **GET** also saves the last successful configuration for its associated profile. Restore it from the profile card. If volume changed during the trial, restoration uses its final value; history retains the initial value, final value and changes.

If a saved output device is unavailable, the app selects the system output and shows a notice. The saved profile is not overwritten automatically.

## Navigation groups

The sidebar rests as a slim icon rail. Hover over it to reveal the complete menu; leaving folds it automatically after a short grace period. Keyboard focus also expands it, keeping the menu available while you navigate its controls. The edge chevron offers an explicit expand/collapse action. Settings and Guide stay visible above the version, outside the collapsible groups. Expansion overlays the page, preserving its width and position.

| Group | Views |
| --- | --- |
| Signals | Synchronize, Reception Lab, Inside the signal |
| Watches | My watches, Watch Accuracy, History |
| Explore | World View, Moon Observatory, ISS Observatory, Light Travel, Time Machine |
| Always-visible footer | Settings, Guide |

Headings have one icon and a short label. Click a heading to open its animated submenu; opening another folds the previous one. Click the open heading to fold all groups. This choice is saved in `atomic.sidebar.v1` and restored when you reveal the rail again. Folding the menu keeps the current page and audio running. Its group icon stays accented, with the current page in the tooltip.

Internal shortcuts select the destination group without forcing the rail open over your work. Trial details belong to History; Back in Time belongs to Time Machine. Group headings support Enter/Space, arrow keys and Home/End. Hidden submenus are inert and leave the keyboard order. Movement preferences are respected, including rail expansion and submenu animation. All groups fit without scrolling at the standard window size in the six supported languages.

## Application Guide

Open **Guide** from the sidebar footer for the complete offline application manual. Its chapter index covers Getting started, Synchronize, Bluetooth, Reception Lab, Inside the signal, My watches, Watch Accuracy, History, World View, Moon Observatory, ISS Observatory, Light Travel, Time Machine, Back in Time, Settings, Troubleshooting and Data & privacy.

Chapters explain the purpose and meaning of a feature in connected prose, followed by a concrete example and practical limitations. A real example screenshot appears in the current interface language. Click it for a larger view; close with the image’s close button or Escape. Escape in this preview closes the image without stopping a transmission. The rest of the app retains its usual Escape-to-stop behavior.

**Open section** navigates to the actual tool. The header’s **?** opens the chapter for the current section; trial details use the History chapter. Previous/Next and the chapter index support continuous reading. The last chapter is saved locally in `atomic.guide.chapter`; per-chapter scroll is remembered during the session. Language changes translate the whole explanation, examples, notes and screenshots, preserving the selected chapter. The reader and index scroll independently within the fixed window. Reduced motion is respected.

The 84 screenshots are captured from the real app with an isolated sample profile, never the user's records. They are bundled for offline reading. Use `npm run capture:guide` after interface/version changes to regenerate all fourteen views in six languages.

## Watch Accuracy

Create a profile in **My watches**, then open **Watch Accuracy** or press **Track accuracy** on the profile. Quartz, mechanical and radio-controlled watches can all use the manual journal.

1. Compare the watch with the reference display in the same time zone. The large clock uses the device time zone; UTC is displayed alongside it. Check the time first when possible.
2. Press **Capture current reference** at the comparison, then enter **watch − reference** in seconds: `+3` means three seconds fast; `−2` means two seconds slow. Decimal points and commas are accepted. Choose a 1-second or 0.1-second reading step to describe your reading resolution. Capture records a timestamp and reference snapshot; it does not read the watch or eliminate reaction error.
3. Optionally record wear/resting state, position, temperature and a personal note. Save the observation. The date field and journal timeline are UTC. Changing the observation date invalidates its captured reference provenance; backdated manual entries never acquire a current NTP check.
4. Return on another day. The app fits the period’s readings after at least two measurements spanning 24 hours. Seven days and three readings change the label from an early estimate to an observed trend, not to a confidence certificate. With three or more readings, scatter around the fit is shown; mixed reference checks are flagged.
5. Record confirmed synchronization, manual adjustment, automatic radio/DST correction or battery/maintenance as a correction event. Each starts a new period with an unknown offset until measured. Select a period above the graph; open **Journal** to see all records for the watch. Clicking a graph point edits its observation. Removing an event merges adjacent periods, with explicit confirmation and an undo option.

**Estimated now** is an extrapolation from the fitted line. It is available only for the latest period and no more than seven days after its latest reading; completed periods never project across a correction. Notes, human reading error and changing reference conditions limit interpretation. The journal does not automatically read the watch, adjust its rate, recommend conditions or measure it with a camera. Bluetooth time updates are a separate manual operation in Synchronize.

For a linked GET in **History → Details**, **Track accuracy** pre-fills a synchronization event. Confirm the actual correction time before saving. GET is your reception report and never proves a zero-offset measurement. Repeated insertion of the same trial is blocked. **Reception Lab** opens filtered to the selected watch.

**Export JSON / Export CSV** downloads the selected watch’s complete journal across periods, with UTC timestamps, references and conditions. JSON preserves personal text; CSV protects formula-like text when opened in spreadsheets. These are exports, not an import/restore workflow. Removed profiles retain their journals as archived watches. Data lives in `atomic.accuracy.v1`; an unreadable or unsupported archive is kept intact, blocks writes and offers **Export original data** for recovery. Export before clearing app data. See [technical details](WATCH_ACCURACY.md).

## Reception Lab

Use **Reception Lab → Overview** to filter saved trials by watch or station. GET percentage is GET divided by GET + ERR, using only the outcomes you entered. Unverified trials never count as failures. Configuration groups require a recorded snapshot, uninterrupted audio and constant app volume; different watches and unlinked attempts are kept separate. The list prioritizes verified sample size, not an automatic recommendation. Fewer than three verified outcomes are marked as a small sample.

**Compare A/B** highlights recorded differences and shows the actual transmission duration. Missing placement/system-volume notes, different watches, changing volume or interrupted audio prevent a clean interpretation. Open either trial's details to edit GET/ERR; returning to the laboratory recomputes the results.

In **Next trial**, choose a stable baseline and change volume, channel, waveform or selected duration. The proposed value must differ from the original and remain valid for the station. **Prepare audio settings** restores the baseline audio configuration with that single change and opens Synchronize. It does not start transmission or overwrite saved profile settings. Check the watch, physical output, placement and system volume manually before starting. A removed profile or unavailable output blocks preparation. After the attempt, record its outcome in History and compare it with the baseline.

The feature uses the existing local archive and adds no tracking or network requests. Default-output identity, manually noted conditions and differing actual durations limit what can be inferred from a group or comparison.

## Complete trial history

**History** keeps all recorded trials and displays eight per page. Open **Details** for the configuration snapshot, watch metadata and notes, output channel and device, actual and selected duration, time source, NTP offset and uncertainty, volume changes and reason for stopping.

You can assign **GET**, **ERR** or **Not verified** after transmission has ended and restore the settings from a previous trial. Finishing the countdown does not mean reception succeeded. Closing the window during transmission records an interrupted trial.

Renaming, editing or deleting a profile does not change earlier trial snapshots. Preferences and history from version 1.1 are migrated. Fields that older versions did not record remain marked as unavailable; the app does not invent historical audio settings. User-entered names and notes are preserved when upgrading to the English interface.

Older trials are not removed automatically. Errors writing to local storage are reported. Clearing the history can be undone immediately using the notice shown in the app.

## GW-6900: L3 followed by ERR

With Home City **ROM**, DCF77 is compatible. **L3 measures signal strength**, not successful decoding. **ERR** means the attempt failed; successful reception shows **GET**. The [Casio 3179 manual](https://www.casio.com/content/dam/casio/global/support/manuals/watches/pdf/31/3179/qw3179_EN.pdf) describes typical reception of 2–7 minutes and, in some cases, up to 14 minutes.

If L3 decreases when the audio stops, the watch is reacting to the transmission. That alone does not prove the pulses are decodable. For another attempt, choose **Settings → Audio profile → DCF77 · full pauses (experimental)**, select a 15-minute session, use ROM and DST AUTO on the watch, and leave manual output advance at 0 unless measured.

Start a new manual reception attempt after ERR; the previous attempt has already finished. If reception keeps failing, compare with a wired earphone, keeping the watch away from the computer body when possible.

The tests independently decode three continuous minutes of PCM for each sine profile, including the CEST/CET transition. They check pulse width, minute marker, time, date and parity. They do not measure the carrier physically produced by the speaker.

A user confirmed successful GW-6900 synchronization with DCF77 and built-in Mac speakers after version 1.1.3. Exact volume and placement were not recorded, so that result cannot be attributed solely to the full-pauses profile. The profile remains experimental. Temporary L3 drops do not necessarily prevent eventual reception.

## World View

Open **World View** for the offline vector atlas. It draws land and country boundaries without satellite textures, with astronomical day/night shading, graduated twilight and illustrative amber city lights.

- **Live:** follows the same NTP-corrected time reference as the app, or explicitly marked system time when offline.
- **Preview:** select a UTC date between 1900 and 2100 and scrub its 24 hours. The main UTC clock and the city clock always identify the time being explored. Preview does not alter the audio engine, watch profiles, operating-system clock or transmission time.
- **Play:** advances one simulated day per real minute. Pause with the same button. Playback pauses when you leave World View and does not catch up after the app has been hidden. **Live** returns to the present.
- **Seasonal presets:** March/September equinoxes and June/December solstices are calculated for the displayed UTC year. Hover over a preset for its event time. Month-based names apply in both hemispheres.
- **Twilight lines:** toggle boundaries at solar altitudes 0°, −6°, −12° and −18°. The shaded transition remains visible when lines are hidden.

### Cities

Type at least two characters in **Find a city**. The catalog contains 171,637 localities from GeoNames and is loaded into a dedicated worker only when the search field is first focused. It includes coordinates, IANA time zones, region/country names and a bounded set of native and alternative spellings. Accents are normalized. Results show region and country to distinguish homonyms. Use the arrow keys and Enter, or click a result. Escape closes results.

The selected city's clock, sunrise, sunset and daylight duration follow its local calendar day and daylight-saving rules. Sunrise/set use standard atmospheric refraction at sea level; weather, terrain and buildings are not modeled. Polar day/night are shown explicitly rather than inventing event times. The city clock's date and IANA zone appear below it.

City selection is local to World View and does not set the Casio's Home City or modify a watch profile. The city, coverage mode and twilight-line setting persist. Preview time and playback do not persist; reopening the app starts in Live mode.

The approximately 20 MB search catalog is separate from the 18,650 geographically grouped light points. Lights appear gradually through twilight and stay amber in all fifteen themes. Their intensity is an illustration based on settlement population, not measured urban brightness or a real-time observation.

### Stations and range rings

Click a station marker, use its keyboard focus and Enter/Space, or use the station tabs. The station card shows frequency, local station time and great-circle distance from the selected city. **Use station** explicitly applies it to the transmission settings and returns to Synchronize. It is disabled during transmission; map exploration remains available.

**Coverage → Off / Selected / All stations** controls the range overlay. Rings follow approximate Casio module 3179 reception ranges: DCF77/MSF 1,500 km, WWVB 3,000 km, JJY 60 kHz 1,000 km and BPC 1,500 km. They are static geographic references for the real towers, not field-strength contours, live station-status information or predictions of watch reception. They do not describe the range of the app's local audio output.

The map, search and astronomical calculations work offline. Rendering stops when World View is not visible. Data sources, license notices, modifications and rebuild instructions are documented in [Third-party data and software](THIRD_PARTY.md).

## ISS Orbital Observatory

Open **ISS Observatory** in the sidebar. Its four tabs share your observing city with World View; click the city name to change it. The city coordinates and pass calculations stay local.

### Tracking

The map shows a schematic ISS marker, a previous 45-minute and next 90-minute **modeled** ground track, day/night shading and an optional geometric horizon footprint. The footprint is the area where the station is above a flat local horizon, not a radio-service area or a guarantee of optical visibility. The craft drawing is illustrative, not a measurement of attitude or solar-panel orientation.

The side panel shows altitude, orbital speed (km/h and km/s), mean orbit period, inclination, modeled sunlight/shadow, orbits per day and northbound/southbound ground-track motion. Orbital speed is not ground speed. Country labels use the bundled Natural Earth map; an ocean position is reported as "the ocean" rather than assigned a nearby city.

The lower cards show the observer's local time, geometric slant distance, distance along Earth's surface, azimuth/cardinal direction, elevation and the next potentially visible pass. Negative elevation means the ISS is below your horizon, even if it is sunlit.

**Explore orbit** previews −45 to +90 minutes relative to the app time; a selected future pass can also be previewed at its peak. **Live** returns to the present. Preview does not change NTP, the operating system clock, watch profiles or audio transmission. Controls requiring orbital elements are unavailable in report-only or stale-data mode.

### Connectivity, caching and accuracy

- **Online · predicted:** a public HTTPS source has responded; the moving position is calculated from orbital elements with SGP4.
- **Offline · predicted:** the services are unreachable, but cached elements remain within the propagation limit. This can also mean a provider outage, not necessarily a disconnected computer.
- **Online · report / Last report:** an API position is available without a usable orbit. The marker is a timestamped report, not a continuously propagated position. Reports older than 30 seconds are not displayed as current tracking.
- **Stale orbit / Unavailable:** no usable current state. The app does not invent an ISS position or continue predictions indefinitely.

The source bar shows the orbit epoch separately from the latest successful HTTPS check. Elements more than 24 hours old are marked aging; older than **72 hours**, or over two hours in the future relative to the app reference, they do not drive current tracking. Predictions also stop at epoch +72 hours. These are conservative product limits, not a guarantee of positional accuracy. Reboosts and drag can reduce forecast accuracy.

The main process retrieves only allowlisted HTTPS endpoints with a response-size limit, schema/spacecraft validation and a timeout. It coalesces concurrent requests and caches GP downloads for at least two hours, including across app restarts. A checksummed ISS TLE is the fallback when the CelesTrak GP endpoint fails. Position reports are requested at most every ten seconds while the section is visible, with exponential backoff and server Retry-After handling. Rendering and polling pause when the section is hidden; no background monitoring or notifications are scheduled.

The cache is `iss-cache.json` in the Electron app data directory. No API keys, accounts or automatic geolocation are needed. The app's NTP/system-clock reference still determines the time used for calculations; a wrong reference also affects orbital estimates.

### Passes and sky diagram

Predictions cover up to the next 48 hours, clipped by the orbit-validity limit. Passes begin and end at **10° elevation**, not at the geometric horizon. The **Potentially visible only** filter requires the ISS to be almost fully sunlit and the Sun to be at or below **−6°** at the observer. These simplified criteria do not include clouds, terrain, buildings or spacecraft brightness/attitude.

Filtered rows start at the first estimated visible interval. The detail panel separately reports the complete above-10° interval, whole-pass peak and visible intervals. Switch off the filter to see geometric passes that may occur in daylight or Earth's shadow. Five rows per page keep the fixed window free of scrolling.

Select a row to show the sky plot: north is up, east right, the outer circle is the horizon, and the centre is the zenith. The dashed line is the geometric pass; the cyan section meets the visibility criteria. The amber dot marks the start and the pale dot the whole-pass peak. **Preview on the map** shows its predicted orbital position at the peak. All pass times use the selected city's IANA time zone, including daylight-saving changes.

### Station and Time in Orbit

**Station** offers a vector schematic and dated/background facts, with explicit external links for current crew/visiting vehicles and official live video. Crew counts or video availability are not fabricated from orbital elements.

**Time in Orbit** separates the first-order gravitational contribution from the special-relativistic velocity contribution for an ideal orbital clock compared with a non-rotating sea-level reference. The sum is shown in microseconds per Earth day, with a six-month constant-orbit illustration. When tracking is unavailable, the card explicitly uses an illustrative 420 km, 7.67 km/s orbit. Earth rotation, geoid variation, higher-order corrections and actual hardware clock behaviour are omitted. It does not measure clock offsets, adjust transmitted time or receive ACES data.

The ACES introduction describes the PHARAO caesium clock and SHM hydrogen maser installed on Columbus, and links to the ESA mission page. Full sources and license notices are in [Third-party data and software](THIRD_PARTY.md#iss-sources-and-orbit-software).

## Light Travel

Open **Light Travel** to explore the Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus and Neptune. Select a source in the orbital scene or the cards below. The main counter shows the age of its light arriving at Earth; the two UTC clocks show departure/reflection and reception. Distances and light times change with the selected date.

**Follow this light** reconstructs one fixed observation. Choose real time (1×), 10×, 100×, 1000× or an overview lasting at most twelve seconds. Pause/resume or change speed at any point. The photon trail ends in an arrival ripple; **Replay this light** repeats the same observation. Playback pauses when the section or window becomes hidden. Reset returns to the current live or preview observation.

Use the UTC date/time fields for an independent preview between 1900 and 2100. **+6 months** preserves the time and clamps the day to the destination month's last day; **Live** restores the app time reference. These controls leave watch transmission and settings unchanged.

Calculations work offline using Astronomy Engine and body-centre positions corrected for light travel. For the Moon and planets, the departure clock is the reflection time: the earlier journey from the Sun is excluded. The orbit diagram compresses distances and uses illustrative sizes. Surface location, atmospheric effects and actual sky visibility are not modelled. **Science & sources** explains these conventions and links to NASA and JPL. Reduced motion replaces the moving photon with numeric progress.

## Moon Observatory

Select **Moon Observatory** in the sidebar. It uses the city selected in World View and shared with ISS Observatory. Click the city name to choose a different location. The local clock, moonrise/moonset and four upcoming quarter-phase times use that city's time zone, including daylight-saving changes. A missing moonrise or moonset is shown as **No event today**; the app does not substitute an event from another day.

The main display shows calculated phase, illuminated fraction, Earth-centred distance, age since the most recent new Moon, apparent altitude and azimuth measured clockwise from north. **Above your horizon** describes geometric placement, not optical visibility. Terrain, buildings, weather and local atmospheric variations are not modeled. The disc uses original procedural terrain with a schematic phase orientation: waxing is lit on the right, waning on the left. It does not reproduce actual lunar terrain, libration, eclipse shadows or the apparent orientation through a telescope.

Click an upcoming phase to preview its instant, use the UTC date and time-of-day slider, or move one day with the arrows. **Live** restores the app's current NTP/system time reference. A preview is kept in memory while switching views, but does not persist after restarting the app. Supported dates are 1900–2100. All calculations run offline; rendering and timers stop while the section is hidden.

## Time Machine

Select **Time Machine → Historical journeys** to browse 96 documented events. Search titles, dates or places, or filter by Space / Astronomy / Time science / Discovery / Clocks & calendars. Each event has an original illustration, a story, a documented date and a button that opens its primary source externally. **Explore this moment** previews the historical clock; **Return to now** restores the real reference. Leaving the section ends this reconstruction. The elapsed counter always uses the real present.

Records carry an explicit precision. Date-only records count UTC calendar-day boundaries and do not show hours or seconds. Approximate times are marked and rounded to elapsed minutes; minute-resolution records omit seconds. Second-resolution events retain seconds. Counters follow JavaScript UTC time with 86,400-second days and do not model leap seconds.

**My moments & capsules** lets you create, edit and delete up to 100 keepsakes. All entered dates/times are explicitly UTC; they are not interpreted in the computer's local zone. Ordinary moments can be in the past or future, with a count-up or countdown. A new capsule requires a message and a future opening date. Its message and edit action remain hidden/disabled until that date, using the real app clock. The message then becomes readable while the view is open or the next time you return. Deletion asks for confirmation inside the card.

Keepsakes are stored in localStorage under `atomic.moments`, alongside existing preferences. They are not encrypted, synced or protected from someone inspecting local storage or changing the device clock. A capsule is a personal keepsake, not a security boundary. No background service or notification is required. The **Back in Time** button opens the film circuits; **Historical journeys** returns here. Both historical and lunar previews leave actual transmission and watch settings unchanged.

## Back in Time

Select **Time Machine → Back in Time** to enter the Hill Valley laboratory. Select one of five movie dates to load the red **Destination Time** circuit and show a live elapsed-time counter. Each destination card also shows its elapsed days. Durations are actual elapsed 24-hour days, followed by hours, minutes and seconds, rather than calendar anniversaries.

The green **Present Time** starts with the app's current time reference. **Let’s hit 88 MPH** charges the flux capacitor and jumps the green display to a cinematic preview of your chosen date, while the amber **Last Time Departed** records where you left. Click **Explore this date** after arrival, then **Return to the present** to restore the live display. Before your first trip, the amber display is a decorative preset of Einstein's return in 1985. The elapsed counters always use the real app time, even during a preview.

All movie circuits use **America/Los_Angeles**, the California time zone used for fictional Hill Valley, independently of your computer or station time zone. The 5 November 1955 destination uses the time-circuit setting of 06:00, rather than the later arrival time in the story. Navigation away cancels a jump that is still charging. The preview is kept only in memory; reopening the app starts in the present. Rendering pauses while the section is hidden. Reduced-motion mode skips acceleration and goes straight to the arrival screen.

This offline fan tribute has no effect on NTP, audio transmission, watch profiles or system time. No film images, recordings or music are included. The **Film chronology** reference opens externally.

## Themes and compact interface

Choose **Settings → Language** to switch between English, Italiano, Français, Deutsch, Español and 日本語. The selection is saved locally, independently of watch profiles. Changes apply immediately, including native menus, without restarting or interrupting transmission. Dates and numbers follow the interface language; time zones and encoded station time are preserved. Watch names, placement notes, personal memories and capsule messages are never translated. Place names retain their source spelling. Japanese glyphs are available offline through the bundled Noto Sans JP font. Settings panels can scroll when longer text needs more room.

Choose a palette in **Settings → Theme**:

| Theme | Accent | Appearance |
| --- | --- | --- |
| Lime Green | `#D5FF40` | Original dark theme |
| Cyan Blue | `#29ABE2` | Dark blue and cyan |
| Fuchsia Pink | `#FF096C` | Dark blue gray and fuchsia |
| Ruby Red | `#D60235` | Dark blue black and red |
| Champagne Gold | `#FFDB89` | Dark charcoal and gold |
| Seafoam Teal | `#7BA7AF` | Dark gray green and teal |
| Amethyst Purple | `#9A6FB7` | Dark purple, cream and pink |
| Lava Orange | `#F27D16` | Dark forest green, moss and orange |
| Soft Sage | `#B8C8A0` | Original dark base with pastel sage accents |
| Powder Blue | `#A9C9E8` | Original dark base with pastel blue accents |
| Soft Lavender | `#C4B5E2` | Original dark base with pastel lavender accents |
| Warm Sand | `#D8C7AB` | Original dark base with pastel sand accents |
| Rainbow | `#455DDC` + violet, mint, orange, pink | Original dark base with functional color roles |
| Rainbow Soft | `#A9B8F0` + pastel violet, mint, peach, rose | Original dark base with softer functional accents |
| Atlantic Blue | `#1A344D` | Light seafoam gray and blue |

Palettes cover backgrounds, panels, text, fields, buttons, indicators and graphs. The four pastel themes preserve the original dark background, panels, text and borders, changing only the accent color. Rainbow and Rainbow Soft keep that same dark base, using blue for actions, violet for data/graphs, mint for the reference and confirmations, orange for transmission/progress and pink for errors. Labels still distinguish confirmed reception, sent Bluetooth writes and uncertain outcomes. Some accents have a lighter text variant to retain contrast at small sizes. Select arrows follow the palette and keep their right-side spacing. The theme applies immediately, is saved separately under `atomic.theme`, and is restored before the page paints. It can change during transmission without changing audio settings. The application icon retains its original lime color.

The window cannot be resized, maximized or switched to full screen. Separate views keep content compact:

- **Synchronize:** watch and station selection, clock, envelope, start/stop, volume, channel and duration.
- **My watches:** profiles, notes and restoration of the last successful settings.
- **Inside the signal:** complete time code, current symbol, fields and parity. BPC displays 20 symbols; MSF displays A/B pairs.
- **Watch Accuracy:** manual offset journal, drift estimates, correction periods and per-watch exports.
- **Reception Lab:** per-watch results, configuration groups, A/B comparison and preparation with one audio-setting change.
- **History:** all trials, pagination and separate details, editable outcomes and undoable clearing.
- **World View:** day/night atlas, offline city search, station range rings and seasonal timeline.
- **ISS Observatory:** tracking, local passes and sky diagram, station background and educational time in orbit.
- **Light Travel:** nine light sources, offline light-time estimates, UTC previews and a controllable photon journey.
- **Moon Observatory:** calculated lunar phases, local moonrise/moonset, upcoming quarters and independent time preview.
- **Time Machine:** sourced historical journeys, personal memories and locally stored time capsules; also opens Back in Time.
- **Back in Time:** movie time circuits, live elapsed counters and a cinematic 88 mph jump.
- **Settings:** output device, test tone, waveform, manual timing correction, NTP diagnostics and theme selection.
- **Guide:** seventeen illustrated narrative chapters, practical examples, contextual help and full text/screenshots in six languages.

## Running from source

Requires **Node.js 22.12 or later** and npm.

```sh
npm ci
node node_modules/electron/install.js
npm start
```

The runtime download is an explicit step for the Electron version used here. Dependency versions are locked in `package-lock.json`. No web server is needed.

## Encoding and audio

- **DCF77:** BCD, three even parity groups, Europe/Berlin time and the A1 DST-change announcement. Amplitude drops to 15% for 100/200 ms; second 59 has no reduction.
- **JJY:** BCD, day of year, year, weekday, and hour/minute parity. High amplitude for 800/500/200 ms for 0/1/marker, followed by 10% amplitude. A full AM time code is generated even at minutes 15 and 45; Morse station identification is not reproduced.
- **WWVB:** legacy AM code containing UTC, day of year, leap-year status and US DST flags. A 17 dB reduction lasts 200/500/800 ms. DUT1 is simulated as zero; modern phase modulation is not reproduced. DST flags follow the current US rules in effect since 2007.
- **MSF:** two A/B bits per second, four odd parity groups, a minute identifier and GMT/BST status, including the DST-change announcement during the preceding 61 minutes. Modulation is on/off with a 500 ms minute marker. DUT1 is simulated as zero.
- **BPC:** binary fields in 19 quaternary symbols after a marker with no reduction. Symbol reductions last 100/200/300/400 ms at 10% amplitude. Fields include the 0/20/40-second cycle index, AM/PM, split seven-bit year and two even parity groups. ISO weekday numbering is used: Monday 1 through Sunday 7. Physical compatibility is experimental.

The AudioWorklet generates stereo samples at 48 kHz independently of interface timers. Reported output latency is compensated, and a manual correction in milliseconds is available. Displayed NTP uncertainty **does not measure actual audio latency**.

The default waveform is sine. The experimental square waveform may produce more audible aliased components. DCF77 also offers the experimental **full pauses** sine profile: it completely silences the first 100/200 ms while keeping second 59 continuous. The graph follows the chosen audio profile. The time code is unchanged; the reference radio envelope remains 15%. Switching to another station restores the standard sine profile.

The audio output **does not directly generate a 60–77.5 kHz RF carrier**. It plays a tone at a fraction of that frequency. Physical harmonics and electromagnetic coupling depend on the speaker or earphone electronics. Reception may fail even when the encoded time is correct. Automated tests do not verify physical reception on a Casio.

Leap seconds and their announcements are not simulated. Weather and public warning payloads are not reproduced.

## Time reference, lifecycle and local data

The app queries `ptbtime1.ptb.de`, `ptbtime2.ptb.de` and `time.cloudflare.com`, validating the peer, nonce, packet format and latency. It selects the lowest uncertainty among agreeing replies. NTP uses UDP/123 without NTS authentication.

The correction stays inside the app and does not change the operating system clock. The reference is refreshed after 15 minutes while idle and marked as needing another check after 30 minutes.

During transmission, automatic sleep is prevented. Manual sleep, screen locking, audio suspension and output-device changes stop the session. The renderer is isolated and sandboxed, without Node.js access or remote page content.

Preferences, theme selection, profiles and history stay local. There is no telemetry. On macOS, data is stored under:

```text
~/Library/Application Support/Atomic Clock Sync/
```

Electron `localStorage` is kept in `Local Storage/leveldb` inside that directory. Close the application before copying the entire app data directory for backup. Replacing the app or cleaning `release/` does not remove user data.

## Tests and builds

```sh
npm test                 # 86 protocol, PCM, profile, orbit, light-time, reception/drift statistics and localization checks
npm run test:desktop     # Real Electron and AudioWorklet; audio muted
npm run test:guide        # Whole manual, localized screenshots, pinned utilities and audio isolation
npm run capture:guide     # Real screenshots with an isolated sample profile in six languages
npm run test:accuracy     # Offset measurements, period boundaries, GET links, exports and UI
npm run test:reception-lab # Honest rates, filtering, A/B, preparation, languages and themes
npm run test:languages   # Six languages, layout, Japanese font, persistence and live audio
npm run test:world       # Offline atlas, search worker, timeline and audio isolation
npm run test:iss         # ISS network states, passes, fifteen themes and audio isolation
npm run test:light-travel # JPL-referenced light times, replay, previews, languages and themes
npm run test:observatory  # Moon phases, historical journeys, capsules, themes and audio isolation
npm run test:back-in-time # Movie dates, jumps, layout, reduced motion and audio isolation
npm run build:iss        # Rebuild the bundled JavaScript SGP4 library
npm run build:world      # Rebuild the local map and astronomy bundle
npm run pack             # Unpacked application
npm run dist             # macOS ZIP
npm run dist:win         # Windows x64 portable; native NSIS toolset configured
npm run dist:linux       # Linux x64 AppImage + DEB + RPM; requires Linux
npm run dist:linux:docker # Isolated Linux x64 build using Docker
npm run checksums        # Hash current-version individual packages; requires Python 3
npm run checksums -- --github # Match GitHub's download filenames in SHA256SUMS.txt
```

The desktop test uses a temporary profile. It checks all fifteen themes, selected text contrast ratios of at least 4.5:1, persistence, invalid saved-theme fallback, live theme changes and separation from audio settings. It also verifies isolation, fixed window size, all views and FAQs without overflow, the five station selections, channel/profile locking, profile CRUD and undo, settings restore, immutable history, GET/ERR updates, legacy migration, output tests, volume changes, offline fallback, window closing and sleep interruption.

Screenshots are written to `artifacts/`. The app and Bluetooth worker were checked on macOS; the Linux worker was also built and self-tested in Docker. The 1.11.0 downloadable package set is published on GitHub Releases and refreshed with the new themes. Native platform builds use the manual GitHub workflow, which checks packaged source/assets and the bundled Bluetooth runtime on each OS. Linux desktop audio hardware and native RPM installation have not been tested.

## Technical references

- [DCF77: PTB specification](https://www.ptb.de/cms/en/ptb/fachabteilungen/abt4/fb-44/ag-442/dissemination-of-legal-time/dcf77/dcf77-time-code.html)
- [JJY: NICT specification and diagrams](https://jjy.nict.go.jp/jjy/trans/index-e.html)
- [WWVB: NIST time-code format](https://www.nist.gov/pml/time-and-frequency-division/time-distribution/radio-station-wwvb/wwvb-time-code-format) and [NIST Special Publication 432, Appendix C](https://tf.nist.gov/general/pdf/85.pdf)
- [MSF: NPL specification, March 2019](https://www.npl.co.uk/getattachment/2afd4c3b-fc8d-486c-b2b9-fc9a5a66394c/msf-time-date-code-2019.pdf)
- [BPC: technical description and Figure 5, CN109085615A](https://patents.google.com/patent/CN109085615A/en)
- [BPC: original recording of three decoded frames, Jinan, 10 January 2026](https://commons.wikimedia.org/wiki/File:10-Jan-2026,_16h34m39s_-_16h35m21s,_BPC_68.5kHz,_Received_in_Jinan,_Shandong,_China.oga)
- [ITU-R TF.2487: descriptions of national radio services](https://www.itu.int/dms_pub/itu-r/opb/rep/R-REP-TF.2487-2021-PDF-E.pdf)
- [Casio module manuals](https://support.casio.com/en/manual/manuallist.php?cid=009)

Not affiliated with Casio, PTB, NICT, NIST, NPL, NTSC or Clock Wave. Licensed under the [MIT License](../LICENSE).
