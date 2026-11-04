// Run with Node: the same test is dispatched through the branded macOS runtime.
if(!process.versions.electron){
  if(process.platform!=='darwin'){console.log('SKIP: macOS bundle identity check');process.exit(0);}
  const {spawn}=require('node:child_process');
  const launch=require('./start.cjs').getLaunchSpec({entry:'scripts/mac-identity-smoke.cjs'});
  const child=spawn(launch.command,launch.args,{cwd:launch.cwd,env:launch.env,stdio:'inherit'});
  child.on('error',error=>{console.error(error);process.exitCode=1;});child.on('close',code=>{process.exitCode=code??1;});
}else{
  const {app,BrowserWindow,ipcMain,Menu}=require('electron');
  const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),'atomic-mac-identity-'));
  app.setPath('userData',profile);
  const bluetooth=require('../electron/bluetooth.cjs'),createBluetooth=bluetooth.createBluetoothService;let workerCommand;
  bluetooth.createBluetoothService=options=>{workerCommand=options.command;return createBluetooth(options);};
  require('../electron/main.cjs');
require('./offline-iss.cjs')();
  ipcMain.removeHandler('clock:sync');ipcMain.handle('clock:sync',()=>({ok:false,error:'Offline identity test'}));
  const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  app.whenReady().then(async()=>{
    const win=BrowserWindow.getAllWindows()[0],errors=[];win.showInactive();win.webContents.setAudioMuted(true);
    win.webContents.on('console-message',details=>{if(details.level==='error')errors.push(details.message);});
    win.webContents.session.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_request,callback)=>callback({cancel:true}));
    const run=source=>win.webContents.executeJavaScript(source,true);
    async function until(source){const end=Date.now()+15000;while(Date.now()<end){if(await run(source))return;await pause(75);}throw Error('Timeout '+source);}
    async function capture(name){fs.mkdirSync('artifacts/identity',{recursive:true});await run("document.getElementById('toast').hidden=true");await pause(450);for(let i=0;i<3;i++)try{fs.writeFileSync('artifacts/identity/'+name+'.png',(await win.webContents.capturePage()).toPNG());return;}catch(error){if(i===2)throw error;await pause(300);}}
    try{
      if(win.webContents.isLoading())await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));
      await until("document.getElementById('now-earth').children.length>0 && !document.getElementById('start-button').disabled");
      assert.equal(app.name,'AtomicClockSync');assert.equal(app.getPath('userData'),profile);assert.equal(win.getTitle(),'AtomicClockSync');assert.equal(Menu.getApplicationMenu().items[0].label,'AtomicClockSync');
      assert.equal(app.isPackaged,true,'The source runtime should be a real named macOS bundle');assert.ok(process.env.ATOMIC_SOURCE_ROOT);
      assert.deepEqual(workerCommand(),bluetooth.helperCommand({packaged:false,root:path.resolve(__dirname,'..'),resourcesPath:process.resourcesPath}),'Source launch keeps the existing Bluetooth worker selection');
      const native=spawnSync('/usr/bin/osascript',['-l','JavaScript','-e',`ObjC.import('AppKit');const target=$.NSRunningApplication.runningApplicationWithProcessIdentifier(${process.pid});JSON.stringify({name:ObjC.unwrap(target.localizedName),bundleID:ObjC.unwrap(target.bundleIdentifier)})`],{encoding:'utf8'});
      assert.equal(native.status,0,native.stderr);const identity=JSON.parse(native.stdout);assert.deepEqual(identity,{name:'AtomicClockSync',bundleID:'it.atomicclocksync.desktop.dev'});
      const contents=path.resolve(process.execPath,'../..');const plist=JSON.parse(spawnSync('/usr/bin/plutil',['-convert','json','-o','-',path.join(contents,'Info.plist')],{encoding:'utf8'}).stdout);
      assert.equal(plist.CFBundleDisplayName,'AtomicClockSync');assert.equal(plist.CFBundleIconFile,'app.icns');assert.equal(fs.readFileSync(path.join(contents,'Resources','app.icns')).toString('ascii',0,4),'icns');
      const themes=await run("[...document.getElementById('theme-select').options].map(option=>option.value)");
      for(const theme of themes){
        await run(`document.getElementById('theme-select').value='${theme}';document.getElementById('theme-select').dispatchEvent(new Event('change'))`);
        const result=await run(`(()=>{
          const root=getComputedStyle(document.documentElement),rainbow=document.documentElement.dataset.theme.startsWith('rainbow');
          const normalize=value=>{const node=document.createElement('span');node.style.color=value;document.body.append(node);const color=getComputedStyle(node).color;node.remove();return color;};
          const expected=normalize(root.getPropertyValue(rainbow?'--reference-accent':'--accent-text'));
          const data=normalize(root.getPropertyValue(rainbow?'--rainbow-data-text':'--accent-text'));
          const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');canvas.width=canvas.height=1;
          const luminance=color=>{ctx.fillStyle=color;ctx.fillRect(0,0,1,1);const rgb=[...ctx.getImageData(0,0,1,1).data].slice(0,3);return rgb.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((sum,x,i)=>sum+x*[.2126,.7152,.0722][i],0);};
          const readings=['now-clock','now-watch-name','now-last-sync','now-drift','now-full-moon','now-iss-speed','now-iss-altitude'].map(id=>{const node=document.getElementById(id),a=luminance(getComputedStyle(node).color),b=luminance(getComputedStyle(node.closest('.panel')).backgroundColor);return {id,contrast:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});
          return {clock:getComputedStyle(document.getElementById('now-clock')).color,expected,data,moon:getComputedStyle(document.getElementById('now-full-moon')).color,readings,overflow:document.getElementById('page-home').scrollWidth>document.getElementById('page-home').clientWidth};
        })()`);
        assert.equal(result.clock,result.expected,theme+' clock');assert.equal(result.moon,result.data,theme+' data');assert.equal(result.overflow,false,theme+' layout');
        for(const item of result.readings)assert.ok(item.contrast>=4.5,theme+' '+item.id+' contrast '+item.contrast);
      }
      await run("document.getElementById('language-select').value='it';document.getElementById('language-select').dispatchEvent(new Event('change'));document.getElementById('theme-select').value='rainbow';document.getElementById('theme-select').dispatchEvent(new Event('change'))");await capture('now-rainbow-it');
      await run("document.getElementById('theme-select').value='lime';document.getElementById('theme-select').dispatchEvent(new Event('change'))");await capture('now-lime-it');
      assert.deepEqual(errors,[]);console.log('PASS: native macOS localized name and bundle ID, custom ICNS icon, unchanged data location, live-source runtime and dashboard accent/contrast in all fifteen themes.');
    }catch(error){console.error(error.stack||error);process.exitCode=1;}
    finally{win.destroy();app.quit();}
  });
}
