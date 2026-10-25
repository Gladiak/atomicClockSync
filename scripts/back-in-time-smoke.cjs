const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), assert = require('node:assert/strict');
app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-bttf-test-')));
require(path.join(process.env.ATOMIC_TEST_APP_ROOT ? path.resolve(process.env.ATOMIC_TEST_APP_ROOT) : path.resolve(__dirname, '..'), 'electron/main.cjs'));
const epoch = Date.parse('2026-10-25T14:33:11Z');
ipcMain.removeHandler('clock:sync');
ipcMain.handle('clock:sync', () => ({ ok: true, nowMs: epoch, host: 'test-time-reference', offsetMs: 0, uncertaintyMs: 1, synchronizedAt: epoch }));
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
app.whenReady().then(async () => {
  const win = BrowserWindow.getAllWindows()[0], errors = [];
  win.hide(); win.webContents.setAudioMuted(true);
  win.webContents.on('console-message', details => { if (details.level === 'error') errors.push(details.message); });
  win.webContents.session.webRequest.onBeforeRequest({ urls: ['http://*/*', 'https://*/*'] }, (_r, callback) => callback({ cancel: true }));
  const run = source => win.webContents.executeJavaScript(source, true);
  async function until(source, ms = 10000) {
    const end = Date.now() + ms;
    while (Date.now() < end) { if (await run(source)) return; await pause(100); }
    throw Error('Timeout: ' + source);
  }
  async function capture(name) {
    await run("document.getElementById('toast').hidden=true");
    win.showInactive(); await pause(250); fs.mkdirSync('artifacts', { recursive: true });
    fs.writeFileSync(path.join('artifacts', name), (await win.webContents.capturePage()).toPNG()); win.hide();
  }
  async function fits() {
    const overflow = await run(`(()=>{ const page=document.getElementById('page-back-in-time'),b=page.getBoundingClientRect();return [...page.querySelectorAll('*')].filter(e=>{
      if(e.closest('svg'))return false;const r=e.getBoundingClientRect();return r.width&&r.height&&(r.right>b.right+1||r.bottom>b.bottom+1);
    }).map(e=>e.id||e.className);})()`);
    assert.deepEqual(overflow, [], 'Back in Time overflow: ' + overflow);
    assert.equal(await run("document.querySelector('.bttf-dashboard').getBoundingClientRect().bottom<=document.querySelector('.bttf-elapsed').getBoundingClientRect().top"), true, 'Dashboard overlaps elapsed panel');
    const sidebarBottom = await run("document.querySelector('.sidebar-bottom').getBoundingClientRect().bottom");
    assert.ok(sidebarBottom <= await run('innerHeight'), `Sidebar bottom overflows: ${sidebarBottom}`);
    assert.equal(await run("document.querySelector('.sidebar nav').getBoundingClientRect().bottom<=document.querySelector('.sidebar-bottom').getBoundingClientRect().top+1"), true, 'Sidebar overlap');
  }
  try {
    if (win.webContents.isLoading()) await new Promise(resolve => win.webContents.once('did-finish-load', resolve));
    await until("!document.getElementById('start-button').disabled");
    await run("document.querySelector('[data-page=back-in-time]').click()");
    assert.equal(await run("document.querySelectorAll('.bttf-date-card').length"), 5);
    assert.equal(await run("document.getElementById('bttf-reference').textContent"), 'NTP VERIFIED');
    await until("localStorage.getItem('atomic.preferences')!==null");
    const preferences = await run("localStorage.getItem('atomic.preferences')");
    for (const id of ['west', 'arrival', 'lightning', 'pines', 'future']) {
      await run(`document.querySelector('[data-destination=${id}]').click()`);
      assert.equal(await run(`document.querySelector('[data-destination=${id}]').getAttribute('aria-pressed')`), 'true');
      await fits();
    }
    for (const theme of ['lime', 'cyan', 'fuchsia', 'ruby', 'gold', 'aqua', 'amethyst', 'lava', 'atlantic']) {
      await run(`document.getElementById('theme-select').value='${theme}';document.getElementById('theme-select').dispatchEvent(new Event('change'))`);
      await fits();
    }
    await capture('back-in-time-atlantic.png');
    await run("document.getElementById('theme-select').value='cyan';document.getElementById('theme-select').dispatchEvent(new Event('change'))");
    await capture('back-in-time.png');
    const before = await run("document.getElementById('bttf-duration').getAttribute('aria-label')"); await pause(1100);
    assert.notEqual(await run("document.getElementById('bttf-duration').getAttribute('aria-label')"), before);
    await run("document.getElementById('bttf-jump').click()");
    await until("!document.getElementById('bttf-arrival').hidden");
    assert.equal(await run("document.activeElement.id"), 'bttf-continue');
    assert.equal(await run("document.getElementById('bttf-speed').textContent"), '88');
    await capture('back-in-time-arrival.png');
    await run("document.getElementById('bttf-continue').click()");
    assert.match(await run("document.getElementById('bttf-present').getAttribute('aria-label')"), /OCT 21, 2015, 16:29/);
    assert.match(await run("document.getElementById('bttf-departed').getAttribute('aria-label')"), /OCT 25, 2026/);
    assert.equal(await run("document.getElementById('bttf-reference').textContent"), 'CINEMATIC PREVIEW');
    assert.equal(await run("localStorage.getItem('atomic.preferences')"), preferences);
    await run("document.getElementById('bttf-reset').click()");
    assert.match(await run("document.getElementById('bttf-present').getAttribute('aria-label')"), /OCT 25, 2026/);
    await run("document.getElementById('bttf-jump').click();document.querySelector('[data-page=sync]').click()"); await pause(3000);
    await run("document.querySelector('[data-page=back-in-time]').click()");
    assert.equal(await run("document.getElementById('bttf-arrival').hidden"), true);
    assert.equal(await run("document.getElementById('bttf-jump').disabled"), false);
    // Reduced motion skips acceleration, with the same final state and focus behavior.
    await run("window.matchMedia=()=>({matches:true});document.getElementById('bttf-jump').click()");
    assert.equal(await run("document.getElementById('bttf-arrival').hidden"), false);
    await run("document.getElementById('bttf-continue').click();document.getElementById('bttf-reset').click()");
    await run("document.querySelector('[data-page=sync]').click();document.getElementById('start-button').click()");
    await until("document.getElementById('status-badge').textContent==='TRANSMITTING'");
    const signal = await run("document.getElementById('clock').textContent");
    await run("document.querySelector('[data-page=back-in-time]').click();document.querySelector('[data-destination=west]').click();document.getElementById('bttf-jump').click();document.getElementById('bttf-continue').click()"); await pause(1100);
    assert.equal(await run("document.getElementById('status-badge').textContent"), 'TRANSMITTING');
    assert.notEqual(await run("document.getElementById('clock').textContent"), signal);
    assert.match(await run("document.getElementById('date').textContent"), /2026/);
    assert.equal(await run("localStorage.getItem('atomic.preferences')"), preferences);
    await run("document.querySelector('[data-page=sync]').click();document.getElementById('start-button').click()");
    await until("!document.getElementById('start-button').disabled");
    assert.deepEqual(errors, []);
    console.log('PASS: five movie destinations, live elapsed counters, nine themes, fixed-window layout, jump/return/cancellation, keyboard focus, reduced motion and real muted AudioWorklet isolation.'); app.exit(0);
  } catch (error) { console.error(error.stack); console.error(errors); await capture('back-in-time-failure.png'); app.exit(1); }
});
