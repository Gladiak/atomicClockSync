export const BLUETOOTH_HISTORY_KEY = 'atomic.bluetooth.history.v1';
export const BLUETOOTH_OUTCOMES = Object.freeze({
  pending: 'Bluetooth in progress', sent: 'Time sent · check the watch',
  failed: 'Bluetooth failed', cancelled: 'Bluetooth cancelled', uncertain: 'Interrupted · check the watch',
});
const text = (value, limit) => typeof value === 'string' ? value.slice(0, limit) : '';

export function createBluetoothAttempt(device, at = Date.now()) {
  return { id: crypto.randomUUID(), type: 'bluetooth', at, endedAt: null, seconds: 0, outcome: 'pending',
    watch: { name: text(device.name,80), model: text(device.model,60), module: /^\d{4}$/.test(device.module) ? device.module : '' },
    code: '', reference: null };
}
export function finishBluetoothAttempt(attempt, result, endedAt, seconds) {
  const sent = result?.ok === true && result.sent === true;
  const code = sent ? '' : text(result?.code,30) || 'bluetooth';
  const reference = sent && result.reference && ['host','offsetMs','uncertaintyMs','synchronizedAt'].every(key =>
    key === 'host' ? typeof result.reference[key] === 'string' : Number.isFinite(result.reference[key]))
    ? { host:text(result.reference.host,160), offsetMs:result.reference.offsetMs, uncertaintyMs:result.reference.uncertaintyMs,
        synchronizedAt:result.reference.synchronizedAt } : null;
  return { ...attempt, endedAt, seconds:Math.max(0,Math.round(seconds)),
    outcome:sent?'sent':code==='uncertain'?'uncertain':code==='cancelled'?'cancelled':'failed', code, reference };
}
export function normalizeBluetoothHistory(value) {
  const seen = new Set();
  return (Array.isArray(value)?value:[]).filter(item => item?.type==='bluetooth' && typeof item.id==='string'
    && item.id && !seen.has(item.id) && seen.add(item.id) && Number.isFinite(item.at) && Object.hasOwn(BLUETOOTH_OUTCOMES,item.outcome))
    .map(item => ({ id:text(item.id,100), type:'bluetooth', at:item.at,
      endedAt:Number.isFinite(item.endedAt)?item.endedAt:null,
      seconds:Number.isFinite(item.seconds)?Math.max(0,Math.round(item.seconds)):0,
      outcome:item.outcome==='pending'?'uncertain':item.outcome,
      code:item.outcome==='pending'?'interrupted':text(item.code,30),
      watch:{name:text(item.watch?.name,80),model:text(item.watch?.model,60),module:text(item.watch?.module,4)},
      reference:item.reference && typeof item.reference.host==='string' && [item.reference.offsetMs,item.reference.uncertaintyMs,item.reference.synchronizedAt].every(Number.isFinite)
        ? {host:text(item.reference.host,160),offsetMs:item.reference.offsetMs,uncertaintyMs:item.reference.uncertaintyMs,synchronizedAt:item.reference.synchronizedAt}:null,
    }));
}
export const mergeSynchronizationHistory = (radio, bluetooth) => [...radio,...bluetooth].toSorted((a,b)=>b.at-a.at);
