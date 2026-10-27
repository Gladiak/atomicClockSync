const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
module.exports = async context => {
  const arch = require('builder-util').Arch[context.arch];
  const directory = path.join(context.packager.projectDir, 'build', 'bluetooth', `${context.electronPlatformName}-${arch}`, 'atomic-bluetooth');
  const executable = path.join(directory, context.electronPlatformName === 'win32' ? 'atomic-bluetooth.exe' : 'atomic-bluetooth');
  if (!fs.existsSync(executable)) throw Error(`Missing native Bluetooth worker for ${context.electronPlatformName}-${arch}. Run npm run build:bluetooth on that OS/architecture first. See docs/BLUETOOTH.md.`);
  // An old worker must never be silently shipped after the protocol changes.
  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(path.join(directory, 'build-info.json'), 'utf8')); } catch { throw Error('Missing Bluetooth build manifest. Run npm run build:bluetooth.'); }
  if (manifest.platform !== context.electronPlatformName || manifest.arch !== arch) throw Error('Bluetooth worker does not match the package OS/architecture.');
  const sources = [...fs.readdirSync(path.join(context.packager.projectDir, 'bluetooth')).filter(file => file.endsWith('.py')), 'requirements.txt'].sort();
  if (JSON.stringify(Object.keys(manifest.sources || {}).sort()) !== JSON.stringify(sources)) throw Error('Bluetooth worker source list is outdated. Run npm run build:bluetooth again.');
  for (const file of sources) {
    const hash = createHash('sha256').update(fs.readFileSync(path.join(context.packager.projectDir, 'bluetooth', file))).digest('hex');
    if (hash !== manifest.sources?.[file]) throw Error('Bluetooth worker is outdated. Run npm run build:bluetooth again.');
  }
};
