import { frameAt as dcfFrame, FIELDS as DCF_FIELDS, parity, envelope as dcfEnvelope } from './dcf77.mjs';

export const STATIONS = Object.freeze([
  { id: 'bpc', name: 'BPC', location: 'Shangqiu, Henan, Cina', country: 'Cina', flag: '🇨🇳', coordinates: '34°27′ N · 115°50′ E', frequency: 68500, harmonic: 5, timeZone: 'Asia/Shanghai', cycle: 20, cities: 'BJS / HKG', zone: 'CST', experimental: true },
  { id: 'jjy', name: 'JJY', location: 'Haganeyama, area di Fukuoka, Giappone', country: 'Giappone', flag: '🇯🇵', coordinates: '33°28′ N · 130°11′ E', frequency: 60000, harmonic: 3, timeZone: 'Asia/Tokyo', cycle: 60, cities: 'TYO', zone: 'JST' },
  { id: 'wwvb', name: 'WWVB', location: 'Fort Collins, Colorado, USA', country: 'Stati Uniti', flag: '🇺🇸', coordinates: '40°41′ N · 105°03′ W', frequency: 60000, harmonic: 3, timeZone: 'UTC', cycle: 60, cities: 'NYC / CHI / DEN / LAX', zone: 'UTC' },
  { id: 'dcf77', name: 'DCF77', location: 'Mainflingen, Germania', country: 'Germania', flag: '🇩🇪', coordinates: '50°01′ N · 09°00′ E', frequency: 77500, harmonic: 5, timeZone: 'Europe/Berlin', cycle: 60, cities: 'ROM / BER / PAR', zone: 'CET / CEST' },
  { id: 'msf', name: 'MSF', location: 'Anthorn, Cumbria, Regno Unito', country: 'Regno Unito', flag: '🇬🇧', coordinates: '54°55′ N · 03°15′ W', frequency: 60000, harmonic: 3, timeZone: 'Europe/London', cycle: 60, cities: 'LON', zone: 'GMT / BST' },
].map(station => Object.freeze({ ...station, audioFrequency: station.frequency / station.harmonic })));

export function getStation(id = 'dcf77') {
  const station = STATIONS.find(item => item.id === id);
  if (!station) throw new Error(`Stazione sconosciuta: ${id}`);
  return station;
}

const formatters = new Map();
export function stationTime(id, epoch) {
  const station = getStation(id);
  if (!formatters.has(id)) formatters.set(id, new Intl.DateTimeFormat('en-GB', {
    timeZone: station.timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }));
  const parts = Object.fromEntries(formatters.get(id).formatToParts(new Date(epoch))
    .filter(p => p.type !== 'literal').map(p => [p.type, Number(p.value)]));
  const local = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  const offsetMinutes = Math.round((local - Math.floor(epoch / 1000) * 1000) / 60000);
  const weekday = new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
  const dayOfYear = Math.floor((Date.UTC(parts.year, parts.month - 1, parts.day) - Date.UTC(parts.year, 0, 1)) / 86400000) + 1;
  const zone = id === 'dcf77' ? (offsetMinutes === 120 ? 'CEST' : 'CET')
    : id === 'msf' ? (offsetMinutes === 60 ? 'BST' : 'GMT') : station.zone;
  return { ...parts, weekday, dayOfYear, offsetMinutes, zone };
}

function field(start, end, name, kind = 'date') { return { start, end, name, kind }; }
const MINUTE_POS = [1, 2, 3, 5, 6, 7, 8];
const HOUR_POS = [12, 13, 15, 16, 17, 18];
const DAY_POS = [22, 23, 25, 26, 27, 28, 30, 31, 32, 33];
const MINUTE_WEIGHTS = [40, 20, 10, 8, 4, 2, 1];
const HOUR_WEIGHTS = [20, 10, 8, 4, 2, 1];
const YEAR_WEIGHTS = [80, 40, 20, 10, 8, 4, 2, 1];

// Decimal-weighted BCD: hundreds, tens and units are encoded separately.
function putBCD(bits, value, positions, weights) {
  positions.forEach((position, i) => {
    const weight = weights[i];
    const decimal = weight >= 100 ? 100 : weight >= 10 ? 10 : 1;
    bits[position] = Number(Boolean((Math.floor(value / decimal) % 10) & (weight / decimal)));
  });
}
function putBinary(bits, value, start, length) {
  for (let i = 0; i < length; i++) bits[start + i] = (value >> (length - i - 1)) & 1;
}
function check(bits, positions, label, expected = 0) {
  return { label, ok: parity(positions.map(p => bits[p])) === expected };
}
function range(start, end) { return Array.from({ length: end - start + 1 }, (_, i) => start + i); }

// NIST DST bits describe the state at the beginning and end of the UTC day.
function usSummer(epoch) {
  const date = new Date(epoch);
  const y = date.getUTCFullYear();
  const secondSundayMarch = 8 + (7 - new Date(Date.UTC(y, 2, 8)).getUTCDay()) % 7;
  const firstSundayNovember = 1 + (7 - new Date(Date.UTC(y, 10, 1)).getUTCDay()) % 7;
  return epoch >= Date.UTC(y, 2, secondSundayMarch, 7) && epoch < Date.UTC(y, 10, firstSundayNovember, 6);
}

export function stationFrameAt(id, epoch) {
  const station = getStation(id);
  if (id === 'dcf77') {
    const result = dcfFrame(epoch);
    return { ...result, stationId: id, duration: 60, time: stationTime(id, result.target), fields: DCF_FIELDS,
      checks: [check(result.bits, range(21, 28), 'P1'), check(result.bits, range(29, 35), 'P2'), check(result.bits, range(36, 58), 'P3')],
      description: 'Ora del minuto successivo · marcatore al secondo 59' };
  }
  const start = Math.floor(epoch / (station.cycle * 1000)) * station.cycle * 1000;
  const target = id === 'msf' ? start + 60000 : start;
  const time = stationTime(id, target);
  const bits = Array(station.cycle).fill(0);
  const frame = { stationId: id, start, target, time, bits, duration: station.cycle, checks: [] };
  if (id === 'jjy' || id === 'wwvb') {
    [0, 9, 19, 29, 39, 49, 59].forEach(p => { bits[p] = -1; });
    putBCD(bits, time.minute, MINUTE_POS, MINUTE_WEIGHTS);
    putBCD(bits, time.hour, HOUR_POS, HOUR_WEIGHTS);
    putBCD(bits, time.dayOfYear, DAY_POS, [200, 100, 80, 40, 20, 10, 8, 4, 2, 1]);
    frame.fields = [field(0, 9, 'Minuti', 'minute'), field(10, 19, 'Ore', 'hour'), field(20, 33, 'Giorno dell’anno'), field(34, 40, 'Stato', 'zone'), field(41, 59, 'Anno e stato')];
    frame.description = 'Ora all’inizio del minuto · marcatori 0, 9, 19, 29, 39, 49, 59';
    if (id === 'jjy') {
      bits[36] = parity(HOUR_POS.map(p => bits[p]));
      bits[37] = parity(MINUTE_POS.map(p => bits[p]));
      putBCD(bits, time.year % 100, range(41, 48), YEAR_WEIGHTS);
      putBinary(bits, time.weekday, 50, 3);
      frame.checks = [check(bits, [...HOUR_POS, 36], 'PA1'), check(bits, [...MINUTE_POS, 37], 'PA2')];
    } else {
      // AM legacy code. DUT1=0, no leap second announcement, leap year and DST active.
      bits[36] = bits[38] = 1;
      putBCD(bits, time.year % 100, [45, 46, 47, 48, 50, 51, 52, 53], YEAR_WEIGHTS);
      bits[55] = Number(time.year % 4 === 0 && (time.year % 100 !== 0 || time.year % 400 === 0));
      const midnight = Date.UTC(time.year, time.month - 1, time.day);
      bits[57] = Number(usSummer(midnight + 86400000 - 1));
      bits[58] = Number(usSummer(midnight));
    }
    return frame;
  }
  if (id === 'msf') {
    const secondary = Array(60).fill(0);
    frame.secondary = secondary;
    bits[0] = -1;
    putBCD(bits, time.year % 100, range(17, 24), YEAR_WEIGHTS);
    putBCD(bits, time.month, range(25, 29), [10, 8, 4, 2, 1]);
    putBCD(bits, time.day, range(30, 35), [20, 10, 8, 4, 2, 1]);
    putBinary(bits, time.weekday, 36, 3);
    putBCD(bits, time.hour, range(39, 44), HOUR_WEIGHTS);
    putBCD(bits, time.minute, range(45, 51), MINUTE_WEIGHTS);
    for (let i = 53; i <= 58; i++) bits[i] = 1;
    secondary[53] = Number(stationTime(id, start).offsetMinutes !== stationTime(id, start + 61 * 60000).offsetMinutes);
    secondary[58] = Number(time.offsetMinutes === 60);
    [[17, 24, 54], [25, 35, 55], [36, 38, 56], [39, 51, 57]].forEach(([a, b, p]) => {
      secondary[p] = 1 - parity(bits.slice(a, b + 1));
      frame.checks.push({ label: `P${p - 53}`, ok: (parity(bits.slice(a, b + 1)) + secondary[p]) % 2 === 1 });
    });
    frame.fields = [field(0, 16, 'Marcatore / DUT1', 'reserved'), field(17, 38, 'Data'), field(39, 44, 'Ore', 'hour'), field(45, 51, 'Minuti', 'minute'), field(52, 59, 'Identificatore / parità', 'zone')];
    frame.description = 'Ora del minuto successivo · due bit A/B · quattro parità dispari';
    return frame;
  }
  // BPC: 19 quaternary symbols after an unmodulated marker. Fields are binary, not BCD.
  const raw = Array(38).fill(0);
  putBinary(raw, Math.floor(time.second / 20), 0, 2);
  putBinary(raw, time.hour % 12, 4, 4);
  putBinary(raw, time.minute, 8, 6);
  putBinary(raw, time.weekday || 7, 15, 3);
  raw[18] = Number(time.hour >= 12);
  raw[19] = parity(raw.slice(0, 18));
  putBinary(raw, time.day, 21, 5);
  putBinary(raw, time.month, 26, 4);
  putBinary(raw, time.year % 100 & 63, 30, 6);
  raw[36] = (time.year % 100) >> 6;
  raw[37] = parity(raw.slice(20, 36));
  bits[0] = -1;
  for (let i = 0; i < 19; i++) bits[i + 1] = raw[i * 2] * 2 + raw[i * 2 + 1];
  frame.raw = raw;
  frame.checks = [{ label: 'P3', ok: parity([...raw.slice(0, 18), raw[19]]) === 0 }, { label: 'P4', ok: parity([...raw.slice(20, 36), raw[37]]) === 0 }];
  frame.fields = [field(0, 2, 'Marcatore / indice', 'reserved'), field(3, 4, 'Ore', 'hour'), field(5, 7, 'Minuti', 'minute'), field(8, 10, 'Giorno / P3', 'zone'), field(11, 19, 'Data / P4')];
  frame.description = 'Ora all’inizio del ciclo · simboli 0–3 · ciclo di 20 secondi';
  return frame;
}

export function stationEnvelope(frame, second, fraction) {
  const value = frame.bits[second];
  switch (frame.stationId) {
    case 'dcf77': return dcfEnvelope(value, fraction);
    case 'jjy': return fraction < (value === -1 ? 0.2 : value === 1 ? 0.5 : 0.8) ? 1 : 0.1;
    case 'wwvb': return fraction < (value === -1 ? 0.8 : value === 1 ? 0.5 : 0.2) ? 10 ** (-17 / 20) : 1;
    case 'bpc': return value !== -1 && fraction < (value + 1) / 10 ? 0.1 : 1;
    case 'msf':
      if (second === 0) return fraction < 0.5 ? 0 : 1;
      if (fraction < 0.1 || (fraction < 0.2 && value) || (fraction >= 0.2 && fraction < 0.3 && frame.secondary[second])) return 0;
      return 1;
    default: throw new Error('Inviluppo sconosciuto');
  }
}

// Audio compatibility option: keep protocol timing, but fully gate DCF77's
// low intervals. The reference radio envelope above always remains at 15%.
export function audioEnvelope(frame, second, fraction, profile = 'sine') {
  const amplitude = stationEnvelope(frame, second, fraction);
  return frame.stationId === 'dcf77' && profile === 'sine-gated' && amplitude < 1 ? 0 : amplitude;
}

export function symbolLabel(frame, second) {
  if (frame.bits[second] === -1) return 'M';
  return frame.secondary ? `${frame.bits[second]}${frame.secondary[second]}` : String(frame.bits[second]);
}

export function symbolDescription(frame, second) {
  if (frame.stationId === 'msf') return second === 0 ? 'marcatore 500 ms' : `A=${frame.bits[second]} · B=${frame.secondary[second]}`;
  const value = frame.bits[second];
  if (frame.stationId === 'bpc') return value === -1 ? 'marcatore senza riduzione' : `simbolo ${value} · ${(value + 1) * 100} ms`;
  if (frame.stationId === 'jjy') return `${value === -1 ? 200 : value === 1 ? 500 : 800} ms alto`;
  if (frame.stationId === 'wwvb') return `${value === -1 ? 800 : value === 1 ? 500 : 200} ms ridotto`;
  return value === -1 ? 'marcatore senza riduzione' : `${value === 1 ? 200 : 100} ms ridotto`;
}
