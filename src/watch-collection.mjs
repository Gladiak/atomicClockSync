import {createWatchPhotoPicker} from './watch-photo-picker.mjs';
import {photoDataBlob,watchPhotoAlphaBounds} from './watch-photo-frame.mjs';
import {t,dateTimeFormat,numberFormat,onLanguageChange} from './i18n.mjs';
import {normalizeWatchDetails,compactWatchPhoto} from './watch-collection-data.mjs';
import {compareWatchModel,normalizeWatchModel} from './watch-spec-data.mjs';
import {renderWatchSpecs,modelCheck,modelMessages} from './watch-spec-view.mjs';
import {getStation} from './stations.mjs';
const node=(tag,cls,text,parent)=>{const el=document.createElement(tag);el.className=cls;if(text!=null)el.textContent=text;parent?.append(el);return el;};
const portraits=new Map();
function portraitViewport(src){
  if(portraits.has(src))return portraits.get(src);
  const job=new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>{
      const width=img.naturalWidth,height=img.naturalHeight;
      let bounds={left:0,top:0,width,height};
      try{
        if(width&&height&&width*height<=4_000_000){
          const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
          const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(img,0,0);
          bounds=watchPhotoAlphaBounds(context.getImageData(0,0,width,height));
        }
      }catch{/* Preserve the whole photo when its visible bounds cannot be read. */}
      resolve({imageWidth:width,imageHeight:height,...bounds});
    };
    img.onerror=()=>resolve(null);img.src=src;
  });
  portraits.set(src,job);if(portraits.size>32)portraits.delete(portraits.keys().next().value);
  return job;
}
export function createWatchCollection({getData,selectWatch,editWatch,openAccuracy,openLab,openHistory,getLocked,desktop,saveVariant,saveImported,notify}) {
  const $=id=>document.getElementById('collection-'+id);
  let visible=false,draftPhoto='',draftSource=null,draftSpecs=null,photoVersion=0,pending=0,returnFocus=null,editorView='details',detailsScroll=0,detailsFocus=null;
  let draftProfileId=null,draftVariant=null;
  let returnWatchFocus=null;
  const editor=document.getElementById('profile-editor-dialog');
  const searchable=value=>value.normalize('NFKD').replace(/\p{M}/gu,'').toLocaleLowerCase();
  function photo(parent,src){if(src){const img=node('img','watch-photo',null,parent);img.src=src;img.alt=t('Watch photo');}else{const mark=node('div','watch-placeholder','◷',parent);mark.setAttribute('aria-hidden','true');}}
  function portrait(parent,src){
    if(!src){photo(parent,src);return;}
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('watch-photo');svg.setAttribute('viewBox','0 0 480 480');svg.setAttribute('role','img');svg.setAttribute('aria-label',t('Watch photo'));
    const picture=document.createElementNS(svg.namespaceURI,'image');picture.setAttribute('href',src);picture.setAttribute('width','480');picture.setAttribute('height','480');svg.append(picture);parent.append(svg);
    portraitViewport(src).then(bounds=>{
      if(!bounds||!svg.isConnected)return;
      // Only the viewport changes; the saved photo and its framing stay intact.
      picture.setAttribute('width',String(bounds.imageWidth));picture.setAttribute('height',String(bounds.imageHeight));
      svg.setAttribute('viewBox',`${bounds.left} ${bounds.top} ${bounds.width} ${bounds.height}`);
    });
  }
  function cardIcon(parent,path){
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');
    const shape=document.createElementNS(svg.namespaceURI,'path');shape.setAttribute('d',path);svg.append(shape);parent.append(svg);
  }
  function closeMenus(){for(const menu of $('watches').querySelectorAll(':popover-open'))menu.hidePopover();}
  function refresh(){
    if(!visible)return;
    closeMenus();
    const data=getData(),focused=document.activeElement,focus=focused?.dataset.watchId,focusAction=focused?.dataset.watchAction;
    const query=searchable($('search').value.trim());
    const matches=data.profiles.filter(profile=>searchable(profile.name+' '+profile.model).includes(query));
    $('watches').replaceChildren();$('empty').hidden=matches.length>0;
    $('empty').textContent=t(data.profiles.length?'No watches match your search.':'Save your first watch and make this space yours.');
    for(const [index,profile] of matches.entries()){
      const card=node('article','watch-card panel',null,$('watches'));card.dataset.watchId=profile.id;
      const details=normalizeWatchDetails(profile.details);
      const active=data.activeProfileId===profile.id;card.dataset.active=String(active);
      const media=node('div','watch-card-media',null,card);
      const select=node('button','watch-card-select',null,media);select.type='button';select.dataset.watchId=profile.id;
      select.dataset.watchAction='edit';select.setAttribute('aria-haspopup','dialog');select.setAttribute('aria-label',t('Edit watch')+' · '+profile.name);select.disabled=getLocked();
      portrait(select,details.photo);
      const edit=trigger=>{if(!getLocked()){editWatch(profile.id);openEditor(trigger);}};
      select.onclick=()=>edit(select);
      const activate=node('button','watch-card-active',null,media);activate.type='button';activate.dataset.watchId=profile.id;activate.dataset.watchAction='activate';
      activate.setAttribute('aria-pressed',String(active));activate.setAttribute('aria-label',t(active?'Active watch: {0}':'Use {0} as active watch',profile.name));activate.title=t(active?'Active watch':'Use this watch');activate.disabled=getLocked();
      cardIcon(activate,'M8 6l1-4h6l1 4M8 18l1 4h6l1-4M9 12l2 2 4-4M8 6h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z');
      activate.onclick=()=>{if(!getLocked()&&!active)selectWatch(profile.id);};
      const body=node('div','watch-card-body',null,card),toolbar=node('div','watch-card-toolbar',null,body);
      const family=profile.bluetooth?.model||details.specs?.subseries||details.variant?.family||normalizeWatchModel(profile.model).split('-').slice(0,2).join('-')||getStation(profile.settings.stationId).name;
      node('span','watch-card-family',family,toolbar);
      const sheet=node('button','watch-card-tool watch-card-specs',null,toolbar);sheet.type='button';sheet.disabled=getLocked();sheet.title=t('Technical sheet');sheet.setAttribute('aria-label',t('Technical sheet')+' · '+profile.name);
      sheet.dataset.watchId=profile.id;sheet.dataset.watchAction='specs';
      cardIcon(sheet,'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8m-8 4h5');
      sheet.onclick=()=>{if(!getLocked()){editWatch(profile.id);openEditor(sheet,'specs');}};
      const more=node('button','watch-card-tool watch-card-more',null,toolbar);more.type='button';more.title=t('Watch actions');more.setAttribute('aria-label',t('Watch actions')+' · '+profile.name);more.setAttribute('aria-haspopup','menu');more.setAttribute('aria-expanded','false');more.disabled=getLocked();more.dataset.watchId=profile.id;more.dataset.watchAction='more';
      cardIcon(more,'M5 12h.01M12 12h.01M19 12h.01');
      const title=node('button','watch-card-caption',null,body);title.type='button';title.disabled=getLocked();title.dataset.watchId=profile.id;title.dataset.watchAction='title';title.setAttribute('aria-haspopup','dialog');title.setAttribute('aria-label',t('Edit watch')+' · '+profile.name);
      const name=node('strong','',profile.name,title);name.title=profile.name;name.translate=false;
      if(profile.model&&profile.model!==profile.name)node('span','watch-card-model',profile.model,title).translate=false;
      title.onclick=()=>edit(title);
      if(details.note){const note=node('p','watch-personal-note',details.note,body);note.title=details.note;}
      if(details.variant&&details.variant.status!=='confirmed')node('p','watch-variant-hint',t(details.variant.status==='pending'?'Photo and sheet to complete':'Automatic variant · review colour'),body);
      const facts=node('dl','watch-card-facts',null,body);
      const specs=details.specs,nf=numberFormat({maximumFractionDigits:2});
      const release=specs?.release?(specs.release.month?dateTimeFormat({month:'long',year:'numeric',timeZone:'UTC'}).format(Date.UTC(specs.release.year,specs.release.month-1,1)):String(specs.release.year)):'—';
      for(const [label,value,hint]of [
        ['Module',specs?.moduleIds.join(' / ')||profile.bluetooth?.module||'—'],
        ['Weight',specs?.physical.weightG!=null?nf.format(specs.physical.weightG)+' g':'—'],
        ['Dimensions',specs?.physical.sizeMm?specs.physical.sizeMm.map(value=>nf.format(value)).join(' × ')+' mm':'—','Dimensions · H × W × T'],
        ['Collection',specs?.edition.collection?t(specs.edition.collection):'—'],
        ['Release date',release]
      ]){
        const fact=node('div','',null,facts);node('dt','',t(label),fact);const valueNode=node('dd','',value,fact);if(hint)valueNode.title=t(hint);
      }
      const actions=node('div','watch-card-actions',null,card);actions.id='watch-actions-'+index;actions.setAttribute('popover','auto');actions.setAttribute('role','menu');actions.setAttribute('aria-label',t('Watch actions'));more.setAttribute('aria-controls',actions.id);
      more.onclick=()=>{
        if(actions.matches(':popover-open')){actions.hidePopover();return;}
        actions.showPopover();
        const rect=more.getBoundingClientRect();actions.style.left=Math.max(12,Math.min(rect.right-actions.offsetWidth,innerWidth-actions.offsetWidth-12))+'px';actions.style.top=Math.max(12,Math.min(rect.bottom+6,innerHeight-actions.offsetHeight-12))+'px';
        actions.querySelector('button:not(:disabled)')?.focus({preventScroll:true});
      };
      actions.addEventListener('toggle',()=>more.setAttribute('aria-expanded',String(actions.matches(':popover-open'))));
      actions.addEventListener('keydown',event=>{
        const buttons=[...actions.querySelectorAll('button:not(:disabled)')],index=buttons.indexOf(document.activeElement);
        if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();buttons[event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowDown'?1:buttons.length-1))%buttons.length]?.focus();}
        if(event.key==='Escape'){event.preventDefault();event.stopPropagation();actions.hidePopover();more.focus();}
        if(event.key==='Tab'){actions.hidePopover();more.focus();}
      });
      const action=(label,icon,handler,cls='')=>{
        const button=node('button',cls,null,actions);button.type='button';button.setAttribute('role','menuitem');button.disabled=getLocked();cardIcon(button,icon);node('span','',t(label),button);
        button.onclick=()=>{if(getLocked())return;if(actions.matches(':popover-open'))actions.hidePopover();handler(button);};return button;
      };
      const variant=action('Choose variant','M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1.5-3.3 1.7 1.7 0 0 1 1.3-2.7H18a3 3 0 0 0 3-3 9 9 0 0 0-9-9ZM7 10h.01M10 6h.01M15 6h.01M18 10h.01',()=>{editWatch(profile.id);openEditor(more);chooseVariant();},'watch-card-variant');variant.disabled=getLocked()||!profile.model;
      const find=action('Find photo on ShockBase','M4 4h16v16H4zM4 16l5-5 4 4 3-3 4 4M8 8h.01',()=>{editWatch(profile.id);openEditor(more);document.querySelector('.watch-personal-details').open=true;picker.open();});find.disabled=getLocked()||!profile.model;
      action('Watch Accuracy','M4 19V5m0 14h16M7 14l4-5 4 3 5-7',()=>openAccuracy(profile.id));
      action('Reception Lab','M3 12h3l3-7 5 14 4-7h3',()=>openLab(profile.id,profile.name));
      action('History','M3 11a9 9 0 1 1 2 7M3 4v7h7m2-4v5l3 2',()=>openHistory(profile.id));
      if(details.photoSource)action('Photo: ShockBase · Casio ↗','M14 3h7v7m0-7L10 14m0-10H4v16h16v-6',()=>desktop.openWatchPhotoSource(details.photoSource.pageURL),'watch-photo-credit');
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
    $('variant-tools').hidden=!draftProfileId;
    $('variant-status').textContent=draftVariant?t(draftVariant.status==='pending'?'Photo and sheet to complete':draftVariant.status==='automatic'?'Automatic variant · review colour':'Variant saved automatically'):'';
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
    onVariant:(imported,isCurrent)=>{
      if(!isCurrent()||!draftProfileId||!saveVariant(draftProfileId,imported))return false;
      const saved=getData().profiles.find(item=>item.id===draftProfileId);
      modelInput.value=imported.model;draftPhoto=imported.details.photo;draftSource=imported.details.photoSource;draftSpecs=imported.details.specs;draftVariant=saved.details.variant;
      photoVersion++;pending=0;saveDisabled(getLocked());paintDraft();paintSpecs();
      $('photo-status').textContent=t('Variant saved automatically');notify('Variant saved automatically');return true;
    },
    onAdopt:model=>{modelInput.value=model;modelInput.dispatchEvent(new Event('input'));},
    onSpecs:(specs,isCurrent)=>{
      if(!isCurrent())return false;
      const saved=saveImported(draftProfileId,{specs},modelInput.value);if(saved===false)return false;
      draftSpecs=specs;paintSpecs();if(saved)notify('Technical sheet saved automatically');return true;
    },
    onChoose:async(remote,isCurrent)=>{
      const current=photoVersion,photo=await compactWatchPhoto(photoDataBlob(remote.dataURL));
      if(current!==photoVersion||!isCurrent())return false;
      const source={provider:'shockbase',model:remote.model,pageURL:remote.pageURL,imageURL:remote.imageURL};
      const saved=saveImported(draftProfileId,{photo,photoSource:source},modelInput.value);if(saved===false)return false;
      draftPhoto=photo;draftSource=source;paintDraft();
      $('photo-status').textContent=t(saved?'Photo saved automatically':'Photo ready. Save the watch to keep it.');if(saved)notify('Photo saved automatically');return true;
    }});
  $('online').onclick=()=>picker.open();
  function chooseVariant(){
    const profile=getData().profiles.find(item=>item.id===draftProfileId);
    const family=profile?.bluetooth?.model||profile?.details.variant?.family||profile?.details.specs?.subseries||'';
    if(profile&&!getLocked())picker.open({mode:'variant',query:family||profile.model,family,module:profile.bluetooth?.module||''});
  }
  $('variant').onclick=chooseVariant;
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
    returnWatchFocus=trigger?.dataset.watchId?{id:trigger.dataset.watchId,action:trigger.dataset.watchAction}:null;
    if(!editor.open){editor.showModal();document.getElementById('profile-editor-body').scrollTop=0;}
    showEditorView(view,false);
    document.getElementById(view==='specs'?'collection-spec-back':'profile-name').focus({preventScroll:true});
  }
  function closeEditor(){
    picker.cancel();photoVersion++;pending=0;
    if(!editor.open)return;
    editor.close();showEditorView('details',false);
    const restored=returnWatchFocus?[...$('watches').querySelectorAll('button[data-watch-id]')].find(button=>button.dataset.watchId===returnWatchFocus.id&&button.dataset.watchAction===returnWatchFocus.action):null;
    const target=returnFocus?.isConnected&&!returnFocus.disabled?returnFocus:restored&&!restored.disabled?restored:$('search');
    target.focus({preventScroll:true});
  }
  document.getElementById('profile-editor-close').onclick=closeEditor;
  document.getElementById('profile-cancel').onclick=closeEditor;
  function dismiss(){if(editorView==='specs')showEditorView('details');else closeEditor();}
  editor.addEventListener('cancel',event=>{event.preventDefault();event.stopPropagation();dismiss();});
  editor.addEventListener('keydown',event=>{if(event.code==='Escape'||event.key==='Escape'){event.preventDefault();event.stopPropagation();dismiss();}});
  $('search').addEventListener('input',refresh);
  document.getElementById('page-profiles').addEventListener('scroll',closeMenus);window.addEventListener('resize',closeMenus);
  onLanguageChange(()=>{refresh();paintDraft();paintSpecs();});
  return {refresh,openEditor,closeEditor,setVisible(value){visible=value;if(value)refresh();else{closeMenus();closeEditor();}},
    syncProfile(profile,previous){
      if(profile.id!==draftProfileId||!previous)return;
      const old=normalizeWatchDetails(previous.details),details=normalizeWatchDetails(profile.details);
      if(modelInput.value===previous.model&&draftPhoto===old.photo&&JSON.stringify(draftSpecs)===JSON.stringify(old.specs||null)){
        modelInput.value=profile.model;draftPhoto=details.photo;draftSource=details.photoSource||null;draftSpecs=details.specs||null;draftVariant=details.variant||null;paintDraft();paintSpecs();
      }
      const name=document.getElementById('profile-name');if(name.value===previous.name)name.value=profile.name;
    },
    validateModel(){paintCheck();if(!mismatches().length)return true;showEditorView('details',false);$('model-check').scrollIntoView({block:'center'});modelInput.focus({preventScroll:true});return false;},
    isPhotoPending:()=>pending===photoVersion&&pending!==0,
    showDetails(profile){showEditorView('details',false);detailsScroll=0;detailsFocus=null;picker.cancel();photoVersion++;pending=0;draftProfileId=profile?.id||null;const details=normalizeWatchDetails(profile?.details);draftPhoto=details.photo;draftSource=details.photoSource||null;draftSpecs=details.specs||null;draftVariant=details.variant||null;$('acquired').value=details.acquiredAt;$('note').value=details.note;$('photo').value='';$('photo-status').textContent='';paintDraft();paintSpecs();},
    getDetails:()=>normalizeWatchDetails({photo:draftPhoto,photoSource:draftSource,specs:draftSpecs,variant:draftVariant,acquiredAt:$('acquired').value,note:$('note').value})};
}
