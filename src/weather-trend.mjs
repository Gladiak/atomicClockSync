import {t,decimal,dateTimeFormat} from './i18n.mjs';
import {temperatureSeries,trendGeometry} from './weather-trend-data.mjs';

export function createWeatherTrend(root,id,{interactive=true}={}){
  root.classList.add('temperature-trend');
  root.innerHTML=`<div class="trend-caption"><span class="trend-range"></span><output class="trend-reading" role="status"></output></div>
    <svg class="trend-chart" viewBox="0 0 320 56" preserveAspectRatio="none" role="img" tabindex="-1" aria-labelledby="${id}-title ${id}-description">
      <title id="${id}-title"></title><desc id="${id}-description"></desc>
      <defs><linearGradient id="${id}-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".18"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>
      <path class="trend-area" fill="url(#${id}-fill)"/><path class="trend-line"/><g class="trend-cursor" visibility="hidden"><line y1="3" y2="54"/><circle r="3"/></g>
    </svg><div class="trend-axis" aria-hidden="true"><span></span><span></span><span></span></div><p class="trend-empty"></p>`;
  const $=selector=>root.querySelector(selector),svg=$('svg'),output=$('output');
  output.hidden=!interactive;
  let geometry=null,city=null,selected=-1;
  const temperature=value=>decimal(value,0)+'°';
  const time=(epoch,zone=false)=>dateTimeFormat({timeZone:city.timeZone,hour:'2-digit',minute:'2-digit',hourCycle:'h23',...(zone?{timeZoneName:'short'}:{})}).format(epoch);
  function reading(index){
    selected=index;const point=geometry?.points[index],cursor=$('.trend-cursor');
    cursor.setAttribute('visibility',point?'visible':'hidden');
    output.textContent=point?time(point.time,true)+' · '+temperature(point.temperature):'';
    if(point){cursor.querySelector('line').setAttribute('x1',point.x);cursor.querySelector('line').setAttribute('x2',point.x);cursor.querySelector('circle').setAttribute('cx',point.x);cursor.querySelector('circle').setAttribute('cy',point.y);}
  }
  function pointAt(event){
    if(!geometry)return;const bounds=svg.getBoundingClientRect();if(!bounds.width)return;
    const x=(event.clientX-bounds.left)/bounds.width*320;
    reading(geometry.points.reduce((best,point,index)=>Math.abs(point.x-x)<Math.abs(geometry.points[best].x-x)?index:best,0));
  }
  if(interactive){
  svg.addEventListener('pointermove',pointAt);svg.addEventListener('pointerdown',pointAt);
  svg.addEventListener('pointerleave',()=>{if(document.activeElement!==svg||document.documentElement.dataset.focusMode==='pointer')reading(-1);});
  svg.addEventListener('focus',()=>{if(geometry&&document.documentElement.dataset.focusMode!=='pointer')reading(0);});
  svg.addEventListener('blur',()=>reading(-1));
  svg.addEventListener('keydown',event=>{
    if(!geometry||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();event.stopPropagation();
    reading(event.key==='Home'?0:event.key==='End'?geometry.points.length-1:Math.max(0,Math.min(geometry.points.length-1,(selected<0?0:selected)+(event.key==='ArrowRight'?1:-1))));
  });
  }
  return {render(packet,epoch,location){
    const sameCity=city&&city.latitude===location.latitude&&city.longitude===location.longitude&&city.timeZone===location.timeZone;
    const selectedTime=sameCity?geometry?.points[selected]?.time:null;city=location;
    geometry=trendGeometry(temperatureSeries(packet,epoch));root.dataset.state=geometry?'available':'unavailable';
    svg.toggleAttribute('hidden',!geometry);if(interactive)svg.setAttribute('tabindex',geometry?'0':'-1');else svg.removeAttribute('tabindex');
    $('.trend-axis').hidden=!geometry;$('.trend-caption').hidden=!geometry;$('.trend-empty').hidden=Boolean(geometry);$('.trend-empty').textContent=t('Weather unavailable');
    if(!geometry){reading(-1);return;}
    const range=t('Low {0} · High {1}',temperature(geometry.low),temperature(geometry.high));$('.trend-range').textContent=range;
    $('title').textContent=t('Temperature trend');$('desc').textContent=t('Next 24 hours')+' · '+city.name+' · '+range+' · °C.'+(interactive?' '+t('Use arrow keys to inspect the forecast.'):'');
    $('.trend-line').setAttribute('d',geometry.line);$('.trend-area').setAttribute('d',geometry.area);
    const axis=[geometry.start,geometry.start+12*3600000,geometry.end];[...$('.trend-axis').children].forEach((node,i)=>{node.textContent=i===2?dateTimeFormat({timeZone:city.timeZone,weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(axis[i]):time(axis[i]);});
    reading(selectedTime==null?-1:geometry.points.findIndex(point=>point.time===selectedTime));
  }};
}
