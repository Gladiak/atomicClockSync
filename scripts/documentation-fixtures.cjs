// Isolated, deterministic documentation data. Weather values are date-shifted
// sample model estimates; the original ISS epoch is kept inside its validity.
const {ipcMain}=require('electron');
const {validateOrbit}=require('../electron/iss-data.cjs');
const {validateWeather}=require('../electron/weather-data.cjs');
const weatherSample=require('../test/fixtures/weather-rome.json');
const epoch=weatherSample.current.time*1000-10*86400000;
function install(){
 const orbit=validateOrbit(require('../test/fixtures/iss-omm.json'));
 ipcMain.removeHandler('clock:sync');ipcMain.handle('clock:sync',()=>({ok:true,nowMs:epoch,host:'Reference · sample',offsetMs:0,uncertaintyMs:6,synchronizedAt:epoch}));
 ipcMain.removeHandler('iss:refresh');ipcMain.handle('iss:refresh',()=>({orbit,fix:null,connectivity:'online',lastSuccess:epoch,error:''}));
 ipcMain.removeHandler('weather:get');ipcMain.handle('weather:get',(_event,city)=>{
  const raw=structuredClone(weatherSample),shift=-10*86400;
  raw.latitude=city.latitude;raw.longitude=city.longitude;raw.timezone=city.timeZone;
  raw.current.time+=shift;raw.hourly.time=raw.hourly.time.map(time=>time+shift);raw.daily.time=raw.daily.time.map(time=>time+shift);
  return {weather:validateWeather(raw,city),connectivity:'online',fetchedAt:epoch};
 });
 ipcMain.removeHandler('observatory:fullscreen');ipcMain.handle('observatory:fullscreen',()=>true);
}
async function seedPortrait(run,id){
 // Reuse the original synthetic watch illustration from the personal-time UI
 // fixture. This is not a Casio photograph or evidence of a connected watch.
 await run(`(()=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=480;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#20272e';ctx.fillRect(192,20,96,440);ctx.beginPath();ctx.roundRect(130,106,220,268,43);ctx.fill();ctx.strokeStyle='#58646c';ctx.lineWidth=9;ctx.stroke();
  ctx.fillStyle='#b9c7b6';ctx.fillRect(155,160,170,132);ctx.fillStyle='#253c37';ctx.font='43px monospace';ctx.fillText('10:08',163,242);
  const profiles=JSON.parse(localStorage.getItem('atomic.profiles')),profile=profiles.find(p=>p.id===${JSON.stringify(id)});
  profile.details={photo:canvas.toDataURL('image/webp',.9),acquiredAt:'2024-05-18',note:'Illustrative documentation profile and watch image.'};localStorage.setItem('atomic.profiles',JSON.stringify(profiles));})()`);
}
module.exports={epoch,install,seedPortrait};
