const {app,BrowserWindow,ipcMain}=require('electron');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'atomic-guide-')));
require(path.join(process.env.ATOMIC_TEST_APP_ROOT?path.resolve(process.env.ATOMIC_TEST_APP_ROOT):path.resolve(__dirname,'..'),'electron/main.cjs'));
ipcMain.removeHandler('clock:sync');ipcMain.handle('clock:sync',()=>({ok:true,nowMs:Date.now(),host:'guide-test',offsetMs:0,uncertaintyMs:5,synchronizedAt:Date.now()}));
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
 const win=BrowserWindow.getAllWindows()[0],errors=[];win.showInactive();win.webContents.setAudioMuted(true);
 win.webContents.on('console-message',details=>{if(details.level==='error')errors.push(details.message)});
 win.webContents.session.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_r,cb)=>cb({cancel:true}));
 const run=code=>win.webContents.executeJavaScript(code,true);
 const click=id=>run(`document.getElementById(${JSON.stringify(id)}).click()`);
 const go=page=>run(`document.querySelector('[data-page="${page}"]').click()`);
 const change=(id,value)=>run(`document.getElementById(${JSON.stringify(id)}).value=${JSON.stringify(value)};document.getElementById(${JSON.stringify(id)}).dispatchEvent(new Event('change'))`);
 async function until(code){const end=Date.now()+15000;while(Date.now()<end){if(await run(code))return;await pause(50);}throw Error('Timeout: '+code)}
 async function capture(name){await run("document.getElementById('toast').hidden=true;document.activeElement.blur()");await pause(350);fs.mkdirSync('artifacts/guide',{recursive:true});fs.writeFileSync(`artifacts/guide/${name}.png`,(await win.webContents.capturePage()).toPNG());}
 async function fits(label){
  const overflow=await run(`(()=>{const page=document.getElementById('page-guide'),bounds=page.getBoundingClientRect();return [...page.querySelectorAll('*')].filter(node=>{if(node.closest('.manual-reader,.manual-index-list,dialog'))return false;const r=node.getBoundingClientRect();return r.width&&r.height&&(r.bottom>bounds.bottom+1||r.right>bounds.right+1);}).map(node=>node.id||node.className)})()`);
  assert.deepEqual(overflow,[],label+' page overflow');
  assert.equal(await run("document.getElementById('manual-reader').scrollWidth<=document.getElementById('manual-reader').clientWidth+1"),true,label+' horizontal reader overflow');
  assert.equal(await run("document.querySelector('.sidebar nav').getBoundingClientRect().bottom<=document.querySelector('.sidebar-bottom').getBoundingClientRect().top+1"),true,label+' sidebar overlap');
  assert.equal(await run("[...document.querySelectorAll('.sidebar-utilities [data-page]')].every(b=>!b.closest('[inert]')&&b.getBoundingClientRect().height>=30&&b.getBoundingClientRect().bottom<innerHeight)"),true,label+' always-visible utilities');
 }
 try{
  if(win.webContents.isLoading())await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));await until("!document.getElementById('start-button').disabled");
  assert.equal(await run("document.querySelectorAll('[data-nav-group]').length"),3);assert.equal(await run("document.querySelectorAll('.sidebar-utilities [data-page]').length"),2);
  await go('settings');assert.equal(await run("document.querySelector('.sidebar .selected').dataset.page"),'settings');
  await go('guide');assert.equal(await run("document.querySelectorAll('.manual-chapter').length"),16);assert.equal(await run("document.querySelector('.sidebar .selected').dataset.page"),'guide');
  await click('start-button');await until("document.getElementById('start-button').classList.contains('running')");
  await run("document.querySelector('[data-chapter=watch-accuracy]').click()");assert.ok(await run("document.getElementById('manual-article').getAnimations().length>0"));
  win.webContents.debugger.attach('1.3');await win.webContents.debugger.sendCommand('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await until("!document.getElementById('manual-article').getAnimations().length");
  const ids=await run("[...document.querySelectorAll('.manual-chapter')].map(b=>b.dataset.chapter)");
  for(const language of ['en','it','fr','de','es','ja']){
   await change('language-select',language);
   for(const id of ids){
    await run(`document.querySelector('[data-chapter="${id}"]').click()`);await until("document.querySelector('.manual-figure img').complete && document.querySelector('.manual-figure img').naturalWidth>0");
    assert.equal(await run(`(async()=>{const {MANUAL_CHAPTERS}=await import('./guide-data.mjs'),{messages}=await import('./locales/messages.mjs');const c=MANUAL_CHAPTERS.find(c=>c.id===${JSON.stringify(id)}),lang=${JSON.stringify(language)},tr=s=>lang==='en'?s:messages[s]?.[lang];return document.querySelector('.manual-purpose').textContent===tr(c.purpose)&&[...document.querySelectorAll('.manual-prose p')].every((p,i)=>p.textContent===tr(c.body[i]))&&document.querySelector('.manual-example p').textContent===tr(c.example)&&document.querySelector('.manual-note p').textContent===tr(c.note)})()`),true,language+' '+id+' all prose translated');
    assert.ok(await run(`document.querySelector('.manual-figure img').src.includes('/${language}/')`));
    assert.equal(await run("document.querySelectorAll('.manual-chapter[aria-current]').length"),1);assert.equal(await run("document.querySelectorAll('#manual-article ol').length"),0);await fits(language+' '+id);
   }
   if(['en','it','de','ja'].includes(language)){
    await run("document.querySelector('[data-chapter=watch-accuracy]').click()");await until("document.querySelector('.manual-figure img').complete");await run("document.getElementById('manual-reader').scrollTop=0");await capture(language+'-accuracy');
    await run("document.getElementById('manual-reader').scrollTop=document.getElementById('manual-reader').scrollHeight");await capture(language+'-prose');
   }
  }
  const settings=await run("localStorage.getItem('atomic.preferences')");
  for(const theme of ['lime','cyan','fuchsia','ruby','gold','aqua','amethyst','lava','atlantic']){await change('theme-select',theme);for(const chapter of ['sync','privacy','light-travel']){await run(`document.querySelector('[data-chapter="${chapter}"]').click()`);await fits(theme+' '+chapter);}}
  assert.equal(await run("localStorage.getItem('atomic.preferences')"),settings);
  await click('manual-previous');assert.equal(await run("document.querySelector('.manual-chapter[aria-current]').dataset.chapter"),'iss');await click('manual-next');
  await run("document.querySelector('.manual-preview-trigger').click()");await until("document.getElementById('manual-preview-image').complete");assert.equal(await run("document.getElementById('manual-preview').open"),true);
  win.webContents.sendInputEvent({type:'keyDown',keyCode:'Escape'});win.webContents.sendInputEvent({type:'keyUp',keyCode:'Escape'});await until("!document.getElementById('manual-preview').open");
  assert.equal(await run("document.getElementById('start-button').classList.contains('running')"),true,'Closing preview must not stop audio');
  await click('manual-open');assert.equal(await run("document.querySelector('.page.active').id"),'page-light-travel');await click('help-button');assert.equal(await run("document.querySelector('.manual-chapter[aria-current]').dataset.chapter"),'light-travel','Contextual help');
  await run("document.querySelector('[data-chapter=privacy]').click()");await click('start-button');await until("!document.getElementById('start-button').disabled");
  win.webContents.reload();await new Promise(resolve=>win.webContents.once('did-finish-load',resolve));await until("!document.getElementById('start-button').disabled");await go('guide');assert.equal(await run("document.querySelector('.manual-chapter[aria-current]').dataset.chapter"),'privacy');
  assert.deepEqual(errors,[]);
  console.log('PASS: three groups and pinned Settings/Guide, 16 narrative chapters, all 80 prose passages and 78 real screenshots in six languages, zoom/Escape audio isolation, nine themes, fixed layout, context links and chapter persistence.');app.exit(0);
 }catch(error){console.error(error.stack,errors);await capture('failure');app.exit(1)}
});
