const test = require('node:test');
const assert = require('node:assert/strict');
const { readTimestamp, parseReply } = require('../electron/ntp.cjs');

function writeTime(buffer, offset, ms) {
  const seconds = ms / 1000 + 2208988800;
  buffer.writeUInt32BE(Math.floor(seconds) >>> 0, offset);
  buffer.writeUInt32BE(Math.floor((seconds - Math.floor(seconds)) * 2 ** 32) >>> 0, offset + 4);
}
function reply() {
  const packet = Buffer.alloc(48);
  packet[0] = 0x24;
  packet[1] = 1;
  const nonce = Buffer.from('12345678');
  nonce.copy(packet, 24);
  const t1 = Date.parse('2026-10-25T12:00:00Z');
  writeTime(packet, 32, t1 + 120);
  writeTime(packet, 40, t1 + 122);
  return { packet, nonce, t1, t4: t1 + 42 };
}

test('NTP computes four-timestamp offset and excludes server processing time', () => {
  const { packet, nonce, t1, t4 } = reply();
  const result = parseReply(packet, nonce, t1, t4);
  assert.ok(Math.abs(result.offsetMs - 100) < 0.01);
  assert.ok(Math.abs(result.rttMs - 40) < 0.01);
  assert.ok(Math.abs(result.uncertaintyMs - 20) < 0.01);
});

test('rejects spoofed, unsynchronized, kiss-of-death and malformed NTP replies', () => {
  for (const mutate of [p => { p[24] = 0; }, p => { p[0] = 0xe4; }, p => { p[1] = 0; }, p => { p[0] = 0x23; }, p => { p[1] = 16; }, p => p.fill(0, 32, 40)]) {
    const { packet, nonce, t1, t4 } = reply();
    mutate(packet);
    assert.throws(() => parseReply(packet, nonce, t1, t4));
  }
  assert.throws(() => parseReply(Buffer.alloc(10), Buffer.alloc(8), 0, 0));
});

test('NTP timestamp decoding handles the 2036 era rollover', () => {
  for (const iso of ['2026-10-25T12:34:56.125Z', '2036-02-08T12:34:56.500Z', '2040-01-01T00:00:00Z']) {
    const reference = Date.parse(iso);
    const packet = Buffer.alloc(8);
    writeTime(packet, 0, reference);
    assert.ok(Math.abs(readTimestamp(packet, 0, reference) - reference) < 0.01);
  }
});
