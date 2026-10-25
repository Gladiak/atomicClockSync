import { Body, Observer, GeoVector, RotateVector, Rotation_EQJ_EQD, EquatorFromVector,
  SiderealTime, Seasons, SearchRiseSet, geoDistance } from '../assets/world/vendor.mjs';

export const DAY = 86400000;
export const wrapLongitude = longitude => ((longitude + 180) % 360 + 360) % 360 - 180;
export const distanceKm = (a, b) => geoDistance([a.longitude, a.latitude], [b.longitude, b.latitude]) * 6371.0088;
export function solarPosition(epoch) {
  const date = new Date(epoch);
  const equator = EquatorFromVector(RotateVector(Rotation_EQJ_EQD(date), GeoVector(Body.Sun, date, true)));
  return { longitude: wrapLongitude(15 * (equator.ra - SiderealTime(date))), latitude: equator.dec };
}
export function solarAltitude(position, sun) {
  const rad = Math.PI / 180;
  const sin = Math.sin(position.latitude * rad) * Math.sin(sun.latitude * rad)
    + Math.cos(position.latitude * rad) * Math.cos(sun.latitude * rad) * Math.cos((position.longitude - sun.longitude) * rad);
  return Math.asin(Math.max(-1, Math.min(1, sin))) / rad;
}
export function lightPhase(altitude) {
  return altitude >= 0 ? 'Daylight' : altitude >= -6 ? 'Civil twilight' : altitude >= -12 ? 'Nautical twilight'
    : altitude >= -18 ? 'Astronomical twilight' : 'Night';
}
const seasonCache = new Map();
export function seasonEvents(year) {
  if (!seasonCache.has(year)) {
    const seasons = Seasons(year);
    seasonCache.set(year, ['mar_equinox', 'jun_solstice', 'sep_equinox', 'dec_solstice'].map(key => +seasons[key].date));
  }
  return seasonCache.get(year);
}
const dateFormatters = new Map();
function localParts(epoch, zone) {
  if (!dateFormatters.has(zone)) dateFormatters.set(zone, new Intl.DateTimeFormat('en-GB', {
    timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }));
  return Object.fromEntries(dateFormatters.get(zone).formatToParts(epoch).filter(p => p.type !== 'literal').map(p => [p.type, +p.value]));
}
export function localDateKey(epoch, zone) {
  const p = localParts(epoch, zone);
  return `${p.year}-${String(p.month).padStart(2,'0')}-${String(p.day).padStart(2,'0')}`;
}
function midnightFor(y, m, d, zone) {
  const wanted = Date.UTC(y, m - 1, d);
  // Find the first instant of the calendar date. Midnight can be skipped or
  // repeated by timezone changes; the next date can even be skipped entirely.
  let low = (wanted - 2*DAY)/1000, high = (wanted + 2*DAY)/1000;
  while (low < high) {
    const middle = Math.floor((low+high)/2), p = localParts(middle*1000,zone);
    if (Date.UTC(p.year,p.month-1,p.day) >= wanted) high=middle; else low=middle+1;
  }
  return high*1000;
}
export function localDayBounds(epoch, zone) {
  const p = localParts(epoch, zone), next = new Date(Date.UTC(p.year, p.month - 1, p.day + 1));
  return [midnightFor(p.year, p.month, p.day, zone), midnightFor(next.getUTCFullYear(), next.getUTCMonth()+1, next.getUTCDate(), zone)];
}
export function sunEvents(epoch, city) {
  const [start, end] = localDayBounds(epoch, city.timeZone);
  const observer = new Observer(city.latitude, city.longitude, 0);
  const find = direction => {
    const event = SearchRiseSet(Body.Sun, observer, direction, new Date(start), (end - start) / DAY);
    const time = event ? +event.date : null;
    return time !== null && time >= start && time < end ? time : null;
  };
  const rise = find(1), set = find(-1);
  const above = solarAltitude(city, solarPosition(start + 1000)) >= -0.833;
  // Integrate sunlight over the actual local calendar day, including 23/25-hour DST days.
  const events = [{ time: start, above }, ...(rise === null ? [] : [{ time: rise, above: true }]),
    ...(set === null ? [] : [{ time: set, above: false }])].sort((a,b)=>a.time-b.time);
  let daylightMs = 0;
  for (let i = 0; i < events.length; i++) if (events[i].above) daylightMs += (events[i+1]?.time ?? end) - events[i].time;
  return { rise, set, daylightMs, polar: rise === null && set === null ? (above ? 'Polar day' : 'Polar night') : null };
}

export function validCity(value) {
  if (!value || typeof value.name !== 'string' || !Number.isFinite(value.latitude) || !Number.isFinite(value.longitude)
    || Math.abs(value.latitude)>90 || Math.abs(value.longitude)>180 || typeof value.timeZone !== 'string') return null;
  try { new Intl.DateTimeFormat('en', { timeZone: value.timeZone }); } catch { return null; }
  return { id: value.id, name: value.name.slice(0,80), country: String(value.country || '').slice(0,80),
    region: String(value.region || '').slice(0,80), latitude: value.latitude, longitude: value.longitude, timeZone: value.timeZone };
}
