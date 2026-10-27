// Capture the README's real Electron views. This is documentation generation,
// not a test suite: an isolated profile contains only illustrative sample data.
const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const { pathToFileURL } = require('node:url');
const root = path.join(__dirname, '..');
const output = path.join(root, 'docs/images');
const previews = path.join(root, 'artifacts/readme');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-readme-capture-'));
app.setPath('userData', profile);
require('../electron/main.cjs');

// Keep the documented orbital snapshot within its actual validity window.
const epoch = Date.parse('2026-10-25T14:33:11Z');
const { validateOrbit } = require('../electron/iss-data.cjs');
const orbit = validateOrbit(require('../test/fixtures/iss-omm.json'));
ipcMain.removeHandler('clock:sync');
ipcMain.handle('clock:sync', () => ({ ok:true, nowMs:epoch, host:'Reference · sample', offsetMs:0, uncertaintyMs:6, synchronizedAt:epoch }));
ipcMain.removeHandler('iss:refresh');
ipcMain.handle('iss:refresh', () => ({ orbit, fix:null, connectivity:'online', lastSuccess:epoch, error:'' }));
ipcMain.removeHandler('bluetooth:scan');
ipcMain.handle('bluetooth:scan', () => ({ ok:true, devices:[{
  id:'11111111-1111-1111-1111-111111111111', name:'CASIO GA-B2100',
  model:'GA-B2100', module:'5689', instructions:'ga', verified:true,
}] }));
ipcMain.removeHandler('bluetooth:cancel');
ipcMain.handle('bluetooth:cancel', () => ({ ok:true }));

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
app.whenReady().then(async () => {
  const win = BrowserWindow.getAllWindows()[0];
  win.showInactive();
  win.webContents.setAudioMuted(true);
  win.webContents.session.webRequest.onBeforeRequest({ urls:['http://*/*','https://*/*'] }, (_request, callback) => callback({ cancel:true }));
  const run = code => win.webContents.executeJavaScript(code, true);
  async function until(code, timeout = 20000) {
    const end = Date.now() + timeout;
    while (Date.now() < end) { if (await run(code)) return; await pause(75); }
    throw Error('Screenshot content did not finish rendering: ' + code);
  }
  const click = id => run(`document.getElementById(${JSON.stringify(id)}).click()`);
  const change = (id, value, type = 'change') => run(`document.getElementById(${JSON.stringify(id)}).value=${JSON.stringify(value)};document.getElementById(${JSON.stringify(id)}).dispatchEvent(new Event(${JSON.stringify(type)}))`);
  async function sidebar(expanded = false) {
    await run('document.activeElement.blur()');
    win.webContents.sendInputEvent({ type:'mouseMove', x:1050, y:90 });
    await pause(200);
    if (await run('document.querySelector(".sidebar").dataset.expanded') !== String(expanded)) await click('sidebar-toggle');
    await pause(350);
  }
  async function navigate(page) {
    await sidebar(false);
    await run(`document.querySelector('[data-page=${page}]').click()`);
    await pause(450);
  }
  const captures = [];
  async function capture(name, expanded = false) {
    await run("document.getElementById('toast').hidden=true;document.activeElement.blur()");
    await sidebar(expanded);
    await pause(250);
    fs.writeFileSync(path.join(output, name + '.png'), (await win.webContents.capturePage()).toPNG());
    captures.push(name);
    console.log('Captured Rainbow README screenshot: ' + name);
  }

  try {
    fs.mkdirSync(output, { recursive:true });
    fs.mkdirSync(previews, { recursive:true });
    if (win.webContents.isLoading()) await new Promise(resolve => win.webContents.once('did-finish-load', resolve));
    await until("!document.getElementById('start-button').disabled");

    const day = 86400000;
    const settings = { stationId:'dcf77', volume:30, duration:10, wave:'sine', channel:'both', deviceId:'default', advanceMs:0 };
    const watch = { name:'Sample · Daily watch', model:'GW-6900', homeCity:'ROM', position:'Dial up · 3 cm from the speaker', systemVolume:'35' };
    const profiles = [{ id:'readme-watch', ...watch, settings, lastSuccess:null }];
    const history = ['get','get','err','get','err','get','unverified','get'].map((outcome, i) => {
      const snapshotSettings = { ...settings, volume:i === 4 || i === 5 ? 25 : 30, channel:i >= 6 ? 'left' : 'both' };
      return { id:'readme-trial-' + i, at:epoch - (i + 1) * day, endedAt:epoch - (i + 1) * day + 600000,
        seconds:600, status:'stopped', outcome, stationId:'dcf77',
        snapshot:{ profileId:'readme-watch', settings:snapshotSettings, watch, deviceLabel:'Default system output' },
        volumeChanges:[], endVolume:snapshotSettings.volume };
    });
    const entries = [0,2,5,9].map((n, i) => ({ id:'readme-reading-' + i, profileId:'readme-watch', watchName:watch.name,
      type:'measurement', at:epoch - (10 - n) * day, offsetSeconds:3 + n * .8 + (i === 2 ? .2 : 0),
      readingStep:1, method:'manual-offset', reference:{ kind:'manual' },
      conditions:{ wear:'resting', position:'Dial up', temperature:21 }, note:'' }));
    const storage = {
      'atomic.theme':'rainbow', 'atomic.language':'en', 'atomic.preferences':settings,
      'atomic.profiles':profiles, 'atomic.activeProfile':'readme-watch', 'atomic.history':history,
      'atomic.accuracy.v1':{ version:1, entries },
      'atomic.world':{ city:{ id:3169070, name:'Rome', country:'Italy', region:'Lazio', latitude:41.8919, longitude:12.5113, timeZone:'Europe/Rome' }, coverage:'all', twilight:true },
    };
    await run(`for(const [key,value] of Object.entries(${JSON.stringify(storage)}))localStorage.setItem(key,JSON.stringify(value))`);
    win.webContents.reload();
    await new Promise(resolve => win.webContents.once('did-finish-load', resolve));
    await until("!document.getElementById('start-button').disabled");
    await run('document.fonts.ready.then(()=>true)');

    await navigate('sync');
    await capture('synchronization');
    await sidebar(true);
    // Capture the actual expanded rail separately, so the main screenshot's
    // page title and controls remain readable at the app's fixed window size.
    fs.writeFileSync(path.join(output, 'sidebar-rainbow.png'), (await win.webContents.capturePage({ x:0, y:44, width:236, height:696 })).toPNG());
    await sidebar(false);
    await click('bluetooth-button');
    await until("document.getElementById('bluetooth-dialog').open&&!document.getElementById('bluetooth-update').disabled");
    await capture('bluetooth');
    await click('bluetooth-close');
    await until("!document.getElementById('bluetooth-button').disabled");

    await navigate('watch-accuracy');
    await change('wa-watch', 'readme-watch');
    await capture('watch-accuracy');
    await navigate('reception-lab');
    await change('rl-watch', 'readme-watch');
    await capture('reception-lab');

    await navigate('world');
    await until("document.getElementById('world-loading').hidden");
    await change('world-date', '2026-12-21');
    await change('world-time-slider', '1185', 'input');
    await capture('world-view');

    await navigate('iss');
    await until("document.getElementById('iss-speed').textContent!=='—'&&document.getElementById('iss-earth').querySelector('path')!==null");
    await until("document.getElementById('iss-next-time').textContent!=='Calculating…'");
    await capture('iss-tracking');
    await run("document.querySelector('[data-iss-tab=passes]').click()");
    await until("document.querySelector('.iss-pass-row')!==null");
    await capture('iss-passes');

    await navigate('light-travel');
    await until("document.getElementById('lt-delay').textContent!=='—'");
    await change('lt-speed', 'auto');
    await click('lt-play');
    await pause(1800);
    await click('lt-play');
    await capture('light-travel');
    await navigate('moon');
    await until("document.getElementById('moon-distance').textContent!=='—'");
    await capture('moon-observatory');
    await navigate('time-machine');
    await run("document.querySelector('[data-event=einstein-gravity]').click()");
    await capture('time-machine');
    await navigate('back-in-time');
    await capture('back-in-time');
    await navigate('settings');
    await capture('settings-rainbow');

    await navigate('guide');
    await run("document.querySelector('[data-chapter=bluetooth]').click()");
    await until("document.querySelector('.manual-figure img').complete");
    // Show the freshly captured Bluetooth view in this documentation preview;
    // leave the six-language offline manual's bundled image files untouched.
    const screenshot = fs.readFileSync(path.join(output, 'bluetooth.png')).toString('base64');
    await run(`document.querySelector('.manual-figure img').src=${JSON.stringify('data:image/png;base64,' + screenshot)};document.getElementById('manual-reader').scrollTop=0`);
    await until("document.querySelector('.manual-figure img').complete&&document.querySelector('.manual-figure img').naturalWidth>0");
    await capture('guide');

    const gallery = `<!doctype html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;padding:20px;background:#10110E;color:white;font:16px -apple-system,BlinkMacSystemFont,sans-serif}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}figure{margin:0}figcaption{margin:0 0 8px;color:#A8B4FF}img{display:block;width:100%;border:1px solid #34362F}</style></head><body><div class="grid">${captures.map(name => `<figure><figcaption>${name}</figcaption><img src="${pathToFileURL(path.join(output,name + '.png')).href}"></figure>`).join('')}</div></body></html>`;
    fs.writeFileSync(path.join(previews, 'gallery.html'), gallery);
    const sheet = new BrowserWindow({ width:1500, height:2000, useContentSize:true, show:false,
      webPreferences:{ offscreen:true, backgroundThrottling:false, nodeIntegration:false, contextIsolation:true } });
    await sheet.loadFile(path.join(previews, 'gallery.html'));
    await sheet.webContents.executeJavaScript('document.fonts.ready.then(()=>true)');
    const height = await sheet.webContents.executeJavaScript('document.body.scrollHeight');
    sheet.setContentSize(1500, height);
    await pause(250);
    fs.writeFileSync(path.join(previews, 'contact-sheet.png'), (await sheet.webContents.capturePage()).resize({ width:1500 }).toPNG());
    console.log(`Updated ${captures.length} README screenshots and an expanded-sidebar detail with Rainbow and Pulse Sync. No tests run.`);
    app.exit(0);
  } catch (error) { console.error(error.stack); app.exit(1); }
});
