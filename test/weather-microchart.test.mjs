import test from 'node:test';
import assert from 'node:assert/strict';
import {microchartGeometry} from '../src/weather-microchart-data.mjs';
const HOUR=3600000,start=Date.UTC(2026,9,25,0,30);
function packet(){
 const hour=Math.floor(start/HOUR)*HOUR;
 return {current:{time:start},hourly:Array.from({length:32},(_,i)=>({time:hour+(i-3)*HOUR,humidity:60+i/10,pressure:1015.2,wind:4+i/2,gusts:12+i/2,cloud:40+i,rain:i%3?0:60}))};
}
test('humidity and cloud retain absolute percentage scales, while pressure has a minimum visible range',()=>{
 for(const kind of ['humidity','cloud']){const geometry=microchartGeometry(packet(),start,kind);assert.equal(geometry.min,0);assert.equal(geometry.max,100);assert.ok(geometry.area);}
 const pressure=microchartGeometry(packet(),start,'pressure');assert.equal(pressure.max-pressure.min,8);assert.equal(pressure.high,1015.2);assert.equal(pressure.low,1015.2);
 const wind=microchartGeometry(packet(),start,'wind');assert.equal(wind.min,0);assert.ok(wind.secondary);assert.ok(wind.max>=wind.high);
});
test('hourly rainfall probabilities occupy clipped preceding-hour intervals and preserve true zero',()=>{
 const data=packet();data.hourly.forEach(row=>row.rain=0);
 const geometry=microchartGeometry(data,start,'rain');assert.ok(geometry.line.startsWith('M2.00,29.00L5.25,29.00'));assert.ok(geometry.line.endsWith('L158.00,29.00'));
 assert.ok(geometry.line.split(/[ML]/).filter(Boolean).every(point=>point.endsWith(',29.00')));assert.equal(geometry.max,100);
 data.hourly[6].rain=60;assert.ok(microchartGeometry(data,start,'rain').line.includes('L11.75,13.40L18.25,13.40'),'The probability stays constant over its preceding hour');
 for(const missingHour of [false,true]){
  const gap=structuredClone(data);if(missingHour)gap.hourly.splice(6,1);else gap.hourly[6].rain=null;
  const missing=microchartGeometry(gap,start,'rain');assert.equal(missing.line.split('M').length-1,2);assert.equal(missing.area.split('M').length-1,2);
 }
});
test('null samples and missing hours remain gaps instead of fabricated interpolation',()=>{
 for(const missingHour of [false,true]){
  const data=packet();const index=data.hourly.findIndex(row=>row.time===Math.floor(start/HOUR)*HOUR+8*HOUR);
  if(missingHour)data.hourly.splice(index,1);else data.hourly[index].humidity=null;
  assert.equal(microchartGeometry(data,start,'humidity').line.split('M').length-1,2);
 }
 const data=packet();data.hourly.forEach(row=>{row.wind=null;row.gusts=null;});assert.equal(microchartGeometry(data,start,'wind'),null);
 data.hourly.forEach(row=>row.gusts=20);const gusts=microchartGeometry(data,start,'wind');assert.equal(gusts.line,'');assert.ok(gusts.secondary);
});
test('stale, unavailable and invalid series do not create spurious zero lines',()=>{
 for(const data of [null,{current:{time:start},hourly:[]},packet()]){
  if(data?.hourly.length)data.hourly.forEach(row=>row.humidity=101);
  assert.equal(microchartGeometry(data,start,'humidity'),null);
 }
 assert.equal(microchartGeometry(packet(),start+6*HOUR,'wind'),null);assert.equal(microchartGeometry(packet(),start-HOUR,'pressure'),null);
 const gap=packet();gap.hourly=[gap.hourly[0],gap.hourly.at(-1)];assert.equal(microchartGeometry(gap,start,'pressure'),null);
});
test('all graphs share a real 24-hour UTC window through the DST clock repetition',()=>{
 for(const kind of ['humidity','pressure','wind','rain','cloud']){
  const data=microchartGeometry(packet(),start,kind);assert.equal(data.start,start);assert.equal(data.end-start,24*HOUR);
  assert.equal(/NaN|Infinity/.test(data.line+data.secondary+data.area),false);
 }
 const format=new Intl.DateTimeFormat('en',{timeZone:'Europe/Rome',hour:'2-digit',minute:'2-digit',timeZoneName:'short'});
 assert.notEqual(format.format(start),format.format(start+HOUR));
});
