const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-navigation-test-'));
app.setPath('userData', profile);
require('../electron/main.cjs');
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
  async function motion(value) {
    await win.webContents.debugger.sendCommand('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value }] });
    await until(`matchMedia('(prefers-reduced-motion: reduce)').matches === ${value === 'reduce'}`);
  }
  try {
    if (win.webContents.isLoading()) await new Promise(resolve => win.webContents.once('did-finish-load', resolve));
    win.showInactive();
    await until("!document.hidden && !document.getElementById('start-button').disabled");
    assert.equal(app.name, 'AtomicClockSync');
    assert.equal(app.getPath('userData'), profile, 'Rename must preserve an explicitly supplied profile');
    assert.equal(win.getTitle(), 'AtomicClockSync');
    assert.equal(await run("getComputedStyle(document.querySelector('.titlebar > span')).fontSize"), '13px');
    if (process.platform === 'darwin') assert.equal(Menu.getApplicationMenu().items[0].label, 'AtomicClockSync');
    win.webContents.debugger.attach('1.3');
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
    await until("!document.querySelector('.page.active').getAnimations().length && !document.querySelector('.nav-indicator').getAnimations().length");
    assert.equal(await run("Math.abs(document.querySelector('.nav-indicator').getBoundingClientRect().top - document.querySelector('.sidebar .selected').getBoundingClientRect().top) < 0.5"), true);
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
    await pause(250);
    fs.mkdirSync('artifacts', { recursive: true });
    fs.writeFileSync('artifacts/navigation-moon.png', (await win.webContents.capturePage()).toPNG());
    assert.equal(await run("document.getElementById('status-badge').textContent"), 'TRANSMITTING');
    await until(`document.getElementById('clock').textContent !== ${JSON.stringify(clock)}`);
    assert.deepEqual(errors, []);
    console.log('PASS: AtomicClockSync identity and profile, real visible transitions, rapid navigation, immediate focus, aligned sidebar indicator, reduced-motion changes and continuous muted AudioWorklet transmission.');
    app.exit(0);
  } catch (error) {
    console.error(error.stack, errors);
    app.exit(1);
  }
});
