const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  platform: process.platform,
  synchronize: () => ipcRenderer.invoke('clock:sync'),
  refreshIss: () => ipcRenderer.invoke('iss:refresh'),
  setTransmitting: active => ipcRenderer.invoke('signal:active', Boolean(active)),
  openReference: key => ipcRenderer.invoke('reference:open', key),
  setLanguage: language => ipcRenderer.invoke('app:language', language),
  bluetoothScan: () => ipcRenderer.invoke('bluetooth:scan'),
  bluetoothSync: (deviceId, offsetMinutes) => ipcRenderer.invoke('bluetooth:sync', deviceId, offsetMinutes),
  bluetoothCancel: () => ipcRenderer.invoke('bluetooth:cancel'),
  bluetoothDiagnostics: () => ipcRenderer.invoke('bluetooth:diagnostics'),
  bluetoothCopyDiagnostics: () => ipcRenderer.invoke('bluetooth:copy-diagnostics'),
  onBluetoothEvent: callback => {
    const handler = (_event, value) => callback(value);
    ipcRenderer.on('bluetooth:event', handler);
    return () => ipcRenderer.removeListener('bluetooth:event', handler);
  },
  onInterrupt: callback => {
    const handler = (_event, reason) => callback(reason);
    ipcRenderer.on('signal:interrupt', handler);
    return () => ipcRenderer.removeListener('signal:interrupt', handler);
  },
});
