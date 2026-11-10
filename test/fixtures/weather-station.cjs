// Illustrative station readings and two extra forecast days for desktop QA.
// Keep the original five-day response intact for dashboard/cache compatibility.
const raw=structuredClone(require('./weather-rome.json'));
Object.assign(raw.current_units,{dew_point_2m:'°C',wind_direction_10m:'°',wind_gusts_10m:'km/h',pressure_msl:'hPa',cloud_cover:'%',visibility:'m'});
Object.assign(raw.current,{dew_point_2m:8.3,wind_direction_10m:225,wind_gusts_10m:23.8,pressure_msl:1014.5,cloud_cover:81,visibility:14500});
for(let i=120;i<168;i++)for(const [key,values]of Object.entries(raw.hourly))values.push(key==='time'?values[0]+i*3600:values[i%24]);
raw.hourly_units.pressure_msl='hPa';raw.hourly.pressure_msl=raw.hourly.time.map((_,i)=>1018-i*.2);
for(let i=5;i<7;i++)for(const [key,values]of Object.entries(raw.daily))values.push(key==='time'?values[0]+i*86400:values[i%5]);
raw.daily_units.precipitation_sum='mm';raw.daily.precipitation_sum=[0,0,8.4,2.1,0,0,.3];
module.exports=raw;
