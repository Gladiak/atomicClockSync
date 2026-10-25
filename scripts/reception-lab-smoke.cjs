const {app,BrowserWindow,ipcMain}=require('electron');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'atomic-reception-lab-')));
require(path.join(process.env.ATOMIC_TEST_APP_ROOT?path.resolve(process.env.ATOMIC_TEST_APP_ROOT):path.resolve(__dirname,'..'),'electron/main.cjs'));
ipcMain.removeHandler('clock:sync');ipcMain.handle('clock:sync',()=>({ok:false,error:'Offline laboratory test'}));
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
 const win=BrowserWindow.getAllWindows()[0],errors=[];win.showInactive();win.webContents.setAudioMuted(true);
 win.webContents.on('console-message',details=>{if(details.level==='error')errors.push(details.message);});
 win.webContents.session.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_r,cb)=>cb({cancel:true}));
 const run=source=>win.webContents.executeJavaScript(source,true);
 async function until(source){const end=Date.now()+15000;while(Date.now()<end){if(await run(source))return;await pause(50);}throw Error('Timeout: '+source);}
 async function click(id){await run(`document.getElementById(${JSON.stringify(id)}).click()`);}
 async function change(id,value){await run(`document.getElementById(${JSON.stringify(id)}).value=${JSON.stringify(value)};document.getElementById(${JSON.stringify(id)}).dispatchEvent(new Event('change'))`);}
 async function tab(name){await click('rl-tab-'+name);}
 async function fits(label){await until("!document.getElementById('page-reception-lab').getAnimations().length");const overflow=await run(`(()=>{const page=document.getElementById('page-reception-lab'),bounds=page.getBoundingClientRect();return [...page.querySelectorAll('*')].filter(node=>{if(node.closest('svg,.rl-config-list,.rl-comparison,.rl-notes,.rl-prep-form,.rl-prep-context'))return false;const r=node.getBoundingClientRect();return r.width&&r.height&&(r.right>bounds.right+1||r.bottom>bounds.bottom+1);}).map(node=>node.id||node.className);})()`);assert.deepEqual(overflow,[],label+' overflow');assert.equal(await run("document.querySelector('.sidebar-bottom').getBoundingClientRect().bottom<=innerHeight"),true,label+' sidebar');assert.equal(await run("/undefined|NaN|\\{\\d+\\}/.test(document.getElementById('page-reception-lab').innerText)"),false,label+' interpolation');}
 async function capture(name){await run("document.getElementById('toast').hidden=true");await pause(550);fs.mkdirSync('artifacts/reception-lab',{recursive:true});fs.writeFileSync(`artifacts/reception-lab/${name}.png`,(await win.webContents.capturePage()).toPNG());}
 try{
  if(win.webContents.isLoading())await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));await until("!document.getElementById('start-button').disabled");
  await run("document.querySelector('[data-page=reception-lab]').click()");await fits('empty');assert.equal(await run("document.getElementById('rl-rate').textContent"),'—');await tab('prepare');assert.equal(await run("document.getElementById('rl-apply').disabled"),true);
  const settings={stationId:'dcf77',volume:30,duration:10,wave:'sine',channel:'both',deviceId:'default',advanceMs:0};
  const watch={name:'GW-6900 · Daily',model:'GW-6900',homeCity:'ROM',position:'12 o’clock · 3 cm from the left speaker',systemVolume:'40'};
  const create=(id,outcome='get',profileId='p1')=>({id,at:Date.now()-Number.parseInt(id,36)*1000,seconds:600,status:'stopped',outcome,stationId:'dcf77',snapshot:{profileId,settings:{...settings},watch:{...watch},deviceLabel:'Default system output'},volumeChanges:[],endVolume:30});
  const history=['a','b','c','d','e','f','g','h','i','j','k','l'].map(id=>create(id));
  history[1].outcome='err';history[1].snapshot.settings.volume=25;history[1].endVolume=25;
  history[2].outcome='unverified';history[4].volumeChanges=[{value:35}];history[4].endVolume=35;
  history[5].status='interrupted';history[5].outcome='err';for(const i of [4,5]){history[i].stationId='msf';history[i].snapshot.settings.stationId='msf';}history[6].snapshot=null;
  history[7].snapshot.profileId='p2';history[7].snapshot.watch.name='<b>Personal watch 日本語</b>';
  history[8].snapshot.profileId=null;history[9].snapshot.profileId=null;history[9].outcome='err';
  history[10].snapshot.profileId='removed';history[10].outcome='err';history[11].snapshot.settings.deviceId='missing-output';
  const profiles=[{id:'p1',...watch,settings,lastSuccess:null},{id:'p2',...watch,name:'<b>Personal watch 日本語</b>',settings,lastSuccess:null}];
  await run(`localStorage.setItem('atomic.history',JSON.stringify(${JSON.stringify(history)}));localStorage.setItem('atomic.profiles',JSON.stringify(${JSON.stringify(profiles)}));`);
  win.webContents.reload();await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));await until("!document.getElementById('start-button').disabled");
  await run("document.querySelector('[data-page=reception-lab]').click()");assert.equal(await run("document.getElementById('rl-rate').textContent"),'64%');assert.equal(await run("document.getElementById('rl-verified').textContent"),'11');assert.equal(await run("document.querySelector('.rl-config-list b:not(.rl-bar b)')===null"),true);
  await change('rl-watch','p1');await capture('overview');assert.equal(await run("document.getElementById('rl-rate').textContent"),'67%');assert.equal(await run("document.getElementById('rl-configs').textContent"),'3');
  await tab('compare');await change('rl-left','a');await change('rl-right','b');assert.equal(await run("document.querySelectorAll('#rl-comparison .rl-different').length"),1);assert.ok(await run("document.getElementById('rl-verdict').textContent.startsWith('One recorded setting')"));
  await tab('prepare');await change('rl-baseline','a');await change('rl-field','volume');await change('rl-value','30');assert.equal(await run("document.getElementById('rl-apply').disabled"),true);await change('rl-value','35');
  const savedProfiles=await run("localStorage.getItem('atomic.profiles')");await click('rl-apply');assert.equal(await run("document.querySelector('.page.active').id"),'page-sync');assert.equal(await run("document.getElementById('volume').value"),'35');assert.equal(await run("document.getElementById('start-button').classList.contains('running')"),false);assert.equal(await run("localStorage.getItem('atomic.profiles')"),savedProfiles);
  await run("document.querySelector('[data-page=reception-lab]').click()");await tab('prepare');await change('rl-baseline','l');await click('rl-apply');assert.equal(await run("document.querySelector('.page.active').id"),'page-reception-lab');assert.equal(await run("document.getElementById('volume').value"),'35');assert.ok(await run("document.getElementById('toast').textContent.includes('unavailable')"));
  await change('rl-watch','removed');assert.equal(await run("document.getElementById('rl-apply').disabled"),true);
  await change('rl-watch','p1');await tab('compare');await change('rl-left','a');await click('rl-open-left');await change('trial-outcome','unverified');await click('trial-save-outcome');await run("document.querySelector('[data-page=reception-lab]').click()");assert.equal(await run("document.getElementById('rl-rate').textContent"),'60%');
  await tab('prepare');await change('rl-station','msf');assert.equal(await run("document.getElementById('rl-delta').textContent"),'—');assert.equal(await run("document.getElementById('rl-apply').disabled"),true);assert.ok(await run("document.getElementById('rl-prepare-context').textContent.includes('No stable baseline')"));await change('rl-station','all');
  await change('rl-station','jjy');assert.equal(await run("document.getElementById('rl-verified').textContent"),'0');await change('rl-station','all');
  await run("document.querySelector('[data-page=sync]').click();document.getElementById('start-button').click()");await until("document.getElementById('start-button').classList.contains('running')");await run("document.querySelector('[data-page=reception-lab]').click()");await tab('prepare');assert.equal(await run("document.getElementById('rl-apply').disabled"),true);
  for(const language of ['en','it','fr','de','es','ja']){await change('language-select',language);for(const name of ['overview','compare','prepare']){await tab(name);await fits(language+' '+name);}if(language==='it'){await tab('overview');await capture('italian-overview');await tab('compare');await capture('italian-compare');await tab('prepare');await capture('italian-prepare');}}
  for(const theme of ['lime','cyan','fuchsia','ruby','gold','aqua','amethyst','lava','atlantic']){await change('theme-select',theme);for(const name of ['overview','compare','prepare']){await tab(name);await fits(theme+' '+name);}}
  assert.equal(await run("document.getElementById('start-button').classList.contains('running')"),true);assert.deepEqual(errors,[]);
  await run("document.querySelector('[data-page=sync]').click();document.getElementById('start-button').click()");await until("!document.getElementById('start-button').disabled");
  await run("document.querySelector('[data-page=history]').click();document.getElementById('clear-history').click();document.querySelector('[data-page=reception-lab]').click()");assert.equal(await run("document.getElementById('rl-rate').textContent"),'—');await run("document.querySelector('#toast button').click()");assert.notEqual(await run("document.getElementById('rl-rate').textContent"),'—');
  console.log('PASS: empty/missing/archived data, honest GET rates, filters, immutable groups, A/B differences, single-setting preparation, unavailable output, saved-profile protection, live outcome updates, six languages, nine themes, history undo and continuous muted audio.');app.exit(0);
 }catch(error){console.error(error.stack,errors);await capture('failure');app.exit(1);}
});
