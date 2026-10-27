const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { createBluetoothService, helperCommand } = require('../electron/bluetooth.cjs');
const id = '11111111-1111-1111-1111-111111111111';

function setup({ ntp = async () => ({ epochMs: 1793102400000, offsetMs: 123, monotonicMs: 100, uncertaintyMs: 20 }), syncCode, holdScan = false, metadata = {} } = {}) {
  const commands = [], events = [], children = [];
  let clock = null;
  const service = createBluetoothService({
    command: () => ({ executable: 'fake-worker', args: [] }), synchronize: ntp, monotonic: () => 200,
    onEvent: value => events.push(value),
    spawnProcess: () => {
      const child = new EventEmitter(); children.push(child);
      child.stdout = new EventEmitter(); child.stderr = new EventEmitter(); child.stdin = new EventEmitter();
      const emit = value => child.stdout.emit('data', Buffer.from(JSON.stringify(value) + '\n'));
      child.stdin.write = line => {
        const value = JSON.parse(line); commands.push(value);
        if (value.op === 'scan' && !holdScan) queueMicrotask(() => {
          emit({ event: 'device', id: value.id, device: { id, name: 'CASIO GA-B2100', ...metadata } });
          emit({ id: value.id, ok: true, result: { count: 1 } });
        });
        if (value.op === 'sync') queueMicrotask(() => {
          if (syncCode) emit({ id: value.id, ok: false, code: syncCode });
          else emit({ event: 'clock', id: value.id });
        });
        if (value.op === 'clock') queueMicrotask(() => {
          clock = value;
          emit({ event: 'stage', id: value.id, stage: 'sending' });
          emit({ id: value.id, ok: true, result: { name: 'CASIO GA-B2100', sent: true, offsetMinutes: 60 } });
        });
        if (value.op === 'cancel') queueMicrotask(() => emit({ id: commands.findLast(x => ['scan', 'sync'].includes(x.op))?.id, ok: false, code: 'cancelled' }));
      };
      child.stdin.end = () => queueMicrotask(() => child.emit('close', 0));
      child.kill = child.stdin.end;
      queueMicrotask(() => emit({ event: 'ready', version: 1 }));
      return child;
    },
  });
  return { service, commands, events, children, get clock() { return clock; } };
}

test('scan uses ephemeral selected tokens; sync samples corrected NTP at the final write', async () => {
  const h = setup();
  assert.deepEqual((await h.service.scan()).devices, [{ id, name: 'CASIO GA-B2100' }]);
  const result = await h.service.sync(id);
  assert.equal(result.sent, true);
  assert.equal(h.clock.epochMs, 1793102400223);
  assert.equal(h.service.active, false);
  assert.deepEqual(h.commands.filter(v => v.op === 'sync').map(v => v.deviceId), [id]);
  assert.equal(h.events[0].type, 'device');
});

test('unknown selection never connects; unavailable NTP never authorizes time', async () => {
  for (const options of [{}, { ntp: async () => { throw Error('offline'); } }]) {
    const h = setup(options); await h.service.scan();
    const result = await h.service.sync(options.ntp ? id : 'arbitrary-address');
    assert.equal(result.ok, false);
    assert.equal(result.code, options.ntp ? 'ntp' : 'device');
    assert.equal(h.commands.some(value => value.op === 'sync'), Boolean(options.ntp));
    assert.equal(h.clock, null);
  }
});

test('operations are exclusive and cancelling scan releases the worker', async () => {
  const h = setup({ holdScan: true });
  const pending = h.service.scan();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal((await h.service.sync(id)).code, 'busy');
  await h.service.cancel();
  assert.equal((await pending).code, 'cancelled');
  assert.equal(h.service.active, false);
});

test('cancel during the time check cannot issue a later time write', async () => {
  let finish;
  const h = setup({ ntp: () => new Promise(resolve => { finish = resolve; }) });
  await h.service.scan();
  const sync = h.service.sync(id);
  await new Promise(resolve => setImmediate(resolve));
  await h.service.cancel();
  finish({ epochMs: 0, offsetMs: 0, monotonicMs: 100, uncertaintyMs: 20 });
  assert.equal((await sync).code, 'cancelled');
  assert.equal(h.commands.filter(v => v.op === 'sync').length, 1);
  assert.equal(h.clock, null);
});

test('ambiguous writes are never reported as successful or retried', async () => {
  const h = setup({ syncCode: 'uncertain' }); await h.service.scan();
  assert.deepEqual(await h.service.sync(id), { ok: false, code: 'uncertain' });
  assert.equal(h.commands.filter(v => v.op === 'sync').length, 1);
});

test('a stale NTP anchor cannot authorize a time write', async () => {
  const h = setup({ ntp: async () => ({ epochMs: 0, offsetMs: 0, monotonicMs: -40000, uncertaintyMs: 20 }) });
  await h.service.scan();
  assert.equal((await h.service.sync(id)).code, 'ntp');
  assert.equal(h.clock, null);
});

test('packaged apps require their bundled worker and never fall back to system Python', () => {
  assert.throws(() => helperCommand({ packaged: true, resourcesPath: '/missing', root: process.cwd() }), { code: 'unavailable' });
});

test('model metadata reaches the dialog without exposing addresses or driver fields', async () => {
  const h = setup({ metadata: { model: 'GWG-B1000', module: '5713', instructions: 'gwg', verified: false, address: 'private', driver: 'arbitrary' } });
  assert.deepEqual((await h.service.scan()).devices, [{ id, name: 'CASIO GA-B2100', model: 'GWG-B1000', module: '5713', instructions: 'gwg', verified: false }]);
  await h.service.cancel();
});

test('GST-B1000 instructions and module survive the worker-to-renderer boundary', async () => {
  const h = setup({ metadata: { model: 'GST-B1000', module: '5748', instructions: 'gst', verified: false } });
  const result = await h.service.scan();
  assert.equal(result.devices[0].instructions, 'gst');
  assert.equal(result.devices[0].module, '5748');
  assert.equal(h.events[0].device.verified, false);
  await h.service.cancel();
});

test('missing watch offset preserves the selection for an explicit retry without requesting NTP', async () => {
  let checks = 0;
  const h = setup({ syncCode: 'offset', ntp: async () => { checks++; throw Error(); } });
  await h.service.scan();
  assert.equal((await h.service.sync(id)).code, 'offset');
  assert.equal(h.service.active, false);
  assert.equal((await h.service.sync(id, 345)).code, 'offset');
  assert.deepEqual(h.commands.filter(v => v.op === 'sync').map(v => v.offsetMinutes), [undefined, 345]);
  assert.equal(checks, 0);
  await h.service.cancel();
});

test('invalid explicit offsets cannot reach the worker', async () => {
  for (const value of [true, '60', -735, 855, 31, NaN]) {
    const h = setup(); await h.service.scan();
    assert.equal((await h.service.sync(id, value)).code, 'offset');
    assert.equal(h.commands.some(v => v.op === 'sync'), false);
    await h.service.cancel();
  }
});

test('protocol rejection does not request internet time or authorize a write', async () => {
  let checks = 0;
  const h = setup({ syncCode: 'unsupported', ntp: async () => { checks++; throw Error(); } });
  await h.service.scan();
  assert.equal((await h.service.sync(id)).code, 'unsupported');
  assert.equal(checks, 0);
  assert.equal(h.clock, null);
});

test('diagnostics remain available before, during and after successful and unsuccessful attempts', async () => {
  for (const options of [{}, {syncCode:'protocol'}]) {
    const h=setup(options);
    assert.equal(h.children.length,0);
    assert.match(h.service.diagnostics(),/Bluetooth diagnostics/);
    assert.equal(h.children.length,0);
    await h.service.scan();
    h.children[0].stderr.emit('data', Buffer.from('[Bluetooth] {"event":"read","register":"1d00","address":"private-address"}\n'));
    await h.service.sync(id);
    assert.match(h.service.diagnostics(),/1d00/);
    assert.match(h.service.diagnostics(),options.syncCode?/operation-failure/:/"operation":"sync","ok":true/);
    assert.ok(!h.service.diagnostics().includes('private-address'));
    await h.service.cancel();
    await h.service.scan();
    assert.match(h.service.diagnostics(),/1d00/,'New scan retains previous attempt');
    await h.service.cancel();
  }
});
