import test from 'node:test';
import assert from 'node:assert/strict';
import {createBluetoothCollection} from '../src/bluetooth-collection.mjs';
import {loadCatalogueWatch} from '../src/watch-catalogue.mjs';
import {normalizeProfiles,DEFAULTS,createSnapshot} from '../src/trials.mjs';
const key='a'.repeat(64),model='GA-B2100-1A',family='GA-B2100';
const candidate={id:'1',model,family};
const pageURL='https://shockbase.org/watches/watch_dyn.php?model='+model;
const image={ok:true,model,dataURL:'data:image/png;base64,AAAA',pageURL,imageURL:'https://shockbase.org/pics2/'+model+'.png'};
const specs={version:1,model,subseries:family,moduleIds:['5689'],source:{provider:'shockbase',url:pageURL,retrievedAt:1000}};
const watch={key,model:family,module:'5689'};
function setup(overrides={}){
 let profiles=[],searches=0;
 const desktop={searchWatchPhotos:async()=>{searches++;return {ok:true,results:[candidate,{...candidate,id:'2',model:'GA-B2100-9A'}]};},
  getWatchSpecs:async()=>({ok:true,model,specs}),getWatchPhoto:async()=>image,...overrides};
 const putProfile=profile=>{profiles=normalizeProfiles([...profiles.filter(p=>p.id!==profile.id),profile]);return true;};
 const controller=createBluetoothCollection({desktop,getProfiles:()=>profiles,getSettings:()=>DEFAULTS,putProfile,notify:()=>{},
  preparePhoto:async()=>image.dataURL,createId:()=>String(profiles.length+1)});
 return {desktop,controller,putProfile,get profiles(){return profiles;},get searches(){return searches;},remove(){profiles=[];}};
}
test('first sent watch is immediately saved, enriched with first result and deduplicated after reload',async()=>{
 const h=setup();const job=h.controller.sent(watch,10);
 assert.equal(h.profiles.length,1);assert.equal(h.profiles[0].details.variant.status,'pending');
 await job;
 const profile=h.profiles[0];assert.equal(profile.model,model);assert.equal(profile.details.specs.model,model);assert.equal(profile.details.photo,image.dataURL);
 assert.equal(profile.details.variant.status,'automatic');assert.equal(profile.bluetooth.lastSentAt,10);
 assert.equal(JSON.stringify(createSnapshot(DEFAULTS,profile,'',null)).includes(key),false);
 h.putProfile(normalizeProfiles(JSON.parse(JSON.stringify(h.profiles)))[0]);
 await h.controller.sent(watch,20);assert.equal(h.profiles.length,1);assert.equal(h.searches,1);assert.equal(h.profiles[0].bluetooth.lastSentAt,20);
 await h.controller.sent({...watch,key:'b'.repeat(64)},30);assert.equal(h.profiles.length,2,'Two physical watches in one family are distinct');
});
test('offline enrichment keeps a persistent base watch and retries on a later successful send',async()=>{
 const h=setup({searchWatchPhotos:async()=>({ok:false,code:'network'})});
 await h.controller.sent(watch,10);assert.equal(h.profiles[0].details.variant.status,'pending');
 h.desktop.searchWatchPhotos=async()=>({ok:true,results:[candidate]});await h.controller.sent(watch,20);
 assert.equal(h.profiles.length,1);assert.equal(h.profiles[0].details.variant.status,'automatic');
});
test('a late automatic result preserves personal edits and cannot overwrite a manual variant or restore a deleted watch',async()=>{
 for(const action of ['notes','manual','delete']){
  let finish;const h=setup({searchWatchPhotos:()=>new Promise(resolve=>{finish=resolve;})});
  const job=h.controller.sent(watch,10),profile=h.profiles[0];
  if(action==='delete')h.remove();
  else h.putProfile({...profile,name:'My watch',details:{...profile.details,note:'Keep me',acquiredAt:'2025-01-01',
   ...(action==='manual'?{variant:{family,status:'confirmed'}}:{})}});
  finish({ok:true,results:[candidate]});await job;
  if(action==='delete'){assert.equal(h.profiles.length,0);continue;}
  assert.equal(h.profiles[0].name,'My watch');assert.equal(h.profiles[0].details.note,'Keep me');assert.equal(h.profiles[0].details.acquiredAt,'2025-01-01');
  assert.equal(h.profiles[0].details.variant.status,action==='manual'?'confirmed':'automatic');
  if(action==='manual')assert.equal(h.profiles[0].model,family);
 }
});
test('unidentified watches and full storage do not start catalogue work',async()=>{
 const h=setup();await h.controller.sent({...watch,key:'scan-token'},10);assert.equal(h.profiles.length,0);assert.equal(h.searches,0);
 const c=createBluetoothCollection({desktop:h.desktop,getProfiles:()=>[],getSettings:()=>DEFAULTS,putProfile:()=>false,notify:()=>{}});
 await c.sent(watch,10);assert.equal(h.searches,0);
});
test('wrong module, wrong image identity and partial failures never mix photo and technical sheet',async()=>{
 for(const overrides of [{getWatchSpecs:async()=>({ok:true,model,specs:{...specs,moduleIds:['9999']}})},
  {getWatchPhoto:async()=>({...image,model:'GA-B2100-9A'})},{getWatchPhoto:async()=>({ok:false,code:'network'})}]){
  const h=setup(overrides);await h.controller.sent(watch,10);
  assert.equal(h.profiles[0].details.variant.status,'pending');assert.equal(h.profiles[0].details.photo,'');assert.equal(h.profiles[0].details.specs,undefined);
 }
 const h=setup();await assert.rejects(loadCatalogueWatch(h.desktop,{...candidate,model:'GWG-B1000-1A'},{preparePhoto:async()=>image.dataURL}),/identity/);
});
