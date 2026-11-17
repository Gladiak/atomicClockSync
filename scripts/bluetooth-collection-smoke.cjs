// Exercise automatic collection imports through the real DOM and IPC, without hardware or network.
const {app,BrowserWindow,ipcMain}=require('electron');
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'atomic-bt-collection-')));
require('../electron/main.cjs');require('./offline-iss.cjs')();require('./offline-weather.cjs')();
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const family='GA-B2100',models=['GA-B2100-1A','GA-B2100C-9A'],key='a'.repeat(64);
let deviceId=0,searches=0,offline=false,delayed=false,failedSync=false,fixture='',sheets=[];
const reference=()=>({nowMs:Date.now(),host:'fixture.invalid',offsetMs:0,uncertaintyMs:10,synchronizedAt:Date.now()});
const page=model=>'https://shockbase.org/watches/watch_dyn.php?model='+model+'&subseries='+family+'&series=2100';
for(const name of ['clock:sync','bluetooth:scan','bluetooth:sync','bluetooth:cancel','watch-photos:search','watch-photos:image','watch-specs:get'])ipcMain.removeHandler(name);
ipcMain.handle('clock:sync',()=>({ok:true,...reference()}));
ipcMain.handle('bluetooth:scan',()=>({ok:true,devices:[{id:String(++deviceId),name:'CASIO '+family,model:family,module:'5689',instructions:'ga'}]}));
ipcMain.handle('bluetooth:sync',()=>failedSync?{ok:false,code:'uncertain'}:{ok:true,sent:true,reference:reference(),watch:{key,name:'CASIO '+family,model:family,module:'5689'}});
ipcMain.handle('bluetooth:cancel',()=>({ok:true}));
ipcMain.handle('watch-photos:search',()=>{searches++;return {ok:true,results:models.map((model,i)=>({id:String(i),model,family,pageURL:page(model)}))};});
ipcMain.handle('watch-specs:get',async(_event,id)=>{if(delayed)await pause(500);return offline?{ok:false,code:'network'}:{ok:true,model:models[Number(id)],specs:sheets[Number(id)]};});
ipcMain.handle('watch-photos:image',async(_event,id,full)=>{if(delayed&&full)await pause(500);const model=models[Number(id)];return offline?{ok:false,code:'network'}:{ok:true,model,pageURL:page(model),imageURL:'https://shockbase.org/pics2/'+model+'.png',dataURL:fixture};});
app.whenReady().then(async()=>{
 const win=BrowserWindow.getAllWindows()[0],errors=[];win.webContents.setAudioMuted(true);
 win.webContents.on('console-message',details=>{if(details.level==='error')errors.push(details.message);});
 win.webContents.session.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_r,callback)=>callback({cancel:true}));
 const run=code=>win.webContents.executeJavaScript(code,true);
 async function until(code){const end=Date.now()+15000;while(Date.now()<end){if(await run(code))return;await pause(35);}throw Error('Timeout: '+code);}
 async function capture(name){
  for(let attempt=0;attempt<3;attempt++){
   try{fs.writeFileSync('artifacts/bluetooth-collection/'+name+'.png',(await win.webContents.capturePage()).toPNG());return;}
   catch(error){if(attempt===2)throw error;await pause(300);}
  }
 }
 const saved=()=>run("JSON.parse(localStorage.getItem('atomic.profiles')||'[]')");
 async function sync(){
  await run("document.querySelector('[data-page=sync]').click();document.getElementById('bluetooth-button').click()");
  await until("!document.getElementById('bluetooth-update').disabled");
  await run("document.getElementById('bluetooth-update').click()");
  await until("!document.getElementById('bluetooth-search').disabled");
  await run("document.getElementById('bluetooth-close').click()");
  await until("!document.getElementById('bluetooth-button').disabled");
 }
 async function picker(){
  await run("document.querySelector('[data-page=profiles]').click();document.querySelector('.watch-card-more').click()");
  assert.equal(await run("document.querySelector('.watch-card-actions').matches(':popover-open')"),true);
  await run("document.querySelector('.watch-card-variant').click()");
  await until("document.querySelectorAll('.photo-candidate').length===2&&!document.getElementById('photo-picker-search').disabled");
 }
 try{
  if(win.webContents.isLoading())await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));
  await until("!document.getElementById('start-button').disabled");win.showInactive();
  fixture=await run("(()=>{const c=document.createElement('canvas');c.width=c.height=200;const x=c.getContext('2d');x.fillStyle='white';x.fillRect(0,0,200,200);x.fillStyle='#607060';x.fillRect(75,10,50,180);x.fillStyle='#1d2823';x.fillRect(50,60,100,80);return c.toDataURL('image/png')})()");
  sheets=models.map((model,i)=>({version:1,model,subseries:family,moduleIds:['5689'],physical:{weightG:52+i,sizeMm:[48.5,45.4,11.9]},edition:{collection:'G-SHOCK'},release:{year:2022,month:5},source:{provider:'shockbase',url:page(model),retrievedAt:Date.now()}}));
  delayed=true;await sync();assert.equal((await saved()).length,1,'Base watch is saved before catalogue finishes');
  await until("JSON.parse(localStorage.getItem('atomic.profiles'))[0].details.variant.status==='automatic'");delayed=false;
  let profile=(await saved())[0];assert.equal(profile.model,models[0]);assert.equal(profile.details.specs.model,models[0]);assert.ok(profile.details.photo);assert.equal(profile.bluetooth.key,key);
  assert.equal(await run("JSON.parse(localStorage.getItem('atomic.activeProfile')||'null')"),null,'Creating a Bluetooth watch preserves active radio selection');
  const beforeSearches=searches;await sync();assert.equal((await saved()).length,1);assert.equal(searches,beforeSearches,'Repeat sends do not reimport a chosen variant');
  failedSync=true;await sync();assert.equal((await saved()).length,1);assert.equal(searches,beforeSearches);failedSync=false;
  await run("document.querySelector('[data-page=profiles]').click();document.querySelector('.watch-card-select').click();document.getElementById('profile-name').value='My daily watch';document.getElementById('collection-note').value='Keep my story';document.getElementById('collection-acquired').value='2024-02-29';document.getElementById('profile-form').requestSubmit()");
  await picker();assert.equal(await run("document.getElementById('photo-picker-query').value"),family);
  await run("document.getElementById('collection-note').value='An unsaved note';document.querySelectorAll('.photo-candidate')[1].click()");
  await until("!document.getElementById('photo-picker-dialog').open");
  profile=(await saved())[0];assert.equal(profile.model,models[1]);assert.equal(profile.details.specs.model,models[1]);assert.equal(profile.details.photoSource.model,models[1]);assert.equal(profile.details.variant.status,'confirmed');
  assert.equal(profile.name,'My daily watch');assert.equal(profile.details.note,'Keep my story');assert.equal(profile.details.acquiredAt,'2024-02-29');
  assert.equal(await run("document.getElementById('collection-note').value"),'An unsaved note','Import preserves personal draft without silently saving it');
  await run("document.getElementById('profile-cancel').click()");assert.deepEqual((await saved())[0],profile,'Cancel does not discard an already imported variant');
  assert.equal(await run("document.activeElement.classList.contains('watch-card-more')"),true,'Editor returns focus to the card menu');
  // Individual server imports for an existing unchanged model also persist immediately.
  sheets[1].physical.weightG=77;
  await run("document.querySelector('.watch-card-specs').click();document.getElementById('collection-spec-import').click()");
  await until("document.querySelectorAll('.photo-candidate').length===2&&!document.getElementById('photo-picker-search').disabled");
  await run("document.querySelectorAll('.photo-candidate')[1].click()");await until("!document.getElementById('photo-picker-review').hidden");
  await run("document.getElementById('photo-picker-import').click()");await until("!document.getElementById('photo-picker-dialog').open");
  assert.equal((await saved())[0].details.specs.physical.weightG,77,'Confirmed sheet import autosaves');
  await run("document.getElementById('profile-editor-close').click();document.querySelector('.watch-card-select').click();document.getElementById('collection-online').click()");
  await until("document.querySelectorAll('.photo-candidate').length===2&&!document.getElementById('photo-picker-search').disabled");
  fixture=await run("(()=>{const c=document.createElement('canvas');c.width=c.height=200;const x=c.getContext('2d');x.fillStyle='#785e21';x.fillRect(50,10,100,180);return c.toDataURL('image/png')})()");
  await run("document.querySelectorAll('.photo-candidate')[1].click()");await until("!document.getElementById('photo-picker-dialog').open");
  assert.notEqual((await saved())[0].details.photo,profile.details.photo,'Selected photo autosaves');
  await run("document.getElementById('profile-cancel').click()");profile=(await saved())[0];
  offline=true;await picker();await run("document.querySelector('.photo-candidate').click()");await until("document.getElementById('photo-picker-status').textContent.includes('unavailable')");
  assert.deepEqual((await saved())[0],profile,'An incomplete pair cannot overwrite a saved variant');
  await run("document.getElementById('photo-picker-close').click();document.getElementById('profile-cancel').click()");offline=false;
  delayed=true;await picker();await run("document.querySelector('.photo-candidate').click();document.getElementById('photo-picker-close').click()");await pause(650);assert.deepEqual((await saved())[0],profile,'Closed chooser ignores late responses');delayed=false;
  await run("document.getElementById('profile-cancel').click()");
  for(const [language,label]of [['en','Choose variant'],['it','Scegli variante'],['fr','Choisir la variante'],['de','Variante wählen'],['es','Elegir variante'],['ja','バリエーションを選択']]){
   await run(`document.getElementById('language-select').value='${language}';document.getElementById('language-select').dispatchEvent(new Event('change'))`);
   assert.equal(await run("document.querySelector('.watch-card-variant').textContent"),label);
   await picker();assert.equal(await run("document.getElementById('photo-picker-title').textContent"),label);
   assert.equal(await run("document.getElementById('photo-picker-dialog').scrollWidth<=document.getElementById('photo-picker-dialog').clientWidth+1"),true);
   await run("document.getElementById('photo-picker-close').click();document.getElementById('profile-cancel').click()");
  }
  await run("document.getElementById('language-select').value='it';document.getElementById('language-select').dispatchEvent(new Event('change'));document.getElementById('toast').hidden=true");
  win.webContents.reload();await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));await until("!document.getElementById('start-button').disabled");
  await sync();assert.equal((await saved()).length,1);assert.equal((await saved())[0].model,models[1]);assert.equal((await saved())[0].bluetooth.key,key);
  assert.equal(await run("JSON.parse(localStorage.getItem('atomic.bluetooth.history.v1'))[0].profileId"),profile.id);
  await run("document.querySelector('[data-page=profiles]').click();[...document.querySelectorAll('.watch-card-actions button')].find(button=>button.textContent==='Cronologia').click()");
  assert.ok(await run("Number(document.getElementById('history-count').textContent.replace(/[^0-9]/g,''))>0"),'Collection history includes linked Bluetooth attempts');
  // Four illustrative cards exercise the new gallery, including a missing photo and long names.
  await run(`(()=>{const profiles=JSON.parse(localStorage.getItem('atomic.profiles'));const base=profiles[0];
    function portrait(colour,digital){const c=document.createElement('canvas');c.width=c.height=480;const x=c.getContext('2d');
      x.fillStyle=colour;x.beginPath();x.roundRect(186,20,108,440,25);x.fill();x.fillStyle='#222a2b';x.beginPath();x.roundRect(132,126,216,228,46);x.fill();
      x.strokeStyle='#687174';x.lineWidth=10;x.stroke();x.fillStyle=digital?'#b0bda9':'#20282a';x.beginPath();x.roundRect(159,171,162,123,16);x.fill();
      if(digital){x.fillStyle='#263b33';x.font='40px monospace';x.fillText('10:08',178,248);}else{x.strokeStyle='#ece8d9';x.lineWidth=7;x.beginPath();x.moveTo(240,235);x.lineTo(197,205);x.moveTo(240,235);x.lineTo(280,209);x.stroke();}
      return c.toDataURL('image/png');}
    base.details.photo=portrait('#b8973b',false);base.name='Il mio G-Shock';base.details.note='Il compagno di tutti i giorni.';
    const other={...base,id:'layout-second',name:'Mudmaster',model:'GWG-B1000-1A',bluetooth:undefined,details:{photo:portrait('#354e44',true),note:'Per i sentieri, senza fretta.',acquiredAt:'2025-06-18'}};
    const missing={...base,id:'layout-third',name:'Una storia speciale da portare sempre al polso 日本語',model:'GW-6900',bluetooth:undefined,details:{photo:'',note:''}};
    const automatic={...base,id:'layout-fourth',name:'GST-B1000D-1A',model:'GST-B1000D-1A',bluetooth:undefined,details:{photo:portrait('#8b9294',false),variant:{family:'GST-B1000',status:'automatic'}}};
    localStorage.setItem('atomic.profiles',JSON.stringify([base,other,missing,automatic]));localStorage.setItem('atomic.activeProfile',JSON.stringify(base.id));})();`);
  win.webContents.reload();await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));await until("!document.getElementById('start-button').disabled");
  await run("document.querySelector('[data-page=profiles]').click();document.getElementById('toast').hidden=true");
  assert.deepEqual(await run("[...document.querySelector('.watch-card-facts').querySelectorAll('dt')].map(el=>el.textContent)"),['Modulo','Peso','Dimensioni','Collezione','Data di uscita']);
  assert.deepEqual(await run("[...document.querySelector('.watch-card-facts').querySelectorAll('dd')].map(el=>el.textContent)"),['5689','77 g','48,5 × 45,4 × 11,9 mm','G-SHOCK','maggio 2022']);
  assert.deepEqual(await run("[...document.querySelectorAll('.watch-card')[2].querySelectorAll('.watch-card-facts dd')].map(el=>el.textContent)"),Array(5).fill('—'),'Missing technical data are not fabricated');
  assert.equal(await run("(()=>{const cards=[...document.querySelectorAll('.watch-card')].map(el=>el.getBoundingClientRect());return cards[0].width<340&&cards.slice(0,3).every(rect=>Math.abs(rect.top-cards[0].top)<1)&&cards[3].top>cards[0].bottom})()"),true,'Three narrow cards per row');
  await until("document.querySelector('.watch-card-media svg').viewBox.baseVal.height>document.querySelector('.watch-card-media svg').viewBox.baseVal.width");
  assert.equal(await run("(()=>{const card=document.querySelector('.watch-card'),photo=card.querySelector('.watch-card-media'),body=card.querySelector('.watch-card-body'),image=photo.querySelector('svg');return photo.getBoundingClientRect().right<=body.getBoundingClientRect().left+1&&image.getBoundingClientRect().height>=240&&image.viewBox.baseVal.x>0})()"),true,'Large portrait fits visible watch pixels to the left of the details');
  assert.equal(await run("document.querySelector('.watch-card-active').getAttribute('aria-pressed')"),'true');
  assert.equal(await run("(()=>{const cards=[...document.querySelectorAll('.watch-card')].slice(0,3);return cards.every(card=>Math.abs(card.getBoundingClientRect().height-cards[0].getBoundingClientRect().height)<1)&&cards.every(card=>Math.abs(card.querySelector('.watch-card-facts').getBoundingClientRect().top-cards[0].querySelector('.watch-card-facts').getBoundingClientRect().top)<1)})()"),true,'Cards and technical lists align across the row');
  const fits="[...document.querySelectorAll('.watch-card')].every(card=>card.scrollWidth<=card.clientWidth+1&&[...card.querySelectorAll('.watch-card-body,.watch-card-caption,.watch-card-facts,.watch-card-facts dd')].every(el=>el.scrollWidth<=el.clientWidth+1&&el.getBoundingClientRect().right<=card.getBoundingClientRect().right+1))";
  for(const language of ['en','it','fr','de','es','ja']){
   await run(`document.getElementById('language-select').value='${language}';document.getElementById('language-select').dispatchEvent(new Event('change'))`);assert.equal(await run(fits),true,language+' cards fit');
  }
  fs.mkdirSync('artifacts/bluetooth-collection',{recursive:true});
  for(const theme of ['lime','cyan','fuchsia','ruby','gold','aqua','amethyst','lava','soft-sage','powder-blue','soft-lavender','warm-sand','rainbow','rainbow-soft','atlantic']){
   await run(`document.getElementById('theme-select').value='${theme}';document.getElementById('theme-select').dispatchEvent(new Event('change'));document.getElementById('language-select').value='it';document.getElementById('language-select').dispatchEvent(new Event('change'))`);assert.equal(await run(fits),true,theme+' cards fit');
   if(['lime','atlantic'].includes(theme)){
    await run("for(const element of [document.getElementById('page-profiles'),document.querySelector('.page-header>div')])for(const animation of element.getAnimations())animation.finish()");
    await pause(200);await capture('cards-'+theme+'-it');
   }
  }
  await run("document.querySelector('.watch-card-more').click()");
  await pause(100);await capture('cards-menu-it');
  assert.equal(await run("document.activeElement.classList.contains('watch-card-variant')"),true,'Menu starts on its first action');
  win.webContents.sendInputEvent({type:'keyDown',keyCode:'Down'});win.webContents.sendInputEvent({type:'keyUp',keyCode:'Down'});await pause(50);
  assert.match(await run("document.activeElement.textContent"),/Cerca foto/);
  win.webContents.sendInputEvent({type:'keyDown',keyCode:'Escape'});win.webContents.sendInputEvent({type:'keyUp',keyCode:'Escape'});await pause(50);
  assert.equal(await run("document.querySelector('.watch-card-actions').matches(':popover-open')"),false);assert.equal(await run("document.activeElement.classList.contains('watch-card-more')"),true);
  await run("[...document.querySelectorAll('.watch-card-more')].at(-1).scrollIntoView({block:'center'})");await pause(100);await run("[...document.querySelectorAll('.watch-card-more')].at(-1).click()");
  assert.equal(await run("(()=>{const r=document.querySelector(':popover-open').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight})()"),true,'Menu stays in viewport near page edge');
  const outside=await run("(()=>{const r=document.getElementById('page-title').getBoundingClientRect();return {x:Math.round(r.left+20),y:Math.round(r.top+10)}})()");
  win.webContents.sendInputEvent({type:'mouseDown',button:'left',clickCount:1,...outside});win.webContents.sendInputEvent({type:'mouseUp',button:'left',clickCount:1,...outside});await pause(50);
  assert.equal(await run("document.querySelectorAll(':popover-open').length"),0,'Outside click closes actions');
  win.setContentSize(800,740);await pause(100);assert.equal(await run(fits),true,'Narrow gallery fits');win.setContentSize(1100,740);
  assert.deepEqual(errors,[]);
  console.log('PASS: Bluetooth collection/enrichment, variant and individual import autosave, persistence/history, four minimal gallery cards, keyboard/viewport menu, six languages, fifteen themes and narrow layout.');
 }catch(error){console.error(error.stack||error,errors);process.exitCode=1;}
 finally{app.exit(process.exitCode||0);}
});
