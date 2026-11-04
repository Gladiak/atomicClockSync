const {app,BrowserWindow,ipcMain}=require('electron');
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'atomic-watch-photos-')));
require('../electron/main.cjs');
require('./offline-iss.cjs')();
ipcMain.removeHandler('clock:sync');ipcMain.handle('clock:sync',()=>({ok:false,error:'Offline photo test'}));
let fixture='',offline=false,delayed=false,requests=0;
const source={provider:'shockbase',model:'GA-B2100C-9A',pageURL:'https://shockbase.org/watches/watch_dyn.php?model=GA-B2100C-9A',imageURL:'https://shockbase.org/pics2/2100/GA-B2100/GA-B2100C-9A.png'};
ipcMain.removeHandler('watch-photos:search');ipcMain.handle('watch-photos:search',async(_event,query)=>{
 requests++;if(delayed)await new Promise(resolve=>setTimeout(resolve,500));
 if(offline)return{ok:false,code:'network'};
 return{ok:true,results:query==='EMPTY'?[]:Array.from({length:10},(_,i)=>({id:String(i),model:i?`GA-B2100-${i}A`:source.model,pageURL:source.pageURL}))};
});
ipcMain.removeHandler('watch-photos:image');ipcMain.handle('watch-photos:image',async(_event,id,full)=>{
 if(delayed&&full)await new Promise(resolve=>setTimeout(resolve,500));
 return offline?{ok:false,code:'network'}:{ok:true,...source,dataURL:fixture};
});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
 const win=BrowserWindow.getAllWindows()[0],errors=[];win.webContents.setAudioMuted(true);
 win.webContents.on('console-message',details=>{if(details.level==='error')errors.push(details.message);});
 win.webContents.session.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_r,callback)=>callback({cancel:true}));
 const run=source=>win.webContents.executeJavaScript(source,true);
 async function until(source){const end=Date.now()+15000;while(Date.now()<end){if(await run(source))return;await pause(60);}throw Error('Timeout '+source);}
 async function capture(name){fs.mkdirSync('artifacts/watch-photos',{recursive:true});await run("document.getElementById('toast').hidden=true");await pause(400);for(let i=0;i<3;i++)try{fs.writeFileSync('artifacts/watch-photos/'+name+'.png',(await win.webContents.capturePage()).toPNG());return;}catch(error){if(i===2)throw error;await pause(300);}}
 try{
  if(win.webContents.isLoading())await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));win.showInactive();
  await until("!document.getElementById('start-button').disabled");
  fixture=await run("(()=>{const c=document.createElement('canvas');c.width=600;c.height=500;const x=c.getContext('2d');x.fillStyle='white';x.fillRect(0,0,600,500);x.fillStyle='#26374e';x.fillRect(370,30,100,360);x.fillStyle='white';x.fillRect(390,150,60,90);return c.toDataURL('image/png')})()");
  await run("document.querySelector('[data-page=profiles]').click();document.getElementById('profile-new').click();document.getElementById('profile-name').value='Daily 日本語';document.getElementById('profile-model').value='GA-B2100';document.getElementById('collection-note').value='My personal story';document.getElementById('profile-form').requestSubmit();document.querySelector('.watch-card-select').click();document.querySelector('.watch-personal-details').open=true;document.getElementById('collection-online').click()");
  await until("document.querySelectorAll('.photo-candidate').length===8");assert.equal(requests,1);
  await run("document.getElementById('photo-picker-next').click()");assert.equal(await run("document.querySelectorAll('.photo-candidate').length"),2);
  await run("document.getElementById('photo-picker-previous').click();document.querySelector('.photo-candidate').click()");
  await until("!document.getElementById('photo-picker-review').hidden");
  await run("document.getElementById('photo-picker-adopt').click()");
  await until("!document.getElementById('photo-picker-dialog').open");
  assert.equal(await run("JSON.parse(localStorage.getItem('atomic.profiles'))[0].details.photo"),'','Selecting a photo must not silently save a profile');
  const geometry=await run("(async()=>{const bitmap=await createImageBitmap(await (await import('./watch-photo-frame.mjs')).photoDataBlob(document.querySelector('#collection-preview img').src));const c=document.createElement('canvas');c.width=bitmap.width;c.height=bitmap.height;const x=c.getContext('2d');x.drawImage(bitmap,0,0);const p=x.getImageData(0,0,c.width,c.height).data;let left=c.width,right=0,top=c.height,bottom=0;for(let y=0;y<c.height;y++)for(let col=0;col<c.width;col++)if(p[(y*c.width+col)*4+3]>100){left=Math.min(left,col);right=Math.max(right,col);top=Math.min(top,y);bottom=Math.max(bottom,y);}bitmap.close();return {width:c.width,height:c.height,left,right,top,bottom,dial:p[(240*c.width+240)*4+3],corner:p[3]}})()");
  assert.equal(geometry.width,480);assert.equal(geometry.height,480);assert.equal(geometry.corner,0);assert.ok(geometry.dial>240,'White dial stays opaque');assert.ok(Math.abs((geometry.left+geometry.right)/2-239.5)<=2);assert.ok(Math.abs((geometry.top+geometry.bottom)/2-239.5)<=2);assert.ok(geometry.top>=39);
  await run("document.getElementById('profile-form').requestSubmit()");
  const saved=await run("JSON.parse(localStorage.getItem('atomic.profiles'))[0]");assert.deepEqual(saved.details.photoSource,source);assert.match(saved.details.photo,/^data:image\/webp;base64,/);assert.equal(saved.details.note,'My personal story');
  await run("document.querySelector('.watch-card-select').click();document.getElementById('collection-reframe').click()");await until("!document.getElementById('profile-save').disabled");await run("document.getElementById('profile-form').requestSubmit()");
  assert.deepEqual(await run("JSON.parse(localStorage.getItem('atomic.profiles'))[0].details.photoSource"),source);
  win.webContents.reload();await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));await until("!document.getElementById('start-button').disabled");
  await run("document.querySelector('[data-page=profiles]').click();document.querySelector('.watch-personal-details').open=true");
  assert.equal(await run("document.querySelectorAll('.watch-photo-credit').length"),1);
  await capture('collection');
  await run("document.querySelector('.watch-card-select').click();document.querySelector('.watch-personal-details').open=true");
  await capture('editor');
  offline=true;await run("document.getElementById('collection-online').click()");await until("document.getElementById('photo-picker-status').textContent.includes('Check your connection')");await run("document.getElementById('photo-picker-close').click()");
  assert.equal(await run("JSON.parse(localStorage.getItem('atomic.profiles'))[0].details.photo"),await run("document.querySelector('#collection-preview img').src"));
  assert.equal(await run("document.getElementById('profile-editor-dialog').open"),true,'Closing the photo picker keeps the watch editor open');
  offline=false;delayed=true;await run("document.getElementById('collection-online').click();document.getElementById('photo-picker-close').click()");await pause(700);assert.equal(await run("document.getElementById('photo-picker-dialog').open"),false);
  delayed=false;
  for(const language of ['en','it','fr','de','es','ja']){
   await run(`document.getElementById('language-select').value='${language}';document.getElementById('language-select').dispatchEvent(new Event('change'));document.getElementById('collection-online').click()`);
   await until("document.querySelectorAll('.photo-candidate').length===8");
   assert.equal(await run("document.getElementById('photo-picker-dialog').scrollWidth<=document.getElementById('photo-picker-dialog').clientWidth+1"),true,language+' dialog width');
   if(language==='it')await capture('picker-it');
   await run("document.getElementById('photo-picker-close').click()");
  }
  await run("document.getElementById('language-select').value='en';document.getElementById('language-select').dispatchEvent(new Event('change'));document.getElementById('collection-photo').disabled=false;document.getElementById('collection-remove-photo').click();document.getElementById('profile-form').requestSubmit()");
  assert.equal(await run("JSON.parse(localStorage.getItem('atomic.profiles'))[0].details.photoSource"),undefined);
  assert.deepEqual(errors,[]);console.log('PASS: catalogue variants and pagination, 480px centering/transparency, preserved dial, attribution, explicit save, reframe/reload, offline failure, cancellation and six languages.');
 }catch(error){console.error(error.stack||error,errors);process.exitCode=1;}
 finally{win.destroy();app.quit();}
});
