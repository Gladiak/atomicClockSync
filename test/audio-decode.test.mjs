import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { getStation, stationFrameAt, stationEnvelope, audioEnvelope } from '../src/stations.mjs';

// Decode the emitted PCM without consulting the encoder's bits or parity checks.
// This covers continuous playback and the repeated hour at the autumn DST change.
for (const profile of ['sine', 'sine-gated']) {
  test(`DCF77 ${profile}: decode time, date, parity and DST from three minutes of PCM`, () => {
    const rate = 48000, frames = 3, start = Date.parse('2026-10-25T00:58:00Z');
    let Processor;
    const scope = { getStation, stationFrameAt, audioEnvelope, currentTime: 0, sampleRate: rate,
      AudioWorkletProcessor: class { constructor() { this.port = { postMessage() {} }; } },
      registerProcessor: (_, processor) => { Processor = processor; } };
    vm.createContext(scope);
    vm.runInContext(fs.readFileSync(new URL('../src/signal-worklet.mjs', import.meta.url), 'utf8').replace(/^import .*;\n/, ''), scope);
    const generator = new Processor({ processorOptions: { epochAtZero: start, startEpoch: start,
      endEpoch: start + frames * 60000, volume: .3, wave: profile, stationId: 'dcf77' } });
    const samples = frames * 60 * rate, levels = new Float32Array(samples / 48);
    const left = new Float32Array(128), right = new Float32Array(128);
    let sum = 0, n = 0, bin = 0;
    for (let base = 0; base < samples; base += 128) {
      scope.currentTime = base / rate;
      generator.process([], [[left, right]]);
      if (base % (60 * rate) === 0) assert.deepEqual(left, right);
      for (let i = 0; i < 128 && base + i < samples; i++) {
        sum += left[i] ** 2;
        if (++n === 48) { levels[bin++] = Math.sqrt(sum / 48); sum = 0; n = 0; }
      }
    }
    const bcd = (bits, offset, length) => {
      const value = bits.slice(offset, offset + length).reduce((a, b, i) => a + b * 2 ** i, 0);
      return (value & 15) + 10 * (value >> 4);
    };
    for (let f = 0; f < frames; f++) {
      const bits = [];
      for (let second = 0; second < 59; second++) {
        const offset = f * 60000 + second * 1000;
        let width = 0;
        while (width < 1000 && levels[offset + width] < .1) width++;
        assert.ok(Math.abs(width - 100) <= 1 || Math.abs(width - 200) <= 1, `Invalid pulse ${f}:${second}: ${width} ms`);
        bits.push(width > 150 ? 1 : 0);
        const low = levels[offset + 50];
        if (profile === 'sine-gated') assert.equal(low, 0, 'Gated pulse must be silent');
        else assert.ok(Math.abs(low - .3 * .15 / Math.sqrt(2)) < .001, 'Standard pulse must retain 15% amplitude');
        for (let ms = width + 1; ms < 990; ms++) assert.ok(levels[offset + ms] > .1, 'Unexpected gap in carrier');
      }
      for (let ms = 0; ms < 990; ms++) assert.ok(levels[f * 60000 + 59000 + ms] > .1, 'Minute marker must remain high');
      for (const [a, b] of [[21, 28], [29, 35], [36, 58]]) {
        assert.equal(bits.slice(a, b + 1).reduce((x, y) => x + y, 0) % 2, 0, 'Even parity');
      }
      assert.equal(bits[20], 1);
      assert.deepEqual([bits[17], bits[18]], f === 0 ? [1, 0] : [0, 1]);
      assert.deepEqual([bcd(bits, 29, 6), bcd(bits, 21, 7), bcd(bits, 36, 6), bcd(bits, 45, 5), bcd(bits, 50, 8)],
        [2, [59, 0, 1][f], 25, 10, 26]);
      assert.equal(bits[42] + 2 * bits[43] + 4 * bits[44], 7);
    }
  });
}

test('DCF77 audio compatibility profile leaves other station envelopes unchanged', () => {
  for (const id of ['jjy', 'wwvb', 'msf', 'bpc']) {
    const frame = stationFrameAt(id, Date.parse('2026-10-25T10:00:00Z'));
    for (let second = 0; second < frame.duration; second++) {
      for (const fraction of [.05, .15, .25, .55, .85]) {
        assert.equal(audioEnvelope(frame, second, fraction, 'sine-gated'), stationEnvelope(frame, second, fraction));
      }
    }
  }
});
