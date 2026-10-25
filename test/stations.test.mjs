import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { STATIONS, getStation, stationTime, stationFrameAt, audioEnvelope, stationEnvelope, symbolLabel } from '../src/stations.mjs';

const epoch = Date.parse;
const read = (bits, positions, weights) => positions.reduce((sum, p, i) => sum + bits[p] * weights[i], 0);
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const minutes = [1, 2, 3, 5, 6, 7, 8], minuteWeights = [40, 20, 10, 8, 4, 2, 1];
const hours = [12, 13, 15, 16, 17, 18], hourWeights = [20, 10, 8, 4, 2, 1];
const days = [22, 23, 25, 26, 27, 28, 30, 31, 32, 33], dayWeights = [200, 100, 80, 40, 20, 10, 8, 4, 2, 1];

test('five distinct stations use the requested carriers and exact audio subharmonics', () => {
  assert.deepEqual(STATIONS.map(s => s.name), ['BPC', 'JJY', 'WWVB', 'DCF77', 'MSF']);
  assert.deepEqual(STATIONS.map(s => s.frequency), [68500, 60000, 60000, 77500, 60000]);
  for (const station of STATIONS) {
    assert.equal(station.audioFrequency * station.harmonic, station.frequency);
    assert.ok(station.audioFrequency < 24000);
  }
  assert.throws(() => getStation('unknown'));
});

test('station local dates are independent of the computer timezone', () => {
  const stamp = epoch('2026-01-15T23:34:00Z');
  const expected = { bpc: [7, 16, 480], jjy: [8, 16, 540], wwvb: [23, 15, 0], dcf77: [0, 16, 60], msf: [23, 15, 0] };
  for (const station of STATIONS) {
    const t = stationTime(station.id, stamp);
    assert.deepEqual([t.hour, t.day, t.offsetMinutes], expected[station.id]);
  }
});

test('JJY matches the NICT example: 2004 day 92 (April 1), Thursday, 17:25 JST', () => {
  const frame = stationFrameAt('jjy', epoch('2004-04-01T08:25:30Z'));
  assert.equal(frame.target, epoch('2004-04-01T08:25:00Z'));
  assert.equal(read(frame.bits, minutes, minuteWeights), 25);
  assert.equal(read(frame.bits, hours, hourWeights), 17);
  assert.equal(read(frame.bits, days, dayWeights), 92);
  assert.equal(read(frame.bits, range(41, 48), [80, 40, 20, 10, 8, 4, 2, 1]), 4);
  assert.equal(read(frame.bits, [50, 51, 52], [4, 2, 1]), 4);
  assert.deepEqual(frame.bits.map((v, i) => v === -1 ? i : -1).filter(v => v >= 0), [0, 9, 19, 29, 39, 49, 59]);
  assert.equal(frame.bits[36], 0); // 17 = 10+4+2+1: four data bits set.
  assert.equal(frame.bits[37], 1); // 25 = 20+4+1: three data bits set.
});

test('JJY parity covers actual BCD data and Sunday is zero', () => {
  const frame = stationFrameAt('jjy', epoch('2026-10-25T03:47:00Z'));
  assert.ok(frame.checks.every(c => c.ok));
  assert.equal(read(frame.bits, [50, 51, 52], [4, 2, 1]), 0);
  const sum = positions => positions.reduce((a, p) => a + frame.bits[p], 0);
  assert.equal((sum(hours) + frame.bits[36]) % 2, 0);
  assert.equal((sum(minutes) + frame.bits[37]) % 2, 0);
});

test('WWVB matches the NIST legacy example date/time fields: 1990 day 258, 18:42 UTC', () => {
  const frame = stationFrameAt('wwvb', epoch('1990-09-15T18:42:20Z'));
  assert.equal(read(frame.bits, minutes, minuteWeights), 42);
  assert.equal(read(frame.bits, hours, hourWeights), 18);
  assert.equal(read(frame.bits, days, dayWeights), 258);
  assert.equal(read(frame.bits, [45, 46, 47, 48, 50, 51, 52, 53], [80, 40, 20, 10, 8, 4, 2, 1]), 90);
  assert.equal(frame.bits[55], 0);
  assert.equal(frame.target, epoch('1990-09-15T18:42:00Z'));
});

test('WWVB flags US DST transition days and leap years in UTC, not local computer time', () => {
  assert.deepEqual(stationFrameAt('wwvb', epoch('2026-03-08T12:00:00Z')).bits.slice(57, 59), [1, 0]);
  assert.deepEqual(stationFrameAt('wwvb', epoch('2026-11-01T12:00:00Z')).bits.slice(57, 59), [0, 1]);
  assert.deepEqual(stationFrameAt('wwvb', epoch('2026-07-01T12:00:00Z')).bits.slice(57, 59), [1, 1]);
  assert.equal(stationFrameAt('wwvb', epoch('2028-02-29T00:00:00Z')).bits[55], 1);
});

test('MSF uses following UK minute, BCD, A/B symbols and four odd parities', () => {
  const frame = stationFrameAt('msf', epoch('2026-07-15T12:34:45Z'));
  assert.equal(frame.time.hour, 13);
  assert.equal(frame.time.minute, 35);
  assert.equal(read(frame.bits, range(17, 24), [80, 40, 20, 10, 8, 4, 2, 1]), 26);
  assert.equal(read(frame.bits, range(25, 29), [10, 8, 4, 2, 1]), 7);
  assert.equal(read(frame.bits, range(30, 35), [20, 10, 8, 4, 2, 1]), 15);
  assert.equal(read(frame.bits, range(39, 44), hourWeights), 13);
  assert.equal(read(frame.bits, range(45, 51), minuteWeights), 35);
  assert.deepEqual(frame.bits.slice(52), [0, 1, 1, 1, 1, 1, 1, 0]);
  assert.equal(frame.secondary[58], 1);
  for (const [a, b, p] of [[17, 24, 54], [25, 35, 55], [36, 38, 56], [39, 51, 57]]) {
    assert.equal((frame.bits.slice(a, b + 1).reduce((sum, x) => sum + x, 0) + frame.secondary[p]) % 2, 1);
  }
  assert.equal(symbolLabel(frame, 54), `1${frame.secondary[54]}`);
});

test('MSF announces a UK DST transition for 61 minutes and encodes the post-transition time', () => {
  assert.equal(stationFrameAt('msf', epoch('2026-03-28T23:58:00Z')).secondary[53], 0);
  assert.equal(stationFrameAt('msf', epoch('2026-03-28T23:59:00Z')).secondary[53], 1);
  const frame = stationFrameAt('msf', epoch('2026-03-29T00:59:00Z'));
  assert.equal(frame.time.hour, 2);
  assert.equal(frame.secondary[58], 1);
  assert.equal(stationFrameAt('msf', epoch('2026-03-29T01:00:00Z')).secondary[53], 0);
});

test('BPC matches three independently recorded frames from 10 January 2026 in Jinan', () => {
  const examples = [
    ['2026-01-10T08:34:40Z', '10 00 0100 100010 0110 10 001010 0001 011010 00'],
    ['2026-01-10T08:35:00Z', '00 00 0100 100011 0110 10 001010 0001 011010 00'],
    ['2026-01-10T08:35:20Z', '01 00 0100 100011 0110 11 001010 0001 011010 00'],
  ];
  for (const [iso, expected] of examples) {
    const frame = stationFrameAt('bpc', epoch(iso));
    assert.equal(frame.raw.join(''), expected.replaceAll(' ', ''));
    assert.equal(frame.duration, 20);
    assert.equal(frame.bits[0], -1);
    assert.ok(frame.checks.every(c => c.ok));
  }
});

test('BPC separates the 64-year flag and PM flag from their even parity groups', () => {
  const frame = stationFrameAt('bpc', epoch('2099-12-31T15:59:55Z'));
  assert.equal(frame.time.hour, 23);
  assert.equal(frame.raw[18], 1);
  assert.equal(frame.raw[36], 1);
  assert.equal(read(frame.raw, range(30, 35), [32, 16, 8, 4, 2, 1]) + frame.raw[36] * 64, 99);
  assert.ok(frame.checks.every(c => c.ok));
});

test('modulation profiles distinguish JJY high pulses, WWVB low pulses, MSF A/B and BPC symbols', () => {
  const stamp = epoch('2026-01-10T08:34:00Z');
  const jjy = stationFrameAt('jjy', stamp), wwvb = stationFrameAt('wwvb', stamp), msf = stationFrameAt('msf', stamp), bpc = stationFrameAt('bpc', stamp);
  assert.equal(stationEnvelope(jjy, 0, 0.1), 1);
  assert.equal(stationEnvelope(jjy, 0, 0.3), 0.1);
  assert.ok(stationEnvelope(wwvb, 0, 0.7) < 0.15);
  assert.equal(stationEnvelope(wwvb, 0, 0.9), 1);
  assert.equal(stationEnvelope(msf, 0, 0.4), 0);
  assert.equal(stationEnvelope(msf, 0, 0.6), 1);
  msf.bits[10] = 0; msf.secondary[10] = 1;
  assert.equal(stationEnvelope(msf, 10, 0.05), 0);
  assert.equal(stationEnvelope(msf, 10, 0.15), 1);
  assert.equal(stationEnvelope(msf, 10, 0.25), 0);
  assert.equal(stationEnvelope(msf, 10, 0.35), 1);
  assert.equal(stationEnvelope(bpc, 0, 0.05), 1);
  for (let value = 0; value <= 3; value++) {
    bpc.bits[1] = value;
    assert.equal(stationEnvelope(bpc, 1, (value + 1) / 10 - .001), 0.1);
    assert.equal(stationEnvelope(bpc, 1, (value + 1) / 10), 1);
  }
});

test('every station worklet renders its own carrier with correct phase and AM envelope', () => {
  const code = fs.readFileSync(new URL('../src/signal-worklet.mjs', import.meta.url), 'utf8').replace(/^import .*;\n/, '');
  for (const station of STATIONS) {
    let Processor;
    const stamp = epoch('2026-01-10T08:34:00Z');
    const scope = { getStation, stationFrameAt, audioEnvelope, stationEnvelope, currentTime: 0.05, sampleRate: 48000,
      AudioWorkletProcessor: class { constructor() { this.port = { postMessage() {} }; } },
      registerProcessor: (_name, processor) => { Processor = processor; } };
    vm.createContext(scope); vm.runInContext(code, scope);
    const processor = new Processor({ processorOptions: { epochAtZero: stamp, startEpoch: stamp, endEpoch: stamp + 120000, volume: .3, wave: 'sine', stationId: station.id } });
    const output = new Float32Array(128);
    processor.process([], [[output]]);
    const frame = stationFrameAt(station.id, stamp);
    for (let i = 0; i < output.length; i++) {
      const expected = .3 * Math.sin(i * 2 * Math.PI * station.audioFrequency / 48000) * stationEnvelope(frame, 0, .05 + i / 48000);
      assert.ok(Math.abs(output[i] - expected) < 1e-6, `${station.name}: sample ${i}`);
    }
    scope.currentTime = station.cycle + .05;
    processor.process([], [[output]]);
    assert.equal(processor.frame.start, stamp + station.cycle * 1000);
  }
});

test('left and right routing mute the other PCM channel without changing active amplitude, phase or modulation', () => {
  const code = fs.readFileSync(new URL('../src/signal-worklet.mjs', import.meta.url), 'utf8').replace(/^import .*;\n/, '');
  for (const station of STATIONS) {
    for (const wave of ['sine', 'square', 'sine-gated']) {
      const outputs = {};
      for (const channel of ['both', 'left', 'right']) {
        let Processor;
        const stamp = epoch('2026-01-10T08:34:00Z');
        const scope = { getStation, stationFrameAt, audioEnvelope, currentTime: .85, sampleRate: 48000,
          AudioWorkletProcessor: class { constructor() { this.port = { postMessage() {} }; } },
          registerProcessor: (_, processor) => { Processor = processor; } };
        vm.createContext(scope); vm.runInContext(code, scope);
        const processor = new Processor({ processorOptions: { epochAtZero: stamp, startEpoch: stamp, endEpoch: stamp + 120000,
          volume: .3, wave, channel, stationId: station.id } });
        outputs[channel] = [new Float32Array(256), new Float32Array(256)];
        processor.process([], [outputs[channel]]);
      }
      assert.ok(outputs.both[0].some(value => Math.abs(value) > .01));
      assert.deepEqual(outputs.both[0], outputs.both[1]);
      assert.deepEqual(outputs.left[0], outputs.both[0]);
      assert.deepEqual(outputs.right[1], outputs.both[1]);
      assert.ok(outputs.left[1].every(value => value === 0));
      assert.ok(outputs.right[0].every(value => value === 0));
    }
  }
});
