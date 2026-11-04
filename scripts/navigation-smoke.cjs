const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-navigation-test-'));
app.setPath('userData', profile);
require(path.join(process.env.ATOMIC_TEST_APP_ROOT?path.resolve(process.env.ATOMIC_TEST_APP_ROOT):path.resolve(__dirname,'..'),'electron/main.cjs'));
require('./offline-iss.cjs')();
ipcMain.removeHandler('observatory:fullscreen');ipcMain.handle('observatory:fullscreen',()=>true);
ipcMain.removeHandler('clock:sync');
ipcMain.handle('clock:sync', () => ({ ok: false, error: 'Offline navigation test' }));
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

app.whenReady().then(async () => {
  const win = BrowserWindow.getAllWindows()[0];
  const errors = [];
  win.webContents.setAudioMuted(true);
  win.webContents.on('console-message', details => { if (details.level === 'error') errors.push(details.message); });
  win.webContents.session.webRequest.onBeforeRequest({ urls: ['http://*/*', 'https://*/*'] }, (_request, callback) => callback({ cancel: true }));
  const run = source => win.webContents.executeJavaScript(source, true);
  async function until(source) {
    const end = Date.now() + 10000;
    while (Date.now() < end) { if (await run(source)) return; await pause(50); }
    throw Error('Timeout: ' + source);
  }
  // Trusted renderer input avoids macOS discarding events for a non-key window.
  async function input(event){
    if(event.type==='mouseMove')return win.webContents.debugger.sendCommand('Input.dispatchMouseEvent',{type:'mouseMoved',x:event.x,y:event.y,button:'none'});
    return win.webContents.debugger.sendCommand('Input.dispatchKeyEvent',{type:event.type,key:event.keyCode,code:event.keyCode,windowsVirtualKeyCode:9,nativeVirtualKeyCode:9});
  }
  async function click(selector){
    const point=await run(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`);
    await input({type:'mouseMove',...point});
    await win.webContents.debugger.sendCommand('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});
    await win.webContents.debugger.sendCommand('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});
  }
  async function capture(file) {
    for(let attempt=0;attempt<3;attempt++)try{fs.writeFileSync(file,(await win.webContents.capturePage()).toPNG());return;}
    catch(error){if(!String(error).includes('UnknownVizError')||attempt===2)throw error;await pause(350);}
  }
  async function exposeSidebar() {
    await input({type:'keyDown',keyCode:'Tab'});await input({type:'keyUp',keyCode:'Tab'});
    await run("(()=>{const item=document.querySelector('.sidebar .nav-item.selected'),group=item.closest('[data-nav-group]');(group?group.querySelector('.nav-group-toggle'):item).focus()})()");
    await until("document.querySelector('.sidebar').dataset.expanded==='true'");await pause(330);
  }
  async function motion(value) {
    await win.webContents.debugger.sendCommand('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value }] });
    await until(`matchMedia('(prefers-reduced-motion: reduce)').matches === ${value === 'reduce'}`);
  }
  try {
    if (win.webContents.isLoading()) await new Promise(resolve => win.webContents.once('did-finish-load', resolve));
    // Keep renderer keyboard focus deterministic when macOS focuses another app.
    // Input events and :focus-visible still exercise the real sidebar handlers.
    win.webContents.debugger.attach('1.3');
    await win.webContents.debugger.sendCommand('Emulation.setFocusEmulationEnabled',{enabled:true});
    win.showInactive();
    await input({type:'mouseMove',x:650,y:100});
    await until("!document.hidden && !document.getElementById('start-button').disabled");
    // Real pointer/keyboard input reproduces the restored ring after closing a dialog.
    await input({type:'keyDown',keyCode:'Tab'});await input({type:'keyUp',keyCode:'Tab'});
    await run("document.getElementById('observatory-open').focus()");
    assert.equal(await run("getComputedStyle(document.getElementById('observatory-open')).outlineStyle"),'solid','Keyboard focus remains visible');
    await click('#observatory-open');await until("document.getElementById('observatory-dialog').open");
    await click('#observatory-close');await until("!document.getElementById('observatory-dialog').open&&document.activeElement.id==='observatory-open'");
    assert.equal(await run("getComputedStyle(document.activeElement).outlineStyle"),'none','Closing a dialog by pointer restores logical focus without a ring');
    await input({type:'keyDown',keyCode:'Tab'});await input({type:'keyUp',keyCode:'Tab'});
    assert.equal(await run("document.activeElement.id"),'help-button');
    assert.equal(await run("getComputedStyle(document.activeElement).outlineStyle"),'solid','Tab immediately restores the keyboard ring');
    await run("document.querySelector('[data-page=profiles]').click()");await click('#collection-search');
    assert.equal(await run("document.activeElement.id"),'collection-search','Pointer input keeps the field focused for editing');
    assert.equal(await run("getComputedStyle(document.activeElement).outlineStyle"),'none');
    await win.webContents.debugger.sendCommand('Input.insertText',{text:'Focus check'});
    assert.equal(await run("document.getElementById('collection-search').value"),'Focus check');
    await run("document.getElementById('collection-search').value='';document.querySelector('[data-page=home]').click()");
    assert.equal(await run("document.querySelectorAll('[data-nav-group]').length"),3);
    assert.equal(await run("document.querySelector('.sidebar').dataset.expanded"),'false');
    assert.equal(await run("Math.round(document.querySelector('.sidebar').getBoundingClientRect().width)"),72);
    const contentLeft=await run("document.querySelector('main').getBoundingClientRect().left");
    await input({type:'mouseMove',x:30,y:180});
    await until("document.querySelector('.sidebar').dataset.expanded==='true'&&Math.round(document.querySelector('.sidebar').getBoundingClientRect().width)===236");
    assert.equal(await run("Math.round(document.querySelector('.sidebar').getBoundingClientRect().width)"),236);
    assert.equal(await run("document.querySelector('main').getBoundingClientRect().left"),contentLeft,'Hover must not move the content');
    assert.equal(await run("document.querySelectorAll('.nav-group-toggle[aria-expanded=true]').length"),1);
    assert.equal(await run("document.querySelectorAll('.nav-group-collapse:not([inert]) [data-page]').length"),3);
    assert.equal(app.name, 'AtomicClockSync');
    assert.equal(app.getPath('userData'), profile, 'Rename must preserve an explicitly supplied profile');
    assert.equal(win.getTitle(), 'AtomicClockSync');
    assert.equal(await run("getComputedStyle(document.querySelector('.titlebar > span')).fontSize"), '13px');
    if (process.platform === 'darwin') assert.equal(Menu.getApplicationMenu().items[0].label, 'AtomicClockSync');
    await motion('no-preference');
    await run("document.getElementById('start-button').click()");
    await until("document.getElementById('status-badge').textContent === 'TRANSMITTING'");
    const clock = await run("document.getElementById('clock').textContent");
    await run("document.querySelector('[data-page=moon]').click()");
    assert.equal(await run("document.getElementById('page-moon').getAnimations().length > 0"), true);
    // A city shortcut must focus its target immediately, during the transition.
    await run("document.getElementById('moon-observer').click()");
    assert.equal(await run("document.activeElement.id"), 'world-city-search');
    await run("for (const page of ['settings', 'moon', 'time-machine', 'profiles', 'guide']) document.querySelector(`[data-page=\"${page}\"]`).click()");
    assert.equal(await run("document.querySelectorAll('.page.active:not([hidden])').length"), 1);
    assert.equal(await run("document.querySelector('.page.active').id"), 'page-guide');
    await exposeSidebar();
    await until("!document.querySelector('.page.active').getAnimations().length && !document.querySelector('.nav-indicator').getAnimations().length");
    assert.equal(await run("document.querySelector('.nav-indicator').hidden"), true,'Footer selection uses its own line');
    assert.equal(await run("getComputedStyle(document.querySelector('.sidebar-utilities .selected'),'::after').width"),'1px');
    await run("document.querySelector('[data-page=guide]').click()");
    assert.equal(await run("document.querySelector('.page.active').getAnimations().length"), 0);
    await run("document.querySelector('[data-page=moon]').click()");
    await motion('reduce');
    await until("!document.getElementById('page-moon').getAnimations().length");
    await run("document.querySelector('[data-page=time-machine]').click()");
    assert.equal(await run("document.querySelector('.page.active').getAnimations().length"), 0);
    assert.equal(await run("document.querySelector('.nav-indicator').getAnimations().length"), 0);
    await motion('no-preference');
    await run("document.querySelector('[data-page=moon]').click()");
    await until("!document.querySelector('.page.active').getAnimations().length");
    assert.equal(await run("document.querySelector('.sidebar .selected').dataset.page"), 'moon');
    assert.equal(await run("getComputedStyle(document.querySelector('.sidebar .selected')).color === getComputedStyle(document.querySelector('.brand-mark')).color"), true);
    await exposeSidebar();
    assert.equal(await run("getComputedStyle(document.querySelector('.sidebar .selected')).backgroundColor"),'rgba(0, 0, 0, 0)');
    assert.equal(await run("document.querySelector('.nav-indicator').getBoundingClientRect().width"),1);
    await pause(250);
    fs.mkdirSync('artifacts', { recursive: true });
    await capture('artifacts/navigation-moon.png');
    assert.equal(await run("document.getElementById('status-badge').textContent"), 'TRANSMITTING');
    await until(`document.getElementById('clock').textContent !== ${JSON.stringify(clock)}`);
    const currentPage=await run("document.querySelector('.page.active').id");
    await input({type:'keyDown',keyCode:'Tab'});await input({type:'keyUp',keyCode:'Tab'});
    await run("document.getElementById('nav-signal-toggle').focus()");
    for(const language of ['en','it','fr','de','es','ja']) {
      await run(`document.getElementById('language-select').value='${language}';document.getElementById('language-select').dispatchEvent(new Event('change'))`);
      for(const group of ['signal','watches','explore']) {
        await run(`(()=>{const b=document.getElementById('nav-${group}-toggle');b.focus();if(b.getAttribute('aria-expanded')==='false')b.click()})()`);
        await pause(260);
        assert.equal(await run("document.querySelectorAll('.nav-group-toggle[aria-expanded=true]').length"),1);
        assert.equal(await run("document.querySelector('.sidebar nav').scrollHeight<=document.querySelector('.sidebar nav').clientHeight+1"),true,language+' '+group+' sidebar should not scroll');
        assert.equal(await run("document.querySelector('.sidebar-bottom').getBoundingClientRect().bottom<=innerHeight"),true);
        assert.equal(await run("document.querySelector('.page.active').id"),currentPage,'Group disclosure must not change the page');
        if(group==='explore'){
          fs.mkdirSync('artifacts/sidebar',{recursive:true});await run("document.getElementById('toast').hidden=true");
          await capture(`artifacts/sidebar/${language}.png`);
        }
      }
    }
    await run("document.getElementById('nav-explore-toggle').click()");
    assert.equal(await run("document.querySelectorAll('.nav-group-toggle[aria-expanded=true]').length"),0);
    assert.equal(await run("document.querySelector('.nav-indicator').hidden"),true);
    assert.ok(await run("document.querySelector('.has-current-page .nav-group-toggle').title.length"));
    await run("document.querySelector('[data-page=moon]').focus()");
    assert.notEqual(await run("document.activeElement.dataset.page"),'moon','Collapsed items must be inert');
    await run("document.getElementById('nav-watches-toggle').focus();document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}))");
    assert.equal(await run("document.activeElement.dataset.page"),'profiles');
    await run("document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}))");
    assert.equal(await run("document.activeElement.id"),'nav-watches-toggle');
    assert.equal(await run("document.getElementById('nav-watches-items').inert"),true);
    await run("document.getElementById('help-button').click()");
    assert.equal(await run("document.querySelector('.sidebar-utilities [data-page=guide]').getAttribute('aria-current')"),'page','Guide remains pinned outside groups');
    await run("document.getElementById('nav-watches-toggle').click()");
    await motion('reduce');
    assert.equal(await run("getComputedStyle(document.getElementById('nav-watches-items')).transitionDuration"),'0s');
    assert.equal(await run("document.getElementById('start-button').classList.contains('running')"),true,'Accordion changes preserve live audio');
    await run("document.getElementById('start-button').click()");await until("!document.getElementById('start-button').disabled");
    win.webContents.reload();await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));await until("!document.getElementById('start-button').disabled");
    await input({type:'mouseMove',x:1000,y:100});await input({type:'mouseMove',x:30,y:180});await until("document.querySelector('.sidebar').dataset.expanded==='true'");
    assert.equal(await run("document.getElementById('nav-watches-toggle').getAttribute('aria-expanded')"),'true','Saved expanded group survives restart');
    await run("document.getElementById('nav-watches-toggle').click()");
    assert.equal(await run("JSON.parse(localStorage.getItem('atomic.sidebar.v1')).expanded"),null);
    win.webContents.reload();await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));await until("!document.getElementById('start-button').disabled");
    assert.equal(await run("document.querySelectorAll('.nav-group-toggle[aria-expanded=true]').length"),0,'All-folded state survives restart');
    await run("document.getElementById('language-select').value='en';document.getElementById('language-select').dispatchEvent(new Event('change'));document.getElementById('nav-signal-toggle').click();document.getElementById('toast').hidden=true");
    await pause(500);await capture('artifacts/sidebar/expanded.png');
    await run("document.activeElement.blur()");await input({type:'mouseMove',x:1000,y:100});
    await until("document.querySelector('.sidebar').dataset.expanded==='false'");await pause(330);
    assert.equal(await run("Math.round(document.querySelector('.sidebar').getBoundingClientRect().width)"),72);
    assert.equal(await run("document.querySelector('main').getBoundingClientRect().left"),contentLeft);
    assert.equal(await run("document.querySelectorAll('.nav-group-collapse:not([inert]) [data-page]').length"),0,'Compact rail has no hidden tab stops');
    assert.equal(await run("document.querySelector('.sidebar .version').innerText.trim()"),'v'+require('../package.json').version);
    assert.equal(await run("(()=>{const a=document.querySelector('.sidebar .version').getBoundingClientRect(),b=document.querySelector('.sidebar').getBoundingClientRect();return Math.abs((a.left+a.right)/2-(b.left+b.right)/2)<1})()"),true,'Compact version is centred');
    await capture('artifacts/sidebar/synchronization.png');
    // Reload starts in pointer mode; enter keyboard navigation explicitly.
    await input({type:'keyDown',keyCode:'Tab'});await input({type:'keyUp',keyCode:'Tab'});
    await run("document.getElementById('nav-explore-toggle').focus()");await until("document.querySelector('.sidebar').dataset.expanded==='true'");
    await run("document.getElementById('page-title').tabIndex=-1;document.getElementById('page-title').focus()");await until("document.querySelector('.sidebar').dataset.expanded==='false'");
    assert.deepEqual(errors, []);
    console.log('PASS: pointer clicks and dialog focus restoration without rings, keyboard focus rings and field editing, AtomicClockSync identity and profile, real visible transitions, rapid navigation, immediate focus, aligned sidebar indicator, reduced-motion changes, three thematic groups and pinned Settings/Guide, zero scrolling in six languages, keyboard/inert disclosure, hover expansion without content movement, keyboard expansion, saved open/folded state and continuous muted AudioWorklet transmission.');
    app.exit(0);
  } catch (error) {
    console.error(error.stack, errors);
    app.exit(1);
  }
});
