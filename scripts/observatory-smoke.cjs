const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), assert = require('node:assert/strict');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'atomic-observatory-test-')));
require(path.join(process.env.ATOMIC_TEST_APP_ROOT ? path.resolve(process.env.ATOMIC_TEST_APP_ROOT) : path.resolve(__dirname,'..'),'electron/main.cjs'));
const epoch = Date.parse('2026-10-25T14:33:11Z');
let referenceEpoch = epoch;
ipcMain.removeHandler('clock:sync'); ipcMain.handle('clock:sync',()=>({ok:true,nowMs:referenceEpoch,host:'test-reference',offsetMs:0,uncertaintyMs:1,synchronizedAt:referenceEpoch}));
const pause = ms => new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
  const win=BrowserWindow.getAllWindows()[0], errors=[]; win.hide(); win.webContents.setAudioMuted(true);
  win.webContents.on('console-message',details=>{if(details.level==='error')errors.push(details.message);});
  win.webContents.session.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_r,callback)=>callback({cancel:true}));
  const run=source=>win.webContents.executeJavaScript(source,true);
  async function until(source,timeout=15000){const end=Date.now()+timeout;while(Date.now()<end){if(await run(source))return;await pause(100);}throw Error('Timeout: '+source);}
  async function change(id,value,type='change'){await run(`document.getElementById(${JSON.stringify(id)}).value=${JSON.stringify(value)};document.getElementById(${JSON.stringify(id)}).dispatchEvent(new Event(${JSON.stringify(type)}))`);}
  async function capture(name){await run("document.getElementById('toast').hidden=true");win.showInactive();await pause(250);fs.mkdirSync('artifacts',{recursive:true});fs.writeFileSync(path.join('artifacts',name),(await win.webContents.capturePage()).toPNG());win.hide();}
  async function fits(){
    const overflow=await run(`(()=>{const page=document.querySelector('.page.active'),b=page.getBoundingClientRect();return [...page.querySelectorAll('*')].filter(e=>{
      if(e.closest('svg')||e.parentElement.closest('.tm-events,.tm-moments,.tm-personal-note'))return false;
      const r=e.getBoundingClientRect();return r.width&&r.height&&(r.right>b.right+1||r.bottom>b.bottom+1);
    }).map(e=>e.id||e.className);})()`);
    assert.deepEqual(overflow,[],'Page overflow: '+overflow);
    assert.equal(await run("document.querySelector('.sidebar-bottom').getBoundingClientRect().bottom<=innerHeight"),true,'Sidebar overflow');
  }
  try{
    if(win.webContents.isLoading())await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));
    await until("!document.getElementById('start-button').disabled");
    await until("localStorage.getItem('atomic.preferences')!==null");
    const preferences=await run("localStorage.getItem('atomic.preferences')");
    assert.equal(await run("document.querySelector('.sidebar-station')"),null);
    await run("document.querySelector('[data-page=moon]').click()"); await fits();
    assert.equal(await run("document.getElementById('moon-mode').textContent"),'LIVE');
    assert.equal(await run("document.querySelectorAll('.moon-quarter').length"),4);
    assert.match(await run("document.getElementById('moon-distance').textContent"),/370,99[0-9] km/);
    const clock=await run("document.getElementById('moon-clock').textContent");
    await until(`document.getElementById('moon-clock').textContent!==${JSON.stringify(clock)}`,4000);
    assert.notEqual(await run("document.getElementById('moon-clock').textContent"),clock);
    await run("document.querySelectorAll('.moon-quarter')[0].click()");
    assert.equal(await run("document.getElementById('moon-mode').textContent"),'PREVIEW');
    assert.ok(await run("parseFloat(document.getElementById('moon-illumination').textContent)>99.5"));
    await change('moon-date','2024-04-08'); await change('moon-hour',1101,'input');
    assert.equal(await run("document.getElementById('moon-phase').textContent"),'New Moon');
    assert.equal(await run("document.getElementById('moon-illumination').textContent"),'0.0%');
    await run("document.getElementById('moon-next').click()");assert.equal(await run("document.getElementById('moon-date').value"),'2024-04-09');
    await run("document.getElementById('moon-previous').click();document.getElementById('moon-live').click()");
    assert.equal(await run("document.getElementById('moon-mode').textContent"),'LIVE');
    await run("document.getElementById('moon-observer').click()");
    assert.equal(await run("document.getElementById('world-city-search')===document.activeElement"),true);
    await change('world-city-search','Tokyo','input');await until("document.querySelector('.world-result strong')?.textContent==='Tokyo'");
    await run("document.querySelector('.world-result').click();document.querySelector('[data-page=moon]').click()");
    assert.match(await run("document.getElementById('moon-observer').textContent"),/Tokyo/);
    assert.equal(await run("document.getElementById('moon-zone').textContent"),'Asia/Tokyo');
    for(const theme of ['lime','cyan','fuchsia','ruby','gold','aqua','amethyst','lava','atlantic']){
      await change('theme-select',theme);await fits();
      await run("document.querySelector('[data-page=time-machine]').click()");await fits();
      for(const id of ['flight','sputnik','gagarin','apollo','footstep','voyager','web']){await run(`document.querySelector('[data-event=${id}]').click()`);await fits();}
      await run("document.querySelector('[data-tm-tab=personal]').click()");await fits();
      await run("document.querySelector('[data-tm-tab=history]').click();document.querySelector('[data-page=moon]').click()");
    }
    await capture('moon-atlantic.png'); await change('theme-select','cyan'); await capture('moon-observatory.png');
    await run("document.querySelector('[data-page=time-machine]').click();document.querySelector('[data-event=apollo]').click()");
    await capture('time-machine-history.png');
    assert.equal(await run("document.querySelectorAll('.tm-event').length"),32);
    const ids=await run("[...document.querySelectorAll('.tm-event')].map(button=>button.dataset.event)");
    for(const id of ids){
      await run(`document.querySelector('[data-event="${id}"]').click()`);await fits();
      assert.ok(await run("[...document.querySelectorAll('.tm-art [data-art]')].some(node=>getComputedStyle(node).display!=='none')"),'Missing scene: '+id);
      assert.match(await run("document.getElementById('tm-source').textContent"),/source/);
    }
    await run("document.querySelector('[data-event=apollo]').click()");
    const elapsed=await run("document.getElementById('tm-seconds').textContent");
    await until(`document.getElementById('tm-seconds').textContent!==${JSON.stringify(elapsed)}`,4000);
    assert.notEqual(await run("document.getElementById('tm-seconds').textContent"),elapsed);
    await run("document.getElementById('tm-travel').click()");
    assert.match(await run("document.getElementById('tm-clock').textContent"),/1969/);
    assert.equal(await run("document.getElementById('tm-mode').textContent"),'RECONSTRUCTION');
    await run("document.getElementById('tm-travel').click();document.querySelector('[data-event=web]').click()");
    assert.equal(await run("document.getElementById('tm-subday').hidden"),true);
    await change('tm-search','zzzz','input');assert.equal(await run("document.getElementById('tm-empty').hidden"),false);
    await change('tm-search','','input');await change('tm-category','Discovery');assert.equal(await run("document.querySelectorAll('.tm-event').length"),10);
    await change('tm-category','Timekeeping');assert.equal(await run("document.querySelectorAll('.tm-event').length"),3);
    await change('tm-category','all');await change('tm-search','gravitational','input');assert.equal(await run("document.querySelectorAll('.tm-event').length"),1);
    await change('tm-search','','input');
    await change('tm-category','all');
    await run("document.querySelector('[data-page=back-in-time]').click()");
    assert.equal(await run("document.querySelector('.sidebar [data-page=time-machine]').getAttribute('aria-current')"),'page');
    assert.equal(await run("document.querySelectorAll('.bttf-date-card').length"),5);
    await run("document.querySelector('[data-goto=time-machine]').click();document.querySelector('[data-tm-tab=personal]').click()");
    await change('tm-title-input','My first G-Shock');await change('tm-when','2020-01-01T12:00');await change('tm-note','<b>Saved as plain text</b>');
    await run("document.getElementById('tm-form').requestSubmit()");
    assert.equal(await run("document.querySelectorAll('.tm-personal-card').length"),1);
    assert.equal(await run("document.querySelector('.tm-personal-note').textContent"),'<b>Saved as plain text</b>');
    assert.equal(await run("document.querySelector('.tm-personal-note b')"),null);
    await run("document.querySelector('[data-action=edit]').click()");await change('tm-title-input','My edited G-Shock');await run("document.getElementById('tm-form').requestSubmit()");
    assert.equal(await run("document.querySelector('.tm-personal-heading h3').textContent"),'My edited G-Shock');
    await change('tm-title-input','Future self');await change('tm-kind','capsule');await change('tm-when','2020-01-01T12:00');await change('tm-note','A hidden future message');
    await run("document.getElementById('tm-form').requestSubmit()");assert.match(await run("document.getElementById('tm-form-status').textContent"),/future opening date/);
    await change('tm-when','2030-01-01T12:00');await run("document.getElementById('tm-form').requestSubmit()");
    assert.equal(await run("document.querySelectorAll('.tm-personal-card').length"),2);
    assert.match(await run("document.querySelector('.sealed .tm-personal-note').textContent"),/SEALED/);
    assert.equal(await run("document.querySelector('.sealed [data-action=edit]').disabled"),true);
    await fits();await capture('time-machine-personal.png');
    win.webContents.reload();await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));await until("!document.getElementById('start-button').disabled");
    await run("document.querySelector('[data-page=time-machine]').click();document.querySelector('[data-tm-tab=personal]').click()");
    assert.equal(await run("document.querySelectorAll('.tm-personal-card').length"),2);
    referenceEpoch = Date.parse('2030-01-01T12:00:01Z');
    await run("document.getElementById('settings-sync').click()");
    await until("document.querySelectorAll('.sealed').length===0");
    assert.match(await run("[...document.querySelectorAll('.tm-personal-note')].at(-1).textContent"),/A hidden future message/);
    assert.equal(await run("[...document.querySelectorAll('[data-action=edit]')].at(-1).disabled"),false);
    referenceEpoch = epoch;
    await run("document.getElementById('settings-sync').click()");await until("document.querySelectorAll('.sealed').length===1");
    await run("document.querySelector('.tm-personal-actions button:last-child').click();document.querySelector('[data-action=confirm-delete]').click()");
    assert.equal(await run("document.querySelectorAll('.tm-personal-card').length"),1);
    // The real muted signal keeps advancing through both preview types.
    await run("document.querySelector('[data-page=sync]').click();document.getElementById('start-button').click()");await until("document.getElementById('status-badge').textContent==='TRANSMITTING'");
    const signal=await run("document.getElementById('clock').textContent");
    await run("document.querySelector('[data-page=moon]').click();document.querySelector('.moon-quarter').click();document.querySelector('[data-page=time-machine]').click();document.querySelector('[data-tm-tab=history]').click();document.getElementById('tm-travel').click()");await pause(1200);
    assert.equal(await run("document.getElementById('status-badge').textContent"),'TRANSMITTING');
    assert.notEqual(await run("document.getElementById('clock').textContent"),signal);
    assert.equal(await run("localStorage.getItem('atomic.preferences')"),preferences);
    await run("document.querySelector('[data-page=sync]').click();document.getElementById('start-button').click()");await until("!document.getElementById('start-button').disabled");
    assert.deepEqual(errors,[]);
    console.log('PASS: offline Moon phases, local rise/set, UTC preview and shared observer; 32 sourced historical events, three categories, illustrated scenes and precision-aware counters; personal CRUD, capsule reveal and persistence; nine themes, fixed layout, expanded sidebar space and live muted AudioWorklet isolation.');app.exit(0);
  }catch(error){console.error(error.stack);console.error(errors);await capture('observatory-failure.png');app.exit(1);}
});
