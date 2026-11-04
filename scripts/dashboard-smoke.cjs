const {app,BrowserWindow,ipcMain}=require('electron');
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'atomic-dashboard-')));
require('../electron/main.cjs');
ipcMain.removeHandler('observatory:fullscreen');ipcMain.handle('observatory:fullscreen',()=>true);
const {validateOrbit}=require('../electron/iss-data.cjs'),fixture=require('../test/fixtures/iss-omm.json');
const {validateWeather}=require('../electron/weather-data.cjs'),weatherFixture=require('../test/fixtures/weather-rome.json');
const epoch=weatherFixture.current.time*1000;let clockEpoch=epoch,mode='online',requests=0;
ipcMain.removeHandler('clock:sync');ipcMain.handle('clock:sync',()=>({ok:true,nowMs:clockEpoch,host:'dashboard-test',offsetMs:0,uncertaintyMs:1,synchronizedAt:clockEpoch}));
ipcMain.removeHandler('iss:refresh');ipcMain.handle('iss:refresh',()=>{
 requests++;const orbit=mode==='stale'?validateOrbit({...fixture,EPOCH:'2026-10-01T05:01:11Z'}):validateOrbit({...fixture,EPOCH:new Date(epoch-3600000).toISOString()});
 return {orbit:['empty','report'].includes(mode)?null:orbit,fix:mode==='report'?{latitude:-41.18,longitude:-14.04,altitude:431.5,velocity:27552,timestamp:epoch,source:'Where the ISS at'}:null,connectivity:mode==='offline'||mode==='empty'?'unreachable':'online'};
});
let weatherMode='online',weatherRequests=0;const weatherPending=[];
function forecast(city){const raw=structuredClone(weatherFixture);raw.latitude=city.latitude;raw.longitude=city.longitude;raw.timezone=city.timeZone;raw.utc_offset_seconds=city.timeZone==='Asia/Tokyo'?32400:3600;const weather=validateWeather(raw,city);if(weatherMode==='expired')weather.current.time=epoch-7*3600000;return {weather:weatherMode==='empty'?null:weather,connectivity:weatherMode==='offline'?'offline':'online'};}
ipcMain.removeHandler('weather:get');ipcMain.handle('weather:get',(_event,city)=>{weatherRequests++;return weatherMode==='pending'?new Promise(resolve=>weatherPending.push({city,resolve})):forecast(city);});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
 const win=BrowserWindow.getAllWindows()[0],errors=[];win.webContents.setAudioMuted(true);
 win.webContents.on('console-message',details=>{if(details.level==='error')errors.push(details.message);});
 win.webContents.session.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_r,callback)=>callback({cancel:true}));
 const run=source=>win.webContents.executeJavaScript(source,true);
 async function until(source){const end=Date.now()+15000;while(Date.now()<end){if(await run(source))return;await pause(75);}throw Error('Timeout '+source);}
 async function enterHome(){await run("document.querySelector('[data-page=profiles]').click();document.querySelector('[data-page=home]').click()");}
 async function capture(name){fs.mkdirSync('artifacts/dashboard',{recursive:true});await run("document.getElementById('toast').hidden=true");await pause(400);for(let i=0;i<3;i++)try{fs.writeFileSync('artifacts/dashboard/'+name+'.png',(await win.webContents.capturePage()).toPNG());return;}catch(error){if(i===2)throw error;await pause(300);}}
 async function fits(){assert.equal(await run("document.getElementById('now-moon-illumination').getBoundingClientRect().bottom<=document.querySelector('.now-full-moon').getBoundingClientRect().top"),true,'Lunar caption stays above its divider');const overflow=await run("(()=>{const root=document.getElementById('page-home'),b=root.getBoundingClientRect();return {language:document.documentElement.lang,height:root.clientHeight,scroll:root.scrollHeight,nodes:[...root.querySelectorAll('*')].filter(n=>!n.closest('svg')).map(n=>({id:n.id||n.className,top:n.getBoundingClientRect().top,bottom:n.getBoundingClientRect().bottom})).filter(n=>n.bottom>b.bottom+1)}})()");if(overflow.scroll>overflow.height||overflow.nodes.length)console.log(overflow);assert.equal(await run("(()=>{const root=document.getElementById('page-home'),bounds=root.getBoundingClientRect();return root.scrollWidth<=root.clientWidth+1&&root.scrollHeight<=root.clientHeight+1&&[...root.querySelectorAll('*')].filter(node=>!node.closest('svg')).every(node=>{const r=node.getBoundingClientRect();return !r.width||!r.height||r.right<=bounds.right+1&&r.bottom<=bounds.bottom+1})})()"),true,'Dashboard fits the fixed window');}
 try{
  if(win.webContents.isLoading())await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));win.showInactive();
  await until("!document.getElementById('start-button').disabled&&document.getElementById('now-earth').dataset.basemap==='satellite'&&document.getElementById('now-moon-disc').dataset.texture==='nasa-lro'&&document.getElementById('now-iss-card').dataset.state==='estimated'&&!document.getElementById('now-earth-credit').hidden");
  await until("document.getElementById('now-weather-card').dataset.weather==='available'");
  assert.equal(await run("document.getElementById('now-weather-daily').children.length"),5);
  assert.match(await run("document.getElementById('now-weather-city').textContent"),/Rome/);
  assert.match(await run("document.getElementById('now-weather-sunrise').textContent"),/\d\d:\d\d/);
  await until("document.fonts.check('32px weathericons')");
  assert.equal(await run("(()=>{const a=document.querySelector('.now-hero').getBoundingClientRect(),b=document.querySelector('.now-weather').getBoundingClientRect(),c=document.querySelector('.now-watch').getBoundingClientRect();return a.right<b.left&&b.right<c.left})()"),true);
  assert.equal(await run("document.getElementById('now-light-age')"),null);
  assert.match(await run("document.getElementById('now-iss-position').textContent"),/°/);assert.match(await run("document.getElementById('now-iss-speed').textContent"),/km\/h/);assert.match(await run("document.getElementById('now-iss-altitude').textContent"),/km/);
  assert.equal(await run("document.getElementById('now-earth-credit').hidden"),false);
  const phase=await run("document.getElementById('now-moon-phase').textContent"),prefs=await run("localStorage.getItem('atomic.preferences')");
  await run("document.querySelector('#page-home [data-goto=moon]').click()");await until("document.getElementById('moon-disc').dataset.texture==='nasa-lro'");
  await run("document.querySelector('.moon-quarter').click();document.querySelector('[data-page=home]').click()");
  assert.equal(await run("document.getElementById('now-moon-phase').textContent"),phase,'Lunar previews do not change the live home Moon');
  await run("document.querySelector('[data-page=world]').click();document.getElementById('world-basemap-atlas').click();document.querySelector('[data-page=home]').click()");await until("document.getElementById('now-earth').dataset.basemap==='atlas'");
  assert.equal(await run("document.getElementById('now-earth-credit').hidden"),true);
  await run("document.querySelector('[data-page=world]').click();document.getElementById('world-basemap-satellite').click();document.querySelector('[data-page=home]').click()");await until("document.getElementById('now-earth').dataset.basemap==='satellite'");
  for(const language of ['en','it','fr','de','es','ja']){
   await run(`document.getElementById('language-select').value='${language}';document.getElementById('language-select').dispatchEvent(new Event('change'))`);await fits();
   if(language==='it'){await run("document.getElementById('theme-select').value='rainbow';document.getElementById('theme-select').dispatchEvent(new Event('change'))");await capture('home-it');}
  }
  await run("document.getElementById('language-select').value='en';document.getElementById('language-select').dispatchEvent(new Event('change'))");
  for(const theme of ['lime','cyan','fuchsia','ruby','gold','aqua','amethyst','lava','soft-sage','powder-blue','soft-lavender','warm-sand','rainbow','rainbow-soft','atlantic']){await run(`document.getElementById('theme-select').value='${theme}';document.getElementById('theme-select').dispatchEvent(new Event('change'))`);await fits();if(['lime','atlantic'].includes(theme))await capture('home-'+theme);}
  weatherMode='offline';await enterHome();await until("document.getElementById('now-weather-status').textContent.includes('Offline')");
  weatherMode='expired';await enterHome();await until("document.getElementById('now-weather-temperature').textContent==='—'");assert.equal(await run("document.getElementById('now-weather-daily').children.length"),0);
  weatherMode='empty';await enterHome();await until("document.getElementById('now-weather-card').dataset.weather==='unavailable'");assert.match(await run("document.getElementById('now-weather-sunset').textContent"),/\d\d:\d\d/);
  weatherMode='online';await enterHome();await until("document.getElementById('now-weather-card').dataset.weather==='available'");
  await run("document.getElementById('now-weather-open').click()");await until("document.getElementById('observatory-dialog').dataset.scene==='clock'&&document.getElementById('clock-stage').dataset.weather==='available'");await run("document.getElementById('observatory-close').click()");
  async function chooseCity(name){
    await run("document.querySelector('[data-page=world]').click()");
    await run(`document.getElementById('world-city-search').focus();document.getElementById('world-city-search').value=${JSON.stringify(name)};document.getElementById('world-city-search').dispatchEvent(new Event('input'))`);
    await until(`[...document.querySelectorAll('.world-result strong')].some(node=>node.textContent===${JSON.stringify(name)})`);
    await run(`[...document.querySelectorAll('.world-result')].find(node=>node.querySelector('strong').textContent===${JSON.stringify(name)}).click();document.querySelector('[data-page=home]').click()`);
  }
  weatherMode='pending';await enterHome();
  await chooseCity('Tokyo');await until("document.getElementById('now-weather-city').textContent.includes('Tokyo')");
  const pendingEnd=Date.now()+10000;while(!weatherPending.some(row=>row.city.timeZone==='Asia/Tokyo')&&Date.now()<pendingEnd)await pause(50);
  const tokyo=weatherPending.find(row=>row.city.timeZone==='Asia/Tokyo');assert.ok(tokyo);
  weatherMode='online';for(const row of weatherPending.filter(row=>row!==tokyo))row.resolve(forecast(row.city));await pause(200);
  assert.equal(await run("document.getElementById('now-weather-temperature').textContent"),'—','Late Rome data cannot populate Tokyo weather');
  tokyo.resolve(forecast(tokyo.city));await until("document.getElementById('now-weather-card').dataset.weather==='available'");
  await chooseCity('Longyearbyen');await until("document.getElementById('now-weather-daylight').textContent==='Polar night'");await fits();
  await chooseCity('Rome');await until("document.getElementById('now-weather-card').dataset.weather==='available'");
  await run("document.querySelector('#page-home [data-goto=iss]').click()");await until("document.getElementById('iss-speed').textContent!=='—'");await enterHome();
  mode='stale';await enterHome();await until("document.getElementById('now-iss-card').dataset.state==='stale'");assert.equal(await run("document.getElementById('now-iss-speed').textContent"),'—');assert.equal(await run("document.getElementById('now-iss-altitude').textContent"),'—');
  mode='report';await enterHome();await until("document.getElementById('now-iss-card').dataset.state==='report'");assert.match(await run("document.getElementById('now-iss-speed').textContent"),/27,552/);assert.match(await run("document.getElementById('now-iss-altitude').textContent"),/431.5/);
  clockEpoch=epoch+45000;await run("document.getElementById('sync-button').click()");await until("!document.getElementById('start-button').disabled&&document.getElementById('now-iss-speed').textContent==='—'");
  mode='offline';await enterHome();await until("document.getElementById('now-iss-status').textContent==='OFFLINE · PREDICTED'");assert.match(await run("document.getElementById('now-iss-source').textContent"),/CelesTrak/);
  mode='empty';await enterHome();await until("document.getElementById('now-iss-status').textContent==='UNAVAILABLE'");assert.equal(await run("document.getElementById('now-iss-speed').textContent"),'—');
  await run("document.querySelector('[data-page=profiles]').click()");const stopped=requests,stoppedWeather=weatherRequests;await pause(10500);assert.equal(weatherRequests,stoppedWeather);assert.equal(requests,stopped,'Home polling stops when another page is visible');
  mode='online';await run("document.querySelector('[data-page=sync]').click();document.getElementById('start-button').click()");await until("document.getElementById('start-label').textContent==='Stop'");await enterHome();await pause(1600);assert.equal(await run("document.getElementById('start-label').textContent"),'Stop');
  assert.equal(await run("localStorage.getItem('atomic.preferences')"),prefs);
  await run("document.querySelector('[data-page=sync]').click();document.getElementById('start-button').click()");await until("!document.getElementById('start-button').disabled");assert.deepEqual(errors,[]);
  console.log('PASS: dashboard weather, five-day forecast, local solar events, offline/stale/unavailable weather, city and late-response isolation, polar night, Clock shortcut, photographic map/lunar previews, shared map appearance, live home independent of previews, ISS estimate/report/offline/stale/expired/unavailable states, units, visible-only polling, links, six languages, fifteen themes and audio isolation.');
 }catch(error){console.error(error.stack||error,errors);try{await capture('failure');}catch{}process.exitCode=1;}
 finally{app.exit(process.exitCode||0);}
});
