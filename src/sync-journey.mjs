import {t,dateTimeFormat,onLanguageChange} from './i18n.mjs';
import {getStation} from './stations.mjs';
import {CHANNEL_LABELS,WAVE_LABELS} from './trials.mjs';

export function synchronizationStage(session, preparing, epoch, endedStatus) {
  if(preparing)return 'preparing';
  if(session)return epoch<session.firstFullMinute?'aligning':'sending';
  return endedStatus==='confirmed'?'confirmed':endedStatus==='complete'?'verify':'ready';
}
export function createSyncJourney({openTrial}) {
  const $=id=>document.getElementById('journey-'+id);
  let latest=null,lastState='',lastContext;
  function update(context) {
    lastContext=context;
    const {session,busy,epoch}=context,stage=synchronizationStage(session,busy,epoch,latest?.status);
    $('steps').dataset.stage=stage;
    const active={ready:0,preparing:0,aligning:1,sending:2,verify:3,confirmed:3}[stage];
    for(const [i,item]of [...$('steps').children].entries()) {item.classList.toggle('current',i===active);item.classList.toggle('done',i<active||stage==='confirmed');if(i===active)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');}
    if(stage!==lastState) {
      lastState=stage;
      $('detail').textContent=t({ready:'Choose your watch, check its reception mode and keep it near the speaker.',preparing:'Preparing the audio output. Your signal is about to begin.',aligning:'Aligning to the next complete minute. Keep your watch still.',sending:'The time code is being generated. Reception is confirmed on your watch.',verify:'Transmission finished. Check GET or ERR on your watch, then record the result in History.',confirmed:'Reception confirmed by you. This moment belongs to your watch.'}[stage]);
    }
  }
  function finished(trial,saved) {
    latest=trial;
    if(trial.status!=='confirmed')return;
    $('receipt-title').textContent=t('A moment of precision.');
    $('receipt-watch').textContent=trial.snapshot?.watch.name||t('Custom settings');
    $('receipt-date').textContent=dateTimeFormat({year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(trial.endedAt);
    const settings=trial.snapshot.settings;
    $('receipt-settings').textContent=[getStation(trial.stationId).name,t(CHANNEL_LABELS[settings.channel]),t(WAVE_LABELS[settings.wave]),`${trial.endVolume}%`,`${Math.floor(trial.seconds/60)}m ${trial.seconds%60}s`].join(' · ');
    $('receipt-reference').textContent=trial.snapshot.reference?.host||t('System clock · unverified');
    $('receipt-saved').textContent=t(saved?'Saved in your local history.':'The result could not be saved.');
    $('history').disabled=!saved;
    if(document.querySelector('.page.active')?.id==='page-sync')$('receipt').showModal();
  }
  $('history').addEventListener('click',()=>{if(latest){$('receipt').close();openTrial(latest.id);}});
  // Escape closes this local acknowledgement without stopping another session.
  $('receipt').addEventListener('keydown',event=>{if(event.code==='Escape')event.stopPropagation();});
  onLanguageChange(()=>{lastState='';if(lastContext)update(lastContext);});
  return {update,finished,started(){latest=null;lastState='';}};
}
