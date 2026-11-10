import {localDayBounds,solarAltitude,solarPosition,sunEvents} from './world-math.mjs';

// Cache a city-local day, including neighbouring events for the night arc.
// Calendar boundaries, rather than 24-hour jumps, preserve DST transitions.
export function solarDay(epoch,city){
  const sun=sunEvents(epoch,city),[start,end]=localDayBounds(epoch,city.timeZone);
  const days=sun.polar?[sun]:[sunEvents(start-1000,city),sun,sunEvents(end+1000,city)];
  const events=days.flatMap(day=>['rise','set'].filter(kind=>Number.isFinite(day[kind])).map(kind=>({kind,time:day[kind]}))).sort((a,b)=>a.time-b.time);
  return {...sun,events};
}

// A schematic day/night track, not a map of the Sun's apparent azimuth.
export function solarArc(epoch,day){
  const previous=day.events.findLast(event=>event.time<=epoch),next=day.events.find(event=>event.time>epoch)||null;
  const phase=previous?.kind==='rise'?'day':previous?.kind==='set'?'night':day.polar==='Polar day'?'day':day.polar==='Polar night'?'night':null;
  const progress=previous&&next&&previous.kind!==next.kind?(epoch-previous.time)/(next.time-previous.time):null;
  const marker=progress===null?null:{x:phase==='day'?12+216*progress:228-216*progress,y:36+(phase==='day'?-104:64)*progress*(1-progress)};
  return {phase,progress,marker,next,minutesToEvent:next?Math.ceil((next.time-epoch)/60000):null};
}

export function ambientSky(epoch,city,cloud){
  const altitude=solarAltitude(city,solarPosition(epoch));
  return {altitude,lightY:Math.max(8,Math.min(48,48-altitude*.6)),
    cloudOpacity:Number.isFinite(cloud)&&cloud>=0&&cloud<=100?cloud/100*.5:0};
}
