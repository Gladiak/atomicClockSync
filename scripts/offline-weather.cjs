// Unrelated UI tests must not query public forecasts when the home card opens.
module.exports=()=>{const {ipcMain}=require('electron');ipcMain.removeHandler('weather:get');ipcMain.handle('weather:get',()=>({weather:null,connectivity:'offline'}));};
