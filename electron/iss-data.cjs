const https = require('node:https');
const fs = require('node:fs/promises');
const path = require('node:path');
const HOUR = 3600000;
const URLS = Object.freeze({
  orbit: 'https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=JSON',
  tle: 'https://api.wheretheiss.at/v1/satellites/25544/tles',
  fix: 'https://api.wheretheiss.at/v1/satellites/25544',
});
const finite = (v,low,high) => typeof v === 'number' && Number.isFinite(v) && v >= low && v <= high;
function validateOrbit(value) {
  const omm = Array.isArray(value) ? value[0] : value;
  if (!omm || +omm.NORAD_CAT_ID !== 25544 || typeof omm.EPOCH !== 'string') throw Error('Invalid ISS orbit identity');
  const epoch = Date.parse(omm.EPOCH.endsWith('Z') ? omm.EPOCH : omm.EPOCH+'Z');
  if (!finite(epoch,Date.UTC(1998,0,1),Date.UTC(2101,0,1)) || !finite(omm.MEAN_MOTION,10,18)
    || !finite(omm.ECCENTRICITY,0,.1) || !finite(omm.INCLINATION,45,60)
    || !['RA_OF_ASC_NODE','ARG_OF_PERICENTER','MEAN_ANOMALY'].every(k=>finite(omm[k],0,360))
    || !['BSTAR','MEAN_MOTION_DOT','MEAN_MOTION_DDOT'].every(k=>finite(omm[k],-10,10))) throw Error('Invalid ISS orbital elements');
  const clean = Object.fromEntries(['MEAN_MOTION','ECCENTRICITY','INCLINATION','RA_OF_ASC_NODE','ARG_OF_PERICENTER','MEAN_ANOMALY',
    'BSTAR','MEAN_MOTION_DOT','MEAN_MOTION_DDOT'].map(k=>[k,omm[k]]));
  return { kind:'omm', epoch, data:{...clean,NORAD_CAT_ID:25544,OBJECT_NAME:'ISS (ZARYA)',EPOCH:new Date(epoch).toISOString(),
    EPHEMERIS_TYPE:0,CLASSIFICATION_TYPE:'U',ELEMENT_SET_NO:0,REV_AT_EPOCH:0}, source:'CelesTrak' };
}
function validateTle(value) {
  const {line1,line2} = value || {};
  function checksum(line){return [...line.slice(0,68)].reduce((n,c)=>n+(c==='-'?1:/\d/.test(c)?+c:0),0)%10;}
  if(typeof line1!=='string'||typeof line2!=='string'||line1.length!==69||line2.length!==69
    ||!line1.startsWith('1 25544')||!line2.startsWith('2 25544')||checksum(line1)!==+line1[68]||checksum(line2)!==+line2[68])throw Error('Invalid ISS TLE');
  const year=+line1.slice(18,20),day=+line1.slice(20,32);
  if(!finite(day,1,367))throw Error('Invalid orbit epoch');
  const epoch=Date.UTC(year>=57?1900+year:2000+year,0,1)+(day-1)*86400000;
  return {kind:'tle',epoch,data:{line1,line2},source:'Where the ISS at'};
}
function validateFix(value) {
  if(!value||value.id!==25544||value.units!=='kilometers'||!finite(value.latitude,-90,90)||!finite(value.longitude,-180,180)
    ||!finite(value.altitude,150,1000)||!finite(value.velocity,20000,35000)||!finite(value.timestamp,946684800,4133980800))throw Error('Invalid ISS position report');
  return {latitude:value.latitude,longitude:value.longitude,altitude:value.altitude,velocity:value.velocity,
    timestamp:value.timestamp*1000,source:'Where the ISS at'};
}
function fetchJsonNow(url) {
  if(!Object.values(URLS).includes(url))return Promise.reject(Error('ISS source is not allowed'));
  return new Promise((resolve,reject)=>{
    let settled=false;
    const finish=(error,value)=>{if(settled)return;settled=true;clearTimeout(deadline);error?reject(error):resolve(value);};
    const request=https.get(url,{headers:{'User-Agent':'AtomicClockSync/1.6 (desktop ISS tracker)','Accept':'application/json'}},response=>{
      if(response.statusCode!==200){
        const error=Error(`ISS source returned HTTP ${response.statusCode}`),retry=response.headers['retry-after'];
        if(retry){const delay=/^\d+$/.test(retry)?Number(retry)*1000:Date.parse(retry)-Date.now();
          if(Number.isFinite(delay)&&delay>0)error.retryAfterMs=Math.min(delay,24*HOUR);}
        response.resume();finish(error);return;
      }
      let body='',bytes=0;
      response.on('data',chunk=>{bytes+=chunk.length;if(bytes>128000){request.destroy();finish(Error('ISS response too large'));}else body+=chunk;});
      response.on('end',()=>{try{finish(null,JSON.parse(body));}catch{finish(Error('ISS source returned invalid JSON'));}});
      response.on('error',error=>finish(error));
    });
    const deadline=setTimeout(()=>{request.destroy();finish(Error('ISS source timed out'));},6500);
    request.on('error',error=>finish(error));
  });
}
let wtiaQueue=Promise.resolve(),lastWtiaStart=0,wtiaBlockedUntil=0;
function fetchJson(url){
  if(!url.startsWith('https://api.wheretheiss.at/'))return fetchJsonNow(url);
  const task=wtiaQueue.then(async()=>{
    if(Date.now()<wtiaBlockedUntil)throw Object.assign(Error('ISS provider retry delay active'),{retryAfterMs:wtiaBlockedUntil-Date.now()});
    const wait=Math.max(0,1100-(Date.now()-lastWtiaStart));if(wait)await new Promise(resolve=>setTimeout(resolve,wait));
    lastWtiaStart=Date.now();try{return await fetchJsonNow(url);}catch(error){if(error.retryAfterMs)wtiaBlockedUntil=Math.max(wtiaBlockedUntil,Date.now()+error.retryAfterMs);throw error;}
  });
  wtiaQueue=task.then(()=>undefined,()=>undefined);return task;
}
function createIssDataService({storagePath,fetcher=fetchJson,now=Date.now}={}) {
  let orbit=null,fix=null,lastOrbitAttempt=0,nextOrbitAttempt=0,nextTleAttempt=0,lastFixAttempt=0,lastSuccess=0,nextFixAttempt=0,failures=0,pending=null,loaded=false,lastWrite=0;
  let connectivity='unknown',error='';
  async function load(){
    if(loaded)return;loaded=true;
    if(!storagePath)return;
    try{
      const stat=await fs.stat(storagePath);if(stat.size>128000)return;
      const saved=JSON.parse(await fs.readFile(storagePath,'utf8'));
      if(saved.orbit){const clean=saved.orbit.kind==='omm'?validateOrbit(saved.orbit.data):validateTle(saved.orbit.data);
        if(finite(saved.orbit.fetchedAt,0,now()+60000))orbit={...clean,fetchedAt:saved.orbit.fetchedAt};}
      if(saved.fix)fix=validateFix({...saved.fix,id:25544,units:'kilometers',timestamp:saved.fix.timestamp/1000});
      lastOrbitAttempt=finite(saved.lastOrbitAttempt,0,now()+60000)?saved.lastOrbitAttempt:0;
      nextOrbitAttempt=finite(saved.nextOrbitAttempt,0,now()+24*HOUR)?saved.nextOrbitAttempt:lastOrbitAttempt+2*HOUR;
      nextTleAttempt=finite(saved.nextTleAttempt,0,now()+24*HOUR)?saved.nextTleAttempt:0;
    }catch{/* An absent or invalid cache never becomes fabricated tracking data. */}
  }
  async function save(){
    if(!storagePath)return;
    try{
      await fs.mkdir(path.dirname(storagePath),{recursive:true});
      await fs.writeFile(storagePath+'.tmp',JSON.stringify({schema:1,orbit,fix,lastOrbitAttempt,nextOrbitAttempt,nextTleAttempt}));await fs.rename(storagePath+'.tmp',storagePath);lastWrite=now();
    }catch{/* Tracking can continue in memory if cache storage is unavailable. */}
  }
  function snapshot(){return {orbit,fix,connectivity,lastSuccess,lastAttempt:lastFixAttempt,
    retryAt:Math.max(nextFixAttempt,lastFixAttempt+10000),error};}
  async function retrieveTle(){
    if(now()<nextTleAttempt)throw Error('ISS TLE retry delay active');
    nextTleAttempt=now()+60000;
    try{const clean=validateTle(await fetcher(URLS.tle));orbit={...clean,fetchedAt:now()};nextTleAttempt=now()+2*HOUR;}
    catch(error){nextTleAttempt=Math.max(nextTleAttempt,now()+Math.min(error.retryAfterMs||0,24*HOUR));throw error;}
  }
  async function update(){
    await load();const time=now();
    if(time<nextFixAttempt||time-lastFixAttempt<10000&&lastFixAttempt)return snapshot();
    lastFixAttempt=time;
    const needOrbit=!lastOrbitAttempt||time>=nextOrbitAttempt||time<lastOrbitAttempt;
    const tasks=[(async()=>{fix=validateFix(await fetcher(URLS.fix));return 'fix';})()];
    if(needOrbit){lastOrbitAttempt=time;nextOrbitAttempt=time+2*HOUR;tasks.push((async()=>{
      try{orbit={...validateOrbit(await fetcher(URLS.orbit)),fetchedAt:now()};}
      catch(error){nextOrbitAttempt=Math.max(nextOrbitAttempt,now()+Math.min(error.retryAfterMs||0,24*HOUR));await retrieveTle();}
      return 'orbit';
    })());}
    const results=await Promise.allSettled(tasks),ok=results.some(r=>r.status==='fulfilled');
    // A startup outage must not leave forecasts unavailable for the entire GP
    // cache interval after connectivity returns. Recover through the TLE source.
    if(!needOrbit&&results[0].status==='fulfilled'&&(!orbit||now()-orbit.epoch>72*HOUR)&&now()>=nextTleAttempt){
      try{await retrieveTle();await save();}catch{/* Keep the last validated data. */}
    }
    connectivity=ok?'online':'unreachable';
    if(results[0].status==='fulfilled'){failures=0;nextFixAttempt=now()+10000;}else{failures++;nextFixAttempt=now()+Math.max(Math.min(results[0].reason.retryAfterMs||0,24*HOUR),Math.min(300000,10000*2**Math.min(failures-1,5)));}
    if(ok)lastSuccess=now();
    error=results[0].status==='rejected'?'Position service unavailable; cached orbit may still be usable.':'';
    if(needOrbit||now()-lastWrite>60000)await save();
    return snapshot();
  }
  return {refresh(){if(!pending)pending=update().finally(()=>{pending=null;});return pending;}};
}
module.exports={createIssDataService,validateOrbit,validateTle,validateFix,URLS};
