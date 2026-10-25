import { Body, Observer, Equator, Horizon, Illumination, MoonPhase, SearchMoonPhase,
  SearchMoonQuarter, NextMoonQuarter, SearchRiseSet } from '../assets/world/vendor.mjs';
import { DAY, localDayBounds } from './world-math.mjs';

export const PHASE_NAMES = ['New Moon', 'First quarter', 'Full Moon', 'Last quarter'];
export function phaseName(angle) {
  const names = ['New Moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full Moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'];
  return names[Math.floor((((angle % 360) + 360) % 360 + 22.5) / 45) % 8];
}
export function moonState(epoch, city) {
  const date = new Date(epoch), observer = new Observer(city.latitude, city.longitude, 0);
  const equator = Equator(Body.Moon, date, observer, true, true);
  const horizon = Horizon(date, observer, equator.ra, equator.dec, 'normal');
  const illumination = Illumination(Body.Moon, date), phase = MoonPhase(date);
  return { phase, name: phaseName(phase), fraction: illumination.phase_fraction,
    distanceKm: illumination.geo_dist * 149597870.7,
    altitude: horizon.altitude, azimuth: horizon.azimuth, waxing: phase < 180 };
}
export function lunarEvents(epoch, city) {
  const [start, end] = localDayBounds(epoch, city.timeZone);
  const observer = new Observer(city.latitude, city.longitude, 0);
  const find = direction => {
    const result = SearchRiseSet(Body.Moon, observer, direction, new Date(start), (end - start) / DAY);
    const time = result ? +result.date : null;
    return time !== null && time >= start && time < end ? time : null;
  };
  const previousNew = SearchMoonPhase(0, new Date(epoch), -35);
  const quarters = [];
  let quarter = SearchMoonQuarter(new Date(epoch + 1000));
  for (let i = 0; i < 4; i++) {
    quarters.push({ quarter: quarter.quarter, name: PHASE_NAMES[quarter.quarter], epoch: +quarter.time.date });
    quarter = NextMoonQuarter(quarter);
  }
  return { rise: find(1), set: find(-1), previousNew: previousNew ? +previousNew.date : null,
    ageDays: previousNew ? (epoch - +previousNew.date) / DAY : null,
    fullMoon: +SearchMoonPhase(180, new Date(epoch + 1000), 35).date, quarters, start, end };
}

// A sphere lit from the phase direction: first quarter lights the right-hand half.
export function moonSurfaceLight(x, y, phase) {
  const radius = x*x + y*y;
  if (radius > 1) return null;
  const angle = phase * Math.PI / 180;
  return Math.max(0, x * Math.sin(angle) - Math.sqrt(1 - radius) * Math.cos(angle));
}
