import {weatherIcons} from '../assets/weather/fontawesome.mjs';
// WMO groupings. Font Awesome Free geometry is bundled locally; see its license.
export function weatherCondition(code){
  if(code===0)return ['Clear skies','clear'];if(code===1)return ['Mostly clear','partly'];if(code===2)return ['Partly cloudy','partly'];if(code===3)return ['Overcast','cloud'];
  if([45,48].includes(code))return ['Fog','fog'];if([51,53,55].includes(code))return ['Drizzle','rain'];if([56,57,66,67].includes(code))return ['Freezing rain','snow'];
  if([61,63,65].includes(code))return ['Rain','rain'];if([71,73,75,77].includes(code))return ['Snow','snow'];
  if([80,81,82].includes(code))return ['Rain showers','rain'];if([85,86].includes(code))return ['Snow showers','snow'];
  if([96,99].includes(code))return ['Thunderstorm with hail','storm'];if([95,97].includes(code))return ['Thunderstorm','storm'];return ['Weather unavailable','unknown'];
}
export function weatherIcon(code,isDay=true){
  const kind=weatherCondition(code)[1];
  const name=kind==='clear'?(isDay?'sun':'moon'):kind==='partly'?(isDay?'cloud-sun':'cloud-moon'):kind==='cloud'?'cloud':kind==='fog'?'smog':kind==='snow'?'snowflake':kind==='storm'?'cloud-bolt':kind==='rain'?([80,81,82].includes(code)?'cloud-showers-heavy':'cloud-rain'):'circle-question';
  const color=kind==='clear'?(isDay?'weather-sun':'weather-moon'):kind==='partly'?(isDay?'weather-sun':'weather-moon'):kind==='rain'?'weather-precip':kind==='snow'?'weather-snow':kind==='storm'?'weather-lightning':kind==='fog'?'weather-fog':'weather-cloud';
  const icon=weatherIcons[name];
  return '<svg viewBox="'+icon.viewBox+'" fill="currentColor" class="'+color+'" data-weather-icon="'+name+'" aria-hidden="true">'+icon.paths.map(d=>'<path d="'+d+'"/>').join('')+'</svg>';
}
export function visibleForecast(packet,epoch,date){
  return {hourly:(packet?.hourly||[]).filter(row=>row.time>=epoch-60000).filter((_row,index)=>index%3===0).slice(0,6),
    daily:(packet?.daily||[]).filter(row=>row.date>=date).slice(0,5)};
}
