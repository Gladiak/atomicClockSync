// Tests unrelated to tracking must not poll public ISS services from the home card.
module.exports=()=>{
 const {ipcMain}=require('electron');ipcMain.removeHandler('iss:refresh');
 ipcMain.handle('iss:refresh',()=>({orbit:null,fix:null,connectivity:'unreachable',lastSuccess:0,error:'Offline test'}));
};
