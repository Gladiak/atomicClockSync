// DCF77 AM time code, based on the PTB specification. All inputs are UTC epochs.
const berlin = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});

export function germanTime(epoch) {
  const parts = Object.fromEntries(berlin.formatToParts(new Date(epoch))
    .filter(p => p.type !== 'literal').map(p => [p.type, Number(p.value)]));
  const local = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  const offsetMinutes = Math.round((local - Math.floor(epoch / 1000) * 1000) / 60000);
  return { ...parts, offsetMinutes, summer: offsetMinutes === 120,
    weekday: new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay() || 7 };
}

export function bcd(value, length) {
  const packed = Math.floor(value / 10) * 16 + value % 10;
  return Array.from({ length }, (_, i) => (packed >> i) & 1);
}

export function parity(bits) { return bits.reduce((sum, bit) => sum + bit, 0) % 2; }

export function frameAt(epoch) {
  const start = Math.floor(epoch / 60000) * 60000;
  const target = start + 60000;
  const time = germanTime(target);
  const bits = Array(60).fill(0);
  // A1 is asserted throughout the hour before a CET/CEST transition.
  bits[16] = Number(germanTime(start).offsetMinutes !== germanTime(start + 3600000).offsetMinutes);
  bits[17] = Number(time.summer);
  bits[18] = Number(!time.summer);
  // A2 is zero: inserting leap seconds is deliberately not simulated.
  bits[20] = 1;
  bits.splice(21, 7, ...bcd(time.minute, 7));
  bits[28] = parity(bits.slice(21, 28));
  bits.splice(29, 6, ...bcd(time.hour, 6));
  bits[35] = parity(bits.slice(29, 35));
  bits.splice(36, 6, ...bcd(time.day, 6));
  bits.splice(42, 3, ...bcd(time.weekday, 3));
  bits.splice(45, 5, ...bcd(time.month, 5));
  bits.splice(50, 8, ...bcd(time.year % 100, 8));
  bits[58] = parity(bits.slice(36, 58));
  bits[59] = -1; // No reduction at second 59: the minute marker.
  return { start, target, time, bits };
}

export function pulseDuration(bit) { return bit === -1 ? 0 : bit === 1 ? 0.2 : 0.1; }

export function envelope(bit, fraction) {
  return fraction < pulseDuration(bit) ? 0.15 : 1;
}

export const FIELDS = [
  { start: 0, end: 14, name: 'Reserved', kind: 'reserved' },
  { start: 15, end: 20, name: 'Status and zone', kind: 'zone' },
  { start: 21, end: 28, name: 'Minutes · P1', kind: 'minute' },
  { start: 29, end: 35, name: 'Hours · P2', kind: 'hour' },
  { start: 36, end: 58, name: 'Date · P3', kind: 'date' },
  { start: 59, end: 59, name: 'Marker', kind: 'marker' },
];
