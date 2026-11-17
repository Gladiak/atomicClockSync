const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {loadBluetoothIdentityKey}=require('../electron/bluetooth-identity.cjs');
test('collection secret persists per installation without replacing existing or damaged keys',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'atomic-identity-'));
 try{
  const file=path.join(dir,'identity'),key=loadBluetoothIdentityKey(file);
  assert.match(key,/^[a-f0-9]{64}$/);assert.equal(loadBluetoothIdentityKey(file),key);
  assert.notEqual(loadBluetoothIdentityKey(path.join(dir,'other')),key);
  if(process.platform!=='win32')assert.equal(fs.statSync(file).mode&0o777,0o600);
  fs.writeFileSync(file,'damaged');assert.throws(()=>loadBluetoothIdentityKey(file));assert.equal(fs.readFileSync(file,'utf8'),'damaged');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
