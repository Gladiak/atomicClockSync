const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  platform: process.platform,
  setObservatoryFullscreen: active => ipcRenderer.invoke('observatory:fullscreen', active),
  onObservatoryExit: callback => {
    const handler=()=>callback();ipcRenderer.on('observatory:exit',handler);
    return ()=>ipcRenderer.removeListener('observatory:exit',handler);
  },
  synchronize: () => ipcRenderer.invoke('clock:sync'),
  searchWatchPhotos: query => ipcRenderer.invoke('watch-photos:search', query),
  getWatchPhoto: (id, full=false) => ipcRenderer.invoke('watch-photos:image', id, full),
  getWatchSpecs: (id, model, refresh=false) => ipcRenderer.invoke('watch-specs:get', id, model, refresh),
  openWatchManual: url => ipcRenderer.invoke('watch-specs:manual', url),
  openWatchPhotoSource: url => ipcRenderer.invoke('watch-photos:source', url),
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
