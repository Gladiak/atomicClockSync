# Watch Accuracy measurement model

Watch Accuracy records human observations; it does not connect to, calibrate or automatically read a watch. The transmission and NTP engines are shared with the rest of the app. Opening this view adds no network requests; **Check time** explicitly invokes the existing NTP check and is disabled during transmission.

## Offset and periods

An offset is **watch time minus reference time**, in seconds. Positive is fast; negative is slow. Compare the same time zone. Display clocks offer device-local and UTC time, while every observation and correction is stored on a UTC epoch. Daylight-saving corrections and automatic radio corrections must be recorded by the user.

A synchronization, adjustment or maintenance event ends the preceding period and starts another. It contributes no offset measurement. A correction and a reading at the same timestamp place the reading in the new period. The first period can exist without a correction marker. Editing an event can change period boundaries; deleting it explicitly warns that adjacent periods merge. There is no automatic reset detection.

## Fit and presentation

A period needs at least two readings with an elapsed span of 86,400,000 ms before showing daily drift. The fit uses all readings in the period, with equal weights. Let `x` be elapsed UTC days since the first reading, and `y` the offset in seconds:

```text
slope = sum((x - mean(x)) * (y - mean(y))) / sum((x - mean(x))²)
baseline = mean(y) - slope * mean(x)
scatter = sqrt(mean((y - baseline - slope * x)²))
```

The initial offset is fitted rather than presumed zero. No readings are silently removed as outliers. Scatter is displayed only with three or more measurements: two readings define a line without independently describing its scatter. It is a descriptive RMS residual, not a confidence interval or a watch certification. Conditions are notes, not evidence of causation.

Rate display precision depends on observation span, declared reading step and recorded NTP uncertainty, capped at three decimal places. This is a display heuristic, not a complete uncertainty budget. Manual reaction time, transcription errors, unknown historical references and unreported resets can dominate. The label becomes **Observed trend** with at least three readings over seven days; this is a sample-description rule, not a reliability score.

A projection uses the fitted line, not a live connection or the last point alone. It is withheld for completed periods, future-dated latest observations and more than seven days after the latest reading. It never crosses a recorded correction. The graph displays measured points, their connecting path and the dashed fit for the selected period, with keyboard-accessible editing. Journal lists all periods for the watch.

## Reference provenance

**Capture current reference** freezes the observation timestamp and stores the contemporary reference state. A current NTP sample is accepted for capture only within its thirty-minute freshness window, with its corrected epoch, host and reported uncertainty. The uncertainty shown describes that NTP reference, not the human reading. An unverified system capture remains labelled as such. Manual/backdated observations are unverified. Changing a captured observation's date clears the previous provenance. Editing its offset or note at the same timestamp retains the recorded source.

A linked GET trial proposes a synchronization event at its recorded end time. The user reviews the actual correction time and saves it. The app never automatically adds a zero point, and the same trial cannot be linked twice for one watch. Trial snapshots and saved audio settings are not modified. If the trial is later removed from History, the journal's correction event remains a separate user-entered record.

## Local schema and exports

`atomic.accuracy.v1` contains `{version:1, entries:[...]}` in Electron localStorage. Each entry has an immutable UUID, profile ID, fallback watch name, UTC millisecond epoch, record type and personal note. Measurements additionally contain signed offset seconds, reading step, `manual-offset` method, reference provenance and optional conditions. Synchronization events can retain a source trial ID.

Profiles are linked by ID rather than name. Current names appear while a profile exists; removed profiles fall back to recorded names. Deleting a profile or clearing transmission history does not delete its accuracy journal. Removing a journal record is confirmed and supports one immediate undo; a failed storage write retains the existing archive and unsaved form. Unsupported or unreadable archives are not overwritten and can be exported as their original stored text for recovery.

JSON exports all periods of the selected watch and preserves personal text. CSV uses stable English column names/enum values, UTC ISO timestamps and decimal-point numeric values. Text cells that could be interpreted as spreadsheet formulas are prefixed with an apostrophe; JSON retains the original text. Neither export is an automatic import or restore mechanism. No data is sent to a server.
