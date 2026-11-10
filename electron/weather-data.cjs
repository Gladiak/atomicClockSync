const https=require('node:https');
const fs=require('node:fs/promises');
const path=require('node:path');
const MINUTE=60000,MAX_AGE=6*60*MINUTE;
const finite=(value,low,high)=>typeof value==='number'&&Number.isFinite(value)&&value>=low&&value<=high;
const optional=(value,low,high)=>finite(value,low,high)?value:null;
function weatherLocation(value){
  if(!value||!finite(value.latitude,-90,90)||!finite(value.longitude,-180,180)||typeof value.timeZone!=='string'||value.timeZone.length>80)throw Error('Invalid weather location');
  const timeZone=new Intl.DateTimeFormat('en',{timeZone:value.timeZone}).resolvedOptions().timeZone;
  return {latitude:Number(value.latitude.toFixed(4)),longitude:Number(value.longitude.toFixed(4)),timeZone};
}
const locationKey=value=>JSON.stringify(weatherLocation(value));
function weatherUrl(location){
  const city=weatherLocation(location),url=new URL('https://api.open-meteo.com/v1/forecast');
  for(const [key,value]of Object.entries({latitude:city.latitude,longitude:city.longitude,timezone:city.timeZone,timeformat:'unixtime',forecast_days:7,forecast_hours:168,past_hours:3,
    temperature_unit:'celsius',wind_speed_unit:'kmh',precipitation_unit:'mm',
    current:'temperature_2m,apparent_temperature,relative_humidity_2m,dew_point_2m,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl,cloud_cover,visibility,is_day',
    hourly:'temperature_2m,weather_code,precipitation_probability,pressure_msl,is_day',
    daily:'temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,precipitation_sum'}))url.searchParams.set(key,String(value));
  return url.href;
}
const stamp=value=>finite(value,946684800,4133980800)?value*1000:null;
const code=value=>Number.isInteger(value)&&[0,1,2,3,45,48,51,53,55,56,57,61,63,65,66,67,71,73,75,77,80,81,82,85,86,95,96,97,99].includes(value)?value:null;
function validateWeather(raw,location){
  const city=weatherLocation(location),longitudeDelta=Math.abs(raw?.longitude-city.longitude);
  if(!raw||raw.error||!finite(raw.latitude,-90,90)||!finite(raw.longitude,-180,180)||Math.abs(raw.latitude-city.latitude)>2
    ||Math.min(longitudeDelta,360-longitudeDelta)>5||!finite(raw.utc_offset_seconds,-50400,50400)
    ||weatherLocation({...city,timeZone:raw.timezone}).timeZone!==city.timeZone)throw Error('Weather location mismatch');
  if(raw.current_units?.temperature_2m!=='°C'||raw.current_units?.wind_speed_10m!=='km/h'||raw.hourly_units?.temperature_2m!=='°C'
    ||raw.hourly_units?.precipitation_probability!=='%'||raw.daily_units?.temperature_2m_max!=='°C'||raw.daily_units?.temperature_2m_min!=='°C'
    ||raw.daily_units?.precipitation_probability_max!=='%')throw Error('Unexpected weather units');
  const current=raw.current;
  if(!stamp(current?.time))throw Error('Missing weather time');
  // Older cached responses can omit station readings; absent units never turn
  // an unknown measurement into a zero or a value in the wrong unit.
  const extendedUnits={current:{dew_point_2m:'°C',wind_direction_10m:'°',wind_gusts_10m:'km/h',pressure_msl:'hPa',cloud_cover:'%',visibility:'m'},
    hourly:{pressure_msl:'hPa'},daily:{precipitation_sum:'mm'}};
  for(const [group,fields]of Object.entries(extendedUnits))for(const [key,unit]of Object.entries(fields)){
    if(raw[group+'_units']?.[key]!==undefined&&raw[group+'_units'][key]!==unit)throw Error('Unexpected weather units');
    if(group!=='current'&&raw[group]?.[key]!==undefined&&(!Array.isArray(raw[group][key])||raw[group][key].length!==raw[group].time?.length))throw Error('Invalid forecast series');
  }
  const measure=(group,key,unit,low,high,index)=>raw[group+'_units']?.[key]===unit?optional(index===undefined?raw[group]?.[key]:raw[group]?.[key]?.[index],low,high):null;
  function series(source,keys,maximum){
    if(!Array.isArray(source?.time)||!source.time.length||source.time.length>maximum||keys.some(key=>!Array.isArray(source[key])||source[key].length!==source.time.length))throw Error('Invalid forecast series');
    if(source.time.some((time,index)=>!stamp(time)||(index&&time<=source.time[index-1])))throw Error('Invalid forecast times');
  }
  series(raw.hourly,['temperature_2m','weather_code','precipitation_probability','is_day'],200);
  series(raw.daily,['temperature_2m_max','temperature_2m_min','weather_code','precipitation_probability_max'],7);
  return {location:city,current:{time:stamp(current.time),temperature:optional(current.temperature_2m,-100,70),feelsLike:optional(current.apparent_temperature,-130,100),
    humidity:optional(current.relative_humidity_2m,0,100),wind:optional(current.wind_speed_10m,0,500),code:code(current.weather_code),isDay:current.is_day===1?true:current.is_day===0?false:null,
    dewPoint:measure('current','dew_point_2m','°C',-130,70),windDirection:measure('current','wind_direction_10m','°',0,360),gusts:measure('current','wind_gusts_10m','km/h',0,500),
    pressure:measure('current','pressure_msl','hPa',800,1100),cloud:measure('current','cloud_cover','%',0,100),visibility:measure('current','visibility','m',0,500000)},
    hourly:raw.hourly.time.map((time,i)=>({time:stamp(time),temperature:optional(raw.hourly.temperature_2m[i],-100,70),code:code(raw.hourly.weather_code[i]),rain:optional(raw.hourly.precipitation_probability[i],0,100),
      pressure:measure('hourly','pressure_msl','hPa',800,1100,i),isDay:raw.hourly.is_day[i]===1?true:raw.hourly.is_day[i]===0?false:null})),
    // Open-Meteo daily Unix dates use the response offset, not future DST offsets.
    // Hourly instants are UTC; the renderer formats those with the city's IANA zone.
    daily:raw.daily.time.map((time,i)=>{let high=optional(raw.daily.temperature_2m_max[i],-100,70),low=optional(raw.daily.temperature_2m_min[i],-100,70);if(high!==null&&low!==null&&high<low)high=low=null;
      return {date:new Date((time+raw.utc_offset_seconds)*1000).toISOString().slice(0,10),high,low,code:code(raw.daily.weather_code[i]),rain:optional(raw.daily.precipitation_probability_max[i],0,100),
        precipitation:measure('daily','precipitation_sum','mm',0,3000,i)};})};
}
function fetchWeather(url){
  const parsed=new URL(url);
  if(parsed.origin!=='https://api.open-meteo.com'||parsed.pathname!=='/v1/forecast'||parsed.username||parsed.password)return Promise.reject(Error('Weather source not allowed'));
  return new Promise((resolve,reject)=>{
    let settled=false;
    const finish=(error,value)=>{if(settled)return;settled=true;clearTimeout(deadline);error?reject(error):resolve(value);};
    const request=https.get(url,{headers:{Accept:'application/json','User-Agent':'AtomicClockSync weather observatory'}},response=>{
      if(response.statusCode!==200){const error=Error('Weather provider unavailable');
        const retry=response.headers['retry-after'];if(retry){const duration=/^\d+$/.test(retry)?Number(retry)*1000:Date.parse(retry)-Date.now();if(duration>0)error.retryAfterMs=Math.min(duration,3600000);}
        response.resume();finish(error);return;}
      let body='',bytes=0;response.on('data',chunk=>{bytes+=chunk.length;if(bytes>256000){request.destroy();finish(Error('Weather response too large'));}else body+=chunk;});
      response.on('end',()=>{try{finish(null,JSON.parse(body));}catch{finish(Error('Invalid weather response'));}});response.on('error',error=>finish(error));
    });
    const deadline=setTimeout(()=>{request.destroy();finish(Error('Weather request timed out'));},8500);request.on('error',error=>finish(error));
  });
}
function createWeatherService({storagePath,fetcher=fetchWeather,now=Date.now}={}){
  const entries=new Map(),pending=new Map(),failures=new Map();let loading,starts=[],blockedUntil=0,writes=Promise.resolve();
  const result=(entry,connectivity)=>({weather:entry&&now()-entry.fetchedAt>=0&&now()-entry.fetchedAt<MAX_AGE?entry.weather:null,fetchedAt:entry?.fetchedAt||null,connectivity});
  function load(){return loading ||= (async()=>{if(!storagePath)return;try{
    if((await fs.stat(storagePath)).size>256000)return;
    const saved=JSON.parse(await fs.readFile(storagePath,'utf8'));if(![1,2].includes(saved.version)||!Array.isArray(saved.entries))return;
    for(const entry of saved.entries.slice(-8))try{if(!finite(entry.fetchedAt,now()-MAX_AGE,now()))continue;const location=weatherLocation(entry.location);
      entries.set(locationKey(location),{...entry,location,needsUpgrade:saved.version===1||entry.needsUpgrade===true,weather:validateWeather(entry.raw,location)});}catch{/* Discard an invalid cached city. */}
  }catch{/* A cache is optional. */}})();}
  function persist(){if(!storagePath)return;const saved=JSON.stringify({version:2,entries:[...entries.values()].map(({weather,...entry})=>entry)});
    writes=writes.then(async()=>{await fs.mkdir(path.dirname(storagePath),{recursive:true});const temp=storagePath+'.'+process.pid+'.tmp';await fs.writeFile(temp,saved);await fs.rename(temp,storagePath);}).catch(()=>{});}
  async function get(value){
    const location=weatherLocation(value),key=locationKey(location);await load();const previous=entries.get(key);
    if(previous&&!previous.needsUpgrade&&now()>=previous.fetchedAt&&now()-previous.fetchedAt<15*MINUTE)return result(previous,'cache');
    if(pending.has(key))return pending.get(key);
    starts=starts.filter(time=>time>now()-MINUTE&&time<=now());
    if(now()<blockedUntil||now()<(failures.get(key)?.retryAt||0)||pending.size>=4||starts.length>=20)return result(previous,'offline');
    starts.push(now());
    const task=Promise.resolve().then(async()=>{try{
      const raw=await fetcher(weatherUrl(location)),weather=validateWeather(raw,location),entry={location,raw,weather,fetchedAt:now()};
      entries.delete(key);entries.set(key,entry);while(entries.size>8)entries.delete(entries.keys().next().value);failures.delete(key);persist();return result(entry,'online');
    }catch(error){const count=(failures.get(key)?.count||0)+1;const delay=Math.max(Math.min(30*1000*2**Math.min(count-1,5),15*MINUTE),error.retryAfterMs||0);
      failures.set(key,{count,retryAt:now()+delay});while(failures.size>16)failures.delete(failures.keys().next().value);if(error.retryAfterMs)blockedUntil=now()+delay;return result(previous,'offline');
    }finally{pending.delete(key);}});pending.set(key,task);return task;
  }
  return {get,flush:()=>writes};
}
module.exports={weatherLocation,weatherUrl,validateWeather,createWeatherService};
