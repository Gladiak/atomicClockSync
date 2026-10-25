import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LIGHT_TARGETS, LIGHT_SPEED_KMS, lightObservation, solarLayout, validLightEpoch, shiftLightMonths,
  playbackRate, makeLightReplay, lightReplayPosition, pauseLightReplay, resumeLightReplay, retimeLightReplay } from '../src/light-travel-math.mjs';

const epoch = Date.parse('2026-10-25T12:00:00Z');
test('offline retarded light travel times agree with independent JPL Horizons observer samples', () => {
  const fixture=JSON.parse(readFileSync(new URL('./fixtures/light-time-jpl.json',import.meta.url)));
  for(const sample of fixture.samples) {
    const model=lightObservation(sample.id,Date.parse(fixture.epoch));
    const tolerance=sample.id==='moon'?.002:sample.id==='neptune'?.5:.05;
    assert.ok(Math.abs(model.seconds-sample.seconds)<tolerance,`${sample.id}: ${model.seconds} vs ${sample.seconds}`);
    assert.ok(Math.abs(model.distanceKm/LIGHT_SPEED_KMS-model.seconds)<.00001);
    assert.ok(Math.abs(model.epoch-model.emittedAt-model.seconds*1000)<.001);
  }
});
test('light delay uses changing Earth-relative distances and supports all nine sources at date bounds', () => {
  assert.equal(LIGHT_TARGETS.length,9);
  for(const date of [Date.UTC(1900,0,1),epoch,Date.UTC(2100,11,31,23,59,59)]) for(const target of LIGHT_TARGETS) {
    const model=lightObservation(target.id,date);
    assert.ok(model.seconds>0&&model.distanceKm>0);assert.ok(model.emittedAt<date);
    assert.equal(model.reflected,target.id!=='sun');
    assert.equal(Object.isFrozen(model),true);
  }
  const a=lightObservation('mars',epoch),b=lightObservation('mars',shiftLightMonths(epoch,6));
  assert.ok(Math.abs(a.seconds-b.seconds)>60,'Mars delay must change with date');
  assert.throws(()=>lightObservation('earth',epoch),RangeError);
  assert.throws(()=>lightObservation('sun',NaN),RangeError);
  const layout=solarLayout(epoch);for(const point of Object.values(layout))assert.ok(Number.isFinite(point.x)&&Number.isFinite(point.y));
});
test('replay uses a frozen observation, preserves progress across speed changes and pauses', () => {
  const observation=lightObservation('sun',epoch);
  let replay=makeLightReplay(observation,1000,'1');
  assert.equal(lightReplayPosition(replay,4000).seconds,3);
  replay=retimeLightReplay(replay,'100',4000);
  assert.equal(lightReplayPosition(replay,4000).seconds,3);
  assert.equal(lightReplayPosition(replay,5000).seconds,103);
  replay=pauseLightReplay(replay,5000);
  assert.equal(lightReplayPosition(replay,90000).seconds,103);
  replay=resumeLightReplay(replay,90000);
  const complete=lightReplayPosition(replay,99000);
  assert.equal(complete.fraction,1);assert.equal(complete.remaining,0);
  assert.equal(complete.epoch,observation.epoch);
  assert.equal(pauseLightReplay(replay,99000).phase,'complete');
  assert.equal(replay.observation,observation);
});
test('overview takes at most twelve real seconds without slowing down lunar light', () => {
  for(const target of LIGHT_TARGETS) {
    const model=lightObservation(target.id,epoch),rate=playbackRate('auto',model.seconds);
    assert.ok(rate>=1);assert.ok(model.seconds/rate<=12.000001);
  }
  assert.equal(playbackRate('auto',1.3),1);
  assert.throws(()=>playbackRate('NaN',400),RangeError);
  assert.throws(()=>playbackRate('0',400),RangeError);
});
test('six-month previews clamp month-end dates, preserve UTC time and enforce reception range', () => {
  assert.equal(new Date(shiftLightMonths(Date.parse('2024-08-31T23:59:00Z'),6)).toISOString(),'2025-02-28T23:59:00.000Z');
  assert.equal(new Date(shiftLightMonths(Date.parse('2023-08-31T10:00:00Z'),6)).toISOString(),'2024-02-29T10:00:00.000Z');
  assert.equal(validLightEpoch(shiftLightMonths(Date.UTC(2100,11,31),6)),false);
  assert.equal(validLightEpoch(Date.UTC(1899,11,31)),false);
});
