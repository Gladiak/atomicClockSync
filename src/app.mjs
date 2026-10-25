import { STATIONS, getStation, stationTime, stationFrameAt, audioEnvelope, symbolLabel, symbolDescription } from './stations.mjs';
import { SignalEngine, testOutput } from './audio-engine.mjs';
import { THEMES, applyTheme } from './themes.mjs';
import { createWorldView } from './world-view.mjs';
import { createIssView } from './iss-view.mjs';
import { DEFAULTS, CHANNEL_LABELS, WAVE_LABELS, normalizePreferences, normalizeProfiles, normalizeHistory, watchMetadata, createSnapshot, createTrial, successfulConfiguration } from './trials.mjs';

const $ = id => document.getElementById(id);
const desktop = window.desktop;
const engine = new SignalEngine();
const pad = value => String(value).padStart(2, '0');
let dateFormatter;
const historyFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
function readSaved(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
const selectedTheme = applyTheme(readSaved('atomic.theme', 'lime'));
for (const theme of THEMES) $('theme-select').append(new Option(theme.name, theme.id));
$('theme-select').value = selectedTheme;
$('theme-select').addEventListener('change', event => {
  const id = applyTheme(event.target.value);
  event.target.value = id;
  persist('atomic.theme', id);
});
const preferences = normalizePreferences(readSaved('atomic.preferences', DEFAULTS));
let profiles = normalizeProfiles(readSaved('atomic.profiles', []));
let activeProfileId = readSaved('atomic.activeProfile', null);
if (!profiles.some(p => p.id === activeProfileId)) activeProfileId = null;
let editingProfileId = activeProfileId;
let history = normalizeHistory(readSaved('atomic.history', []));
let historyPage = 0;
let selectedTrialId = null;
let anchor = { epoch: Date.now(), mono: performance.now() };
let reference = null;
let session = null;
let busy = false;
let syncing = false;
let toastTimer;
let lastSecond = -1;
let currentFrame;
let lastWallCheck = { wall: Date.now(), mono: performance.now() };
const worldView = createWorldView({ getNow: now, getStationId: () => preferences.stationId,
  isTransmitting: () => Boolean(session) || busy, persist, notify,
  getReference: () => reference ? `${now()-reference.nowMs<30*60000?'NTP':'NTP check needed'} · ${reference.host}` : 'System clock · unverified',
  useStation: id => {
    if (session || busy) return;
    $('station-select').value = id;
    $('station-select').dispatchEvent(new Event('change'));
    navigate('sync');
  } });
const issView = createIssView({ getNow: now, getObserver: () => worldView.getCity(), desktop, notify,
  chooseCity: () => { navigate('world'); $('world-city-search').focus(); } });

function now(mono = performance.now()) { return anchor.epoch + mono - anchor.mono; }
function persist(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { notify('Local storage is full or unavailable. The latest changes were not saved.', true); return false; }
}
function savePreferences() { persist('atomic.preferences', preferences); renderProfileSummary(); }
function saveProfiles() {
  const saved = persist('atomic.profiles', profiles);
  const selected = persist('atomic.activeProfile', activeProfileId);
  return saved && selected;
}
function notify(message, error = false) {
  clearTimeout(toastTimer);
  $('toast').textContent = message;
  $('toast').classList.toggle('error', error);
  $('toast').hidden = false;
  toastTimer = setTimeout(() => { $('toast').hidden = true; }, error ? 9000 : 6500);
}

function navigate(page) {
  const titles = { sync: ['Sync your watch', 'Choose a station, place your Casio nearby and transmit.'],
    signal: ['Inside the signal', 'The selected station time code, live.'],
    world: ['A world between light and time', 'Follow the Sun. Find your city. Explore the signals that keep us in sync.'],
    iss: ['An observatory in orbit', 'Track our orbital outpost. Discover your next encounter with the ISS.'],
    history: ['Your synchronization history', 'Your trials, stored only on this device.'],
    profiles: ['A profile for every watch', 'Save the settings and placement that work.'],
    trial: ['Trial details', 'The settings used and the result observed on your Casio.'],
    settings: ['Set up your signal', 'Configure the signal for your device.'],
    guide: ['Quick start guide', 'Prepare your Casio and start transmitting.'] };
  if (!titles[page]) page = 'sync';
  for (const name of Object.keys(titles)) {
    $(`page-${name}`).hidden = page !== name;
    $(`page-${name}`).classList.toggle('active', page === name);
  }
  document.querySelectorAll('[data-page]').forEach(button => {
    const selected = button.dataset.page === (page === 'trial' ? 'history' : page);
    button.classList.toggle('selected', selected);
    if (selected) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  $('page-title').replaceChildren(document.createTextNode(titles[page][0]), Object.assign(document.createElement('span'), { textContent: '.' }));
  $('page-subtitle').textContent = titles[page][1];
  worldView.setVisible(page === 'world');
  issView.setVisible(page === 'iss');
  window.scrollTo(0, 0);
}

function setControls() {
  const locked = Boolean(session) || busy;
  $('station-select').disabled = locked;
  $('duration').disabled = locked;
  $('wave-type').disabled = locked;
  $('volume').disabled = busy;
  $('audio-channel').disabled = locked;
  $('profile-select').disabled = locked;
  $('profile-edit-select').disabled = locked;
  for (const control of $('profile-form').querySelectorAll('input,textarea,button')) control.disabled = locked;
  $('profile-new').disabled = locked;
  $('profile-restore-success').disabled = locked || !profiles.find(p => p.id === editingProfileId)?.lastSuccess;
  $('trial-restore').disabled = locked || !history.find(t => t.id === selectedTrialId)?.snapshot;
  $('audio-output').disabled = locked;
  $('latency-offset').disabled = locked;
  $('refresh-devices').disabled = locked;
  $('test-output').disabled = locked || syncing;
  $('sync-button').disabled = locked || syncing;
  $('settings-sync').disabled = locked || syncing;
  $('start-button').disabled = busy || syncing;
  $('start-button').classList.toggle('running', Boolean(session));
  $('start-symbol').textContent = session ? '■' : '▶';
  $('start-label').textContent = busy ? 'Preparing audio…' : session ? 'Stop' : 'Start transmission';
  $('confirmed-button').hidden = !session;
  $('transmit-dot').className = `signal-dot ${session ? 'active' : 'muted'}`;
  $('session-dot').classList.toggle('signal-dot', Boolean(session));
  $('status-badge').classList.toggle('transmitting', Boolean(session));
}

function renderReference() {
  const fresh = reference && now() - reference.nowMs < 30 * 60000;
  $('source-dot').style.backgroundColor = fresh ? 'var(--accent)' : 'var(--muted)';
  $('source-label').textContent = reference ? `${fresh ? 'NTP verified' : 'NTP check needed'} · ${reference.host}` : 'System clock · not verified';
  $('ntp-chip').textContent = reference ? (fresh ? 'NTP VERIFIED' : 'CHECK NEEDED') : 'SYSTEM';
  $('ntp-source').textContent = reference?.host || 'System clock';
  $('ntp-offset').textContent = reference ? `${reference.offsetMs >= 0 ? '+' : ''}${reference.offsetMs.toFixed(1)} ms` : 'Unavailable';
  $('ntp-uncertainty').textContent = reference ? `± ${Math.ceil(reference.uncertaintyMs)} ms` : 'Unavailable';
  $('ntp-last').textContent = reference ? historyFormatter.format(reference.synchronizedAt) : 'Never';
}

async function syncClock(quiet = false) {
  if (syncing || session || busy) return;
  syncing = true;
  setControls();
  $('sync-button').textContent = 'Checking time…';
  try {
    const result = await desktop.synchronize();
    if (!result.ok) throw new Error(result.error);
    // IPC delivery is local; anchor immediately on receipt, without half of the NTP wait.
    anchor = { epoch: result.nowMs, mono: performance.now() };
    reference = result;
    if (!quiet) notify(`Time checked with ${result.host}. Offset ${result.offsetMs >= 0 ? '+' : ''}${Math.round(result.offsetMs)} ms.`);
  } catch (error) {
    if (!quiet || !reference) notify(error.message, true);
    if (!reference) anchor = { epoch: Date.now(), mono: performance.now() };
  } finally {
    syncing = false;
    $('sync-button').textContent = 'Check time ↻';
    renderReference();
    setControls();
    lastSecond = -1;
  }
}

async function start() {
  if (busy || syncing) return;
  busy = true;
  setControls();
  try {
    const snapshot = createSnapshot(preferences, profiles.find(p => p.id === activeProfileId), $('audio-output').selectedOptions[0]?.textContent, reference);
    const timing = await engine.start({ now, durationMinutes: preferences.duration, volume: preferences.volume / 100,
      wave: preferences.wave, channel: preferences.channel, deviceId: preferences.deviceId, advanceMs: preferences.advanceMs, stationId: preferences.stationId,
      onComplete: () => stop('complete'), onInterrupt: reason => stop('interrupted', reason) });
    session = { ...timing, createdAt: now(), minutes: preferences.duration, stationId: preferences.stationId, snapshot, volumeChanges: [] };
    await desktop.setTransmitting(true);
    $('session-message').textContent = 'Check the reception indicator on your Casio.';
    if (!reference) notify('Transmitting system time. Accuracy depends on the computer clock.');
  } catch (error) {
    await engine.stop();
    session = null;
    await desktop.setTransmitting(false);
    notify(`Audio could not start: ${error.message}`, true);
  } finally { busy = false; setControls(); update(); }
}

async function stop(status = 'stopped', reason = '') {
  if (busy || !session) return;
  busy = true;
  const endedSession = session;
  session = null;
  const trial = createTrial(endedSession, status, now(), reason);
  history.unshift(trial);
  historyPage = 0;
  const stored = persist('atomic.history', history);
  const profileStored = rememberSuccess(trial);
  await engine.stop();
  await desktop.setTransmitting(false);
  renderHistory();
  const message = status === 'confirmed' ? 'Reception confirmed by you. Your Casio is ready.'
    : status === 'complete' ? 'Transmission finished. Check reception on your Casio display.'
      : status === 'interrupted' ? reason : 'Transmission stopped.';
  $('session-message').textContent = message;
  $('status-badge').textContent = status === 'confirmed' ? 'CONFIRMED BY YOU' : 'IDLE';
  if (stored && profileStored) notify(message, status === 'interrupted');
  busy = false;
  setControls();
  update();
}

function renderHistory() {
  $('history-list').replaceChildren();
  $('clear-history').hidden = !history.length;
  historyPage = Math.max(0, Math.min(historyPage, Math.ceil(history.length / 8) - 1));
  $('history-count').textContent = `· ${history.length}`;
  $('history-prev').disabled = historyPage === 0;
  $('history-next').disabled = (historyPage + 1) * 8 >= history.length;
  $('history-page').textContent = `${historyPage + 1} / ${Math.max(1, Math.ceil(history.length / 8))}`;
  if (!history.length) {
    const p = document.createElement('p');
    p.className = 'empty-history';
    p.textContent = 'No trials yet. Start your first transmission to build your history.';
    $('history-list').append(p);
  }
  const statuses = { confirmed: 'Outcome not verified', complete: 'Finished · check reception', interrupted: 'Interrupted by audio or system', stopped: 'Stopped manually' };
  for (const item of history.slice(historyPage * 8, (historyPage + 1) * 8)) {
    const row = document.createElement('div');
    row.className = 'history-row';
    for (const [value, className] of [[historyFormatter.format(item.at), 'history-date'],
      [`${STATIONS.find(station => station.id === item.stationId)?.name || 'DCF77'} · ${Math.floor(item.seconds / 60)}m ${pad(item.seconds % 60)}s`, ''],
      [item.snapshot?.watch.name || 'Custom settings', 'history-watch'],
      [item.outcome === 'get' ? '✓ Reception confirmed by you' : item.outcome === 'err' ? 'ERR · reception failed' : statuses[item.status], `history-status ${item.outcome === 'get' ? 'confirmed' : item.status}`]]) {
      const span = document.createElement('span');
      span.textContent = value;
      span.className = className;
      row.append(span);
    }
    const detail = document.createElement('button');
    detail.className = 'text-button'; detail.textContent = 'Details';
    detail.setAttribute('aria-label', `Details of trial on ${historyFormatter.format(item.at)}`);
    detail.onclick = () => openTrial(item.id);
    row.append(detail);
    $('history-list').append(row);
  }
}

function fillFacts(container, entries) {
  container.replaceChildren();
  for (const [label, value] of entries) {
    const row = document.createElement('div'), caption = document.createElement('span'), content = document.createElement('strong');
    caption.textContent = label; content.textContent = value || '—'; row.append(caption, content); container.append(row);
  }
}

function renderProfileOptions() {
  for (const id of ['profile-select', 'profile-edit-select']) {
    const select = $(id);
    select.replaceChildren(new Option(id === 'profile-select' ? 'Custom settings' : 'New profile', ''));
    for (const profile of profiles) select.append(new Option(profile.name, profile.id));
    select.value = (id === 'profile-select' ? activeProfileId : editingProfileId) || '';
  }
}

function showProfile(id) {
  editingProfileId = profiles.some(p => p.id === id) ? id : null;
  const profile = profiles.find(p => p.id === editingProfileId);
  const metadata = watchMetadata(profile);
  for (const [key, input] of Object.entries({ name: 'profile-name', model: 'profile-model', homeCity: 'profile-city', position: 'profile-position', systemVolume: 'profile-system-volume' })) $(input).value = metadata[key];
  $('profile-form-title').textContent = profile ? 'Edit watch' : 'New watch';
  $('profile-delete').hidden = !profile;
  renderProfileOptions(); renderProfileSummary(); setControls();
}

function renderProfileSummary() {
  const station = getStation(preferences.stationId);
  fillFacts($('profile-settings-summary'), [
    ['Station', station.name], ['Channel', CHANNEL_LABELS[preferences.channel]],
    ['Waveform', WAVE_LABELS[preferences.wave]], ['App volume', `${preferences.volume}%`],
    ['Duration', `${preferences.duration} minutes`], ['Manual advance', `${preferences.advanceMs} ms`],
    ['Output', $('audio-output').selectedOptions[0]?.textContent || 'System default'],
  ]);
  const profile = profiles.find(p => p.id === editingProfileId);
  const changed = profile && JSON.stringify(profile.settings) !== JSON.stringify(normalizePreferences(preferences));
  $('profile-saved-state').textContent = profile ? changed ? 'UNSAVED' : 'SAVED' : 'NEW';
  $('profile-last-success').textContent = profile?.lastSuccess
    ? `${historyFormatter.format(profile.lastSuccess.at)} · ${getStation(profile.lastSuccess.settings.stationId).name} · ${CHANNEL_LABELS[profile.lastSuccess.settings.channel]} · ${WAVE_LABELS[profile.lastSuccess.settings.wave]} · ${profile.lastSuccess.settings.volume}%`
    : 'No confirmed trial for this watch yet.';
  $('profile-restore-success').disabled = Boolean(session) || busy || !profile?.lastSuccess;
}

function syncPreferenceControls() {
  $('volume').value = preferences.volume; $('volume-value').textContent = `${preferences.volume}%`;
  $('duration').value = preferences.duration; $('audio-channel').value = preferences.channel;
  $('wave-type').value = preferences.wave; $('latency-offset').value = preferences.advanceMs;
  const available = [...$('audio-output').options].some(o => o.value === preferences.deviceId);
  if (!available) {
    preferences.deviceId = 'default';
    notify('Saved output unavailable. Using the system output; the saved profile is unchanged.', true);
  }
  $('audio-output').value = preferences.deviceId;
  return available;
}

function applyConfiguration(settings, profileId = activeProfileId) {
  if (session || busy) return;
  Object.assign(preferences, normalizePreferences(settings));
  activeProfileId = profiles.some(p => p.id === profileId) ? profileId : null;
  const available = syncPreferenceControls(); savePreferences(); saveProfiles();
  showProfile(activeProfileId); renderStation(); update();
  return available;
}

function rememberSuccess(trial) {
  const profile = profiles.find(p => p.id === trial.snapshot?.profileId);
  if (!profile) return true;
  const success = successfulConfiguration(trial);
  if (success && (!profile.lastSuccess || success.at >= profile.lastSuccess.at)) profile.lastSuccess = success;
  else if (!success && profile.lastSuccess?.trialId === trial.id) {
    const previous = history.find(t => t.outcome === 'get' && t.snapshot?.profileId === profile.id);
    profile.lastSuccess = previous ? successfulConfiguration(previous) : null;
  }
  const saved = saveProfiles(); renderProfileSummary();
  return saved;
}

function openTrial(id) {
  const trial = history.find(t => t.id === id);
  if (!trial) return;
  selectedTrialId = id;
  const snapshot = trial.snapshot, settings = snapshot?.settings;
  const volume = settings ? `${settings.volume}%${trial.endVolume != null && trial.endVolume !== settings.volume ? ` → ${trial.endVolume}%` : ''}` : 'Not recorded';
  $('trial-title').textContent = `Trial on ${historyFormatter.format(trial.at)}`;
  fillFacts($('trial-facts'), [
    ['Watch', snapshot?.watch.name || 'Not linked'], ['Model / home city', [snapshot?.watch.model, snapshot?.watch.homeCity].filter(Boolean).join(' · ') || 'Not noted'],
    ['Station', STATIONS.find(s => s.id === trial.stationId)?.name || 'DCF77'],
    ['Channel', settings ? CHANNEL_LABELS[settings.channel] : 'Not recorded'], ['Waveform', settings ? WAVE_LABELS[settings.wave] : 'Not recorded'], ['App volume', volume],
    ['Actual / selected duration', `${Math.floor(trial.seconds / 60)}m ${pad(trial.seconds % 60)}s${settings ? ` / ${settings.duration} min` : ''}`],
    ['Device', snapshot?.deviceLabel || 'Not recorded'], ['System volume note', snapshot?.watch.systemVolume ? `${snapshot.watch.systemVolume}%` : 'Not noted'],
    ['Audio / advance / reported latency', settings ? `${trial.sampleRate ? `${trial.sampleRate / 1000} kHz · ` : ''}${settings.advanceMs} ms / ${trial.latencyMs ?? '—'} ms` : 'Not recorded'],
    ['Time source', trial.source || 'System clock'],
    ['NTP offset / uncertainty', snapshot?.reference ? `${Number(snapshot.reference.offsetMs).toFixed(1)} ms / ±${Math.ceil(snapshot.reference.uncertaintyMs)} ms` : 'System clock · not verified'],
  ]);
  $('trial-position').textContent = snapshot ? `Placement: ${snapshot.watch.position || 'not noted'}.` : 'Trial from before version 1.2: audio settings were not recorded.';
  const changes = trial.volumeChanges || [];
  const statuses = { confirmed: 'Stopped after GET confirmation', complete: 'Transmission completed', stopped: 'Manual stop', interrupted: 'Audio or system interruption' };
  $('trial-events').textContent = `${statuses[trial.status]}. ${trial.reason || ''}${changes.length ? ` Volume changed ${changes.length} times (min ${Math.min(...changes.map(c => c.value), settings.volume)}%, max ${Math.max(...changes.map(c => c.value), settings.volume)}%).` : ''}`;
  $('trial-outcome').value = trial.outcome;
  setControls(); navigate('trial');
}

function renderStation() {
  const station = getStation(preferences.stationId);
  $('dcf-gated-option').disabled = station.id !== 'dcf77';
  if (station.id !== 'dcf77' && preferences.wave === 'sine-gated') {
    preferences.wave = 'sine';
    savePreferences();
  }
  $('wave-type').value = preferences.wave;
  const gated = station.id === 'dcf77' && preferences.wave === 'sine-gated';
  $('profile-hint').textContent = gated
    ? 'Fully silent intervals of 100/200 ms. Experimental profile for L3 followed by ERR; reception on your Casio must be checked.'
    : 'If DCF77 shows L3 then ERR, try full pauses. Square waves can produce more audible tones.';
  const number = value => new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 }).format(value);
  const frequency = `${number(station.frequency / 1000)} kHz`;
  const tone = `${number(station.audioFrequency)} Hz`;
  dateFormatter = new Intl.DateTimeFormat('en-GB', { timeZone: station.timeZone, day: '2-digit', month: 'long', year: 'numeric', weekday: 'short' });
  $('station-select').value = station.id;
  $('sidebar-station-name').textContent = station.name;
  $('sidebar-flag').textContent = $('station-card-flag').textContent = station.flag;
  $('sidebar-location').textContent = station.location;
  $('sidebar-coordinates').textContent = station.coordinates;
  $('sidebar-frequency').textContent = $('station-card-frequency').textContent = frequency;
  $('station-card-name').textContent = $('settings-station').textContent = station.name;
  $('station-location').textContent = station.location;
  $('audio-frequency').textContent = $('settings-frequency').textContent = tone;
  $('harmonic').textContent = `${station.harmonic}× · ${number(station.frequency)} Hz`;
  $('station-hint').textContent = `Casio: ${station.cities} · ${station.id === 'jjy' || station.id === 'bpc' ? 'DST OFF' : 'DST AUTO'}`;
  $('station-compatibility').textContent = station.experimental ? 'EXPERIMENTAL' : station.id === 'msf' ? 'AM · A/B' : 'AM / PWM';
  $('volume-hint').textContent = `${number(station.audioFrequency / 1000)} kHz tone: start at low volume and keep it away from your ears.`;
  $('wave-label').textContent = `ENVELOPE ${station.name} · ${gated ? 'FULL PAUSES' : 'SIMULATION'}`;
  const explanations = {
    dcf77: ['100 / 200 ms', `A 100 ms ${gated ? 'full pause' : 'reduction'} means 0; 200 ms means 1. Second 59 has no reduction and identifies the minute boundary. Three even parity bits protect minutes, hours and date.`],
    jjy: ['200 / 500 / 800 ms', 'Each second begins at high amplitude for 800 ms (0), 500 ms (1) or 200 ms (marker). The code carries Japanese time (JST), day of year, and hour and minute parity.'],
    wwvb: ['200 / 500 / 800 ms', 'The legacy AM code reduces amplitude for 200 ms (0), 500 ms (1) or 800 ms (marker). It transmits UTC; the Casio applies its home city time zone. Includes leap year and US DST flags.'],
    msf: ['500 ms · bit A/B', 'The minute starts with 500 ms without a carrier. Each other second starts with a 100 ms pause followed by two 100 ms slots for bits A and B. Four odd parity bits protect UK time and date.'],
    bpc: ['100 / 200 / 300 / 400 ms', 'Each cycle lasts 20 seconds. A reduction of 100, 200, 300 or 400 ms encodes two bits. Binary fields carry Beijing time, cycle index, date and parity. Compatibility is experimental.'],
  };
  $('pulse-label').textContent = explanations[station.id][0];
  $('protocol-explanation').textContent = explanations[station.id][1];
  $('protocol-cities').textContent = `${station.name} · ${station.country}. Compatible home cities: ${station.cities}, if supported by your module.`;
  $('guide-station').textContent = `For ${station.name}, use a compatible home city: ${station.cities}, if supported by your module. ${station.id === 'jjy' || station.id === 'bpc' ? 'Leave DST OFF.' : 'Use DST AUTO if supported.'}`;
  $('footer-station').textContent = `${station.name} ＋ ${station.country.toUpperCase()}`;
  $('station-reference').dataset.reference = { dcf77: 'ptb', jjy: 'jjy', wwvb: 'wwvb', msf: 'msf', bpc: 'bpc' }[station.id];
  currentFrame = null;
  lastSecond = -1;
}

function renderFrame(epoch) {
  const frame = stationFrameAt(preferences.stationId, epoch);
  if (frame.start === currentFrame?.start && frame.stationId === currentFrame?.stationId) return;
  currentFrame = frame;
  $('target-minute').textContent = `${pad(frame.time.hour)}:${pad(frame.time.minute)}:${pad(frame.time.second)} ${frame.time.zone}`;
  $('bit-summary').textContent = `${getStation(frame.stationId).name} · ${frame.duration} S`;
  $('parity-status').textContent = frame.checks.length ? frame.checks.map(check => `${check.label} ${check.ok ? '✓' : '✕'}`).join(' · ') : 'No parity in this AM code';
  $('telegram-description').textContent = frame.description;
  $('bit-grid').classList.toggle('quaternary', frame.stationId === 'bpc');
  $('bit-grid').replaceChildren();
  frame.bits.forEach((value, second) => {
    const field = frame.fields.find(f => second >= f.start && second <= f.end);
    const bit = document.createElement('div');
    bit.className = `bit ${value === -1 ? 'marker' : field?.kind || 'reserved'}`;
    bit.textContent = symbolLabel(frame, second);
    bit.title = `Second ${second} · ${field?.name || 'Reserved'} · ${symbolDescription(frame, second)}`;
    $('bit-grid').append(bit);
  });
  $('bit-legend').replaceChildren();
  frame.fields.forEach(field => {
    const entry = document.createElement('span');
    const dot = document.createElement('i'); dot.className = field.kind;
    entry.append(dot, document.createTextNode(field.name)); $('bit-legend').append(entry);
  });
}

function drawWave(epoch) {
  const id = preferences.stationId;
  const windowStart = Math.floor(epoch / 12000) * 12000;
  const width = 640 / 12;
  let frame = currentFrame;
  let path = '';
  for (let i = 0; i < 12; i++) {
    const stamp = windowStart + i * 1000;
    if (stamp < frame.start || stamp >= frame.start + frame.duration * 1000) frame = stationFrameAt(id, stamp);
    const second = Math.floor((stamp - frame.start) / 1000);
    for (let j = 0; j < 10; j++) {
      const x = (i + j / 10) * width;
      const y = 12 + (1 - audioEnvelope(frame, second, j / 10 + 0.00001, preferences.wave)) * 50;
      path += `${i || j ? 'L' : 'M'}${x} ${y} H${(i + (j + 1) / 10) * width} `;
    }
  }
  $('wave-path').setAttribute('d', path);
  $('wave-cursor').setAttribute('d', `M${(epoch - windowStart) / 12000 * 640} 0 V80`);
}

function update() {
  const epoch = now();
  const secondKey = Math.floor(epoch / 1000);
  if (secondKey !== lastSecond) {
    const time = stationTime(preferences.stationId, epoch);
    const symbolSecond = time.second % getStation(preferences.stationId).cycle;
    $('hours').textContent = pad(time.hour);
    $('minutes').textContent = pad(time.minute);
    $('seconds').textContent = pad(time.second);
    $('date').textContent = dateFormatter.format(epoch).toUpperCase();
    const zoneLabel = `${time.zone}${time.offsetMinutes ? ` · UTC${time.offsetMinutes >= 0 ? '+' : ''}${time.offsetMinutes / 60}` : ''}`;
    $('zone').textContent = $('station-zone').textContent = zoneLabel;
    renderFrame(epoch);
    [...$('bit-grid').children].forEach((bit, i) => {
      bit.classList.toggle('current', i === symbolSecond);
      bit.classList.toggle('passed', i < symbolSecond);
    });
    if (session) {
      const elapsed = Math.max(0, epoch - session.startEpoch);
      const remaining = Math.max(0, Math.ceil((session.endEpoch - epoch) / 1000));
      $('remaining').textContent = `${pad(Math.floor(remaining / 60))}:${pad(remaining % 60)}`;
      $('remaining-label').textContent = epoch < session.startEpoch ? 'ALIGNING…' : 'TIME REMAINING';
      $('status-badge').textContent = epoch < session.startEpoch ? 'ALIGNING' : 'TRANSMITTING';
      $('current-bit').textContent = symbolLabel(currentFrame, symbolSecond);
      $('frames-sent').textContent = Math.max(0, Math.min(session.minutes, Math.floor((epoch - session.firstFullMinute) / 60000)));
      $('progress-ring').style.strokeDashoffset = String(276.46 * (1 - Math.min(1, elapsed / (session.endEpoch - session.startEpoch))));
      $('transmit-note').textContent = epoch < session.firstFullMinute
        ? `Aligning signal. First complete minute starts at ${pad(stationTime(preferences.stationId, session.firstFullMinute).hour)}:${pad(stationTime(preferences.stationId, session.firstFullMinute).minute)}.`
        : `Transmitting · ${session.sampleRate / 1000} kHz audio · leave your watch near the speaker.`;
      if (epoch > session.endEpoch + 2000) stop('interrupted', 'The audio engine did not report completion. Check the output and try again.');
    } else {
      $('remaining').textContent = `${pad(preferences.duration)}:00`;
      $('remaining-label').textContent = 'READY WHEN YOU ARE';
      $('progress-ring').style.strokeDashoffset = '276.46';
      $('current-bit').textContent = '—';
      $('frames-sent').textContent = '0';
      $('transmit-note').textContent = 'Start manual reception on your Casio, then transmit for 5–10 minutes.';
    }
    if (secondKey % 30 === 0) renderReference();
    // Detect wall-clock jumps and wake events without using the mutable wall clock for audio.
    const wall = Date.now();
    const mono = performance.now();
    if (Math.abs((wall - lastWallCheck.wall) - (mono - lastWallCheck.mono)) > 1500) {
      if (session) stop('interrupted', 'The system clock changed. Check the time and restart transmission.');
      reference = null;
      anchor = { epoch: wall, mono };
      renderReference();
    }
    lastWallCheck = { wall, mono };
    lastSecond = secondKey;
  }
  if (currentFrame) drawWave(epoch);
}

async function refreshDevices() {
  try {
    const devices = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'audiooutput' && d.deviceId !== 'default');
    const select = $('audio-output');
    select.replaceChildren(new Option('Default system output', 'default'));
    devices.forEach((device, index) => select.append(new Option(device.label || `Audio output ${index + 1}`, device.deviceId)));
    if (![...select.options].some(option => option.value === preferences.deviceId)) preferences.deviceId = 'default';
    select.value = preferences.deviceId;
    savePreferences();
  } catch { /* The default system output is always usable without microphone permissions. */ }
}

$('platform').textContent = desktop.platform === 'darwin' ? 'MAC' : desktop.platform.toUpperCase();
document.body.classList.toggle('non-mac', desktop.platform !== 'darwin');
document.querySelectorAll('[data-page]').forEach(button => button.addEventListener('click', () => navigate(button.dataset.page)));
document.querySelectorAll('[data-goto]').forEach(button => button.addEventListener('click', () => navigate(button.dataset.goto)));
document.querySelectorAll('[data-reference]').forEach(button => button.addEventListener('click', () => desktop.openReference(button.dataset.reference)));
document.querySelector('.brand').addEventListener('click', event => { event.preventDefault(); navigate('sync'); });
$('help-button').addEventListener('click', () => navigate('guide'));
$('start-button').addEventListener('click', () => session ? stop() : start());
$('confirmed-button').addEventListener('click', () => stop('confirmed'));
$('sync-button').addEventListener('click', () => syncClock());
$('settings-sync').addEventListener('click', () => syncClock());
$('volume').value = preferences.volume;
$('volume-value').textContent = `${preferences.volume}%`;
$('duration').value = preferences.duration;
$('wave-type').value = preferences.wave;
$('latency-offset').value = preferences.advanceMs;
$('audio-channel').value = preferences.channel;
$('audio-channel').addEventListener('change', event => {
  if (session || busy) { event.target.value = preferences.channel; return; }
  preferences.channel = event.target.value;
  savePreferences();
});
$('volume').addEventListener('input', event => {
  preferences.volume = Number(event.target.value);
  $('volume-value').textContent = `${preferences.volume}%`;
  engine.setVolume(preferences.volume / 100);
  if (session) {
    session.endVolume = preferences.volume;
    session.volumeChanges.push({ elapsedMs: Math.max(0, Math.round(now() - session.startEpoch)), value: preferences.volume });
  }
  savePreferences();
});
$('duration').addEventListener('change', event => { preferences.duration = Number(event.target.value); savePreferences(); lastSecond = -1; update(); });
$('wave-type').addEventListener('change', event => { preferences.wave = event.target.value; renderStation(); savePreferences(); update(); });
$('audio-output').addEventListener('change', event => { preferences.deviceId = event.target.value; savePreferences(); });
$('latency-offset').addEventListener('change', event => {
  preferences.advanceMs = Math.max(-1000, Math.min(1000, Number(event.target.value) || 0));
  event.target.value = preferences.advanceMs;
  savePreferences();
});
$('refresh-devices').addEventListener('click', refreshDevices);
$('test-output').addEventListener('click', async () => {
  busy = true; setControls();
  try { await testOutput(preferences.deviceId, preferences.channel); notify(`${CHANNEL_LABELS[preferences.channel]} channel test complete. Check the output and system volume.`); }
  catch (error) { notify(`Audio test failed: ${error.message}`, true); }
  finally { busy = false; setControls(); }
});
$('profile-select').addEventListener('change', event => {
  if (session || busy) { event.target.value = activeProfileId || ''; return; }
  const profile = profiles.find(p => p.id === event.target.value);
  if (profile) applyConfiguration(profile.settings, profile.id);
  else { activeProfileId = null; saveProfiles(); showProfile(null); }
});
$('profile-edit-select').addEventListener('change', event => {
  if (session || busy) { event.target.value = editingProfileId || ''; return; }
  const profile = profiles.find(p => p.id === event.target.value);
  if (profile) applyConfiguration(profile.settings, profile.id);
  else showProfile(null);
});
$('profile-new').addEventListener('click', () => { if (!session && !busy) { showProfile(null); $('profile-name').focus(); } });
$('profile-form').addEventListener('submit', event => {
  event.preventDefault();
  if (session || busy || !$('profile-form').reportValidity()) return;
  const metadata = watchMetadata({ name: $('profile-name').value, model: $('profile-model').value, homeCity: $('profile-city').value,
    position: $('profile-position').value, systemVolume: $('profile-system-volume').value });
  if (!metadata.name) { $('profile-name').focus(); return; }
  const existing = profiles.find(p => p.id === editingProfileId);
  const profile = { id: existing?.id || crypto.randomUUID(), ...metadata, settings: normalizePreferences(preferences), lastSuccess: existing?.lastSuccess || null };
  if (existing) profiles = profiles.map(p => p.id === existing.id ? profile : p); else profiles.push(profile);
  activeProfileId = profile.id;
  const saved = saveProfiles(); showProfile(profile.id);
  if (saved) notify(`Profile «${profile.name}» saved with the current settings.`);
});
$('profile-delete').addEventListener('click', () => {
  if (session || busy || !editingProfileId) return;
  const oldProfiles = profiles, oldActive = activeProfileId, removedId = editingProfileId;
  profiles = profiles.filter(p => p.id !== removedId);
  if (activeProfileId === removedId) activeProfileId = null;
  saveProfiles(); showProfile(null);
  notify('Profile deleted. Existing trials remain in history.');
  const undo = document.createElement('button'); undo.className = 'text-button'; undo.textContent = 'Undo';
  undo.onclick = () => { profiles = oldProfiles; activeProfileId = oldActive; saveProfiles(); showProfile(removedId); $('toast').hidden = true; };
  $('toast').append(document.createTextNode(' '), undo);
});
$('profile-restore-success').addEventListener('click', () => {
  const profile = profiles.find(p => p.id === editingProfileId);
  if (!session && !busy && profile?.lastSuccess) {
    const available = applyConfiguration(profile.lastSuccess.settings, profile.id); navigate('sync');
    if (available) notify('Successful settings restored. Check the system volume and placement recorded in the trial.');
  }
});
$('history-prev').addEventListener('click', () => { historyPage--; renderHistory(); });
$('history-next').addEventListener('click', () => { historyPage++; renderHistory(); });
$('trial-save-outcome').addEventListener('click', () => {
  const trial = history.find(t => t.id === selectedTrialId);
  if (!trial) return;
  trial.outcome = $('trial-outcome').value;
  const saved = persist('atomic.history', history), profileSaved = rememberSuccess(trial);
  renderHistory();
  if (saved && profileSaved) notify('Trial outcome updated.');
});
$('trial-restore').addEventListener('click', () => {
  const trial = history.find(t => t.id === selectedTrialId);
  if (!session && !busy && trial?.snapshot) {
    const available = applyConfiguration({ ...trial.snapshot.settings, volume: trial.endVolume ?? trial.snapshot.settings.volume }, trial.snapshot.profileId);
    navigate('sync');
    if (available) notify('Trial settings restored. The saved profile settings remain available.');
  }
});
$('clear-history').addEventListener('click', () => {
  const old = history;
  history = []; persist('atomic.history', history); renderHistory();
  clearTimeout(toastTimer);
  $('toast').replaceChildren(document.createTextNode('History cleared. '));
  const undo = document.createElement('button');
  undo.className = 'text-button'; undo.textContent = 'Undo';
  undo.onclick = () => { history = [...old, ...history].sort((a, b) => b.at - a.at); persist('atomic.history', history); renderHistory(); $('toast').hidden = true; };
  $('toast').append(undo); $('toast').classList.remove('error'); $('toast').hidden = false;
  toastTimer = setTimeout(() => { $('toast').hidden = true; }, 8000);
});
desktop.onInterrupt(reason => {
  if (session) stop('interrupted', reason);
  reference = null; anchor = { epoch: Date.now(), mono: performance.now() }; renderReference();
});
navigator.mediaDevices?.addEventListener('devicechange', async () => {
  if (session) await stop('interrupted', 'The audio device changed. Check the output and restart.');
  await refreshDevices();
});
window.addEventListener('keydown', event => { if (event.code === 'Escape' && session) stop(); });
window.addEventListener('beforeunload', () => {
  // Closing/reloading the window must not silently discard an active trial.
  // Save synchronously: Chromium does not await promises during unload.
  if (session) {
    history.unshift(createTrial(session, 'interrupted', now(), 'Window closed during transmission.'));
    persist('atomic.history', history);
    session = null;
  }
  engine.stop(); desktop.setTransmitting(false);
});

STATIONS.forEach(station => $('station-select').append(new Option(`${station.name} · ${station.country} · ${station.frequency / 1000} kHz`, station.id)));
$('station-select').addEventListener('change', event => {
  if (session || busy) { event.target.value = preferences.stationId; return; }
  preferences.stationId = event.target.value;
  savePreferences(); renderStation(); update();
});
renderStation();
showProfile(activeProfileId);
persist('atomic.history', history);
renderHistory(); renderReference(); setControls(); update(); refreshDevices(); syncClock(true);
setInterval(update, 100);
setInterval(() => { if (!session && !busy && (!reference || now() - reference.nowMs > 15 * 60000)) syncClock(true); }, 60000);
