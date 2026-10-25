import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { solarPosition, solarAltitude, lightPhase, seasonEvents, sunEvents, localDayBounds, localDateKey, distanceKm, validCity, DAY } from '../src/world-math.mjs';
import { createCityIndex, searchCities } from '../src/city-search.mjs';

test('seasonal solar geometry: equinox, opposite solstices, subsolar noon and antipodal midnight', () => {
  const seasons = seasonEvents(2026);
  assert.deepEqual(seasons.map(e=>new Date(e).getUTCMonth()),[2,5,8,11]);
  for(const i of [0,2]) assert.ok(Math.abs(solarPosition(seasons[i]).latitude)<.01);
  assert.ok(Math.abs(solarPosition(seasons[1]).latitude-23.44)<.02);
  assert.ok(Math.abs(solarPosition(seasons[3]).latitude+23.44)<.02);
  for(const time of seasons){
    const sun=solarPosition(time);
    assert.ok(Math.abs(solarAltitude(sun,sun)-90)<.00001);
    assert.ok(Math.abs(solarAltitude({latitude:-sun.latitude,longitude:sun.longitude+180},sun)+90)<.00001);
  }
});
test('Earth rotation crosses the antimeridian continuously and has no longitude seam', () => {
  const a=solarPosition(Date.parse('2026-03-20T11:00:00Z')),b=solarPosition(Date.parse('2026-03-20T12:00:00Z'));
  assert.ok(Math.abs(a.longitude-b.longitude-15)<.1);
  for(const epoch of [Date.parse('2026-03-20T00:00:00Z'),Date.parse('2026-06-21T23:59:59Z')]){
    const sun=solarPosition(epoch);
    assert.ok(Math.abs(solarAltitude({latitude:50,longitude:180},sun)-solarAltitude({latitude:50,longitude:-180},sun))<1e-10);
  }
  assert.deepEqual([5,-2,-8,-14,-20].map(lightPhase),['Daylight','Civil twilight','Nautical twilight','Astronomical twilight','Night']);
});
test('city local days respect DST and sunrise/sunset remain in the selected local day',()=>{
  const city={latitude:41.8919,longitude:12.5113,timeZone:'Europe/Rome'};
  for(const [day,hours] of [['2026-03-29',23],['2026-10-25',25]]){
    const epoch=Date.parse(day+'T12:00:00Z'),[a,b]=localDayBounds(epoch,city.timeZone),events=sunEvents(epoch,city);
    assert.equal(b-a,hours*3600000);
    assert.equal(localDateKey(events.rise,city.timeZone),day);assert.equal(localDateKey(events.set,city.timeZone),day);
    assert.ok(events.daylightMs>8*3600000&&events.daylightMs<15*3600000);
  }
  const pacific={...city,latitude:-13.83,longitude:-171.77,timeZone:'Pacific/Apia'};
  const e=Date.parse('2026-01-01T18:00:00Z');assert.equal(localDateKey(e,pacific.timeZone),'2026-01-02');
  const events=sunEvents(e,pacific);assert.equal(localDateKey(events.rise,pacific.timeZone),'2026-01-02');
  const [start,end]=localDayBounds(Date.parse('2018-11-04T12:00:00Z'),'America/Sao_Paulo');assert.equal(end-start,23*3600000);
  const [beforeSkip,afterSkip]=localDayBounds(Date.parse('2011-12-29T22:00:00Z'),'Pacific/Apia');assert.equal(afterSkip-beforeSkip,DAY);
});
test('polar day and polar night produce no invented sunrise or sunset',()=>{
  const city={latitude:78.22,longitude:15.65,timeZone:'Arctic/Longyearbyen'};
  const summer=sunEvents(seasonEvents(2026)[1],city),winter=sunEvents(seasonEvents(2026)[3],city);
  assert.equal(summer.polar,'Polar day');assert.equal(summer.rise,null);assert.equal(summer.set,null);assert.equal(summer.daylightMs,DAY);
  assert.equal(winter.polar,'Polar night');assert.equal(winter.rise,null);assert.equal(winter.set,null);assert.equal(winter.daylightMs,0);
  assert.equal(validCity({...city,name:'Invalid',timeZone:'not/a-zone'}),null);
  assert.equal(validCity({...city,name:'Invalid',latitude:100}),null);
  assert.equal(distanceKm(city,city),0);
});
test('real offline catalog resolves native aliases, accents, countries and homonyms with valid time zones',()=>{
  const catalog=JSON.parse(fs.readFileSync(new URL('../assets/world/cities.json',import.meta.url)));
  const index=createCityIndex(catalog);
  assert.ok(catalog.cities.length>100000);
  const rome=searchCities('Roma',catalog,index)[0];assert.equal(rome.id,3169070);assert.equal(rome.timeZone,'Europe/Rome');
  assert.equal(searchCities('São Paulo Brazil',catalog,index)[0].timeZone,'America/Sao_Paulo');
  assert.equal(searchCities('Tokyo',catalog,index)[0].timeZone,'Asia/Tokyo');
  const springfields=searchCities('Springfield US',catalog,index);assert.ok(springfields.length>1);
  assert.ok(springfields.every(c=>c.country==='United States'));assert.notEqual(springfields[0].region,springfields[1].region);
  assert.deepEqual(searchCities('zzzzzzzzzzzzzzz',catalog,index),[]);
  assert.deepEqual(searchCities('a',catalog,index),[]);
});
