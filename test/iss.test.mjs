import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {prepareOrbit,stateAt,orbitHealth,groundTrack,predictPasses,relativisticShift,compass} from '../src/iss-orbit.mjs';
const require=createRequire(import.meta.url),{validateOrbit,validateTle,validateFix,createIssDataService,URLS}=require('../electron/iss-data.cjs');
const raw=JSON.parse(await fs.readFile(new URL('fixtures/iss-omm.json',import.meta.url),'utf8'));
const orbit=validateOrbit(raw),model=prepareOrbit(orbit),epoch=Date.parse('2026-10-25T14:33:11Z');
const city={latitude:41.8919,longitude:12.5113,timeZone:'Europe/Rome'};
const report={id:25544,units:'kilometers',latitude:-41.185540918127,longitude:-14.0477758872,altitude:431.47838023638,velocity:27552.222639148,timestamp:epoch/1000};
test('ISS orbital state agrees with independently retrieved WTIA report at a fixed epoch',()=>{
  const s=stateAt(model,epoch,city);
  assert.ok(Math.abs(s.latitude-report.latitude)<.001);assert.ok(Math.abs(s.longitude-report.longitude)<.001);
  assert.ok(Math.abs(s.altitude-report.altitude)<.1);assert.ok(Math.abs(s.speedKms*3600-report.velocity)<1);
  assert.ok(s.periodMinutes>90&&s.periodMinutes<96);assert.ok(s.elevation<0);assert.equal(s.potentiallyVisible,false);
});
test('ISS observer geometry, shadow, ground track and validity use the actual orbit',()=>{
  const s=stateAt(model,epoch),overhead=stateAt(model,epoch,{latitude:s.latitude,longitude:s.longitude});
  assert.ok(overhead.elevation>89.5);assert.ok(Math.abs(overhead.rangeKm-s.altitude)<.1);assert.ok(overhead.groundKm<.01);
  const samples=groundTrack(model,epoch);assert.ok(samples.length>200);
  assert.ok(samples.every(p=>Math.abs(p.coordinates[1])<52&&Math.abs(p.coordinates[0])<=180));
  const states=Array.from({length:100},(_,i)=>stateAt(model,epoch+i*60000));
  assert.ok(states.some(s=>s.shadow>.99));assert.ok(states.some(s=>s.shadow<.01));
  assert.equal(orbitHealth(model,model.epoch+73*3600000).usable,false);assert.equal(orbitHealth(model,model.epoch-3*3600000).usable,false);
  assert.equal(orbitHealth(model,epoch).aging,true);assert.equal(compass(0),'N');assert.equal(compass(90),'E');
});
test('predicted passes cross the elevation threshold and visible windows meet illumination criteria',()=>{
  const passes=predictPasses(model,city,epoch);assert.ok(passes.length>3);assert.ok(passes.some(p=>p.visibleSegments.length));
  for(const p of passes){
    assert.ok(p.start<p.peakTime&&p.peakTime<p.end);assert.ok(p.maxElevation>=10);
    assert.ok(Math.abs(stateAt(model,p.start,city).elevation-10)<.1);
    assert.ok(Math.abs(stateAt(model,p.end,city).elevation-10)<.1);
    for(const v of p.visibleSegments){assert.ok(v.start>=p.start&&v.end<=p.end);assert.ok(stateAt(model,(v.start+v.end)/2,city).potentiallyVisible);}
  }
  assert.deepEqual(predictPasses(model,city,model.epoch+73*3600000),[]);
});
test('relativity model separates faster gravity contribution and slower motion contribution',()=>{
  const shift=relativisticShift(420,7.67);assert.ok(shift.gravity>3&&shift.gravity<5);assert.ok(shift.motion< -27&&shift.motion> -30);assert.ok(shift.net< -23&&shift.net> -26);
  assert.deepEqual(relativisticShift(0,0),{gravity:0,motion:-0,net:0});
});
test('ISS feed validation rejects wrong spacecraft, units, malformed orbit and invalid coordinates',()=>{
  for(const v of [{...raw,NORAD_CAT_ID:99999},{...raw,EPOCH:'invalid'},{...raw,MEAN_MOTION:0},{...raw,INCLINATION:999},{...raw,BSTAR:Infinity}])assert.throws(()=>validateOrbit(v));
  for(const v of [{...report,id:1},{...report,units:'miles'},{...report,latitude:NaN},{...report,altitude:9999}])assert.throws(()=>validateFix(v));
  assert.throws(()=>validateTle({line1:'broken',line2:'broken'}));assert.equal(validateFix(report).timestamp,epoch);
});
test('ISS service coalesces requests, caches GP for two hours and backs off after network failure',async()=>{
  let time=epoch,fail=false;const calls=[];
  const service=createIssDataService({now:()=>time,fetcher:async url=>{calls.push(url);if(fail)throw Error('offline');return url===URLS.orbit?raw:{...report,timestamp:time/1000};}});
  const a=service.refresh(),b=service.refresh();assert.equal(a,b);const first=await a;
  assert.equal(first.connectivity,'online');assert.equal(first.orbit.source,'CelesTrak');assert.equal(calls.length,2);
  await service.refresh();assert.equal(calls.length,2);
  time+=10001;await service.refresh();assert.equal(calls.filter(u=>u===URLS.orbit).length,1);
  fail=true;time+=10001;const offline=await service.refresh();assert.equal(offline.connectivity,'unreachable');assert.ok(offline.orbit);assert.ok(offline.retryAt>time);
  await service.refresh();assert.equal(calls.filter(u=>u===URLS.orbit).length,1);
  fail=false;time+=2*3600000;await service.refresh();assert.equal(calls.filter(u=>u===URLS.orbit).length,2);
});
test('ISS cache survives offline restart and corrupt cache cannot fabricate an orbit',async()=>{
  const folder=await fs.mkdtemp(path.join(os.tmpdir(),'atomic-iss-data-')),storagePath=path.join(folder,'iss-cache.json');
  try{
    const online=createIssDataService({storagePath,now:()=>epoch,fetcher:async url=>url===URLS.orbit?raw:report});await online.refresh();
    const offline=createIssDataService({storagePath,now:()=>epoch+60000,fetcher:async()=>{throw Error('offline');}});
    const saved=await offline.refresh();assert.equal(saved.connectivity,'unreachable');assert.equal(saved.orbit.epoch,orbit.epoch);
    await fs.writeFile(storagePath,JSON.stringify({orbit:{kind:'omm',data:{...raw,NORAD_CAT_ID:9999}}}));
    const bad=createIssDataService({storagePath,now:()=>epoch,fetcher:async()=>{throw Error('offline');}});
    assert.equal((await bad.refresh()).orbit,null);
  }finally{await fs.rm(folder,{recursive:true,force:true});}
});
test('ISS service falls back to a checksummed TLE without repeatedly requesting CelesTrak',async()=>{
  const checksum=body=>body.slice(0,68)+([...body.slice(0,68)].reduce((n,c)=>n+(c==='-'?1:/\d/.test(c)?+c:0),0)%10);
  const tle={line1:checksum('1 25544U 98067A   26297.20915682  .00003075  00000-0  59442-4 0  9992'),
    line2:checksum('2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442')};
  let time=epoch;const calls=[];
  const service=createIssDataService({now:()=>time,fetcher:async url=>{calls.push(url);if(url===URLS.orbit)throw Error('Unavailable');return url===URLS.tle?tle:report;}});
  const result=await service.refresh();assert.equal(result.orbit.kind,'tle');assert.equal(result.orbit.source,'Where the ISS at');
  assert.ok(prepareOrbit(result.orbit));time+=11000;await service.refresh();assert.equal(calls.filter(u=>u===URLS.orbit).length,1);assert.equal(calls.filter(u=>u===URLS.tle).length,1);
});
test('ISS rate-limit Retry-After delays are respected by subsequent refresh calls',async()=>{
  let time=epoch,count=0;
  const service=createIssDataService({now:()=>time,fetcher:async()=>{count++;throw Object.assign(Error('Rate limited'),{retryAfterMs:3600000});}});
  const result=await service.refresh();assert.ok(result.retryAt>=time+3600000);const firstCount=count;
  time+=60000;await service.refresh();assert.equal(count,firstCount);
});
test('ISS orbit recovers after an offline first launch without bypassing the CelesTrak cache interval',async()=>{
  const check=line=>line.slice(0,68)+([...line.slice(0,68)].reduce((n,c)=>n+(c==='-'?1:/\d/.test(c)?+c:0),0)%10);
  const tle={line1:check('1 25544U 98067A   26297.20915682  .00003075  00000-0  59442-4 0  9992'),line2:check('2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442')};
  let time=epoch,online=false;const calls=[];
  const service=createIssDataService({now:()=>time,fetcher:async url=>{calls.push(url);if(!online||url===URLS.orbit)throw Error('Unavailable');return url===URLS.tle?tle:report;}});
  assert.equal((await service.refresh()).orbit,null);online=true;time+=61000;
  assert.equal((await service.refresh()).orbit.kind,'tle');assert.equal(calls.filter(u=>u===URLS.orbit).length,1);
});
