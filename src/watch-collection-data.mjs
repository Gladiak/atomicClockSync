import {normalizeWatchSpecs} from './watch-spec-data.mjs';
import {watchPhotoBounds,watchPhotoPlacement} from './watch-photo-frame.mjs';
const clean=(value,size)=>typeof value==='string'?value.trim().slice(0,size):'';
export function normalizeWatchDetails(value) {
  const acquiredAt=clean(value?.acquiredAt,10),parsed=Date.parse(acquiredAt+'T00:00:00Z');
  const photo=typeof value?.photo==='string'&&value.photo.length<=320000&&/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value.photo)?value.photo:'';
  const source=normalizePhotoSource(value?.photoSource),specs=normalizeWatchSpecs(value?.specs);
  return {photo,...(photo&&source?{photoSource:source}:{}),...(specs?{specs}:{}),note:clean(value?.note,1000),acquiredAt:/^\d{4}-\d\d-\d\d$/.test(acquiredAt)&&Number.isFinite(parsed)&&new Date(parsed).toISOString().slice(0,10)===acquiredAt?acquiredAt:''};
}
export function normalizePhotoSource(value){
  if(value?.provider!=='shockbase'||typeof value.model!=='string'||value.model.length>80)return null;
  try{
    const page=new URL(value.pageURL),image=new URL(value.imageURL);
    if([page,image].some(url=>url.protocol!=='https:'||!['shockbase.org','www.shockbase.org'].includes(url.hostname)||url.port||url.username||url.password))return null;
    if(page.pathname!=='/watches/watch_dyn.php'||page.searchParams.get('model')!==value.model||!image.pathname.startsWith('/pics2/'))return null;
    return {provider:'shockbase',model:value.model,pageURL:page.href,imageURL:image.href};
  }catch{return null;}
}
export async function compactWatchPhoto(file) {
  if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>12*1024*1024)throw Error('photo');
  const bitmap=await createImageBitmap(file);
  try{
    if(!bitmap.width||!bitmap.height||bitmap.width*bitmap.height>40_000_000)throw Error('photo');
    const scale=Math.min(1,768/Math.max(bitmap.width,bitmap.height));
    const working=document.createElement('canvas');working.width=Math.max(1,Math.round(bitmap.width*scale));working.height=Math.max(1,Math.round(bitmap.height*scale));
    const ctx=working.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0,working.width,working.height);
    const pixels=ctx.getImageData(0,0,working.width,working.height),bounds=watchPhotoBounds(pixels);
    if(bounds.removed){for(let i=0;i<bounds.removed.length;i++)if(bounds.removed[i])pixels.data[i*4+3]=0;ctx.putImageData(pixels,0,0);}
    const canvas=document.createElement('canvas');canvas.width=canvas.height=480;
    const output=canvas.getContext('2d'),placement=watchPhotoPlacement(bounds);
    output.imageSmoothingEnabled=true;output.imageSmoothingQuality='high';
    output.drawImage(working,bounds.left,bounds.top,bounds.width,bounds.height,placement.x,placement.y,placement.width,placement.height);
    let photo=canvas.toDataURL('image/webp',.9);
    if(photo.length>320000)photo=canvas.toDataURL('image/webp',.75);
    if(photo.length>320000)throw Error('photo');
    return photo;
  }finally{bitmap.close();}
}
