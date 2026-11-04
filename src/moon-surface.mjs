import {moonSurfaceLight} from './moon-math.mjs';
let imagePromise;
function lunarImage(){return imagePromise ||= (async()=>{const image=new Image();image.src=new URL('../assets/moon/lro-nearside.webp',import.meta.url).href;await image.decode();return image;})().catch(error=>{imagePromise=null;throw error;});}
function texture(canvas) {
  const ctx = canvas.getContext('2d'), size = canvas.width;
  let seed = 88;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  ctx.fillStyle = '#b7b8b4'; ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 180; i++) {
    const x = random()*size, y = random()*size, radius = 2 + random()*30;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, i < 35 ? '#333a3d70' : '#45484935'); gradient.addColorStop(1, '#6b6b6b00');
    ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI*2); ctx.fill();
    if (i > 35) {
      ctx.strokeStyle = '#eef0dd55'; ctx.lineWidth = .6;
      ctx.beginPath(); ctx.arc(x, y, radius*.62, .2, 3.5); ctx.stroke();
    }
  }
  const data = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < data.data.length; i += 4) {
    const grain = (random() - .5)*14;
    for (let c = 0; c < 3; c++) data.data[i+c] += grain;
  }
  return data;
}
export function createMoonSurface(canvas,{onSurfaceChange=()=>{},minimumSize=256}={}){
  const ctx=canvas.getContext('2d');
  let base=null,baseSize=0,photographic=false,loading=false,visible=false,lastPhase=null,drawnPhase=null,sourceImage=null;
  function draw(phase) {
    lastPhase=phase;if(!visible||!Number.isFinite(phase))return;
    const bounds=canvas.getBoundingClientRect(),size=Math.min(2048,Math.max(minimumSize,Math.ceil(Math.min(bounds.width,bounds.height)*(globalThis.devicePixelRatio||1)/128)*128));
    if(baseSize!==size||!base){
      canvas.width=canvas.height=size;baseSize=size;drawnPhase=null;
      const surface=document.createElement('canvas');surface.width=surface.height=size;
      if(photographic){const context=surface.getContext('2d');context.drawImage(sourceImage,0,0,size,size);base=context.getImageData(0,0,size,size);}
      else base=texture(surface);
    }
    if (drawnPhase !== null && Math.abs(phase - drawnPhase) < .01) return;
    drawnPhase = phase;
    const image = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const index = (y*size + x)*4, nx = (x+.5-size/2)/(size/2), ny = (y+.5-size/2)/(size/2);
      const light = moonSurfaceLight(nx, ny, phase);
      if (light === null) continue;
      const shade = .055 + .945*Math.pow(light, .57);
      for (let c = 0; c < 3; c++) image.data[index+c] = base.data[index+c]*shade;
      image.data[index+3] = Math.round(255*Math.min(1, (1 - Math.hypot(nx, ny))*size/2));
    }
    ctx.putImageData(image, 0, 0);
  }
  function load(){
    if(loading)return;loading=true;canvas.dataset.texture='loading';
    lunarImage().then(image=>{sourceImage=image;photographic=true;base=null;drawnPhase=null;canvas.dataset.texture='nasa-lro';onSurfaceChange(true);if(lastPhase!==null)draw(lastPhase);})
      .catch(()=>{canvas.dataset.texture='fallback';onSurfaceChange(false);});
  }
  const resize=new ResizeObserver(()=>{if(lastPhase!==null)draw(lastPhase);});resize.observe(canvas);
  return {draw,isPhotographic:()=>photographic,setVisible(value){visible=value;if(value){load();if(lastPhase!==null)draw(lastPhase);}}};
}
