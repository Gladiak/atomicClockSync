const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
const {weatherLocation,weatherUrl,validateWeather,createWeatherService}=require('../electron/weather-data.cjs');
const raw=require('./fixtures/weather-rome.json'),city={latitude:41.8919,longitude:12.5113,timeZone:'Europe/Rome'};
const copy=()=>structuredClone(raw);
test('weather requests contain only validated coordinates, fixed forecast fields and an IANA zone',()=>{
 const url=new URL(weatherUrl({...city,name:'Private personal note',url:'https://example.invalid'}));assert.equal(url.origin,'https://api.open-meteo.com');assert.equal(url.pathname,'/v1/forecast');assert.equal(url.searchParams.get('forecast_days'),'7');assert.equal(url.searchParams.get('past_hours'),'3');assert.equal(url.searchParams.has('name'),false);
 for(const change of [{latitude:NaN},{longitude:181},{latitude:'41'},{timeZone:'../../etc/passwd'}])assert.throws(()=>weatherLocation({...city,...change}));
 assert.equal(weatherLocation({...city,timeZone:'UTC'}).timeZone,'UTC');
 assert.equal(url.searchParams.get('forecast_hours'),'168','Bound the hourly horizon when requesting past hours');
});
test('station readings validate units, retain unknowns and accept a complete seven-day forecast',()=>{
 const sample=require('./fixtures/weather-station.cjs'),result=validateWeather(sample,city);
 assert.equal(result.hourly.length,168);assert.equal(result.daily.length,7);
 assert.equal(result.current.pressure,1014.5);assert.equal(result.current.gusts,23.8);assert.equal(result.current.windDirection,225);
 assert.equal(result.current.dewPoint,8.3);assert.equal(result.current.cloud,81);assert.equal(result.current.visibility,14500);
 assert.equal(result.daily[2].precipitation,8.4);assert.equal(result.daily[0].precipitation,0);
 const partial=structuredClone(sample);partial.current.pressure_msl=null;partial.current.visibility=-1;partial.daily.precipitation_sum[0]=null;partial.hourly.pressure_msl[3]=null;
 const missing=validateWeather(partial,city);assert.equal(missing.current.pressure,null);assert.equal(missing.current.visibility,null);assert.equal(missing.daily[0].precipitation,null);assert.equal(missing.hourly[3].pressure,null);
 for(const mutate of [x=>x.current_units.pressure_msl='Pa',x=>x.daily_units.precipitation_sum='inch',x=>x.hourly.pressure_msl.pop()]){const broken=structuredClone(sample);mutate(broken);assert.throws(()=>validateWeather(broken,city));}
 const legacy=validateWeather(raw,city);assert.equal(legacy.current.pressure,null);assert.equal(legacy.current.gusts,null);assert.equal(legacy.daily[0].precipitation,null);
});
test('model reports preserve UTC instants, local daily dates, declared units and unknown measurements',()=>{
 const result=validateWeather(raw,city);assert.equal(result.current.time,raw.current.time*1000);assert.equal(result.daily[0].date,'2026-11-04');assert.equal(result.hourly.length,120);assert.equal(result.current.temperature,raw.current.temperature_2m);
 const partial=copy();partial.current.temperature_2m=null;partial.current.relative_humidity_2m=101;partial.current.weather_code=10000;partial.hourly.temperature_2m[0]='17';partial.daily.temperature_2m_max[0]=-5;partial.daily.temperature_2m_min[0]=10;
 const unknown=validateWeather(partial,city);assert.equal(unknown.current.temperature,null);assert.equal(unknown.current.humidity,null);assert.equal(unknown.current.code,null);assert.equal(unknown.hourly[0].temperature,null);assert.equal(unknown.daily[0].high,null);assert.equal(unknown.daily[0].low,null);
 for(const mutate of [x=>x.latitude=10,x=>x.timezone='Asia/Tokyo',x=>x.current_units.temperature_2m='°F',x=>x.hourly.time.reverse(),x=>x.daily.weather_code.pop()]){const broken=copy();mutate(broken);assert.throws(()=>validateWeather(broken,city));}
});
test('daily date keys use the declared date offset, while hourly DST instants remain distinct',()=>{
 const shifted=copy();shifted.utc_offset_seconds=7200;shifted.daily.time=shifted.daily.time.map((_,i)=>Date.UTC(2026,9,24+i,22)/1000);
 const result=validateWeather(shifted,city);assert.deepEqual(result.daily.map(day=>day.date),['2026-10-25','2026-10-26','2026-10-27','2026-10-28','2026-10-29']);
 const a=Date.parse('2026-10-25T00:00:00Z'),b=a+3600000;const format=new Intl.DateTimeFormat('en',{timeZone:city.timeZone,hour:'2-digit',timeZoneName:'short'});assert.notEqual(format.format(a),format.format(b));
});
test('requests coalesce, use a 15 minute cache and never lend another city its weather',async()=>{
 let epoch=raw.current.time*1000,calls=0,release;const service=createWeatherService({now:()=>epoch,fetcher:url=>{calls++;if(!url.includes('latitude=41.8919'))return copy();return new Promise(resolve=>release=resolve);}});
 const first=service.get(city),second=service.get(city);await new Promise(resolve=>setImmediate(resolve));assert.equal(calls,1);release(copy());assert.deepEqual(await first,await second);
 assert.equal((await service.get(city)).connectivity,'cache');assert.equal(calls,1);
 assert.equal((await service.get({latitude:35.68,longitude:139.69,timeZone:'Asia/Tokyo'})).weather,null);
});
test('offline cache, failure backoff, expiry and persistent reload retain honest availability',async t=>{
 let epoch=raw.current.time*1000,calls=0,offline=false;const dir=await fs.mkdtemp(path.join(os.tmpdir(),'atomic-weather-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));const storagePath=path.join(dir,'cache.json');
 const service=createWeatherService({storagePath,now:()=>epoch,fetcher:async()=>{calls++;if(offline)throw Error('Offline');return copy();}});
 await service.get(city);await service.flush();
 const restored=createWeatherService({storagePath,now:()=>epoch,fetcher:async()=>{throw Error('Must use fresh disk cache');}});assert.equal((await restored.get(city)).weather.current.temperature,raw.current.temperature_2m);
 offline=true;epoch+=16*60000;const cached=await service.get(city);assert.equal(cached.connectivity,'offline');assert.ok(cached.weather);assert.equal(calls,2);await service.get(city);assert.equal(calls,2);
 epoch+=7*3600000;assert.equal((await service.get(city)).weather,null);
});
test('an older weather cache remains usable offline while station data are upgraded',async t=>{
 let epoch=raw.current.time*1000,calls=0,offline=true;const dir=await fs.mkdtemp(path.join(os.tmpdir(),'atomic-weather-upgrade-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));const storagePath=path.join(dir,'cache.json');
 await fs.writeFile(storagePath,JSON.stringify({version:1,entries:[{location:city,raw,fetchedAt:epoch}]}));
 const service=createWeatherService({storagePath,now:()=>epoch,fetcher:async()=>{calls++;if(offline)throw Error('Offline');return structuredClone(require('./fixtures/weather-station.cjs'));}});
 const saved=await service.get(city);assert.equal(calls,1,'Try to upgrade even a recently fetched legacy cache');assert.equal(saved.connectivity,'offline');assert.equal(saved.weather.current.temperature,raw.current.temperature_2m);assert.equal(saved.weather.current.pressure,null);
 offline=false;epoch+=31000;const fresh=await service.get(city);assert.equal(calls,2);assert.equal(fresh.weather.daily.length,7);assert.equal(fresh.weather.current.pressure,1014.5);
 await service.flush();assert.equal(JSON.parse(await fs.readFile(storagePath,'utf8')).version,2);
});
