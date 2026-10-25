import {createEarthScene} from './earth-scene.mjs';
import {prepareOrbit,stateAt,orbitHealth,groundTrack,compass,relativisticShift} from './iss-orbit.mjs';
const $=id=>document.getElementById(id),HOUR=3600000;
const utc=new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
const dateFormats=new Map();
function localTime(epoch,zone,withDate=false){const key=zone+withDate;if(!dateFormats.has(key))dateFormats.set(key,new Intl.DateTimeFormat('en-GB',{timeZone:zone,...(withDate?{day:'2-digit',month:'short'}:{}),hour:'2-digit',minute:'2-digit',hourCycle:'h23'}));return dateFormats.get(key).format(epoch);}
const age=(milliseconds)=>milliseconds<60000?'just now':milliseconds<HOUR?`${Math.floor(milliseconds/60000)} min ago`:`${(milliseconds/HOUR).toFixed(1)} h ago`;
const duration=milliseconds=>{const s=Math.max(0,Math.round(milliseconds/1000));return `${Math.floor(s/60)}m ${String(s%60).padStart(2,'0')}s`;};
const coordinate=(v,pos,neg)=>`${Math.abs(v).toFixed(2)}°${v>=0?pos:neg}`;
const skyPoint=s=>{const r=108*(90-s.elevation)/90,a=s.azimuth*Math.PI/180;return [150+r*Math.sin(a),140-r*Math.cos(a)];};

export function createIssView({getNow,getObserver,chooseCity,desktop,notify}){
  let visible=false,tab='tracking',scene=null,sceneLoading=null,timer=null,refreshTimer=null,busy=false;
  let data=null,model=null,modelKey='',previewOffset=null,showFootprint=true,showTrack=true;
  let lastText=0,lastSun=0,lastTrack=0,lastCountry=0,lastPrediction=0,observerKey='',country='',track=[];
  let passWorker=null,passRequest=0,passes=[],selected=null,passPage=0,passLoading=false,passError='';
  let lastState=null;
  function observer(){return getObserver();}
  function displayEpoch(){return previewOffset===null?getNow():previewOffset;}
  function setTab(name){
    tab=name;
    document.querySelectorAll('[data-iss-tab]').forEach(button=>{const active=button.dataset.issTab===name;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;$('iss-'+button.dataset.issTab).hidden=!active;});
    render(true);if(name==='passes')renderPasses();
  }
  document.querySelectorAll('[data-iss-tab]').forEach(button=>{
    button.onclick=()=>setTab(button.dataset.issTab);
    button.onkeydown=event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();
      const all=[...document.querySelectorAll('[data-iss-tab]')],i=all.indexOf(button),index=event.key==='Home'?0:event.key==='End'?all.length-1:(i+(event.key==='ArrowRight'?1:-1)+all.length)%all.length;all[index].focus();setTab(all[index].dataset.issTab);};
  });
  function resolveState(){
    const time=displayEpoch();
    if(model&&orbitHealth(model,time).usable){try{return {...stateAt(model,time,observer()),estimated:true};}catch{/* A failed propagator never becomes a guessed position. */}}
    const fix=data?.fix;
    if(previewOffset===null&&fix&&Math.abs(getNow()-fix.timestamp)<30000)return {...fix,speedKms:fix.velocity/3600,epoch:fix.timestamp,estimated:false};
    return null;
  }
  async function loadScene(){
    if(scene||sceneLoading)return sceneLoading;
    sceneLoading=createEarthScene($('iss-earth'),'iss-atlas').then(value=>{scene=value;lastSun=0;render(true);})
      .catch(()=>{sceneLoading=null;$('iss-map-message').textContent='The local atlas could not load. Use Refresh to retry.';});return sceneLoading;
  }
  async function refresh(){
    if(busy||!visible||document.hidden)return;
    busy=true;$('iss-refresh').disabled=true;
    try{
      data=await desktop.refreshIss();
      const key=data.orbit?JSON.stringify(data.orbit.data):'';
      if(key!==modelKey){modelKey=key;model=null;passRequest++;if(data.orbit)try{model=prepareOrbit(data.orbit);}catch{/* Invalid data remains unavailable. */}
        lastTrack=0;lastPrediction=0;passes=[];selected=null;}
      if(model&&(!lastPrediction||getNow()-lastPrediction>15*60000))requestPasses();
    }catch{data={...data,connectivity:'unreachable',error:'ISS services could not be reached.'};}
    finally{busy=false;$('iss-refresh').disabled=false;if(visible)render(true);}
  }
  function requestPasses(){
    const now=getNow();
    if(!model||!orbitHealth(model,now).usable){passes=[];selected=null;passLoading=false;passError='Fresh orbital elements are needed for pass predictions.';renderPasses();return;}
    if(!passWorker){try{passWorker=new Worker(new URL('./iss-pass-worker.mjs',import.meta.url),{type:'module'});
      passWorker.onmessage=({data:result})=>{if(result.request!==passRequest)return;passLoading=false;passError=result.error||'';
        const old=selected?.start;passes=result.passes||[];selected=passes.find(p=>old&&Math.abs(p.start-old)<60000)||passes.find(p=>p.visibleSegments.length)||passes[0]||null;
        passPage=0;renderPasses();render(true);};
      passWorker.onerror=()=>{passLoading=false;passError='Pass calculation could not start. Refresh to retry.';passWorker.terminate();passWorker=null;renderPasses();};
    }catch{passError='Pass calculation is unavailable.';renderPasses();return;}}
    passLoading=true;passError='';lastPrediction=now;passRequest++;
    passWorker.postMessage({request:passRequest,orbit:data.orbit,observer:observer(),start:now});renderPasses();
  }
  function checkObserver(){
    const city=observer(),key=JSON.stringify([city.id,city.latitude,city.longitude,city.timeZone]);
    if(key===observerKey)return;observerKey=key;passes=[];selected=null;lastPrediction=0;
    $('iss-observer').textContent=`⌖ ${city.name} ↗`;$('iss-observer').title=`Observing from ${city.name}, ${city.country}. Change city in World View.`;
    if(model)requestPasses();
  }
  function networkStatus(){
    const health=orbitHealth(model,getNow()),online=data?.connectivity==='online',fixFresh=data?.fix&&Math.abs(getNow()-data.fix.timestamp)<30000;
    let label=busy&&!data?'CONNECTING':health.usable?(online?'ONLINE · PREDICTED':'OFFLINE · PREDICTED'):fixFresh?(online?'ONLINE · REPORT':'OFFLINE · LAST REPORT'):model?'STALE ORBIT':data?'UNAVAILABLE':'CONNECTING';
    $('iss-network').textContent=label;$('iss-network').classList.toggle('online',online);
    $('iss-network').title='Connectivity is determined from HTTPS requests to ISS sources. Predicted positions are orbital calculations, not onboard telemetry.';
    $('iss-orbit-age').textContent=model?`${health.aging?'Aging orbit · ':''}Epoch ${age(Math.max(0,getNow()-model.epoch))}`:'No cached orbit';
    const source=health.usable?data?.orbit?.source:data?.fix?.source;
    $('iss-source-status').textContent=source?`${source} · ${data?.lastSuccess?'HTTPS checked '+age(Math.max(0,getNow()-data.lastSuccess)):'cached data'} · ${health.usable?'SGP4 estimate':'position report'}`:busy?'Checking public ISS sources…':'No usable data. Connect to retrieve an ISS orbit.';
    $('iss-source-status').title=`${data?.error||''}${model?' Orbital epoch: '+new Date(model.epoch).toISOString():''} No weather or obstruction data are used.`;
  }
  function render(force=false){
    if(!visible)return;
    checkObserver();const now=getNow(),time=displayEpoch();
    if(tab!=='tracking'&&!force&&now-lastText<500)return;
    let state=resolveState();lastState=state;
    if(scene&&tab==='tracking'){
      if(force||Math.abs(time-lastSun)>10000){scene.updateSun(time);lastSun=time;}
      scene.update(state,observer(),{showFootprint});
      if(model&&orbitHealth(model,time).usable){
        if(force||Math.abs(time-lastTrack)>30000){try{track=groundTrack(model,time);scene.track(track,time,showTrack);lastTrack=time;}catch{scene.track([],time,false);}}
      }else scene.track([],time,false);
    }
    if(!force&&now-lastText<500)return;lastText=now;networkStatus();
    $('iss-clock').textContent=utc.format(time)+' UTC';$('iss-clock').dateTime=new Date(time).toISOString();
    $('iss-mode').textContent=previewOffset!==null?'PREVIEW':state?.estimated?'ORBITAL ESTIMATE':state?(data?.connectivity==='online'?'POSITION REPORT':'LAST REPORT'):'NO POSITION';
    $('iss-mode').classList.toggle('preview',previewOffset!==null);
    $('iss-preview-offset').textContent=previewOffset===null?'Now':`${((time-now)/60000)>=0?'+':''}${Math.round((time-now)/60000)} min`;
    $('iss-preview').disabled=!model||!orbitHealth(model,now).usable;
    if(document.activeElement!==$('iss-preview'))$('iss-preview').value=previewOffset===null?0:Math.max(-45,Math.min(90,(time-now)/60000));
    $('iss-map-message').hidden=Boolean(state)&&Boolean(scene);
    if(!state)$('iss-map-message').textContent=model?'Orbital elements are too old for this time. Refresh online.':data?.fix?`Last position report: ${utc.format(data.fix.timestamp)} UTC. No current position available.`:busy?'Acquiring orbital elements…':'No ISS position available. Connect and refresh to begin.';
    const city=observer();$('iss-location').textContent=city.name;$('iss-location').title=`${city.name}, ${city.country}`;
    $('iss-location-time').textContent=`${localTime(time,city.timeZone)} · ${city.timeZone}`;
    $('iss-speed').textContent=state?Math.round(state.speedKms*3600).toLocaleString('en-GB'):'—';
    $('iss-speed-secondary').textContent=state?`km/h · ${state.speedKms.toFixed(2)} km/s`:'km/h · no current state';
    $('iss-altitude').textContent=state?state.altitude.toFixed(1)+' km':'—';
    $('iss-period').textContent=state?.periodMinutes?state.periodMinutes.toFixed(1)+' min':'—';
    $('iss-light').textContent=state?.sunlight||'Unavailable';$('iss-inclination').textContent=state?.inclination?state.inclination.toFixed(2)+'°':'—';
    $('iss-orbits-day').textContent=state?.periodMinutes?(1440/state.periodMinutes).toFixed(2):'—';
    let direction='—';if(state?.estimated)try{direction=stateAt(model,time+5000,null,{light:false}).latitude>state.latitude?'Northbound':'Southbound';}catch{/* No direction without a valid orbit. */}
    $('iss-direction').textContent=direction;
    $('iss-coordinates').textContent=state?`${coordinate(state.latitude,'N','S')} · ${coordinate(state.longitude,'E','W')}`:'No current coordinates';
    if(state&&scene&&(force||now-lastCountry>5000)){country=scene.countryAt(state);lastCountry=now;}
    $('iss-over-country').textContent=state?country||'Earth':'Waiting for position';
    $('iss-range').textContent=Number.isFinite(state?.rangeKm)?Math.round(state.rangeKm).toLocaleString('en-GB')+' km':'—';
    $('iss-ground-range').textContent=Number.isFinite(state?.groundKm)?Math.round(state.groundKm).toLocaleString('en-GB')+' km along Earth':'Requires orbital elements';
    $('iss-look').textContent=Number.isFinite(state?.elevation)?`${compass(state.azimuth)} · ${state.elevation.toFixed(0)}°`:'—';
    $('iss-observable').textContent=state?.potentiallyVisible?'Potentially visible now':state?.elevation<0?'Below your horizon':state?.sunlight==='Earth shadow'?'ISS in Earth shadow':state?.observerSunAltitude> -6?'Your sky is too bright':state?'No visible-pass conditions':'Awaiting orbital elements';
    const next=orbitHealth(model,now).usable?passes.flatMap(p=>p.visibleSegments.map(s=>({...s,pass:p}))).find(s=>s.end>now):null;
    $('iss-next-time').textContent=next?next.start<=now?'Happening now':localTime(next.start,city.timeZone,true):passLoading?'Calculating…':'No visible pass found';
    const until=next?Math.max(0,next.start-now):0,countdown=until>=HOUR?`${Math.floor(until/HOUR)}h ${Math.floor(until%HOUR/60000)}m`:duration(until);
    $('iss-next-details').textContent=next?`${next.start<=now?'Now':'In '+countdown} · ${duration(next.end-next.start)} visible`:'Within the valid 48-hour prediction window';
    renderTime(state);
  }
  function renderTime(state){
    const h=state?.altitude??420,v=state?.speedKms??7.67,shift=relativisticShift(h,v);
    $('iss-time-net').textContent=shift.net.toFixed(2)+' µs';
    $('iss-gravity-shift').textContent='+'+shift.gravity.toFixed(2)+' µs';$('iss-motion-shift').textContent=shift.motion.toFixed(2)+' µs';
    $('iss-gravity-bar').style.width=Math.min(100,Math.abs(shift.gravity)/32*100)+'%';$('iss-motion-bar').style.width=Math.min(100,Math.abs(shift.motion)/32*100)+'%';
    $('iss-time-basis').textContent=`${state?'Calculated from displayed state':'Illustrative orbit'} · ${h.toFixed(0)} km · ${v.toFixed(2)} km/s`;
    $('iss-six-months').textContent=(shift.net*182.625/1000).toFixed(2)+' ms';
  }
  function filteredPasses(){return orbitHealth(model,getNow()).usable?passes.filter(p=>p.end>getNow()&&(!$('iss-visible-only').checked||p.visibleSegments.length)):[];}
  function renderPasses(){
    const city=observer(),filtered=filteredPasses(),list=$('iss-pass-list');
    $('iss-pass-location').textContent=`${city.name} · local time · up to 48 hours, limited by orbit validity`;
    list.replaceChildren();passPage=Math.max(0,Math.min(passPage,Math.max(0,Math.ceil(filtered.length/5)-1)));
    if(!filtered.length){const message=document.createElement('div');message.className='iss-pass-empty';message.textContent=passLoading?'Calculating local passes in the background…':passError||(!model?'Connect to load fresh orbital data.':$('iss-visible-only').checked?'No potentially visible passes in this prediction window. Turn off the filter to see geometric passes.':'No passes above 10° in this prediction window.');list.append(message);}
    if(selected&&!filtered.includes(selected))selected=filtered[0]||null;
    for(const pass of filtered.slice(passPage*5,passPage*5+5)){
      const row=document.createElement('button');row.className='iss-pass-row';row.setAttribute('aria-pressed',String(selected===pass));
      const displayStart=$('iss-visible-only').checked&&pass.visibleSegments.length?pass.visibleSegments[0].start:pass.start;
      const a=document.createElement('div'),title=document.createElement('strong'),date=document.createElement('small');title.textContent=localTime(displayStart,city.timeZone);date.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:city.timeZone,weekday:'short',day:'2-digit',month:'short'}).format(displayStart);a.append(title,date);
      const b=document.createElement('div'),height=document.createElement('strong'),detail=document.createElement('small');height.textContent=`${pass.maxElevation.toFixed(0)}° max`;detail.textContent=`${duration(pass.end-pass.start)} · ${compass(pass.azimuthStart)} → ${compass(pass.azimuthEnd)}`;b.append(height,detail);
      const visibility=document.createElement('span');visibility.className='iss-pass-visibility';visibility.textContent=pass.visibleSegments.length?'VISIBLE*':'GEOMETRIC';
      row.append(a,b,visibility);row.onclick=()=>{selected=pass;renderPasses();};list.append(row);
    }
    const count=Math.max(1,Math.ceil(filtered.length/5));$('iss-pass-page').textContent=`${passPage+1} / ${count}`;$('iss-pass-prev').disabled=passPage===0;$('iss-pass-next').disabled=passPage+1>=count;
    renderSky();
  }
  function renderSky(){
    const valid=selected&&model&&orbitHealth(model,selected.peakTime).usable;
    $('iss-preview-pass').disabled=!valid;
    if(!valid){$('iss-sky-full').setAttribute('d','');$('iss-sky-visible').setAttribute('d','');$('iss-sky-start').style.display='none';$('iss-sky-peak').style.display='none';$('iss-pass-summary').textContent='Select a pass to explore its path across your sky.';return;}
    const coordinates=selected.samples.map(skyPoint);$('iss-sky-full').setAttribute('d',coordinates.map(([x,y],i)=>`${i?'L':'M'}${x},${y}`).join(''));
    let active=false;const commands=[];
    selected.samples.forEach(s=>{if(!s.visible){active=false;return;}const[x,y]=skyPoint(s);commands.push(`${active?'L':'M'}${x},${y}`);active=true;});$('iss-sky-visible').setAttribute('d',commands.join(''));
    for(const[id,point]of[['iss-sky-start',coordinates[0]],['iss-sky-peak',skyPoint(stateAt(model,selected.peakTime,observer()))]]){
      const node=$(id);node.style.display='';node.setAttribute('cx',point[0]);node.setAttribute('cy',point[1]);}
    const zone=observer().timeZone,lines=[`Above 10°: ${localTime(selected.start,zone)}–${localTime(selected.end,zone)}`,
      `Peak: ${selected.maxElevation.toFixed(1)}° at ${localTime(selected.peakTime,zone)}`,
      `${compass(selected.azimuthStart)} → ${compass(selected.azimuthEnd)} · ${duration(selected.end-selected.start)}`,
      selected.visibleSegments.length?`Potential visibility: ${duration(selected.visibleSegments.reduce((n,s)=>n+s.end-s.start,0))}`:'Geometric pass · no predicted naked-eye visibility'];
    for(const segment of selected.visibleSegments)lines.push(`Visible*: ${localTime(segment.start,zone)}–${localTime(segment.end,zone)}`);
    $('iss-pass-summary').replaceChildren(...lines.map(text=>{const div=document.createElement('div');div.textContent=text;return div;}));
  }
  $('iss-observer').onclick=chooseCity;$('iss-refresh').onclick=()=>{loadScene();refresh();};
  $('iss-footprint').onclick=()=>{showFootprint=!showFootprint;$('iss-footprint').setAttribute('aria-pressed',String(showFootprint));render(true);};
  $('iss-track-toggle').onclick=()=>{showTrack=!showTrack;$('iss-track-toggle').setAttribute('aria-pressed',String(showTrack));render(true);};
  $('iss-preview').oninput=()=>{previewOffset=getNow()+Number($('iss-preview').value)*60000;render(true);};
  $('iss-live').onclick=()=>{previewOffset=null;render(true);};
  $('iss-visible-only').onchange=()=>{passPage=0;renderPasses();};$('iss-pass-prev').onclick=()=>{passPage--;renderPasses();};$('iss-pass-next').onclick=()=>{passPage++;renderPasses();};
  $('iss-preview-pass').onclick=()=>{if(selected){previewOffset=selected.peakTime;setTab('tracking');}};
  $('iss-next-pass').onclick=()=>setTab('passes');
  document.addEventListener('visibilitychange',()=>{if(visible&&!document.hidden){render(true);refresh();}});
  window.addEventListener('beforeunload',()=>{clearInterval(timer);clearInterval(refreshTimer);passWorker?.terminate();});
  return {setVisible(value){visible=value;
    if(value){checkObserver();loadScene();render(true);refresh();timer||=setInterval(()=>{if(!document.hidden)render();},80);
      refreshTimer||=setInterval(()=>{if(!document.hidden){refresh();if(model&&getNow()-lastPrediction>15*60000)requestPasses();}},10000);}
    else{clearInterval(timer);clearInterval(refreshTimer);timer=null;refreshTimer=null;}
  }};
}
