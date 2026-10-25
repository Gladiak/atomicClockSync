const { app, BrowserWindow, ipcMain, Menu, powerSaveBlocker, powerMonitor, shell } = require('electron');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const { synchronize } = require('./ntp.cjs');

app.setName('Atomic Clock Sync');
let mainWindow;
let blocker = null;
let syncing = null;
const references = {
  ptb: 'https://www.ptb.de/cms/en/ptb/fachabteilungen/abt4/fb-44/ag-442/dissemination-of-legal-time/dcf77/dcf77-time-code.html',
  casio: 'https://support.casio.com/en/manual/manuallist.php?cid=009',
  inspiration: 'https://cw.rzapps.com/',
  geonames: 'https://www.geonames.org/',
  jjy: 'https://jjy.nict.go.jp/jjy/trans/index-e.html',
  wwvb: 'https://www.nist.gov/pml/time-and-frequency-division/time-distribution/radio-station-wwvb/wwvb-time-code-format',
  msf: 'https://www.npl.co.uk/getattachment/2afd4c3b-fc8d-486c-b2b9-fc9a5a66394c/msf-time-date-code-2019.pdf',
  bpc: 'https://patents.google.com/patent/CN109085615A/en',
};

function releasePower() {
  if (blocker !== null && powerSaveBlocker.isStarted(blocker)) powerSaveBlocker.stop(blocker);
  blocker = null;
}

function interrupt(reason) {
  releasePower();
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('signal:interrupt', reason);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100, height: 740, useContentSize: true,
    resizable: false, maximizable: false, fullscreenable: false,
    backgroundColor: '#10110E', title: 'Atomic Clock Sync',
    titleBarStyle: 'hiddenInset', trafficLightPosition: { x: 21, y: 15 },
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false },
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', event => event.preventDefault());
  mainWindow.webContents.session.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  mainWindow.loadFile(path.join(__dirname, '../src/index.html'));
  mainWindow.on('closed', () => { releasePower(); mainWindow = null; });
  mainWindow.webContents.on('render-process-gone', releasePower);
  mainWindow.webContents.on('did-start-loading', releasePower);
}

ipcMain.handle('clock:sync', async () => {
  if (blocker !== null) return { ok: false, error: 'Stop transmission before checking the time.' };
  if (!syncing) syncing = synchronize().finally(() => { syncing = null; });
  try {
    const result = await syncing;
    return { ok: true, ...result, nowMs: result.epochMs + result.offsetMs + performance.now() - result.monotonicMs };
  } catch (error) { return { ok: false, error: error.message }; }
});

ipcMain.handle('signal:active', (_event, active) => {
  releasePower();
  if (active) blocker = powerSaveBlocker.start('prevent-display-sleep');
  return true;
});
ipcMain.handle('reference:open', async (_event, key) => {
  if (Object.hasOwn(references, key)) await shell.openExternal(references[key]);
});

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (mainWindow) { mainWindow.restore(); mainWindow.focus(); } });
  app.whenReady().then(() => {
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      ...(process.platform === 'darwin' ? [{ label: app.name, submenu: [{ role: 'about', label: 'About Atomic Clock Sync' }, { type: 'separator' }, { role: 'hide', label: 'Hide Atomic Clock Sync' }, { role: 'hideOthers', label: 'Hide Others' }, { type: 'separator' }, { role: 'quit', label: 'Quit Atomic Clock Sync' }] }] : []),
      { label: 'Edit', submenu: [{ role: 'undo', label: 'Undo' }, { role: 'redo', label: 'Redo' }, { type: 'separator' }, { role: 'cut', label: 'Cut' }, { role: 'copy', label: 'Copy' }, { role: 'paste', label: 'Paste' }, { role: 'selectAll', label: 'Select All' }] },
      { label: 'Window', submenu: [{ role: 'minimize', label: 'Minimize' }] },
    ]));
    createWindow();
    powerMonitor.on('suspend', () => interrupt('Computer going to sleep. Restart transmission.'));
    powerMonitor.on('resume', () => interrupt('Computer resumed. Check the time again.'));
    powerMonitor.on('lock-screen', () => interrupt('Screen locked. Transmission stopped.'));
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
  app.on('before-quit', releasePower);
}
