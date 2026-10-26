const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), assert = require('node:assert/strict');
app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-languages-')));
require(path.join(process.env.ATOMIC_TEST_APP_ROOT ? path.resolve(process.env.ATOMIC_TEST_APP_ROOT) : path.resolve(__dirname,'..'),'electron/main.cjs'));
ipcMain.removeHandler('clock:sync');
ipcMain.handle('clock:sync', () => ({ ok:true, nowMs:Date.parse('2026-10-25T14:33:11Z'), host:'test', offsetMs:0, uncertaintyMs:1, synchronizedAt:Date.now() }));
ipcMain.removeHandler('iss:refresh');
const { validateOrbit } = require('../electron/iss-data.cjs');
const orbit = validateOrbit(JSON.parse(fs.readFileSync(path.join(__dirname,'../test/fixtures/iss-omm.json'),'utf8')));
ipcMain.handle('iss:refresh', () => ({orbit, fix:null, connectivity:'online', lastSuccess:Date.parse('2026-10-25T14:33:11Z'), error:''}));
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
app.whenReady().then(async () => {
  const win = BrowserWindow.getAllWindows()[0], errors = [], layout = [], untranslated = [];
  win.hide(); win.webContents.setAudioMuted(true);
  win.webContents.on('console-message', details => { if (details.level === 'error') errors.push(details.message); });
  win.webContents.session.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']}, (_request, callback) => callback({cancel:true}));
  const run = source => win.webContents.executeJavaScript(source, true);
  async function until(source) { const end=Date.now()+20000; while(Date.now()<end){ if(await run(source))return; await pause(100); } throw Error('Timeout: '+source); }
  async function click(page) { await run(`document.querySelector('[data-page="${page}"]').click()`); }
  async function change(id,value) { await run(`document.getElementById(${JSON.stringify(id)}).value=${JSON.stringify(value)};document.getElementById(${JSON.stringify(id)}).dispatchEvent(new Event('change'))`); }
  async function fits(language,page) {
    const overflow = await run(`(() => {
      const page=document.querySelector('.page.active'), bounds=page.getBoundingClientRect();
      return [...page.querySelectorAll('*')].filter(element => {
        if(element.closest('svg') || element.parentElement.closest('.tm-events,.tm-moments,.tm-personal-note,.iss-pass-list,.settings-panel,.manual-reader,.manual-index-list'))return false;
        const r=element.getBoundingClientRect(); if(!r.width||!r.height)return false;
        return r.right>bounds.right+1 || r.bottom>bounds.bottom+1;
      }).map(element=>element.id || element.className);
    })()`);
    if(overflow.length) layout.push({language,page,overflow});
    if(language !== 'en') {
      const english = await run(`(async () => {
        const {messages}=await import('./locales/messages.mjs'); const result=[];
        const walker=document.createTreeWalker(document.querySelector('.page.active'),NodeFilter.SHOW_TEXT);
        while(walker.nextNode()) {
          const node=walker.currentNode, text=node.data.trim(), rect=node.parentElement.getBoundingClientRect();
          if(rect.width && rect.height && messages[text]?.[${JSON.stringify(language)}] && messages[text][${JSON.stringify(language)}]!==text && !node.parentElement.closest('.tm-personal-note,.tm-personal-heading,.history-watch,[translate=no]')) result.push(text);
        }
        return [...new Set(result)];
      })()`);
      if(english.length) untranslated.push({language,page,english});
    }
    assert.equal(await run("document.querySelector('.sidebar-bottom').getBoundingClientRect().bottom <= innerHeight"),true,language+' sidebar');
  }
  async function capture(name) { win.showInactive(); await pause(650); fs.mkdirSync('artifacts/languages',{recursive:true}); fs.writeFileSync(`artifacts/languages/${name}.png`,(await win.webContents.capturePage()).toPNG()); win.hide(); }
  try {
    if(win.webContents.isLoading()) await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));
    await until("!document.getElementById('start-button').disabled");
    await until("localStorage.getItem('atomic.preferences') !== null");
    const prefs=await run("localStorage.getItem('atomic.preferences')");
    await run("document.getElementById('profile-name').value='History';document.getElementById('profile-position').value='My personal note 日本語';document.getElementById('tm-title-input').value='My future';document.getElementById('tm-note').value='Private untranslated message';document.getElementById('start-button').click()");
    await until("document.getElementById('status-badge').textContent === 'TRANSMITTING'");
    for(const language of ['en','it','fr','de','es','ja']) {
      await click('settings'); await change('language-select',language);
      if(language==='ja') {
        await run("document.fonts.load('12px \"Atomic Noto Sans JP\"', '日本語')");
        assert.equal(await run("document.fonts.check('12px \"Atomic Noto Sans JP\"', '日本語')"),true);
      }
      assert.equal(await run('document.documentElement.lang'),language);
      assert.equal(await run("JSON.parse(localStorage.getItem('atomic.language'))"),language);
      assert.equal(await run("document.getElementById('profile-name').value"),'History');
      assert.equal(await run("document.getElementById('tm-note').value"),'Private untranslated message');
      for(const page of ['settings','sync','profiles','signal','world','moon','iss','time-machine','back-in-time','light-travel','reception-lab','watch-accuracy','history','guide']) {
        await click(page);
        if(page==='world') await until("document.getElementById('world-loading').hidden");
        if(page==='iss') await run("document.querySelector('[data-iss-tab=tracking]').click()");
        await fits(language,page);
        if(page==='back-in-time') for(const destination of ['west','arrival','lightning','pines','future']) {
          await run(`document.querySelector('[data-destination="${destination}"]').click()`);
          await fits(language,'movie-'+destination);
        }
        const text=await run("document.querySelector('.page.active').innerText");
        assert.ok(!/undefined|NaN|\{\d+\}/.test(text),language+' '+page+' interpolation');
        if(['settings','sync','moon','time-machine','back-in-time'].includes(page)) await capture(`${language}-${page}`);
      }
      await click('iss');
      for(const tab of ['passes','station','time']) {
        await run(`document.querySelector('[data-iss-tab="${tab}"]').click()`); await fits(language,'iss-'+tab);
      }
      await click('time-machine');
      await run("document.querySelector('[data-tm-tab=personal]').click()"); await fits(language,'personal');
      await run("document.querySelector('[data-tm-tab=history]').click()");
      assert.equal(await run("document.querySelectorAll('.tm-event').length"),96);
      const search = {it:'Aquila',fr:'Aigle',de:'Adler',es:'Águila',ja:'イーグル'}[language];
      if(search) {
        await run(`document.getElementById('tm-search').value=${JSON.stringify(search)};document.getElementById('tm-search').dispatchEvent(new Event('input'))`);
        assert.equal(await run("document.querySelector('.tm-event')?.dataset.event"),'apollo','Localized historical search');
        await run("document.getElementById('tm-search').value='';document.getElementById('tm-search').dispatchEvent(new Event('input'))");
      }
      for(const id of await run("[...document.querySelectorAll('.tm-event')].map(node=>node.dataset.event)")) {
        await run(`document.querySelector('[data-event="${id}"]').click()`); await fits(language,'journey-'+id);
      }
      await capture(`${language}-time-machine-expanded`);
      assert.equal(await run("localStorage.getItem('atomic.preferences')"),prefs);
    }
    await click('settings');
    for(const language of ['de','ja']) for(const theme of ['lime','cyan','fuchsia','ruby','gold','aqua','amethyst','lava','atlantic']) {
      await change('language-select',language); await change('theme-select',theme); await fits(language,'settings-'+theme);
    }
    await capture('ja-settings-atlantic');
    assert.equal(await run("document.getElementById('start-button').classList.contains('running')"),true,'Language changes must not stop transmission');
    if(process.platform==='darwin') assert.equal(Menu.getApplicationMenu().items[1].label,'編集');
    await run("document.querySelector('[data-page=sync]').click();document.getElementById('start-button').click()");
    await until("!document.getElementById('start-button').disabled");
    win.webContents.reload(); await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));
    await until("!document.getElementById('start-button').disabled");
    assert.equal(await run('document.documentElement.lang'),'ja');
    assert.equal(await run("document.getElementById('language-select').value"),'ja');
    fs.writeFileSync('artifacts/languages/layout.json',JSON.stringify(layout,null,2));
    fs.writeFileSync('artifacts/languages/untranslated.json',JSON.stringify(untranslated,null,2));
    assert.deepEqual(layout,[],'Localized layout overflow'); assert.deepEqual(untranslated,[],'Untranslated interface messages'); assert.deepEqual(errors,[]);
    console.log('PASS: six languages, all sections, 96 journeys, long translations, Japanese glyphs, nine themes, local persistence, native menu, unsaved personal text and continuous muted transmission.'); app.exit(0);
  } catch(error) { fs.mkdirSync('artifacts/languages',{recursive:true}); fs.writeFileSync('artifacts/languages/layout.json',JSON.stringify(layout,null,2)); console.error(error.stack);console.error(errors); await capture('failure'); app.exit(1); }
});
