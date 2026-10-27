// Verify the actual unpacked package before uploading its distribution archives.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const asar = require('@electron/asar');
const [target, arch] = process.argv.slice(2);
const resources = target === 'mac'
  ? path.join('release', `mac-${arch}`, 'AtomicClockSync.app', 'Contents', 'Resources')
  : path.join('release', target === 'win' ? 'win-unpacked' : 'linux-unpacked', 'resources');
const archive = path.join(resources, 'app.asar');
let count = 0;
function verify(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) verify(file);
    else if (item.isFile()) {
      assert.deepEqual(asar.extractFile(archive, file), fs.readFileSync(file), file);
      count++;
    }
  }
}
['electron', 'src', 'assets'].forEach(verify);
assert.equal(JSON.parse(asar.extractFile(archive, 'package.json')).version, require('../package.json').version);
const worker = path.join(resources, 'bluetooth', 'atomic-bluetooth', target === 'win' ? 'atomic-bluetooth.exe' : 'atomic-bluetooth');
assert.ok(fs.statSync(worker).isFile(), 'Packaged Bluetooth runtime must be present');
const skipTests = process.env.ATOMIC_SKIP_TESTS === '1';
if (!skipTests) {
  const result = spawnSync(path.resolve(worker), ['--self-test'], { stdio: 'inherit', shell: false });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, 'Packaged Bluetooth runtime must start successfully');
}
assert.ok(fs.statSync(path.join(path.dirname(worker), 'THIRD_PARTY_LICENSES')).isDirectory());
console.log(`Verified: ${count} packaged source/assets, version and Bluetooth resources (${target}/${arch}).${skipTests ? ' Runtime self-test skipped.' : ' Runtime self-test passed.'}`);
