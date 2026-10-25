import test from 'node:test';
import assert from 'node:assert/strict';
import { HISTORICAL_EVENTS, HISTORICAL_SOURCES, historicalElapsed, normalizeMoments, parseMomentDate, capsuleIsOpen } from '../src/time-machine-data.mjs';

test('historical records have primary-source keys, explicit precision and UTC instants', () => {
  assert.equal(HISTORICAL_EVENTS.length,96);
  assert.equal(new Set(HISTORICAL_EVENTS.map(event=>event.id)).size,96);
  assert.deepEqual(HISTORICAL_EVENTS.map(event=>event.epoch),HISTORICAL_EVENTS.map(event=>event.epoch).sort((a,b)=>a-b));
  for (const event of HISTORICAL_EVENTS) {
    assert.ok(event.source.startsWith('tm'));
    assert.ok(HISTORICAL_SOURCES[event.source].url.startsWith('https://'));
    assert.ok(HISTORICAL_SOURCES[event.source].label);
    assert.ok(['day','minute','second','approximate'].includes(event.precision));
    assert.equal(new Date(event.epoch).toISOString().slice(0,10),event.date);
  }
  assert.equal(HISTORICAL_EVENTS.find(event=>event.id==='apollo').epoch,Date.parse('1969-07-20T20:17:39Z'));
});
test('counters preserve historical precision without inventing seconds or date-only times', () => {
  const day = HISTORICAL_EVENTS.find(event=>event.id==='web');
  assert.deepEqual(historicalElapsed(day,day.epoch+86400000+43210000),{days:1,past:true,precision:'day'});
  const flight = HISTORICAL_EVENTS.find(event=>event.id==='flight'), approx = historicalElapsed(flight,flight.epoch+90061000);
  assert.equal(approx.hours,1); assert.equal(approx.minutes,1); assert.equal(approx.seconds,0);
  const exact = HISTORICAL_EVENTS.find(event=>event.id==='apollo');
  assert.equal(historicalElapsed(exact,exact.epoch+90061000).seconds,1);
});
test('personal moment validation rejects malformed, duplicate and out-of-range data', () => {
  const entry = {id:'one',title:' A memory ',epoch:Date.parse('2026-10-25T12:00Z'),kind:'moment',note:'<b>plain text</b>'};
  const valid = normalizeMoments([entry,entry,null,{...entry,id:'two',epoch:Infinity},{...entry,id:'three',kind:'unknown'}]);
  assert.equal(valid.length,1); assert.equal(valid[0].title,'A memory'); assert.equal(valid[0].note,'<b>plain text</b>');
  assert.deepEqual(normalizeMoments({}),[]);
  assert.equal(normalizeMoments(Array.from({length:110},(_,i)=>({...entry,id:`moment-${i}`}))).length,100);
  assert.equal(parseMomentDate('2024-02-29T12:30'),Date.parse('2024-02-29T12:30Z'));
  for (const value of ['2025-02-29T12:30','2026-02-30T12:30','2101-01-01T00:00','2026-10-25','not-a-date']) assert.equal(parseMomentDate(value),null);
});
test('capsules open exactly at their date while ordinary moments remain readable', () => {
  const capsule = {kind:'capsule',epoch:1000};
  assert.equal(capsuleIsOpen(capsule,999),false); assert.equal(capsuleIsOpen(capsule,1000),true);
  assert.equal(capsuleIsOpen({kind:'moment',epoch:1000},0),true);
});

test('expanded science archive preserves documented event types and UTC date boundaries', () => {
  const find = id => HISTORICAL_EVENTS.find(event => event.id === id);
  assert.equal(find('einstein-special').date,'1905-06-30');
  assert.equal(find('einstein-special').factLabel,'PAPER RECEIVED BY THE JOURNAL');
  assert.equal(find('cesium-paper').date,'1955-08-13');
  assert.equal(find('hayabusa-return').date,'2020-12-05');
  assert.equal(find('kepler-launch').date,'2009-03-07');
  assert.equal(find('first-leap-second').precision,'day');
  for (const category of ['Time science','Astronomy']) assert.equal(HISTORICAL_EVENTS.filter(event=>event.category===category).length,12);
});
