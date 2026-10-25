import { STATIONS } from './stations.mjs';

export const CHANNEL_LABELS = Object.freeze({ both: 'Both', left: 'Left', right: 'Right' });
export const WAVE_LABELS = Object.freeze({ sine: 'Sine', 'sine-gated': 'Full pauses', square: 'Square' });
export const DEFAULTS = Object.freeze({ volume: 30, duration: 10, wave: 'sine', channel: 'both', deviceId: 'default', advanceMs: 0, stationId: 'dcf77' });
const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const text = (value, length) => typeof value === 'string' ? value.trim().slice(0, length) : '';
const bounded = (value, min, max, fallback) => Number.isFinite(Number(value)) ? Math.max(min, Math.min(max, Number(value))) : fallback;

export function normalizePreferences(value) {
  const saved = object(value);
  const stationId = STATIONS.some(s => s.id === saved.stationId) ? saved.stationId : 'dcf77';
  return {
    stationId, volume: bounded(saved.volume ?? 30, 5, 80, 30),
    duration: [5, 10, 15].includes(Number(saved.duration)) ? Number(saved.duration) : 10,
    wave: saved.wave === 'square' || (saved.wave === 'sine-gated' && stationId === 'dcf77') ? saved.wave : 'sine',
    channel: Object.hasOwn(CHANNEL_LABELS, saved.channel) ? saved.channel : 'both',
    deviceId: text(saved.deviceId, 512) || 'default', advanceMs: bounded(saved.advanceMs ?? 0, -1000, 1000, 0),
  };
}

export function watchMetadata(value) {
  const data = object(value);
  return { name: text(data.name, 60), model: text(data.model, 60), homeCity: text(data.homeCity, 12).toUpperCase(),
    position: text(data.position, 240), systemVolume: data.systemVolume === '' || data.systemVolume == null ? '' : String(Math.round(bounded(data.systemVolume, 0, 100, 0))) };
}

export function normalizeProfiles(value) {
  const ids = new Set();
  return (Array.isArray(value) ? value : []).filter(p => p && typeof p.id === 'string' && p.id && !ids.has(p.id) && ids.add(p.id))
    .map(p => ({ id: p.id, ...watchMetadata(p), name: text(p.name, 60) || 'Watch', settings: normalizePreferences(p.settings),
      lastSuccess: p.lastSuccess?.settings ? { ...p.lastSuccess, settings: normalizePreferences(p.lastSuccess.settings) } : null }));
}

export function normalizeHistory(value) {
  const ids = new Set();
  return (Array.isArray(value) ? value : []).filter(item => item && Number.isFinite(item.at) && Number.isFinite(item.seconds)
    && ['confirmed', 'complete', 'interrupted', 'stopped'].includes(item.status)).map((item, index) => {
    let id = typeof item.id === 'string' && item.id ? item.id : `legacy-${item.at}-${index}`;
    if (ids.has(id)) id = `${id}-${index}`;
    ids.add(id);
    return { ...item, id, seconds: Math.max(0, item.seconds),
      outcome: ['get', 'err', 'unverified'].includes(item.outcome) ? item.outcome : item.status === 'confirmed' ? 'get' : 'unverified',
      snapshot: item.snapshot?.settings ? { ...item.snapshot, watch: watchMetadata(item.snapshot.watch), settings: normalizePreferences(item.snapshot.settings) } : null };
  });
}

export function createSnapshot(preferences, profile, deviceLabel, reference) {
  return { settings: normalizePreferences(preferences), profileId: profile?.id || null,
    watch: watchMetadata(profile), deviceLabel: text(deviceLabel, 160),
    reference: reference ? { host: reference.host, offsetMs: reference.offsetMs, uncertaintyMs: reference.uncertaintyMs,
      synchronizedAt: reference.synchronizedAt } : null };
}

export function createTrial(session, status, endedAt, reason = '') {
  return { id: crypto.randomUUID(), at: session.createdAt, endedAt, status, outcome: status === 'confirmed' ? 'get' : 'unverified',
    seconds: Math.max(0, Math.round((Math.min(endedAt, session.endEpoch) - session.startEpoch) / 1000)),
    stationId: session.stationId, source: session.snapshot.reference?.host || 'System clock',
    snapshot: structuredClone(session.snapshot), sampleRate: session.sampleRate, latencyMs: session.latencyMs,
    endVolume: session.endVolume ?? session.snapshot.settings.volume,
    volumeChanges: structuredClone(session.volumeChanges || []), reason: text(reason, 300) };
}

export function successfulConfiguration(trial) {
  if (trial.outcome !== 'get' || !trial.snapshot) return null;
  return { at: trial.at, trialId: trial.id, settings: normalizePreferences({ ...trial.snapshot.settings,
    volume: trial.endVolume ?? trial.snapshot.settings.volume }), watch: structuredClone(trial.snapshot.watch), deviceLabel: trial.snapshot.deviceLabel };
}
