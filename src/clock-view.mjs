import {solarAtmosphere} from './solar-atmosphere.mjs';
import {createWeatherTrend} from './weather-trend.mjs';
import {t,decimal,dateTimeFormat,numberFormat,onLanguageChange} from './i18n.mjs';
import {sunEvents,localDateKey,solarAltitude,solarPosition} from './world-math.mjs';
import {weatherCondition,weatherIcon,weatherSnapshot} from './clock-weather.mjs';

export function createClockView({desktop,getNow,getObserver,getReference}){
  const $=id=>document.getElementById('dial-'+id),root=document.getElementById('clock-stage');
  const trend=createWeatherTrend($('trend'),'dial-weather-curve');
  const digits=[...$('digits').querySelectorAll('.dial-digit')];
  let visible=false,timer,poll,busy=false,generation=0,locationKey='',packet=null,connectivity='unknown',requested=false,solarKey='',weatherKey='',previous='';
  const temperature=value=>Number.isFinite(value)?numberFormat({maximumFractionDigits:0}).format(value)+'°':'—';
  const time=(epoch,city,extra={})=>dateTimeFormat({timeZone:city.timeZone,hour:'2-digit',minute:'2-digit',hourCycle:'h23',...extra}).format(epoch);
  function paintDigits(value){
    value.split('').forEach((character,index)=>{if(previous[index]!==character)digits[index].querySelector('.dial-value').textContent=character;});previous=value;
  }
  function selectLocation(city){
    const key=JSON.stringify([city.latitude,city.longitude,city.timeZone]);if(key===locationKey)return;
    locationKey=key;generation++;packet=null;requested=false;connectivity='unknown';weatherKey='';solarKey='';busy=false;
  }
  async function refresh(){
    if(!visible||document.hidden||busy)return;
    const city=getObserver();selectLocation(city);busy=true;const token=generation;
    try{const response=await desktop.getWeather({latitude:city.latitude,longitude:city.longitude,timeZone:city.timeZone});
      if(token!==generation||!visible)return;
      packet=response?.weather||null;connectivity=response?.connectivity||'offline';
    }catch{if(token===generation)connectivity='offline';}
    finally{if(token===generation){busy=false;requested=true;weatherKey='';if(visible)render(true);}}
  }
  function forecastRow(row,city,daily,today){
    const item=document.createElement('div');item.className=daily?'dial-forecast-day':'dial-forecast-hour';
    const label=document.createElement('span');label.className='dial-forecast-label';
    label.textContent=daily?(row.date===today?t('Today'):dateTimeFormat({timeZone:'UTC',weekday:'short'}).format(Date.parse(row.date+'T12:00:00Z'))):time(row.time,city);
    label.title=daily?row.date:dateTimeFormat({timeZone:city.timeZone,weekday:'short',hour:'2-digit',minute:'2-digit',timeZoneName:'short'}).format(row.time);
    const icon=document.createElement('span');icon.className='dial-weather-icon';icon.innerHTML=weatherIcon(row.code,daily?true:row.isDay??solarAltitude(city,solarPosition(row.time))>=0);icon.title=t(weatherCondition(row.code)[0]);icon.setAttribute('role','img');icon.setAttribute('aria-label',icon.title);
    const value=document.createElement('strong');value.textContent=temperature(daily?row.high:row.temperature);
    item.append(label,icon,value);
    const detail=document.createElement('span');detail.className='dial-forecast-detail';detail.textContent=daily?temperature(row.low):Number.isFinite(row.rain)?decimal(row.rain,0)+'%':'—';
    detail.title=t(daily?'Low temperature':'Rain chance');item.append(detail);return item;
  }
  function paintWeather(epoch,city,force){
    const key=locationKey+':'+Math.floor(epoch/60000);if(!force&&key===weatherKey)return;weatherKey=key;
    const {age,current,forecast}=weatherSnapshot(packet,epoch,localDateKey(epoch,city.timeZone));
    trend.render(packet,epoch,city);
    root.dataset.atmosphere=solarAtmosphere(epoch,city);
    $('temperature').textContent=temperature(current?.temperature);
    $('condition').textContent=t(current?weatherCondition(current.code)[0]:!requested?'Fetching forecast…':'Weather unavailable');
    $('weather-icon').innerHTML=weatherIcon(current?.code,current?.isDay??solarAltitude(city,solarPosition(epoch))>=0);
    $('feels').textContent=current&&Number.isFinite(current.feelsLike)?temperature(current.feelsLike):'—';
    $('humidity').textContent=Number.isFinite(current?.humidity)?decimal(current.humidity,0)+'%':'—';
    $('wind').textContent=Number.isFinite(current?.wind)?decimal(current.wind,0)+' km/h':'—';
    const today=localDateKey(epoch,city.timeZone),day=forecast.daily.find(row=>row.date===today);
    $('rain').textContent=Number.isFinite(day?.rain)?decimal(day.rain,0)+'%':'—';
    $('hourly').replaceChildren(...forecast.hourly.map(row=>forecastRow(row,city,false,today)));
    $('daily').replaceChildren(...forecast.daily.map(row=>forecastRow(row,city,true,today)));
    $('hourly-empty').hidden=forecast.hourly.length>0;$('daily-empty').hidden=forecast.daily.length>0;
    $('weather-status').textContent=!requested?t('Fetching forecast…'):!packet?t('Weather unavailable'):age>=6*3600000||age< -1800000?t('Forecast is out of date'):
      (connectivity==='offline'?t('Offline · cached forecast')+' · ':'')+t('Forecast updated · {0}',time(packet.current.time,city));
    root.dataset.weather=current?'available':packet?'stale':requested?'unavailable':'loading';
  }
  function render(force=false){
    if(!visible||document.hidden)return;
    const epoch=getNow(),city=getObserver(),oldLocation=locationKey;selectLocation(city);if(oldLocation!==locationKey)refresh();
    const parts=dateTimeFormat({timeZone:city.timeZone,hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(epoch);
    const part=kind=>parts.find(row=>row.type===kind)?.value||'00';paintDigits(part('hour')+part('minute')+part('second'));
    $('digits').setAttribute('aria-label',time(epoch,city,{second:'2-digit'}));$('date').textContent=dateTimeFormat({timeZone:city.timeZone,weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(epoch);
    $('city').textContent=city.name;$('country').textContent=t(city.country);$('zone').textContent=city.timeZone;
    const coordinate=(value,plus,minus)=>decimal(Math.abs(value),2)+'° '+(value>=0?plus:minus);
    $('coordinates').textContent=coordinate(city.latitude,'N','S')+' · '+coordinate(city.longitude,'E','W');
    const reference=getReference();$('reference').textContent=reference.text;$('reference').dataset.state=reference.state;
    const dayKey=locationKey+':'+localDateKey(epoch,city.timeZone);
    if(solarKey!==dayKey||force){
      solarKey=dayKey;const sun=sunEvents(epoch,city);
      $('sunrise').textContent=sun.rise===null?t('No sunrise'):time(sun.rise,city);$('sunset').textContent=sun.set===null?t('No sunset'):time(sun.set,city);
      $('daylight').textContent=sun.polar?t(sun.polar):t('{0} h {1} min',Math.floor(Math.round(sun.daylightMs/60000)/60),Math.round(sun.daylightMs/60000)%60);
      root.dataset.sky=solarAltitude(city,solarPosition(epoch))>=0?'day':'night';
    }
    paintWeather(epoch,city,force);
  }
  $('weather-source').onclick=()=>desktop.openReference('weather');
  onLanguageChange(()=>{if(visible){weatherKey='';render(true);}});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&visible){render(true);refresh();}});
  window.addEventListener('beforeunload',()=>{clearInterval(timer);clearInterval(poll);});
  return {getEpoch:getNow,setVisible(value){
    if(value===visible)return;visible=value;generation++;busy=false;clearInterval(timer);clearInterval(poll);previous='';
    if(value){render(true);refresh();timer=setInterval(render,1000);poll=setInterval(refresh,60000);}
  }};
}
