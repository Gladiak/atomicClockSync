import test from 'node:test';
import assert from 'node:assert/strict';
import { DAY_MS, parseOffset, referenceAt, makeAccuracyEntry, normalizeAccuracy, accuracyPeriods, summarizeAccuracy, accuracyCSV } from '../src/watch-accuracy-data.mjs';
const base = Date.UTC(2026, 9, 1, 12), now = base + 30 * DAY_MS;
const reading = (id,day,offset,extra={}) => makeAccuracyEntry({profileId:'a',watchName:'My watch',type:'measurement',at:base+day*DAY_MS,offsetSeconds:offset,...extra},{id,now});
const marker = (id,day,type='adjustment') => makeAccuracyEntry({profileId:'a',watchName:'My watch',type,at:base+day*DAY_MS},{id,now});

test('offset parser accepts signed decimal point/comma and rejects empty, ambiguous and nonfinite input',()=>{
  for(const [value,expected] of [['+3',3],['−2,5',-2.5],['.5',.5],[' +0.1 ',.1],[-3,-3],['0',0]])assert.equal(parseOffset(value),expected);
  for(const value of ['',null,undefined,'1,234.5','1,2,3','1e3','Infinity','NaN','3 seconds',NaN,Infinity])assert.equal(parseOffset(value),null,String(value));
});
test('entry validation preserves watch identity, manual text, explicit conditions and snapshot provenance',()=>{
  const ref={kind:'ntp',host:'time.example',checkedAt:base,uncertaintyMs:4};
  const entry=reading('one',0,'−1,2',{note:'<b>My notes 日本語</b>',readingStep:.1,reference:ref,conditions:{wear:'resting',position:'Dial up',temperature:'21,5'}});
  assert.equal(entry.offsetSeconds,-1.2);assert.equal(entry.method,'manual-offset');assert.equal(entry.note,'<b>My notes 日本語</b>');
  assert.deepEqual(entry.conditions,{wear:'resting',position:'Dial up',temperature:21.5});assert.deepEqual(entry.reference,ref);
  assert.equal(entry.profileId,'a');
  assert.equal(reading('zero',0,-0).offsetSeconds,0);
  for(const input of [{at:NaN},{at:now+DAY_MS},{offsetSeconds:''},{offsetSeconds:86401},{profileId:''},{conditions:{temperature:81}},{conditions:{temperature:'oops'}}])assert.throws(()=>reading('bad',0,0,input));
});
test('reference snapshots are contemporary, fresh and tied to corrected NTP epochs rather than the wall clock',()=>{
  const ref={nowMs:base,synchronizedAt:base+DAY_MS,host:'ntp',uncertaintyMs:7};
  const captured=referenceAt(ref,base+10000,base+10000);
  assert.deepEqual(captured,{kind:'ntp',host:'ntp',checkedAt:base,uncertaintyMs:7});
  assert.deepEqual(referenceAt(ref,base-DAY_MS,base),{kind:'manual'});
  assert.deepEqual(referenceAt(ref,base+30*60000,base+30*60000),{kind:'system'});
  assert.deepEqual(referenceAt(null,base,base),{kind:'system'});
  assert.equal(reading('backdated',-1,0,{reference:captured}).reference.kind,'manual');
  assert.equal(reading('stale',1,0,{reference:captured}).reference.kind,'manual');
});
test('normalization handles missing storage, rejects unsupported schemas, deduplicates IDs and validates records',()=>{
  assert.deepEqual(normalizeAccuracy(null),{version:1,entries:[]});assert.equal(normalizeAccuracy({version:2,entries:[]}),null);assert.equal(normalizeAccuracy({version:1}),null);
  const entry=reading('a',0,3),result=normalizeAccuracy({version:1,entries:[entry,{...entry},null,{...entry,id:'bad',offsetSeconds:'oops'}]});
  assert.equal(result.entries.length,1);assert.deepEqual(result.entries[0],entry);
});
test('all correction types split periods without inventing a zero reading or mixing watch identities',()=>{
  const values=[reading('b',3,9),marker('m',4),reading('a',0,3),reading('c',5,-2),marker('s',6,'synchronization'),marker('service',7,'maintenance'),reading('other',6,100,{profileId:'b'})];
  const periods=accuracyPeriods(values,'a');assert.deepEqual(periods.map(p=>p.id),['initial','m','s','service']);
  assert.deepEqual(periods.map(p=>p.readings.length),[2,1,0,0]);assert.equal(periods[0].end,base+4*DAY_MS);assert.equal(periods.at(-1).end,null);
  assert.equal(summarizeAccuracy(periods[0],now).slope,2);assert.equal(summarizeAccuracy(periods[0],now).predicted,null);
  assert.equal(summarizeAccuracy(periods.at(-1),now).latest,undefined);assert.equal(summarizeAccuracy(periods.at(-1),now).slope,null);
});
test('correction precedes a same-instant measurement and overlapping timestamp samples cannot produce a slope',()=>{
  const periods=accuracyPeriods([reading('a',1,1),marker('z',1),reading('b',1,2)],'a');
  assert.equal(periods[0].readings.length,0);assert.equal(periods[1].readings.length,2);assert.equal(summarizeAccuracy(periods[1],now).slope,null);
});
test('centred regression uses all readings, fits the baseline and ignores timezone/DST calendar boundaries',()=>{
  const data=[reading('a',0,3),reading('b',1,5),reading('c',3,9)];
  const result=summarizeAccuracy(accuracyPeriods(data,'a')[0],base+4*DAY_MS);
  assert.ok(Math.abs(result.slope-2)<1e-12);assert.ok(Math.abs(result.intercept-3)<1e-12);assert.ok(result.scatter<1e-12);assert.equal(result.predicted,11);assert.equal(result.status,'early');
  const noisy=[reading('a',0,0),reading('b',1,10),reading('c',2,0),reading('d',3,0)];
  const fit=summarizeAccuracy(accuracyPeriods(noisy,'a')[0],now);assert.ok(Math.abs(fit.slope+1)<1e-12);assert.ok(fit.scatter>0);
  const dst=Date.UTC(2026,9,24,12);const pair=[reading('x',0,3,{at:dst}),reading('y',1,5,{at:dst+DAY_MS})];
  assert.equal(summarizeAccuracy(accuracyPeriods(pair,'a')[0],now).slope,2);
});
test('drift waits for a full 24 hours and presentation precision reflects observation span and reading step',()=>{
  const result=values=>summarizeAccuracy(accuracyPeriods(values,'a')[0],now);
  assert.equal(result([reading('a',0,0)]).status,'readings');assert.equal(result([reading('a',0,0),reading('b',.99,1)]).status,'window');
  assert.equal(result([reading('a',0,0),reading('b',1,1)]).digits,0);
  assert.equal(result([reading('a',0,0),reading('b',7,1),reading('c',14,2)]).status,'trend');
  assert.equal(result([reading('a',0,0),reading('b',30,1)]).digits,2);
});
test('projections are withheld for completed periods, future observations and readings older than seven days',()=>{
  const period=accuracyPeriods([reading('a',0,3),reading('b',1,5)],'a')[0];
  assert.equal(summarizeAccuracy(period,base+2*DAY_MS).predicted,7);
  assert.equal(summarizeAccuracy(period,base+9*DAY_MS).predicted,null);
  assert.equal(summarizeAccuracy({...period,end:base+2*DAY_MS},base+2*DAY_MS).predicted,null);
  assert.equal(summarizeAccuracy(period,base).predicted,null);
});
test('GET correction events preserve a trial link without creating a measurement',()=>{
  const entry=makeAccuracyEntry({profileId:'a',type:'synchronization',at:base,sourceTrialId:'trial',offsetSeconds:0},{id:'get',now});
  assert.equal(entry.sourceTrialId,'trial');assert.equal(entry.offsetSeconds,undefined);assert.equal(entry.reference,undefined);
});
test('CSV preserves signed numeric offsets, UTC and quotes while neutralizing formula-like personal strings',()=>{
  const csv=accuracyCSV([reading('a',0,-2,{watchName:'=SUM(1,2)',note:'@cmd,"x"\nnext',conditions:{position:' +SUM(A1)',temperature:20}})]);
  assert.ok(csv.includes('"\'=SUM(1,2)"'));assert.ok(csv.includes('"\'@cmd,""x""\nnext"'));assert.ok(csv.includes(',-2,1,'));assert.ok(csv.includes('2026-10-01T12:00:00.000Z'));assert.ok(csv.endsWith('\r\n'));
});
