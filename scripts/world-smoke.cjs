// Exercise the packaged browser APIs, local map assets, worker and audio together.
const { app, BrowserWindow, ipcMain } = require('electron');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'atomic-world-test-')));
require(path.join(process.env.ATOMIC_TEST_APP_ROOT ? path.resolve(process.env.ATOMIC_TEST_APP_ROOT) : path.resolve(__dirname,'..'),'electron/main.cjs'));
ipcMain.removeHandler('clock:sync');ipcMain.handle('clock:sync',()=>({ok:false,error:'Offline test'}));
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
  const win=BrowserWindow.getAllWindows()[0],errors=[];win.hide();win.webContents.setAudioMuted(true);
  win.webContents.session.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_request,callback)=>callback({cancel:true}));
  win.webContents.on('console-message',details=>{if(details.level==='error')errors.push(details.message);});
  const run=source=>win.webContents.executeJavaScript(source,true);
  async function until(source,timeout=15000){const end=Date.now()+timeout;while(Date.now()<end){if(await run(source))return;await pause(100);}throw Error('Timeout: '+source);}
  async function change(id,value,type='change'){await run(`document.getElementById(${JSON.stringify(id)}).value=${JSON.stringify(value)};document.getElementById(${JSON.stringify(id)}).dispatchEvent(new Event(${JSON.stringify(type)}))`);}
  async function capture(name){await run("document.getElementById('toast').hidden=true");win.showInactive();await pause(250);fs.mkdirSync('artifacts',{recursive:true});fs.writeFileSync(path.join('artifacts',name),(await win.webContents.capturePage()).toPNG());win.hide();}
  async function fits(){
    const overflow=await run(`(()=>{const page=document.getElementById('page-world'),b=page.getBoundingClientRect();return [...page.querySelectorAll('*')].filter(e=>{
      if(e.closest('svg defs')||e.closest('svg'))return false;
      const r=e.getBoundingClientRect();return r.width&&r.height&&(r.bottom>b.bottom+1||r.right>b.right+1);
    }).map(e=>e.id||e.className);})()`);
    assert.deepEqual(overflow,[],'World View overflow: '+overflow);
    assert.equal(await run('document.documentElement.scrollHeight<=innerHeight'),true);
  }
  try{
    if(win.webContents.isLoading())await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));
    await until("!document.getElementById('start-button').disabled");
    await run("document.querySelector('[data-page=world]').click()");await until("document.getElementById('world-loading').hidden");
    assert.equal(await run("document.querySelectorAll('.world-station-marker').length"),5);
    assert.match(await run("document.getElementById('world-reference').textContent"),/System clock/);
    assert.match(await run("document.getElementById('world-catalog-status').textContent"),/171,637/);
    await until("localStorage.getItem('atomic.preferences')!==null");
    const original=await run("localStorage.getItem('atomic.preferences')");
    await change('world-coverage','all');assert.equal(await run("[...document.querySelectorAll('#world-coverage-paths path')].filter(e=>e.style.display!=='none').length"),5);
    await change('world-coverage','off');assert.equal(await run("[...document.querySelectorAll('#world-coverage-paths path')].filter(e=>e.style.display!=='none').length"),0);
    await change('world-coverage','selected');
    await run("document.getElementById('world-twilight').click()");
    assert.equal(await run("document.getElementById('world-twilight').getAttribute('aria-pressed')"),'true');
    const searchStart=Date.now();
    await run("document.getElementById('world-city-search').focus()");await change('world-city-search','Tokyo','input');
    await until("document.querySelector('.world-result strong')?.textContent==='Tokyo'");
    console.log('Cold catalog load, worker index and first search:',Date.now()-searchStart,'ms');
    await run("document.getElementById('world-city-search').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown'}));document.getElementById('world-city-search').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}))");
    assert.equal(await run("document.getElementById('world-city-name').textContent"),'Tokyo');
    assert.match(await run("document.getElementById('world-city-zone').textContent"),/Asia\/Tokyo/);
    await fits();
    const utcMonths=['03','06','09','12'];
    for(let i=0;i<4;i++){
      await run(`document.querySelector('[data-world-season="${i}"]').click()`);
      assert.equal(await run("document.getElementById('world-mode').textContent"),'PREVIEW');
      assert.equal((await run("document.getElementById('world-date').value")).slice(5,7),utcMonths[i]);
      await fits();
    }
    await change('world-date','2026-06-21');await change('world-time-slider','1080','input');
    const before=await run("document.getElementById('world-utc').dateTime");
    await run("document.getElementById('world-play').click()");await pause(1100);
    assert.notEqual(await run("document.getElementById('world-utc').dateTime"),before);
    await run("document.getElementById('world-play').click()");
    assert.equal(await run("localStorage.getItem('atomic.preferences')"),original);
    await run("document.getElementById('world-now').click()");assert.equal(await run("document.getElementById('world-mode').textContent"),'LIVE');
    await run("document.getElementById('world-city-search').focus()");await change('world-city-search','Roma','input');
    await until("document.querySelector('.world-result strong')?.textContent==='Rome'");await run("document.querySelector('.world-result').click()");
    for(const theme of ['lime','cyan','fuchsia','ruby','gold','aqua','amethyst','lava','soft-sage','powder-blue','soft-lavender','warm-sand','rainbow','rainbow-soft','atlantic']){
      await change('theme-select',theme);await fits();
    }
    await change('theme-select','cyan');
    await change('world-coverage','all');await change('world-date','2026-12-21');await change('world-time-slider','1185','input');
    await capture('world-solstice.png');
    await run("document.querySelector('[data-world-season=\"0\"]').click()");await capture('world-equinox.png');
    await run("document.getElementById('world-now').click()");await capture('world-live.png');
    await run("document.querySelector('[data-station=wwvb]').click();document.getElementById('world-use-station').click()");
    assert.equal(await run("document.getElementById('station-select').value"),'wwvb');
    await run("document.getElementById('start-button').click()");await until("document.getElementById('status-badge').textContent==='TRANSMITTING'");
    await run("document.querySelector('[data-page=world]').click();document.getElementById('world-play').click()");
    await until("document.getElementById('world-use-station').disabled");
    await run("document.querySelector('[data-station=bpc]').click();document.getElementById('world-use-station').click()");
    await pause(1500);
    assert.equal(await run("document.getElementById('station-select').value"),'wwvb');
    assert.equal(await run("document.getElementById('status-badge').textContent"),'TRANSMITTING');
    await run("document.querySelector('[data-page=sync]').click();document.getElementById('start-button').click()");await until("!document.getElementById('start-button').disabled");
    await run("document.querySelector('[data-page=world]').click()");
    assert.equal(await run("document.getElementById('world-play').getAttribute('aria-pressed')"),'false');
    win.webContents.reload();await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));await until("!document.getElementById('start-button').disabled");
    await run("document.querySelector('[data-page=world]').click()");await until("document.getElementById('world-loading').hidden");
    assert.equal(await run("document.getElementById('world-city-name').textContent"),'Rome');
    assert.equal(await run("document.getElementById('world-coverage').value"),'all');
    assert.equal(await run("document.getElementById('world-mode').textContent"),'LIVE');
    await fits();assert.deepEqual(errors,[]);
    console.log('PASS: offline map and 171,637-city worker search, native aliases, keyboard selection, five station markers, coverage controls, seasonal events, independent preview/playback, fifteen themes, persistence, fixed layout and live AudioWorklet isolation.');app.exit(0);
  }catch(error){console.error(error.stack);console.error(errors);await capture('world-failure.png');app.exit(1);}
});
