const {app,BrowserWindow,ipcMain}=require('electron');
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'atomic-watch-specs-')));
require('../electron/main.cjs');
require('./offline-iss.cjs')();
ipcMain.removeHandler('clock:sync');ipcMain.handle('clock:sync',()=>({ok:false,error:'Offline catalogue test'}));
const model='GA-B2100C-9A',pageURL='https://shockbase.org/watches/watch_dyn.php?model='+model+'&subseries=GA-B2100&series=2100';
const fixture=`<div id="header2outer"><header2inner>${model}</header2inner></div><table><tr><td>Module:</td><td>5689</td></tr><tr><td>Subseries:</td><td>GA-B2100</td></tr><tr><td>Series:</td><td>2100</td></tr><tr><td>Release:</td><td>May 2022</td></tr><tr><td>Weight:</td><td>52 g</td></tr><tr><td>Size (HxWxT):</td><td>48.5 x 45.4 x 11.9 mm</td></tr><tr><td>Band:</td><td>Resin</td></tr><tr><td>Glass:</td><td>Mineral Glass</td></tr><tr><td>Battery:</td><td>CTL920</td></tr><tr><td>Battery Life:</td><td>Rechargeable</td></tr><tr><td class="cellactive"><a>Bluetooth</a></td><td class="cellinactive">GPS</td><td class="cellactive"><a>Tough Solar</a></td></tr></table><a href="https://www.casio.com/content/dam/casio/global/support/manuals/watches/pdf/56/5689/qw5689_IT.pdf">IT</a>`;
let offline=false,delayed=false,wrong=false,sheet;
ipcMain.removeHandler('watch-photos:search');ipcMain.handle('watch-photos:search',()=>offline?{ok:false,code:'network'}:{ok:true,results:[{id:'1',model,family:'GA-B2100',pageURL}]});
ipcMain.removeHandler('watch-photos:image');ipcMain.handle('watch-photos:image',()=>({ok:false,code:'network'}));
ipcMain.removeHandler('watch-specs:get');ipcMain.handle('watch-specs:get',async()=>{if(delayed)await new Promise(r=>setTimeout(r,500));return offline?{ok:false,code:'network'}:wrong?{ok:false,code:'identity'}:{ok:true,model,family:'GA-B2100',pageURL,specs:sheet};});
let openedManual='';ipcMain.removeHandler('watch-specs:manual');ipcMain.handle('watch-specs:manual',(_event,url)=>{openedManual=url;return{ok:true};});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
 const win=BrowserWindow.getAllWindows()[0],errors=[];win.webContents.setAudioMuted(true);
 win.webContents.on('console-message',details=>{if(details.level==='error')errors.push(details.message);});
 win.webContents.session.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_r,callback)=>callback({cancel:true}));
 const run=source=>win.webContents.executeJavaScript(source,true);
 async function until(source){const end=Date.now()+15000;while(Date.now()<end){if(await run(source))return;await pause(60);}throw Error('Timeout '+source);}
 async function search(){await run("if(document.getElementById('collection-spec-panel').hidden)document.getElementById('collection-spec-open').click();document.getElementById('collection-spec-import').click()");await until("document.querySelector('.photo-candidate')&&!document.querySelector('.photo-candidate').disabled");await run("document.querySelector('.photo-candidate').click()");}
 async function review(){await search();await until("!document.getElementById('photo-picker-review').hidden&&!document.getElementById('photo-picker-adopt').disabled");}
 async function capture(name){fs.mkdirSync('artifacts/watch-specs',{recursive:true});await run("document.getElementById('toast').hidden=true");await pause(350);for(let i=0;i<3;i++)try{fs.writeFileSync('artifacts/watch-specs/'+name+'.png',(await win.webContents.capturePage()).toPNG());return;}catch(error){if(i===2)throw error;await pause(250);}}
 try{
  sheet=await require('../electron/watch-specs.cjs').parseWatchSpecs(fixture,pageURL,model,Date.now());
  if(win.webContents.isLoading())await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));win.showInactive();await until("!document.getElementById('start-button').disabled");
  await run("document.querySelector('[data-page=profiles]').click();document.getElementById('profile-new').click();document.getElementById('profile-name').value='Daily G-Shock';document.getElementById('profile-model').value='GA-B2100';document.getElementById('collection-note').value='Keep my story'");
  await run("document.getElementById('collection-spec-open').focus();document.getElementById('collection-spec-open').click()");
  assert.equal(await run("document.querySelectorAll('dialog[open]').length"),1,'Sheet reuses the editor dialog');
  assert.equal(await run("document.getElementById('collection-editor-fields').hidden"),true);
  assert.equal(await run("document.getElementById('collection-spec-panel').hidden"),false);
  assert.equal(await run("document.getElementById('profile-editor-dialog').getAttribute('aria-labelledby')"),'collection-spec-title');
  assert.equal(await run("document.getElementById('collection-spec-import').getAttribute('aria-label')"),'Import from ShockBase');
  assert.equal(await run("document.getElementById('collection-spec-remove').hidden"),true);
  await run("document.getElementById('collection-spec-back').click()");
  assert.equal(await run("document.activeElement.id"),'collection-spec-open');
  assert.equal(await run("document.getElementById('collection-note').value"),'Keep my story');
  await run("document.getElementById('profile-name').value='';document.getElementById('collection-spec-open').click();document.getElementById('collection-spec-save').click()");
  assert.equal(await run("document.getElementById('collection-editor-fields').hidden"),false,'Invalid required field returns to details');
  assert.equal(await run("document.activeElement.id"),'profile-name');
  await run("document.getElementById('profile-name').value='Daily G-Shock'");
  await review();assert.equal(await run("document.getElementById('photo-picker-import').hidden"),true);assert.match(await run("document.getElementById('photo-picker-match').textContent"),/Only the family/);
  await run("document.getElementById('photo-picker-adopt').click()");await until("!document.getElementById('photo-picker-dialog').open");assert.equal(await run("document.getElementById('profile-model').value"),model);
  assert.equal(await run("JSON.parse(localStorage.getItem('atomic.profiles')||'[]').length"),0);
  assert.match(await run("document.getElementById('collection-spec-content').textContent"),/52 g/);
  assert.equal(await run("document.getElementById('collection-spec-import').getAttribute('aria-label')"),'Update from ShockBase');
  assert.equal(await run("document.getElementById('collection-spec-import').title"),'Update from ShockBase');
  assert.equal(await run("document.querySelectorAll('#collection-spec-actions button svg').length"),2,'Accessible icon actions survive rendering');
  const deleteColour=await run("getComputedStyle(document.getElementById('collection-spec-remove')).color");assert.match(deleteColour,/255, 142, 150/);
  await run("document.getElementById('profile-editor-dialog').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true,cancelable:true}))");
  assert.equal(await run("document.getElementById('profile-editor-dialog').open"),true,'Escape from sheet returns to details');
  assert.equal(await run("document.getElementById('collection-spec-panel').hidden"),true);
  assert.equal(await run("document.getElementById('collection-note').value"),'Keep my story');
  await run("document.getElementById('collection-spec-open').click()");

  assert.equal(await run("getComputedStyle(document.getElementById('profile-editor-body')).overflowY"),'auto','Editor contents scroll with the pointer');
  await run("document.querySelector('.spec-manuals button').click()");await pause(100);assert.equal(openedManual,sheet.manuals[0].url);
  await run("document.getElementById('profile-model').value='GA-B2100C-1A';document.getElementById('profile-model').dispatchEvent(new Event('input'));document.getElementById('profile-form').requestSubmit()");
  assert.equal(await run("JSON.parse(localStorage.getItem('atomic.profiles')||'[]').length"),0,'Changed colour cannot silently save wrong specs');assert.equal(await run("document.getElementById('collection-model-check').hidden"),false);
  await run("document.getElementById('collection-use-model').click();document.getElementById('profile-model').value+='ER';document.getElementById('profile-model').dispatchEvent(new Event('input'));document.getElementById('profile-form').requestSubmit()");
  let saved=await run("JSON.parse(localStorage.getItem('atomic.profiles'))[0]");assert.equal(saved.model,model+'ER');assert.deepEqual(saved.details.specs,sheet);assert.equal(saved.details.note,'Keep my story');
  win.webContents.reload();await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));await until("!document.getElementById('start-button').disabled");
  await run("document.querySelector('[data-page=profiles]').click();document.querySelector('.watch-card-specs').click()");assert.equal(await run("document.getElementById('collection-model-check').hidden"),true,'Regional code remains valid after reload');
  assert.equal(await run("document.getElementById('collection-editor-fields').hidden"),true,'Card opens the sheet directly');
  assert.equal(await run("document.querySelectorAll('dialog[open]').length"),1);
  wrong=true;await search();await until("document.getElementById('photo-picker-status').textContent.includes('cannot be verified')");await run("document.getElementById('photo-picker-close').click()");assert.match(await run("document.getElementById('collection-spec-content').textContent"),/52 g/);wrong=false;
  delayed=true;await search();await run("document.getElementById('photo-picker-dialog').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true,cancelable:true}))");await pause(650);assert.equal(await run("document.getElementById('photo-picker-dialog').open"),false);assert.equal(await run("document.getElementById('profile-editor-dialog').open"),true);delayed=false;
  offline=true;await run("document.getElementById('collection-spec-import').click()");await until("document.getElementById('photo-picker-status').textContent.includes('Check your connection')");await run("document.getElementById('photo-picker-close').click()");offline=false;
  for(const language of ['en','it','fr','de','es','ja']){
   await run(`document.getElementById('language-select').value='${language}';document.getElementById('language-select').dispatchEvent(new Event('change'));document.getElementById('collection-spec-panel').scrollIntoView({block:'start'})`);
   assert.equal(await run("document.getElementById('profile-editor-dialog').scrollWidth<=document.getElementById('profile-editor-dialog').clientWidth+1"),true,language+' sheet width');
   assert.equal(await run("document.querySelectorAll('#collection-spec-actions button svg').length"),2,language+' action icons');
   assert.equal(await run("document.getElementById('collection-spec-import').getAttribute('aria-label')===document.getElementById('collection-spec-import').title"),true);
   assert.equal(await run("document.querySelectorAll('dialog[open]').length"),1,language+' one editor dialog');

   assert.equal(await run("document.querySelector('.spec-state.is-present').textContent!==document.querySelector('.spec-state.is-unknown').textContent"),true);
   if(language==='it')await capture('sheet-it');
   await review();assert.equal(await run("document.getElementById('photo-picker-adopt').hidden"),true);if(language==='it')await capture('review-it');
   await run("document.getElementById('photo-picker-import').click()");await until("!document.getElementById('photo-picker-dialog').open");
  }
  await run("document.getElementById('language-select').value='en';document.getElementById('language-select').dispatchEvent(new Event('change'))");
  // A special-edition catalogue code may use mixed case. The stored identity is canonical.
  sheet=await require('../electron/watch-specs.cjs').parseWatchSpecs(fixture.replaceAll(model,'GA-B2100C-9A_Atmos'),pageURL.replace(model,'GA-B2100C-9A_Atmos'),'GA-B2100C-9A_Atmos',Date.now());
  ipcMain.removeHandler('watch-photos:search');ipcMain.handle('watch-photos:search',()=>({ok:true,results:[{id:'2',model:'GA-B2100C-9A_Atmos',family:'GA-B2100',pageURL:sheet.source.url}]}));
  ipcMain.removeHandler('watch-specs:get');ipcMain.handle('watch-specs:get',()=>({ok:true,model:sheet.model,family:'GA-B2100',pageURL:sheet.source.url,specs:sheet}));
  await run("document.getElementById('profile-model').value='GA-B2100C-9A_Atmos';document.getElementById('profile-model').dispatchEvent(new Event('input'))");await review();
  assert.equal(await run("document.getElementById('photo-picker-adopt').hidden"),true,'Mixed-case edition is the same exact model');
  await run("document.getElementById('photo-picker-import').click()");await until("!document.getElementById('photo-picker-dialog').open");
  await run("document.getElementById('collection-spec-remove').click();document.getElementById('profile-form').requestSubmit()");saved=await run("JSON.parse(localStorage.getItem('atomic.profiles'))[0]");assert.equal(saved.details.specs,undefined);assert.equal(saved.details.note,'Keep my story');assert.deepEqual(errors,[]);
  console.log('PASS: dedicated sheet view, accessible update/trash icons, back/Escape/draft preservation, required-field recovery, direct card access, family confirmation, regional equivalence, changed-colour save guard, module manual, explicit save, persisted offline sheet, invalid response, async cancellation, removal and six languages.');
 }catch(error){console.error(error.stack||error,errors);process.exitCode=1;}
 finally{app.exit(process.exitCode||0);}
});
