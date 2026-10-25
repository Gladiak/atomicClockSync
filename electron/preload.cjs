const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  platform: process.platform,
  synchronize: () => ipcRenderer.invoke('clock:sync'),
  setTransmitting: active => ipcRenderer.invoke('signal:active', Boolean(active)),
  openReference: key => ipcRenderer.invoke('reference:open', key),
  onInterrupt: callback => {
    const handler = (_event, reason) => callback(reason);
    ipcRenderer.on('signal:interrupt', handler);
    return () => ipcRenderer.removeListener('signal:interrupt', handler);
  },
});
