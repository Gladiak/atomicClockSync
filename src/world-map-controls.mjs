import {clampWorldCamera,zoomWorldCamera,focusWorldCamera} from './world-map-geometry.mjs';
import {t,numberFormat,onLanguageChange} from './i18n.mjs';
export function createWorldMapControls({projection,getCity,basemap='satellite',onBasemapChange}){
 const $=id=>document.getElementById('world-'+id),root=$('map');
 let camera=clampWorldCamera(),layer=basemap,ready=false,loading=false,failed=false,drag=null;
 const zoomFormat=numberFormat({maximumFractionDigits:1});
 function placeMarker(node,x,y){node.dataset.mapX=x;node.dataset.mapY=y;node.setAttribute('transform',`translate(${x},${y}) scale(${1/camera.scale})`);}
 function paint(){
  $('map-viewport').setAttribute('transform',`translate(${camera.x},${camera.y}) scale(${camera.scale})`);
  root.dataset.zoom=String(camera.scale);root.classList.toggle('can-pan',camera.scale>1);
  root.dataset.basemap=layer==='satellite'&&ready?'satellite':'atlas';
  $('surface').setAttribute('display',layer==='satellite'&&ready?'inline':'none');$('imagery-credit').hidden=layer!=='satellite'||!ready;
  for(const value of ['satellite','atlas'])$('basemap-'+value).setAttribute('aria-pressed',String(layer===value));
  $('basemap-satellite').disabled=failed;$('basemap-satellite').title=t(failed?'Satellite imagery unavailable. Using the map.':'NASA Blue Marble · August 2004 composite · not live imagery.');
  $('zoom-level').textContent=zoomFormat.format(camera.scale)+'×';$('zoom-level').setAttribute('aria-label',t('Map zoom: {0}',zoomFormat.format(camera.scale)+'×'));
  $('zoom-out').disabled=camera.scale<=1;$('zoom-in').disabled=camera.scale>=4;$('map-reset').disabled=camera.scale===1;
  for(const node of root.querySelectorAll('[data-map-x]'))placeMarker(node,Number(node.dataset.mapX),Number(node.dataset.mapY));
  root.querySelector('#world-amber-halo feGaussianBlur')?.setAttribute('stdDeviation',String(2.3/camera.scale));
 }
 function setCamera(value){camera=clampWorldCamera(value);paint();}
 function zoom(scale,point){setCamera(zoomWorldCamera(camera,scale,point));}
 function focusCity(scale=2.5){const city=getCity();setCamera(focusWorldCamera(projection([city.longitude,city.latitude]),scale));}
 function reset(){setCamera({scale:1});}
 function coordinates(event){const matrix=root.getScreenCTM();return matrix?new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse()):{x:500,y:220};}
 function endDrag(){if(drag&&root.hasPointerCapture(drag.id))root.releasePointerCapture(drag.id);drag=null;root.classList.remove('is-panning');}
 $('zoom-in').onclick=()=>zoom(camera.scale*1.4);$('zoom-out').onclick=()=>zoom(camera.scale/1.4);$('map-reset').onclick=reset;$('city-focus').onclick=()=>focusCity();
 for(const value of ['satellite','atlas'])$('basemap-'+value).onclick=()=>{layer=value;paint();onBasemapChange(value);};
 root.addEventListener('wheel',event=>{if(!event.deltaY)return;event.preventDefault();const p=coordinates(event);zoom(camera.scale*Math.exp(Math.max(-.4,Math.min(.4,-event.deltaY*.002))),[p.x,p.y]);},{passive:false});
 root.addEventListener('pointerdown',event=>{
  if(event.button!==0||camera.scale<=1||event.target.closest('.world-station-marker'))return;
  const p=coordinates(event);drag={id:event.pointerId,x:p.x,y:p.y,camera};root.setPointerCapture(event.pointerId);root.classList.add('is-panning');root.focus({preventScroll:true});
 });
 root.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.id)return;const p=coordinates(event);setCamera({...drag.camera,x:drag.camera.x+p.x-drag.x,y:drag.camera.y+p.y-drag.y});});
 root.addEventListener('pointerup',endDrag);root.addEventListener('pointercancel',endDrag);root.addEventListener('lostpointercapture',()=>{drag=null;root.classList.remove('is-panning');});
 root.addEventListener('keydown',event=>{
  if(event.target!==root||event.key==='Escape'&&camera.scale<=1)return;
  const actions={'+':()=>zoom(camera.scale*1.4),'=':()=>zoom(camera.scale*1.4),'-':()=>zoom(camera.scale/1.4),Home:reset,Escape:reset,
   ArrowLeft:()=>setCamera({...camera,x:camera.x+60}),ArrowRight:()=>setCamera({...camera,x:camera.x-60}),ArrowUp:()=>setCamera({...camera,y:camera.y+40}),ArrowDown:()=>setCamera({...camera,y:camera.y-40})};
  if(actions[event.key]){event.preventDefault();event.stopPropagation();actions[event.key]();}
 });
 onLanguageChange(paint);paint();
 return {placeMarker,focusCity,ensureCityVisible(){if(camera.scale>1)focusCity(camera.scale);},cancelDrag:endDrag,
  loadSurface(){
   if(loading)return;loading=true;root.dataset.imagery='loading';
   const image=new Image(),url=new URL('../assets/world/blue-marble-natural-earth.webp',import.meta.url).href;image.src=url;
   image.decode().then(()=>{ready=true;$('surface').setAttribute('href',url);root.dataset.imagery='nasa-blue-marble';paint();})
    .catch(()=>{failed=true;layer='atlas';root.dataset.imagery='fallback';paint();});
  }
 };
}
