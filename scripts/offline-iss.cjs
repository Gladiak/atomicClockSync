// Unrelated UI tests must not poll public weather or ISS services from the home cards.
module.exports=()=>{
 require('./offline-weather.cjs')();
 const {ipcMain}=require('electron');ipcMain.removeHandler('iss:refresh');
 ipcMain.handle('iss:refresh',()=>({orbit:null,fix:null,connectivity:'unreachable',lastSuccess:0,error:'Offline test'}));
};
