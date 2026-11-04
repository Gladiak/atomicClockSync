// WMO groupings shared by dashboard and Observatory; local Weatherfonts glyphs.
export function weatherCondition(code){
  if(code===0)return ['Clear skies','clear'];if(code===1)return ['Mostly clear','partly'];if(code===2)return ['Partly cloudy','partly'];if(code===3)return ['Overcast','cloud'];
  if([45,48].includes(code))return ['Fog','fog'];if([51,53,55].includes(code))return ['Drizzle','rain'];if([56,57,66,67].includes(code))return ['Freezing rain','snow'];
  if([61,63,65].includes(code))return ['Rain','rain'];if([71,73,75,77].includes(code))return ['Snow','snow'];
  if([80,81,82].includes(code))return ['Rain showers','rain'];if([85,86].includes(code))return ['Snow showers','snow'];
  if([96,99].includes(code))return ['Thunderstorm with hail','storm'];if([95,97].includes(code))return ['Thunderstorm','storm'];return ['Weather unavailable','unknown'];
}
export function weatherIcon(code,isDay=true){
  const kind=weatherCondition(code)[1];
  const name=kind==='clear'?(isDay?'day-sunny':'night-clear'):kind==='partly'?(isDay?'day-cloudy':'night-alt-cloudy'):kind==='cloud'?'cloud':kind==='fog'?'fog':kind==='snow'?([56,57,66,67].includes(code)?'sleet':'snow'):kind==='storm'?'thunderstorm':kind==='rain'?([80,81,82].includes(code)?'showers':'rain'):'na';
  return '<i class="wi wi-'+name+'" data-weather-icon="'+name+'" aria-hidden="true"></i>';
}
export function visibleForecast(packet,epoch,date){
  return {hourly:(packet?.hourly||[]).filter(row=>row.time>=epoch-60000).filter((_row,index)=>index%3===0).slice(0,6),
    daily:(packet?.daily||[]).filter(row=>row.date>=date).slice(0,5)};
}

export function weatherSnapshot(packet,epoch,date){
  const age=packet?epoch-packet.current.time:Infinity;
  const valid=packet&&age>=-1800000;
  return {age,current:valid&&age<90*60000?packet.current:null,
    forecast:valid&&age<6*3600000?visibleForecast(packet,epoch,date):{hourly:[],daily:[]}};
}
