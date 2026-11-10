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
export function visibleForecast(packet,epoch,date,days=5){
  return {hourly:(packet?.hourly||[]).filter(row=>row.time>=epoch-60000).filter((_row,index)=>index%3===0).slice(0,6),
    daily:(packet?.daily||[]).filter(row=>row.date>=date).slice(0,days)};
}

export function weatherSnapshot(packet,epoch,date,days=5){
  const age=packet?epoch-packet.current.time:Infinity;
  const valid=packet&&age>=-1800000;
  return {age,current:valid&&age<90*60000?packet.current:null,
    forecast:valid&&age<6*3600000?visibleForecast(packet,epoch,date,days):{hourly:[],daily:[]}};
}

// A model-to-model change at the current reading's valid time, not a sensor
// history. Interpolate only between adjacent, known hourly pressures.
export function pressureChange(packet){
  const current=packet?.current;if(!Number.isFinite(current?.pressure)||!Number.isFinite(current.time))return null;
  const target=current.time-3*3600000,rows=packet.hourly||[];
  const before=rows.findLast(row=>row.time<=target),after=rows.find(row=>row.time>=target);
  if(!before||!after||!Number.isFinite(before.pressure)||!Number.isFinite(after.pressure)||after.time-before.time>1.5*3600000)return null;
  const past=before.time===after.time?before.pressure:before.pressure+(after.pressure-before.pressure)*(target-before.time)/(after.time-before.time);
  return current.pressure-past;
}

export function windDirection(degrees){
  return Number.isFinite(degrees)&&degrees>=0&&degrees<=360?['N','NE','E','SE','S','SW','W','NW'][Math.round(degrees/45)%8]:null;
}
