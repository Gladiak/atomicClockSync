import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {prepareOrbit,stateAt} from '../src/iss-orbit.mjs';
import {currentIssState} from '../src/iss-current-state.mjs';
const require=createRequire(import.meta.url),{validateOrbit}=require('../electron/iss-data.cjs'),fixture=require('./fixtures/iss-omm.json');
const epoch=Date.parse('2026-10-25T14:33:11Z'),model=prepareOrbit(validateOrbit(fixture));
const fix={latitude:-41.18,longitude:-14.04,altitude:431.5,velocity:27552,timestamp:epoch,source:'Where the ISS at'};
test('home and observatory share the same current SGP4 state and km/s units',()=>{
 const actual=currentIssState(model,fix,epoch),expected=stateAt(model,epoch);
 assert.equal(actual.estimated,true);for(const key of ['latitude','longitude','altitude','speedKms'])assert.equal(actual[key],expected[key]);
 const fast=currentIssState(model,fix,epoch,null,{light:false});assert.equal(fast.speedKms,expected.speedKms);assert.equal(fast.sunlight,undefined);
});
test('position reports convert km/h once and expire after 30 seconds',()=>{
 const actual=currentIssState(null,fix,epoch+29999);assert.equal(actual.estimated,false);assert.equal(actual.speedKms,7.653333333333333);assert.equal(actual.altitude,431.5);assert.equal(actual.epoch,epoch);
 assert.equal(currentIssState(null,fix,epoch+30000),null);assert.equal(currentIssState(null,fix,epoch-30000),null);assert.equal(currentIssState(null,fix,epoch,null,{allowFix:false}),null);
});
test('stale, future, invalid and absent tracking data never turn into current telemetry',()=>{
 assert.equal(currentIssState(model,null,model.epoch+72*3600000+1),null);assert.equal(currentIssState(model,null,model.epoch-2*3600000-1),null);assert.equal(currentIssState(null,null,epoch),null);
 for(const change of [{timestamp:String(epoch)},{latitude:NaN},{longitude:181},{altitude:-1},{velocity:Infinity},{velocity:0}])assert.equal(currentIssState(null,{...fix,...change},epoch),null);
 const expired={...model,epoch:epoch-73*3600000};assert.equal(currentIssState(expired,fix,epoch).estimated,false,'A recent report can replace an expired prediction');
});
