const {app,BrowserWindow,ipcMain}=require('electron');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'atomic-personal-time-'));
app.setPath('userData',profile);
require('../electron/main.cjs');
require('./offline-iss.cjs')();
const {validateWeather}=require('../electron/weather-data.cjs'),weatherFixture=require('../test/fixtures/weather-rome.json');
ipcMain.removeHandler('weather:get');ipcMain.handle('weather:get',(_event,city)=>{const raw=structuredClone(weatherFixture);raw.latitude=city.latitude;raw.longitude=city.longitude;raw.timezone=city.timeZone;raw.current.time=Math.floor(Date.now()/1000);return {weather:validateWeather(raw,city),connectivity:'online'};});
ipcMain.removeHandler('clock:sync');
ipcMain.handle('clock:sync',()=>({ok:false,error:'Offline test'}));
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
 const win=BrowserWindow.getAllWindows()[0],errors=[];
 win.webContents.setAudioMuted(true);
 win.webContents.on('console-message',details=>{if(details.level==='error')errors.push(details.message);});
 win.webContents.session.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_r,callback)=>callback({cancel:true}));
 const run=source=>win.webContents.executeJavaScript(source,true);
 async function capture(name){
  fs.mkdirSync('artifacts',{recursive:true});
  for(let attempt=0;attempt<3;attempt++){
   try{fs.writeFileSync(path.join('artifacts',name),(await win.webContents.capturePage()).toPNG());return;}
   catch(error){if(!String(error).includes('UnknownVizError')||attempt===2)throw error;await pause(350);}
  }
 }
 async function until(source){const end=Date.now()+12000;while(Date.now()<end){if(await run(source))return;await pause(75);}throw Error('Timeout '+source);}
 try{
  if(win.webContents.isLoading())await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));
  win.showInactive();
  await until("document.querySelector('.page.active')?.id==='page-home' && !document.hidden && document.getElementById('now-earth').children.length>0");
  assert.equal(await run("document.getElementById('now-drift').textContent"),'More readings needed');
  assert.match(await run("document.getElementById('now-reference').textContent"),/unverified/);
  assert.equal(await run("document.getElementById('now-light-age')"),null);
  await until("document.getElementById('now-moon-disc').dataset.texture==='nasa-lro'");
  assert.equal(await run("document.getElementById('now-iss-speed').textContent"),'—');
  await pause(500);
  fs.mkdirSync('artifacts',{recursive:true});
  await capture('personal-home.png');
  for(const language of ['en','it','fr','de','es','ja']){
   await run(`document.getElementById('language-select').value='${language}';document.getElementById('language-select').dispatchEvent(new Event('change'))`);
   assert.equal(await run("document.querySelectorAll('.page.active:not([hidden])').length"),1);
   assert.equal(await run("document.getElementById('page-home').scrollWidth<=document.getElementById('page-home').clientWidth+1"),true,language+' home width');
  }
  await run("document.getElementById('language-select').value='en';document.getElementById('language-select').dispatchEvent(new Event('change'));document.querySelector('#page-home [data-goto=sync]').click()");
  assert.equal(await run("document.querySelector('.page.active').id"),'page-sync');
  await until("!document.getElementById('start-button').disabled");
  await run("document.getElementById('start-button').click()");
  await until("document.getElementById('status-badge').textContent==='TRANSMITTING'");
  await run("document.querySelector('[data-page=home]').click()");
  await until("document.getElementById('now-session').textContent.includes('Transmission in progress')");
  assert.equal(await run("document.getElementById('start-label').textContent"),'Stop');
  await run("document.getElementById('start-button').click()");
  await until("document.getElementById('start-label').textContent==='Start transmission'");
  // A confirmed reception produces an acknowledgement; a stopped trial did not.
  assert.equal(await run("document.getElementById('journey-receipt').open"),false);
  await run("document.querySelector('[data-page=sync]').click();document.getElementById('start-button').click()");
  await until("document.getElementById('confirmed-button').hidden===false");
  await run("document.getElementById('confirmed-button').click()");
  await until("document.getElementById('journey-receipt').open");
  assert.equal(await run("JSON.parse(localStorage.getItem('atomic.history'))[0].outcome"),'get');
  await run("document.getElementById('journey-history').click()");
  assert.equal(await run("document.querySelector('.page.active').id"),'page-trial');
  // The collection exposes search and tiles; creating/editing uses a modal.
  await run("document.querySelector('[data-page=profiles]').click()");
  assert.equal(await run("document.querySelector('#page-profiles #profile-form')"),null);
  assert.equal(await run("document.getElementById('profile-editor-dialog').open"),false);
  await run("document.getElementById('profile-new').click()");
  assert.equal(await run("document.getElementById('profile-editor-dialog').open"),true);
  assert.equal(await run("document.activeElement.id"),'profile-name');
  await run("document.getElementById('profile-name').value='Do not save';document.getElementById('profile-cancel').click()");
  assert.equal(await run("document.getElementById('profile-editor-dialog').open"),false);
  assert.equal(await run("JSON.parse(localStorage.getItem('atomic.profiles')||'[]').length"),0);
  // Create personal metadata, rename the profile and verify a reload retains it.
  await run("document.querySelector('[data-page=profiles]').click();document.getElementById('profile-new').click();document.getElementById('profile-name').value='My first G-Shock';document.getElementById('profile-model').value='GW-6900';document.getElementById('collection-acquired').value='2024-02-29';document.getElementById('collection-note').value='A personal memory 日本語';document.getElementById('profile-form').requestSubmit()");
  assert.equal(await run("document.getElementById('profile-editor-dialog').open"),false);
  assert.equal(await run("JSON.parse(localStorage.getItem('atomic.activeProfile'))"),null,'Saving a new watch does not activate it');
  await run("document.querySelector('.watch-card-active').click()");
  assert.equal(await run("document.getElementById('profile-editor-dialog').open"),false,'Activation does not open the editor');
  assert.equal(await run("document.querySelector('.watch-card-active').getAttribute('aria-pressed')"),'true');
  await run("document.querySelector('.watch-card-select').click()");
  await run("(async()=>{const canvas=document.createElement('canvas');canvas.width=800;canvas.height=600;const ctx=canvas.getContext('2d');ctx.fillStyle='#fafafa';ctx.fillRect(0,0,800,600);ctx.fillStyle='#20272e';ctx.fillRect(330,20,140,560);ctx.beginPath();ctx.roundRect(260,120,280,360,55);ctx.fill();ctx.strokeStyle='#58646c';ctx.lineWidth=12;ctx.stroke();ctx.fillStyle='#b9c7b6';ctx.fillRect(292,200,216,170);ctx.fillStyle='#253c37';ctx.font='54px monospace';ctx.fillText('10:08',306,305);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));const transfer=new DataTransfer();transfer.items.add(new File([blob],'watch.png',{type:'image/png'}));document.getElementById('collection-photo').files=transfer.files;document.getElementById('collection-photo').dispatchEvent(new Event('change'))})()");
  await until("document.getElementById('collection-photo-status').textContent.includes('Photo ready')");
  await run("document.getElementById('profile-form').requestSubmit()");
  assert.match(await run("JSON.parse(localStorage.getItem('atomic.profiles'))[0].details.photo"),/^data:image\/webp;base64,/);
  assert.equal(await run("document.querySelectorAll('.watch-card').length"),1);
  assert.equal(await run("JSON.parse(localStorage.getItem('atomic.profiles'))[0].details.note"),'A personal memory 日本語');
  const id=await run("JSON.parse(localStorage.getItem('atomic.profiles'))[0].id");
  await run("document.querySelector('.watch-card-select').click();document.getElementById('profile-name').value='Daily companion';document.getElementById('profile-form').requestSubmit()");
  assert.equal(await run("JSON.parse(localStorage.getItem('atomic.profiles'))[0].id"),id);
  const firstSettings=await run("JSON.parse(localStorage.getItem('atomic.profiles'))[0].settings");
  await run("document.getElementById('volume').value='23';document.getElementById('volume').dispatchEvent(new Event('input'));document.getElementById('profile-new').click();document.getElementById('profile-name').value='Second watch';document.getElementById('profile-model').value='GA-B2100';document.getElementById('profile-form').requestSubmit()");
  assert.equal(await run("JSON.parse(localStorage.getItem('atomic.activeProfile'))"),id,'Creating another watch preserves the active one');
  assert.equal(await run("document.querySelectorAll('.watch-card-active[aria-pressed=true]').length"),1);
  await run("document.getElementById('volume').value='64';document.getElementById('volume').dispatchEvent(new Event('input'));document.querySelectorAll('.watch-card-select')[1].click()");
  assert.equal(await run("JSON.parse(localStorage.getItem('atomic.activeProfile'))"),id,'Opening another watch does not activate it');
  assert.equal(await run("document.getElementById('volume').value"),'64');
  assert.match(await run("document.getElementById('profile-settings-summary').textContent"),/23%/,'Inactive watch summary keeps its own settings');
  await run("document.getElementById('profile-name').value='Second, edited';document.getElementById('profile-form').requestSubmit()");
  assert.equal(await run("JSON.parse(localStorage.getItem('atomic.profiles'))[1].settings.volume"),23,'Saving an inactive watch preserves its settings');
  assert.equal(await run("JSON.parse(localStorage.getItem('atomic.activeProfile'))"),id);
  await run("document.querySelectorAll('.watch-card-active')[1].focus();document.querySelectorAll('.watch-card-active')[1].click()");
  const secondId=await run("JSON.parse(localStorage.getItem('atomic.profiles'))[1].id");
  assert.equal(await run("JSON.parse(localStorage.getItem('atomic.activeProfile'))"),secondId);
  assert.equal(await run("document.getElementById('volume').value"),'23');
  assert.equal(await run("document.activeElement.dataset.watchAction"),'activate','Activation keeps keyboard focus on its icon');
  await run("document.getElementById('volume').value='25';document.getElementById('volume').dispatchEvent(new Event('input'));document.querySelectorAll('.watch-card-active')[1].click()");
  assert.equal(await run("document.getElementById('volume').value"),'25','Clicking the active icon does not reset unsaved audio settings');
  await run("document.querySelector('[data-page=home]').click()");
  assert.equal(await run("document.getElementById('now-watch-photo').hidden&&getComputedStyle(document.getElementById('now-watch-placeholder')).display!=='none'"),true,'An active watch without a photo has the local schematic');
  await run("document.querySelector('[data-page=profiles]').click()");
  await run("document.querySelector('.watch-card-active').click();document.querySelectorAll('.watch-card-select')[1].click();document.getElementById('profile-delete').click()");
  assert.equal(await run("JSON.parse(localStorage.getItem('atomic.activeProfile'))"),id);
  assert.deepEqual(await run("JSON.parse(localStorage.getItem('atomic.profiles'))[0].settings"),firstSettings);
  await win.webContents.reload();
  await until("document.querySelector('.page.active')?.id==='page-home' && !document.getElementById('start-button').disabled");
  assert.equal(await run("document.getElementById('now-watch-name').textContent"),'Daily companion');
  await until("!document.getElementById('now-watch-photo').hidden&&document.getElementById('now-watch-photo').naturalWidth>0");
  assert.equal(await run("document.getElementById('now-watch-photo').getAttribute('src')===JSON.parse(localStorage.getItem('atomic.profiles'))[0].details.photo&&getComputedStyle(document.getElementById('now-watch-placeholder')).display==='none'"),true,'The home portrait is the selected watch’s saved photo');
  await run("document.getElementById('language-select').value='it';document.getElementById('language-select').dispatchEvent(new Event('change'));document.getElementById('theme-select').value='rainbow';document.getElementById('theme-select').dispatchEvent(new Event('change'));document.getElementById('toast').hidden=true");
  assert.equal(await run("(()=>{const photo=document.getElementById('now-watch-photo'),art=photo.parentElement.getBoundingClientRect(),r=photo.getBoundingClientRect();return Math.min(r.width,r.height)>200&&Math.abs(r.left+r.width/2-(art.left+art.width/2))<1})()"),true,'The large watch portrait is centered in its own stage');
  await until("document.getElementById('now-weather-card').dataset.weather==='available'");
  await pause(650);await capture('personal-home-it.png');
  await run("document.getElementById('language-select').value='en';document.getElementById('language-select').dispatchEvent(new Event('change'));document.querySelector('[data-page=profiles]').click()");
  assert.equal(await run("document.getElementById('collection-note').value"),'A personal memory 日本語');
  await run("document.getElementById('toast').hidden=true");await pause(500);
  await capture('personal-collection.png');
  await run("[...document.querySelectorAll('.watch-card-actions button')].find(button=>button.textContent==='History').click()");
  assert.equal(await run("document.querySelector('.page.active').id"),'page-history');
  assert.equal(await run("document.getElementById('history-watch').value"),id);
  assert.equal(await run("document.querySelectorAll('.history-row').length"),0,'Trials without this profile must not appear in its history');
  assert.equal(await run("document.getElementById('clear-history').hidden"),true);
  await run("document.getElementById('history-watch').value='';document.getElementById('history-watch').dispatchEvent(new Event('change'))");
  assert.equal(await run("document.querySelectorAll('.history-row').length"),2);
  // Local search filters by model/name and preserves the saved collection.
  await run("document.querySelector('[data-page=profiles]').click();document.getElementById('collection-search').value='gw-6900';document.getElementById('collection-search').dispatchEvent(new Event('input'))");
  assert.equal(await run("document.querySelectorAll('.watch-card').length"),1);
  await run("document.getElementById('collection-search').value='missing watch';document.getElementById('collection-search').dispatchEvent(new Event('input'))");
  assert.equal(await run("document.querySelectorAll('.watch-card').length"),0);
  assert.equal(await run("document.getElementById('collection-empty').hidden"),false);
  await run("document.getElementById('collection-search').value='';document.getElementById('collection-search').dispatchEvent(new Event('input'));document.querySelector('.watch-card-select').click()");
  assert.equal(await run("document.getElementById('profile-editor-dialog').open"),true);
  await run("document.getElementById('profile-editor-dialog').dispatchEvent(new Event('cancel',{cancelable:true}))");
  assert.equal(await run("document.getElementById('profile-editor-dialog').open"),false);
  // Native preview controls update every linked view and leave transmitted time alone.
  await run("document.querySelector('[data-page=world]').click();document.getElementById('instant-open').click();document.getElementById('instant-date').value='2000-01-01T12:34:56';document.getElementById('instant-apply').click()");
  await until("document.getElementById('world-mode').textContent==='PREVIEW'");
  await run("document.querySelector('[data-page=moon]').click()");
  assert.equal(await run("document.getElementById('moon-clock').dateTime"),'2000-01-01T12:34:56.000Z');
  await run("document.getElementById('moon-next').click();document.querySelector('[data-page=light-travel]').click()");
  assert.equal(await run("document.getElementById('lt-date').value"),'2000-01-02');
  assert.equal(await run("document.getElementById('lt-time').value"),'12:34:56');
  await run("document.getElementById('lt-live').click();document.querySelector('[data-page=moon]').click()");
  assert.equal(await run("document.getElementById('moon-mode').textContent"),'LIVE');
  // Unlinking keeps previews, and a later independent date becomes the next default.
  await run("document.getElementById('instant-open').click();document.getElementById('instant-date').value='2005-01-01T00:00:00';document.getElementById('instant-apply').click();document.getElementById('instant-open').click();document.getElementById('instant-unlink').click();document.getElementById('moon-next').click();document.getElementById('instant-open').click()");
  assert.equal(await run("document.getElementById('instant-date').value"),'2005-01-02T00:00');
  await run("document.getElementById('instant-live').click()");
  // Unsupported dates cannot overwrite an established shared instant.
  await run("document.getElementById('instant-open').click();document.getElementById('instant-date').value='1800-01-01T00:00:00';document.getElementById('instant-apply').click()");
  assert.equal(await run("document.getElementById('instant-dialog').open"),true);
  await run("document.getElementById('instant-dialog').close();document.querySelector('[data-page=sync]').click();document.getElementById('start-button').click()");
  await until("document.getElementById('start-label').textContent==='Stop'");
  await run("document.querySelector('[data-page=moon]').click();document.getElementById('observatory-open').click()");
  await until("document.getElementById('observatory-dialog').open");
  await until("document.querySelector('#observatory-scene #moon-disc')!==null");
  await until("document.getElementById('moon-disc').dataset.texture==='nasa-lro'&&document.getElementById('moon-disc').width>512");
  assert.equal(await run("document.getElementById('moon-disc').width<=2048"),true,'Retina full-screen render stays within the texture resolution');

  await pause(1500);
  assert.equal(win.isFullScreen(),true);
  await run("document.getElementById('toast').hidden=true");
  await capture('personal-observatory.png');
  await run("document.querySelector('[data-observatory-page=light-travel]').click()");
  assert.equal(await run("document.querySelector('#observatory-scene #lt-system')!==null"),true);
  assert.equal(await run("document.querySelector('#page-moon #moon-disc')!==null"),true);
  assert.equal(await run("document.getElementById('start-label').textContent"),'Stop');
  await run("document.querySelector('[data-observatory-page=world]').click()");
  await until("document.getElementById('world-loading').hidden");
  assert.equal(await run("document.querySelector('#observatory-scene #world-map')!==null"),true);
  await until("document.getElementById('world-map').dataset.imagery==='nasa-blue-marble'");
  assert.equal(await run("getComputedStyle(document.querySelector('#observatory-scene .world-map-bottom')).display"),'none','The immersive Earth has no permanent legend ribbon');
  assert.match(await run("document.getElementById('observatory-clock').textContent"),/^\d{2}:\d{2}:\d{2} UTC$/,'The HUD keeps a compact UTC clock');
  await run("document.getElementById('world-city-focus').click()");
  assert.equal(await run("document.getElementById('world-map').dataset.zoom"),'2.5');
  const controlsFit=await run("(()=>{const root=document.getElementById('observatory-scene').getBoundingClientRect();return [...document.querySelectorAll('.world-basemap-controls,.world-navigation-controls')].every(node=>{const r=node.getBoundingClientRect();return r.left>=root.left&&r.right<=root.right&&r.bottom<=root.bottom})})()");
  assert.equal(controlsFit,true,'Map navigation remains available inside the full-screen scene');
  await pause(600);await capture('personal-observatory-earth.png');
  // The HUD fades away; consumed map keys must still wake its controls.
  await run("document.getElementById('observatory-dialog').focus()");
  win.webContents.debugger.attach('1.3');
  const center=await run("({x:Math.round(innerWidth/2),y:Math.round(innerHeight/2)})");
  await win.webContents.debugger.sendCommand('Input.dispatchMouseEvent',{type:'mouseMoved',...center,button:'none'});
  await until("document.getElementById('observatory-dialog').classList.contains('controls-hidden')&&getComputedStyle(document.querySelector('#observatory-scene .world-navigation-controls')).opacity==='0'&&getComputedStyle(document.getElementById('observatory-controls')).opacity==='0'");
  assert.equal(await run("getComputedStyle(document.querySelector('#observatory-scene .world-basemap-controls')).pointerEvents"),'none');
  await capture('personal-observatory-earth-idle.png');
  await run("document.getElementById('world-map').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',code:'ArrowRight',bubbles:true,cancelable:true}))");
  assert.equal(await run("document.getElementById('observatory-dialog').classList.contains('controls-hidden')"),false,'Map keyboard navigation wakes the HUD before the map consumes the event');
  await run("document.getElementById('world-map').focus();document.getElementById('world-map').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true,cancelable:true}))");
  assert.equal(await run("document.getElementById('world-map').dataset.zoom"),'1');
  assert.equal(await run("document.getElementById('observatory-dialog').open"),true,'First Escape resets the zoomed map');

  await run("document.getElementById('observatory-close').click()");
  await until("!document.getElementById('observatory-dialog').open");
  await pause(1500);
  assert.equal(win.isFullScreen(),false);
  assert.notEqual(await run("getComputedStyle(document.querySelector('#page-world .world-map-bottom')).display"),'none','Regular World View retains the legend and source links');
  assert.equal(await run("document.querySelector('#page-light-travel #lt-system')!==null"),true);
  assert.equal(await run("document.getElementById('start-label').textContent"),'Stop');
  await run("document.getElementById('observatory-open').click()");
  await until("document.getElementById('observatory-dialog').open");await pause(1500);
  await run("document.getElementById('observatory-dialog').dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape',bubbles:true}))");
  await until("!document.getElementById('observatory-dialog').open");await pause(1500);
  assert.equal(await run("document.getElementById('start-label').textContent"),'Stop','Escape in the observatory preserves transmission');
  await run("document.getElementById('start-button').click()");
  await until("document.getElementById('start-label').textContent==='Start transmission'");
  assert.deepEqual(errors,[]);
  console.log('Personal time smoke passed');
 }catch(error){console.error(error.stack||error,errors);try{await capture('personal-time-failure.png');}catch{}process.exitCode=1;}
 finally{win.destroy();app.exit(process.exitCode||0);}
});
