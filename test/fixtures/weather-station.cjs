// Illustrative station readings and two extra forecast days for desktop QA.
// Keep the original five-day response intact for dashboard/cache compatibility.
const raw=structuredClone(require('./weather-rome.json'));
Object.assign(raw.current_units,{dew_point_2m:'°C',wind_direction_10m:'°',wind_gusts_10m:'km/h',pressure_msl:'hPa',cloud_cover:'%',visibility:'m'});
Object.assign(raw.current,{dew_point_2m:8.3,wind_direction_10m:225,wind_gusts_10m:23.8,pressure_msl:1014.5,cloud_cover:81,visibility:14500});
for(let i=120;i<168;i++)for(const [key,values]of Object.entries(raw.hourly))values.push(key==='time'?values[0]+i*3600:values[i%24]);
raw.hourly_units.pressure_msl='hPa';raw.hourly.pressure_msl=raw.hourly.time.map((_,i)=>1018-i*.2);
Object.assign(raw.hourly_units,{relative_humidity_2m:'%',wind_speed_10m:'km/h',wind_gusts_10m:'km/h',cloud_cover:'%'});
raw.hourly.relative_humidity_2m=raw.hourly.time.map((_,i)=>Math.round(60+18*Math.cos(i*Math.PI/12)));
raw.hourly.wind_speed_10m=raw.hourly.time.map((_,i)=>Math.round(10+7*Math.sin(i*Math.PI/12)));
raw.hourly.wind_gusts_10m=raw.hourly.wind_speed_10m.map((value,i)=>value+8+Math.round(5*Math.cos(i*Math.PI/8)));
raw.hourly.cloud_cover=raw.hourly.time.map((_,i)=>Math.round(50+40*Math.sin(i*Math.PI/16)));
raw.hourly.precipitation_probability=raw.hourly.time.map((_,i)=>Math.round(Math.max(0,Math.sin((i-15)*Math.PI/10))*(i<24?8:i<48?15:70)));
for(let i=5;i<7;i++)for(const [key,values]of Object.entries(raw.daily))values.push(key==='time'?values[0]+i*86400:values[i%5]);
raw.daily_units.precipitation_sum='mm';raw.daily.precipitation_sum=[0,0,8.4,2.1,0,0,.3];
module.exports=raw;
