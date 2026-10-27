// Session-only technical events. Never include device addresses, payloads or driver messages.
const { StringDecoder } = require('node:string_decoder');
const events = new Set(['operation-start', 'operation-complete', 'operation-failure', 'worker-start', 'worker-close', 'worker-ready',
  'scan-start', 'scan-found', 'scan-complete', 'connect', 'connected', 'capabilities', 'subscribe', 'adapter', 'read',
  'write', 'write-complete', 'reply', 'read-complete', 'prepared', 'ntp-ready', 'time-write-complete', 'failure', 'stage']);
const patterns = {
  operation: /^(scan|sync)$/, mode: /^(standard|analogue|mip|current-time)$/,
  stage: /^(connecting|reading|checking|sending)$/, model: /^(?=.*\d)[A-Z]{1,5}-[A-Z0-9-]{1,24}$/,
  characteristic: /^[a-f0-9-]{36}$/, register: /^[a-f0-9]{0,4}$/, command: /^[a-f0-9]{0,4}$/,
  kind: /^[A-Za-z]{1,40}$/, code: /^[a-z0-9-]{1,30}$/, signal: /^SIG[A-Z]{1,10}$/,
};
const numbers = new Set(['id', 'count', 'reads', 'length', 'uncertaintyMs']);
const booleans = new Set(['ok', 'writing', 'response', 'fullService', 'currentTimeService']);

function createDiagnosticLog({ version = '', platform = process.platform, arch = process.arch } = {}) {
  const lines = [];
  const decoder = new StringDecoder('utf8');
  let buffer = '', discarding = false;
  function record(event, fields = {}) {
    if (!events.has(event)) return;
    const value = { at: new Date().toISOString(), event };
    for (const [key, item] of Object.entries(fields)) {
      if (patterns[key] && typeof item === 'string' && patterns[key].test(item)) value[key] = item;
      else if (numbers.has(key) && Number.isFinite(item) && item >= 0 && item <= 1000000) value[key] = item;
      else if (booleans.has(key) && typeof item === 'boolean') value[key] = item;
      else if (key === 'properties' && Array.isArray(item)) value.properties = item.filter(p => ['read','write','write-without-response','notify','indicate'].includes(p)).slice(0,5);
    }
    lines.push(JSON.stringify(value));
    if (lines.length > 400) lines.shift();
  }
  function stderr(chunk) {
    for (const part of decoder.write(chunk).split(/(?<=\n)/)) {
      if (!discarding) buffer += part;
      if (buffer.length > 4096) { buffer = ''; discarding = true; }
      if (!part.endsWith('\n')) continue;
      if (!discarding && buffer.startsWith('[Bluetooth] ')) {
        try { const value = JSON.parse(buffer.slice(12)); record(value.event, value); } catch {}
      }
      buffer = ''; discarding = false;
    }
  }
  return {
    record, stderr,
    text: () => `AtomicClockSync ${/^\d+\.\d+\.\d+$/.test(version) ? version : ''} · Bluetooth diagnostics\n${platform} / ${arch}\nLast 400 events · UTC · current app session\n\n${lines.join('\n')}`,
  };
}
module.exports = { createDiagnosticLog };
