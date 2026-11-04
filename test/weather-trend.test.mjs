import test from 'node:test';
import assert from 'node:assert/strict';
import {temperatureSeries,trendGeometry} from '../src/weather-trend-data.mjs';
import {atmosphereForAltitude,solarAtmosphere} from '../src/solar-atmosphere.mjs';
const HOUR=3600000,epoch=Date.parse('2026-11-04T14:45:00Z');
const packet={current:{time:epoch},hourly:Array.from({length:28},(_,i)=>({time:Date.parse('2026-11-04T14:00:00Z')+i*HOUR,temperature:10+i}))};

test('the trend covers exactly the next 24 hours, interpolating only its boundaries',()=>{
 const series=temperatureSeries(packet,epoch);
 assert.equal(series[0].time,epoch);assert.equal(series.at(-1).time,epoch+24*HOUR);assert.equal(series.length,26);
 assert.equal(series[0].temperature,10.75);assert.equal(series.at(-1).temperature,34.75);
 assert.equal(series[1].temperature,11);
 const chart=trendGeometry(series);assert.equal(chart.points[0].x,6);assert.equal(chart.points.at(-1).x,314);
});
test('missing samples and missing hours create separate lines and never interpolate across a gap',()=>{
 const row=(hour,temperature)=>({time:epoch+hour*HOUR,temperature});
 const chart=trendGeometry([row(0,10),row(1,12),row(2,null),row(3,8),row(4,9),row(7,14),row(8,13)]);
 assert.equal((chart.line.match(/M/g)||[]).length,3);assert.equal((chart.area.match(/Z/g)||[]).length,3);
 const missing=temperatureSeries({...packet,hourly:packet.hourly.filter((_row,i)=>i!==0)},epoch);
 assert.equal(missing[0].temperature,null,'No starting estimate without bracketing samples');
});
test('flat, negative and insufficient forecasts do not produce invalid chart geometry',()=>{
 const flat=packet.hourly.map(row=>({...row,temperature:-5})),chart=trendGeometry(temperatureSeries({...packet,hourly:flat},epoch));
 assert.equal(chart.low,-5);assert.equal(chart.high,-5);assert.doesNotMatch(chart.line,/NaN|Infinity/);
 assert.ok(chart.points.every(point=>point.y>0&&point.y<56));
 assert.equal(trendGeometry([]),null);assert.equal(trendGeometry([{time:epoch,temperature:0}]),null);
 assert.equal(trendGeometry([{time:epoch,temperature:null},{time:epoch+HOUR,temperature:null}]),null);
 assert.equal(trendGeometry([{time:epoch,temperature:0},{time:epoch+4*HOUR,temperature:1}]),null);
});
test('forecast freshness is independent of the shorter current-weather limit',()=>{
 assert.deepEqual(temperatureSeries(null,epoch),[]);
 assert.deepEqual(temperatureSeries({...packet,current:{time:epoch-6*HOUR}},epoch),[]);
 assert.deepEqual(temperatureSeries({...packet,current:{time:epoch+31*60000}},epoch),[]);
 assert.ok(temperatureSeries({...packet,current:{time:epoch-2*HOUR}},epoch).length>0);
});
test('repeated local hours at DST fall-back remain distinct points in a 24-hour UTC window',()=>{
 const start=Date.parse('2026-10-24T23:30Z'),hourly=Array.from({length:28},(_,i)=>({time:start-30*60000+i*HOUR,temperature:i}));
 const series=temperatureSeries({current:{time:start},hourly},start);
 const format=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
 const repeated=series.filter(row=>format.format(row.time)==='02:00');
 assert.equal(series.at(-1).time-series[0].time,24*HOUR);assert.equal(repeated.length,2);assert.equal(repeated[1].time-repeated[0].time,HOUR);
});
test('atmosphere follows actual solar altitude, including twilight and polar seasons',()=>{
 assert.equal(atmosphereForAltitude(6),'day');assert.equal(atmosphereForAltitude(0),'twilight');assert.equal(atmosphereForAltitude(-6),'twilight');assert.equal(atmosphereForAltitude(-6.01),'night');assert.equal(atmosphereForAltitude(NaN),'neutral');
 const rome={latitude:41.8919,longitude:12.5113};
 assert.equal(solarAtmosphere(Date.parse('2026-11-04T12:00Z'),rome),'day');assert.equal(solarAtmosphere(Date.parse('2026-11-04T00:00Z'),rome),'night');
 const polar={latitude:80,longitude:0};
 assert.equal(solarAtmosphere(Date.parse('2026-06-21T00:00Z'),polar),'day');assert.equal(solarAtmosphere(Date.parse('2026-12-21T12:00Z'),polar),'night');
 assert.equal(solarAtmosphere(NaN,rome),'neutral');assert.equal(solarAtmosphere(epoch,{latitude:null,longitude:0}),'neutral');
});
