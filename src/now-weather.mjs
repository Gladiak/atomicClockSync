import {t,decimal,dateTimeFormat,onLanguageChange} from './i18n.mjs';
import {localDateKey,solarAltitude,solarPosition} from './world-math.mjs';
import {weatherCondition,weatherIcon,weatherSnapshot} from './clock-weather.mjs';

// The dashboard and full-screen clock use the same native, per-city cache.
export function createNowWeather({desktop,getNow,getObserver,openClock}){
  const $=id=>document.getElementById('now-weather-'+id);
  let visible=false,poll,generation=0,busy=false,locationKey='',paintKey='',packet=null,connectivity='unknown',requested=false;
  const temperature=value=>Number.isFinite(value)?decimal(value,0)+'°':'—';
  const time=(epoch,city)=>dateTimeFormat({timeZone:city.timeZone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(epoch);
  function selectCity(city){
    const key=JSON.stringify([city.latitude,city.longitude,city.timeZone]);if(key===locationKey)return false;
    locationKey=key;generation++;busy=false;packet=null;requested=false;paintKey='';return true;
  }
  async function refresh(){
    if(!visible||document.hidden||busy)return;
    const city=getObserver();selectCity(city);busy=true;const token=generation;
    try{
      const response=await desktop.getWeather({latitude:city.latitude,longitude:city.longitude,timeZone:city.timeZone});
      if(token!==generation||!visible)return;
      packet=response?.weather||null;connectivity=response?.connectivity||'offline';
    }catch{if(token===generation)connectivity='offline';}
    finally{if(token===generation){busy=false;requested=true;render(true);}}
  }
  function render(force=false){
    if(!visible||document.hidden)return;
    const epoch=getNow(),city=getObserver();if(selectCity(city))refresh();
    const key=locationKey+':'+Math.floor(epoch/60000);if(!force&&paintKey===key)return;paintKey=key;
    const today=localDateKey(epoch,city.timeZone),{age,current,forecast}=weatherSnapshot(packet,epoch,today);
    const condition=t(current?weatherCondition(current.code)[0]:requested?'Weather unavailable':'Fetching forecast…');
    $('city').textContent=city.name+' · '+t(city.country);$('city').title=city.name+' · '+city.timeZone;
    $('temperature').textContent=temperature(current?.temperature);$('condition').textContent=condition;
    $('icon').innerHTML=weatherIcon(current?.code,current?.isDay??solarAltitude(city,solarPosition(epoch))>=0);$('icon').setAttribute('aria-label',condition);
    $('temperature').title=t('Feels like {0}',temperature(current?.feelsLike));
    $('humidity').textContent=Number.isFinite(current?.humidity)?decimal(current.humidity,0)+'%':'—';
    $('wind').textContent=Number.isFinite(current?.wind)?decimal(current.wind,0)+' km/h':'—';
    const day=forecast.daily.find(row=>row.date===today);$('rain').textContent=Number.isFinite(day?.rain)?decimal(day.rain,0)+'%':'—';
    $('daily').replaceChildren(...forecast.daily.map(row=>{
      const item=document.createElement('div'),label=document.createElement('span'),icon=document.createElement('span'),high=document.createElement('strong'),low=document.createElement('span');
      item.className='now-weather-day';label.textContent=row.date===today?t('Today'):dateTimeFormat({timeZone:'UTC',weekday:'short'}).format(Date.parse(row.date+'T12:00:00Z'));
      icon.className='now-weather-day-icon';icon.innerHTML=weatherIcon(row.code);icon.setAttribute('role','img');icon.setAttribute('aria-label',t(weatherCondition(row.code)[0]));
      high.textContent=temperature(row.high);high.title=t('High / low');low.textContent=temperature(row.low);low.title=t('Low temperature');item.append(label,icon,high,low);return item;
    }));
    $('daily').hidden=!forecast.daily.length;
    const status=!requested?t('Fetching forecast…'):!packet?t('Weather unavailable'):age< -1800000||age>=6*3600000?t('Forecast is out of date'):
      (connectivity==='offline'?t('Offline · cached forecast')+' · ':'')+t('Forecast updated · {0}',time(packet.current.time,city));
    $('status').textContent=status;$('status').title=status;
    $('card').dataset.weather=current?'available':packet?'stale':requested?'unavailable':'loading';
  }
  $('open').onclick=openClock;$('source').onclick=()=>desktop.openReference('weather');
  onLanguageChange(()=>render(true));
  document.addEventListener('visibilitychange',()=>{if(visible&&!document.hidden){render(true);refresh();}});
  window.addEventListener('beforeunload',()=>clearInterval(poll));
  return {render,setVisible(value){
    if(value===visible)return;visible=value;generation++;busy=false;clearInterval(poll);
    if(value){render(true);refresh();poll=setInterval(refresh,60000);}
  }};
}
