import {t,dateTimeFormat,onLanguageChange} from './i18n.mjs';
const scenes={clock:'#clock-stage',world:'.world-stage',moon:'.moon-stage','light-travel':'#lt-scene'};
export function createObservatory({views,goTo,desktop,notify}) {
  const $=id=>document.getElementById('observatory-'+id);
  let page='home',activeScene=null,pausedView=null,scene=null,placeholder=null,returnFocus=null,timer,hideTimer,switching=false,opening=false;
  function restore(resume=true){views.clock.setVisible(false);if(pausedView&&resume)pausedView.setVisible(true);pausedView=null;if(scene&&placeholder?.parentNode)placeholder.replaceWith(scene);scene=null;placeholder=null;}
  function reveal(){
    $('dialog').classList.remove('controls-hidden');clearTimeout(hideTimer);
    hideTimer=setTimeout(()=>{
      const active=document.activeElement;
      const keyboardControl=$('dialog').contains(active)&&active.matches('button:focus-visible,input:focus-visible,select:focus-visible,[role=button]:focus-visible');
      const hovering=$('controls').matches(':hover')||$('scene').querySelector('.world-basemap-controls:hover,.world-navigation-controls:hover,.moon-texture-source:hover');
      if(!keyboardControl&&!hovering)$('dialog').classList.add('controls-hidden');
    },4500);
  }
  function paint(){
    if(!$('dialog').open)return;
    const epoch=views[activeScene].getEpoch();
    $('clock').textContent=dateTimeFormat({timeZone:'UTC',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(epoch)+' UTC';
    $('date').textContent=dateTimeFormat({timeZone:'UTC',day:'numeric',month:'long',year:'numeric'}).format(epoch);
    $('clock').dateTime=new Date(epoch).toISOString();
    $('mode').textContent=document.getElementById({world:'world-mode',moon:'moon-mode','light-travel':'lt-mode'}[activeScene])?.textContent||t('LIVE');
    $('play').hidden=activeScene!=='light-travel';
    if(activeScene==='light-travel')$('play').textContent=document.getElementById('lt-play').textContent;
    for(const button of $('controls').querySelectorAll('[data-observatory-page]'))button.setAttribute('aria-pressed',String(button.dataset.observatoryPage===activeScene));
  }
  function mount(key){
    activeScene=key;
    scene=document.querySelector(scenes[key]);placeholder=document.createComment('observatory-scene');scene.before(placeholder);$('scene').append(scene);$('dialog').dataset.scene=key;if(key==='clock'){pausedView=views[page]||null;pausedView?.setVisible(false);views.clock.setVisible(true);}paint();
  }
  function cleanup(resume=true){clearInterval(timer);clearTimeout(hideTimer);restore(resume);if($('dialog').open)$('dialog').close();$('dialog').classList.remove('controls-hidden');returnFocus?.focus({preventScroll:true});}
  async function close(resume=true){cleanup(resume);try{await desktop.setObservatoryFullscreen(false);}catch{notify(t('Full screen is unavailable. The observatory has been closed.'),true);}}
  $('open').onclick=async()=>{
    if((page!=='home'&&!Object.hasOwn(scenes,page))||opening)return;
    opening=true;returnFocus=$('open');
    try{
      mount(page==='home'?'clock':page);$('dialog').showModal();paint();$('dialog').focus();reveal();timer=setInterval(paint,1000);
      if(!await desktop.setObservatoryFullscreen(true))throw Error('fullscreen');
    }catch{cleanup();notify(t('Full screen is unavailable. The observatory has been closed.'),true);}
    finally{opening=false;}
  };
  $('close').onclick=()=>close();
  $('dialog').addEventListener('cancel',event=>{event.preventDefault();event.stopPropagation();close();});
  $('dialog').addEventListener('keydown',reveal,{capture:true});
  $('dialog').addEventListener('keydown',event=>{event.stopPropagation();if(event.code==='Escape'){event.preventDefault();close();}});
  $('dialog').addEventListener('pointermove',reveal);$('dialog').addEventListener('pointerdown',reveal);$('dialog').addEventListener('wheel',reveal,{passive:true});$('dialog').addEventListener('focusin',reveal);
  for(const button of $('controls').querySelectorAll('[data-observatory-page]'))button.onclick=()=>{
    const next=button.dataset.observatoryPage;if(next===activeScene)return;
    switching=true;restore(false);if(next!=='clock')goTo(next);mount(next);switching=false;$('dialog').focus();reveal();
  };
  $('play').onclick=()=>{document.getElementById('lt-play').click();paint();$('dialog').focus();reveal();};
  desktop.onObservatoryExit?.(()=>{if($('dialog').open)cleanup();});
  onLanguageChange(paint);
  window.addEventListener('beforeunload',()=>{clearInterval(timer);clearTimeout(hideTimer);});
  return {setPage(value){if($('dialog').open&&!switching&&value!==page)close(false);page=value;if($('dialog').open&&!switching&&activeScene==='clock'){pausedView=views[page]||null;pausedView?.setVisible(false);}$('open').hidden=value!=='home'&&!Object.hasOwn(scenes,value);}};
}
