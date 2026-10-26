import { t, getLanguage, onLanguageChange } from './i18n.mjs';
import { MANUAL_CHAPTERS, MANUAL_GROUPS } from './guide-data.mjs';
const KEY='atomic.guide.chapter';
const el=(tag,className,text,parent)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!=null)node.textContent=text;parent?.append(node);return node;};
export function createGuide({goTo,persist}){
  const $=id=>document.getElementById('manual-'+id);
  let chapter='start',visible=false,animation=null;
  const scroll=new Map();
  try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(MANUAL_CHAPTERS.some(item=>item.id===saved))chapter=saved;}catch{/* Start at the introduction. */}
  const current=()=>MANUAL_CHAPTERS.find(item=>item.id===chapter);
  function index(){
    $('index').replaceChildren();
    for(const[group,label]of Object.entries(MANUAL_GROUPS)){
      const section=el('div','manual-index-group',null,$('index'));
      el('h3','',t(label),section);
      for(const item of MANUAL_CHAPTERS.filter(item=>item.group===group)){
        const button=el('button','manual-chapter',t(item.title),section);button.type='button';button.dataset.chapter=item.id;
        button.setAttribute('aria-controls','manual-reader');if(item.id===chapter)button.setAttribute('aria-current','true');
        button.addEventListener('click',()=>select(item.id));
      }
    }
  }
  function render(motion=false){
    if(!visible)return;
    const item=current(),position=MANUAL_CHAPTERS.indexOf(item),reader=$('reader');
    $('category').textContent=t(MANUAL_GROUPS[item.group]);$('title').textContent=t(item.title);
    const article=$('article');article.replaceChildren();
    const hero=el('div','manual-hero',null,article),intro=el('div','manual-intro',null,hero);
    el('span','manual-overline',t('Purpose'),intro);el('p','manual-purpose',t(item.purpose),intro);
    const figure=el('figure','manual-figure',null,hero),preview=el('button','manual-preview-trigger',null,figure);preview.type='button';
    preview.setAttribute('aria-label',t('Enlarge the {0} screenshot',t(item.title)));
    const image=el('img','',null,preview);image.src=`../assets/guide/${getLanguage()}/${item.image}.jpg`;image.alt=t('{0} screen',t(item.title));image.decoding='async';
    el('figcaption','',t('Example screen · click to enlarge'),figure);
    preview.addEventListener('click',()=>{const full=$('preview-image');full.src=image.src;full.alt=image.alt;$('preview').showModal();});
    const prose=el('section','manual-prose',null,article);el('h3','',t('How it works'),prose);
    for(const paragraph of item.body)el('p','',t(paragraph),prose);
    const example=el('aside','manual-example',null,article);el('span','manual-overline',t('A practical example'),example);el('p','',t(item.example),example);
    const note=el('aside','manual-note',null,article);el('h3','',t('Keep in mind'),note);el('p','',t(item.note),note);
    $('station').hidden=!['sync','signal','troubleshooting'].includes(chapter);
    $('count').textContent=`${position+1} / ${MANUAL_CHAPTERS.length}`;
    $('previous').disabled=position===0;$('next').disabled=position===MANUAL_CHAPTERS.length-1;
    const focused=document.activeElement?.dataset.chapter,indexTop=$('index').scrollTop;
    index();$('index').scrollTop=indexTop;if(focused)$('index').querySelector(`[data-chapter="${focused}"]`)?.focus({preventScroll:true});
    reader.scrollTop=scroll.get(chapter)||0;
    animation?.cancel();animation=null;
    if(motion&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.hidden)animation=article.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:200,easing:'cubic-bezier(.16,1,.3,1)'});
  }
  function select(id){
    if(!MANUAL_CHAPTERS.some(item=>item.id===id)||id===chapter)return;
    if(visible)scroll.set(chapter,$('reader').scrollTop);
    chapter=id;persist(KEY,chapter);render(true);if(visible)$('index').querySelector('[aria-current]')?.scrollIntoView({block:'nearest'});
  }
  $('previous').addEventListener('click',()=>{const i=MANUAL_CHAPTERS.indexOf(current());if(i>0)select(MANUAL_CHAPTERS[i-1].id);});
  $('next').addEventListener('click',()=>{const i=MANUAL_CHAPTERS.indexOf(current());if(i<MANUAL_CHAPTERS.length-1)select(MANUAL_CHAPTERS[i+1].id);});
  $('open').addEventListener('click',()=>goTo(current().route));
  $('preview-close').addEventListener('click',()=>$('preview').close());
  $('preview').addEventListener('keydown',event=>{if(event.key==='Escape')event.stopPropagation();});
  $('preview').addEventListener('click',event=>{if(event.target===$('preview')){const box=$('preview').getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)$('preview').close();}});
  $('index').addEventListener('keydown',event=>{if(!['ArrowUp','ArrowDown','Home','End'].includes(event.key))return;const buttons=[...$('index').querySelectorAll('[data-chapter]')],i=buttons.indexOf(document.activeElement);if(i<0)return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:Math.max(0,Math.min(buttons.length-1,i+(event.key==='ArrowDown'?1:-1)));select(buttons[next].dataset.chapter);$('index').querySelector(`[data-chapter="${buttons[next].dataset.chapter}"]`).focus();});
  onLanguageChange(()=>{if(visible){scroll.set(chapter,$('reader').scrollTop);render();}});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');reduced.addEventListener('change',()=>{if(reduced.matches)animation?.cancel();});
  return {
    setVisible(value){if(visible&&!value){scroll.set(chapter,$('reader').scrollTop);animation?.cancel();if($('preview').open)$('preview').close();}visible=value;if(value)render();},
    openChapter(id){select(id==='trial'?'history':id);}
  };
}
