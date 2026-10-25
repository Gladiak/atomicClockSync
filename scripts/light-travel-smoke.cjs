const { app, BrowserWindow, ipcMain } = require('electron');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'atomic-light-travel-')));
require(path.join(process.env.ATOMIC_TEST_APP_ROOT?path.resolve(process.env.ATOMIC_TEST_APP_ROOT):path.resolve(__dirname,'..'),'electron/main.cjs'));
const epoch=Date.parse('2026-10-25T12:00:00Z');
ipcMain.removeHandler('clock:sync');ipcMain.handle('clock:sync',()=>({ok:true,nowMs:epoch,host:'test-reference',offsetMs:0,uncertaintyMs:1,synchronizedAt:epoch}));
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
  const win=BrowserWindow.getAllWindows()[0],errors=[];win.hide();win.webContents.setAudioMuted(true);
  win.webContents.on('console-message',details=>{if(details.level==='error')errors.push(details.message);});
  win.webContents.session.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_r,callback)=>callback({cancel:true}));
  const run=source=>win.webContents.executeJavaScript(source,true);
  async function until(source,timeout=10000){const end=Date.now()+timeout;while(Date.now()<end){if(await run(source))return;await pause(50);}throw Error('Timeout: '+source);}
  async function change(id,value){await run(`document.getElementById(${JSON.stringify(id)}).value=${JSON.stringify(value)};document.getElementById(${JSON.stringify(id)}).dispatchEvent(new Event('change'))`);}
  async function click(id){await run(`document.getElementById(${JSON.stringify(id)}).click()`);}
  async function fits(label){
    await until("!document.querySelector('.lt-telemetry').getAnimations().length");
    const overflow=await run(`(()=>{const page=document.getElementById('page-light-travel'),bounds=page.getBoundingClientRect();return [...page.querySelectorAll('*')].filter(node=>{
      if(node.closest('svg,dialog'))return false;const r=node.getBoundingClientRect();return r.width&&r.height&&(r.right>bounds.right+1||r.bottom>bounds.bottom+1);
    }).map(node=>node.id||node.className);})()`);
    assert.deepEqual(overflow,[],label+' page overflow');
    assert.equal(await run("[...document.querySelectorAll('.lt-main,.lt-clocks,.lt-targets')].every(group=>[...group.children].every(child=>child.getBoundingClientRect().bottom<=group.getBoundingClientRect().bottom+1))"),true,label+' inner grid overflow');
    assert.equal(await run("document.querySelector('.sidebar-bottom').getBoundingClientRect().bottom<=innerHeight"),true,label+' sidebar');
    assert.equal(await run("/undefined|NaN|\\{\\d+\\}/.test(document.getElementById('page-light-travel').innerText)"),false,label+' labels');
  }
  async function capture(name){win.showInactive();await pause(650);fs.mkdirSync('artifacts/light-travel',{recursive:true});fs.writeFileSync(`artifacts/light-travel/${name}.png`,(await win.webContents.capturePage()).toPNG());}
  try{
    if(win.webContents.isLoading())await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));
    await until("!document.getElementById('start-button').disabled && localStorage.getItem('atomic.preferences') !== null");
    const preferences=await run("localStorage.getItem('atomic.preferences')");
    await run("document.querySelector('[data-page=light-travel]').click()");await fits('default');
    assert.equal(await run("document.querySelectorAll('.lt-target').length"),9);
    assert.equal(await run("document.querySelectorAll('.lt-body').length"),9);
    assert.equal(await run("document.getElementById('lt-mode').textContent"),'LIVE');
    assert.equal(await run("document.getElementById('lt-delay').textContent"),'08:16');
    await capture('light-travel-sun');
    await change('lt-speed','auto');await click('lt-play');await pause(4800);await capture('light-travel-flight');await click('lt-reset');
    win.webContents.debugger.attach('1.3');
    await win.webContents.debugger.sendCommand('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
    await run("document.querySelector('[data-target=moon]').click()");await change('lt-speed','1');
    await click('lt-play');await pause(220);await click('lt-play');
    const progress=await run("document.getElementById('lt-progress').getAttribute('aria-valuenow')");
    assert.ok(Number(progress)>0&&Number(progress)<100,'Lunar real-time playback should be in flight');
    assert.equal(await run("document.getElementById('lt-play-label').textContent"),'Resume journey');
    await pause(200);assert.equal(await run("document.getElementById('lt-progress').getAttribute('aria-valuenow')"),progress);
    await change('lt-speed','1000');assert.equal(await run("document.getElementById('lt-progress').getAttribute('aria-valuenow')"),progress);
    await click('lt-play');await until("!document.getElementById('lt-arrival').hidden");
    assert.equal(await run("document.getElementById('lt-progress').getAttribute('aria-valuenow')"),'100');
    assert.equal(await run("document.getElementById('lt-scene').classList.contains('lt-arrived')"),true);
    await run("document.querySelector('[data-target=sun]').click()");await change('lt-speed','1');await click('lt-play');
    const frozen=await run("document.getElementById('lt-received').dateTime");
    await run("document.querySelector('[data-page=settings]').click();document.querySelector('[data-page=light-travel]').click()");
    assert.equal(await run("document.getElementById('lt-play-label').textContent"),'Resume journey');
    assert.equal(await run("document.getElementById('lt-received').dateTime"),frozen);
    await click('lt-reset');await change('lt-date','2026-12-31');await change('lt-time','23:59:00');
    assert.equal(await run("document.getElementById('lt-mode').textContent"),'PREVIEW');
    const emitted=await run("document.getElementById('lt-emitted').dateTime");
    assert.ok(emitted.startsWith('2026-12-31T23:50:'));
    await click('lt-months');assert.equal(await run("document.getElementById('lt-date').value"),'2027-06-30');
    await change('lt-date','2100-12-31');assert.equal(await run("document.getElementById('lt-months').disabled"),true);
    await click('lt-live');assert.equal(await run("document.getElementById('lt-mode').textContent"),'LIVE');
    await run("document.querySelector('[data-page=sync]').click();document.getElementById('start-button').click()");
    await until("document.getElementById('start-button').classList.contains('running')");
    await run("document.querySelector('[data-page=light-travel]').click()");
    await click('lt-info');assert.equal(await run("document.getElementById('lt-dialog').open"),true);
    win.webContents.sendInputEvent({type:'keyDown',keyCode:'Escape'});win.webContents.sendInputEvent({type:'keyUp',keyCode:'Escape'});
    await until("!document.getElementById('lt-dialog').open");
    assert.equal(await run("document.getElementById('start-button').classList.contains('running')"),true,'Closing explanation must not stop transmission');
    for(const language of ['en','it','fr','de','es','ja']){
      await change('language-select',language);
      for(const target of ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune']){
        await run(`document.querySelector('[data-target=${target}]').click()`);await fits(language+' '+target);
      }
      await capture('light-travel-'+language);
    }
    for(const theme of ['lime','cyan','fuchsia','ruby','gold','aqua','amethyst','lava','atlantic']){
      await change('theme-select',theme);await fits('theme '+theme);
    }
    await capture('light-travel-atlantic');await change('theme-select','cyan');await change('language-select','it');
    await run("document.querySelector('[data-target=saturn]').click()");await capture('light-travel-italian');
    await win.webContents.debugger.sendCommand('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    await until("document.getElementById('page-light-travel').classList.contains('lt-motion-reduced')");
    await change('lt-speed','1000');await click('lt-play');
    assert.equal(await run("getComputedStyle(document.getElementById('lt-photon')).display"),'none');
    await click('lt-reset');await click('lt-live');
    assert.equal(await run("localStorage.getItem('atomic.preferences')"),preferences);
    assert.equal(await run("document.getElementById('start-button').classList.contains('running')"),true);
    assert.deepEqual(errors,[]);
    console.log('PASS: nine offline sources, UTC previews, month-end bounds, fixed replay, pause/resume/speed changes, lunar arrival, hidden-page pause, dialog Escape, six languages, nine themes, reduced motion and muted transmission isolation.');app.exit(0);
  }catch(error){console.error(error.stack);console.error(errors);await capture('failure');app.exit(1);}
});
