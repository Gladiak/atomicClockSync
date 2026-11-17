const fs = require('node:fs');
const { randomBytes } = require('node:crypto');

// An installation-specific secret keeps hardware addresses inside the worker.
function loadBluetoothIdentityKey(file) {
  try { fs.writeFileSync(file, randomBytes(32).toString('hex'), { flag: 'wx', mode: 0o600 }); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
  const key = fs.readFileSync(file, 'utf8');
  if (!/^[a-f0-9]{64}$/.test(key)) throw Error('Invalid Bluetooth identity key');
  return key;
}
module.exports = { loadBluetoothIdentityKey };
