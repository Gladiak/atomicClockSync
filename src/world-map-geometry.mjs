import {geoNaturalEarth1} from '../assets/world/vendor.mjs';
export const WORLD_MAP_SIZE=Object.freeze({width:1000,height:440});
// The raster builder, geographic overlays and camera share this projection.
export const createWorldProjection=()=>geoNaturalEarth1().fitExtent([[24,20],[976,424]],{type:'Sphere'});
const finite=(value,fallback)=>Number.isFinite(value)?value:fallback;
export function clampWorldCamera(value={}){
 const scale=Math.max(1,Math.min(4,finite(value.scale,1)));
 return {scale,x:Math.max(1000*(1-scale),Math.min(0,finite(value.x,0))),y:Math.max(440*(1-scale),Math.min(0,finite(value.y,0)))};
}
export function zoomWorldCamera(camera,scale,point=[500,220]){
 const before=clampWorldCamera(camera),next=clampWorldCamera({scale}).scale,ratio=next/before.scale;
 return clampWorldCamera({scale:next,x:point[0]-(point[0]-before.x)*ratio,y:point[1]-(point[1]-before.y)*ratio});
}
export function focusWorldCamera(point,scale=2.5){
 const next=clampWorldCamera({scale}).scale;
 return clampWorldCamera({scale:next,x:500-point[0]*next,y:220-point[1]*next});
}
