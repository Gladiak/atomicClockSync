# Bluetooth time synchronization

AtomicClockSync has a manual, independent Bluetooth Low Energy implementation
for **Casio date/time updates only**, excluding Wear OS (GSW/WSD). The same compact
Bluetooth dialog is used for every family. It selects a procedure from an explicit
model registry and the services actually exposed by the watch; it does not send
the GA-B2100 sequence indiscriminately to other models.

**Hardware evidence:** a user confirmed successful time updates on GA-B2100C /
5689 and **GWG-B1000 / 5713 (Mudmaster)** on macOS on 27 October 2026. The other
profiles are implemented and covered by synthetic GATT tests but still need
physical acceptance. A registry entry is not certification of compatibility.
Advertising identifies a family, not a verified module number or device identity.

## Using it

1. Open **Synchronize → Bluetooth** with radio transmission stopped.
2. Enable Bluetooth and allow the app to use it. Keep the watch nearby and
   disconnect CASIO WATCHES.
3. Start the watch's connection mode. **GA-B2100:** hold **C at least 3 seconds**
   until CNCT flashes. **GWG-B1000:** hold **B at least 5 seconds** until CNCT.
   Other models: follow the model's manual. The selected watch's instructions
   and validation status appear in the dialog.
   **GST-B1000D / 5748:** hold **B at least 2.5 seconds** for full connection,
   or **C about 0.5 seconds** for immediate time correction. Release at **R**;
   the seconds hand moves to **C** on connection, rather than showing CNCT.
4. Select the watch and choose **Update time**. Internet NTP is checked after
   the model-specific preparation, immediately before sending time.
5. Check the watch. “Time sent” means the Bluetooth write completed; it does not
   measure accuracy or certify the watch's reception/OK indication.

If the current watch offset cannot be decoded, the dialog asks for its **current
UTC offset including active summer time**. For example, Rome in winter is +01:00,
in summer +02:00. Select the value already configured on the watch, reconnect it
and update again. This is a calculation input, not a timezone-setting command.
There is no automatic computer-timezone assumption. A known offset read from the
watch takes precedence over a manual value. Search/select another watch to clear
that temporary choice.

Do not delete pairing or reset the watch for this app. It does not promise a
simultaneous connection with CASIO WATCHES. If connecting fails, disconnect the
phone app first and consult the watch manual. Multiband-only watches have no BLE
path and continue to use the radio feature.

## Procedures and compatibility

The complete explicit catalogue is in [BLUETOOTH_MODELS.md](BLUETOOTH_MODELS.md),
generated from `bluetooth/models.py`. All profiles except the reported GA-B2100
and GWG-B1000 remain experimental pending physical time-update tests. Complete
settings-preservation acceptance remains pending on every family.

**GST-B1000D / 5748:** Casio's product support links the 5748 manual. The
published Python/Kotlin reference assigns GST-B1000 to its standard two-slot
profile, but also has an erroneous 5631 module comment (5631 belongs to GST-B300).
A live module 5748 trace on 27 October 2026 accepted `1d00` and `1e00/01`
reads/unchanged echoes, then rejected the city-name query `1f00` with `ff81`.
Its full profile now requests only those three accepted records, omitting city
names. A subsequent real attempt completed the three reads/unchanged echoes,
obtained fresh NTP, wrote time `09` and disconnected without errors. The watch’s
OK indication and displayed date/time still need user confirmation,
and prefer a writable dedicated current-time service when exposed, including
when the full service is present as well. Do not infer an MTG second-dial sequence
from its analogue dial. Synthetic regression tests verify the restricted queries
and unchanged echoes, not success on the physical watch.

| Procedure | Examples | Time-only behavior |
| --- | --- | --- |
| Standard, two city slots | GA/GM/GBM/GMC/MRG-2100, **GWG-B1000**, GST except GST-B1000, ECB, Oceanus, Pro Trek | Existing DST/zone/city records read and echoed unchanged, then time `09` |
| Standard, six city slots | GW/GMW/MRG/GCW squares, GWR | Three DST states and six zone/city records, all unchanged, then time `09` |
| Without city-name register | **GST-B1000 / 5748**, EQB, GBD/GBX, ABL/F/BSA | DST/zone initialization without unsupported `1f` requests |
| Analogue | MTG-B1000, MTG-B3000/B3100 | Wrapped replies, model-specific `1f`/`24` home records, then time and the dedicated second-dial sequence |
| Dedicated current-time service | Casio models/connection modes exposing service `26eb0002…` or standard `1805`, with writable `2a2b` | Ten-byte Current Time write; read `2a0f` Local Time Information when available; no configuration echoes |
| SP/MIP | GW-BX5600, GMW-BZ5000 | Prefer dedicated current-time service. Full SP requires complete snapshots of existing DST, zones, city names **and coordinates** before any echo/time write |

**SP/MIP limitation:** published implementations synthesize location records and
may zero unused cities. That violates this app's time-only scope. Our SP adapter
reassembles bounded count/length-framed responses and reuses existing records,
including coordinates. Firmware that omits those records is refused before any
configuration/time write; use the dedicated time mode if offered. This is not a
claim that every SP firmware is already supported. Synthetic SP transcripts
verify preservation and rejection, not compatibility with real firmware.

**GWG-B1000 / 5713:** a real-device debug attempt on 27 October 2026 connected
and read/echoed a 15-byte `1d00` record, but the inherited six-clock sequence
timed out at `1d02` before sending time. Its profile now restricts initialization
to home/world time (`1d00`, `1e00/01`, `1f00/01`). A subsequent real attempt
completed these reads/unchanged echoes, obtained fresh NTP, wrote time `09`, and
disconnected normally. The user confirmed OK on the watch. This establishes one
time update on macOS, not timing accuracy or a full settings-preservation audit.

Older G-SHOCK+ generations (GB-5600/GB-6900), unknown models and new numeric model
extensions do **not** inherit an arbitrary full-protocol profile. Casio-named
unknown watches can be discovered, but only an actual dedicated current-time
service permits an update. Unsupported services/modes return a translated error.
Wear OS names GSW-* and WSD-* are explicitly excluded from discovery and syncing.

## Scope and time reference

Every configuration echo must match a snapshot from the current connection,
byte for byte. Model-specific queries are restricted to the time registers.
SP writes may repack records into the protocol's write frames but cannot change
record contents. Analogue profiles alone allow the two documented second-dial
sequence markers (`210001`/`210101`); they are not factory-reset or hand-alignment
commands. Only one explicitly authorized current-time packet is allowed per
session. No automatic retry follows a time write.

No alarms, timers, reminders, hand alignment, sensors, mission logs, location,
Home City, timezone or DST rule values are edited. Time correction naturally
changes dates and derived World Time displays. Existing stale timezone/DST rules
are retained, not updated to the computer's rules. Physical settings-preservation
acceptance is still required on each family.

NTP is obtained in Electron's main process only when the watch requests the final
time reference. The worker encodes the corrected epoch using a monotonic anchor;
references older than 30 seconds or with uncertainty over one second are rejected.
Bluetooth/OS scheduling latency is not bounded and subsecond precision is not
certified. There is no silent system-clock fallback.

Cancelling or losing a connection after time has been authorized is ambiguous:
check the watch before retrying. Closing, reloading, suspending, locking or
quitting stops the worker. Radio and Bluetooth operations are mutually exclusive.
Bluetooth results do not create radio GET trials or accuracy measurements.

## Native backends and distribution

The UI remains in Electron. A local worker uses **Bleak 3.0.2**, which selects
Core Bluetooth on macOS, WinRT on Windows, or BlueZ/D-Bus on Linux. No Web Bluetooth
experimental flags, local HTTP servers or remote Casio services are used.

Target current Electron-supported macOS versions, **Windows 11** (Bleak 3's
documented baseline), and Linux with **BlueZ >= 5.55**, an active system Bluetooth
service, D-Bus access and a BLE adapter. Linux AppImage/DEB/RPM have the same
native requirements. Earlier Windows releases are outside this dependency's
support contract. OS/adapter/permission behavior still needs physical testing
on each target platform.

The packaged app includes the worker, Python runtime and runtime dependencies;
end users do not install Python. macOS packaging declares
`NSBluetoothAlwaysUsageDescription`. Development launches may request Bluetooth
access for Terminal/the Python host instead of the packaged application.

Set up the development environment once:

```sh
python3 -m venv .venv-bluetooth
.venv-bluetooth/bin/python3 -m pip install -r bluetooth/requirements.txt
```

On Windows, use `.venv-bluetooth/Scripts/python.exe` for the second command.
`npm start` uses that project-local interpreter in development. No arbitrary
system interpreter is used as a fallback by packaged applications.

Build on **each target OS and architecture**:

```sh
npm run build:bluetooth
npm run pack
```

PyInstaller produces `build/bluetooth/<platform>-<arch>/atomic-bluetooth/`.
Keep the whole directory, including `_internal` and license notices. The package
hook rejects missing/outdated workers. For a cross-build, first copy a worker
built for the target OS/architecture into the corresponding directory; building
a Windows worker on macOS is not supported. Docker's Linux build creates its own
Linux worker. The manual GitHub Actions workflow builds native packages on all
three operating systems and verifies packaged sources and the bundled runtime.
Its optional `stage_release_tag` input uploads the five packages and checksums
only to an existing draft whose tag matches the exact workflow commit. It never
publishes the draft.

## Verification and sources

For a real-device failure, quit the running app and launch `npm run start:debug`.
Retry the Bluetooth operation. The console and a timestamped file under
`artifacts/bluetooth-debug/` record adapter selection, notification subscriptions,
requested time registers, reply lengths, write completion and failures. Tracing
is opt-in; configuration contents and device addresses are not part of the
protocol trace. Native driver error messages may contain device identifiers;
review the local log before sharing it. An `ERR` on the watch alone does not
identify which step failed.

```sh
npm test
python3 -m unittest discover -s test -p 'bluetooth_*.py'
npm run test:bluetooth
```

Protocol/worker tests substitute GATT; the desktop test uses real Electron and
preload with substituted Bluetooth/NTP. `atomic-bluetooth --self-test` checks the
frozen runtime/backend imports without opening the Bluetooth adapter. These
checks cannot establish hardware compatibility, watch accuracy, macOS privacy
prompts or Windows/Linux driver behavior.

Physical acceptance: test first connection and reconnection, compare date/time
with the app, verify home offset/DST, alarms, timer, reminders and other settings
before/after, cancel during scan/reads/write, disconnect the watch, and repeat in
the packaged app on macOS, Windows and Linux. Verify midnight, negative and
quarter-hour offsets, DST selections, and phone-app contention.

Protocol references (MIT; attribution in `bluetooth/LICENSE.gshock-api.txt`):

- [gshock_api](https://github.com/izivkov/gshock_api/tree/f15ba343f8b805ee209c1c30dab8fc9e82a52995),
  explicit model capabilities, standard/analogue/SP procedures, characteristic UUIDs and offset registers.
- [taviso/gshock_api](https://github.com/taviso/gshock_api/blob/c03734ae7ac6429e88b90530df0e497dc4259396/src/gshock_api/gshock_api.py),
  the same read/echo initialization with no city/DST modifications.
- [GShockAPI TimeIO.kt](https://github.com/izivkov/GShockAPI/blob/70399132d13d6db7dbd07a18163b48596354878a/api/src/main/java/org/avmedia/gshockapi/io/TimeIO.kt),
  ISO weekday numbering and fractional second encoding. The Python reference's
  zero-based weekday differs; this implementation follows the Kotlin encoder.
- [Casio module 5713 (GWG-B1000) manual](https://www.casio.com/content/dam/casio/global/support/manuals/watches/pdf/57/5713/qw5713_EN.pdf),
  connection mode: B held at least five seconds; Bluetooth time adjustment.
- [GST-B1000D product support](https://www.casio.com/in/watches/gshock/support.GST-B1000D-1A/)
  links the [official module 5748 manual](https://www.casio.com/content/dam/casio/global/support/manuals/watches/pdf/57/5748/qw5748_EN.pdf):
  B held at least 2.5 seconds for full connection; C about 0.5 seconds for immediate time correction.
- [Casio module 5689 time adjustment](https://support.casio.com/global/en/wat/manual/5689_en/UQIDSYzdrrraht.html).
- [Bleak](https://bleak.readthedocs.io/en/stable/).

- [Bluetooth SIG Assigned Numbers](https://www.bluetooth.com/wp-content/uploads/Files/Specification/HTML/Assigned_Numbers/out/en/index-en.html), standard Current Time service/characteristic identifiers.
