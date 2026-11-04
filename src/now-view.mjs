import { t, decimal, dateTimeFormat, numberFormat, onLanguageChange } from './i18n.mjs';
import { createEarthScene } from './earth-scene.mjs';
import { lunarEvents, moonState } from './moon-math.mjs';
import {validSharedEpoch} from './shared-instant.mjs';
import {createMoonSurface} from './moon-surface.mjs';
import {prepareOrbit,orbitHealth} from './iss-orbit.mjs';
import {currentIssState} from './iss-current-state.mjs';
import { accuracyPeriods, summarizeAccuracy } from './watch-accuracy-data.mjs';

export function watchOverview(profile, history, archive, epoch) {
  const last = profile ? history.filter(trial => trial.snapshot?.profileId === profile.id && trial.outcome === 'get' && trial.at <= epoch)
    .sort((a,b) => b.at-a.at)[0] : null;
  const period = profile ? accuracyPeriods(archive?.entries || [], profile.id).at(-1) : null;
  const stats = period ? summarizeAccuracy(period, epoch) : null;
  // A new correction or stale observations must not masquerade as a current trend.
  const afterReception = !last || (stats?.latest?.at ?? -Infinity) >= (last.endedAt || last.at);
  const drift = stats?.predicted != null && afterReception ? stats.slope : null;
  return { last, drift, stats };
}

export function createNowView({desktop,getBasemap,getNow,getObserver,getData,getAccuracy}) {
  const $=id=>document.getElementById('now-'+id);
  const moon=createMoonSurface($('moon-disc'));
  let visible=false,timer,refreshTimer,scene,loading,cacheKey='',mapStep=-1;
  let issData=null,issModel=null,issKey='',issBusy=false,issRequested=false;
  async function load(){
    if(scene||loading)return;loading=true;
    try{scene=await createEarthScene($('earth'),'now-earth',{basemap:getBasemap()});mapStep=-1;if(visible)render();}
    catch{$('earth-status').textContent=t('Map unavailable. Open World View to retry.');}
    finally{loading=false;}
  }
  async function refreshIss(){
    if(!visible||document.hidden||issBusy)return;issBusy=true;
    try{
      const response=await desktop.refreshIss();issData=response||{connectivity:'unreachable'};
      const key=issData.orbit?JSON.stringify([issData.orbit.kind,issData.orbit.epoch,issData.orbit.data]):'';
      if(key!==issKey){issKey=key;issModel=null;if(issData.orbit)try{issModel=prepareOrbit(issData.orbit);}catch{/* An invalid orbit stays unavailable. */}}
    }catch{issData={...issData,connectivity:'unreachable'};}
    finally{issBusy=false;issRequested=true;if(visible)render();}
  }
  function renderIss(epoch,city){
    const state=currentIssState(issModel,issData?.fix,epoch,null,{light:false});
    const health=orbitHealth(issModel,epoch),online=issData?.connectivity==='online';
    $('iss-status').textContent=t(state?state.estimated?(online?'ORBITAL ESTIMATE':'OFFLINE · PREDICTED'):(online?'POSITION REPORT':'OFFLINE · LAST REPORT'):issBusy&&!issRequested?'CONNECTING':issModel?'STALE ORBIT':'UNAVAILABLE');
    $('iss-card').dataset.state=state?state.estimated?'estimated':'report':issModel?'stale':'unavailable';
    const coord=(value,positive,negative)=>decimal(Math.abs(value),2)+'° '+(value>=0?positive:negative);
    $('iss-position').textContent=state?coord(state.latitude,'N','S')+' · '+coord(state.longitude,'E','W'):t('No current coordinates');
    $('iss-speed').textContent=state?numberFormat({maximumFractionDigits:0}).format(state.speedKms*3600)+' km/h':'—';
    $('iss-altitude').textContent=state?decimal(state.altitude,1)+' km':'—';
    const stamp=time=>dateTimeFormat({day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(time);
    $('iss-source').textContent=state?.estimated?(health.aging?t('Aging orbit · '):'')+issModel.source+' · '+t('Orbit epoch · {0}',stamp(issModel.epoch)):
      state?state.source+' · '+t('Report · {0}',stamp(state.epoch)):t(issBusy&&!issRequested?'Acquiring orbital elements…':'Open ISS Observatory to refresh.');
    if(scene)scene.update(state,city,{showFootprint:false});
  }
  function render(force=false){
    if(!visible||document.hidden)return;
    const epoch=getNow(),city=getObserver(),data=getData();
    $('clock').textContent=dateTimeFormat({timeZone:city.timeZone,hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(epoch);
    $('date').textContent=dateTimeFormat({timeZone:city.timeZone,weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(epoch)+' · '+city.timeZone;
    $('city').textContent=city.name+' ↗';
    $('reference').dataset.state=data.reference?(epoch-data.reference.nowMs<1800000?'verified':'stale'):'system';
    $('reference').textContent=data.reference?t(epoch-data.reference.nowMs<1800000?'NTP verified':'NTP check needed')+' · '+data.reference.host:t('System clock · unverified');
    $('session').textContent=data.session?t('Transmission in progress · open Synchronize for controls.'):t('Your reference. Your watch. Your universe.');
    const profile=data.profiles.find(p=>p.id===data.activeProfileId),summary=watchOverview(profile,data.history,getAccuracy(),epoch);
    $('watch-name').textContent=profile?.name||t('Start your collection');$('watch-model').textContent=profile?.model||t('Save your first watch and make this space yours.');
    $('last-sync').textContent=summary.last?dateTimeFormat({day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(summary.last.at):t('No confirmed reception yet');
    $('drift').textContent=summary.drift===null?t('More readings needed'):t('{0} s/day',numberFormat({maximumFractionDigits:summary.stats.digits,signDisplay:'exceptZero'}).format(summary.drift));
    if(scene){
      scene.setBasemap(getBasemap());
      if(force||mapStep!==Math.floor(epoch/10000)){scene.updateSun(epoch);mapStep=Math.floor(epoch/10000);}
      $('earth-status').textContent=t('Calculated daylight · illustrative city lights');$('earth-credit').hidden=$('earth').dataset.basemap!=='satellite';
    }
    renderIss(epoch,city);
    const key=city.id+':'+Math.floor(epoch/60000);
    if(force||key!==cacheKey){
      cacheKey=key;
      if(validSharedEpoch(epoch)){
        const events=lunarEvents(epoch,city),state=moonState(epoch,city);
        $('full-moon').textContent=dateTimeFormat({timeZone:city.timeZone,day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(events.fullMoon);
        $('moon-phase').textContent=t(state.name);
        $('moon-illumination').textContent=t('Illumination')+' · '+numberFormat({style:'percent',maximumFractionDigits:0}).format(state.fraction);moon.draw(state.phase);
      }else{for(const id of ['full-moon','moon-phase','moon-illumination'])$(id).textContent=t('Unavailable');}
    }
  }
  onLanguageChange(()=>render(true));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&visible){render(true);refreshIss();}});
  window.addEventListener('beforeunload',()=>{clearInterval(timer);clearInterval(refreshTimer);});
  return {setVisible(value){visible=value;moon.setVisible(value);clearInterval(timer);clearInterval(refreshTimer);if(value){load();render(true);refreshIss();timer=setInterval(render,1000);refreshTimer=setInterval(refreshIss,10000);}}};
}
