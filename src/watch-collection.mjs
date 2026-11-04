import {createWatchPhotoPicker} from './watch-photo-picker.mjs';
import {photoDataBlob} from './watch-photo-frame.mjs';
import {t,dateTimeFormat,numberFormat,onLanguageChange} from './i18n.mjs';
import {watchOverview} from './now-view.mjs';
import {normalizeWatchDetails,compactWatchPhoto} from './watch-collection-data.mjs';
import {compareWatchModel} from './watch-spec-data.mjs';
import {renderWatchSpecs,modelCheck,modelMessages} from './watch-spec-view.mjs';
import {getStation} from './stations.mjs';
const node=(tag,cls,text,parent)=>{const el=document.createElement(tag);el.className=cls;if(text!=null)el.textContent=text;parent?.append(el);return el;};
export function createWatchCollection({getData,getNow,getAccuracy,selectWatch,editWatch,openAccuracy,openLab,openHistory,getLocked,desktop}) {
  const $=id=>document.getElementById('collection-'+id);
  let visible=false,draftPhoto='',draftSource=null,draftSpecs=null,photoVersion=0,pending=0,returnFocus=null,editorView='details',detailsScroll=0,detailsFocus=null;
  const editor=document.getElementById('profile-editor-dialog');
  const searchable=value=>value.normalize('NFKD').replace(/\p{M}/gu,'').toLocaleLowerCase();
  function photo(parent,src){if(src){const img=node('img','watch-photo',null,parent);img.src=src;img.alt=t('Watch photo');}else{const mark=node('div','watch-placeholder','◷',parent);mark.setAttribute('aria-hidden','true');}}
  function refresh(){
    if(!visible)return;
    const data=getData(),focused=document.activeElement,focus=focused?.dataset.watchId,focusAction=focused?.dataset.watchAction;
    const query=searchable($('search').value.trim());
    const matches=data.profiles.filter(profile=>searchable(profile.name+' '+profile.model).includes(query));
    $('watches').replaceChildren();$('empty').hidden=matches.length>0;
    $('empty').textContent=t(data.profiles.length?'No watches match your search.':'Save your first watch and make this space yours.');
    for(const profile of matches){
      const card=node('article','watch-card panel',null,$('watches'));card.dataset.watchId=profile.id;
      const details=normalizeWatchDetails(profile.details),summary=watchOverview(profile,data.history,getAccuracy(),getNow());
      const select=node('button','watch-card-select',null,card);select.type='button';select.dataset.watchId=profile.id;
      select.dataset.watchAction='edit';select.setAttribute('aria-haspopup','dialog');select.disabled=getLocked();
      const active=data.activeProfileId===profile.id;
      const activate=node('button','watch-card-active',null,card);activate.type='button';activate.dataset.watchId=profile.id;activate.dataset.watchAction='activate';
      activate.setAttribute('aria-pressed',String(active));activate.setAttribute('aria-label',t(active?'Active watch: {0}':'Use {0} as active watch',profile.name));activate.title=t(active?'Active watch':'Use this watch');activate.disabled=getLocked();
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');
      const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d','M8 6l1-4h6l1 4M8 18l1 4h6l1-4M9 12l2 2 4-4');
      const frame=document.createElementNS(svg.namespaceURI,'rect');for(const [key,value]of Object.entries({x:6,y:6,width:12,height:12,rx:3}))frame.setAttribute(key,value);svg.append(frame,path);activate.append(svg);
      activate.onclick=()=>{if(!getLocked()&&!active)selectWatch(profile.id);};
      photo(select,details.photo);
      const caption=node('div','watch-card-caption',null,select);node('strong','',profile.name,caption);node('span','muted-text',profile.model||getStation(profile.settings.stationId).name,caption);
      select.onclick=()=>{if(!getLocked()){editWatch(profile.id);openEditor(select);}};
      const facts=node('div','watch-card-facts',null,card);
      node('span','muted-text',summary.last?t('GET · {0}',dateTimeFormat({day:'2-digit',month:'short',year:'numeric'}).format(summary.last.at)):t('No confirmed reception yet'),facts);
      node('span','muted-text',summary.drift===null?t('More readings needed'):t('{0} s/day',numberFormat({maximumFractionDigits:summary.stats.digits,signDisplay:'exceptZero'}).format(summary.drift)),facts);
      if(details.acquiredAt)node('span','muted-text',t('Acquired · {0}',dateTimeFormat({timeZone:'UTC',day:'numeric',month:'short',year:'numeric'}).format(Date.parse(details.acquiredAt+'T00:00:00Z'))),facts);
      if(details.note)node('p','watch-personal-note',details.note,card);
      if(details.photoSource){const credit=node('button','text-button watch-photo-credit',t('Photo: ShockBase · Casio ↗'),card);credit.onclick=()=>desktop.openWatchPhotoSource(details.photoSource.pageURL);}
      const actions=node('div','watch-card-actions',null,card);
      const find=node('button','text-button',t('Find photo on ShockBase'),actions);find.disabled=getLocked()||!profile.model;
      find.onclick=()=>{if(getLocked())return;editWatch(profile.id);openEditor(find);document.querySelector('.watch-personal-details').open=true;picker.open();};
      const sheet=node('button','text-button watch-card-specs',t('Technical sheet'),actions);sheet.disabled=getLocked();sheet.onclick=()=>{if(getLocked())return;editWatch(profile.id);openEditor(sheet,'specs');};
      for(const [label,handler]of [['Watch Accuracy',()=>openAccuracy(profile.id)],['Reception Lab',()=>openLab(profile.id,profile.name)],['History',()=>openHistory(profile.id)]]){const button=node('button','text-button',t(label),actions);button.onclick=handler;}
    }
    if(focus)[...$('watches').querySelectorAll('button[data-watch-id]')].find(button=>button.dataset.watchId===focus&&button.dataset.watchAction===focusAction)?.focus({preventScroll:true});
  }
  const modelInput=document.getElementById('profile-model');
  function mismatches(){
    const sources=[draftSpecs?{model:draftSpecs.model,match:modelCheck(modelInput.value,draftSpecs)}:null,draftSource?{model:draftSource.model,match:compareWatchModel(modelInput.value,draftSource.model)}:null].filter(Boolean);
    return sources.filter(item=>!item.match.compatible);
  }
  function paintCheck(){
    const issues=mismatches();$('model-check').hidden=!issues.length;
    $('model-check').classList.toggle('is-mismatch',Boolean(issues.length));
    $('model-message').textContent=issues.map(item=>item.model+' · '+t(modelMessages[item.match.status])).join(' ');
    $('use-model').hidden=!issues.length||new Set([draftSpecs?.model,draftSource?.model].filter(Boolean)).size>1;
  }
  function paintSpecs(){
    renderWatchSpecs($('spec-content'),draftSpecs,desktop);$('spec-remove').hidden=!draftSpecs;
    const label=t(draftSpecs?'Update from ShockBase':'Import from ShockBase');
    $('spec-import').setAttribute('aria-label',label);$('spec-import').title=label;
    $('spec-hint').textContent=draftSpecs?draftSpecs.model:t('Import from ShockBase');paintCheck();
  }
  function showEditorView(view,focus=true){
    const sheet=view==='specs',wasSheet=editorView==='specs',body=document.getElementById('profile-editor-body');
    if(sheet&&!wasSheet){detailsScroll=body.scrollTop;detailsFocus=document.activeElement;}
    editorView=view;
    $('editor-fields').hidden=sheet;$('spec-panel').hidden=!sheet;
    $('spec-navigation').hidden=!sheet;$('spec-actions').hidden=!sheet;
    document.getElementById('profile-editor-picker').hidden=sheet;
    editor.setAttribute('aria-labelledby',sheet?'collection-spec-title':'profile-form-title');
    body.scrollTop=sheet?0:wasSheet?detailsScroll:body.scrollTop;
    if(focus&&editor.open){
      const previous=detailsFocus?.isConnected&&!detailsFocus.disabled&&$('editor-fields').contains(detailsFocus)?detailsFocus:$('spec-open');
      (sheet?$('spec-back'):previous).focus({preventScroll:true});
    }
  }
  $('spec-open').onclick=()=>{if(!getLocked())showEditorView('specs');};
  $('spec-back').onclick=()=>showEditorView('details');
  $('spec-save').onclick=()=>{
    if(getLocked())return;
    const form=document.getElementById('profile-form');
    if(!form.checkValidity())showEditorView('details');
    form.requestSubmit();
  };
  modelInput.addEventListener('input',paintCheck);
  $('use-model').onclick=()=>{const issue=mismatches()[0];if(issue&&!getLocked()){modelInput.value=issue.model;modelInput.dispatchEvent(new Event('input'));}};
  $('spec-import').onclick=()=>picker.open({mode:'specs'});
  $('spec-remove').onclick=()=>{if(getLocked())return;draftSpecs=null;paintSpecs();};
  function saveDisabled(value){for(const id of ['profile-save','collection-spec-save'])document.getElementById(id).disabled=value;}
  function paintDraft(){
    $('preview').replaceChildren();photo($('preview'),draftPhoto);$('remove-photo').hidden=!draftPhoto;$('reframe').hidden=!draftPhoto;$('source').hidden=!draftSource;$('source').textContent=draftSource?t('Photo: ShockBase · Casio ↗'):'';paintCheck();
  }
  $('photo').addEventListener('change',async()=>{
    const file=$('photo').files[0];
    if(getLocked()||!file)return;
    const version=++photoVersion;
    pending=version;saveDisabled(true);$('photo-status').textContent=t('Preparing photo…');
    try{const photo=await compactWatchPhoto(file);if(version!==photoVersion||getLocked())return;draftPhoto=photo;draftSource=null;paintDraft();$('photo-status').textContent=t('Photo ready. Save the watch to keep it.');}
    catch{if(version===photoVersion){$('photo-status').textContent=t('Choose a PNG, JPEG or WebP image up to 12 MB.');}}
    finally{if(version===photoVersion){pending=0;if(getLocked())$('photo-status').textContent='';$('photo').value='';saveDisabled(getLocked());}}
  });
  $('remove-photo').onclick=()=>{if(getLocked())return;photoVersion++;pending=0;saveDisabled(false);$('photo').value='';draftPhoto='';draftSource=null;paintDraft();$('photo-status').textContent='';};
  const picker=createWatchPhotoPicker({desktop,getModel:()=>modelInput.value,getLocked,
    onAdopt:model=>{modelInput.value=model;modelInput.dispatchEvent(new Event('input'));},
    onSpecs:(specs,isCurrent)=>{if(!isCurrent())return false;draftSpecs=specs;paintSpecs();return true;},
    onChoose:async(remote,isCurrent)=>{
      const current=photoVersion,photo=await compactWatchPhoto(photoDataBlob(remote.dataURL));
      if(current!==photoVersion||!isCurrent())return false;
      draftPhoto=photo;draftSource={provider:'shockbase',model:remote.model,pageURL:remote.pageURL,imageURL:remote.imageURL};paintDraft();
      $('photo-status').textContent=t('Photo ready. Save the watch to keep it.');return true;
    }});
  $('online').onclick=()=>picker.open();
  $('source').onclick=()=>{if(draftSource)desktop.openWatchPhotoSource(draftSource.pageURL);};
  $('reframe').onclick=async()=>{
    if(getLocked()||!draftPhoto)return;
    const version=++photoVersion;pending=version;saveDisabled(true);$('photo-status').textContent=t('Preparing photo…');
    try{const photo=await compactWatchPhoto(photoDataBlob(draftPhoto));if(version!==photoVersion||getLocked())return;draftPhoto=photo;paintDraft();$('photo-status').textContent=t('Photo ready. Save the watch to keep it.');}
    catch{if(version===photoVersion)$('photo-status').textContent=t('The photo could not be prepared. Choose another image.');}
    finally{if(version===photoVersion){pending=0;saveDisabled(getLocked());}}
  };
  function openEditor(trigger=document.activeElement,view='details'){
    if(getLocked())return;
    returnFocus=trigger;
    if(!editor.open){editor.showModal();document.getElementById('profile-editor-body').scrollTop=0;}
    showEditorView(view,false);
    document.getElementById(view==='specs'?'collection-spec-back':'profile-name').focus({preventScroll:true});
  }
  function closeEditor(){
    picker.cancel();photoVersion++;pending=0;
    if(!editor.open)return;
    editor.close();showEditorView('details',false);
    const target=returnFocus?.isConnected&&!returnFocus.disabled?returnFocus:$('search');
    target.focus({preventScroll:true});
  }
  document.getElementById('profile-editor-close').onclick=closeEditor;
  document.getElementById('profile-cancel').onclick=closeEditor;
  function dismiss(){if(editorView==='specs')showEditorView('details');else closeEditor();}
  editor.addEventListener('cancel',event=>{event.preventDefault();event.stopPropagation();dismiss();});
  editor.addEventListener('keydown',event=>{if(event.code==='Escape'||event.key==='Escape'){event.preventDefault();event.stopPropagation();dismiss();}});
  $('search').addEventListener('input',refresh);
  onLanguageChange(()=>{refresh();paintDraft();paintSpecs();});
  return {refresh,openEditor,closeEditor,setVisible(value){visible=value;if(value)refresh();else closeEditor();},
    validateModel(){paintCheck();if(!mismatches().length)return true;showEditorView('details',false);$('model-check').scrollIntoView({block:'center'});modelInput.focus({preventScroll:true});return false;},
    isPhotoPending:()=>pending===photoVersion&&pending!==0,
    showDetails(profile){showEditorView('details',false);detailsScroll=0;detailsFocus=null;picker.cancel();photoVersion++;pending=0;const details=normalizeWatchDetails(profile?.details);draftPhoto=details.photo;draftSource=details.photoSource||null;draftSpecs=details.specs||null;$('acquired').value=details.acquiredAt;$('note').value=details.note;$('photo').value='';$('photo-status').textContent='';paintDraft();paintSpecs();},
    getDetails:()=>normalizeWatchDetails({photo:draftPhoto,photoSource:draftSource,specs:draftSpecs,acquiredAt:$('acquired').value,note:$('note').value})};
}
