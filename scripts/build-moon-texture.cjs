// Input: the NASA CGI Moon Kit 2019 8K map, converted losslessly to PNG.
// Produce a north-up, longitude/latitude 0° orthographic near-side albedo disc.
const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{pathToFileURL}=require('node:url');
const input=process.argv[2];
if(!input){console.error('Usage: electron scripts/build-moon-texture.cjs map.png');app.exit(1);}
app.whenReady().then(async()=>{
 let win,temporary;
 try{
  temporary=fs.mkdtempSync(path.join(os.tmpdir(),'atomic-moon-build-'));const html=path.join(temporary,'index.html');fs.writeFileSync(html,'<!doctype html><title>Lunar texture projection</title>');
  win=new BrowserWindow({show:false,webPreferences:{sandbox:true,contextIsolation:true}});await win.loadFile(html);
  const data=await win.webContents.executeJavaScript(`(async()=>{
   const img=new Image();img.src=${JSON.stringify(pathToFileURL(path.resolve(input)).href)};await img.decode();
   if(img.naturalWidth!==8192||img.naturalHeight!==4096)throw Error('Expected the NASA 8192 × 4096 map');
   const map=document.createElement('canvas');map.width=img.naturalWidth;map.height=img.naturalHeight;const m=map.getContext('2d');m.drawImage(img,0,0);const source=m.getImageData(0,0,map.width,map.height).data;
   const canvas=document.createElement('canvas');const size=canvas.width=canvas.height=2048,ctx=canvas.getContext('2d'),image=ctx.createImageData(size,size);
   for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const nx=(x+.5-size/2)/(size/2),ny=(y+.5-size/2)/(size/2),r2=nx*nx+ny*ny;if(r2>=1)continue;
    const longitude=Math.atan2(nx,Math.sqrt(1-r2)),latitude=Math.asin(-ny);
    const u=(.5+longitude/(2*Math.PI))*map.width-.5,v=(.5-latitude/Math.PI)*map.height-.5,x0=Math.floor(u),y0=Math.floor(v),fx=u-x0,fy=v-y0,index=(y*size+x)*4;
    for(let c=0;c<3;c++){const a=source[(y0*map.width+x0)*4+c],b=source[(y0*map.width+x0+1)*4+c],d=source[((y0+1)*map.width+x0)*4+c],e=source[((y0+1)*map.width+x0+1)*4+c];image.data[index+c]=(a*(1-fx)+b*fx)*(1-fy)+(d*(1-fx)+e*fx)*fy;}
    image.data[index+3]=Math.round(255*Math.min(1,(1-Math.sqrt(r2))*size/2));
   }
   ctx.putImageData(image,0,0);return canvas.toDataURL('image/webp',.96).split(',')[1];
  })()`);
  const target=path.resolve(__dirname,'../assets/moon/lro-nearside.webp');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,Buffer.from(data,'base64'));console.log('Built '+target+' ('+fs.statSync(target).size+' bytes)');app.exit(0);
 }catch(error){console.error(error);app.exit(1);}finally{if(temporary)fs.rmSync(temporary,{recursive:true,force:true});}
});
