const { app, BrowserWindow, ipcMain, Menu, powerSaveBlocker, powerMonitor, shell, clipboard } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { performance } = require('node:perf_hooks');
const { synchronize } = require('./ntp.cjs');
const { createIssDataService } = require('./iss-data.cjs');
const { createBluetoothService, helperCommand } = require('./bluetooth.cjs');

app.setName('Atomic Clock Sync');
// Keep the existing profile path (or a caller's temporary test profile) when
// changing the display name. Chromium storage must stay in the same directory.
const userDataPath = app.getPath('userData');
fs.mkdirSync(userDataPath, { recursive: true });
app.setName('AtomicClockSync');
app.setPath('userData', userDataPath);
let mainWindow;
let blocker = null;
let syncing = null;
let issData;
const bluetooth = createBluetoothService({
  version: app.getVersion(),
  command: () => helperCommand({ packaged: app.isPackaged, resourcesPath: process.resourcesPath, root: path.join(__dirname, '..') }),
  synchronize,
  onEvent: value => { if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('bluetooth:event', value); },
});
const menuLabels = {
  en: ['About', 'Hide', 'Hide Others', 'Quit', 'Edit', 'Undo', 'Redo', 'Cut', 'Copy', 'Paste', 'Select All', 'Window', 'Minimize'],
  it: ['Informazioni su', 'Nascondi', 'Nascondi altre', 'Esci da', 'Modifica', 'Annulla', 'Ripeti', 'Taglia', 'Copia', 'Incolla', 'Seleziona tutto', 'Finestra', 'Riduci a icona'],
  fr: ['À propos de', 'Masquer', 'Masquer les autres', 'Quitter', 'Édition', 'Annuler', 'Rétablir', 'Couper', 'Copier', 'Coller', 'Tout sélectionner', 'Fenêtre', 'Réduire'],
  de: ['Über', 'Ausblenden', 'Andere ausblenden', 'Beenden:', 'Bearbeiten', 'Rückgängig', 'Wiederholen', 'Ausschneiden', 'Kopieren', 'Einfügen', 'Alles auswählen', 'Fenster', 'Minimieren'],
  es: ['Acerca de', 'Ocultar', 'Ocultar otros', 'Salir de', 'Editar', 'Deshacer', 'Rehacer', 'Cortar', 'Copiar', 'Pegar', 'Seleccionar todo', 'Ventana', 'Minimizar'],
  ja: ['情報：', '隠す：', 'ほかを隠す', '終了：', '編集', '取り消す', 'やり直す', '切り取り', 'コピー', '貼り付け', 'すべて選択', 'ウィンドウ', '最小化'],
};
function applyMenu(language = 'en') {
  const text = menuLabels[language];
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(process.platform === 'darwin' ? [{ label: app.name, submenu: [{ role: 'about', label: `${text[0]} ${app.name}` }, { type: 'separator' }, { role: 'hide', label: `${text[1]} ${app.name}` }, { role: 'hideOthers', label: text[2] }, { type: 'separator' }, { role: 'quit', label: `${text[3]} ${app.name}` }] }] : []),
    { label: text[4], submenu: ['undo','redo',null,'cut','copy','paste','selectAll'].map((role,index) => role ? { role, label: text[index < 2 ? index + 5 : index + 4] } : { type: 'separator' }) },
    { label: text[11], submenu: [{ role: 'minimize', label: text[12] }] },
  ]));
}
const historicalSources = require('../assets/time-machine/sources.json');
const references = {
  ...Object.fromEntries(Object.entries(historicalSources).map(([key, source]) => [key, source.url])),
  moonScience: 'https://science.nasa.gov/moon/moon-phases/',
  lightScience: 'https://science.nasa.gov/mission/webb/science-overview/science-explainers/how-does-webb-see-back-in-time/',
  lightJpl: 'https://ssd.jpl.nasa.gov/horizons/manual.html',
  bttf: 'https://www.backtothefuture.com/movies/faq',
  ptb: 'https://www.ptb.de/cms/en/ptb/fachabteilungen/abt4/fb-44/ag-442/dissemination-of-legal-time/dcf77/dcf77-time-code.html',
  casio: 'https://support.casio.com/en/manual/manuallist.php?cid=009',
  inspiration: 'https://cw.rzapps.com/',
  geonames: 'https://www.geonames.org/',
  iss: 'https://www.nasa.gov/international-space-station/',
  issCrew: 'https://www.nasa.gov/international-space-station/space-station-overview/',
  issVideo: 'https://www.asc-csa.gc.ca/eng/iss/watch-live.asp',
  aces: 'https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/ACES_Atomic_Clock_Ensemble_in_Space',
  issSources: 'https://wheretheiss.at/w/developer',
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
  bluetooth.cancel();
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('signal:interrupt', reason);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100, height: 740, useContentSize: true,
    resizable: false, maximizable: false, fullscreenable: false,
    backgroundColor: '#10110E', title: 'AtomicClockSync',
    titleBarStyle: 'hiddenInset', trafficLightPosition: { x: 21, y: 15 },
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false },
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', event => event.preventDefault());
  mainWindow.webContents.session.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  if (process.env.ATOMIC_BLUETOOTH_DEBUG === '1') {
    mainWindow.webContents.once('did-finish-load', () => console.error('[Bluetooth] Debug app ready'));
    mainWindow.webContents.on('console-message', details => { if (details.level === 'error') console.error('[Renderer]', details.message); });
  }
  mainWindow.loadFile(path.join(__dirname, '../src/index.html'));
  mainWindow.on('closed', () => { releasePower(); bluetooth.cancel(); mainWindow = null; });
  mainWindow.webContents.on('render-process-gone', () => { releasePower(); bluetooth.cancel(); });
  mainWindow.webContents.on('did-start-loading', () => { releasePower(); bluetooth.cancel(); });
}

ipcMain.handle('clock:sync', async () => {
  if (blocker !== null) return { ok: false, error: 'Stop transmission before checking the time.' };
  if (bluetooth.active) return { ok: false, error: 'Wait for Bluetooth to finish.' };
  if (!syncing) syncing = synchronize().finally(() => { syncing = null; });
  try {
    const result = await syncing;
    return { ok: true, ...result, nowMs: result.epochMs + result.offsetMs + performance.now() - result.monotonicMs };
  } catch (error) { return { ok: false, error: error.message }; }
});

ipcMain.handle('signal:active', (_event, active) => {
  if (active && bluetooth.active) return false;
  releasePower();
  if (active) blocker = powerSaveBlocker.start('prevent-display-sleep');
  return true;
});
function bluetoothClient(event) {
  return event.sender === mainWindow?.webContents && event.senderFrame === mainWindow.webContents.mainFrame;
}
ipcMain.handle('bluetooth:scan', event => {
  if (!bluetoothClient(event)) return { ok: false, code: 'client' };
  if (blocker !== null || syncing) return { ok: false, code: 'busy' };
  return bluetooth.scan();
});
ipcMain.handle('bluetooth:sync', (event, deviceId, offsetMinutes) => {
  if (!bluetoothClient(event)) return { ok: false, code: 'client' };
  if (blocker !== null || syncing) return { ok: false, code: 'busy' };
  return bluetooth.sync(deviceId, offsetMinutes);
});
ipcMain.handle('bluetooth:cancel', event => bluetoothClient(event) ? bluetooth.cancel() : { ok: false, code: 'client' });
ipcMain.handle('bluetooth:diagnostics', event => bluetoothClient(event) ? { ok: true, text: bluetooth.diagnostics() } : { ok: false, code: 'client' });
ipcMain.handle('bluetooth:copy-diagnostics', event => {
  if (!bluetoothClient(event)) return { ok: false, code: 'client' };
  const text = bluetooth.diagnostics();
  try { clipboard.writeText(text); return { ok: true, text }; }
  catch { return { ok: false, code: 'clipboard' }; }
});
ipcMain.handle('iss:refresh', async event => {
  if(event.sender!==mainWindow?.webContents)throw Error('Unknown ISS client');
  issData ||= createIssDataService({storagePath:path.join(app.getPath('userData'),'iss-cache.json')});
  return issData.refresh();
});
ipcMain.handle('reference:open', async (_event, key) => {
  if (Object.hasOwn(references, key)) await shell.openExternal(references[key]);
});
ipcMain.handle('app:language', (event, language) => {
  if (event.sender !== mainWindow?.webContents || !Object.hasOwn(menuLabels, language)) return false;
  applyMenu(language);
  return true;
});

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (mainWindow) { mainWindow.restore(); mainWindow.focus(); } });
  app.whenReady().then(() => {
    applyMenu();
    createWindow();
    powerMonitor.on('suspend', () => interrupt('Computer going to sleep. Restart transmission.'));
    powerMonitor.on('resume', () => interrupt('Computer resumed. Check the time again.'));
    powerMonitor.on('lock-screen', () => interrupt('Screen locked. Transmission stopped.'));
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
  app.on('before-quit', () => { releasePower(); bluetooth.cancel(); });
}
