import {t,onLanguageChange} from './i18n.mjs';
import {compareWatchModel,normalizeWatchSpecs,normalizeWatchModel} from './watch-spec-data.mjs';
import {modelMessages} from './watch-spec-view.mjs';
const errorText=code=>t(code==='model'?'Enter a Casio model, for example GA-B2100 or GW-6900.':code==='rate'?'ShockBase is busy. Please try again later.':['identity','schema','source'].includes(code)?'The catalogue page does not match this model or cannot be verified.':'Catalogue data is unavailable. Check your connection and try again.');
export function createWatchPhotoPicker({desktop,getModel,getLocked,onChoose,onSpecs,onAdopt}){
 const $=id=>document.getElementById('photo-picker-'+id);
 let version=0,results=[],page=0,busy=false,lastStatus=null,mode='photo',selection=null;
 function status(message){lastStatus=message;$('status').textContent=t(message);}
 function check(result){return compareWatchModel(getModel(),result.model,result.family,result.specs?.moduleIds);}
 function controls(){
  $('title').textContent=t(mode==='specs'?'Import technical sheet':'Find your watch’s photo');
  $('search').disabled=busy;$('query').disabled=busy;
  $('previous').disabled=busy||page===0;$('next').disabled=busy||(page+1)*8>=results.length;
  for(const button of $('results').querySelectorAll('button'))button.disabled=busy||getLocked();
  $('results').hidden=Boolean(selection);$('review').hidden=!selection;
  $('pagination').hidden=Boolean(selection)||results.length<=8;$('page').textContent=`${page+1} / ${Math.max(1,Math.ceil(results.length/8))}`;
  $('dialog').setAttribute('aria-busy',String(busy));
  if(selection){
   const match=check(selection);$('review').classList.toggle('is-mismatch',!match.compatible);
   $('models').textContent=t('Entered: {0}\nCatalogue: {1}',getModel()||'—',selection.model);
   $('match').textContent=t(modelMessages[match.status]);
   $('summary').textContent=mode==='specs'?t('Module: {0} · Save the watch to keep the imported sheet.',selection.specs.moduleIds.join(' / ')||t('Not available')):t('The selected photo will be centred with uniform margins.');
   $('import').hidden=!match.compatible;$('adopt').hidden=match.compatible;
  }
  for(const id of ['import','adopt','back'])$(id).disabled=busy||getLocked();
 }
 function cancel(){version++;busy=false;selection=null;if($('dialog').open)$('dialog').close();}
 async function apply(result,token,adopt=false){
  if(token!==version||!$('dialog').open||getLocked())return false;
  if(adopt)onAdopt(result.model);
  if(!check(result).compatible)return false;
  const current=()=>token===version&&$('dialog').open&&!getLocked()&&check(result).compatible;
  return mode==='specs'?onSpecs(result.specs,current):onChoose(result,current);
 }
 async function confirm(adopt){
  if(busy||!selection||getLocked())return;
  const token=version;busy=true;controls();
  try{if(await apply(selection,token,adopt)){if(token===version)cancel();return;}}
  catch(error){if(token===version){lastStatus=null;$('status').textContent=errorText(error.message);}}
  finally{if(token===version){busy=false;controls();}}
 }
 function render(){
  const token=version;$('results').replaceChildren();
  for(const result of results.slice(page*8,(page+1)*8)){
   const button=document.createElement('button');button.className='photo-candidate';button.type='button';button.dataset.model=result.model;
   const img=document.createElement('img');img.alt=result.model;img.hidden=true;
   const placeholder=document.createElement('span');placeholder.className='photo-candidate-placeholder';placeholder.textContent='◷';placeholder.setAttribute('aria-hidden','true');
   const title=document.createElement('strong');title.textContent=result.model;
   const hint=document.createElement('span');hint.textContent=t(mode==='specs'?'Review technical sheet':'Use this photo');
   button.append(img,placeholder,title,hint);$('results').append(button);
   desktop.getWatchPhoto(result.id,false).then(photo=>{
    if(token!==version||!button.isConnected||!$('dialog').open)return;
    if(photo.ok){img.onload=()=>{if(img.isConnected){img.hidden=false;placeholder.hidden=true;}};img.src=photo.dataURL;}
   }).catch(()=>{});
   button.onclick=async()=>{
    if(busy||getLocked())return;busy=true;controls();$('close').focus({preventScroll:true});status(mode==='specs'?'Downloading and checking the model…':'Downloading and centering the photo…');
    try{
     const response=mode==='specs'?await desktop.getWatchSpecs(result.id,getModel(),true):await desktop.getWatchPhoto(result.id,true);
     if(token!==version||!$('dialog').open)return;
     if(!response.ok)throw Error(response.code);
     if(mode==='specs'){const sheet=normalizeWatchSpecs(response.specs);if(!sheet||sheet.model!==normalizeWatchModel(result.model))throw Error('identity');response.specs=sheet;}
     if(normalizeWatchModel(response.model)!==normalizeWatchModel(result.model))throw Error('identity');
     if(mode==='photo'&&check(response).compatible&&await apply(response,token)){if(token===version)cancel();return;}
     if(token===version){selection=response;status('Check model before importing');}
    }catch(error){if(token===version){lastStatus=null;$('status').textContent=errorText(error.message);}}
    finally{if(token===version){busy=false;controls();}}
   };
  }
  controls();
 }
 async function search(){
  if(busy||getLocked())return;
  const token=++version;busy=true;selection=null;results=[];page=0;render();status('Searching ShockBase…');
  try{
   const response=await desktop.searchWatchPhotos($('query').value);
   if(token!==version||!$('dialog').open)return;
   if(!response.ok)throw Error(response.code);
   results=response.results;status(results.length?'Choose the exact model and colour.':'No matching watches. Try the family name without the regional suffix.');
  }catch(error){if(token===version){lastStatus=null;$('status').textContent=errorText(error.message);}}
  finally{if(token===version){busy=false;render();}}
 }
 $('form').onsubmit=event=>{event.preventDefault();search();};
 $('previous').onclick=()=>{if(!busy){version++;page--;render();}};$('next').onclick=()=>{if(!busy){version++;page++;render();}};
 $('import').onclick=()=>confirm(false);$('adopt').onclick=()=>confirm(true);$('back').onclick=()=>{if(!busy){selection=null;status('Choose the exact model and colour.');controls();}};
 $('close').onclick=cancel;
 $('dialog').addEventListener('cancel',event=>{event.preventDefault();event.stopPropagation();cancel();});
 $('dialog').addEventListener('keydown',event=>{if(event.code==='Escape'||event.key==='Escape'){event.preventDefault();event.stopPropagation();cancel();}});
 onLanguageChange(()=>{if(lastStatus)$('status').textContent=t(lastStatus);if($('dialog').open&&!busy)render();});
 return {cancel,open(options={}){
  if(getLocked())return;
  mode=options.mode==='specs'?'specs':'photo';version++;selection=null;results=[];page=0;busy=false;$('query').value=getModel();status('Search by model. Only this query is sent to ShockBase.');render();
  $('dialog').showModal();$('query').focus();if($('query').value.trim())search();
 }};
}
