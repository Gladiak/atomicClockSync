// Border-connected background removal for catalogue shots. Interior white dial
// details stay opaque; a busy photographic background is kept intact.
export function watchPhotoBounds({data,width,height}) {
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||data.length!==width*height*4)throw Error('photo');
  const length=width*height,border=[];
  for(let x=0;x<width;x++){border.push(x,(height-1)*width+x);}
  for(let y=1;y<height-1;y++)border.push(y*width,y*width+width-1);
  const opaque=border.filter(i=>data[i*4+3]>240);
  const median=channel=>{const values=opaque.map(i=>data[i*4+channel]).sort((a,b)=>a-b);return values[Math.floor(values.length/2)]??255;};
  const background=[median(0),median(1),median(2)];
  const close=i=>Math.max(...background.map((value,c)=>Math.abs(data[i*4+c]-value)))<=28;
  const uniform=opaque.length/border.length>=.85&&border.filter(i=>data[i*4+3]<16||close(i)).length/border.length>=.88;
  const removed=new Uint8Array(length),queue=new Int32Array(length);let read=0,write=0;
  const visit=i=>{if(removed[i])return;if(data[i*4+3]<16||(uniform&&close(i))){removed[i]=1;queue[write++]=i;}};
  for(const i of border)visit(i);
  while(read<write){const i=queue[read++],x=i%width;if(x)visit(i-1);if(x<width-1)visit(i+1);if(i>=width)visit(i-width);if(i<length-width)visit(i+width);}
  let left=width,top=height,right=-1,bottom=-1,visible=0;
  for(let i=0;i<length;i++)if(!removed[i]&&data[i*4+3]>=16){const x=i%width,y=Math.floor(i/width);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);visible++;}
  // A solid swatch or an almost-empty image has no reliable object boundary.
  // Keep the original frame instead of fabricating a cutout.
  if(!visible||right-left<2||bottom-top<2)return {left:0,top:0,width,height,removed:null};
  const padding=Math.max(1,Math.round(Math.max(right-left,bottom-top)*.008));
  const x=Math.max(0,left-padding),y=Math.max(0,top-padding);
  return {left:x,top:y,width:Math.min(width-1,right+padding)-x+1,height:Math.min(height-1,bottom+padding)-y+1,removed};
}
export function watchPhotoPlacement(bounds,size=480,padding=40){
  const scale=(size-2*padding)/Math.max(bounds.width,bounds.height);
  const width=bounds.width*scale,height=bounds.height*scale;
  return {x:(size-width)/2,y:(size-height)/2,width,height};
}
export function photoDataBlob(dataURL){
  const match=typeof dataURL==='string'&&dataURL.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if(!match||dataURL.length>12*1024*1024)throw Error('photo');
  const bytes=Uint8Array.from(atob(match[2]),char=>char.charCodeAt(0));
  return new Blob([bytes],{type:match[1]});
}
