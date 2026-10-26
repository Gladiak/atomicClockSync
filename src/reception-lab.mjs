import { t, dateTimeFormat, numberFormat, onLanguageChange, localizeStoredMessage } from './i18n.mjs';
import { CHANNEL_LABELS, WAVE_LABELS } from './trials.mjs';
import { STATIONS } from './stations.mjs';
import { LAB_FIELDS, baselineIssue, trialValues, filterTrials, summarizeTrials, compareTrials, prepareTrial } from './reception-lab-data.mjs';

const dates=dateTimeFormat({day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
const numbers=numberFormat({maximumFractionDigits:0});
const percent=numberFormat({style:'percent',maximumFractionDigits:0});
function el(tag,className,text,parent){const node=document.createElement(tag);if(className)node.className=className;if(text!=null)node.textContent=text;parent?.append(node);return node;}
function button(text,parent,click,className='text-button'){const node=el('button',className,text,parent);node.type='button';node.addEventListener('click',click);return node;}
const outcome=trial=>trial?.outcome==='get'?'GET':trial?.outcome==='err'?'ERR':t('Not verified');
const rate=value=>value===null?'—':percent.format(value);
function valueText(key,value,trial){
  if(value===''||value==null)return t('Not recorded');
  if(key==='stationId')return STATIONS.find(station=>station.id===value)?.name||value;
  if(key==='channel')return t(CHANNEL_LABELS[value]);
  if(key==='wave')return t(WAVE_LABELS[value]);
  if(key==='volume'||key==='systemVolume')return `${numbers.format(Number(value))}%`;
  if(key==='duration')return t('{0} minutes',numbers.format(value));
  if(key==='advanceMs')return `${numbers.format(value)} ms`;
  if(key==='deviceId')return localizeStoredMessage(trial?.snapshot?.deviceLabel)||t('Not recorded');
  return String(value);
}
const verdicts={select:'Choose two different trials to compare.',missing:'This older trial has no recorded audio settings.',watch:'Different or unlinked watches: these results are not a controlled comparison.',unstable:'Volume changed or audio was interrupted: compare with caution.',notes:'Placement or system volume was not noted. Other conditions may have changed.',one:'One recorded setting differs. Check the real conditions before drawing conclusions.',same:'The recorded settings match. Reception can still vary between attempts.',many:'Several recorded settings differ. Change one at a time in your next trial.'};

export function createReceptionLab({getData,openTrial,prepare,goTo}){
  const $=id=>document.getElementById(`rl-${id}`);
  let visible=false,watch='all',station='all',tab='overview',left=null,right=null,baseline=null,field='volume',draft=null;
  let currentTrials=[],currentStats=null;
  let requestedWatch=null;
  function option(select,label,value){select.append(new Option(label,value));}
  function trialLabel(trial){return `${dates.format(trial.at)} · ${trial.snapshot?.watch.name||t('Not linked')} · ${outcome(trial)}`;}
  function fillTrials(select,trials,selection){select.replaceChildren();for(const trial of trials)option(select,trialLabel(trial),trial.id);select.value=selection||'';select.disabled=!trials.length;}
  function defaultDraft(trial){const value=trial.snapshot.settings[field];return field==='volume'?Math.min(80,value+(value<80?5:-5)):field==='channel'?(value==='left'?'right':'left'):field==='wave'?(value==='sine'?'square':'sine'):value===10?15:10;}
  function chooseTab(value){tab=value;render();}
  function empty(parent){const box=el('div','rl-empty',null,parent);el('h3','',t('Every good signal starts with a trial.'),box);el('p','',t('Transmit, check GET or ERR on your watch, then save the outcome in History. Your observations will appear here.'),box);button(t('Start a trial →'),box,()=>goTo('sync'),'secondary-button');}
  function overview(){
    const content=$('overview');content.replaceChildren();
    const panel=el('section','rl-config-panel panel',null,content);el('span','rl-overline',t('YOUR RECORDED CONFIGURATIONS'),panel);el('h2','',t('What has worked for your watches?'),panel);
    const list=el('div','rl-config-list',null,panel);list.setAttribute('aria-label',t('Recorded configurations'));
    if(!currentStats.configurations.length)empty(list);
    for(const group of currentStats.configurations){
      const trial=group.trial,settings=trial.snapshot.settings,row=el('article','rl-group',null,list),info=el('div','',null,row);
      el('h3','',trial.snapshot.watch.name||t('Not linked'),info);
      el('p','',`${valueText('stationId',settings.stationId)} · ${valueText('channel',settings.channel)} · ${valueText('wave',settings.wave)}`,info);
      el('p','',`${valueText('volume',settings.volume)} · ${valueText('duration',settings.duration)} · ${valueText('deviceId',settings.deviceId,trial)}`,info);
      el('p','',`${t('Placement')}: ${trial.snapshot.watch.position||t('Not recorded')} · ${t('System volume note')}: ${valueText('systemVolume',trial.snapshot.watch.systemVolume,trial)}`,info);
      const actions=el('div','',null,info);button(t('Inspect trial ↗'),actions,()=>openTrial(trial.id));
      const result=el('div','rl-group-result',rate(group.rate),row);el('small','',`${numbers.format(group.get)} GET / ${numbers.format(group.verified)} ${t('verified')}`,result);
      const bar=el('div','rl-bar',null,result);const good=el('i','',null,bar),bad=el('b','',null,bar);good.style.width=`${(group.rate??0)*100}%`;bad.style.width=`${group.rate===null?0:(1-group.rate)*100}%`;
      el('small','',group.verified<3?t('Small sample'):t('Observed outcomes'),result);
      if(group.unverified)el('small','',t('{0} not verified',numbers.format(group.unverified)),result);
    }
    const notes=el('aside','rl-notes panel',null,content);
    el('span','rl-overline',t('OBSERVE · COMPARE · REPEAT'),notes);
    // A decorative instrument, never a live field-strength measurement.
    const instrument=el('div','rl-instrument',null,notes);instrument.setAttribute('aria-hidden','true');
    instrument.innerHTML='<svg viewBox="0 0 300 80" width="100%" height="100%"><g fill="none" stroke="currentColor"><path opacity=".16" d="M0 20H300M0 40H300M0 60H300M30 0V80M90 0V80M150 0V80M210 0V80M270 0V80"/><path opacity=".8" d="M0 40H44L51 32 59 48 67 14 75 66 83 28 91 46 99 40H156L164 28 172 52 180 8 188 72 196 22 204 49 212 40H300"/></g><circle cx="180" cy="8" r="3" fill="currentColor"/></svg>';
    el('h2','',t('A notebook, with evidence.'),notes);
    el('p','',t('GET rate uses only the GET and ERR outcomes you entered. Unverified trials never count as failures.'),notes);
    el('p','',t('Groups keep watches and recorded settings separate. The largest verified samples appear first; a high rate is not a reception guarantee.'),notes);
    button(t('Compare two trials →'),notes,()=>chooseTab('compare'));
    const excluded=currentStats.excluded,detail=el('div','rl-exclusions',null,notes);
    el('div','',t('Excluded from configuration groups:'),detail);
    el('div','',t('{0} missing settings · {1} interrupted · {2} variable volume',numbers.format(excluded.missing),numbers.format(excluded.interrupted),numbers.format(excluded.volume)),detail);
    el('div','',t('Unlinked watches are never pooled together.'),detail);
  }
  function comparison(){
    const result=compareTrials(currentTrials.find(item=>item.id===left),currentTrials.find(item=>item.id===right));
    const table=$('comparison');table.replaceChildren();
    $('verdict').textContent=t(verdicts[result.kind]);
    if(!currentTrials.length){empty(table);return;}
    const a=currentTrials.find(item=>item.id===left),b=currentTrials.find(item=>item.id===right);
    if(!a||!b)return;
    const grid=el('table','',null,table),body=el('tbody','',null,grid);
    const rows=[['Observed outcome',outcome(a),outcome(b)],['Watch',a.snapshot?.watch.name||t('Not linked'),b.snapshot?.watch.name||t('Not linked')],...LAB_FIELDS.map(([key,label])=>[label,valueText(key,trialValues(a)?.[key],a),valueText(key,trialValues(b)?.[key],b),result.differences.includes(key)]),['Actual transmission',t('{0} seconds',numbers.format(a.seconds)),t('{0} seconds',numbers.format(b.seconds))]];
    for(const [label,x,y,diff]of rows){const row=el('tr',diff?'rl-different':'',null,body),head=el('th','',t(label),row);head.scope='row';el('td','',x,row);el('td','',y,row);}
  }
  function prepareForm(){
    const trial=currentTrials.find(item=>item.id===baseline);
    $('prepare-fields').hidden=!trial;$('prepare-context').replaceChildren();
    if(!trial){
      $('delta').textContent='—';$('prepare-status').textContent='';$('apply').disabled=true;
      if(!currentTrials.length)empty($('prepare-context'));
      else {
        const box=el('div','rl-empty',null,$('prepare-context'));
        el('h3','',t('No stable baseline in this selection.'),box);
        el('p','',t('Choose a trial with recorded settings, uninterrupted audio and no volume changes. Other trials remain available in Compare A/B.'),box);
        button(t('Start a trial →'),box,()=>goTo('sync'),'secondary-button');
      }
      return;
    }
    const original=trial.snapshot.settings;
    if(draft===null)draft=defaultDraft(trial);
    const holder=$('value-holder');holder.replaceChildren();
    const label=el('label','',t('New value'),holder);
    const input=el(field==='volume'?'input':'select','',null,label);input.id='rl-value';
    if(field==='volume'){input.type='number';input.min='5';input.max='80';input.step='1';}
    else for(const value of field==='channel'?['both','left','right']:field==='wave'?(original.stationId==='dcf77'?['sine','sine-gated','square']:['sine','square']):[5,10,15])option(input,valueText(field,value,trial),String(value));
    input.value=String(draft);input.addEventListener('input',()=>{draft=input.value;updatePrepared();});input.addEventListener('change',()=>{draft=input.value;updatePrepared();});
    const context=$('prepare-context');el('span','rl-overline',t('BASELINE CONDITIONS'),context);el('h2','',trial.snapshot.watch.name||t('Not linked'),context);
    el('p','',trialLabel(trial),context);const facts=el('dl','',null,context);
    for(const key of ['stationId','deviceId','channel','wave','position','systemVolume']){const box=el('div','',null,facts);el('dt','',t(LAB_FIELDS.find(([id])=>id===key)[1]),box);el('dd','',valueText(key,trialValues(trial)[key],trial),box);}
    el('p','rl-warning',t('Check the watch, output, placement and system volume against the baseline. Saved profiles are not overwritten.'),context);
    el('p','',t('Default output can refer to a different physical device. Handwritten notes and actual duration do not prove identical conditions.'),context);
    updatePrepared();
  }
  function updatePrepared(){
    const trial=currentTrials.find(item=>item.id===baseline),data=getData();let settings=null;
    try{settings=prepareTrial(trial,field,draft);}catch{/* Invalid or unchanged proposals stay disabled. */}
    const archived=trial?.snapshot.profileId&&!data.profiles.some(profile=>profile.id===trial.snapshot.profileId);
    $('delta').textContent=trial?`${valueText(field,trial.snapshot.settings[field],trial)} → ${valueText(field,draft,trial)}`:'—';
    $('apply').disabled=!settings||data.locked||Boolean(archived);
    $('prepare-status').textContent=t(data.locked?'Stop transmission before preparing a trial.':archived?'This baseline belongs to a removed watch profile. Choose a current profile’s trial.':settings?'One audio setting will change. Transmission starts only when you press Start.':'Choose a different valid value.');
  }
  function render(){
    if(!visible)return;
    const data=getData(),watches=new Map(data.profiles.map(profile=>[profile.id,profile.name]));
    for(const trial of data.history)if(trial.snapshot?.profileId&&!watches.has(trial.snapshot.profileId))watches.set(trial.snapshot.profileId,trial.snapshot.watch.name||t('Archived watch'));
    if(requestedWatch&&!watches.has(requestedWatch.id))watches.set(requestedWatch.id,requestedWatch.name||t('Archived watch'));
    if(watch!=='all'&&watch!=='unlinked'&&!watches.has(watch))watch='all';
    const select=$('watch');select.replaceChildren();option(select,t('All watches'),'all');option(select,t('Unlinked trials'),'unlinked');for(const[id,name]of watches)option(select,name,id);select.value=watch;
    currentTrials=filterTrials(data.history,watch,station);currentStats=summarizeTrials(currentTrials);
    $('rate').textContent=rate(currentStats.rate);$('verified').textContent=numbers.format(currentStats.verified);$('unverified').textContent=numbers.format(currentStats.counts.unverified);$('configs').textContent=numbers.format(currentStats.configurations.length);
    for(const node of document.querySelectorAll('[data-lab-tab]')){const active=node.dataset.labTab===tab;node.setAttribute('aria-selected',String(active));node.tabIndex=active?0:-1;}
    for(const name of ['overview','compare','prepare'])$(name).hidden=name!==tab;
    if(!currentTrials.some(item=>item.id===left))left=currentTrials[0]?.id;
    if(!currentTrials.some(item=>item.id===right))right=currentTrials.find(item=>item.id!==left)?.id;
    const eligible=currentTrials.filter(item=>!baselineIssue(item));
    if(!eligible.some(item=>item.id===baseline)){baseline=eligible[0]?.id;draft=null;}
    fillTrials($('left'),currentTrials,left);fillTrials($('right'),currentTrials,right);fillTrials($('baseline'),eligible,baseline);
    $('station').querySelector('[value=all]').textContent=t('All stations');
    $('field').value=field;
    if(tab==='overview')overview();else if(tab==='compare')comparison();else prepareForm();
    $('open-left').disabled=!left;$('open-right').disabled=!right;
  }
  $('watch').addEventListener('change',()=>{watch=$('watch').value;left=right=baseline=null;draft=null;render();});
  $('station').addEventListener('change',()=>{station=$('station').value;left=right=baseline=null;draft=null;render();});
  for(const node of document.querySelectorAll('[data-lab-tab]')){
    node.addEventListener('click',()=>chooseTab(node.dataset.labTab));
    node.addEventListener('keydown',event=>{const tabs=[...document.querySelectorAll('[data-lab-tab]')],i=tabs.indexOf(node);let next=null;if(event.key==='ArrowRight')next=tabs[(i+1)%tabs.length];if(event.key==='ArrowLeft')next=tabs[(i+tabs.length-1)%tabs.length];if(event.key==='Home')next=tabs[0];if(event.key==='End')next=tabs.at(-1);if(next){event.preventDefault();chooseTab(next.dataset.labTab);next.focus();}});
  }
  $('left').addEventListener('change',()=>{left=$('left').value;comparison();});$('right').addEventListener('change',()=>{right=$('right').value;comparison();});
  $('open-left').addEventListener('click',()=>openTrial(left));$('open-right').addEventListener('click',()=>openTrial(right));
  $('baseline').addEventListener('change',()=>{baseline=$('baseline').value;draft=null;prepareForm();});
  $('field').addEventListener('change',()=>{field=$('field').value;draft=null;prepareForm();});
  $('apply').addEventListener('click',()=>{const trial=currentTrials.find(item=>item.id===baseline);try{const settings=prepareTrial(trial,field,draft);if(!getData().locked)prepare(trial,settings);}catch{updatePrepared();}});
  onLanguageChange(render);
  return {setVisible(value){visible=value;if(value)render();},refresh:render,openWatch(id,name){watch=id;requestedWatch={id,name};left=right=baseline=null;draft=null;}};
}
