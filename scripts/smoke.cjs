// End-to-end desktop check with real Chromium, preload and AudioWorklet, muted.
const { app, BrowserWindow, ipcMain, powerMonitor } = require('electron');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-desktop-test-'));
app.setPath('userData', temporary);
require('../electron/main.cjs');
ipcMain.removeHandler('iss:refresh');
ipcMain.handle('iss:refresh',()=>({orbit:null,fix:null,connectivity:'unreachable',lastSuccess:0,error:'Offline desktop test'}));
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const errors = [];
const artifactPath = path.join(__dirname, '../artifacts');
fs.mkdirSync(artifactPath, { recursive: true });

app.whenReady().then(async () => {
  const window = BrowserWindow.getAllWindows()[0];
  window.hide();
  window.webContents.setAudioMuted(true);
  window.webContents.on('console-message', details => {
    if (details.level === 'error') errors.push(details.message);
  });
  window.webContents.on('preload-error', (_event, _path, error) => errors.push(error.message));
  const run = script => window.webContents.executeJavaScript(script, true);
  async function until(script, timeout = 10000) {
    const end = Date.now() + timeout;
    while (Date.now() < end) { if (await run(script)) return; await pause(100); }
    throw new Error(`Timeout: ${script}`);
  }
  async function capture(name) {
    // Hidden macOS windows can return an older compositor frame. Paint briefly
    // without taking focus before saving the view under test.
    const visible = window.isVisible();
    if (!visible) window.showInactive();
    await pause(200);
    fs.writeFileSync(path.join(artifactPath, name), (await window.webContents.capturePage()).toPNG());
    if (!visible) window.hide();
  }
  try {
    if (window.webContents.isLoading()) await new Promise(resolve => window.webContents.once('did-finish-load', resolve));
    await until("document.getElementById('hours').textContent !== '--'");
    await until("!document.getElementById('start-button').disabled");
    assert.equal(await run("typeof window.desktop.synchronize"), 'function');
    assert.equal(await run("typeof window.require"), 'undefined');
    assert.equal(await run("document.querySelectorAll('.bit').length"), 60);
    assert.equal(await run("document.documentElement.scrollWidth <= window.innerWidth"), true);
    assert.equal(window.isResizable(), false);
    assert.equal(window.isMaximizable(), false);
    assert.equal(window.isFullScreenable(), false);
    assert.deepEqual(window.getContentSize(), [1100, 740]);
    const assertFits = async () => {
      if (await run("!document.getElementById('page-world').hidden")) await until("document.getElementById('world-loading').hidden");
      const overflow = await run(`(() => {
        const page = document.querySelector('.page.active');
        const bounds = page.getBoundingClientRect();
        return [...page.querySelectorAll('*')].filter(el => {
          const r = el.getBoundingClientRect();
          return r.width && r.height && (r.bottom > bounds.bottom + 1 || r.right > bounds.right + 1);
        }).map(el => el.id || el.className || el.tagName);
      })()`);
      assert.deepEqual(overflow, [], `Content exceeds fixed page: ${overflow}`);
      assert.equal(await run('document.documentElement.scrollHeight <= window.innerHeight'), true);
    };
    await assertFits();
    for (const page of ['profiles', 'signal', 'world', 'iss', 'settings', 'guide', 'history', 'sync']) {
      await run(`document.querySelector('[data-page=${page}]').click()`);
      await assertFits();
      if (page === 'guide') {
        for (let i = 0; i < 4; i++) {
          await run(`document.querySelectorAll('details')[${i}].open=true`);
          await assertFits();
        }
        await run("document.querySelectorAll('details').forEach(d=>d.open=false)");
      }
    }
    const themes = await run("[...document.getElementById('theme-select').options].map(option=>option.value)");
    assert.equal(themes.length, 9);
    assert.equal(await run("document.documentElement.dataset.theme"), 'lime');
    await until("localStorage.getItem('atomic.preferences') !== null");
    const originalPreferences = await run("localStorage.getItem('atomic.preferences')");
    for (const theme of themes) {
      await run(`document.getElementById('theme-select').value='${theme}';document.getElementById('theme-select').dispatchEvent(new Event('change'))`);
      assert.equal(await run('document.documentElement.dataset.theme'), theme);
      for (const page of ['sync','profiles','signal','world','iss','history','guide','settings']) {
        await run(`document.querySelector('[data-page=${page}]').click()`);
        await assertFits();
      }
      const ratios = await run(`(() => {
        const canvas=document.createElement('canvas');canvas.width=canvas.height=1;
        const ctx=canvas.getContext('2d');
        const rgb=color=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data].slice(0,3);};
        const style=selector=>getComputedStyle(document.querySelector(selector));
        const luminance=color=>rgb(color).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
        const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
        const root=style(':root'),panel=style('.settings-panel'),input=style('#audio-output'),button=style('#start-button'),secondary=style('#settings-sync');
        const faint=style('.settings-panel>.muted-text').color;
        const probe=document.createElement('i');probe.style.backgroundColor='var(--button-hover)';document.body.append(probe);
        const hover=getComputedStyle(probe).backgroundColor;probe.remove();
        return {text:ratio(root.color,panel.backgroundColor),faint:ratio(faint,panel.backgroundColor),
          input:ratio(input.color,input.backgroundColor),accent:ratio(secondary.color,secondary.backgroundColor),
          primary:ratio(button.color,button.backgroundColor),hover:ratio(button.color,hover),scheme:root.colorScheme};
      })()`);
      for (const key of ['text','faint','input','accent','primary','hover']) assert.ok(ratios[key]>=4.5, `${theme} ${key}: contrast ${ratios[key]}`);
      assert.equal(ratios.scheme, theme==='atlantic'?'light':'dark');
      assert.equal(await run("localStorage.getItem('atomic.preferences')"), originalPreferences, 'Theme must not alter signal settings');
      await capture(`theme-${theme}.png`);
    }
    window.webContents.reload();
    await new Promise(resolve => window.webContents.once('did-finish-load', resolve));
    await until("!document.getElementById('start-button').disabled");
    assert.equal(await run('document.documentElement.dataset.theme'), 'atlantic');
    assert.equal(await run("document.getElementById('theme-select').value"), 'atlantic');
    await run("localStorage.setItem('atomic.theme',JSON.stringify('invalid-theme'))");
    window.webContents.reload();
    await new Promise(resolve => window.webContents.once('did-finish-load', resolve));
    await until("!document.getElementById('start-button').disabled");
    assert.equal(await run('document.documentElement.dataset.theme'), 'lime');
    await run("document.getElementById('theme-select').value='lime';document.getElementById('theme-select').dispatchEvent(new Event('change'))");
    await run("document.querySelector('[data-page=settings]').click(); document.getElementById('wave-type').value='sine-gated'; document.getElementById('wave-type').dispatchEvent(new Event('change'))");
    await assertFits();
    assert.match(await run("document.getElementById('profile-hint').textContent"), /Fully silent intervals/);
    await run("document.querySelector('[data-page=sync]').click()");
    assert.match(await run("document.getElementById('wave-label').textContent"), /FULL PAUSES/);
    assert.match(await run("document.getElementById('wave-path').getAttribute('d')"), /62/);
    window.webContents.reload();
    await new Promise(resolve => window.webContents.once('did-finish-load', resolve));
    await until("!document.getElementById('start-button').disabled");
    assert.equal(await run("document.getElementById('wave-type').value"), 'sine-gated');
    await run("document.getElementById('start-button').click()");
    await until("document.getElementById('start-button').classList.contains('running')");
    assert.equal(await run("document.getElementById('wave-type').disabled"), true);
    assert.equal(await run("document.getElementById('theme-select').disabled"), false);
    await run("document.getElementById('theme-select').value='cyan';document.getElementById('theme-select').dispatchEvent(new Event('change'))");
    assert.equal(await run("document.getElementById('start-button').classList.contains('running')"), true);
    await run("document.getElementById('theme-select').value='lime';document.getElementById('theme-select').dispatchEvent(new Event('change'))");
    await pause(2500);
    assert.equal(await run("document.getElementById('status-badge').textContent"), 'TRANSMITTING');
    await run("document.getElementById('start-button').click()");
    await until("!document.getElementById('start-button').disabled");
    await run("localStorage.setItem('atomic.history','[]')");
    window.webContents.reload();
    await new Promise(resolve => window.webContents.once('did-finish-load', resolve));
    await until("!document.getElementById('start-button').disabled");
    for (const id of ['bpc', 'jjy', 'wwvb', 'msf', 'dcf77']) {
      await run(`document.getElementById('station-select').value='${id}';document.getElementById('station-select').dispatchEvent(new Event('change'))`);
      assert.equal(await run("document.getElementById('station-card-name').textContent"), id.toUpperCase());
      assert.equal(await run("document.getElementById('dcf-gated-option').disabled"), id !== 'dcf77');
      assert.equal(await run("document.getElementById('wave-type').value"), 'sine');
      assert.equal(await run("document.querySelectorAll('.bit').length"), id === 'bpc' ? 20 : 60);
      await assertFits();
      for (const page of ['signal', 'settings', 'guide', 'sync']) {
        await run(`document.querySelector('[data-page=${page}]').click()`);
        await assertFits();
      }
      await run("document.getElementById('start-button').click()");
      await until("document.getElementById('start-button').classList.contains('running')");
      assert.equal(await run("document.getElementById('station-select').disabled"), true);
      await run("document.getElementById('station-select').value='bpc';document.getElementById('station-select').dispatchEvent(new Event('change'))");
      assert.equal(await run("document.getElementById('station-select').value"), id);
      await pause(100);
      await run("document.getElementById('start-button').click()");
      await until("!document.getElementById('start-button').disabled");
    }
    await run(`(() => {
      const items=JSON.parse(localStorage.getItem('atomic.history'));
      localStorage.setItem('atomic.history', JSON.stringify([...items,...items.slice(0,3)]));
    })()`);
    window.webContents.reload();
    await new Promise(resolve => window.webContents.once('did-finish-load', resolve));
    await until("!document.getElementById('start-button').disabled");
    await run("document.querySelector('[data-page=history]').click()");
    assert.equal(await run("document.querySelectorAll('.history-row').length"), 8);
    await assertFits();
    const stationRows=await run("[...document.querySelectorAll('.history-row')].map(row=>row.children[1].textContent.split(' · ')[0])");
    assert.deepEqual(stationRows.slice(0,5), ['DCF77','MSF','WWVB','JJY','BPC']);
    await run("localStorage.setItem('atomic.history','[]')");
    window.webContents.reload();
    await new Promise(resolve => window.webContents.once('did-finish-load', resolve));
    await until("!document.getElementById('start-button').disabled");
    await pause(200);
    await capture('desktop-sync.png');
    await run("document.querySelector('[data-page=settings]').click()");
    assert.equal(await run("document.getElementById('page-settings').hidden"), false);
    await pause(200);
    await capture('desktop-settings.png');
    await run("document.querySelector('[data-page=guide]').click()");
    assert.equal(await run("document.querySelectorAll('.guide-step').length"), 4);
    await pause(200);
    await capture('desktop-guide.png');
    await run("document.querySelector('[data-page=sync]').click(); document.getElementById('start-button').click()");
    await until("document.getElementById('start-button').classList.contains('running')");
    assert.equal(await run("document.getElementById('duration').disabled"), true);
    assert.equal(await run("document.getElementById('sync-button').disabled"), true);
    await pause(2500);
    assert.equal(await run("document.getElementById('status-badge').textContent"), 'TRANSMITTING');
    await run("document.getElementById('volume').value=20;document.getElementById('volume').dispatchEvent(new Event('input'))");
    assert.equal(await run("document.getElementById('volume-value').textContent"), '20%');
    await capture('desktop-transmitting.png');
    await run("document.getElementById('confirmed-button').click()");
    await until("!document.getElementById('start-button').disabled");
    assert.equal(await run("document.querySelectorAll('.history-row').length"), 1);
    assert.equal(await run("document.querySelector('.history-status').textContent"), '✓ Reception confirmed by you');
    await run("document.getElementById('start-button').click()");
    await until("document.getElementById('start-button').classList.contains('running')");
    await run("window.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape'}))");
    await until("!document.getElementById('start-button').disabled");
    assert.equal(await run("document.querySelectorAll('.history-row').length"), 2);
    await run("document.getElementById('clear-history').click();document.querySelector('#toast button').click()");
    assert.equal(await run("document.querySelectorAll('.history-row').length"), 2);
    // Validate the real worklet's completion signal, including its imported codec.
    const completed = await run(`(async () => {
      const context = new AudioContext({sampleRate:48000});
      await context.audioWorklet.addModule(new URL('./signal-worklet.mjs', location.href));
      await context.resume();
      const result = await new Promise(resolve => {
        const node = new AudioWorkletNode(context,'dcf77',{numberOfInputs:0,outputChannelCount:[2],processorOptions:{epochAtZero:Date.now(),startEpoch:0,endEpoch:Date.now()+400,volume:0.05,wave:'sine'}});
        const timer = setTimeout(() => resolve(false),3000);
        node.port.onmessage = e => {clearTimeout(timer);resolve(e.data.type==='complete');};
        node.onprocessorerror = () => {clearTimeout(timer);resolve(false);};
        node.connect(context.destination);
      });
      await context.close();
      return result;
    })()`);
    assert.equal(completed, true);
    await run("document.querySelector('[data-page=signal]').click()");
    await pause(200);
    assert.equal(await run("document.documentElement.scrollWidth <= window.innerWidth"), true);
    await capture('desktop-compact.png');
    ipcMain.removeHandler('clock:sync');
    ipcMain.handle('clock:sync', () => ({ok:false,error:'NTP unavailable (offline test)'}));
    window.webContents.reload();
    await new Promise(resolve => window.webContents.once('did-finish-load', resolve));
    await until("!document.getElementById('start-button').disabled");
    assert.match(await run("document.getElementById('source-label').textContent"), /System clock/);
    await run("document.querySelector('[data-page=history]').click()");
    await assertFits();
    await run("document.querySelector('[data-page=sync]').click()");
    assert.equal(await run("document.querySelectorAll('.history-row').length"), 2);
    await run("document.getElementById('start-button').click()");
    await until("document.getElementById('start-button').classList.contains('running')");
    assert.equal(await run("document.getElementById('wave-type').value"), 'sine');
    powerMonitor.emit('suspend');
    await until("!document.getElementById('start-button').disabled");
    assert.match(await run("document.querySelector('.history-status').textContent"), /Interrupted by/);
    await run("document.querySelector('[data-page=history]').click()");
    await assertFits();
    // Profiles, channel routing controls, immutable full trial history and migration.
    const change = async (id, value, type = 'change') => run(`(() => { const el=document.getElementById(${JSON.stringify(id)});el.value=${JSON.stringify(value)};el.dispatchEvent(new Event(${JSON.stringify(type)})); })()`);
    await run("document.querySelector('[data-page=sync]').click()");
    await change('audio-channel', 'left');
    await change('wave-type', 'sine-gated');
    await change('duration', '15');
    await change('volume', '34', 'input');
    await change('latency-offset', '-125');
    await run("document.querySelector('[data-page=profiles]').click(); document.getElementById('profile-new').click()");
    await change('profile-name', 'My GW-6900');
    await change('profile-model', 'GW-6900');
    await change('profile-city', 'rom');
    await change('profile-system-volume', '45');
    const placement = '12 o’clock side near the left speaker. '.repeat(6).slice(0,240);
    await change('profile-position', placement);
    await run("document.getElementById('profile-save').click()");
    assert.equal(await run("document.querySelector('.page.active').id"), 'page-profiles');
    const firstProfileId = await run("JSON.parse(localStorage.getItem('atomic.profiles'))[0].id");
    assert.equal(await run("JSON.parse(localStorage.getItem('atomic.profiles'))[0].settings.channel"), 'left');
    assert.equal(await run("JSON.parse(localStorage.getItem('atomic.profiles'))[0].homeCity"), 'ROM');
    await assertFits();
    await pause(200);
    await capture('desktop-profiles.png');
    await run("document.querySelector('[data-page=settings]').click(); document.getElementById('test-output').click()");
    await until("!document.getElementById('test-output').disabled");
    assert.match(await run("document.getElementById('toast').textContent"), /Left channel test/);
    await run("document.querySelector('[data-page=sync]').click(); document.getElementById('start-button').click()");
    await until("document.getElementById('start-button').classList.contains('running')");
    for (const id of ['profile-select','profile-edit-select','profile-save','profile-delete','profile-new','audio-channel']) {
      assert.equal(await run(`document.getElementById('${id}').disabled`), true, id);
    }
    await change('audio-channel', 'right');
    assert.equal(await run("document.getElementById('audio-channel').value"), 'left');
    await change('volume', '40', 'input');
    await run("document.getElementById('confirmed-button').click()");
    await until("!document.getElementById('start-button').disabled");
    assert.equal(await run("JSON.parse(localStorage.getItem('atomic.profiles'))[0].lastSuccess.settings.volume"), 40);
    const firstTrialId = await run("JSON.parse(localStorage.getItem('atomic.history'))[0].id");
    assert.deepEqual(await run("(() => {const t=JSON.parse(localStorage.getItem('atomic.history'))[0];return [t.snapshot.settings.channel,t.snapshot.settings.volume,t.endVolume,t.snapshot.watch.systemVolume,t.volumeChanges.length]})()"), ['left',34,40,'45',1]);
    await run("document.querySelector('[data-page=profiles]').click()");
    await change('profile-name', 'Renamed GW-6900');
    await run("document.getElementById('profile-save').click(); document.getElementById('profile-restore-success').click()");
    assert.equal(await run("document.getElementById('volume').value"), '40');
    await change('audio-channel', 'right');
    await change('duration', '5');
    await change('wave-type', 'sine');
    await run("document.querySelector('[data-page=profiles]').click();document.getElementById('profile-new').click()");
    await change('profile-name', 'Second watch');
    await change('profile-model', 'GW-M5610');
    await run("document.getElementById('profile-save').click()");
    const secondProfileId = await run("JSON.parse(localStorage.getItem('atomic.profiles'))[1].id");
    assert.equal(await run("JSON.parse(localStorage.getItem('atomic.profiles')).length"), 2);
    await run("document.querySelector('[data-page=sync]').click()");
    await change('profile-select', firstProfileId);
    assert.equal(await run("document.getElementById('audio-channel').value"), 'left');
    assert.equal(await run("document.getElementById('duration').value"), '15');
    await change('profile-select', secondProfileId);
    assert.equal(await run("document.getElementById('audio-channel').value"), 'right');
    assert.equal(await run("document.getElementById('duration').value"), '5');
    window.webContents.reload();
    await new Promise(resolve => window.webContents.once('did-finish-load', resolve));
    await until("!document.getElementById('start-button').disabled");
    assert.equal(await run("document.getElementById('profile-select').value"), secondProfileId);
    assert.equal(await run("document.getElementById('audio-channel').value"), 'right');
    await run("document.getElementById('start-button').click()");
    await until("document.getElementById('start-button').classList.contains('running')");
    await run("document.getElementById('start-button').click()");
    await until("!document.getElementById('start-button').disabled");
    await run("document.querySelector('[data-page=history]').click();document.querySelector('.history-row button').click()");
    await change('trial-outcome', 'err');
    await run("document.getElementById('trial-save-outcome').click()");
    assert.equal(await run("JSON.parse(localStorage.getItem('atomic.history'))[0].outcome"), 'err');
    await assertFits();
    await run("document.querySelector('[data-goto=history]').click();document.querySelectorAll('.history-row button')[1].click()");
    assert.match(await run("document.getElementById('trial-facts').textContent"), /My GW-6900/);
    assert.match(await run("document.getElementById('trial-facts').textContent"), /34% → 40%/);
    assert.equal(await run("JSON.parse(localStorage.getItem('atomic.history'))[1].id"), firstTrialId);
    await assertFits();
    assert.equal(await run("document.querySelector('.page.active').id"), 'page-trial');
    await pause(200);
    await capture('desktop-trial.png');
    await change('trial-outcome', 'unverified');
    await run("document.getElementById('trial-save-outcome').click()");
    assert.doesNotMatch(await run("document.querySelectorAll('.history-status')[1].textContent"), /confirmed/);
    await change('trial-outcome', 'err');
    await run("document.getElementById('trial-save-outcome').click()");
    assert.equal(await run("JSON.parse(localStorage.getItem('atomic.profiles'))[0].lastSuccess"), null);
    await change('trial-outcome', 'get');
    await run("document.getElementById('trial-save-outcome').click();document.getElementById('trial-restore').click()");
    assert.equal(await run("document.getElementById('profile-select').value"), firstProfileId);
    assert.equal(await run("document.getElementById('audio-channel').value"), 'left');
    assert.equal(await run("document.getElementById('volume').value"), '40');
    await run("document.querySelector('[data-page=profiles]').click(); document.getElementById('profile-delete').click()");
    assert.equal(await run("JSON.parse(localStorage.getItem('atomic.profiles')).length"), 1);
    assert.equal(await run("JSON.parse(localStorage.getItem('atomic.history'))[1].snapshot.watch.name"), 'My GW-6900');
    await run("document.querySelector('#toast button').click()");
    assert.equal(await run("JSON.parse(localStorage.getItem('atomic.profiles')).length"), 2);
    await run(`(() => {
      const items=JSON.parse(localStorage.getItem('atomic.history'));
      const fixtures=Array.from({length:22},(_,i)=>({...items[1],id:'page-fixture-'+i,at:items[1].at-i*60000}));
      fixtures.push({at:Date.now()-86400000,seconds:600,status:'complete',stationId:'dcf77'});
      localStorage.setItem('atomic.history',JSON.stringify([...items,...fixtures]));
    })()`);
    const fullCount = await run("JSON.parse(localStorage.getItem('atomic.history')).length");
    window.webContents.reload();
    await new Promise(resolve => window.webContents.once('did-finish-load', resolve));
    await until("!document.getElementById('start-button').disabled");
    assert.equal(await run("JSON.parse(localStorage.getItem('atomic.history')).length"), fullCount);
    await run("document.querySelector('[data-page=history]').click()");
    assert.equal(await run("document.querySelectorAll('.history-row').length"), 8);
    await assertFits();
    assert.equal(await run("document.querySelector('.page.active').id"), 'page-history');
    await pause(200);
    await capture('desktop-history.png');
    await run("document.getElementById('history-next').click()");
    assert.match(await run("document.getElementById('history-page').textContent"), /^2 /);
    await assertFits();
    for(let i=0;i<10;i++) await run("document.getElementById('history-next').click()");
    assert.equal(await run("document.getElementById('history-next').disabled"), true);
    await assertFits();
    await run("[...document.querySelectorAll('.history-row button')].at(-1).click()");
    assert.match(await run("document.getElementById('trial-position').textContent"), /before version/);
    assert.equal(await run("document.getElementById('trial-restore').disabled"), true);
    await assertFits();
    await run("document.querySelector('[data-page=sync]').click();document.getElementById('start-button').click()");
    await until("document.getElementById('start-button').classList.contains('running')");
    window.webContents.reload();
    await new Promise(resolve => window.webContents.once('did-finish-load', resolve));
    await until("!document.getElementById('start-button').disabled");
    assert.equal(await run("JSON.parse(localStorage.getItem('atomic.history')).length"), fullCount + 1);
    assert.match(await run("JSON.parse(localStorage.getItem('atomic.history'))[0].reason"), /Window closed/);
    await run(`(() => {
      const profiles=JSON.parse(localStorage.getItem('atomic.profiles'));
      profiles[0].settings.deviceId='unavailable-test-output';
      localStorage.setItem('atomic.profiles',JSON.stringify(profiles));
    })()`);
    window.webContents.reload();
    await new Promise(resolve => window.webContents.once('did-finish-load', resolve));
    await until("!document.getElementById('start-button').disabled");
    await change('profile-select', '');
    await change('profile-select', firstProfileId);
    assert.equal(await run("document.getElementById('audio-output').value"), 'default');
    assert.match(await run("document.getElementById('toast').textContent"), /Saved output unavailable/);
    assert.equal(await run("JSON.parse(localStorage.getItem('atomic.profiles'))[0].settings.deviceId"), 'unavailable-test-output');
    if (errors.length) throw new Error(errors.join('\n'));
    console.log('PASS: nine themes, text contrast >=4.5, theme persistence/fallback/isolation/live change, Electron, five station codecs, fixed 1100x740 window, all views without overflow, profiles CRUD and restore, channel routing, immutable paginated history, migration, NTP fallback, real worklet and interruptions. Audio muted.');
    app.exit(0);
  } catch (error) {
    console.error('DESKTOP TEST FAILED:', error.stack);
    console.error('Renderer errors:', errors);
    await capture('desktop-failure.png');
    console.error(await run("document.getElementById('toast').textContent"));
    app.exit(1);
  }
});
