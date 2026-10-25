import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, normalizeHistory } from '../src/trials.mjs';
import { summarizeTrials, filterTrials, compareTrials, prepareTrial, baselineIssue } from '../src/reception-lab-data.mjs';
const trial=(id,outcome='get',extra={})=>({id,at:1000,seconds:100,status:'stopped',outcome,snapshot:{profileId:'watch-a',settings:{...DEFAULTS},watch:{name:'My watch',position:'Left speaker, 3 cm',systemVolume:'40'}},...extra});

test('GET rate excludes unknown outcomes and never infers failure from completion or interruption',()=>{
  const stats=summarizeTrials(normalizeHistory([trial('a'),trial('b','err'),trial('c','unverified',{status:'complete'}),trial('d','unverified',{status:'interrupted'})]));
  assert.deepEqual(stats.counts,{get:1,err:1,unverified:2});assert.equal(stats.rate,.5);assert.equal(stats.verified,2);
  assert.equal(summarizeTrials([trial('e','unverified')]).rate,null);assert.equal(summarizeTrials([]).rate,null);
});
test('configuration groups keep watches, manual conditions and unlinked attempts separate',()=>{
  const a=trial('a'),b=trial('b'),c=trial('c'),d=trial('d'),e=trial('e'),f=trial('f');
  c.snapshot.profileId='watch-b';d.snapshot.watch.position='Right speaker';e.snapshot.profileId=null;f.snapshot.profileId=null;
  const stats=summarizeTrials([a,b,c,d,e,f]);assert.equal(stats.configurations.length,5);
  assert.equal(stats.configurations[0].verified,2);assert.equal(stats.configurations[0].rate,1);
  assert.equal(stats.configurations.filter(g=>!g.trial.snapshot.profileId).length,2);
});
test('variable volume, interrupted audio and missing snapshots are excluded without losing their manual outcomes',()=>{
  const changed=trial('changed','get',{volumeChanges:[{value:30}],endVolume:30}),ended=trial('ended','err',{endVolume:35}),stopped=trial('interrupted','get',{status:'interrupted'}),old=trial('legacy','get',{snapshot:null});
  const stats=summarizeTrials([changed,ended,stopped,old]);assert.equal(stats.configurations.length,0);
  assert.deepEqual(stats.excluded,{missing:1,interrupted:1,volume:2});assert.equal(stats.verified,4);assert.equal(stats.rate,.75);
});
test('filters use immutable profile IDs and station, preserve source order and retain deleted profile history',()=>{
  const a=trial('a'),b=trial('b'),c=trial('c','err',{snapshot:null,stationId:'dcf77'});a.snapshot.profileId='deleted-profile';a.at=3000;b.snapshot.settings.stationId='jjy';
  const history=[b,c,a],before=structuredClone(history);
  assert.deepEqual(filterTrials(history,'deleted-profile','dcf77').map(t=>t.id),['a']);
  assert.deepEqual(filterTrials(history,'unlinked').map(t=>t.id),['c']);
  assert.deepEqual(filterTrials(history,'all','jjy').map(t=>t.id),['b']);assert.deepEqual(history,before);
});
test('A/B distinguishes one setting from missing notes, different watches and interrupted trials',()=>{
  const a=trial('a'),b=trial('b');b.snapshot.settings.volume=25;
  assert.equal(compareTrials(a,b).kind,'one');assert.deepEqual(compareTrials(a,b).differences,['volume']);
  b.snapshot.watch.systemVolume='';assert.equal(compareTrials(a,b).kind,'notes');b.snapshot.watch.systemVolume='40';
  b.snapshot.profileId='other';assert.equal(compareTrials(a,b).kind,'watch');b.snapshot.profileId='watch-a';b.status='interrupted';assert.equal(compareTrials(a,b).kind,'unstable');
  assert.equal(compareTrials(a,trial('old','get',{snapshot:null})).kind,'missing');assert.equal(compareTrials(a,a).kind,'select');
});
test('preparing changes exactly one supported audio parameter and preserves the historical snapshot',()=>{
  const a=trial('a'),before=structuredClone(a);
  for(const[field,value]of [['volume',35],['channel','right'],['wave','sine-gated'],['duration',15]]){
    const settings=prepareTrial(a,field,value);assert.equal(settings[field],value);
    assert.deepEqual(Object.keys(DEFAULTS).filter(key=>settings[key]!==a.snapshot.settings[key]),[field]);
  }
  assert.deepEqual(a,before);
});
test('experiments reject unchanged, malformed and unsupported values rather than silently normalizing them',()=>{
  const a=trial('a');for(const[field,value]of [['volume',30],['volume',100],['volume',NaN],['volume',30.5],['duration',8],['channel','toString'],['deviceId','other']])assert.throws(()=>prepareTrial(a,field,value),RangeError);
  a.snapshot.settings.stationId='jjy';assert.throws(()=>prepareTrial(a,'wave','sine-gated'),RangeError);
  assert.throws(()=>prepareTrial(trial('b','get',{status:'interrupted'}),'volume',35),RangeError);
  assert.equal(baselineIssue(trial('c','get',{volumeChanges:[{value:35},{value:30}]})),'volume');
});
test('editing an observed outcome recomputes statistics without stale cached results',()=>{
  const records=[trial('a'),trial('b','unverified')];assert.equal(summarizeTrials(records).rate,1);
  records[1].outcome='err';assert.equal(summarizeTrials(records).rate,.5);
  records[0].outcome='unverified';assert.equal(summarizeTrials(records).rate,0);
});
