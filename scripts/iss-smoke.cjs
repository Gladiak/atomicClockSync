const {app,BrowserWindow,ipcMain}=require('electron');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {validateOrbit}=require('../electron/iss-data.cjs');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'atomic-iss-test-')));
require(path.join(process.env.ATOMIC_TEST_APP_ROOT?path.resolve(process.env.ATOMIC_TEST_APP_ROOT):path.resolve(__dirname,'..'),'electron/main.cjs'));
const fixture=require('../test/fixtures/iss-omm.json'),epoch=Date.parse('2026-10-25T14:33:11Z');
let mode='empty';const testStarted=Date.now();
ipcMain.removeHandler('clock:sync');ipcMain.handle('clock:sync',()=>({ok:true,nowMs:epoch,host:'test-time-reference',offsetMs:0,uncertaintyMs:1,synchronizedAt:epoch}));
ipcMain.removeHandler('iss:refresh');ipcMain.handle('iss:refresh',()=>{
  const orbit=mode==='stale'?validateOrbit({...fixture,EPOCH:'2026-10-01T05:01:11Z'}):validateOrbit(fixture);
  return {orbit:['empty','report'].includes(mode)?null:{...orbit,fetchedAt:epoch},fix:mode==='report'?{latitude:-41.18,longitude:-14.04,altitude:431.5,velocity:27552,timestamp:epoch+Date.now()-testStarted,source:'Where the ISS at'}:null,connectivity:['online','report'].includes(mode)?'online':'unreachable',lastSuccess:mode==='online'?epoch:0,error:mode==='online'?'':'Test service unavailable'};
});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
 const win=BrowserWindow.getAllWindows()[0],errors=[];win.hide();win.webContents.setAudioMuted(true);
 win.webContents.on('console-message',details=>{if(details.level==='error')errors.push(details.message);});
 win.webContents.session.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_r,callback)=>callback({cancel:true}));
 const run=source=>win.webContents.executeJavaScript(source,true);
 async function until(source,ms=15000){const end=Date.now()+ms;while(Date.now()<end){if(await run(source))return;await pause(100);}throw Error('Timeout: '+source);}
 async function change(id,value,type='change'){await run(`document.getElementById(${JSON.stringify(id)}).value=${JSON.stringify(value)};document.getElementById(${JSON.stringify(id)}).dispatchEvent(new Event(${JSON.stringify(type)}))`);}
 async function capture(name){await run("document.getElementById('toast').hidden=true");win.showInactive();await pause(250);fs.mkdirSync('artifacts',{recursive:true});fs.writeFileSync(path.join('artifacts',name),(await win.webContents.capturePage()).toPNG());win.hide();}
 async function fits(){const result=await run(`(()=>{const page=document.querySelector('.page.active'),b=page.getBoundingClientRect();return [...page.querySelectorAll('*')].filter(e=>{
  if(e.closest('svg'))return false;const r=e.getBoundingClientRect();return r.width&&r.height&&(r.right>b.right+1||r.bottom>b.bottom+1);
 }).map(e=>e.id||e.className);})()`);assert.deepEqual(result,[],'Fixed-window overflow: '+result);
 assert.equal(await run('document.documentElement.scrollHeight<=innerHeight'),true);
 assert.equal(await run("document.querySelector('.sidebar nav').getBoundingClientRect().bottom<=document.querySelector('.sidebar-bottom').getBoundingClientRect().top+1"),true,'Sidebar sections overlap');}
 try{
  if(win.webContents.isLoading())await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));
  await until("!document.getElementById('start-button').disabled");
  await run("document.querySelector('[data-page=iss]').click()");
  await until("document.getElementById('iss-network').textContent==='UNAVAILABLE'");
  assert.equal(await run("document.getElementById('iss-speed').textContent"),'—');
  await until("document.getElementById('iss-earth').querySelector('path')!==null");await fits();
  mode='online';await run("document.getElementById('iss-refresh').click()");await until("document.getElementById('iss-speed').textContent!=='—'");
  assert.match(await run("document.getElementById('iss-network').textContent"),/ONLINE/);
  await until("document.getElementById('iss-next-time').textContent!=='Calculating…'");
  await until("localStorage.getItem('atomic.preferences')!==null");const prefs=await run("localStorage.getItem('atomic.preferences')");
  await change('iss-preview','30','input');assert.equal(await run("document.getElementById('iss-mode').textContent"),'PREVIEW');
  assert.equal(await run("localStorage.getItem('atomic.preferences')"),prefs);
  await run("document.getElementById('iss-live').click()");assert.equal(await run("document.getElementById('iss-mode').textContent"),'ORBITAL ESTIMATE');
  await run("document.getElementById('iss-footprint').click();document.getElementById('iss-track-toggle').click()");
  assert.equal(await run("document.getElementById('iss-footprint').getAttribute('aria-pressed')"),'false');
  await run("document.getElementById('iss-footprint').click();document.getElementById('iss-track-toggle').click()");
  for(const theme of ['lime','cyan','fuchsia','ruby','gold','aqua','amethyst','lava','atlantic']){
   await change('theme-select',theme);
   for(const tab of ['tracking','passes','station','time']){await run(`document.querySelector('[data-iss-tab=${tab}]').click()`);await fits();}
  }
  await change('theme-select','cyan');await run("document.querySelector('[data-iss-tab=tracking]').click()");await capture('iss-tracking.png');
  await run("document.querySelector('[data-iss-tab=passes]').click()");await until("document.querySelector('.iss-pass-row')!==null");
  assert.ok(await run("document.getElementById('iss-sky-full').getAttribute('d').length>10"));
  await capture('iss-passes.png');await run("document.getElementById('iss-preview-pass').click()");assert.equal(await run("document.getElementById('iss-mode').textContent"),'PREVIEW');
  await run("document.querySelector('[data-iss-tab=station]').click()");await capture('iss-station.png');
  await run("document.querySelector('[data-iss-tab=time]').click()");assert.match(await run("document.getElementById('iss-time-net').textContent"),/-2[0-9]/);await capture('iss-time.png');
  mode='offline';await run("document.getElementById('iss-refresh').click()");await until("document.getElementById('iss-network').textContent.includes('OFFLINE')");
  mode='stale';await run("document.getElementById('iss-refresh').click()");await until("document.getElementById('iss-network').textContent==='STALE ORBIT'");
  assert.equal(await run("document.getElementById('iss-speed').textContent"),'—');assert.equal(await run("document.getElementById('iss-preview').disabled"),true);
  await run("document.querySelector('[data-iss-tab=passes]').click()");assert.equal(await run("document.querySelectorAll('.iss-pass-row').length"),0);await fits();
  mode='report';await run("document.querySelector('[data-iss-tab=tracking]').click();document.getElementById('iss-live').click();document.getElementById('iss-refresh').click()");await until("document.getElementById('iss-network').textContent==='ONLINE · REPORT'");
  assert.equal(await run("document.getElementById('iss-mode').textContent"),'POSITION REPORT');assert.equal(await run("document.getElementById('iss-preview').disabled"),true);
  mode='online';await run("document.getElementById('iss-refresh').click()");await until("document.getElementById('iss-network').textContent.includes('ONLINE')");
  await run("document.getElementById('iss-observer').click()");await until("!document.getElementById('page-world').hidden");
  await change('world-city-search','Tokyo','input');await until("document.querySelector('.world-result strong')?.textContent==='Tokyo'");await run("document.querySelector('.world-result').click();document.querySelector('[data-page=iss]').click()");
  assert.match(await run("document.getElementById('iss-observer').textContent"),/Tokyo/);
  await run("document.querySelector('[data-page=sync]').click();document.getElementById('start-button').click()");await until("document.getElementById('status-badge').textContent==='TRANSMITTING'");
  await run("document.querySelector('[data-page=iss]').click();document.querySelector('[data-iss-tab=tracking]').click()");await change('iss-preview','60','input');await pause(1500);
  assert.equal(await run("document.getElementById('status-badge').textContent"),'TRANSMITTING');
  await run("document.querySelector('[data-page=sync]').click();document.getElementById('start-button').click()");await until("!document.getElementById('start-button').disabled");
  assert.deepEqual(errors,[]);console.log('PASS: ISS tracking, network/cache/stale states, observer sharing, orbital preview, visible passes and sky plot, four tabs in nine themes, fixed window/sidebar, educational relativity and real muted AudioWorklet isolation. No external network used.');app.exit(0);
 }catch(error){console.error(error.stack);console.error(errors);await capture('iss-failure.png');app.exit(1);}
});
