import test from 'node:test';
import assert from 'node:assert/strict';
import { moonState, lunarEvents, moonSurfaceLight, phaseName } from '../src/moon-math.mjs';
import { localDateKey } from '../src/world-math.mjs';

const rome = { latitude:41.8919, longitude:12.5113, timeZone:'Europe/Rome' };
test('lunar illumination matches new/full geometry and known 8 April 2024 eclipse', () => {
  const state = moonState(Date.parse('2024-04-08T18:21:00Z'),rome);
  assert.ok(Math.min(state.phase,360-state.phase) < .1);
  assert.ok(state.fraction < .001);
  assert.ok(state.distanceKm > 350000 && state.distanceKm < 410000);
  assert.equal(phaseName(0),'New Moon'); assert.equal(phaseName(90),'First quarter');
  assert.equal(phaseName(180),'Full Moon'); assert.equal(phaseName(270),'Last quarter');
  assert.equal(moonSurfaceLight(0,0,0),0);
  assert.equal(moonSurfaceLight(0,0,180),1);
  assert.ok(moonSurfaceLight(.5,0,90) > .49);
  assert.equal(moonSurfaceLight(-.5,0,90),0);
  assert.ok(moonSurfaceLight(-.5,0,270) > .49);
  assert.equal(moonSurfaceLight(1,1,180),null);
});
test('upcoming quarters are chronological, match their target phase and are within a lunar month', () => {
  const epoch = Date.parse('2026-10-25T14:33:11Z'), events = lunarEvents(epoch,rome);
  let previous = epoch;
  assert.ok(events.ageDays > 14 && events.ageDays < 16);
  assert.ok(events.previousNew < epoch);
  for (const event of events.quarters) {
    assert.ok(event.epoch > previous); previous = event.epoch;
    const phase = moonState(event.epoch,rome).phase;
    const difference = Math.abs(phase-event.quarter*90);
    assert.ok(Math.min(difference,360-difference) < .01);
  }
  assert.ok(events.quarters.at(-1).epoch-epoch < 32*86400000);
  assert.equal(events.fullMoon,events.quarters.find(event => event.quarter === 2).epoch);
  const atFull = lunarEvents(events.fullMoon,rome);
  assert.ok(atFull.fullMoon-events.fullMoon > 25*86400000,'At full Moon, the countdown targets the next full Moon');
  assert.ok(atFull.quarters[0].epoch > events.fullMoon);
});
test('moonrise and moonset stay within the actual local day including DST and polar no-event dates', () => {
  for (const day of ['2026-03-29','2026-10-25']) {
    const events = lunarEvents(Date.parse(day+'T12:00Z'),rome);
    assert.equal((events.end-events.start)/3600000,day.includes('03-29') ? 23 : 25);
    for (const key of ['rise','set']) if (events[key] !== null) {
      assert.equal(localDateKey(events[key],rome.timeZone),day);
      assert.ok(events[key] >= events.start && events[key] < events.end);
    }
  }
  const polar = lunarEvents(Date.parse('2026-10-25T12:00Z'),{ latitude:89.9,longitude:0,timeZone:'UTC' });
  assert.equal(polar.rise,null); assert.equal(polar.set,null);
  const state = moonState(Date.parse('2026-10-25T12:00Z'),rome);
  assert.ok(Number.isFinite(state.altitude) && state.altitude >= -90 && state.altitude <= 90);
  assert.ok(state.azimuth >= 0 && state.azimuth < 360);
});
