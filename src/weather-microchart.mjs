import {microchartGeometry,MICRO_METRICS} from './weather-microchart-data.mjs';
import {t,decimal,dateTimeFormat} from './i18n.mjs';
export function createWeatherMicrochart(root,kind){
  const metric=MICRO_METRICS[kind];
  root.dataset.kind=kind;
  root.setAttribute('role','group');
  root.innerHTML='<svg viewBox="0 0 160 32" preserveAspectRatio="none" role="img"><line class="dial-micro-baseline" x1="2" x2="158" y1="29" y2="29"/><path class="dial-micro-area"/><path class="dial-micro-line"/><path class="dial-micro-gusts"/></svg><span class="dial-micro-period"></span><span class="dial-micro-empty" aria-hidden="true">—</span>';
  const svg=root.querySelector('svg'),caption=root.querySelector('.dial-micro-period'),empty=root.querySelector('.dial-micro-empty');
  return {render(packet,epoch,city){
    const data=microchartGeometry(packet,epoch,kind);
    root.dataset.state=data?'available':'unavailable';svg.toggleAttribute('hidden',!data);empty.hidden=Boolean(data);
    caption.textContent=t('Next 24 hours');
    if(!data){root.setAttribute('aria-label',t('{0} forecast · next 24 hours',t(metric.label))+' · '+t('Weather unavailable'));svg.removeAttribute('aria-label');return;}
    root.removeAttribute('aria-label');
    const format=value=>decimal(value,kind==='pressure'?1:0)+' '+metric.unit;
    const time=value=>dateTimeFormat({timeZone:city.timeZone,weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZoneName:'short'}).format(value);
    svg.setAttribute('aria-label',t('{0} forecast · next 24 hours',t(metric.label))+' · '+time(data.start)+' – '+time(data.end)+' · '+t('Low {0} · High {1}',format(data.low),format(data.high))+(kind==='wind'?' · '+t('Dashed line: gusts'):''));
    root.querySelector('.dial-micro-line').setAttribute('d',data.line);
    root.querySelector('.dial-micro-area').setAttribute('d',kind==='wind'||kind==='pressure'?'':data.area);
    root.querySelector('.dial-micro-gusts').setAttribute('d',data.secondary);
  }};
}
