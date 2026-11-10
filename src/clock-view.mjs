import {solarAtmosphere} from './solar-atmosphere.mjs';
import {ambientSky,solarDay,solarArc} from './clock-sky.mjs';
import {moonState} from './moon-math.mjs';
import {createMoonSurface} from './moon-surface.mjs';
import {createWeatherTrend} from './weather-trend.mjs';
import {t,decimal,dateTimeFormat,numberFormat,onLanguageChange} from './i18n.mjs';
import {localDateKey,solarAltitude,solarPosition} from './world-math.mjs';
import {weatherCondition,weatherIcon,weatherSnapshot,pressureChange,windDirection} from './clock-weather.mjs';

export function createClockView({desktop,getNow,getObserver,getReference}){
  const $=id=>document.getElementById('dial-'+id),root=document.getElementById('clock-stage');
  const trend=createWeatherTrend($('trend'),'dial-weather-curve',{interactive:false});
  const moon=createMoonSurface($('moon-disc'),{minimumSize:128});
  const digits=[...$('digits').querySelectorAll('.dial-digit')];
  let visible=false,timer,poll,busy=false,generation=0,locationKey='',packet=null,fetchedAt=null,connectivity='unknown',requested=false,solarKey='',celestialKey='',day=null,weatherKey='',previous='';
  const temperature=value=>Number.isFinite(value)?numberFormat({maximumFractionDigits:0}).format(value)+'°':'—';
  const time=(epoch,city,extra={})=>dateTimeFormat({timeZone:city.timeZone,hour:'2-digit',minute:'2-digit',hourCycle:'h23',...extra}).format(epoch);
  function measurement(id,value,unit,digits=0){
    const node=$(id);node.textContent=Number.isFinite(value)?decimal(value,digits):'—';
    if(Number.isFinite(value)&&unit){const suffix=document.createElement('small');suffix.textContent=' '+unit;node.append(suffix);}
  }
  function paintDigits(value){
    value.split('').forEach((character,index)=>{if(previous[index]!==character)digits[index].querySelector('.dial-value').textContent=character;});previous=value;
  }
  function selectLocation(city){
    const key=JSON.stringify([city.latitude,city.longitude,city.timeZone]);if(key===locationKey)return;
    locationKey=key;generation++;packet=null;fetchedAt=null;requested=false;connectivity='unknown';weatherKey='';solarKey='';celestialKey='';day=null;busy=false;
  }
  async function refresh(){
    if(!visible||document.hidden||busy)return;
    const city=getObserver();selectLocation(city);busy=true;const token=generation;
    try{const response=await desktop.getWeather({latitude:city.latitude,longitude:city.longitude,timeZone:city.timeZone});
      if(token!==generation||!visible)return;
      packet=response?.weather||null;fetchedAt=response?.fetchedAt||null;connectivity=response?.connectivity||'offline';
    }catch{if(token===generation)connectivity='offline';}
    finally{if(token===generation){busy=false;requested=true;weatherKey='';if(visible)render(true);}}
  }
  function forecastRow(row,city,daily,today,range){
    const item=document.createElement('div');item.className=daily?'dial-forecast-day':'dial-forecast-hour';
    const label=document.createElement('span');label.className='dial-forecast-label';
    label.textContent=daily?(row.date===today?t('Today'):dateTimeFormat({timeZone:'UTC',weekday:'short'}).format(Date.parse(row.date+'T12:00:00Z'))):time(row.time,city);
    label.title=daily?row.date:dateTimeFormat({timeZone:city.timeZone,weekday:'short',hour:'2-digit',minute:'2-digit',timeZoneName:'short'}).format(row.time);
    const icon=document.createElement('span');icon.className='dial-weather-icon';icon.innerHTML=weatherIcon(row.code,daily?true:row.isDay??solarAltitude(city,solarPosition(row.time))>=0);icon.title=t(weatherCondition(row.code)[0]);icon.setAttribute('role','img');icon.setAttribute('aria-label',icon.title);
    const value=document.createElement('strong');value.textContent=temperature(daily?row.high:row.temperature);
    item.append(label,icon);
    const detail=document.createElement('span');detail.className='dial-forecast-detail';detail.textContent=daily?temperature(row.low):Number.isFinite(row.rain)?decimal(row.rain,0)+'%':'—';
    detail.title=t(daily?'Low temperature':'Rain chance');
    if(daily){
      const temperatures=document.createElement('div');temperatures.className='dial-day-temperatures';temperatures.append(value,detail);
      const bar=document.createElement('div');bar.className='dial-day-range';bar.setAttribute('aria-hidden','true');
      if(Number.isFinite(row.low)&&Number.isFinite(row.high)&&range){const fill=document.createElement('span'),span=Math.max(1,range.high-range.low);
        fill.style.left=(row.low-range.low)/span*100+'%';fill.style.width=Math.max(3,(row.high-row.low)/span*100)+'%';bar.append(fill);}
      const rain=document.createElement('span');rain.className='dial-day-rain';rain.textContent=Number.isFinite(row.rain)?decimal(row.rain,0)+'%':'—';
      rain.setAttribute('aria-label',t('Rain chance {0}',rain.textContent));item.append(temperatures,bar,rain);
    }else item.append(value,detail);
    return item;
  }
  function paintWeather(epoch,city,force){
    const key=locationKey+':'+Math.floor(epoch/60000);if(!force&&key===weatherKey)return;weatherKey=key;
    const {age,current,forecast}=weatherSnapshot(packet,epoch,localDateKey(epoch,city.timeZone),7);
    trend.render(packet,epoch,city);
    root.dataset.atmosphere=solarAtmosphere(epoch,city);
    const sky=ambientSky(epoch,city,current?.cloud);
    root.style.setProperty('--dial-light-y',sky.lightY+'%');
    root.style.setProperty('--dial-cloud-opacity',sky.cloudOpacity);
    root.dataset.clouds=sky.cloudOpacity>0?'known':'none';
    $('temperature').textContent=temperature(current?.temperature);
    $('condition').textContent=t(current?weatherCondition(current.code)[0]:!requested?'Fetching forecast…':'Weather unavailable');
    $('weather-icon').innerHTML=weatherIcon(current?.code,current?.isDay??solarAltitude(city,solarPosition(epoch))>=0);
    $('weather-icon').setAttribute('aria-label',$('condition').textContent);
    $('feels').textContent=current&&Number.isFinite(current.feelsLike)?temperature(current.feelsLike):'—';
    measurement('humidity',current?.humidity,'%');measurement('wind',current?.wind,'km/h');
    measurement('pressure',current?.pressure,'hPa');measurement('cloud',current?.cloud,'%');
    $('dew').textContent=temperature(current?.dewPoint);
    $('gusts').textContent=Number.isFinite(current?.gusts)?decimal(current.gusts,0)+' km/h':'—';
    $('wind-direction').textContent=t(windDirection(current?.windDirection)||'—');
    $('visibility').textContent=Number.isFinite(current?.visibility)?decimal(current.visibility/1000,current.visibility<10000?1:0)+' km':'—';
    const change=current?pressureChange(packet):null,arrow=change===null?'':change>=1?'↗ ':change<=-1?'↘ ':'→ ';
    $('pressure-change').textContent=change===null?'—':arrow+(change>0?'+':'')+decimal(change,1)+' hPa';
    const today=localDateKey(epoch,city.timeZone),day=forecast.daily.find(row=>row.date===today);
    measurement('rain',day?.rain,'%');
    $('rain').setAttribute('aria-label',t('Daily maximum precipitation probability'));
    $('precipitation').textContent=Number.isFinite(day?.precipitation)?decimal(day.precipitation,1)+' mm':'—';
    $('extremes').textContent=day?t('Low {0} · High {1}',temperature(day.low),temperature(day.high)):'—';
    $('hourly').replaceChildren(...forecast.hourly.map(row=>forecastRow(row,city,false,today)));
    const temperatures=forecast.daily.flatMap(row=>[row.low,row.high]).filter(Number.isFinite),range=temperatures.length?{low:Math.min(...temperatures),high:Math.max(...temperatures)}:null;
    $('daily').replaceChildren(...forecast.daily.map(row=>forecastRow(row,city,true,today,range)));
    $('hourly-empty').hidden=forecast.hourly.length>0;$('daily-empty').hidden=forecast.daily.length>0;
    $('weather-status').textContent=!requested?t('Fetching forecast…'):!packet?t('Weather unavailable'):age>=6*3600000||age< -1800000?t('Forecast is out of date'):
      (connectivity==='offline'?t('Offline · cached forecast')+' · ':'')+(Number.isFinite(fetchedAt)?t('Model valid · {0} · downloaded {1}',time(packet.current.time,city),time(fetchedAt,city)):t('Model valid · {0}',time(packet.current.time,city)));
    root.dataset.weather=current?'available':packet?'stale':requested?'unavailable':'loading';
  }
  function paintCelestial(epoch,city,force){
    const dayKey=locationKey+':'+localDateKey(epoch,city.timeZone);
    if(solarKey!==dayKey){solarKey=dayKey;day=solarDay(epoch,city);}
    const key=locationKey+':'+Math.floor(epoch/60000);if(!force&&key===celestialKey)return;celestialKey=key;
    $('sunrise').textContent=day.rise===null?t('No sunrise'):time(day.rise,city);
    $('sunset').textContent=day.set===null?t('No sunset'):time(day.set,city);
    const duration=minutes=>t('{0} h {1} min',Math.floor(minutes/60),minutes%60);
    $('daylight').textContent=day.polar?t(day.polar):t('Daylight {0}',duration(Math.round(day.daylightMs/60000)));
    const arc=solarArc(epoch,day),marker=$('solar-marker');
    marker.setAttribute('visibility',arc.marker?'visible':'hidden');
    if(arc.marker){marker.setAttribute('cx',arc.marker.x.toFixed(2));marker.setAttribute('cy',arc.marker.y.toFixed(2));}
    $('solar-arc').dataset.phase=arc.phase||'unknown';
    $('solar-progress').style.strokeDasharray=(arc.phase==='day'&&arc.progress!==null?arc.progress:0)+' 1';
    const countdown=arc.next?t(arc.next.kind==='rise'?'Sunrise in {0}':'Sunset in {0}',duration(arc.minutesToEvent)):t(day.polar||'Unavailable');
    $('solar-countdown').textContent=countdown;
    $('solar-arc').setAttribute('aria-label',t('Day and night progress')+' · '+countdown);
    root.style.setProperty('--dial-light-x',(arc.phase==='day'&&arc.progress!==null?12+76*arc.progress:50)+'%');
    root.dataset.sky=solarAltitude(city,solarPosition(epoch))>=0?'day':'night';
    const state=moonState(epoch,city),phase=t(state.name),illumination=numberFormat({style:'percent',maximumFractionDigits:0}).format(state.fraction);
    $('moon-phase').textContent=phase;$('moon-illumination').textContent=t('Illumination')+' '+illumination;
    $('moon-disc').setAttribute('aria-label',t('Moon phase')+' · '+phase+' · '+illumination);
    $('moon-disc').dataset.phase=state.phase.toFixed(4);moon.draw(state.phase);
  }
  function render(force=false){
    if(!visible||document.hidden)return;
    const epoch=getNow(),city=getObserver(),oldLocation=locationKey;selectLocation(city);if(oldLocation!==locationKey)refresh();
    const parts=dateTimeFormat({timeZone:city.timeZone,hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(epoch);
    const part=kind=>parts.find(row=>row.type===kind)?.value||'00';paintDigits(part('hour')+part('minute')+part('second'));
    $('digits').setAttribute('aria-label',time(epoch,city,{second:'2-digit'}));
    $('weekday').textContent=dateTimeFormat({timeZone:city.timeZone,weekday:'long'}).format(epoch);
    $('date').textContent=dateTimeFormat({timeZone:city.timeZone,day:'numeric',month:'long',year:'numeric'}).format(epoch);
    $('city').textContent=city.name;$('country').textContent=t(city.country);$('zone').textContent=city.timeZone;
    const coordinate=(value,plus,minus)=>decimal(Math.abs(value),2)+'° '+(value>=0?plus:minus);
    $('coordinates').textContent=coordinate(city.latitude,'N','S')+' · '+coordinate(city.longitude,'E','W');
    const reference=getReference();$('reference').textContent=reference.text;$('reference').dataset.state=reference.state;
    paintCelestial(epoch,city,force);
    paintWeather(epoch,city,force);
  }
  $('weather-source').onclick=()=>desktop.openReference('weather');
  onLanguageChange(()=>{if(visible){weatherKey='';render(true);}});
  document.addEventListener('visibilitychange',()=>{root.dataset.active=String(visible&&!document.hidden);moon.setVisible(visible&&!document.hidden);if(!document.hidden&&visible){render(true);refresh();}});
  window.addEventListener('beforeunload',()=>{clearInterval(timer);clearInterval(poll);root.dataset.active='false';moon.setVisible(false);});
  return {getEpoch:getNow,setVisible(value){
    if(value===visible)return;visible=value;root.dataset.active=String(value&&!document.hidden);moon.setVisible(value&&!document.hidden);generation++;busy=false;clearInterval(timer);clearInterval(poll);previous='';
    if(value){render(true);refresh();timer=setInterval(render,1000);poll=setInterval(refresh,60000);}
  }};
}
