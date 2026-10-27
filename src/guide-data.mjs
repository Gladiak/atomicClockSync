// Offline manual: original prose describing the implemented application.
export const MANUAL_GROUPS = {
  "start": "Start here",
  "signals": "Signals",
  "watches": "Watches",
  "explore": "Explore",
  "app": "App"
};
export const MANUAL_CHAPTERS = [
  {
    "id": "start",
    "title": "Getting started",
    "group": "start",
    "route": "sync",
    "purpose": "AtomicClockSync simulates station time codes through audio, records your watch experiments and explores time and space. No account is required.",
    "note": "The sidebar expands on hover or keyboard focus. Settings and Guide stay at its foot. Each manual chapter links to its section.",
    "body": [
      "The app brings two activities together: helping a compatible watch synchronize and understanding how time is measured. Signals contains transmission tools, Watches keeps your records, and Explore opens the scientific views.",
      "Begin with a single watch and a supported station. The app generates audio, while the watch performs its own reception. Keeping those roles separate makes the outcome meaningful: a finished countdown describes the transmission, and GET describes the result you observed."
    ],
    "example": "For a first attempt in Italy, a compatible watch might use DCF77 and ROM. Check your module manual, place the watch near a speaker and save the result to begin your own reception history.",
    "image": "sync"
  },
  {
    "id": "sync",
    "title": "Synchronize",
    "group": "signals",
    "route": "sync",
    "purpose": "Generate an audio simulation of DCF77, MSF, WWVB, JJY or BPC to help a compatible watch receive its time code.",
    "note": "Audio coupling depends on hardware. Completion is not proof of reception. Sleep, screen lock or output changes stop transmission; keep the tone away from your ears.",
    "body": [
      "This is the operating desk for a reception attempt. The large clock shows the selected station’s signal time; its reference label tells you whether the app checked time through NTP or is relying on an unverified system clock.",
      "The tone uses a fraction of the radio carrier and relies on output harmonics and electromagnetic coupling. Speaker, channel, distance and orientation all matter. Choose the duration before starting, keep the watch still and confirm success only after its own display reports reception."
    ],
    "example": "If one attempt ends in ERR, keep the same watch and station for the next attempt and change just its placement or one audio setting. The two recorded attempts then become useful material for Reception Lab.",
    "image": "sync"
  },
  {
    "id": "bluetooth",
    "title": "Bluetooth time update",
    "group": "signals",
    "route": "sync",
    "purpose": "Update a compatible Casio watch’s date and time over Bluetooth from the Synchronize screen. This mode is independent of audio transmission.",
    "note": "Bluetooth support is experimental and excludes Wear OS. “Time sent” means the write completed; check the watch. Cancelled writes can be uncertain, so check before retrying.",
    "body": [
      "Stop radio transmission, open Bluetooth and disconnect CASIO WATCHES. Put the watch in connection mode, select it as soon as it appears and choose Update time. Model-specific instructions and physical-validation status appear after selection. Open logs is always available, before or after any result. Read the recent session events, refresh them or choose Copy log to share a diagnostic report.",
      "The app reads the watch’s existing time configuration and obtains fresh NTP time immediately before sending date and time. Home City, DST rules, alarms and other settings are preserved. If the current watch UTC offset is unavailable, confirm its current offset including summer time, reconnect and update again."
    ],
    "example": "GA-B2100 / 5689: hold C for at least three seconds until CNCT flashes. GWG-B1000 / 5713: hold B for at least five seconds. GST-B1000D / 5748: hold B for at least 2.5 seconds until R. GW-9500 / 3553 has no Bluetooth; use radio synchronization.",
    "image": "bluetooth"
  },
  {
    "id": "reception-lab",
    "title": "Reception Lab",
    "group": "signals",
    "route": "reception-lab",
    "purpose": "Learn from recorded GET and ERR outcomes, compare configurations and prepare a repeatable next attempt for one watch.",
    "note": "Groups exclude missing snapshots, interrupted audio and variable volume. Small samples and manual notes cannot establish that a setting caused a result.",
    "body": [
      "A successful attempt becomes useful when you remember how it was achieved. The overview gathers your recorded results by watch and station, keeping unverified outcomes separate from the GET/ERR rate. Configuration groups show the conditions that were actually saved.",
      "Compare A/B puts two attempts side by side so differences become visible. Next trial takes a stable baseline and prepares a single audio change. It deliberately stops before transmission: you still check the physical setup and decide when to begin."
    ],
    "example": "Compare two attempts that used the same watch, station and position but different app volume. A GET after the change is an observation to repeat, not proof that volume alone caused the improvement.",
    "image": "reception-lab"
  },
  {
    "id": "signal",
    "title": "Inside the signal",
    "group": "signals",
    "route": "signal",
    "purpose": "Inspect the selected station’s simulated time code, current symbol, encoded fields and modulation envelope.",
    "note": "The diagram represents generated data, not received radio strength or a measurement at the watch. BPC compatibility is experimental; JJY uses the 60 kHz station.",
    "body": [
      "A watch receives a structured message rather than a spoken time. This view opens that message: the current symbol moves through the frame while the decoded fields explain which date, time and control information the selected protocol carries.",
      "The waveform and markers follow the generated envelope. They help you connect what the app emits with the station’s documented format, but they cannot tell you how much signal reached the watch. Changing stations can change frame length, markers and field meanings."
    ],
    "example": "Select DCF77, observe the advancing symbol and compare the encoded minute with the signal clock. Use the station specification below when you want the meaning of a particular field.",
    "image": "signal"
  },
  {
    "id": "profiles",
    "title": "My watches",
    "group": "watches",
    "route": "profiles",
    "purpose": "Keep separate identities and reusable audio settings for your watches, with model, home city and placement notes.",
    "note": "Manual notes do not change the watch or operating system. Temporary audio changes are saved to a profile only when you explicitly save it.",
    "body": [
      "A profile gives an experiment a stable identity. A watch name connects reception attempts and accuracy observations even when you later rename the profile. Notes preserve the details the app cannot discover, such as the watch’s home city or its position beside a speaker.",
      "Saving a profile captures the current audio configuration. Loading it restores those settings for another attempt, while later adjustments remain temporary until saved again. The last successful configuration offers a starting point drawn from a GET you confirmed."
    ],
    "example": "Keep one profile for a daily watch and another for a desk watch. Each can retain its preferred station and placement notes while its historical attempts remain separate.",
    "image": "profiles"
  },
  {
    "id": "watch-accuracy",
    "title": "Watch Accuracy",
    "group": "watches",
    "route": "watch-accuracy",
    "purpose": "Measure a watch’s signed offset and estimate its daily drift within periods separated by corrections.",
    "note": "Readings are manual. Corrections never create an assumed zero reading. Forecasts stop at corrections or seven days after the latest reading; errors and unreported resets affect estimates.",
    "body": [
      "An offset tells you how far the watch is from the reference at one instant. Drift describes how that offset changes across days. The graph keeps these ideas separate: points are your readings, the dashed line fits the selected period, and the current estimate is an extrapolation.",
      "A correction interrupts the story. Recording synchronization, adjustment or maintenance starts a fresh period without assuming the new offset is zero. This is especially important for a radio-controlled watch that may correct itself overnight. Readings and events remain editable in the journal."
    ],
    "example": "An offset of +3 seconds followed by +9 seconds three days later suggests about +2 seconds per day during that period. A later synchronization starts another period and needs a new measured baseline.",
    "image": "watch-accuracy"
  },
  {
    "id": "history",
    "title": "History",
    "group": "watches",
    "route": "history",
    "purpose": "Review immutable transmission snapshots and record what actually happened on the watch.",
    "note": "Profiles can change while earlier snapshots remain intact. Clearing history offers an immediate undo. A reported GET does not prove a zero-offset accuracy reading.",
    "body": [
      "History preserves the circumstances of each transmission, rather than just its final label. Opening a trial reveals the settings used, actual duration, reference information and any interruption or live volume changes. Earlier snapshots stay intact when a profile changes. Bluetooth attempts appear in the same timeline with model, module, duration, NTP reference and the app’s result. Sent, failed, cancelled and uncertain are distinct; Bluetooth entries do not contribute to radio GET/ERR statistics.",
      "The outcome belongs to your observation of the watch. You can record GET, ERR or leave it unverified, including after transmission has ended. Those choices feed Reception Lab. A linked GET can also propose an accuracy correction event for you to review before saving."
    ],
    "example": "If you notice GET only after the transmission finishes, open that trial and update its outcome. The laboratory recomputes the rate; the original audio settings and duration remain unchanged.",
    "image": "history"
  },
  {
    "id": "world",
    "title": "World View",
    "group": "explore",
    "route": "world",
    "purpose": "Explore an offline Earth, local solar times, station locations and the shared observing city.",
    "note": "City lights and coverage rings are illustrations, not live measurements or reception guarantees. The city is shared with Moon and ISS; previews never alter transmitted time.",
    "body": [
      "World View connects the clock to a place. Choosing a city establishes the observer used by the Moon and ISS views, while the map shows the moving boundary between daylight and night. Local clocks and solar times help explain why the same instant looks different around Earth.",
      "The timeline lets you explore another date without changing the transmitted time. Station markers and optional range rings add geographical context to reception. Their circles are nominal illustrations; they do not measure current propagation, buildings or the output hardware beside your watch."
    ],
    "example": "Choose Rome, compare a winter day with the June solstice and watch the daylight boundary change. Open Moon Observatory afterward: it uses the same observing city.",
    "image": "world"
  },
  {
    "id": "moon",
    "title": "Moon Observatory",
    "group": "explore",
    "route": "moon",
    "purpose": "Follow the Moon’s calculated phase, illumination, distance and local rising and setting for your observing city.",
    "note": "These are offline astronomical calculations. No event today means no rise or set on that local date; previews do not change the city’s real clock or the audio signal.",
    "body": [
      "The lunar disc is a calculated view of the Moon, accompanied by phase, illumination, distance and age. Altitude, azimuth and rise/set information place that Moon in the sky of your chosen city, rather than treating it as the same local view everywhere.",
      "Live follows the app’s current reference. Selecting an upcoming quarter phase or changing the UTC date opens an independent preview. This makes it possible to compare lunar appearances and local viewing times while keeping your real clock and any transmission unchanged."
    ],
    "example": "Select the next full-Moon event, inspect its preview and compare the local rise time with your observing city. Return to Live when you want tonight’s circumstances.",
    "image": "moon"
  },
  {
    "id": "iss",
    "title": "ISS Observatory",
    "group": "explore",
    "route": "iss",
    "purpose": "Explore estimated ISS motion, local sighting opportunities, station facts and educational time-dilation comparisons.",
    "note": "Predictions use orbital elements, not onboard telemetry. Old data limits forecasts; visibility excludes weather and obstacles. Public orbit requests occur while this section is open.",
    "body": [
      "Tracking places an estimated ISS position on an orbit and ground track. The data status is part of the observation: fresh orbital elements, cached prediction and a position-only report do not provide the same information. Their age matters when interpreting the display.",
      "Passes translates the orbit into encounters above your city, with a sky plot for direction and elevation. The other tabs describe the station and introduce time-dilation comparisons. An orbit preview is a teaching tool; it does not change the live time reference."
    ],
    "example": "Choose a predicted pass, inspect where it rises and its highest point, then check the data age. A geometrically promising pass can still be hidden by clouds, buildings or local terrain.",
    "image": "iss"
  },
  {
    "id": "light-travel",
    "title": "Light Travel",
    "group": "explore",
    "route": "light-travel",
    "purpose": "Discover how old the light reaching Earth is, with date-dependent travel times from the Moon, Sun and planets.",
    "note": "Distances are calculated offline and the drawing is compressed. Planet and Moon values cover the reflected light’s final leg to Earth, not its earlier journey from the Sun.",
    "body": [
      "Seeing a celestial body means receiving light that has already travelled. This section puts departure or reflection beside arrival at Earth, turning a distance into a delay. Choosing another date can change that delay because the bodies move.",
      "The travelling pulse replays one fixed observation. Real-time speed lets you feel the wait, while accelerated playback makes longer planetary journeys easier to follow. The drawing compresses space; the clocks carry the numerical meaning. The science panel explains what each distance includes."
    ],
    "example": "Start with the Sun and compare its emission clock with reception at Earth. Then choose a planet and jump six months: its changing geometry can produce a different light-time delay.",
    "image": "light-travel"
  },
  {
    "id": "time-machine",
    "title": "Time Machine",
    "group": "explore",
    "route": "time-machine",
    "purpose": "Visit 96 documented historical moments, or keep personal memories, future countdowns and time capsules.",
    "note": "Day-only events do not invent an exact historical hour. Capsules are local and unencrypted. Leaving a historical reconstruction ends the preview and never changes audio time.",
    "body": [
      "Historical journeys connect a dated event with a short story, an illustration and a source. Their elapsed counters respect the precision of the evidence: a documented calendar day is not presented as a known second. Exploring a moment reconstructs its clock without replacing the real present.",
      "The personal side uses the same relationship between an instant and its meaning. Memories look back, countdowns look ahead and capsules keep a message unrevealed until its chosen date. These records belong to this device, so include them in a full app-data backup."
    ],
    "example": "Explore an episode from relativity or spaceflight, follow its source, then return to now. For a personal milestone, create a countdown rather than adding it to the documented historical archive.",
    "image": "time-machine"
  },
  {
    "id": "back-in-time",
    "title": "Back in Time",
    "group": "explore",
    "route": "back-in-time",
    "purpose": "Enjoy a cinematic tribute to Back to the Future using familiar movie dates and playful time circuits.",
    "note": "This is a fan-made fictional experience. It does not simulate physical time travel or change your watch, computer clock or stored historical observations.",
    "body": [
      "This is the playful branch of Time Machine: the familiar destination, present and last-departed displays become a small cinematic set. The five film dates give the elapsed counters a story, while the 88 mph sequence changes the preview display.",
      "The visual trip is deliberately separate from the timing engine. You can enjoy the sequence and explore its destination while the real reference continues underneath. Returning to the present restores the normal display; no operating-system or watch setting travels with it."
    ],
    "example": "Choose the 2015 destination, start the sequence and compare the movie date with the real elapsed counter. Return to the present when the cinematic detour is over.",
    "image": "back-in-time"
  },
  {
    "id": "settings",
    "title": "Settings",
    "group": "app",
    "route": "settings",
    "purpose": "Configure audio output, signal waveform, time reference, interface language and visual theme.",
    "note": "NTP corrects time inside the app, not the system clock. Bluetooth can add latency or filtering. Some controls are locked during transmission; theme and language changes preserve audio.",
    "body": [
      "Settings separates the physical output path from the time reference. The selected device and waveform determine what leaves the computer; NTP information describes how the app checked its clock. Network uncertainty and audio latency are different parts of that path.",
      "The low-volume output test helps identify the selected channel before a transmission. Manual advance is for a measured correction, not a general way to improve reception. Language and theme change the interface immediately while keeping your personal notes, saved profiles and active audio independent."
    ],
    "example": "If you cannot hear the output test, verify the device, channel and operating-system volume before changing station settings. Leave manual advance at zero until you have a reason to measure it.",
    "image": "settings"
  },
  {
    "id": "troubleshooting",
    "title": "Troubleshooting",
    "group": "app",
    "route": "settings",
    "purpose": "Understand failed reception, missing devices and offline time before changing several settings at once.",
    "note": "The app cannot inspect reception on the watch. Record ERR or leave the result unverified. Test one change at a time and use Reception Lab to compare actual outcomes.",
    "body": [
      "A strong-looking indication is not the same as a decoded time message. L3 can coexist with ERR, and the app cannot inspect the watch’s receiver. Begin with compatibility and the physical setup before treating the outcome as a software problem.",
      "Use a consistent baseline to avoid changing several causes at once. Check city and DST settings, compare positions and keep a note of the output path. Full pauses provide an experimental DCF77 variant. If the app reports an interruption, start a fresh attempt after checking the reference."
    ],
    "example": "For repeated L3 then ERR, keep the station fixed and compare standard audio with full pauses. Record both actual outcomes and their placement notes, then inspect them together in Reception Lab.",
    "image": "settings"
  },
  {
    "id": "privacy",
    "title": "Data & privacy",
    "group": "app",
    "route": "settings",
    "purpose": "Understand local storage, network use and what to preserve before replacing a computer or clearing app data.",
    "note": "Accuracy exports do not back up the whole app and are not an import workflow. Personal capsules are unencrypted. Replacing the app does not normally clear its separate data folder.",
    "body": [
      "The app’s personal records live in its separate data directory, not inside the executable. Replacing a build normally keeps that directory, while clearing application data removes the records stored there. A useful backup therefore preserves the data folder as well as the app itself.",
      "Network use has specific purposes: NTP checks the reference and ISS retrieves public orbital information. Local astronomy, the historical archive and your journals do not require a cloud account. Reference buttons open their external source sites only when you choose them."
    ],
    "example": "Before moving to another computer, close the app and copy its full application data folder. Export the accuracy journal too if you want a readable JSON or spreadsheet copy, but do not treat it as a backup of profiles, capsules and reception history.",
    "image": "settings"
  }
];
