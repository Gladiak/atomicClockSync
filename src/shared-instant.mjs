import {t,onLanguageChange} from './i18n.mjs';
export const validSharedEpoch=epoch=>Number.isFinite(epoch)&&epoch>=Date.UTC(1900,0,1)&&epoch<Date.UTC(2101,0,1);
export function createSharedInstant({views,getNow,goTo,notify}) {
  const $=id=>document.getElementById('instant-'+id);
  let linked=false,epoch=null,page='home',updating=false;
  function paint(){
    const supported=Object.hasOwn(views,page);$('open').hidden=!supported;
    $('open').textContent=t(linked?'Linked instant':'Explore together');$('open').classList.toggle('instant-linked',linked);
    $('status').textContent=linked?t('Earth, Moon and light share this UTC instant.'):t('Choose one instant to explore across Earth, Moon and light.');
    $('unlink').disabled=!linked;
    if(document.activeElement!==$('date'))$('date').value=new Date(epoch??(supported?views[page].getEpoch():getNow())).toISOString().slice(0,19);
  }
  function apply(value,source){
    if(value!==null&&!validSharedEpoch(value))return false;
    updating=true;
    try{for(const [name,view]of Object.entries(views))if(name!==source)view.setPreview(value);epoch=value;}
    finally{updating=false;}
    paint();return true;
  }
  function explore(value){
    if(!validSharedEpoch(value)){notify(t('Sky exploration supports dates from 1900 to 2100.'),true);return false;}
    linked=true;apply(value);return true;
  }
  $('open').onclick=()=>{paint();$('dialog').showModal();};
  $('apply').onclick=()=>{
    const value=Date.parse($('date').value+'Z');
    if(!$('date').reportValidity()||!validSharedEpoch(value)){notify(t('Sky exploration supports dates from 1900 to 2100.'),true);return;}
    explore(value);$('dialog').close();
  };
  $('unlink').onclick=()=>{linked=false;epoch=null;paint();$('dialog').close();};
  $('live').onclick=()=>{linked=false;apply(null);$('dialog').close();};
  for(const button of $('routes').querySelectorAll('button'))button.onclick=()=>{
    const value=Date.parse($('date').value+'Z');
    if(!$('date').reportValidity()||!explore(value))return;
    $('dialog').close();goTo(button.dataset.instantPage);
  };
  $('dialog').addEventListener('keydown',event=>{if(event.code==='Escape')event.stopPropagation();});
  onLanguageChange(paint);
  return {setPage(value){page=value;paint();},explore,
    changed(source,value){if(updating)return;if(linked){if(value===null){linked=false;apply(null);}else if(validSharedEpoch(value))apply(value,source);else{linked=false;epoch=null;paint();}}else{epoch=null;paint();}},
    isLinked:()=>linked};
}
