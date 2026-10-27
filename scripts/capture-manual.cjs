// Regenerate the manual's real UI screenshots using an isolated sample profile.
const {app,BrowserWindow,ipcMain}=require('electron');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'atomic-manual-capture-')));
require('../electron/main.cjs');
// Use the bundled orbital snapshot inside its actual validity window.
const epoch=Date.parse('2026-10-25T14:33:11Z');
ipcMain.removeHandler('clock:sync');ipcMain.handle('clock:sync',()=>({ok:true,nowMs:epoch,host:'Reference · sample',offsetMs:0,uncertaintyMs:6,synchronizedAt:epoch}));
const {validateOrbit}=require('../electron/iss-data.cjs');const orbit=validateOrbit(JSON.parse(fs.readFileSync(path.join(__dirname,'../test/fixtures/iss-omm.json'))));
ipcMain.removeHandler('iss:refresh');ipcMain.handle('iss:refresh',()=>({orbit,fix:null,connectivity:'online',lastSuccess:epoch,error:''}));
// Documentation captures use a declared synthetic detection, never the user's
// adapter, address, watch records or a claim of successful reception.
const sampleWatch={id:'11111111-1111-1111-1111-111111111111',name:'CASIO GA-B2100',model:'GA-B2100',module:'5689',instructions:'ga',verified:true};
ipcMain.removeHandler('bluetooth:scan');ipcMain.handle('bluetooth:scan',()=>({ok:true,devices:[sampleWatch]}));
ipcMain.removeHandler('bluetooth:cancel');ipcMain.handle('bluetooth:cancel',()=>({ok:true}));
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
 const win=BrowserWindow.getAllWindows()[0];win.showInactive();win.webContents.setAudioMuted(true);const run=async code=>{try{return await win.webContents.executeJavaScript(code,true)}catch(error){throw Error(code+'\n'+error.message)}};
 win.webContents.on('console-message',details=>{if(details.level==='error')console.error(details.message)});
 win.webContents.session.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_r,cb)=>cb({cancel:true}));
 async function until(code){const end=Date.now()+20000;while(Date.now()<end){if(await run(code))return;await pause(50);}throw Error('Timeout: '+code);}
 const change=(id,value,type='change')=>run(`document.getElementById(${JSON.stringify(id)}).value=${JSON.stringify(value)};document.getElementById(${JSON.stringify(id)}).dispatchEvent(new Event(${JSON.stringify(type)}))`);
 try{
  if(win.webContents.isLoading())await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));await until("!document.getElementById('start-button').disabled");
  const now=epoch,day=86400000,settings={stationId:'dcf77',volume:30,duration:10,wave:'sine',channel:'both',deviceId:'default',advanceMs:0};
  const watch={name:'Sample · Daily watch',model:'GW-6900',homeCity:'ROM',position:'Dial up · 3 cm from the speaker',systemVolume:'35'};
  const profiles=[{id:'manual-watch',...watch,settings,lastSuccess:null}];
  const history=[0,1,2,3].map((n)=>({id:'manual-trial-'+n,at:now-(n+1)*day,endedAt:now-(n+1)*day+600000,seconds:600,status:'stopped',outcome:n===1?'err':n===3?'unverified':'get',stationId:'dcf77',snapshot:{profileId:'manual-watch',settings:{...settings,volume:n===1?25:30},watch,deviceLabel:'Default system output'},volumeChanges:[],endVolume:n===1?25:30}));
  const entries=[0,2,5,9].map((n,i)=>({id:'manual-reading-'+i,profileId:'manual-watch',watchName:watch.name,type:'measurement',at:now-(10-n)*day,offsetSeconds:3+n*.8+(i===2?.2:0),readingStep:1,method:'manual-offset',reference:{kind:'manual'},conditions:{wear:'resting',position:'Dial up',temperature:21},note:''}));
  await run(`localStorage.setItem('atomic.theme',JSON.stringify('rainbow'));localStorage.setItem('atomic.profiles',JSON.stringify(${JSON.stringify(profiles)}));localStorage.setItem('atomic.activeProfile',JSON.stringify('manual-watch'));localStorage.setItem('atomic.history',JSON.stringify(${JSON.stringify(history)}));localStorage.setItem('atomic.accuracy.v1',JSON.stringify({version:1,entries:${JSON.stringify(entries)}}));`);
  await run(`localStorage.setItem('atomic.bluetooth.history.v1',JSON.stringify([{id:'manual-bluetooth',type:'bluetooth',at:${now-day/2},endedAt:${now-day/2+5000},seconds:5,outcome:'sent',code:'',watch:{name:'CASIO GST-B1000',model:'GST-B1000',module:'5748'},reference:{host:'Reference · sample',offsetMs:0,uncertaintyMs:12,synchronizedAt:${now-day/2+4000}}}]))`);
  win.webContents.reload();await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));await until("!document.getElementById('start-button').disabled");
  const routes=['sync','reception-lab','signal','profiles','watch-accuracy','history','world','moon','iss','light-travel','time-machine','back-in-time','settings'];
  for(const language of ['en','it','fr','de','es','ja']){
   if(process.env.ATOMIC_CAPTURE_LANGUAGE&&language!==process.env.ATOMIC_CAPTURE_LANGUAGE)continue;
   await change('language-select',language);await run("document.fonts.ready.then(()=>true)");
   if(language==='ja')await run("document.fonts.load('12px \"Atomic Noto Sans JP\"','日本語').then(()=>true)");
   const output=path.join(__dirname,'../assets/guide',language);fs.mkdirSync(output,{recursive:true});
   const selectedRoutes=process.env.ATOMIC_CAPTURE_ROUTES?routes.filter(route=>process.env.ATOMIC_CAPTURE_ROUTES.split(',').includes(route)):routes;
   for(const route of selectedRoutes){
    await run(`document.querySelector('[data-page="${route}"]').click()`);
    if(route==='world'){
     await until("document.getElementById('world-loading').hidden");
     await change('world-coverage','all');await change('world-date','2026-12-21');await change('world-time-slider','1185','input');
    }
    if(route==='iss')await until("document.getElementById('iss-speed').textContent!=='—'&&document.getElementById('iss-earth').querySelector('path')!==null");
    if(route==='watch-accuracy')await run("document.getElementById('wa-capture').click()");
    if(route==='time-machine')await run("document.querySelector('[data-event=einstein-gravity]').click()");
    if(route==='profiles')await change('profile-edit-select','manual-watch');
    await run("document.getElementById('page-title').tabIndex=-1;document.getElementById('page-title').focus();document.activeElement.blur();document.getElementById('toast').hidden=true");
    win.webContents.sendInputEvent({type:'mouseMove',x:1050,y:90});await pause(550);
    fs.writeFileSync(path.join(output,route+'.jpg'),(await win.webContents.capturePage()).toJPEG(85));
    if(route==='sync'){
     await run("document.getElementById('bluetooth-button').click()");
     await until("document.getElementById('bluetooth-dialog').open&&!document.getElementById('bluetooth-update').disabled");
     await run("document.activeElement.blur()");await pause(150);
     fs.writeFileSync(path.join(output,'bluetooth.jpg'),(await win.webContents.capturePage()).toJPEG(85));
     await run("document.getElementById('bluetooth-close').click()");
     await until("!document.getElementById('bluetooth-button').disabled");
    }
   }
   console.log('Captured '+(selectedRoutes.length+(selectedRoutes.includes('sync')?1:0))+' Rainbow manual screenshots with Pulse Sync: '+language+' (Bluetooth detection simulated; no tests run)');
  }
  app.exit(0);
 }catch(error){console.error(error.stack);app.exit(1);}
});
