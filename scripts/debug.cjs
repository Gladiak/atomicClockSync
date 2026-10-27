// Launch the normal app with opt-in Bluetooth logging to the console and a file.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const directory = path.join(root, 'artifacts', 'bluetooth-debug');
fs.mkdirSync(directory, { recursive: true });
const logPath = path.join(directory, new Date().toISOString().replace(/[:.]/g, '-') + '.log');
const log = fs.createWriteStream(logPath);
console.log(`Bluetooth debug log: ${logPath}`);
const child = spawn(require('electron'), ['.'], {
  cwd: root, env: { ...process.env, ATOMIC_BLUETOOTH_DEBUG: '1' }, stdio: ['inherit', 'pipe', 'pipe'],
});
for (const stream of [child.stdout, child.stderr]) stream.on('data', chunk => { process.stdout.write(chunk); log.write(chunk); });
child.on('error', error => { console.error(error); log.end(String(error)); process.exitCode = 1; });
child.on('close', code => { log.end(); process.exitCode = code ?? 1; });
