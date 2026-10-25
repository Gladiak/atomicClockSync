import { t, decimal, numberFormat, dateTimeFormat, onLanguageChange } from './i18n.mjs';
import { LIGHT_TARGETS, lightObservation, solarLayout, validLightEpoch, shiftLightMonths,
  playbackRate, makeLightReplay, lightReplayPosition, pauseLightReplay, resumeLightReplay, retimeLightReplay } from './light-travel-math.mjs';

const NS = 'http://www.w3.org/2000/svg';
const pad = value => String(value).padStart(2,'0');
const timeFormat = dateTimeFormat({timeZone:'UTC',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
const dayFormat = dateTimeFormat({timeZone:'UTC',day:'2-digit',month:'short',year:'numeric'});
const integer = numberFormat({maximumFractionDigits:0});
const thoughts = {
  sun:'The Sun you see already belongs to the past.',
  moon:'Even our nearest neighbour reaches us from the past.',
  mercury:'A small world, minutes behind your present.',
  venus:'The evening star is a memory in motion.',
  mars:'A red world, sending news from the past.',
  jupiter:'A giant world. A message already minutes old.',
  saturn:'Even its rings reach you late.',
  uranus:'This pale blue light began its journey hours ago.',
  neptune:'Here, hours of travel are part of every glance.',
};
function svg(tag, attributes={}, parent) {
  const element = document.createElementNS(NS,tag);
  for (const [key,value] of Object.entries(attributes)) element.setAttribute(key,String(value));
  parent?.append(element); return element;
}
function duration(seconds) {
  if (seconds < 60) return `${decimal(Math.max(0,seconds),1)} s`;
  const total = Math.round(seconds), hours = Math.floor(total/3600);
  return hours ? `${hours}:${pad(Math.floor(total/60)%60)}:${pad(total%60)}` : `${pad(Math.floor(total/60))}:${pad(total%60)}`;
}

export function createLightTravelView({getNow,getReference,notify}) {
  const $ = id => document.getElementById(`lt-${id}`);
  const page = document.getElementById('page-light-travel');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let selected = 'sun', visible = false, preview = null, replay = null, frame = null;
  let models = new Map(), modelEpoch = null, layout = null, layoutEpoch = null, lastPaint = -Infinity, failed = false;
  const buttons = new Map(), bodies = new Map(), orbits = new Map();

  let seed = 88;
  const random = () => { seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; };
  for (let index=0;index<135;index++) svg('circle',{cx:random()*600,cy:22+random()*255,r:.25+random()*.7,fill:'#d3e9f5',opacity:.13+random()*.45},$('stars'));
  for (const radius of [43,65,89,116,153,188,222,257]) {
    const orbit = svg('ellipse',{cx:286,cy:147,rx:radius,ry:radius*.43,class:'lt-orbit'},$('orbits'));
    orbits.set(radius,orbit);
  }
  const definitions = $('system').querySelector('defs');
  for (const target of LIGHT_TARGETS) {
    const group = svg('g',{class:'lt-body',role:'button',tabindex:0,'aria-pressed':String(target.id===selected)},$('bodies'));
    const title = svg('title',{},group);
    svg('circle',{r:13,fill:'transparent'},group);
    svg('circle',{r:target.size+5,class:'lt-body-focus'},group);
    if (target.id==='saturn') svg('ellipse',{rx:11,ry:3,fill:'none',stroke:target.color,'stroke-width':1,transform:'rotate(-23)'},group);
    const gradient = svg('radialGradient',{id:`lt-material-${target.id}`,cx:'28%',cy:'23%'},definitions);
    svg('stop',{offset:0,'stop-color':target.color},gradient); svg('stop',{offset:1,'stop-color':'#1c253a'},gradient);
    svg('circle',{r:target.size,fill:target.id==='sun'?'url(#lt-sun-core)':`url(#lt-material-${target.id})`},group);
    if (target.id==='jupiter') svg('path',{d:'M-5-2H5M-5 2H5',stroke:'#6d493c','stroke-width':1,opacity:.4},group);
    if (target.id==='moon') svg('circle',{cx:-1,cy:1,r:1,fill:'#505e6a',opacity:.5},group);
    const label = svg('text',{x:target.size+5,y:-target.size-3},group);
    group.addEventListener('click',()=>select(target.id));
    group.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select(target.id);}});
    bodies.set(target.id,{group,title,label});
    const button = document.createElement('button'); button.className='lt-target'; button.dataset.target=target.id;
    button.style.setProperty('--lt-source-color',target.color);
    const icon=document.createElement('span');icon.className='lt-mini-planet';icon.setAttribute('aria-hidden','true');
    const name=document.createElement('strong'),delay=document.createElement('small');
    button.append(icon,name,delay);button.addEventListener('click',()=>select(target.id));
    $('targets').append(button);buttons.set(target.id,{button,name,delay});
  }
  function observationEpoch() { return replay?.observation.epoch ?? preview ?? getNow(); }
  function refreshModels(force=false) {
    const epoch = observationEpoch();
    if (force || modelEpoch===null || Math.abs(epoch-modelEpoch)>=10000) {
      try {
        const next = new Map(LIGHT_TARGETS.map(target=>[target.id,lightObservation(target.id,epoch)]));
        models=next;modelEpoch=epoch;failed=false;
      } catch {
        if (!failed) notify(t('Choose a UTC date between 1900 and 2100.'),true);
        failed=true;$('play').disabled=true;return false;
      }
    }
    if (force || layoutEpoch===null || Math.abs(epoch-layoutEpoch)>=60000) {
      layout=solarLayout(epoch);layoutEpoch=epoch;
    }
    return true;
  }
  function observation() {
    const base=models.get(selected),epoch=observationEpoch();
    return replay?.observation ?? {...base,epoch,emittedAt:epoch-base.seconds*1000};
  }
  function paintDiagram() {
    const target=LIGHT_TARGETS.find(item=>item.id===selected),start=layout[selected],end=layout.earth;
    page.style.setProperty('--lt-source-color',target.color);
    $('scene').style.setProperty('--lt-source-color',target.color);
    for(const item of LIGHT_TARGETS) {
      const node=bodies.get(item.id),point=layout[item.id],active=item.id===selected;
      node.group.setAttribute('transform',`translate(${point.x} ${point.y})`);
      node.group.setAttribute('aria-pressed',String(active));
      node.title.textContent=t(item.name);node.group.setAttribute('aria-label',t(item.name));node.label.textContent=t(item.name);
      node.label.style.display=item.id==='moon'&&!active?'none':'';
      if(item.radius)orbits.get(item.radius).classList.toggle('selected',active);
    }
    $('earth').setAttribute('transform',`translate(${end.x} ${end.y})`);
    $('earth-label').textContent=t('EARTH · RECEIVER');
    const route=`M${start.x} ${start.y}L${end.x} ${end.y}`;
    $('route').setAttribute('d',route);$('route-glow').setAttribute('d',route);
  }
  function paintTransport(monotonic) {
    const current=observation(), position=replay?lightReplayPosition(replay,monotonic):{seconds:0,remaining:current.seconds,fraction:0};
    if (replay?.phase==='playing'&&position.complete) {
      replay=pauseLightReplay(replay,monotonic);
      $('scene').classList.add('lt-arrived');$('arrival').hidden=false;
    }
    const phase=replay?.phase??'idle';
    page.classList.toggle('lt-in-flight',phase==='playing');
    page.classList.toggle('lt-complete',phase==='complete');
    $('play-label').textContent=t(phase==='playing'?'Pause light journey':phase==='paused'?'Resume journey':phase==='complete'?'Replay this light':'Follow this light');
    $('play').firstElementChild.textContent=phase==='playing'?'Ⅱ':'▶';
    $('play').disabled=false;$('reset').disabled=!replay;
    $('elapsed').textContent=duration(position.seconds);
    $('remaining').textContent=t('{0} remaining',duration(position.remaining));
    $('rate').textContent=t('Reconstruction · {0}×',decimal(playbackRate($('speed').value,current.seconds),2));
    $('progress').setAttribute('aria-valuenow',String(Math.round(position.fraction*100)));
    $('progress').setAttribute('aria-valuetext',t('{0}% of the light journey',integer.format(position.fraction*100)));
    $('progress-fill').style.width=`${position.fraction*100}%`;
    $('replay-note').textContent=replay?t('Observation fixed at {0} UTC · watch signal unchanged.',timeFormat.format(current.epoch)):t('A journey through time, not a visibility forecast.');
    $('mode').textContent=t(replay?'RECONSTRUCTION':preview===null?'LIVE':'PREVIEW');
    $('reference').textContent=replay?t('A fixed moment, replayed'):preview===null?getReference():t('Independent preview');
    $('reference').title=$('reference').textContent;
    $('arrival').textContent=t('The past has arrived.');
  }
  function paintPhoton(monotonic) {
    const moving=Boolean(replay)&&!reducedMotion.matches;
    $('photon').toggleAttribute('hidden',!moving);
    if(!replay){$('flight-trail').setAttribute('d','');return;}
    const position=lightReplayPosition(replay,monotonic),start=layout[selected],end=layout.earth;
    const x=start.x+(end.x-start.x)*position.fraction,y=start.y+(end.y-start.y)*position.fraction;
    $('photon').setAttribute('transform',`translate(${x} ${y})`);
    const behind=Math.max(0,position.fraction-.14);
    $('flight-trail').setAttribute('d',`M${start.x+(end.x-start.x)*behind} ${start.y+(end.y-start.y)*behind}L${x} ${y}`);
  }
  function render(force=false,monotonic=performance.now()) {
    if(!refreshModels(force))return;
    const current=observation(),target=LIGHT_TARGETS.find(item=>item.id===selected);
    $('source').textContent=t(target.name);
    $('delay').textContent=duration(current.seconds);
    $('delay-unit').textContent=current.seconds<60?t('seconds in flight'):current.seconds<3600?'min : s':'h : min : s';
    $('thought').textContent=t(thoughts[selected]);
    $('distance').textContent=`${integer.format(current.distanceKm)} km`;
    $('au').textContent=decimal(current.distanceAu,current.distanceAu<.01?5:3)+' AU';
    $('emission-label').textContent=current.reflected?t('REFLECTED AT {0}',t(target.name).toUpperCase()):t('EMITTED AT THE SUN');
    for(const [name,epoch]of[['emitted',current.emittedAt],['received',current.epoch]]) {
      $(name).textContent=timeFormat.format(epoch);$(name).dateTime=new Date(epoch).toISOString();
      $(`${name}-date`).textContent=dayFormat.format(epoch)+' UTC';
    }
    for(const item of LIGHT_TARGETS) {
      const row=buttons.get(item.id),seconds=models.get(item.id).seconds;
      row.name.textContent=t(item.name);row.delay.textContent=duration(seconds);
      row.button.setAttribute('aria-pressed',String(item.id===selected));
      row.button.setAttribute('aria-label',t('{0}: light takes {1} to reach Earth.',t(item.name),duration(seconds)));
    }
    if(document.activeElement!==$('date'))$('date').value=new Date(current.epoch).toISOString().slice(0,10);
    if(document.activeElement!==$('time'))$('time').value=new Date(current.epoch).toISOString().slice(11,19);
    $('months').disabled=!validLightEpoch(shiftLightMonths(current.epoch,6));
    paintDiagram();paintTransport(monotonic);paintPhoton(monotonic);
  }
  function clearReplay() {
    replay=null;$('photon').setAttribute('hidden','');$('arrival').hidden=true;$('scene').classList.remove('lt-arrived');
    $('flight-trail').setAttribute('d','');
  }
  function select(id) {
    if(selected===id)return;
    selected=id;clearReplay();render(true);
    const card=page.querySelector('.lt-telemetry');card.getAnimations().forEach(animation=>animation.cancel());
    if(!reducedMotion.matches&&!document.hidden)card.animate([{opacity:.5,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,easing:'cubic-bezier(.16,1,.3,1)'});
  }
  function previewInput() {
    const epoch=Date.parse(`${$('date').value}T${$('time').value||'00:00:00'}Z`);
    if(!$('date').validity.valid||!$('time').validity.valid||!validLightEpoch(epoch)){render(true);return;}
    preview=epoch;clearReplay();render(true);
  }
  $('date').addEventListener('change',previewInput);$('time').addEventListener('change',previewInput);
  $('months').addEventListener('click',()=>{const epoch=shiftLightMonths(observationEpoch(),6);if(validLightEpoch(epoch)){preview=epoch;clearReplay();render(true);}});
  $('live').addEventListener('click',()=>{preview=null;clearReplay();render(true);});
  $('play').addEventListener('click',()=>{
    const mono=performance.now();
    if(replay?.phase==='playing')replay=pauseLightReplay(replay,mono);
    else if(replay?.phase==='paused')replay=resumeLightReplay(replay,mono);
    else {const source=replay?.observation??lightObservation(selected,observationEpoch());clearReplay();replay=makeLightReplay(source,mono,$('speed').value);}
    render(true,mono);
  });
  $('reset').addEventListener('click',()=>{clearReplay();render(true);});
  $('speed').addEventListener('change',()=>{if(replay)replay=retimeLightReplay(replay,$('speed').value,performance.now());render();});
  $('info').addEventListener('click',()=>$('dialog').showModal());
  $('dialog').addEventListener('keydown',event=>{if(event.code==='Escape')event.stopPropagation();});
  function motionChanged(){page.classList.toggle('lt-motion-reduced',reducedMotion.matches);if(visible)paintPhoton(performance.now());}
  reducedMotion.addEventListener('change',motionChanged);motionChanged();
  function tick(monotonic) {
    frame=null;if(!visible||document.hidden)return;
    if(monotonic-lastPaint>=100){render(false,monotonic);lastPaint=monotonic;}
    if(layout&&replay?.phase==='playing'&&!reducedMotion.matches)paintPhoton(monotonic);
    frame=requestAnimationFrame(tick);
  }
  function pause(){if(replay?.phase==='playing')replay=pauseLightReplay(replay,performance.now());cancelAnimationFrame(frame);frame=null;}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else if(visible){render();if(frame===null)frame=requestAnimationFrame(tick);}});
  onLanguageChange(()=>{if(visible)render(true);});
  window.addEventListener('beforeunload',pause);
  return {setVisible(value){
    if(value===visible)return;visible=value;
    if(value){render(true);if(!document.hidden&&frame===null)frame=requestAnimationFrame(tick);}
    else {pause();if($('dialog').open)$('dialog').close();}
  }};
}
