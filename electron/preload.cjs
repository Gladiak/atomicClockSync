const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  platform: process.platform,
  synchronize: () => ipcRenderer.invoke('clock:sync'),
  refreshIss: () => ipcRenderer.invoke('iss:refresh'),
  setTransmitting: active => ipcRenderer.invoke('signal:active', Boolean(active)),
  openReference: key => ipcRenderer.invoke('reference:open', key),
  setLanguage: language => ipcRenderer.invoke('app:language', language),
  onInterrupt: callback => {
    const handler = (_event, reason) => callback(reason);
    ipcRenderer.on('signal:interrupt', handler);
    return () => ipcRenderer.removeListener('signal:interrupt', handler);
  },
});
