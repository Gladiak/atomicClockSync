// Real Electron/DOM/preload; only Bluetooth hardware and NTP are substituted.
const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-bluetooth-test-')));
require('../electron/main.cjs');
let finishScan, finishSync, scanError = null, cancelCount = 0;
let device = { id: '11111111-1111-1111-1111-111111111111', name: 'CASIO GA-B2100', model: 'GA-B2100', module: '5689', instructions: 'ga', verified: true };
let expectedOffset;
const reference = () => ({ ok: true, nowMs: Date.now(), host: 'fixture.invalid', offsetMs: 0, uncertaintyMs: 15, synchronizedAt: Date.now() });
for (const channel of ['clock:sync', 'iss:refresh', 'bluetooth:scan', 'bluetooth:sync', 'bluetooth:cancel']) ipcMain.removeHandler(channel);
ipcMain.handle('clock:sync', reference);
ipcMain.handle('iss:refresh', () => ({ connectivity: 'unreachable' }));
ipcMain.handle('bluetooth:scan', () => scanError ? { ok: false, code: scanError } : new Promise(resolve => { finishScan = resolve; }));
ipcMain.handle('bluetooth:sync', (_event, id, offset) => {
  assert.equal(id, device.id);
  assert.equal(offset, expectedOffset);
  return new Promise(resolve => { finishSync = resolve; });
});
ipcMain.handle('bluetooth:cancel', () => { cancelCount++; finishScan?.({ ok: false, code: 'cancelled' }); return { ok: true }; });
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const errors = [];

app.whenReady().then(async () => {
  const window = BrowserWindow.getAllWindows()[0]; window.hide(); window.webContents.setAudioMuted(true);
  window.webContents.on('console-message', details => { if (details.level === 'error') errors.push(details.message); });
  const run = script => window.webContents.executeJavaScript(script, true);
  async function until(script, timeout = 8000) {
    const end = Date.now() + timeout;
    while (Date.now() < end) { if (await run(script)) return; await pause(30); }
    throw Error(`Timeout: ${script}`);
  }
  async function open() {
    finishScan = null;
    await run("document.getElementById('bluetooth-button').click()");
    await until("document.getElementById('bluetooth-dialog').open");
    for (let i = 0; !finishScan && i < 100; i++) await pause(10);
    assert.ok(finishScan);
  }
  async function selectWatch() {
    window.webContents.send('bluetooth:event', { type: 'device', device });
    await until("document.querySelector('[name=bluetooth-device]') !== null");
    assert.equal(await run("document.querySelector('[name=bluetooth-device]').disabled"), false);
    await run("document.querySelector('[name=bluetooth-device]').click()");
    assert.equal(await run("document.querySelector('[name=bluetooth-device]').checked"), true);
    finishScan({ ok: true, devices: [device] });
    await until("!document.getElementById('bluetooth-update').disabled");
  }
  async function capture(name) {
    window.showInactive(); await pause(120);
    fs.mkdirSync(path.join(__dirname, '../artifacts'), { recursive: true });
    fs.writeFileSync(path.join(__dirname, '../artifacts', name), (await window.webContents.capturePage()).toPNG());
    window.hide();
  }
  try {
    if (window.webContents.isLoading()) await new Promise(resolve => window.webContents.once('did-finish-load', resolve));
    await until("document.getElementById('hours').textContent !== '--' && !document.getElementById('start-button').disabled");
    const originalHistory = await run("localStorage.getItem('atomic.history')");
    await capture('bluetooth-button.png');
    await open();
    assert.equal(await run("document.getElementById('start-button').disabled && document.getElementById('sync-button').disabled"), true);
    await selectWatch();
    await capture('bluetooth-dialog.png');
    await run("document.getElementById('bluetooth-update').click()");
    await until("document.getElementById('bluetooth-close').textContent === 'Cancel'");
    window.webContents.send('bluetooth:event', { type: 'stage', stage: 'reading' });
    finishSync({ ok: true, sent: true, reference: reference() });
    await until("document.getElementById('bluetooth-status').textContent.startsWith('Time sent.')");
    assert.equal(await run("document.getElementById('bluetooth-update').disabled"), true);
    assert.equal(await run("localStorage.getItem('atomic.history')"), originalHistory);
    await run("document.getElementById('bluetooth-close').click()");
    await until("!document.getElementById('bluetooth-dialog').open && !document.getElementById('bluetooth-button').disabled");

    // Closing during an in-flight write must not turn late success into a
    // second operation or silently dismiss an ambiguous outcome.
    await open(); await selectWatch();
    await run("document.getElementById('bluetooth-update').click()");
    await pause(50);
    await run("document.getElementById('bluetooth-dialog').dispatchEvent(new Event('cancel',{cancelable:true}))");
    await until("!document.getElementById('bluetooth-dialog').open");
    finishSync({ ok: false, code: 'uncertain' });
    await until("document.getElementById('toast').textContent.includes('before retrying')");
    assert.ok(cancelCount >= 2);
    await run("document.getElementById('toast').hidden=true");

    // Mudmaster instructions and an explicit offset retry stay in the same
    // compact dialog. No timezone is silently preselected from the computer.
    device = { ...device, name: 'CASIO GWG-B1000', model: 'GWG-B1000', module: '5713', instructions: 'gwg', verified: false };
    await open(); await selectWatch();
    assert.match(await run("document.getElementById('bluetooth-intro').textContent"), /hold B.*five seconds/);
    assert.match(await run("document.getElementById('bluetooth-profile').textContent"), /5713.*awaiting/);
    await run("document.getElementById('bluetooth-update').click()");
    await pause(50); finishSync({ ok: false, code: 'offset' });
    await until("!document.getElementById('bluetooth-offset-field').hidden");
    assert.equal(await run("document.getElementById('bluetooth-update').disabled"), true);
    assert.equal(await run("document.getElementById('bluetooth-offset').value"), '');
    expectedOffset = 345;
    await run("document.getElementById('bluetooth-offset').value='345';document.getElementById('bluetooth-offset').dispatchEvent(new Event('change'));document.getElementById('bluetooth-update').click()");
    await pause(50); finishSync({ ok: true, sent: true, reference: reference() });
    await until("document.getElementById('bluetooth-status').textContent.startsWith('Time sent.')");
    await run("document.getElementById('bluetooth-close').click()");
    await until("!document.getElementById('bluetooth-button').disabled");
    expectedOffset = undefined;

    device = { ...device, name: 'CASIO GST-B1000D', model: 'GST-B1000', module: '5748', instructions: 'gst', verified: false };
    await open(); await selectWatch();
    assert.match(await run("document.getElementById('bluetooth-intro').textContent"), /hold B.*2\.5 seconds.*hold C.*0\.5 seconds/);
    assert.match(await run("document.getElementById('bluetooth-profile').textContent"), /5748.*awaiting/);
    await run("document.getElementById('bluetooth-close').click()");
    await until("!document.getElementById('bluetooth-button').disabled");

    for (const language of ['en', 'it', 'fr', 'de', 'es', 'ja']) {
      await run(`document.getElementById('language-select').value='${language}';document.getElementById('language-select').dispatchEvent(new Event('change'))`);
      for (const theme of ['lime', 'atlantic']) {
        await run(`document.getElementById('theme-select').value='${theme}';document.getElementById('theme-select').dispatchEvent(new Event('change'))`);
        await open(); await selectWatch();
        assert.equal(await run("document.getElementById('bluetooth-offset-field').hidden"), true);
        await run("document.getElementById('bluetooth-update').click()");
        await pause(50); finishSync({ ok: false, code: 'offset' });
        await until("!document.getElementById('bluetooth-offset-field').hidden");
        assert.equal(await run(`(() => {const r=document.getElementById('bluetooth-dialog').getBoundingClientRect();return r.left>=0 && r.top>=0 && r.right<=innerWidth && r.bottom<=innerHeight;})()`), true);
        assert.equal(await run("document.querySelector('#bluetooth-dialog img') === null"), true);
        if (language !== 'en') assert.notEqual(await run("document.getElementById('bluetooth-title').textContent"), 'Update time via Bluetooth');
        if (language !== 'en') assert.equal(await run("document.getElementById('bluetooth-intro').textContent.includes('On your GST-B1000')"), false);
        if (language === 'it' && theme === 'lime') await capture('bluetooth-dialog-it.png');
        await run("document.getElementById('bluetooth-close').click()");
        await until("!document.getElementById('bluetooth-button').disabled");
      }
    }
    scanError = 'unavailable';
    await run("document.getElementById('bluetooth-button').click()");
    await until("document.getElementById('bluetooth-status').classList.contains('bt-error')");
    assert.equal(await run("document.getElementById('bluetooth-update').disabled"), true);
    await run("document.getElementById('bluetooth-close').click()");
    await until("!document.getElementById('start-button').disabled");
    await run("document.getElementById('start-button').click()");
    await until("document.getElementById('start-button').classList.contains('running')");
    assert.equal(await run("document.getElementById('bluetooth-button').disabled"), true);
    await run("document.getElementById('bluetooth-button').click()");
    assert.equal(await run("document.getElementById('bluetooth-dialog').open"), false);
    await run("document.getElementById('start-button').click()");
    await until("!document.getElementById('start-button').disabled");
    assert.deepEqual(errors, []);
    console.log('PASS: Bluetooth button/dialog, Mudmaster and GST-B1000 model instructions, explicit-offset retry, preload, selection, NTP reference, exclusive controls, cancellation/late replies, unavailable backend, six languages and light/dark layouts. Hardware substituted; no Bluetooth adapter accessed.');
    app.exit(0);
  } catch (error) { console.error(error); app.exit(1); }
});
