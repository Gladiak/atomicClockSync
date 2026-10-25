import { geoNaturalEarth1, geoPath, geoGraticule10, geoCircle, feature, mesh } from '../assets/world/vendor.mjs';
import { solarPosition, solarAltitude, lightPhase, seasonEvents, sunEvents, localDateKey, validCity, distanceKm, DAY, wrapLongitude } from './world-math.mjs';
import { STATIONS } from './stations.mjs';

const $ = id => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
function svg(tag, attributes = {}, parent) {
  const node = document.createElementNS(NS, tag);
  for (const [key,value] of Object.entries(attributes)) node.setAttribute(key, value);
  parent?.append(node); return node;
}
const STATION_GEO = {
  dcf77: [50.016, 9.011, 1500, 'Europe/Berlin', '#b4ded9'],
  msf: [54.911, -3.277, 1500, 'Europe/London', '#acd3ef'],
  wwvb: [40.679, -105.046, 3000, 'America/Denver', '#c4c1ee'],
  jjy: [33.466, 130.175, 1000, 'Asia/Tokyo', '#c8dfa6'],
  bpc: [34.457, 115.837, 1500, 'Asia/Shanghai', '#ebc7a5'],
};
export const WORLD_STATIONS = ['dcf77','msf','wwvb','jjy','bpc'].map(id => {
  const [latitude, longitude, radius, localZone, color] = STATION_GEO[id];
  return { ...STATIONS.find(s=>s.id===id), latitude, longitude, radius, localZone, color };
});
const ROME = { id:3169070, name:'Rome', country:'Italy', region:'Lazio', latitude:41.8919, longitude:12.5113, timeZone:'Europe/Rome' };
const clockFormats = new Map();
function clock(epoch, zone, seconds = false) {
  const key = zone + seconds;
  if (!clockFormats.has(key)) clockFormats.set(key,new Intl.DateTimeFormat('en-GB', {
    timeZone:zone, hour:'2-digit', minute:'2-digit', ...(seconds?{second:'2-digit'}:{}), hourCycle:'h23' }));
  return clockFormats.get(key).format(epoch);
}
const utcDate = new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',weekday:'short',day:'2-digit',month:'long',year:'numeric'});
const coord = (value, positive, negative) => `${Math.abs(value).toFixed(1)}° ${value>=0?positive:negative}`;
const hhmm = minutes => `${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;
const midnightUTC = epoch => Math.floor(epoch/DAY)*DAY;

export function createWorldView({ getNow, getReference, getStationId, isTransmitting, useStation, persist, notify }) {
  let saved;
  try { saved = JSON.parse(localStorage.getItem('atomic.world')); } catch { /* Fresh defaults. */ }
  let city = validCity(saved?.city) || ROME;
  let coverage = ['off','selected','all'].includes(saved?.coverage) ? saved.coverage : 'selected';
  let twilight = saved?.twilight === true;
  let stationId = getStationId();
  let visible = false, loaded = false, loading, timer = null;
  let preview = null, playing = false, lastTick = 0, lastMapEpoch = null, lastCityDay = '', events;
  let worker = null, workerReady = false, catalogCount = 0, request = 0, searchTimer, results = [], focusedResult = -1;
  const projection = geoNaturalEarth1().fitExtent([[24,20],[976,424]],{type:'Sphere'});
  const path = geoPath(projection);
  const markers = new Map(), coveragePaths = new Map(), shadePaths = [], lightMasks = [], twilightPaths = [];
  function save() { persist('atomic.world',{city,coverage,twilight}); }
  function epoch() { return preview ?? getNow(); }
  function pause() { playing=false; $('world-play').textContent='▶'; $('world-play').setAttribute('aria-pressed','false'); $('world-play').setAttribute('aria-label','Play accelerated day'); }
  function closeResults() { $('world-city-results').hidden=true; $('world-city-search').setAttribute('aria-expanded','false'); $('world-city-search').removeAttribute('aria-activedescendant'); focusedResult=-1; }
  function setCity(value) {
    const checked=validCity(value);
    if(!checked){notify('This city’s time zone is unavailable in this runtime. Choose another city.',true);return;}
    city = checked; lastCityDay=''; save(); closeResults(); $('world-city-search').value='';
    render(true);
  }
  function selectedStation() { return WORLD_STATIONS.find(s=>s.id===stationId); }
  function chooseStation(id) { stationId=id; renderCoverage(); render(true); }
  function renderCoverage() {
    for(const station of WORLD_STATIONS) {
      const selected = station.id===stationId;
      markers.get(station.id)?.classList.toggle('selected',selected);
      markers.get(station.id)?.setAttribute('aria-pressed',String(selected));
      const ring = coveragePaths.get(station.id);
      if(ring) { ring.style.display = coverage==='all'||(coverage==='selected'&&selected)?'':'none'; ring.setAttribute('stroke-opacity',selected?'.65':'.35'); }
    }
    $('world-station-tabs').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.station===stationId)));
    $('world-coverage-note').textContent=coverage==='off'?'Radio coverage hidden':'Approximate radio coverage · Casio 3179';
    $('world-twilight-lines').style.display=twilight?'':'none';
  }
  function buildMap(topology, lights) {
    const sphere = path({type:'Sphere'});
    for(const id of ['world-sphere-path','world-ocean-path','world-sphere-outline']) $(id).setAttribute('d',sphere);
    $('world-graticule').setAttribute('d',path(geoGraticule10()));
    $('world-land').setAttribute('d',path(feature(topology,topology.objects.land)));
    $('world-land').setAttribute('stroke','#829fa6'); $('world-land').setAttribute('stroke-width','.45');
    $('world-borders').setAttribute('d',path(mesh(topology,topology.objects.countries,(a,b)=>a!==b)));
    for(let i=0;i<22;i++) shadePaths.push(svg('path',{fill:i<3?'#b69369':'#020914',opacity:i<3?'.025':'.105'},$('world-shade')));
    // Geographic light masks brighten progressively through twilight, without a raster texture.
    for(let i=0;i<8;i++) lightMasks.push(svg('path',{fill:'white',opacity:'.25'},$('world-lights-mask-bands')));
    const dotPaths = Array.from({length:5},()=>[]);
    for(const [lon,lat,population] of lights) {
      const [x,y]=projection([lon,lat]);
      const bucket=Math.min(4,Math.max(0,Math.floor(Math.log10(Math.max(3000,population)))-3));
      dotPaths[bucket].push(`M${x.toFixed(2)},${y.toFixed(2)}h.01`);
    }
    for(let i=0;i<dotPaths.length;i++) {
      const d=dotPaths[i].join(''), base={d,fill:'none','stroke-linecap':'round'};
      svg('path',{...base,stroke:'#ff9e35','stroke-width':2.1+i*1.3,opacity:.3+i*.08},$('world-light-halos'));
      svg('path',{...base,stroke:['#d79a4e','#edb45f','#ffd38c','#ffe0a0','#fff0c4'][i],'stroke-width':.55+i*.3,opacity:.6+i*.09},$('world-light-cores'));
    }
    [0,-6,-12,-18].forEach((alt,i)=>twilightPaths.push({alt,node:svg('path',{fill:'none',stroke:['#ffd99f','#e0bb94','#a1b4ce','#8395b5'][i],
      'stroke-width':i?'.7':'1.1','stroke-dasharray':i?'3 5':'',opacity:i?'.65':'.8'},$('world-twilight-lines'))}));
    for(const station of WORLD_STATIONS) {
      const ring = svg('path',{d:path(geoCircle().center([station.longitude,station.latitude]).radius(station.radius/6371.0088*180/Math.PI).precision(1)()),
        fill:station.color,'fill-opacity':'.055',stroke:station.color,'stroke-width':'.9','stroke-dasharray':'3 3'},$('world-coverage-paths'));
      svg('title',{},ring).textContent=`${station.name} · approximately ${station.radius.toLocaleString('en-GB')} km. Casio 3179 reference range, not a reception guarantee.`;
      coveragePaths.set(station.id,ring);
      const [x,y]=projection([station.longitude,station.latitude]);
      const group=svg('g',{class:'world-station-marker',transform:`translate(${x},${y})`,role:'button',tabindex:0,
        'aria-label':`${station.name}, ${station.location}, ${station.frequency/1000} kilohertz`},$('world-station-markers'));
      svg('circle',{r:13,class:'station-ring'},group); svg('circle',{r:7,class:'station-target'},group);
      svg('path',{d:'M-3 4L0-4L3 4M-2 1H2',stroke:station.color,'stroke-width':'1',fill:'none'},group);
      svg('circle',{r:1.2,cy:-4,class:'station-center'},group);
      const offsets={dcf77:[11,-9],msf:[-12,-12],wwvb:[13,4],jjy:[12,4],bpc:[-12,19]};
      const [dx,dy]=offsets[station.id];
      svg('text',{x:dx,y:dy,'text-anchor':dx<0?'end':'start'},group).textContent=station.name;
      const title=svg('title',{},group);title.textContent=`${station.name} · ${station.frequency/1000} kHz · ${station.location}`;
      group.addEventListener('click',()=>chooseStation(station.id));
      group.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();chooseStation(station.id);}});
      markers.set(station.id,group);
    }
    renderCoverage();
  }
  function drawSun(time) {
    const sun=solarPosition(time), anti=[wrapLongitude(sun.longitude+180),-sun.latitude];
    shadePaths.forEach((node,i)=>node.setAttribute('d',path(geoCircle().center(anti).radius(93-i*1.25).precision(1.5)())));
    lightMasks.forEach((node,i)=>node.setAttribute('d',path(geoCircle().center(anti).radius(89-i*1.6).precision(1.5)())));
    twilightPaths.forEach(({alt,node})=>node.setAttribute('d',path(geoCircle().center(anti).radius(90+alt).precision(1)())));
    const [x,y]=projection([sun.longitude,sun.latitude]); $('world-sun').setAttribute('transform',`translate(${x},${y})`);
    $('world-subsolar').textContent=`${coord(sun.latitude,'N','S')} · ${coord(sun.longitude,'E','W')}`;
    $('world-city-phase').textContent=events?.polar || lightPhase(solarAltitude(city,sun));
    return sun;
  }
  function render(force=false) {
    if(!loaded||!visible) return;
    const time=epoch(), date=new Date(time), station=selectedStation();
    $('world-utc').textContent=clock(time,'UTC',true); $('world-utc').dateTime=date.toISOString();
    $('world-date-label').textContent=utcDate.format(time);
    $('world-mode').textContent=preview===null?'LIVE':'PREVIEW'; $('world-mode').classList.toggle('preview',preview!==null);
    $('world-reference').textContent=preview!==null?'Exploration time · audio unchanged':getReference();
    $('world-preview-note').textContent=preview===null?'Follow the Sun. Explore the night.':playing?'Playing one day per minute · UTC':'Preview only · transmission time unchanged';
    if(document.activeElement!==$('world-date')) $('world-date').value=date.toISOString().slice(0,10);
    const seasons=seasonEvents(date.getUTCFullYear());
    document.querySelectorAll('[data-world-season]').forEach(button=>{button.title=new Date(seasons[Number(button.dataset.worldSeason)]).toISOString().replace('T',' ').slice(0,19)+' UTC';});
    const minutes=date.getUTCHours()*60+date.getUTCMinutes();
    $('world-time-slider').value=minutes; $('world-time-slider').setAttribute('aria-valuetext',hhmm(minutes)+' UTC');
    $('world-city-name').textContent=city.name; $('world-city-name').title=`${city.name}, ${city.region}, ${city.country}`;
    $('world-city-country').textContent=city.country; $('world-city-time').textContent=clock(time,city.timeZone,true);
    $('world-city-zone').textContent=`${localDateKey(time,city.timeZone)} · ${city.timeZone}`;
    $('world-city-zone').title=$('world-city-zone').textContent;
    const dayKey=city.id+':'+city.latitude+':'+localDateKey(time,city.timeZone);
    if(lastCityDay!==dayKey) {
      events=sunEvents(time,city); lastCityDay=dayKey;
      $('world-sunrise').textContent=events.rise===null?'No sunrise':clock(events.rise,city.timeZone);
      $('world-sunset').textContent=events.set===null?'No sunset':clock(events.set,city.timeZone);
      const length=Math.round(events.daylightMs/60000);
      $('world-daylength').textContent=`${Math.floor(length/60)}h ${String(length%60).padStart(2,'0')}m`;
    }
    if(force||lastMapEpoch===null||Math.abs(time-lastMapEpoch)>=10000) { drawSun(time); lastMapEpoch=time; }
    const [x,y]=projection([city.longitude,city.latitude]);$('world-city-marker').setAttribute('transform',`translate(${x},${y})`);
    const label=$('world-city-map-label');label.textContent=city.name.length>24?city.name.slice(0,23)+'…':city.name;
    // Keep labels inside the fixed viewport, including Pacific and polar selections.
    label.setAttribute('text-anchor',x<100?'start':x>900?'end':'middle'); label.setAttribute('y',y<65?'29':'-21');
    $('world-station-location').textContent=station.location.split(',')[0];
    $('world-station-distance').textContent=`${station.frequency/1000} kHz · ${clock(time,station.localZone)} local · ${Math.round(distanceKm(city,station)).toLocaleString('en-GB')} km away`;
    $('world-use-station').textContent=`Use ${station.name} ↗`; $('world-use-station').disabled=isTransmitting();
    for(const s of WORLD_STATIONS) markers.get(s.id)?.classList.toggle('transmitting',isTransmitting()&&getStationId()===s.id);
  }
  async function load() {
    if(loaded) return;
    if(loading) return loading;
    loading=Promise.all(['countries-50m.json','lights.json','catalog.json'].map(async name=>{
      const r=await fetch(new URL(`../assets/world/${name}`,import.meta.url));if(!r.ok)throw Error('Atlas data unavailable');return r.json();
    })).then(([topology,lights,manifest])=>{
      buildMap(topology,lights);catalogCount=manifest.cityCount;
      $('world-catalog-status').textContent=`${catalogCount.toLocaleString('en-GB')} cities · offline`;
      loaded=true;$('world-loading').hidden=true;render(true);
    }).catch(()=>{
      $('world-loading').replaceChildren(document.createTextNode('The atlas could not be loaded. '));
      const retry=document.createElement('button');retry.textContent='Retry';retry.className='text-button';
      retry.onclick=()=>{loading=null;$('world-loading').textContent='Preparing your view of Earth…';load();};$('world-loading').append(retry);
    });
    return loading;
  }
  function searchMessage(message) {
    results=[];focusedResult=-1;
    const box=$('world-city-results');box.replaceChildren();const text=document.createElement('span');text.className='world-search-message';text.textContent=message;box.append(text);
    box.hidden=false;$('world-city-search').setAttribute('aria-expanded','true');
  }
  function renderResults() {
    const box=$('world-city-results');box.replaceChildren();focusedResult=-1;
    $('world-city-search').removeAttribute('aria-activedescendant');
    if(!results.length){searchMessage('No matching city. Try another spelling or add a country.');return;}
    results.forEach((value,i)=>{
      const button=document.createElement('button');button.type='button';button.className='world-result';button.id=`world-result-${i}`;
      button.role='option';button.setAttribute('aria-selected','false');button.tabIndex=-1;
      const title=document.createElement('strong');title.textContent=value.name;
      const sub=document.createElement('span');sub.textContent=[value.region,value.country].filter(Boolean).join(' · ');
      button.append(title,sub);button.addEventListener('mousedown',e=>e.preventDefault());button.onclick=()=>setCity(value);box.append(button);
    });box.hidden=false;$('world-city-search').setAttribute('aria-expanded','true');
  }
  function startWorker() {
    if(worker)return;
    $('world-catalog-status').textContent='Preparing city search…';
    try {
      worker=new Worker(new URL('./city-search-worker.mjs',import.meta.url),{type:'module'});
      worker.onmessage=({data})=>{
        if(data.type==='ready') { workerReady=true;catalogCount=data.count;$('world-catalog-status').textContent=`${catalogCount.toLocaleString('en-GB')} cities · offline`;
          if($('world-city-search').value.trim().length>=2)sendQuery(); }
        else if(data.type==='results'&&data.request===request&&visible&&document.activeElement===$('world-city-search')&&$('world-city-search').value.trim().length>=2) {
          results=data.cities;renderResults();
        } else if(data.type==='error') workerError();
      };
      worker.onerror=workerError;
    } catch { workerError(); }
  }
  function workerError() {
    worker?.terminate();worker=null;workerReady=false;
    $('world-catalog-status').textContent='City search unavailable';
    if(document.activeElement===$('world-city-search'))searchMessage('City search could not load. Focus the search field to retry.');
  }
  function sendQuery() {
    const query=$('world-city-search').value.trim();request++;
    if(query.length<2){closeResults();return;}
    startWorker();if(!workerReady){searchMessage('Loading the offline city catalog…');return;}
    worker.postMessage({query,request});
  }
  $('world-city-search').addEventListener('focus',startWorker);
  $('world-city-search').addEventListener('input',()=>{request++;results=[];closeResults();clearTimeout(searchTimer);searchTimer=setTimeout(sendQuery,160);});
  $('world-city-search').addEventListener('keydown',event=>{
    if(event.key==='Escape'){if(!$('world-city-results').hidden)event.stopPropagation();request++;closeResults();return;}
    if((event.key==='ArrowDown'||event.key==='ArrowUp')&&results.length&&!$('world-city-results').hidden){
      event.preventDefault();focusedResult=(focusedResult+(event.key==='ArrowDown'?1:-1)+results.length)%results.length;
      [...$('world-city-results').querySelectorAll('[role=option]')].forEach((button,i)=>button.setAttribute('aria-selected',String(i===focusedResult)));
      $('world-city-search').setAttribute('aria-activedescendant',`world-result-${focusedResult}`);
    }else if(event.key==='Enter'&&focusedResult>=0&&!$('world-city-results').hidden){event.preventDefault();setCity(results[focusedResult]);}
  });
  document.addEventListener('pointerdown',event=>{if(!event.target.closest('.world-search')){request++;closeResults();}});
  $('world-city-search').addEventListener('blur',()=>setTimeout(()=>{if(!document.activeElement?.closest('.world-search'))closeResults();},100));
  $('world-coverage').value=coverage;
  $('world-coverage').onchange=event=>{coverage=event.target.value;save();renderCoverage();};
  $('world-twilight').setAttribute('aria-pressed',String(twilight));
  $('world-twilight').onclick=()=>{twilight=!twilight;$('world-twilight').setAttribute('aria-pressed',String(twilight));save();renderCoverage();};
  for(const station of WORLD_STATIONS){
    const button=document.createElement('button');button.textContent=station.name;button.dataset.station=station.id;
    button.onclick=()=>chooseStation(station.id);$('world-station-tabs').append(button);
  }
  $('world-use-station').onclick=()=>{if(!isTransmitting()){useStation(stationId);notify(`${selectedStation().name} selected for transmission.`);}};
  function previewAt(time) {
    if(!Number.isFinite(time)||time<Date.UTC(1900,0,1)||time>=Date.UTC(2101,0,1))return;
    preview=time;document.querySelectorAll('[data-world-season]').forEach(b=>b.setAttribute('aria-pressed','false'));render(true);
  }
  $('world-date').onchange=()=>{
    pause();const value=$('world-date').value;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value)){render();return;}
    previewAt(Date.parse(value+'T00:00:00Z')+Number($('world-time-slider').value)*60000);
  };
  $('world-time-slider').oninput=()=>{pause();previewAt(midnightUTC(epoch())+Number($('world-time-slider').value)*60000);};
  $('world-now').onclick=()=>{pause();preview=null;document.querySelectorAll('[data-world-season]').forEach(b=>b.setAttribute('aria-pressed','false'));render(true);};
  $('world-play').onclick=()=>{
    if(playing){pause();return;}
    previewAt(epoch());playing=true;lastTick=performance.now();$('world-play').textContent='Ⅱ';$('world-play').setAttribute('aria-pressed','true');$('world-play').setAttribute('aria-label','Pause accelerated day');
  };
  document.querySelectorAll('[data-world-season]').forEach(button=>{
    button.setAttribute('aria-pressed','false');button.onclick=()=>{
      pause();previewAt(seasonEvents(new Date(epoch()).getUTCFullYear())[Number(button.dataset.worldSeason)]);
      button.setAttribute('aria-pressed','true');
    };
  });
  function tick() {
    if(!visible||document.hidden){lastTick=performance.now();return;}
    if(playing){const current=performance.now();const next=preview+Math.min(1000,current-lastTick)*1440;lastTick=current;
      if(next>=Date.UTC(2101,0,1)){pause();preview=Date.UTC(2101,0,1)-1000;}else preview=next;}
    render();
  }
  document.addEventListener('visibilitychange',()=>{lastTick=performance.now();if(!document.hidden&&visible)render(true);});
  window.addEventListener('beforeunload',()=>{clearInterval(timer);worker?.terminate();});
  return { setVisible(value) {
    if(value&&!visible){stationId=getStationId();renderCoverage();}
    visible=value;closeResults();
    if(value){lastTick=performance.now();load();render(true);if(!timer)timer=setInterval(tick,250);}
    else {pause();clearInterval(timer);timer=null;}
  }};
}
