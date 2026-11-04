const {app,BrowserWindow,ipcMain}=require('electron');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'atomic-clock-scene-')));require('../electron/main.cjs');require('./offline-iss.cjs')();
const {validateWeather}=require('../electron/weather-data.cjs'),fixture=require('../test/fixtures/weather-rome.json');
let epoch=fixture.current.time*1000,mode='online',requests=0;const deferred=[];
ipcMain.removeHandler('clock:sync');ipcMain.handle('clock:sync',()=>({ok:true,nowMs:epoch,host:'clock-scene-test',uncertaintyMs:1,synchronizedAt:epoch}));
ipcMain.removeHandler('observatory:fullscreen');ipcMain.handle('observatory:fullscreen',()=>true);
function report(city){const raw=structuredClone(fixture);raw.latitude=city.latitude;raw.longitude=city.longitude;raw.timezone=city.timeZone;raw.utc_offset_seconds=city.timeZone==='Asia/Tokyo'?32400:3600;
 const weather=validateWeather(raw,city);if(mode==='expired')weather.current.time=epoch-7*3600000;
 return {weather:mode==='empty'?null:weather,fetchedAt:epoch,connectivity:mode==='offline'?'offline':'online'};}
ipcMain.removeHandler('weather:get');ipcMain.handle('weather:get',(_event,city)=>{requests++;return mode==='pending'?new Promise(resolve=>deferred.push({city,resolve})):report(city);});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
 const win=BrowserWindow.getAllWindows()[0],errors=[];win.webContents.setAudioMuted(true);
 win.webContents.on('console-message',details=>{if(details.level==='error')errors.push(details.message);});
 win.webContents.session.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_request,callback)=>callback({cancel:true}));
 const run=source=>win.webContents.executeJavaScript(source,true);
 async function until(source){const end=Date.now()+15000;while(Date.now()<end){if(await run(source))return;await pause(75);}throw Error('Timeout '+source);}
 async function capture(name){await run("document.getElementById('toast').hidden=true");await pause(500);fs.mkdirSync('artifacts/clock',{recursive:true});for(let i=0;i<3;i++)try{fs.writeFileSync('artifacts/clock/'+name+'.png',(await win.webContents.capturePage()).toPNG());return;}catch(error){if(i===2)throw error;await pause(300);}}
 async function fits(){const problem=await run("(()=>{const root=document.getElementById('clock-stage'),b=root.getBoundingClientRect();return [...root.querySelectorAll('*')].filter(n=>!n.closest('svg')).filter(n=>{const r=n.getBoundingClientRect();return r.width&&r.height&&(r.right>b.right+1||r.bottom>b.bottom+1)}).map(n=>n.id||n.className)})()");assert.deepEqual(problem,[],'Clock scene fits: '+problem.join(','));}
 async function reopen(){await run("document.getElementById('observatory-close').click();document.getElementById('observatory-open').click();document.querySelector('[data-observatory-page=clock]').click()");}
 try{
  if(win.webContents.isLoading())await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));win.showInactive();
  await until("!document.getElementById('start-button').disabled");assert.equal(requests,0,'Weather never polls before the clock is visible');
  await run("document.getElementById('observatory-open').click()");await until("document.getElementById('observatory-dialog').dataset.scene==='clock'&&document.getElementById('clock-stage').dataset.weather==='available'");
  assert.equal(await run("document.getElementById('dial-city').textContent"),'Rome');assert.equal(await run("document.getElementById('dial-hourly').children.length"),6);assert.equal(await run("document.getElementById('dial-daily').children.length"),5);
  assert.match(await run("document.getElementById('dial-coordinates').textContent"),/41.89.*12.51/);assert.match(await run("document.getElementById('dial-sunrise').textContent"),/\d\d:\d\d/);
  assert.equal(await run("new Set([...document.querySelectorAll('.dial-value')].map(n=>getComputedStyle(n).fontSize)).size"),1,'Seconds are the same size as hours and minutes');
  assert.equal(await run("document.querySelectorAll('.dial-flap').length"),0,'No flip panels');await until("document.fonts.check('400 100px \"Atomic Manrope\"')");await fits();await capture('clock-en');
  for(const language of ['it','fr','de','es','ja','en']){await run(`document.getElementById('language-select').value='${language}';document.getElementById('language-select').dispatchEvent(new Event('change'))`);await until("document.getElementById('observatory-dialog').open");await fits();if(language==='it')await capture('clock-it');}
  for(const theme of ['lime','cyan','fuchsia','ruby','gold','aqua','amethyst','lava','soft-sage','powder-blue','soft-lavender','warm-sand','rainbow','rainbow-soft','atlantic']){await run(`document.getElementById('theme-select').value='${theme}';document.getElementById('theme-select').dispatchEvent(new Event('change'))`);await fits();}await capture('clock-atlantic');
  win.setContentSize(1600,1000);await pause(250);
  await run("document.getElementById('language-select').value='it';document.getElementById('language-select').dispatchEvent(new Event('change'));document.getElementById('theme-select').value='rainbow';document.getElementById('theme-select').dispatchEvent(new Event('change'))");await fits();await capture('clock-large-it');
  await run("document.getElementById('language-select').value='en';document.getElementById('language-select').dispatchEvent(new Event('change'))");
  mode='offline';await reopen();await until("document.getElementById('dial-weather-status').textContent.includes('Offline')");
  mode='expired';await reopen();await until("document.getElementById('dial-temperature').textContent==='—'");assert.equal(await run("document.getElementById('dial-hourly').children.length"),0);
  mode='empty';await reopen();await until("document.getElementById('clock-stage').dataset.weather==='unavailable'");assert.match(await run("document.getElementById('dial-sunset').textContent"),/\d\d:\d\d/);
  mode='pending';await reopen();await until("window.document.getElementById('observatory-dialog').dataset.scene==='clock'");
  const waitDeferred=async count=>{const end=Date.now()+15000;while(deferred.length<count&&Date.now()<end)await pause(50);assert.equal(deferred.length,count);};
  await waitDeferred(1);
  async function chooseCity(name){
   await run("document.getElementById('observatory-close').click();document.querySelector('[data-page=world]').click()");
   await run(`document.getElementById('world-city-search').focus();document.getElementById('world-city-search').value=${JSON.stringify(name)};document.getElementById('world-city-search').dispatchEvent(new Event('input'))`);
   await until(`[...document.querySelectorAll('.world-result strong')].some(node=>node.textContent===${JSON.stringify(name)})`);
   await run(`[...document.querySelectorAll('.world-result')].find(node=>node.querySelector('strong').textContent===${JSON.stringify(name)}).click();document.getElementById('observatory-open').click();document.querySelector('[data-observatory-page=clock]').click()`);
  }
  await chooseCity('Tokyo');await waitDeferred(2);
  assert.equal(await run("document.getElementById('dial-temperature').textContent"),'—');
  mode='online';deferred[0].resolve(report(deferred[0].city));await pause(150);
  assert.equal(await run("document.getElementById('dial-temperature').textContent"),'—','An old city response cannot overwrite the new location');
  deferred[1].resolve(report(deferred[1].city));await until("document.getElementById('clock-stage').dataset.weather==='available'");
  assert.equal(await run("document.getElementById('dial-zone').textContent"),'Asia/Tokyo');
  const expected=new Intl.DateTimeFormat('en',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(epoch).replace(':','');
  assert.equal(await run("[...document.querySelectorAll('.dial-value')].map(node=>node.textContent).join('').slice(0,4)"),expected);
  await run("document.querySelector('[data-observatory-page=world]').click();document.getElementById('observatory-close').click();document.querySelector('#page-world input[type=date]').value='2000-01-01'");
  // Use the scene's public date input; the clock always remains on current time.
  await run("(()=>{const input=document.querySelector('#page-world input[type=date]');input.value='2000-01-01';input.dispatchEvent(new Event('change'));document.getElementById('observatory-open').click();document.querySelector('[data-observatory-page=clock]').click()})()");
  await until("document.getElementById('dial-date').textContent.includes('2026')");
  await chooseCity('Longyearbyen');await until("document.getElementById('dial-daylight').textContent==='Polar night'");
  assert.equal(await run("document.getElementById('dial-sunrise').textContent"),'No sunrise');assert.equal(await run("document.getElementById('dial-sunset').textContent"),'No sunset');
  win.setContentSize(1100,740);await pause(200);
  for(const language of ['it','fr','de','es','ja','en']){await run(`document.getElementById('language-select').value='${language}';document.getElementById('language-select').dispatchEvent(new Event('change'))`);await fits();}
  await capture('clock-polar');
  await run("document.getElementById('observatory-close').click();document.querySelector('[data-page=sync]').click();document.getElementById('start-button').click()");
  await until("document.getElementById('start-label').textContent==='Stop'");
  await run("document.querySelector('[data-page=home]').click();document.getElementById('observatory-open').click()");await pause(1200);
  assert.equal(await run("document.getElementById('start-label').textContent"),'Stop','Clock and weather leave the radio signal running');
  await run("document.getElementById('observatory-close').click();document.querySelector('[data-page=sync]').click();document.getElementById('start-button').click()");await until("!document.getElementById('start-button').disabled");
  const stopped=requests;await pause(1600);assert.equal(requests,stopped);assert.equal(await run("document.querySelector('#clock-parking #clock-stage')!==null"),true);
  assert.deepEqual(errors,[]);console.log('PASS: clock scene, equal-size HH:MM:SS, Font Awesome weather symbols, current and future forecasts, local astronomy, 6 languages, 15 themes, cache/offline/expired states and late-response isolation, Tokyo time zone, polar night, preview isolation, radio audio and visible-only lifecycle.');
 }catch(error){console.error(error.stack||error,errors);try{await capture('failure');}catch{}process.exitCode=1;}
 finally{app.exit(process.exitCode||0);}
});
