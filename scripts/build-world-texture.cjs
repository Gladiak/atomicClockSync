// Project the NASA Blue Marble equirectangular JPEG into the app's exact atlas frame.
const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{pathToFileURL}=require('node:url');
const input=process.argv[2];
if(!input){console.error('Usage: electron scripts/build-world-texture.cjs BlueMarble.jpg');app.exit(1);}
app.whenReady().then(async()=>{
 let temporary,code=0;
 try{
  temporary=fs.mkdtempSync(path.join(os.tmpdir(),'atomic-world-build-'));const html=path.join(temporary,'index.html');fs.writeFileSync(html,'<!doctype html><title>Blue Marble projection</title>');
  const win=new BrowserWindow({show:false,webPreferences:{sandbox:true,contextIsolation:true}});await win.loadFile(html);
  const data=await win.webContents.executeJavaScript(`(async()=>{
   const {createWorldProjection}=await import(${JSON.stringify(pathToFileURL(path.resolve(__dirname,'../src/world-map-geometry.mjs')).href)});
   const projection=createWorldProjection(),img=new Image();img.src=${JSON.stringify(pathToFileURL(path.resolve(input)).href)};await img.decode();
   if(img.naturalWidth!==5400||img.naturalHeight!==2700)throw Error('Expected NASA 5400 × 2700 global map');
   const source=document.createElement('canvas');source.width=img.naturalWidth;source.height=img.naturalHeight;const m=source.getContext('2d');m.drawImage(img,0,0);const pixels=m.getImageData(0,0,source.width,source.height).data;
   const canvas=document.createElement('canvas');canvas.width=4000;canvas.height=1760;const ctx=canvas.getContext('2d'),image=ctx.createImageData(canvas.width,canvas.height);
   for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
    const point=[(x+.5)/4,(y+.5)/4],coordinate=projection.invert(point);if(!coordinate||!coordinate.every(Number.isFinite))continue;
    const [lon,lat]=coordinate;if(Math.abs(lon)>180||Math.abs(lat)>90)continue;const check=projection(coordinate);if(Math.hypot(check[0]-point[0],check[1]-point[1])>.001)continue;
    const u=Math.max(0,Math.min(source.width-1,(lon+180)/360*source.width-.5)),v=Math.max(0,Math.min(source.height-1,(90-lat)/180*source.height-.5));
    const x0=Math.floor(u),y0=Math.floor(v),x1=Math.min(x0+1,source.width-1),y1=Math.min(y0+1,source.height-1),fx=u-x0,fy=v-y0,index=(y*canvas.width+x)*4;
    for(let c=0;c<3;c++){const a=pixels[(y0*source.width+x0)*4+c],b=pixels[(y0*source.width+x1)*4+c],d=pixels[(y1*source.width+x0)*4+c],e=pixels[(y1*source.width+x1)*4+c];image.data[index+c]=(a*(1-fx)+b*fx)*(1-fy)+(d*(1-fx)+e*fx)*fy;}
    image.data[index+3]=255;
   }
   ctx.putImageData(image,0,0);return canvas.toDataURL('image/webp',.94).split(',')[1];
  })()`);
  const target=path.resolve(__dirname,'../assets/world/blue-marble-natural-earth.webp');fs.writeFileSync(target,Buffer.from(data,'base64'));console.log('Built '+target+' ('+fs.statSync(target).size+' bytes)');
 }catch(error){console.error(error);code=1;}finally{if(temporary)fs.rmSync(temporary,{recursive:true,force:true});app.exit(code);}
});
