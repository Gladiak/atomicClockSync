import test from 'node:test';
import assert from 'node:assert/strict';
import {solarDay,solarArc,ambientSky} from '../src/clock-sky.mjs';
import {localDateKey} from '../src/world-math.mjs';

const rome={latitude:41.8919,longitude:12.5113,timeZone:'Europe/Rome'};
test('the solar arc follows the actual sunrise/set interval and switches at the event',()=>{
  const day=solarDay(Date.parse('2026-11-04T12:00Z'),rome);
  const middle=solarArc((day.rise+day.set)/2,day);
  assert.equal(middle.phase,'day');assert.equal(middle.progress,.5);assert.deepEqual(middle.marker,{x:120,y:10});
  assert.equal(middle.next.kind,'set');assert.equal(middle.minutesToEvent,Math.ceil((day.set-day.rise)/120000));
  const sunrise=solarArc(day.rise,day);assert.equal(sunrise.progress,0);assert.equal(sunrise.next.kind,'set');assert.deepEqual(sunrise.marker,{x:12,y:36});
  const sunset=solarArc(day.set,day);assert.equal(sunset.phase,'night');assert.equal(sunset.next.kind,'rise');assert.deepEqual(sunset.marker,{x:228,y:36});
  const night=solarArc(day.set+3600000,day);assert.ok(night.marker.y>36);assert.ok(night.progress>0&&night.progress<1);
});
test('night and the sunrise countdown cross city-local midnight and both DST changes',()=>{
  for(const date of ['2026-03-28T23:30Z','2026-10-24T23:30Z','2026-11-04T23:30Z']){
    const epoch=Date.parse(date),day=solarDay(epoch,rome),arc=solarArc(epoch,day);
    assert.equal(arc.phase,'night');assert.equal(arc.next.kind,'rise');assert.ok(arc.next.time>epoch);assert.ok(arc.next.time-epoch<12*3600000);
    assert.equal(localDateKey(arc.next.time,rome.timeZone),localDateKey(epoch,rome.timeZone));
    assert.ok(arc.marker.x>=12&&arc.marker.x<=228&&arc.marker.y>=36&&arc.marker.y<=52);
  }
  const epoch=Date.parse('2026-10-24T19:00Z'),arc=solarArc(epoch,solarDay(epoch,rome));
  assert.equal(localDateKey(arc.next.time,rome.timeZone),'2026-10-25');assert.equal(arc.minutesToEvent,Math.ceil((arc.next.time-epoch)/60000));
});
test('polar days and nights keep explicit states without fabricated events or markers',()=>{
  const city={latitude:80,longitude:0,timeZone:'Europe/Oslo'};
  for(const [date,polar,phase]of [['2026-06-21T12:00Z','Polar day','day'],['2026-12-21T12:00Z','Polar night','night']]){
    const epoch=Date.parse(date),day=solarDay(epoch,city),arc=solarArc(epoch,day);
    assert.equal(day.polar,polar);assert.equal(arc.phase,phase);assert.equal(arc.marker,null);assert.equal(arc.next,null);assert.equal(arc.minutesToEvent,null);
  }
});
test('ambient light follows solar altitude and clouds require a known current estimate',()=>{
  const day=ambientSky(Date.parse('2026-11-04T12:00Z'),rome,80),night=ambientSky(Date.parse('2026-11-04T00:00Z'),rome,80);
  assert.ok(day.altitude>0);assert.ok(night.altitude<0);assert.ok(day.lightY<night.lightY);assert.equal(day.cloudOpacity,.4);
  assert.equal(ambientSky(Date.parse('2026-11-04T12:00Z'),rome,0).cloudOpacity,0);
  for(const cloud of [null,undefined,NaN,-1,101,'80'])assert.equal(ambientSky(Date.parse('2026-11-04T12:00Z'),rome,cloud).cloudOpacity,0);
});
