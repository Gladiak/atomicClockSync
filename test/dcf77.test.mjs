import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { frameAt, germanTime, bcd, parity, envelope, pulseDuration } from '../src/dcf77.mjs';
import { getStation, stationFrameAt, audioEnvelope, stationEnvelope } from '../src/stations.mjs';

const epoch = iso => Date.parse(iso);
const unbcd = bits => bits.slice(0, 4).reduce((v, b, i) => v + b * 2 ** i, 0)
  + 10 * bits.slice(4).reduce((v, b, i) => v + b * 2 ** i, 0);

test('BCD encodes decimal digits separately, least significant bit first', () => {
  assert.deepEqual(bcd(35, 7), [1, 0, 1, 0, 1, 1, 0]);
  assert.deepEqual(bcd(14, 6), [0, 0, 1, 0, 1, 0]);
});

test('a frame encodes the following minute with independent even parities', () => {
  const frame = frameAt(epoch('2026-01-15T13:34:20Z'));
  assert.equal(frame.bits.length, 60);
  assert.equal(frame.target, epoch('2026-01-15T13:35:00Z'));
  assert.equal(unbcd(frame.bits.slice(21, 28)), 35);
  assert.equal(unbcd(frame.bits.slice(29, 35)), 14);
  assert.equal(unbcd(frame.bits.slice(36, 42)), 15);
  assert.equal(unbcd(frame.bits.slice(42, 45)), 4);
  assert.equal(unbcd(frame.bits.slice(45, 50)), 1);
  assert.equal(unbcd(frame.bits.slice(50, 58)), 26);
  assert.equal(frame.bits[0], 0);
  assert.equal(frame.bits[20], 1);
  assert.equal(frame.bits[59], -1);
  for (const bits of [frame.bits.slice(21, 29), frame.bits.slice(29, 36), frame.bits.slice(36, 59)]) assert.equal(parity(bits), 0);
  assert.deepEqual(frame.bits.slice(17, 19), [0, 1]);
});

test('DST starts with 03:00 CEST and ends with the repeated 02:00 CET', () => {
  const spring = frameAt(epoch('2026-03-29T00:59:00Z'));
  assert.equal(spring.time.hour, 3);
  assert.equal(spring.time.minute, 0);
  assert.deepEqual(spring.bits.slice(16, 19), [1, 1, 0]);
  const autumn = frameAt(epoch('2026-10-25T00:59:00Z'));
  assert.equal(autumn.time.hour, 2);
  assert.equal(autumn.time.minute, 0);
  assert.deepEqual(autumn.bits.slice(16, 19), [1, 0, 1]);
  assert.equal(frameAt(epoch('2026-10-25T01:00:00Z')).bits[16], 0);
});

test('A1 is set for the entire hour before the transition, and only that hour', () => {
  assert.equal(frameAt(epoch('2026-03-28T23:59:00Z')).bits[16], 0);
  assert.equal(frameAt(epoch('2026-03-29T00:00:00Z')).bits[16], 1);
  assert.equal(frameAt(epoch('2026-03-29T01:00:00Z')).bits[16], 0);
});

test('leap days, Sunday, midnight and year rollovers use German civil time', () => {
  const leap = frameAt(epoch('2028-02-28T22:59:00Z'));
  assert.equal(leap.time.day, 29);
  const newYear = frameAt(epoch('2026-12-31T22:59:00Z'));
  assert.equal(newYear.time.year, 2027);
  assert.equal(newYear.time.month, 1);
  assert.equal(newYear.time.day, 1);
  assert.equal(newYear.time.hour, 0);
  assert.equal(germanTime(epoch('2026-10-25T12:00:00Z')).weekday, 7);
});

test('all 1500 frames of the autumn DST day decode and have correct parity', () => {
  const start = epoch('2026-10-24T22:00:00Z');
  for (let i = 0; i < 1500; i++) {
    const frame = frameAt(start + i * 60000);
    assert.equal(unbcd(frame.bits.slice(21, 28)), frame.time.minute);
    assert.equal(unbcd(frame.bits.slice(29, 35)), frame.time.hour);
    assert.equal(unbcd(frame.bits.slice(36, 42)), frame.time.day);
    for (const group of [frame.bits.slice(21, 29), frame.bits.slice(29, 36), frame.bits.slice(36, 59)]) assert.equal(parity(group), 0);
  }
});

test('AM envelope reduces to 15% for 100/200ms; second 59 has no reduction', () => {
  assert.equal(pulseDuration(0), 0.1);
  assert.equal(pulseDuration(1), 0.2);
  assert.equal(envelope(0, 0.099), 0.15);
  assert.equal(envelope(0, 0.1), 1);
  assert.equal(envelope(1, 0.199), 0.15);
  assert.equal(envelope(1, 0.2), 1);
  assert.equal(envelope(-1, 0), 1);
});

test('real AudioWorklet code renders sample envelopes, stereo, marker and automatic end', () => {
  let Processor;
  const messages = [];
  const scope = { getStation, stationFrameAt, audioEnvelope, stationEnvelope, currentTime: 0, sampleRate: 48000,
    AudioWorkletProcessor: class { constructor() { this.port = { postMessage: value => messages.push(value) }; } },
    registerProcessor: (_name, processor) => { Processor = processor; } };
  vm.createContext(scope);
  vm.runInContext(fs.readFileSync(new URL('../src/signal-worklet.mjs', import.meta.url), 'utf8').replace(/^import .*;\n/, ''), scope);
  const start = epoch('2026-01-15T13:34:00Z');
  const worklet = new Processor({ processorOptions: { epochAtZero: start, startEpoch: start, endEpoch: start + 60000, volume: 0.3, wave: 'square' } });
  function sampleAt(second) {
    scope.currentTime = second;
    const channels = [new Float32Array(128), new Float32Array(128)];
    const running = worklet.process([], [channels]);
    assert.deepEqual(channels[0], channels[1]);
    return { amplitude: Math.abs(channels[0][0]), running };
  }
  assert.ok(Math.abs(sampleAt(0.05).amplitude - 0.045) < 1e-6);
  assert.ok(Math.abs(sampleAt(0.15).amplitude - 0.3) < 1e-6);
  // Minute 35 has its least significant bit set at second 21.
  assert.ok(Math.abs(sampleAt(21.15).amplitude - 0.045) < 1e-6);
  assert.ok(Math.abs(sampleAt(21.25).amplitude - 0.3) < 1e-6);
  assert.ok(Math.abs(sampleAt(59.05).amplitude - 0.3) < 1e-6);
  assert.equal(sampleAt(60).running, false);
  assert.equal(messages[0].type, 'complete');
});

test('the default sine carrier is 15500 Hz and stays continuous between audio blocks', () => {
  let Processor;
  const scope = { getStation, stationFrameAt, audioEnvelope, stationEnvelope, currentTime: 0.3, sampleRate: 48000,
    AudioWorkletProcessor: class { constructor() { this.port = { postMessage() {} }; } },
    registerProcessor: (_name, processor) => { Processor = processor; } };
  vm.createContext(scope);
  vm.runInContext(fs.readFileSync(new URL('../src/signal-worklet.mjs', import.meta.url), 'utf8').replace(/^import .*;\n/, ''), scope);
  const start = epoch('2026-01-15T13:34:00Z');
  const worklet = new Processor({ processorOptions: { epochAtZero: start, startEpoch: start, endEpoch: start + 120000, volume: 0.3, wave: 'sine' } });
  const samples = [];
  for (let block = 0; block < 75; block++) {
    scope.currentTime = 0.3 + block * 128 / 48000;
    const output = new Float32Array(128);
    worklet.process([], [[output]]);
    samples.push(...output);
  }
  const maxError = samples.reduce((max, value, i) => Math.max(max, Math.abs(value - 0.3 * Math.sin(i * 2 * Math.PI * 15500 / 48000))), 0);
  assert.ok(maxError < 1e-6, `carrier phase/amplitude error: ${maxError}`);
  scope.currentTime = 60.15;
  const output = new Float32Array(128);
  worklet.process([], [[output]]);
  assert.equal(worklet.frame.start, start + 60000);
});
