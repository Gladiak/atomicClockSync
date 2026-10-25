import { STATIONS, getStation, stationTime, stationFrameAt, audioEnvelope, symbolLabel, symbolDescription } from './stations.mjs';
import { SignalEngine, testOutput } from './audio-engine.mjs';
import { THEMES, applyTheme } from './themes.mjs';
import { DEFAULTS, CHANNEL_LABELS, WAVE_LABELS, normalizePreferences, normalizeProfiles, normalizeHistory, watchMetadata, createSnapshot, createTrial, successfulConfiguration } from './trials.mjs';

const $ = id => document.getElementById(id);
const desktop = window.desktop;
const engine = new SignalEngine();
const pad = value => String(value).padStart(2, '0');
let dateFormatter;
const historyFormatter = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
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

function now(mono = performance.now()) { return anchor.epoch + mono - anchor.mono; }
function persist(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { notify('Spazio locale insufficiente: le ultime modifiche non sono state salvate.', true); return false; }
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
  const titles = { sync: ['Il tuo tempo, al secondo', 'Scegli la stazione, avvicina il Casio e trasmetti.'],
    signal: ['Dentro ogni secondo', 'Il telegramma della stazione selezionata, in tempo reale.'],
    history: ['Il tempo che hai rimesso a posto', 'Le tue sessioni, salvate solo su questo dispositivo.'],
    profiles: ['Ogni orologio, il suo segnale', 'Conserva le impostazioni e la posizione che funzionano.'],
    trial: ['La prova, in ogni dettaglio', 'Configurazione usata e risultato osservato sul Casio.'],
    settings: ['La precisione parte da qui', 'Un segnale su misura per il tuo dispositivo.'],
    guide: ['Ogni secondo ha il suo metodo', 'Prepara il Casio. Al segnale pensiamo noi.'] };
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
  $('start-label').textContent = busy ? 'Preparazione audio…' : session ? 'Interrompi' : 'Avvia trasmissione';
  $('confirmed-button').hidden = !session;
  $('transmit-dot').className = `signal-dot ${session ? 'active' : 'muted'}`;
  $('session-dot').classList.toggle('signal-dot', Boolean(session));
  $('status-badge').classList.toggle('transmitting', Boolean(session));
}

function renderReference() {
  const fresh = reference && now() - reference.nowMs < 30 * 60000;
  $('source-dot').style.backgroundColor = fresh ? 'var(--accent)' : 'var(--muted)';
  $('source-label').textContent = reference ? `${fresh ? 'NTP verificato' : 'NTP da riverificare'} · ${reference.host}` : 'Ora del computer · non verificata';
  $('ntp-chip').textContent = reference ? (fresh ? 'NTP VERIFICATO' : 'DA RIVERIFICARE') : 'SISTEMA';
  $('ntp-source').textContent = reference?.host || 'Orologio del computer';
  $('ntp-offset').textContent = reference ? `${reference.offsetMs >= 0 ? '+' : ''}${reference.offsetMs.toFixed(1)} ms` : 'Non disponibile';
  $('ntp-uncertainty').textContent = reference ? `± ${Math.ceil(reference.uncertaintyMs)} ms` : 'Non disponibile';
  $('ntp-last').textContent = reference ? historyFormatter.format(reference.synchronizedAt) : 'Mai';
}

async function syncClock(quiet = false) {
  if (syncing || session || busy) return;
  syncing = true;
  setControls();
  $('sync-button').textContent = 'Verifica in corso…';
  try {
    const result = await desktop.synchronize();
    if (!result.ok) throw new Error(result.error);
    // IPC delivery is local; anchor immediately on receipt, without half of the NTP wait.
    anchor = { epoch: result.nowMs, mono: performance.now() };
    reference = result;
    if (!quiet) notify(`Ora verificata con ${result.host}. Correzione ${result.offsetMs >= 0 ? '+' : ''}${Math.round(result.offsetMs)} ms.`);
  } catch (error) {
    if (!quiet || !reference) notify(error.message, true);
    if (!reference) anchor = { epoch: Date.now(), mono: performance.now() };
  } finally {
    syncing = false;
    $('sync-button').textContent = 'Verifica ora ↻';
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
    $('session-message').textContent = 'Controlla l’indicatore di ricezione sul Casio.';
    if (!reference) notify('Trasmetto l’ora del computer. La precisione dipende dal suo orologio.');
  } catch (error) {
    await engine.stop();
    session = null;
    await desktop.setTransmitting(false);
    notify(`Audio non avviato: ${error.message}`, true);
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
  const message = status === 'confirmed' ? 'Ricezione confermata da te. Il tuo Casio è pronto.'
    : status === 'complete' ? 'Trasmissione terminata. Verifica la ricezione sul display del Casio.'
      : status === 'interrupted' ? reason : 'Trasmissione interrotta.';
  $('session-message').textContent = message;
  $('status-badge').textContent = status === 'confirmed' ? 'CONFERMATA DA TE' : 'IN ATTESA';
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
    p.textContent = 'Il prossimo minuto esatto comincia qui. Nessuna sessione ancora.';
    $('history-list').append(p);
  }
  const statuses = { confirmed: 'Esito da verificare', complete: 'Terminata · ricezione da verificare', interrupted: 'Interrotta dall’audio o dal sistema', stopped: 'Interrotta manualmente' };
  for (const item of history.slice(historyPage * 8, (historyPage + 1) * 8)) {
    const row = document.createElement('div');
    row.className = 'history-row';
    for (const [value, className] of [[historyFormatter.format(item.at), 'history-date'],
      [`${STATIONS.find(station => station.id === item.stationId)?.name || 'DCF77'} · ${Math.floor(item.seconds / 60)}m ${pad(item.seconds % 60)}s`, ''],
      [item.snapshot?.watch.name || 'Configurazione libera', 'history-watch'],
      [item.outcome === 'get' ? '✓ Ricezione confermata da te' : item.outcome === 'err' ? 'ERR · ricezione fallita' : statuses[item.status], `history-status ${item.outcome === 'get' ? 'confirmed' : item.status}`]]) {
      const span = document.createElement('span');
      span.textContent = value;
      span.className = className;
      row.append(span);
    }
    const detail = document.createElement('button');
    detail.className = 'text-button'; detail.textContent = 'Dettagli';
    detail.setAttribute('aria-label', `Dettagli della prova del ${historyFormatter.format(item.at)}`);
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
    select.replaceChildren(new Option(id === 'profile-select' ? 'Configurazione libera' : 'Nuovo profilo', ''));
    for (const profile of profiles) select.append(new Option(profile.name, profile.id));
    select.value = (id === 'profile-select' ? activeProfileId : editingProfileId) || '';
  }
}

function showProfile(id) {
  editingProfileId = profiles.some(p => p.id === id) ? id : null;
  const profile = profiles.find(p => p.id === editingProfileId);
  const metadata = watchMetadata(profile);
  for (const [key, input] of Object.entries({ name: 'profile-name', model: 'profile-model', homeCity: 'profile-city', position: 'profile-position', systemVolume: 'profile-system-volume' })) $(input).value = metadata[key];
  $('profile-form-title').textContent = profile ? 'Modifica orologio' : 'Nuovo orologio';
  $('profile-delete').hidden = !profile;
  renderProfileOptions(); renderProfileSummary(); setControls();
}

function renderProfileSummary() {
  const station = getStation(preferences.stationId);
  fillFacts($('profile-settings-summary'), [
    ['Stazione', station.name], ['Canale', CHANNEL_LABELS[preferences.channel]],
    ['Forma audio', WAVE_LABELS[preferences.wave]], ['Intensità app', `${preferences.volume}%`],
    ['Durata', `${preferences.duration} minuti`], ['Anticipo manuale', `${preferences.advanceMs} ms`],
    ['Uscita', $('audio-output').selectedOptions[0]?.textContent || 'Predefinita di sistema'],
  ]);
  const profile = profiles.find(p => p.id === editingProfileId);
  const changed = profile && JSON.stringify(profile.settings) !== JSON.stringify(normalizePreferences(preferences));
  $('profile-saved-state').textContent = profile ? changed ? 'DA SALVARE' : 'SALVATO' : 'NUOVO';
  $('profile-last-success').textContent = profile?.lastSuccess
    ? `${historyFormatter.format(profile.lastSuccess.at)} · ${getStation(profile.lastSuccess.settings.stationId).name} · ${CHANNEL_LABELS[profile.lastSuccess.settings.channel]} · ${WAVE_LABELS[profile.lastSuccess.settings.wave]} · ${profile.lastSuccess.settings.volume}%`
    : 'Nessuna prova confermata per questo orologio.';
  $('profile-restore-success').disabled = Boolean(session) || busy || !profile?.lastSuccess;
}

function syncPreferenceControls() {
  $('volume').value = preferences.volume; $('volume-value').textContent = `${preferences.volume}%`;
  $('duration').value = preferences.duration; $('audio-channel').value = preferences.channel;
  $('wave-type').value = preferences.wave; $('latency-offset').value = preferences.advanceMs;
  const available = [...$('audio-output').options].some(o => o.value === preferences.deviceId);
  if (!available) {
    preferences.deviceId = 'default';
    notify('Uscita salvata non disponibile: selezionata l’uscita di sistema. Il profilo originale è conservato.', true);
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
  const volume = settings ? `${settings.volume}%${trial.endVolume != null && trial.endVolume !== settings.volume ? ` → ${trial.endVolume}%` : ''}` : 'Non registrata';
  $('trial-title').textContent = `Prova del ${historyFormatter.format(trial.at)}`;
  fillFacts($('trial-facts'), [
    ['Orologio', snapshot?.watch.name || 'Non associato'], ['Modello / città', [snapshot?.watch.model, snapshot?.watch.homeCity].filter(Boolean).join(' · ') || 'Non annotati'],
    ['Stazione', STATIONS.find(s => s.id === trial.stationId)?.name || 'DCF77'],
    ['Canale', settings ? CHANNEL_LABELS[settings.channel] : 'Non registrato'], ['Forma audio', settings ? WAVE_LABELS[settings.wave] : 'Non registrata'], ['Intensità app', volume],
    ['Durata effettiva / prevista', `${Math.floor(trial.seconds / 60)}m ${pad(trial.seconds % 60)}s${settings ? ` / ${settings.duration} min` : ''}`],
    ['Dispositivo', snapshot?.deviceLabel || 'Non registrato'], ['Volume Mac annotato', snapshot?.watch.systemVolume ? `${snapshot.watch.systemVolume}%` : 'Non annotato'],
    ['Audio / anticipo / latenza dichiarata', settings ? `${trial.sampleRate ? `${trial.sampleRate / 1000} kHz · ` : ''}${settings.advanceMs} ms / ${trial.latencyMs ?? '—'} ms` : 'Non registrati'],
    ['Sorgente temporale', trial.source || 'Computer'],
    ['Correzione / incertezza NTP', snapshot?.reference ? `${Number(snapshot.reference.offsetMs).toFixed(1)} ms / ±${Math.ceil(snapshot.reference.uncertaintyMs)} ms` : 'Ora del computer · non verificata'],
  ]);
  $('trial-position').textContent = snapshot ? `Posizione: ${snapshot.watch.position || 'non annotata'}.` : 'Prova precedente alla versione 1.2: configurazione audio non registrata.';
  const changes = trial.volumeChanges || [];
  const statuses = { confirmed: 'Interrotta dopo conferma GET', complete: 'Trasmissione completata', stopped: 'Arresto manuale', interrupted: 'Interruzione audio o sistema' };
  $('trial-events').textContent = `${statuses[trial.status]}. ${trial.reason || ''}${changes.length ? ` Intensità modificata ${changes.length} volte (min ${Math.min(...changes.map(c => c.value), settings.volume)}%, max ${Math.max(...changes.map(c => c.value), settings.volume)}%).` : ''}`;
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
    ? 'Pause a zero per 100/200 ms. Profilo sperimentale per L3 seguito da ERR; ricezione sul Casio da verificare.'
    : 'Se DCF77 mostra L3 poi ERR, prova le pause complete. La forma quadra può produrre toni più udibili.';
  const number = value => new Intl.NumberFormat('it-IT', { maximumFractionDigits: 1 }).format(value);
  const frequency = `${number(station.frequency / 1000)} kHz`;
  const tone = `${number(station.audioFrequency)} Hz`;
  dateFormatter = new Intl.DateTimeFormat('it-IT', { timeZone: station.timeZone, day: '2-digit', month: 'long', year: 'numeric', weekday: 'short' });
  $('station-select').value = station.id;
  $('sidebar-station-name').textContent = station.name;
  $('sidebar-flag').textContent = $('station-card-flag').textContent = station.flag;
  $('sidebar-location').textContent = station.location;
  $('sidebar-coordinates').textContent = station.coordinates;
  $('sidebar-frequency').textContent = $('station-card-frequency').textContent = frequency;
  $('station-card-name').textContent = $('settings-station').textContent = station.name;
  $('station-location').textContent = station.location;
  $('audio-frequency').textContent = $('settings-frequency').textContent = tone;
  $('harmonic').textContent = `${station.harmonic}ª · ${number(station.frequency)} Hz`;
  $('station-hint').textContent = `Casio: ${station.cities} · ${station.id === 'jjy' || station.id === 'bpc' ? 'DST OFF' : 'DST AUTO'}`;
  $('station-compatibility').textContent = station.experimental ? 'SPERIMENTALE' : station.id === 'msf' ? 'AM · A/B' : 'AM / PWM';
  $('volume-hint').textContent = `Tono a ${number(station.audioFrequency / 1000)} kHz: parti con volume basso e tienilo lontano dalle orecchie.`;
  $('wave-label').textContent = `INVILUPPO ${station.name} · ${gated ? 'PAUSE COMPLETE' : 'SIMULAZIONE'}`;
  const explanations = {
    dcf77: ['100 / 200 ms', `Una ${gated ? 'pausa completa' : 'riduzione'} di 100 ms indica 0, di 200 ms indica 1. Il secondo 59 non ha riduzione: identifica il nuovo minuto. Tre parità pari proteggono minuti, ore e data.`],
    jjy: ['200 / 500 / 800 ms', 'L’ampiezza è alta a inizio secondo per 800 ms (0), 500 ms (1) o 200 ms (marcatore). Il codice porta l’ora giapponese JST, il giorno dell’anno e le parità di ore e minuti.'],
    wwvb: ['200 / 500 / 800 ms', 'Il codice AM storico riduce l’ampiezza per 200 ms (0), 500 ms (1) o 800 ms (marcatore). Trasmette UTC; il Casio applica il fuso della città scelta. Include anno bisestile e stato DST statunitense.'],
    msf: ['500 ms · bit A/B', 'Il minuto inizia con 500 ms senza portante. Ogni altro secondo inizia con 100 ms di pausa, poi due intervalli da 100 ms per i bit A e B. Quattro parità dispari proteggono l’ora e la data britanniche.'],
    bpc: ['100 / 200 / 300 / 400 ms', 'Un ciclo dura 20 secondi: ogni impulso codifica due bit con una riduzione di 100, 200, 300 o 400 ms. I campi binari portano ora di Pechino, indice del ciclo, data e parità. Compatibilità sperimentale.'],
  };
  $('pulse-label').textContent = explanations[station.id][0];
  $('protocol-explanation').textContent = explanations[station.id][1];
  $('protocol-cities').textContent = `${station.name} · ${station.country}. Città principali compatibili: ${station.cities}, se previste dal tuo modulo.`;
  $('guide-station').textContent = `Per ${station.name} usa una città compatibile: ${station.cities}, se prevista dal tuo modulo. ${station.id === 'jjy' || station.id === 'bpc' ? 'Lascia DST su OFF.' : 'Lascia DST su AUTO se previsto.'}`;
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
  $('parity-status').textContent = frame.checks.length ? frame.checks.map(check => `${check.label} ${check.ok ? '✓' : '✕'}`).join(' · ') : 'Nessuna parità nel codice AM';
  $('telegram-description').textContent = frame.description;
  $('bit-grid').classList.toggle('quaternary', frame.stationId === 'bpc');
  $('bit-grid').replaceChildren();
  frame.bits.forEach((value, second) => {
    const field = frame.fields.find(f => second >= f.start && second <= f.end);
    const bit = document.createElement('div');
    bit.className = `bit ${value === -1 ? 'marker' : field?.kind || 'reserved'}`;
    bit.textContent = symbolLabel(frame, second);
    bit.title = `Secondo ${second} · ${field?.name || 'Riservato'} · ${symbolDescription(frame, second)}`;
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
      $('remaining-label').textContent = epoch < session.startEpoch ? 'ALLINEAMENTO…' : 'TEMPO RIMANENTE';
      $('status-badge').textContent = epoch < session.startEpoch ? 'ALLINEAMENTO' : 'IN TRASMISSIONE';
      $('current-bit').textContent = symbolLabel(currentFrame, symbolSecond);
      $('frames-sent').textContent = Math.max(0, Math.min(session.minutes, Math.floor((epoch - session.firstFullMinute) / 60000)));
      $('progress-ring').style.strokeDashoffset = String(276.46 * (1 - Math.min(1, elapsed / (session.endEpoch - session.startEpoch))));
      $('transmit-note').textContent = epoch < session.firstFullMinute
        ? `Segnale in allineamento. Primo minuto completo dalle ${pad(stationTime(preferences.stationId, session.firstFullMinute).hour)}:${pad(stationTime(preferences.stationId, session.firstFullMinute).minute)}.`
        : `Trasmissione in corso · ${session.sampleRate / 1000} kHz audio · lascia l’orologio vicino all’altoparlante.`;
      if (epoch > session.endEpoch + 2000) stop('interrupted', 'La sessione non ha segnalato il completamento audio. Verifica l’uscita e riprova.');
    } else {
      $('remaining').textContent = `${pad(preferences.duration)}:00`;
      $('remaining-label').textContent = 'PRONTO QUANDO VUOI';
      $('progress-ring').style.strokeDashoffset = '276.46';
      $('current-bit').textContent = '—';
      $('frames-sent').textContent = '0';
      $('transmit-note').textContent = 'Avvia la ricezione manuale sul Casio, poi trasmetti per 5–10 minuti.';
    }
    if (secondKey % 30 === 0) renderReference();
    // Detect wall-clock jumps and wake events without using the mutable wall clock for audio.
    const wall = Date.now();
    const mono = performance.now();
    if (Math.abs((wall - lastWallCheck.wall) - (mono - lastWallCheck.mono)) > 1500) {
      if (session) stop('interrupted', 'L’ora del sistema è cambiata. Verifica l’ora e riavvia la trasmissione.');
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
    select.replaceChildren(new Option('Uscita predefinita del sistema', 'default'));
    devices.forEach((device, index) => select.append(new Option(device.label || `Uscita audio ${index + 1}`, device.deviceId)));
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
  try { await testOutput(preferences.deviceId, preferences.channel); notify(`Test canale ${CHANNEL_LABELS[preferences.channel].toLowerCase()} completato. Controlla l’uscita e il volume di sistema.`); }
  catch (error) { notify(`Test audio non riuscito: ${error.message}`, true); }
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
  if (saved) notify(`Profilo «${profile.name}» salvato con le impostazioni attuali.`);
});
$('profile-delete').addEventListener('click', () => {
  if (session || busy || !editingProfileId) return;
  const oldProfiles = profiles, oldActive = activeProfileId, removedId = editingProfileId;
  profiles = profiles.filter(p => p.id !== removedId);
  if (activeProfileId === removedId) activeProfileId = null;
  saveProfiles(); showProfile(null);
  notify('Profilo eliminato. Le prove rimangono in cronologia.');
  const undo = document.createElement('button'); undo.className = 'text-button'; undo.textContent = 'Annulla';
  undo.onclick = () => { profiles = oldProfiles; activeProfileId = oldActive; saveProfiles(); showProfile(removedId); $('toast').hidden = true; };
  $('toast').append(document.createTextNode(' '), undo);
});
$('profile-restore-success').addEventListener('click', () => {
  const profile = profiles.find(p => p.id === editingProfileId);
  if (!session && !busy && profile?.lastSuccess) {
    const available = applyConfiguration(profile.lastSuccess.settings, profile.id); navigate('sync');
    if (available) notify('Configurazione riuscita ripristinata. Controlla anche volume del Mac e posizione annotati nella prova.');
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
  if (saved && profileSaved) notify('Esito della prova aggiornato.');
});
$('trial-restore').addEventListener('click', () => {
  const trial = history.find(t => t.id === selectedTrialId);
  if (!session && !busy && trial?.snapshot) {
    const available = applyConfiguration({ ...trial.snapshot.settings, volume: trial.endVolume ?? trial.snapshot.settings.volume }, trial.snapshot.profileId);
    navigate('sync');
    if (available) notify('Configurazione della prova ripristinata. Le impostazioni salvate nel profilo restano disponibili.');
  }
});
$('clear-history').addEventListener('click', () => {
  const old = history;
  history = []; persist('atomic.history', history); renderHistory();
  clearTimeout(toastTimer);
  $('toast').replaceChildren(document.createTextNode('Cronologia cancellata. '));
  const undo = document.createElement('button');
  undo.className = 'text-button'; undo.textContent = 'Annulla';
  undo.onclick = () => { history = [...old, ...history].sort((a, b) => b.at - a.at); persist('atomic.history', history); renderHistory(); $('toast').hidden = true; };
  $('toast').append(undo); $('toast').classList.remove('error'); $('toast').hidden = false;
  toastTimer = setTimeout(() => { $('toast').hidden = true; }, 8000);
});
desktop.onInterrupt(reason => {
  if (session) stop('interrupted', reason);
  reference = null; anchor = { epoch: Date.now(), mono: performance.now() }; renderReference();
});
navigator.mediaDevices?.addEventListener('devicechange', async () => {
  if (session) await stop('interrupted', 'Il dispositivo audio è cambiato. Controlla l’uscita e riavvia.');
  await refreshDevices();
});
window.addEventListener('keydown', event => { if (event.code === 'Escape' && session) stop(); });
window.addEventListener('beforeunload', () => {
  // Closing/reloading the window must not silently discard an active trial.
  // Save synchronously: Chromium does not await promises during unload.
  if (session) {
    history.unshift(createTrial(session, 'interrupted', now(), 'Finestra chiusa durante la trasmissione.'));
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
