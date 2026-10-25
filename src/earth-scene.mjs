import {geoNaturalEarth1,geoPath,geoGraticule10,geoCircle,geoContains,feature,mesh} from '../assets/world/vendor.mjs';
import {solarPosition,wrapLongitude} from './world-math.mjs';
const NS='http://www.w3.org/2000/svg';
export function svgNode(tag,attributes={},parent){const node=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attributes))node.setAttribute(k,v);parent?.append(node);return node;}
let atlasPromise;
function atlas(){return atlasPromise ||= Promise.all(['countries-50m.json','lights.json'].map(async file=>{const r=await fetch(new URL('../assets/world/'+file,import.meta.url));if(!r.ok)throw Error('Atlas unavailable');return r.json();})).catch(error=>{atlasPromise=null;throw error;});}
export async function createEarthScene(root,prefix){
  const [topology,lights]=await atlas();root.replaceChildren();
  const projection=geoNaturalEarth1().fitExtent([[25,30],[975,545]],{type:'Sphere'}),path=geoPath(projection),sphere=path({type:'Sphere'});
  const defs=svgNode('defs',{},root);
  const clip=svgNode('clipPath',{id:prefix+'-clip'},defs);svgNode('path',{d:sphere},clip);
  const gradient=svgNode('radialGradient',{id:prefix+'-ocean'},defs);
  svgNode('stop',{'stop-color':'#142d3f'},gradient);svgNode('stop',{offset:1,'stop-color':'#06111e'},gradient);
  const filter=svgNode('filter',{id:prefix+'-glow',x:'-10%',y:'-10%',width:'120%',height:'120%'},defs);svgNode('feGaussianBlur',{stdDeviation:2},filter);
  const mask=svgNode('mask',{id:prefix+'-night',maskUnits:'userSpaceOnUse',x:0,y:0,width:1000,height:580},defs);
  svgNode('rect',{width:1000,height:580,fill:'black'},mask);
  const masks=Array.from({length:7},()=>svgNode('path',{fill:'white',opacity:.27},mask));
  const group=svgNode('g',{'clip-path':`url(#${prefix}-clip)`},root);
  svgNode('path',{d:sphere,fill:`url(#${prefix}-ocean)`},group);
  svgNode('path',{d:path(geoGraticule10()),fill:'none',stroke:'#b6d1e3','stroke-width':.4,opacity:.12},group);
  svgNode('path',{d:path(feature(topology,topology.objects.land)),fill:'#466371',stroke:'#8ba4aa','stroke-width':.5},group);
  const shades=Array.from({length:18},()=>svgNode('path',{fill:'#010918',opacity:.12},group));
  svgNode('path',{d:path(mesh(topology,topology.objects.countries,(a,b)=>a!==b)),fill:'none',stroke:'#9db5bf','stroke-width':.5,opacity:.4},group);
  const lightGroup=svgNode('g',{mask:`url(#${prefix}-night)`},group),halo=svgNode('g',{filter:`url(#${prefix}-glow)`},lightGroup);
  const buckets=Array.from({length:5},()=>[]);
  for(const[lon,lat,pop]of lights){const[x,y]=projection([lon,lat]),i=Math.min(4,Math.max(0,Math.floor(Math.log10(pop))-3));buckets[i].push(`M${x.toFixed(1)},${y.toFixed(1)}h.01`);}
  for(let i=0;i<5;i++){const d=buckets[i].join(''),style={d,fill:'none','stroke-linecap':'round'};
    svgNode('path',{...style,stroke:'#ffae55','stroke-width':2+i,opacity:.4},halo);
    svgNode('path',{...style,stroke:'#ffd398','stroke-width':.55+i*.25,opacity:.8},lightGroup);}
  const footprint=svgNode('path',{fill:'#58d8f7','fill-opacity':.065,stroke:'#7be3ff','stroke-width':1,'stroke-opacity':.5,'stroke-dasharray':'4 5'},group);
  const past=svgNode('path',{fill:'none',stroke:'#7b9cae','stroke-width':1.4,'stroke-dasharray':'3 5',opacity:.65},group);
  const future=svgNode('path',{fill:'none',stroke:'#6ee8ff','stroke-width':1.6,opacity:.9},group);
  const observer=svgNode('g',{},group);svgNode('circle',{r:4,fill:'#ffcd84',stroke:'#142536','stroke-width':1.4},observer);
  svgNode('circle',{r:10,fill:'none',stroke:'#ffcd84','stroke-width':.8,opacity:.55},observer);
  svgNode('path',{d:sphere,fill:'none',stroke:'#7794a7','stroke-width':.7,opacity:.5},root);
  const craft=svgNode('g',{class:'iss-map-craft'},root);
  svgNode('circle',{r:23,fill:'#6de9ff',opacity:.08},craft);svgNode('circle',{r:15,fill:'none',stroke:'#9cefff',opacity:.35,'stroke-width':.8},craft);
  const shape=svgNode('g',{class:'iss-craft-shape'},craft);
  for(const x of [-18,8])for(const y of [-14,2]){
    svgNode('rect',{x,y,width:10,height:12,rx:.7,fill:'#71d3ed',stroke:'#c5f7ff','stroke-width':.5},shape);
    svgNode('path',{d:`M${x+3} ${y}v12M${x+7} ${y}v12M${x} ${y+4}h10M${x} ${y+8}h10`,stroke:'#183e5d','stroke-width':.5},shape);
  }
  svgNode('path',{d:'M-18 0H18M0-17V17',stroke:'#dceaf1','stroke-width':2},shape);
  svgNode('rect',{x:-3,y:-9,width:6,height:18,rx:2,fill:'#eef7fa',stroke:'#1c4257','stroke-width':1},shape);
  const label=svgNode('text',{y:-30,'text-anchor':'middle',fill:'#d9faff','font-size':13,'font-family':'monospace','paint-order':'stroke',stroke:'#06111e','stroke-width':4},craft);label.textContent='ISS';
  const countries=feature(topology,topology.objects.countries).features;
  return {projection,path,
    updateSun(epoch){const sun=solarPosition(epoch),anti=[wrapLongitude(sun.longitude+180),-sun.latitude];
      shades.forEach((n,i)=>n.setAttribute('d',path(geoCircle().center(anti).radius(92-i*1.5).precision(2)())));
      masks.forEach((n,i)=>n.setAttribute('d',path(geoCircle().center(anti).radius(89-i*1.7).precision(2)())));},
    update(state,city,{showFootprint=true}={}){craft.style.display=state?'':'none';
      if(state){const[x,y]=projection([state.longitude,state.latitude]);craft.setAttribute('transform',`translate(${x},${y})`);
        label.setAttribute('text-anchor',x<100?'start':x>900?'end':'middle');
        footprint.setAttribute('d',path(geoCircle().center([state.longitude,state.latitude]).radius(Math.acos(6371/(6371+state.altitude))*180/Math.PI).precision(2)()));}
      footprint.style.display=state&&showFootprint?'':'none';const[x,y]=projection([city.longitude,city.latitude]);observer.setAttribute('transform',`translate(${x},${y})`);},
    track(points,epoch,show=true){for(const[node,subset]of[[past,points.filter(p=>p.time<=epoch)],[future,points.filter(p=>p.time>=epoch)]]){
      node.style.display=show?'':'none';node.setAttribute('d',subset.length>1?path({type:'LineString',coordinates:subset.map(p=>p.coordinates)}):'');}},
    countryAt(state){return countries.find(c=>geoContains(c,[state.longitude,state.latitude]))?.properties?.name||'the ocean';},
  };
}
