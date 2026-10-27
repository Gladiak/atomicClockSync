const {app,BrowserWindow,ipcMain}=require('electron');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const userData=fs.mkdtempSync(path.join(os.tmpdir(),'atomic-accuracy-'));
app.setPath('userData',userData);
require(path.join(process.env.ATOMIC_TEST_APP_ROOT?path.resolve(process.env.ATOMIC_TEST_APP_ROOT):path.resolve(__dirname,'..'),'electron/main.cjs'));
ipcMain.removeHandler('clock:sync');ipcMain.handle('clock:sync',()=>({ok:true,nowMs:Date.now(),host:'accuracy-test',offsetMs:0,uncertaintyMs:6,synchronizedAt:Date.now()}));
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
 const win=BrowserWindow.getAllWindows()[0],errors=[];win.showInactive();win.webContents.setAudioMuted(true);
 win.webContents.on('console-message',details=>{if(details.level==='error')errors.push(details.message);});
 win.webContents.session.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_r,cb)=>cb({cancel:true}));
 const run=source=>win.webContents.executeJavaScript(source,true);
 async function until(source){const end=Date.now()+20000;while(Date.now()<end){if(await run(source))return;await pause(50);}throw Error('Timeout: '+source);}
 const click=id=>run(`document.getElementById(${JSON.stringify(id)}).click()`);
 const change=(id,value)=>run(`document.getElementById(${JSON.stringify(id)}).value=${JSON.stringify(value)};document.getElementById(${JSON.stringify(id)}).dispatchEvent(new Event('input'));document.getElementById(${JSON.stringify(id)}).dispatchEvent(new Event('change'))`);
 const go=page=>run(`document.querySelector('[data-page="${page}"]').click()`);
 const records=()=>run("JSON.parse(localStorage.getItem('atomic.accuracy.v1')||'{\"entries\":[]}').entries");
 const stamp=ms=>new Date(ms).toISOString().slice(0,19);
 async function capture(name){await run("document.getElementById('toast').hidden=true");await pause(500);fs.mkdirSync('artifacts/watch-accuracy',{recursive:true});fs.writeFileSync(`artifacts/watch-accuracy/${name}.png`,(await win.webContents.capturePage()).toPNG());}
 async function fits(label){
  await until("!document.getElementById('page-watch-accuracy').getAnimations().length");
  const overflow=await run(`(()=>{const page=document.getElementById('page-watch-accuracy'),bounds=page.getBoundingClientRect();return [...page.querySelectorAll('*')].filter(node=>{if(node.closest('svg,.wa-records,.wa-editor'))return false;const r=node.getBoundingClientRect();return r.width&&r.height&&(r.right>bounds.right+1||r.bottom>bounds.bottom+1);}).map(node=>node.id||node.className);})()`);
  assert.deepEqual(overflow,[],label+' overflow');
  assert.equal(await run("document.querySelector('.sidebar-bottom').getBoundingClientRect().bottom<=innerHeight"),true,label+' sidebar');
  assert.equal(await run("(()=>{const a=document.getElementById('wa-save').getBoundingClientRect(),b=document.querySelector('.wa-editor').getBoundingClientRect();return !a.width || (a.bottom<=b.bottom+1 && a.top>=b.top)})()"),true,label+' visible save');
  assert.equal(await run("/undefined|NaN|\\{\\d+\\}/.test(document.getElementById('page-watch-accuracy').innerText)"),false,label+' interpolation');
 }
 async function reload(){win.webContents.reload();await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));await until("!document.getElementById('start-button').disabled");}
 async function measure(at,value){await change('wa-kind','measurement');await change('wa-at',stamp(at));await change('wa-value',String(value));await click('wa-save');}
 try{
  if(win.webContents.isLoading())await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));await until("!document.getElementById('start-button').disabled");
  await go('watch-accuracy');assert.equal(await run("document.getElementById('wa-empty').hidden"),false);await fits('no watches');await capture('empty');
  const settings={stationId:'dcf77',volume:30,duration:10,wave:'sine',channel:'both',deviceId:'default',advanceMs:0};
  const profiles=[{id:'p1',name:'Seiko · Daily',model:'Quartz',settings},{id:'p2',name:'<b>Personal watch 日本語</b>',settings}];
  const trial={id:'get-trial',at:Date.now()-2*86400000-600000,endedAt:Date.now()-2*86400000,seconds:600,status:'confirmed',outcome:'get',stationId:'dcf77',snapshot:{profileId:'p1',settings,watch:{name:'Seiko · Daily'},deviceLabel:'Default system output'},volumeChanges:[],endVolume:30};
  await run(`localStorage.setItem('atomic.profiles',JSON.stringify(${JSON.stringify(profiles)}));localStorage.setItem('atomic.history',JSON.stringify([${JSON.stringify(trial)}]));`);await reload();await go('watch-accuracy');
  assert.equal(await run("document.getElementById('wa-offset').textContent"),'—');assert.equal(await run("document.getElementById('wa-plot').querySelectorAll('.wa-reading').length"),0);
  await click('wa-save');assert.ok(await run("document.getElementById('wa-form-status').textContent.includes('signed offset')"));assert.equal((await records()).length,0);
  const base=Math.floor((Date.now()-8*86400000)/1000)*1000;
  await change('wa-note','<b>Personal notes 日本語</b>');await measure(base,'+3');await measure(base+86400000,'+5');await measure(base+3*86400000,'+9');
  assert.equal((await records()).length,3);assert.equal(await run("document.getElementById('wa-drift').textContent"),'≈ +2 s/day');assert.equal(await run("document.querySelectorAll('.wa-reading').length"),3);
  assert.equal((await records())[0].note,'<b>Personal notes 日本語</b>');assert.equal((await records())[0].reference.kind,'manual');
  await measure(base+3*86400000,'10');assert.equal((await records()).length,3);assert.ok(await run("document.getElementById('wa-form-status').textContent.includes('already exists')"));
  await change('wa-at',stamp(Date.now()+86400000));await click('wa-save');assert.equal((await records()).length,3);assert.ok(await run("document.getElementById('wa-form-status').textContent.includes('future')"));
  await click('wa-capture');await change('wa-value','+19,2');await change('wa-step','0.1');await change('wa-temperature','21,5');await change('wa-position','Dial up');await change('wa-wear','resting');await click('wa-save');
  assert.equal((await records()).length,4);assert.equal((await records()).at(-1).reference.kind,'ntp');assert.equal((await records()).at(-1).conditions.temperature,21.5);
  const ntpId=(await records()).at(-1).id;
  await capture('overview');await fits('populated overview');
  await change('wa-watch','p2');assert.equal(await run("document.getElementById('wa-drift').textContent"),'—');assert.equal(await run("document.querySelector('#wa-name b')"),null);
  await measure(base,100);await change('wa-watch','p1');assert.equal(await run("document.getElementById('wa-offset').textContent"),'+19.2 s');
  await click('wa-tab-journal');assert.equal(await run("document.querySelector('#wa-records b')"),null);assert.ok(await run("document.getElementById('wa-records').textContent.includes('<b>Personal notes 日本語</b>')"));
  const first=(await records()).find(e=>e.profileId==='p1');
  await run(`document.querySelector('[data-record="${first.id}"] .wa-record-actions button').click()`);await change('wa-value','+4');await click('wa-save');assert.equal((await records()).find(e=>e.id===first.id).offsetSeconds,4);
  await run(`document.querySelector('[data-record="${ntpId}"] .wa-record-actions button').click()`);await change('wa-at',stamp(Date.now()-60000));await click('wa-save');assert.equal((await records()).find(e=>e.id===ntpId).reference.kind,'manual');
  await run(`document.querySelector('[data-record="${first.id}"] .wa-record-actions button:last-child').click();document.querySelector('[data-action=confirm-delete]').click()`);assert.equal((await records()).some(e=>e.id===first.id),false);await click('wa-undo');assert.equal((await records()).some(e=>e.id===first.id),true);
  await go('history');await run("document.querySelector('.history-row button').click()");await click('trial-accuracy');assert.equal(await run("document.getElementById('wa-kind').value"),'synchronization');assert.equal((await records()).length,5);
  await click('wa-save');assert.equal((await records()).length,6);assert.equal(await run("document.getElementById('wa-offset').textContent"),'+19.2 s');assert.equal(await run("document.getElementById('wa-drift').textContent"),'—');
  const marker=(await records()).find(e=>e.sourceTrialId);assert.equal(marker.offsetSeconds,undefined);
  await go('history');await run("document.querySelector('.history-row button').click()");await click('trial-accuracy');await click('wa-save');assert.equal((await records()).length,6);assert.ok(await run("document.getElementById('wa-form-status').textContent.includes('already has')"));
  await change('wa-kind','measurement');await measure(Date.now()-1.5*86400000,'-1');await measure(Date.now()-10000,'+1');await click('wa-tab-overview');assert.ok(await run("document.getElementById('wa-drift').textContent.includes('s/day')"));
  await change('wa-period','initial');assert.equal(await run("document.getElementById('wa-predicted').textContent"),'—');
  await click('wa-tab-journal');await capture('journal');
  const jsonPath=path.join(userData,'accuracy.json'),csvPath=path.join(userData,'accuracy.csv');
  async function download(id,target){const done=new Promise((resolve,reject)=>{win.webContents.session.once('will-download',(_event,item)=>{item.setSavePath(target);item.once('done',(_e,state)=>state==='completed'?resolve():reject(Error('download '+state)));});});await click(id);await done;}
  await download('wa-export-json',jsonPath);const exported=JSON.parse(fs.readFileSync(jsonPath));assert.equal(exported.entries.length,(await records()).filter(e=>e.profileId==='p1').length);assert.equal(exported.version,1);
  await download('wa-export-csv',csvPath);assert.ok(fs.readFileSync(csvPath,'utf8').includes('offsetSeconds'));
  const beforeFailedSave=await records();await click('wa-capture');await change('wa-value','+20');await change('wa-note','Keep this unsaved note');
  await run("window.accuracyOriginalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='atomic.accuracy.v1')throw new Error('test quota');return window.accuracyOriginalSetItem.call(this,k,v)};void 0");await click('wa-save');
  assert.deepEqual(await records(),beforeFailedSave);assert.equal(await run("document.getElementById('wa-note').value"),'Keep this unsaved note');await run("Storage.prototype.setItem=window.accuracyOriginalSetItem;delete window.accuracyOriginalSetItem");
  // Renaming preserves identity; removing a profile leaves its journal available.
  await run("const ps=JSON.parse(localStorage.getItem('atomic.profiles'));ps[0].name='Renamed watch';localStorage.setItem('atomic.profiles',JSON.stringify(ps))");await reload();await go('watch-accuracy');assert.equal(await run("document.getElementById('wa-name').textContent"),'Renamed watch');
  await run("localStorage.setItem('atomic.profiles',JSON.stringify(JSON.parse(localStorage.getItem('atomic.profiles')).filter(p=>p.id!=='p1')))");await reload();await go('watch-accuracy');await change('wa-watch','p1');assert.ok(await run("document.getElementById('wa-watch').selectedOptions[0].textContent.includes('archived')"));
  await change('wa-period','initial');await change('wa-note','History · Personal 日本語');
  await go('sync');await click('start-button');await until("document.getElementById('start-button').classList.contains('running')");await go('watch-accuracy');assert.equal(await run("document.getElementById('wa-check').disabled"),true);
  for(const language of ['en','it','fr','de','es','ja']){
   await change('language-select',language);await click('wa-tab-overview');await fits(language+' overview');await click('wa-tab-journal');await fits(language+' journal');
   assert.equal(await run("document.getElementById('wa-note').value"),'History · Personal 日本語');
   if(['it','de','ja'].includes(language)){await click('wa-tab-overview');await capture(language+'-overview');await click('wa-tab-journal');await capture(language+'-journal');}
  }
  // Rendering changes never silently rewrite the saved profile/audio settings.
  assert.deepEqual(await run("JSON.parse(localStorage.getItem('atomic.profiles'))"),profiles.filter(p=>p.id!=='p1'));
  for(const theme of ['lime','cyan','fuchsia','ruby','gold','aqua','amethyst','lava','soft-sage','powder-blue','soft-lavender','warm-sand','rainbow','rainbow-soft','atlantic']){await change('theme-select',theme);await click('wa-tab-overview');await fits(theme);}
  assert.equal(await run("document.getElementById('start-button').classList.contains('running')"),true);
  await click('wa-lab');assert.equal(await run("document.getElementById('rl-watch').value"),'p1');
  await go('sync');await click('start-button');await until("!document.getElementById('start-button').disabled");
  await run("localStorage.setItem('atomic.history','[]')");await reload();await go('watch-accuracy');await change('wa-watch','p1');await click('wa-tab-journal');
  assert.ok(await run("document.getElementById('wa-records').textContent.includes('元の試行')"));await click('wa-lab');assert.equal(await run("document.getElementById('rl-watch').value"),'p1');assert.equal(await run("document.getElementById('rl-verified').textContent"),'0');
  assert.deepEqual(errors,[]);
  await run("localStorage.setItem('atomic.accuracy.v1',JSON.stringify({version:999,entries:[]}))");await reload();await go('watch-accuracy');assert.equal(await run("document.getElementById('wa-save').disabled"),true);assert.equal(await run("JSON.parse(localStorage.getItem('atomic.accuracy.v1')).version"),999);await download('wa-recover',jsonPath);assert.equal(JSON.parse(fs.readFileSync(jsonPath)).version,999);
  console.log('PASS: manual offsets and UTC, NTP capture/backdated provenance, honest segmented drift, validation, edit/delete/undo, personal text, GET linking without zero assumptions, per-watch JSON/CSV, rename/archive persistence, six languages, fifteen themes, fixed layout and continuous muted audio.');app.exit(0);
 }catch(error){console.error(error.stack,errors);await capture('failure');app.exit(1);}
});
