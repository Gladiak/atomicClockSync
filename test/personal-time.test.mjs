import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeWatchDetails} from '../src/watch-collection-data.mjs';
import {watchOverview} from '../src/now-view.mjs';
import {validSharedEpoch} from '../src/shared-instant.mjs';
import {synchronizationStage} from '../src/sync-journey.mjs';
import {normalizeProfiles,createSnapshot,DEFAULTS} from '../src/trials.mjs';
const day=86400000,now=Date.UTC(2026,10,4);

test('collection metadata survives migration without duplicating photos into reception snapshots',()=>{
 const details={photo:'data:image/jpeg;base64,/9j/AA==',acquiredAt:'2024-02-29',note:' My first watch 日本語 '};
 const profile=normalizeProfiles([{id:'a',name:'Daily',details}])[0];
 assert.equal(profile.details.acquiredAt,'2024-02-29');
 assert.equal(profile.details.note,'My first watch 日本語');
 assert.deepEqual(normalizeProfiles(JSON.parse(JSON.stringify([profile])))[0],profile);
 const snapshot=createSnapshot(DEFAULTS,profile,'Default',null);
 assert.equal(JSON.stringify(snapshot).includes('/9j/AA=='),false);
 assert.deepEqual(normalizeWatchDetails({photo:'https://example.com/watch.jpg',acquiredAt:'2025-02-29'}),{photo:'',acquiredAt:'',note:''});
 assert.equal(normalizeWatchDetails({photo:'data:image/svg+xml;base64,AAAA'}).photo,'');
 assert.equal(normalizeWatchDetails({photo:'data:image/jpeg;base64,'+'A'.repeat(320000)}).photo,'');
});

test('home never carries a drift estimate across correction or beyond seven days',()=>{
 const profile={id:'a'},entries=[{id:'one',type:'measurement',profileId:'a',at:now-2*day,offsetSeconds:2,readingStep:1},{id:'two',type:'measurement',profileId:'a',at:now-day,offsetSeconds:4,readingStep:1}];
 const archive={version:1,entries};
 assert.equal(watchOverview(profile,[],archive,now).drift,2);
 assert.equal(watchOverview(profile,[],archive,now+8*day).drift,null);
 assert.equal(watchOverview(profile,[{at:now-1000,endedAt:now,outcome:'get',snapshot:{profileId:'a'}}],archive,now).drift,null);
 entries.push({id:'correction',type:'adjustment',profileId:'a',at:now});
 assert.equal(watchOverview(profile,[],archive,now).drift,null);
 const history=[{at:now-1,outcome:'unverified',snapshot:{profileId:'a'}},{at:now-3,outcome:'get',snapshot:{profileId:'b'}},{at:now-4,outcome:'get',snapshot:{profileId:'a'}}];
 assert.equal(watchOverview(profile,history,archive,now).last.at,now-4);
 assert.equal(watchOverview(null,history,archive,now).last,null);
});

test('synchronization stages align to complete minutes and require explicit receipt confirmation',()=>{
 const session={startEpoch:now+2000,firstFullMinute:now+60000};
 assert.equal(synchronizationStage(session,false,now+10000),'aligning');
 assert.equal(synchronizationStage(session,false,now+60000),'sending');
 assert.equal(synchronizationStage(null,false,now,'complete'),'verify');
 assert.equal(synchronizationStage(null,false,now,'confirmed'),'confirmed');
 assert.equal(synchronizationStage(null,false,now,'interrupted'),'ready');
});

test('shared sky previews reject unsupported dates and never silently clamp them',()=>{
 assert.equal(validSharedEpoch(Date.UTC(1900,0,1)),true);
 assert.equal(validSharedEpoch(Date.UTC(2100,11,31,23,59,59,999)),true);
 for(const epoch of [Date.UTC(1899,11,31),Date.UTC(2101,0,1),NaN,Infinity,null])assert.equal(validSharedEpoch(epoch),false);
});
