// Build on the target OS/architecture. PyInstaller does not cross-compile.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const python = path.join(root, '.venv-bluetooth', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python3');
if (!fs.existsSync(python)) throw Error('Create .venv-bluetooth and install bluetooth/requirements.txt first. See docs/BLUETOOTH.md.');
const result = spawnSync(python, [path.join(__dirname, 'build-bluetooth.py'), process.platform, process.arch], {
  cwd: root, stdio: 'inherit', shell: false, env: { ...process.env, PYINSTALLER_CONFIG_DIR: path.join(root, 'build/bluetooth/cache') },
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
