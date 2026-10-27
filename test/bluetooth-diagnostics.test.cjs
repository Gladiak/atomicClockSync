const test = require('node:test');
const assert = require('node:assert/strict');
const { createDiagnosticLog } = require('../electron/bluetooth-diagnostics.cjs');

test('diagnostics allow only technical fields, excluding addresses, paths, payloads and driver text', () => {
  const log = createDiagnosticLog({ version: '1.11.0' });
  log.stderr(Buffer.from('[Bluetooth] '+JSON.stringify({ event:'failure', kind:'ProtocolError', writing:false,
    address:'AA:BB:CC:DD:EE:FF', detail:'private driver error', payload:'settings bytes', executable:'/Users/private/helper', model:'GST-B1000' })+'\n'));
  assert.match(log.text(), /ProtocolError/);
  assert.match(log.text(), /GST-B1000/);
  for (const privateText of ['AA:BB','private','settings bytes','/Users','"detail"','"payload"']) assert.ok(!log.text().includes(privateText));
});

test('chunked stderr, malformed lines and oversized output cannot corrupt or grow the bounded log', () => {
  const log = createDiagnosticLog();
  log.stderr(Buffer.from('Driver error: private\n[Bluetooth] {"event":"rea'));
  log.stderr(Buffer.from('d","register":"1f00"}\n[Bluetooth] invalid json\n'));
  assert.match(log.text(), /1f00/);
  log.stderr(Buffer.from('[Bluetooth] '+ 'x'.repeat(10000)));
  log.stderr(Buffer.from('\n[Bluetooth] {"event":"failure","kind":"ProtocolError"}\n'));
  assert.match(log.text(), /ProtocolError/);
  for (let i=0;i<500;i++) log.record('read', {register:'1d00',length:i});
  const lines=log.text().split('\n').filter(line=>line.startsWith('{'));
  assert.equal(lines.length,400);
  assert.equal(JSON.parse(lines[0]).length,100);
  assert.equal(JSON.parse(lines.at(-1)).length,499);
  assert.ok(log.text().length<100000);
});
