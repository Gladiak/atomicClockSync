import { t, dateTimeFormat, numberFormat, onLanguageChange, localizeStoredMessage } from './i18n.mjs';
import { ACCURACY_KEY, DAY_MS, normalizeAccuracy, makeAccuracyEntry, referenceAt, accuracyPeriods, summarizeAccuracy, accuracyCSV } from './watch-accuracy-data.mjs';

const eventLabels = { measurement:'Offset measurement', synchronization:'Confirmed synchronization', adjustment:'Manual adjustment', maintenance:'Battery / maintenance' };
const dates = dateTimeFormat({timeZone:'UTC',year:'numeric',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'});
const shortDates = dateTimeFormat({timeZone:'UTC',day:'2-digit',month:'short'});
const localClock = dateTimeFormat({hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
const clock = dateTimeFormat({timeZone:'UTC',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
const numeric = (value,digits=1) => numberFormat({maximumFractionDigits:digits,useGrouping:false}).format(value);
const signed = (value,digits=1) => numberFormat({maximumFractionDigits:digits,useGrouping:false,signDisplay:'exceptZero'}).format(Math.abs(value)<0.5*10**-digits?0:value);
const atInput = at => new Date(at).toISOString().slice(0,19);
const inputTime = value => /^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d)?$/.test(value) ? Date.parse(value+'Z') : NaN;
function node(tag,className,text,parent){const el=document.createElement(tag);if(className)el.className=className;if(text!=null)el.textContent=text;parent?.append(el);return el;}
function action(text,parent,handler){const el=node('button','text-button',text,parent);el.type='button';el.addEventListener('click',handler);return el;}
const svgNS='http://www.w3.org/2000/svg';
function svgNode(tag,attributes,parent,text){const el=document.createElementNS(svgNS,tag);for(const[key,value]of Object.entries(attributes))el.setAttribute(key,value);if(text!=null)el.textContent=text;parent?.append(el);return el;}

export function createWatchAccuracy({getNow,getData,persist,notify,goTo,openLab,checkTime}){
  const $=id=>document.getElementById('wa-'+id);
  let archive,originalData='';
  try{originalData=localStorage.getItem(ACCURACY_KEY)||'';archive=normalizeAccuracy(JSON.parse(originalData||'null'));}catch{archive=null;}
  let visible=false,watch=null,periodId=null,tab='overview',deleting=null,removed=null;
  let watches=new Map(),periods=[],currentPeriod=null,stats=null,lastTick='';
  const drafts=new Map();
  function newDraft(){return {type:'measurement',at:atInput(getNow()),offset:'',step:'1',wear:'',position:'',temperature:'',note:'',reference:{kind:'manual'},editing:null,sourceTrialId:null,conditionsOpen:false,status:''};}
  const draft=()=>{if(!drafts.has(watch))drafts.set(watch,newDraft());return drafts.get(watch);};
  const entries=()=>archive?.entries||[];
  const watchEntries=()=>entries().filter(entry=>entry.profileId===watch);
  function save(entriesToSave){if(!archive)return false;const next={version:1,entries:entriesToSave};if(!persist(ACCURACY_KEY,next))return false;archive=next;return true;}
  function refText(source){return source?.kind==='ntp'?t('NTP at capture · {0} · ±{1} ms',source.host,numeric(Math.ceil(source.uncertaintyMs),0)):t(source?.kind==='system'?'System clock at capture · unverified':'Manual record · reference not verified');}
  function fillWatches(){
    const data=getData();watches=new Map(data.profiles.map(profile=>[profile.id,{name:profile.name,archived:false}]));
    for(const entry of entries())if(!watches.has(entry.profileId))watches.set(entry.profileId,{name:entry.watchName,archived:true});
    for(const trial of data.history)if(trial.snapshot?.profileId&&!watches.has(trial.snapshot.profileId))watches.set(trial.snapshot.profileId,{name:trial.snapshot.watch.name||t('Archived watch'),archived:true});
    if(!watches.has(watch))watch=watches.has(data.activeProfileId)?data.activeProfileId:watches.keys().next().value||null;
    $('watch').replaceChildren();for(const[id,item]of watches)$('watch').append(new Option(item.archived?t('{0} · archived',item.name):item.name,id));
    $('watch').value=watch||'';$('watch').disabled=!watch;
  }
  function selectPeriods(){
    periods=accuracyPeriods(entries(),watch);
    if(!periods.some(period=>period.id===periodId))periodId=periods.at(-1).id;
    currentPeriod=periods.find(period=>period.id===periodId);stats=summarizeAccuracy(currentPeriod,getNow());
    $('period').replaceChildren();for(const period of periods.slice().reverse()){
      const label=period.marker?`${shortDates.format(period.start)} · ${t(eventLabels[period.marker.type])}`:t('First observation');
      $('period').append(new Option(label,period.id));
    }
    $('period').value=periodId;$('period').disabled=!watch;
  }
  function plot(){
    const holder=$('plot');holder.replaceChildren();
    if(!stats.count){
      const box=node('div','wa-plot-empty',null,holder);
      box.innerHTML='<svg viewBox="0 0 170 48" aria-hidden="true"><path d="M0 35H170M17 0V48M51 0V48M85 0V48M119 0V48M153 0V48" stroke="currentColor" fill="none" opacity=".15"/><path d="m7 32 38-2 38-8 38-1 38-12" stroke="currentColor" fill="none" stroke-dasharray="3 5"/><g fill="currentColor"><circle cx="7" cy="32" r="3"/><circle cx="45" cy="30" r="3"/><circle cx="83" cy="22" r="3"/><circle cx="121" cy="21" r="3"/><circle cx="159" cy="9" r="3"/></g></svg>';
      node('h3','',t('Your first point starts the story.'),box);node('p','',t('Record the signed offset. Return on another day to discover your watch’s rhythm.'),box);return;
    }
    const readings=currentPeriod.readings,first=readings[0],last=readings.at(-1);
    let start=currentPeriod.start??first.at,end=last.at;
    if(end-start<3600000){start-=1800000;end+=1800000;}
    const width=540,height=200,left=49,right=13,top=23,bottom=30;
    const fitValues=stats.slope===null?[]:[Math.abs(stats.intercept),Math.abs(stats.intercept+stats.slope*stats.spanDays)];
    const maximum=Math.max(1,...readings.map(reading=>Math.abs(reading.offsetSeconds)),...fitValues)*1.25;
    const x=at=>left+(at-start)/(end-start)*(width-left-right),y=value=>top+(maximum-value)/(2*maximum)*(height-top-bottom);
    const svg=svgNode('svg',{viewBox:`0 0 ${width} ${height}`,role:'group','aria-label':t('Offset history in seconds. Activate a point to edit its observation.'),preserveAspectRatio:'none'},holder);
    for(const value of [-maximum,0,maximum]){
      svgNode('line',{x1:left,y1:y(value),x2:width-right,y2:y(value),stroke:'var(--line)',...(value===0?{'data-zero':''}:{})},svg);
      svgNode('text',{x:left-8,y:y(value)+3,'text-anchor':'end'},svg,signed(value,maximum<2?1:0));
    }
    svgNode('text',{x:left,y:11},svg,t('Offset (s)'));
    svgNode('text',{x:left,y:height-7,'text-anchor':'start'},svg,shortDates.format(start));
    svgNode('text',{x:width-right,y:height-7,'text-anchor':'end'},svg,shortDates.format(end));
    if(currentPeriod.marker){svgNode('line',{x1:x(currentPeriod.start),x2:x(currentPeriod.start),y1:top,y2:height-bottom,stroke:'var(--muted)','stroke-dasharray':'2 5'},svg);}
    if(readings.length>1)svgNode('path',{d:readings.map((reading,i)=>`${i?'L':'M'}${x(reading.at)} ${y(reading.offsetSeconds)}`).join(' '),stroke:'var(--accent-text)','stroke-width':'1.5',opacity:'.45',fill:'none'},svg);
    if(stats.slope!==null){const a=stats.intercept,b=stats.intercept+stats.slope*stats.spanDays;svgNode('path',{d:`M${x(first.at)} ${y(a)}L${x(last.at)} ${y(b)}`,stroke:'var(--accent-text)','stroke-width':'1.5','stroke-dasharray':'6 4',fill:'none'},svg);}
    for(const reading of readings){
      const label=t('Measurement on {0}: {1} seconds',dates.format(reading.at),signed(reading.offsetSeconds,3));
      const circle=svgNode('circle',{cx:x(reading.at),cy:y(reading.offsetSeconds),r:4,class:'wa-reading',tabindex:'0',role:'button','aria-label':label},svg);
      svgNode('title',{},circle,label);
      circle.addEventListener('click',()=>editEntry(reading.id));circle.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();editEntry(reading.id);}});
    }
  }
  function overview(){
    $('name').textContent=watches.get(watch)?.name||'';
    $('name').title=watches.get(watch)?.name||'';
    $('quality').textContent=t({readings:'Baseline needed',window:'Short window',early:'Early estimate',trend:'Observed trend'}[stats.status]);
    $('offset').textContent=stats.latest?t('{0} s',signed(stats.latest.offsetSeconds,3)):'—';
    $('last-date').textContent=stats.latest?`${dates.format(stats.latest.at)} UTC`:t('No readings yet');
    $('drift').textContent=stats.slope===null?'—':t('≈ {0} s/day',signed(stats.slope,stats.digits));
    $('sample').textContent=t('{0} readings · {1} days',numeric(stats.count,0),numeric(stats.spanDays,1));
    $('predicted').textContent=stats.predicted===null?'—':t('≈ {0} s',signed(stats.predicted,1));
    $('analysis').textContent=t({readings:'Add at least two readings, 24 hours apart. A correction is not a zero-offset measurement.',window:'These readings span less than 24 hours. Keep observing before estimating daily drift.',early:'An early estimate from this period only. More days and repeated readings give better context.',trend:'The dashed line fits this period’s readings. It describes the observations, not a certified accuracy rating.'}[stats.status]);
    const spread=[];
    if(stats.slope!==null&&stats.count>=3)spread.push(t('Scatter around the trend: {0} s',numeric(stats.scatter,1)));
    if(new Set(currentPeriod.readings.map(reading=>reading.reference.kind)).size>1)spread.push(t('Mixed reference checks: review the journal.'));
    $('spread').textContent=spread.join(' · ');$('spread').hidden=!spread.length;
    for(const id of ['offset','drift','predicted'])$(id).style.fontSize=$(id).textContent.length>12?'18px':'';
    plot();
  }
  function journal(){
    const list=$('records');list.replaceChildren();const records=watchEntries().slice().sort((a,b)=>b.at-a.at||a.id.localeCompare(b.id));
    $('record-count').textContent=t('{0} records',numeric(records.length,0));
    if(!records.length){const box=node('div','wa-plot-empty',null,list);node('h3','',t('No readings yet'),box);node('p','',t('Your measurements and correction events will appear here.'),box);}
    for(const entry of records){
      const row=node('article','wa-record',null,list);row.dataset.record=entry.id;
      const heading=node('div','',null,row);node('h3','',entry.type==='measurement'?t('Offset: {0} s',signed(entry.offsetSeconds,3)):t(eventLabels[entry.type]),heading);
      const time=node('time','',`${dates.format(entry.at)} UTC`,heading);time.dateTime=new Date(entry.at).toISOString();
      const actions=node('div','wa-record-actions',null,row);
      action(t('Edit'),actions,()=>editEntry(entry.id));action(t('Delete'),actions,()=>{deleting=entry.id;journal();});
      if(entry.type==='measurement'){
        const conditions=[refText(entry.reference),t('Reading step: {0} s',numeric(entry.readingStep,1))];
        if(entry.conditions.wear)conditions.push(t(entry.conditions.wear==='worn'?'Worn':'Resting'));
        if(entry.conditions.position)conditions.push(entry.conditions.position);
        if(entry.conditions.temperature!==null)conditions.push(t('{0} °C',numeric(entry.conditions.temperature,1)));
        node('p','',conditions.join(' · '),row);
      }else node('p','',t('Starts a new period; no zero offset is assumed.'),row);
      if(entry.sourceTrialId){
        if(getData().history.some(trial=>trial.id===entry.sourceTrialId)){const link=action(t('Linked GET trial ↗'),row,()=>goTo('trial',entry.sourceTrialId));link.dataset.trial=entry.sourceTrialId;}
        else node('p','',t('The source trial was removed from History.'),row);
      }
      if(entry.note){const note=node('p','',entry.note,row);note.setAttribute('translate','no');}
      if(deleting===entry.id){
        const confirm=node('div','wa-delete-check',null,row);node('span','',t(entry.type==='measurement'?'Remove this observation?':'Removing this event merges the adjacent observation periods.'),confirm);
        action(t('Delete permanently'),confirm,()=>{if(save(entries().filter(item=>item.id!==entry.id))){removed=entry;deleting=null;if(draft().editing===entry.id)drafts.set(watch,newDraft());render();}}).dataset.action='confirm-delete';
        action(t('Cancel'),confirm,()=>{deleting=null;journal();});
      }
    }
  }
  function formMode(){
    const data=draft(),measurement=data.type==='measurement';
    $('measure-fields').hidden=!measurement;$('event-hint').hidden=measurement;
    $('capture-status').textContent=measurement?refText(data.reference):t('Check the actual correction time before saving this event.');
    $('form-title').textContent=t(data.editing?'Edit observation':'New observation');$('cancel').hidden=!data.editing;
    $('save').textContent=t(data.editing?'Save changes':measurement?'Save observation':'Save correction event');
    $('save').disabled=!archive||!watch;
    $('form-status').textContent=!archive?t('The saved accuracy archive could not be read. Export or recover the original data before recording changes.'):localizeStoredMessage(data.status)||'';
    $('form-status').classList.toggle('error',Boolean(data.error)||!archive);
    if(data.error)$('form-status').scrollIntoView({block:'nearest'});
  }
  function form(){
    const data=draft();
    for(const[id,key]of Object.entries({kind:'type',at:'at',value:'offset',step:'step',wear:'wear',position:'position',temperature:'temperature',note:'note'}))$(id).value=data[key];
    for(const option of $('step').options)option.textContent=t('{0} s',numeric(Number(option.value),1));
    $('conditions').open=data.conditionsOpen;formMode();
  }
  function render(){
    if(!visible)return;
    fillWatches();selectPeriods();const empty=!watch;
    $('empty').hidden=!empty;$('workspace').hidden=empty;$('period').hidden=empty;
    for(const name of ['overview','journal']){const active=tab===name;$('tab-'+name).setAttribute('aria-selected',String(active));$('tab-'+name).tabIndex=active?0:-1;$(name).hidden=!active;}
    $('undo').hidden=!removed;$('recover').hidden=Boolean(archive);
    if(!archive&&empty){$('empty').querySelector('p').textContent=t('The saved accuracy archive could not be read. Export or recover the original data before recording changes.');}
    if(empty)return;
    overview();journal();form();tick();
    $('export-json').disabled=!archive||!watchEntries().length;$('export-csv').disabled=$('export-json').disabled;
  }
  function tick(){
    if(!visible||!watch)return;
    const now=getNow();$('clock').textContent=clock.format(now);$('local-clock').textContent=localClock.format(now);
    const source=referenceAt(getData().reference,now,now);
    $('live-source').textContent=source.kind==='ntp'?t('NTP verified · ±{0} ms',numeric(Math.ceil(source.uncertaintyMs),0)):t('System clock · unverified');
    $('check').disabled=getData().locked;
    if(stats){const current=summarizeAccuracy(currentPeriod,now);$('predicted').textContent=current.predicted===null?'—':t('≈ {0} s',signed(current.predicted,1));$('predicted').style.fontSize=$('predicted').textContent.length>12?'18px':'';}
  }
  function editEntry(id){
    const entry=entries().find(item=>item.id===id&&item.profileId===watch);if(!entry)return;
    drafts.set(watch,{type:entry.type,at:atInput(entry.at),offset:entry.type==='measurement'?String(entry.offsetSeconds):'',step:String(entry.readingStep||1),wear:entry.conditions?.wear||'',position:entry.conditions?.position||'',temperature:entry.conditions?.temperature??'',note:entry.note,reference:entry.reference||{kind:'manual'},editing:entry.id,sourceTrialId:entry.sourceTrialId||null,conditionsOpen:Boolean(entry.conditions?.position||entry.conditions?.wear||entry.conditions?.temperature!=null),status:''});
    form();$('form-title').scrollIntoView({block:'nearest'});$(entry.type==='measurement'?'value':'at').focus({preventScroll:true});
  }
  function chooseTab(value){tab=value;render();}
  for(const name of ['overview','journal']){
    $('tab-'+name).addEventListener('click',()=>chooseTab(name));
    $('tab-'+name).addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?'overview':event.key==='End'?'journal':name==='overview'?'journal':'overview';chooseTab(next);$('tab-'+next).focus();}});
  }
  $('watch').addEventListener('change',()=>{watch=$('watch').value;periodId=null;deleting=null;render();});
  $('period').addEventListener('change',()=>{periodId=$('period').value;render();});
  for(const[id,key]of Object.entries({kind:'type',at:'at',value:'offset',step:'step',wear:'wear',position:'position',temperature:'temperature',note:'note'})){
    $(id).addEventListener('input',()=>{const data=draft();if(id==='at'&&data.at!==$('at').value)data.reference={kind:'manual'};data[key]=$(id).value;data.status='';data.error=false;if(id==='kind'||id==='at')formMode();});
    if(['kind','step','wear'].includes(id))$(id).addEventListener('change',()=>{draft()[key]=$(id).value;formMode();});
  }
  $('conditions').addEventListener('toggle',()=>{if(watch)draft().conditionsOpen=$('conditions').open;});
  $('capture').addEventListener('click',()=>{const now=getNow(),data=draft();data.at=atInput(now);data.reference=referenceAt(getData().reference,now,now);$('at').value=data.at;data.status='';data.error=false;formMode();});
  $('cancel').addEventListener('click',()=>{drafts.set(watch,newDraft());form();});
  $('form').addEventListener('submit',event=>{
    event.preventDefault();const data=draft();let entry;
    try{
      entry=makeAccuracyEntry({profileId:watch,watchName:watches.get(watch).name,type:data.type,at:inputTime(data.at),offsetSeconds:data.offset,readingStep:Number(data.step),note:data.note,reference:data.reference,sourceTrialId:data.sourceTrialId,conditions:{wear:data.wear,position:data.position,temperature:data.temperature}}, {now:getNow(),...(data.editing?{id:data.editing}:{})});
      if(entries().some(item=>item.id!==entry.id&&item.profileId===watch&&entry.type==='measurement'&&item.type==='measurement'&&item.at===entry.at))throw Error('duplicate');
      if(entry.sourceTrialId&&entries().some(item=>item.id!==entry.id&&item.profileId===watch&&item.sourceTrialId===entry.sourceTrialId))throw Error('trial');
    }catch(error){data.error=true;data.status=t({date:'Choose a valid UTC date that is not in the future.',offset:'Enter a signed offset between −86400 and +86400 seconds.',temperature:'Enter a temperature between −50 and +80 °C, or leave it blank.',duplicate:'A measurement already exists at this time. Edit it in the journal.',trial:'This GET trial already has a correction event in the journal.'}[error.message]||'Choose a watch and a valid observation.');formMode();return;}
    const next=entries().filter(item=>item.id!==entry.id);next.push(entry);
    if(save(next)){drafts.set(watch,newDraft());periodId=accuracyPeriods(next,watch).find(period=>period.entries.some(item=>item.id===entry.id))?.id||null;render();notify(t('Observation saved.'));}
  });
  $('undo').addEventListener('click',()=>{if(removed&&!entries().some(item=>item.id===removed.id)&&save([...entries(),removed])){removed=null;periodId=null;render();}});
  $('check').addEventListener('click',async()=>{$('check').disabled=true;await checkTime();tick();});
  $('lab').addEventListener('click',()=>openLab(watch,watches.get(watch)?.name));
  function download(format){
    if(!archive)return;const records=watchEntries();if(!records.length)return;
    const text=format==='json'?JSON.stringify({version:1,exportedAt:new Date(getNow()).toISOString(),watch:{id:watch,name:watches.get(watch).name},entries:records},null,2):'\uFEFF'+accuracyCSV(records);
    downloadText(text,format);
  }
  function downloadText(text,format){
    const url=URL.createObjectURL(new Blob([text],{type:format==='json'?'application/json':'text/csv;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download=`AtomicClockSync-accuracy-${new Date(getNow()).toISOString().slice(0,10)}.${format}`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
  }
  $('recover').addEventListener('click',()=>downloadText(originalData,'json'));
  $('export-json').addEventListener('click',()=>download('json'));$('export-csv').addEventListener('click',()=>download('csv'));
  onLanguageChange(render);
  setInterval(()=>{const second=Math.floor(getNow()/1000);if(second!==lastTick){lastTick=second;tick();}},250);
  return {
    setVisible(value){visible=value;if(value)render();},refresh:render,
    openWatch(id){watch=id;periodId=null;},
    openForTrial(trial){
      if(trial?.outcome!=='get'||!trial.snapshot?.profileId)return false;
      watch=trial.snapshot.profileId;periodId=null;
      drafts.set(watch,{...newDraft(),type:'synchronization',at:atInput(trial.endedAt||trial.at),sourceTrialId:trial.id,status:t('GET reported by you. Confirm when the watch actually corrected its time; a zero offset is not assumed.')});
      return true;
    }
  };
}
