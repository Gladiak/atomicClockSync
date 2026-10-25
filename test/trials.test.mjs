import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, normalizePreferences, normalizeProfiles, normalizeHistory, createSnapshot, createTrial, successfulConfiguration } from '../src/trials.mjs';

test('old preferences migrate to both channels and keep their existing settings', () => {
  const prefs = normalizePreferences({ volume: 47, duration: 15, wave: 'sine-gated', stationId: 'dcf77', advanceMs: -80 });
  assert.equal(prefs.channel, 'both');
  assert.equal(prefs.volume, 47);
  assert.equal(prefs.wave, 'sine-gated');
  assert.equal(prefs.advanceMs, -80);
  assert.equal(normalizePreferences({ stationId: 'msf', wave: 'sine-gated' }).wave, 'sine');
  assert.equal(normalizePreferences({ channel: 'toString' }).channel, 'both');
  assert.deepEqual(normalizePreferences(null), DEFAULTS);
});

test('profile migration retains separate configurations and rejects duplicate IDs', () => {
  const profiles = normalizeProfiles([
    { id: 'casio', name: ' G-Shock ', model: 'GW-6900', homeCity: 'rom', position: 'Left speaker', systemVolume: 35,
      settings: { channel: 'left', wave: 'sine-gated' } },
    { id: 'other', name: 'Other Casio', settings: { stationId: 'jjy', channel: 'right', duration: 15 } },
    { id: 'casio', name: 'Duplicato' }, null,
  ]);
  assert.equal(profiles.length, 2);
  assert.equal(profiles[0].name, 'G-Shock');
  assert.equal(profiles[0].homeCity, 'ROM');
  assert.equal(profiles[0].systemVolume, '35');
  assert.equal(profiles[0].settings.channel, 'left');
  assert.equal(profiles[1].settings.channel, 'right');
});

test('full history migration preserves more than eight trials and marks legacy configuration as unknown', () => {
  const legacy = Array.from({ length: 30 }, (_, i) => ({ at: 1000 + i, seconds: 120, status: i === 0 ? 'confirmed' : 'complete', stationId: 'dcf77' }));
  const history = normalizeHistory(legacy);
  assert.equal(history.length, 30);
  assert.equal(history[0].outcome, 'get');
  assert.equal(history[1].outcome, 'unverified');
  assert.ok(history.every(item => item.snapshot === null));
  assert.deepEqual(normalizeHistory(JSON.parse(JSON.stringify(history))), history);
  assert.equal(normalizeHistory(null).length, 0);
  assert.equal(new Set(normalizeHistory([history[0], history[0]]).map(t => t.id)).size, 2);
});

test('a trial snapshots the starting configuration, live volume changes and NTP reference independently of later edits', () => {
  const settings = normalizePreferences({ channel: 'right', volume: 31, duration: 15 });
  const profile = { id: 'watch-1', name: 'Casio', model: 'GW-6900', homeCity: 'ROM', position: 'Hours 12 a sinistra', systemVolume: '45' };
  const reference = { host: 'ptb.example', offsetMs: 2.5, uncertaintyMs: 4, synchronizedAt: 1000 };
  const snapshot = createSnapshot(settings, profile, 'Mac speakers', reference);
  settings.volume = 50; profile.position = 'New placement'; reference.host = 'other.example';
  const session = { snapshot, createdAt: 2000, startEpoch: 3000, endEpoch: 903000, stationId: 'dcf77', sampleRate: 48000,
    latencyMs: 12, endVolume: 25, volumeChanges: [{ elapsedMs: 10000, value: 25 }] };
  const trial = createTrial(session, 'confirmed', 123000);
  session.snapshot.settings.channel = 'left'; session.volumeChanges[0].value = 80;
  assert.equal(trial.seconds, 120);
  assert.equal(trial.outcome, 'get');
  assert.equal(trial.snapshot.settings.channel, 'right');
  assert.equal(trial.snapshot.settings.volume, 31);
  assert.equal(trial.snapshot.watch.position, 'Hours 12 a sinistra');
  assert.equal(trial.snapshot.reference.host, 'ptb.example');
  assert.equal(trial.volumeChanges[0].value, 25);
  const success = successfulConfiguration(trial);
  assert.equal(success.settings.volume, 25);
  assert.equal(success.settings.channel, 'right');
  success.settings.volume = 70;
  assert.equal(trial.endVolume, 25);
});

test('completing the timer does not claim reception and duration excludes initial alignment', () => {
  const snapshot = createSnapshot(DEFAULTS, null, 'Default', null);
  const session = { snapshot, createdAt: 1000, startEpoch: 5000, endEpoch: 65000, stationId: 'dcf77' };
  const early = createTrial(session, 'stopped', 2000);
  const complete = createTrial(session, 'complete', 70000);
  assert.equal(early.seconds, 0);
  assert.equal(complete.seconds, 60);
  assert.equal(complete.outcome, 'unverified');
  assert.equal(successfulConfiguration(complete), null);
  assert.equal(complete.source, 'System clock');
  assert.equal(complete.snapshot.profileId, null);
});
