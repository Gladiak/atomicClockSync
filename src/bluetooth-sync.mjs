import { t, onLanguageChange } from './i18n.mjs';

const STATUS = {
  scanning: 'Looking for Casio watches…',
  choose: 'Choose your watch, then update its time.',
  empty: 'No Casio found. Enable the watch’s Bluetooth connection mode, then search again.',
  checking: 'Checking the time reference…',
  connecting: 'Connecting to your watch…',
  reading: 'Reading the watch’s time zone…',
  sending: 'Sending date and time…',
  sent: 'Time sent. Check the watch display to confirm reception.',
};
const ERRORS = {
  unavailable: 'Bluetooth support is missing from this build. See the Bluetooth setup instructions.',
  busy: 'Wait for the current operation to finish.',
  device: 'Search again and select a watch from the current list.',
  cancelled: 'Bluetooth cancelled.',
  uncertain: 'Time may have been sent. Check the watch before retrying.',
  protocol: 'The watch’s time settings could not be read safely. No further commands were sent.',
  timeout: 'The watch did not respond in time. Reconnect it and try again.',
  bluetooth: 'Bluetooth connection failed. Check Bluetooth permissions, keep the watch nearby and disconnect CASIO WATCHES.',
  ntp: 'A fresh internet time check is required. Check your connection and try again.',
  unsupported: 'This model or connection mode does not expose a supported time-only procedure. Try the time adjustment mode described in the watch manual.',
  offset: 'The watch did not report its UTC offset. Select the offset currently configured on the watch, reconnect it and update again.',
};
const INSTRUCTIONS = {
  ga: 'On your GA-B2100, hold C for at least three seconds until CNCT flashes. Keep the watch nearby and disconnect CASIO WATCHES.',
  gwg: 'On your GWG-B1000, hold B for at least five seconds until CNCT appears. Keep the watch nearby and disconnect CASIO WATCHES.',
  gst: 'On your GST-B1000, hold B for at least 2.5 seconds until the second hand points to R. For time correction only, hold C for about 0.5 seconds until R. Disconnect CASIO WATCHES.',
  manual: 'Enable the watch’s Bluetooth connection mode. GA-B2100: hold C for 3 seconds. GWG-B1000: hold B for 5 seconds. For other models, follow the watch manual. Disconnect CASIO WATCHES.',
};

export function createBluetoothSync({ desktop, getLocked, setBusy, acceptReference, notify }) {
  const $ = id => document.getElementById(id);
  const dialog = $('bluetooth-dialog');
  let devices = new Map(), selected = '', pending = false, status = '', error = false, generation = 0;
  let needsOffset = false;
  for (let minutes = -720; minutes <= 840; minutes += 15) {
    const option = document.createElement('option'); option.value = String(minutes);
    option.textContent = `UTC${minutes < 0 ? '−' : '+'}${String(Math.floor(Math.abs(minutes) / 60)).padStart(2, '0')}:${String(Math.abs(minutes) % 60).padStart(2, '0')}`;
    $('bluetooth-offset').append(option);
  }

  function render() {
    $('bluetooth-button').disabled = getLocked() || pending;
    $('bluetooth-search').disabled = pending || getLocked();
    $('bluetooth-update').disabled = pending || getLocked() || !devices.has(selected) || status === 'sent' || (needsOffset && $('bluetooth-offset').value === '');
    $('bluetooth-offset-field').hidden = !needsOffset;
    $('bluetooth-offset').disabled = pending;
    const device = devices.get(selected);
    $('bluetooth-intro').textContent = t(INSTRUCTIONS[device?.instructions] || INSTRUCTIONS.manual);
    $('bluetooth-profile').textContent = device?.model ? `${device.model}${device.module ? ` · ${device.module}` : ''} · ${t(device.verified ? 'Time update verified on a watch' : 'Time update awaiting a watch test')}` : '';
    $('bluetooth-profile').hidden = !device?.model;
    $('bluetooth-close').textContent = t(pending ? 'Cancel' : 'Close');
    $('bluetooth-status').textContent = t(error ? ERRORS[status] || ERRORS.bluetooth : STATUS[status] || '');
    $('bluetooth-status').classList.toggle('bt-error', error);
    $('bluetooth-devices').setAttribute('aria-busy', String(status === 'scanning'));
    const focused = document.activeElement?.matches('[name=bluetooth-device]') ? document.activeElement.value : null;
    const rows = [];
    for (const device of devices.values()) {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'radio'; input.name = 'bluetooth-device'; input.value = device.id;
      input.checked = selected === device.id; input.disabled = pending && status !== 'scanning';
      input.addEventListener('change', () => {
        if (selected !== device.id) { needsOffset = false; $('bluetooth-offset').value = ''; }
        selected = device.id; render();
      });
      const name = document.createElement('span'); name.textContent = device.name; name.translate = false;
      label.append(input, name); rows.push(label);
    }
    $('bluetooth-devices').replaceChildren(...rows);
    if (focused) [...$('bluetooth-devices').querySelectorAll('input')].find(input => input.value === focused)?.focus();
  }

  async function search() {
    if (pending || getLocked()) return;
    const token = ++generation;
    devices.clear(); selected = ''; needsOffset = false; $('bluetooth-offset').value = ''; status = 'scanning'; error = false; pending = true; setBusy(true); render();
    try {
      const result = await desktop.bluetoothScan();
      if (token !== generation) return;
      if (!result.ok) { status = result.code; error = true; }
      else {
        devices = new Map(result.devices.map(device => [device.id, device]));
        status = devices.size ? 'choose' : 'empty';
        if (devices.size === 1) selected = devices.keys().next().value;
      }
    } catch { if (token === generation) { status = 'bluetooth'; error = true; } }
    finally { if (token === generation) { pending = false; setBusy(false); render(); } }
  }

  async function update() {
    if (pending || getLocked() || !devices.has(selected)) return;
    const token = ++generation;
    pending = true; error = false; status = 'connecting'; setBusy(true); render();
    try {
      const result = await desktop.bluetoothSync(selected, needsOffset && $('bluetooth-offset').value !== '' ? Number($('bluetooth-offset').value) : undefined);
      if (token !== generation) {
        if (result.code === 'uncertain' || result.sent) notify(t(ERRORS.uncertain), true);
        return;
      }
      if (!result.ok) {
        status = result.code; error = true;
        if (result.code === 'offset') needsOffset = true;
        else { devices.clear(); selected = ''; needsOffset = false; }
      }
      else { status = 'sent'; acceptReference(result.reference); }
    } catch { if (token === generation) { status = 'bluetooth'; error = true; } }
    finally { if (token === generation) { pending = false; setBusy(false); render(); } }
  }

  async function close() {
    if (!dialog.open) return;
    ++generation;
    dialog.close();
    pending = true; setBusy(true);
    try { await desktop.bluetoothCancel(); }
    finally { pending = false; setBusy(false); render(); $('bluetooth-button').focus(); }
  }

  $('bluetooth-button').addEventListener('click', () => {
    if (pending || getLocked()) return;
    dialog.showModal(); search();
  });
  $('bluetooth-search').addEventListener('click', search);
  $('bluetooth-update').addEventListener('click', update);
  $('bluetooth-offset').addEventListener('change', render);
  $('bluetooth-close').addEventListener('click', close);
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  desktop.onBluetoothEvent(event => {
    if (!dialog.open || !pending) return;
    if (event.type === 'device' && status === 'scanning') {
      devices.set(event.device.id, event.device);
      if (!selected) selected = event.device.id;
      render();
    }
    else if (event.type === 'stage') { status = event.stage; render(); }
  });
  onLanguageChange(render);
  return { refresh: render, interrupt: close };
}
