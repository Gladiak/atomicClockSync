// Render the selected Pulse Sync mark with the same geometry as the sidebar.
// Run with Node (npm run build:icon); the project's Electron supplies Chromium.
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const iconSource = path.join(root, 'assets/icon.svg');
const iconOutput = path.join(root, 'assets/icon.png');

if (!process.versions.electron) {
  const { spawnSync } = require('node:child_process');
  const mark = fs.readFileSync(path.join(root, 'assets/brand-mark.svg'), 'utf8')
    .replace('<svg ', '<svg x="208" y="208" color="#D5FF40" ')
    .replace('width="64"', 'width="608"').replace('height="64"', 'height="608"');
  fs.writeFileSync(iconSource, `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" role="img" aria-label="AtomicClockSync — Pulse Sync">
  <defs>
    <radialGradient id="surface" cx="40%" cy="25%" r="85%"><stop stop-color="#23261D"/><stop offset="1" stop-color="#10110E"/></radialGradient>
    <linearGradient id="edge" x2=".8" y2="1"><stop stop-color="#4B5140"/><stop offset="1" stop-color="#25291F"/></linearGradient>
  </defs>
  <rect x="36" y="36" width="952" height="952" rx="214" fill="url(#surface)"/>
  <rect x="38" y="38" width="948" height="948" rx="212" fill="none" stroke="url(#edge)" stroke-width="3"/>
  ${mark.trim()}
</svg>
`);
  const environment = { ...process.env };
  delete environment.ELECTRON_RUN_AS_NODE;
  const result = spawnSync(require('electron'), [__filename], { stdio:'inherit', env:environment });
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}

const { app, BrowserWindow } = require('electron');
const os = require('node:os');
app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-icon-render-')));
app.commandLine.appendSwitch('force-device-scale-factor', '1');
app.disableHardwareAcceleration();
app.whenReady().then(async () => {
  try {
    const window = new BrowserWindow({
      width:1024, height:1024, useContentSize:true, show:false,
      transparent:true, backgroundColor:'#00000000',
      webPreferences:{ offscreen:true, backgroundThrottling:false, nodeIntegration:false, contextIsolation:true },
    });
    await window.loadFile(iconSource);
    await new Promise(resolve => setTimeout(resolve, 200));
    const image = await window.webContents.capturePage();
    if (image.isEmpty()) throw Error('The Pulse Sync icon did not render.');
    fs.writeFileSync(iconOutput, image.resize({ width:1024, height:1024, quality:'best' }).toPNG());
    console.log('Created assets/icon.svg and assets/icon.png (1024 × 1024, transparent corners).');
    app.exit(0);
  } catch (error) { console.error(error); app.exit(1); }
});
