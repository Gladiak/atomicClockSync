// Offsets are watch time minus reference time. Dates and durations use UTC
// epochs; local time zones and daylight-saving changes never enter the fit.
export const DAY_MS = 86400000;
export const ACCURACY_KEY = 'atomic.accuracy.v1';
export const EVENT_TYPES = Object.freeze(['synchronization', 'adjustment', 'maintenance']);
const clean = (value, length) => typeof value === 'string' ? value.trim().slice(0, length) : '';
const validTime = value => Number.isFinite(value) && value >= Date.UTC(1900, 0, 1) && value <= Date.UTC(2101, 0, 1);

export function parseOffset(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || !/^[+\-−]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(value.trim())) return null;
  const result = Number(value.trim().replace('−', '-').replace(',', '.'));
  return Number.isFinite(result) ? result : null;
}

export function referenceAt(reference, at, capturedNow) {
  // An NTP snapshot only describes a contemporary capture, never a backdated
  // manual observation or a stale verification.
  if (reference && Math.abs(at - capturedNow) < 2000 && Number.isFinite(reference.nowMs)
    && at >= reference.nowMs && at - reference.nowMs < 30 * 60000
    && Number.isFinite(reference.uncertaintyMs) && reference.uncertaintyMs >= 0) {
    return { kind: 'ntp', host: clean(reference.host, 160), checkedAt: reference.nowMs,
      uncertaintyMs: reference.uncertaintyMs };
  }
  return { kind: Math.abs(at - capturedNow) < 2000 ? 'system' : 'manual' };
}

export function makeAccuracyEntry(input, { now = Date.now(), id = globalThis.crypto.randomUUID() } = {}) {
  const profileId = clean(input?.profileId, 160), type = input?.type;
  if (!profileId || !['measurement', ...EVENT_TYPES].includes(type)) throw Error('entry');
  if (!validTime(input.at) || input.at > now + 1000) throw Error('date');
  const entry = { id, profileId, watchName: clean(input.watchName, 60) || 'Watch', type,
    at: input.at, note: clean(input.note, 500) };
  if (type === 'measurement') {
    const offsetSeconds = parseOffset(input.offsetSeconds);
    if (offsetSeconds === null || Math.abs(offsetSeconds) > 86400) throw Error('offset');
    entry.offsetSeconds = Object.is(offsetSeconds, -0) ? 0 : offsetSeconds;
    entry.readingStep = input.readingStep === 0.1 ? 0.1 : 1;
    entry.method = 'manual-offset';
    entry.conditions = { wear: ['worn', 'resting'].includes(input.conditions?.wear) ? input.conditions.wear : '',
      position: clean(input.conditions?.position, 120), temperature: null };
    const temperature = input.conditions?.temperature;
    if (temperature !== '' && temperature != null) {
      const parsed = parseOffset(temperature);
      if (parsed === null || parsed < -50 || parsed > 80) throw Error('temperature');
      entry.conditions.temperature = parsed;
    }
    const source = input.reference;
    entry.reference = source?.kind === 'ntp' && Number.isFinite(source.checkedAt)
      && Number.isFinite(source.uncertaintyMs) && source.uncertaintyMs >= 0
      && entry.at >= source.checkedAt - 2000 && entry.at - source.checkedAt < 30 * 60000
      ? { kind: 'ntp', host: clean(source.host, 160), checkedAt: source.checkedAt, uncertaintyMs: source.uncertaintyMs }
      : { kind: source?.kind === 'system' ? 'system' : 'manual' };
  } else if (type === 'synchronization' && clean(input.sourceTrialId, 160)) entry.sourceTrialId = clean(input.sourceTrialId, 160);
  return entry;
}

export function normalizeAccuracy(value) {
  if (value == null) return { version: 1, entries: [] };
  if (value.version !== 1 || !Array.isArray(value.entries)) return null;
  const ids = new Set();
  return { version: 1, entries: value.entries.flatMap(input => {
    if (!input || typeof input.id !== 'string' || !input.id || ids.has(input.id)) return [];
    try {
      const entry = makeAccuracyEntry(input, { id: input.id, now: Date.UTC(2101, 0, 1) });
      ids.add(entry.id); return [entry];
    } catch { return []; }
  }) };
}

export function accuracyPeriods(entries, profileId) {
  const sorted = entries.filter(entry => entry.profileId === profileId).slice().sort((a, b) =>
    a.at - b.at || Number(a.type === 'measurement') - Number(b.type === 'measurement') || a.id.localeCompare(b.id));
  const periods = [{ id: 'initial', start: null, end: null, marker: null, entries: [], readings: [] }];
  for (const entry of sorted) {
    if (entry.type !== 'measurement') {
      periods.at(-1).end = entry.at;
      periods.push({ id: entry.id, start: entry.at, end: null, marker: entry, entries: [], readings: [] });
    }
    const period = periods.at(-1);
    period.entries.push(entry);
    if (entry.type === 'measurement') period.readings.push(entry);
  }
  return periods;
}

export function summarizeAccuracy(period, now = Date.now()) {
  const readings = period.readings, count = readings.length;
  const first = readings[0], latest = readings.at(-1);
  const spanDays = count ? (latest.at - first.at) / DAY_MS : 0;
  const result = { count, first, latest, spanDays, slope: null, intercept: null, scatter: null,
    predicted: null, digits: 1, status: count < 2 ? 'readings' : spanDays < 1 ? 'window' : 'early' };
  if (count < 2 || spanDays < 1) return result;
  // Centred least-squares fit. The baseline offset is fitted, not assumed zero.
  const xs = readings.map(reading => (reading.at - first.at) / DAY_MS);
  const ys = readings.map(reading => reading.offsetSeconds);
  const meanX = xs.reduce((a, b) => a + b, 0) / count, meanY = ys.reduce((a, b) => a + b, 0) / count;
  let xx = 0, xy = 0;
  for (let i = 0; i < count; i++) { xx += (xs[i] - meanX) ** 2; xy += (xs[i] - meanX) * (ys[i] - meanY); }
  if (!xx) return result;
  result.slope = xy / xx; result.intercept = meanY - result.slope * meanX;
  result.scatter = Math.sqrt(ys.reduce((sum, y, i) => sum + (y - result.intercept - result.slope * xs[i]) ** 2, 0) / count);
  const step = Math.max(...readings.map(reading => Math.max(reading.readingStep, (reading.reference?.uncertaintyMs || 0) / 1000)));
  result.digits = Math.max(0, Math.min(3, Math.ceil(-Math.log10(step / spanDays))));
  result.status = count >= 3 && spanDays >= 7 ? 'trend' : 'early';
  // Forecasts use the fit, remain inside a seven-day horizon, and never extend
  // a completed period across a known correction.
  if (period.end === null && now >= latest.at && now - latest.at <= 7 * DAY_MS) {
    result.predicted = result.intercept + result.slope * ((now - first.at) / DAY_MS);
  }
  return result;
}

export function accuracyCSV(entries) {
  const columns = ['id','profileId','watchName','type','atUTC','offsetSeconds','readingStep','referenceKind','referenceHost','referenceCheckedAtUTC','referenceUncertaintyMs','wear','position','temperatureC','note','sourceTrialId'];
  const cell = value => {
    let text = value == null ? '' : String(value);
    // Prevent spreadsheet applications from treating personal notes as formulas.
    if (/^[\s]*[=+\-@\t\r]/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  };
  const rows = entries.map(e => [e.id,e.profileId,e.watchName,e.type,new Date(e.at).toISOString(),e.offsetSeconds,e.readingStep,
    e.reference?.kind,e.reference?.host,e.reference?.checkedAt ? new Date(e.reference.checkedAt).toISOString() : '',e.reference?.uncertaintyMs,
    e.conditions?.wear,e.conditions?.position,e.conditions?.temperature,e.note,e.sourceTrialId]);
  // Numeric values retain their sign and remain usable as numbers on import.
  const csvCell = value => typeof value === 'number' ? String(value) : cell(value);
  return [columns,...rows].map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
