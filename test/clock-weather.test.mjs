import test from 'node:test';import assert from 'node:assert/strict';
import {weatherCondition,weatherIcon,visibleForecast,weatherSnapshot} from '../src/clock-weather.mjs';
test('weather symbols distinguish clear night, rain, snow and unknown codes from the local Weatherfonts font',()=>{
 assert.equal(weatherCondition(65)[1],'rain');assert.equal(weatherCondition(86)[1],'snow');assert.equal(weatherCondition(null)[1],'unknown');assert.match(weatherIcon(0,false),/wi-night-clear/);assert.match(weatherIcon(95),/wi-thunderstorm/);assert.doesNotMatch(weatherIcon('<script>'),/<script>|https:/);
});
test('future hourly and daily forecast windows do not bring expired days back into view',()=>{
 const epoch=Date.parse('2026-11-04T12:30Z'),packet={hourly:Array.from({length:24},(_,i)=>({time:epoch+(i-1)*3600000})),daily:['2026-11-03','2026-11-04','2026-11-05'].map(date=>({date}))};
 const result=visibleForecast(packet,epoch,'2026-11-04');assert.equal(result.hourly.length,6);assert.equal(result.hourly[0].time,epoch);assert.equal(result.hourly[1].time,epoch+3*3600000);assert.equal(result.daily[0].date,'2026-11-04');
});

test('dashboard and full-screen clock share freshness limits for current conditions and forecast',()=>{
 const epoch=Date.parse('2026-11-04T12:30Z'),packet={current:{time:epoch},hourly:[{time:epoch}],daily:[{date:'2026-11-04'}]};
 assert.equal(weatherSnapshot(packet,epoch,'2026-11-04').current,packet.current);
 assert.equal(weatherSnapshot(packet,epoch+90*60000,'2026-11-04').current,null);
 assert.equal(weatherSnapshot(packet,epoch+90*60000,'2026-11-04').forecast.daily.length,1);
 assert.equal(weatherSnapshot(packet,epoch+6*3600000,'2026-11-04').forecast.daily.length,0);
 assert.equal(weatherSnapshot(packet,epoch-31*60000,'2026-11-04').current,null);
 assert.equal(weatherSnapshot(packet,epoch-31*60000,'2026-11-04').forecast.daily.length,0);
 assert.equal(weatherSnapshot(null,epoch,'2026-11-04').current,null);
});
