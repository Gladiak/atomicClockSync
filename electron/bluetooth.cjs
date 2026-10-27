const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');
const path = require('node:path');
const { performance } = require('node:perf_hooks');

const fail = code => Object.assign(new Error(code), { code });
const codes = new Set(['busy', 'cancelled', 'uncertain', 'protocol', 'timeout', 'bluetooth', 'unsupported', 'offset']);

function helperCommand({ packaged, resourcesPath, root, platform = process.platform, arch = process.arch }) {
  const name = platform === 'win32' ? 'atomic-bluetooth.exe' : 'atomic-bluetooth';
  const directory = packaged ? path.join(resourcesPath, 'bluetooth') : path.join(root, 'build', 'bluetooth', `${platform}-${arch}`);
  const executable = path.join(directory, 'atomic-bluetooth', name);
  // Development only: never invoke an arbitrary system Python in a release.
  const python = path.join(root, '.venv-bluetooth', platform === 'win32' ? 'Scripts/python.exe' : 'bin/python3');
  if (!packaged && existsSync(python)) return { executable: python, args: ['-u', path.join(root, 'bluetooth/helper.py')] };
  if (existsSync(executable)) return { executable, args: [] };
  throw fail('unavailable');
}

function createBluetoothService({ command, synchronize, onEvent = () => {}, spawnProcess = spawn, monotonic = () => performance.now() }) {
  let worker = null, operation = null, closing = null, sequence = 0;
  let devices = new Map();

  async function stopWorker() {
    if (!worker) return closing;
    const child = worker.child;
    const wasRunning = Boolean(operation?.pending);
    worker = null;
    devices.clear();
    if (operation?.pending) {
      operation.pending.reject(fail(operation.writing ? 'uncertain' : 'cancelled'));
      operation.pending = null;
    }
    const completion = new Promise(resolve => {
      const finish = () => { clearTimeout(timer); resolve(); };
      const timer = setTimeout(() => { child.kill(); }, 2000);
      timer.unref?.();
      child.once('close', finish);
      // Let cancellation unwind the GATT context before closing stdin.
      child.once('message-finished', () => child.stdin.end());
      try {
        child.stdin.write(JSON.stringify({ op: 'cancel' }) + '\n');
        if (!wasRunning) child.stdin.end();
      } catch { child.kill(); }
    });
    closing = completion;
    completion.finally(() => { if (closing === completion) closing = null; });
    return completion;
  }

  function send(value) {
    if (!worker || worker.child.stdin.destroyed) throw fail('bluetooth');
    worker.child.stdin.write(JSON.stringify(value) + '\n');
  }

  async function provideClock(op, instance) {
    if (op.kind !== 'sync' || op.clockRequested) { op.pending?.reject(fail('protocol')); stopWorker(); return; }
    op.clockRequested = true;
    onEvent({ type: 'stage', stage: 'checking' });
    try {
      // Long model-specific handshakes must not age the internet reference.
      // Request it only after the watch is ready for the single time write.
      const ref = await synchronize();
      if (op.cancelled || operation !== op || worker !== instance || !op.pending) return;
      const age = monotonic() - ref.monotonicMs;
      if (![ref.epochMs, ref.offsetMs, ref.monotonicMs, ref.uncertaintyMs].every(Number.isFinite) ||
          ref.uncertaintyMs < 0 || ref.uncertaintyMs > 1000 || age < 0 || age > 30000) throw fail('ntp');
      op.reference = ref;
      op.writing = true;
      send({ op: 'clock', id: op.id, epochMs: ref.epochMs + ref.offsetMs + age });
    } catch {
      if (op.cancelled || operation !== op || worker !== instance) return;
      op.pending?.reject(fail('ntp')); stopWorker();
    }
  }

  async function ensureWorker() {
    if (worker) return worker.ready;
    const spec = command();
    const child = spawnProcess(spec.executable, spec.args, { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true, shell: false });
    let readyResolve, readyReject;
    const ready = new Promise((resolve, reject) => { readyResolve = resolve; readyReject = reject; });
    const instance = { child, ready };
    worker = instance;
    let buffer = '';
    const timer = setTimeout(() => { readyReject(fail('timeout')); stopWorker(); }, 10000);
    timer.unref?.();
    const lost = () => {
      clearTimeout(timer);
      readyReject(fail('bluetooth'));
      if (worker !== instance) return;
      worker = null;
      devices.clear();
      if (operation?.pending) {
        operation.pending.reject(fail(operation.writing ? 'uncertain' : 'bluetooth'));
        operation.pending = null;
      }
    };
    child.on('error', lost);
    child.on('close', lost);
    child.stdin.on('error', lost);
    // Consume diagnostics without exposing addresses/driver-specific text to UI.
    child.stderr.on('data', () => {});
    child.stdout.on('data', chunk => {
      buffer += chunk.toString();
      if (buffer.length > 32768) { readyReject(fail('protocol')); stopWorker(); return; }
      let end;
      while ((end = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, end); buffer = buffer.slice(end + 1);
        let value;
        try { value = JSON.parse(line); } catch { readyReject(fail('protocol')); stopWorker(); return; }
        if (!value || typeof value !== 'object') continue;
        if (!value.event) child.emit('message-finished');
        if (worker !== instance) continue;
        if (value.event === 'ready' && value.version === 1) { clearTimeout(timer); readyResolve(); continue; }
        const op = operation;
        if (!op || value.id !== op.id || op.cancelled) continue;
        if (value.event === 'device' && op.kind === 'scan') {
          const item = value.device;
          if (devices.size >= 64 || typeof item?.id !== 'string' || !/^[a-f0-9-]{36}$/.test(item.id) || typeof item.name !== 'string' || item.name.length > 80) continue;
          const device = { id: item.id, name: item.name };
          if (typeof item.model === 'string' && item.model.length <= 80) {
            device.model = item.model;
            device.module = typeof item.module === 'string' && /^\d{4}$/.test(item.module) ? item.module : '';
            device.verified = item.verified === true;
            device.instructions = ['ga', 'gwg', 'gst'].includes(item.instructions) ? item.instructions : 'manual';
          }
          devices.set(item.id, device); onEvent({ type: 'device', device });
        } else if (value.event === 'stage' && op.kind === 'sync' && ['connecting', 'reading', 'sending'].includes(value.stage)) {
          if (value.stage === 'sending') op.writing = true;
          onEvent({ type: 'stage', stage: value.stage });
        } else if (value.event === 'clock') {
          void provideClock(op, instance);
        } else if (!value.event && op.pending) {
          const pending = op.pending; op.pending = null;
          if (value.ok === true) pending.resolve(value.result);
          else pending.reject(fail(codes.has(value.code) ? value.code : 'bluetooth'));
        }
      }
    });
    return ready;
  }

  async function request(op, extra = {}) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { reject(fail(op.writing ? 'uncertain' : 'timeout')); stopWorker(); }, op.kind === 'scan' ? 15000 : 100000);
      timer.unref?.();
      op.pending = {
        resolve: result => { clearTimeout(timer); resolve(result); },
        reject: error => { clearTimeout(timer); reject(error); },
      };
      try { send({ op: op.kind, id: op.id, ...extra }); }
      catch (error) { op.pending.reject(error); op.pending = null; }
    });
  }

  async function run(kind, action) {
    if (operation || closing) return { ok: false, code: 'busy' };
    const op = { kind, id: ++sequence, cancelled: false, pending: null, writing: false };
    operation = op;
    try {
      await ensureWorker();
      if (op.cancelled) throw fail('cancelled');
      const result = await action(op);
      if (op.cancelled) throw fail(op.writing ? 'uncertain' : 'cancelled');
      return { ok: true, ...result };
    } catch (error) {
      // The helper already disconnected before reporting missing offset.
      // Keep the selected opaque token so an explicit-offset retry is usable.
      if (error.code !== 'offset') await stopWorker();
      return { ok: false, code: op.cancelled ? (op.writing ? 'uncertain' : 'cancelled') : error.code || 'bluetooth' };
    } finally {
      if (operation === op) operation = null;
    }
  }

  return {
    get active() { return Boolean(operation || closing); },
    scan: () => run('scan', async op => {
      devices.clear();
      await request(op);
      return { devices: [...devices.values()] };
    }),
    sync: (deviceId, offsetMinutes) => run('sync', async op => {
      if (typeof deviceId !== 'string' || !devices.has(deviceId)) throw fail('device');
      if (offsetMinutes !== undefined && (!Number.isInteger(offsetMinutes) || offsetMinutes < -720 || offsetMinutes > 840 || offsetMinutes % 15)) throw fail('offset');
      const result = await request(op, { deviceId, ...(offsetMinutes !== undefined ? { offsetMinutes } : {}) });
      const ref = op.reference;
      if (!ref || !op.writing || result?.sent !== true || !Number.isInteger(result.offsetMinutes) || result.offsetMinutes < -720 || result.offsetMinutes > 840) throw fail('protocol');
      await stopWorker();
      return { sent: true, name: String(result.name).slice(0, 80), offsetMinutes: result.offsetMinutes,
        reference: { ...ref, nowMs: ref.epochMs + ref.offsetMs + monotonic() - ref.monotonicMs } };
    }),
    cancel: async () => {
      if (operation) operation.cancelled = true;
      await stopWorker();
      return { ok: true };
    },
  };
}

module.exports = { createBluetoothService, helperCommand };
