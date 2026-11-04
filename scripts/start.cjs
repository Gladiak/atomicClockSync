// macOS reads the bundle's identity, not app.setName(). Keep a branded development
// runtime alongside the checkout; its bootstrap loads the live project sources.
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {spawn,spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const metadata=require('../package.json');

function run(command,args){
  const result=spawnSync(command,args,{encoding:'utf8'});
  if(result.error)throw result.error;
  if(result.status!==0)throw Error(`${path.basename(command)} failed: ${(result.stderr||result.stdout).trim()}`);
  return result.stdout;
}
function readPlist(file){return JSON.parse(run('/usr/bin/plutil',['-convert','json','-o','-',file]));}
function updatePlist(file,changes){
  const value={...readPlist(file),...changes};
  fs.writeFileSync(file,JSON.stringify(value));run('/usr/bin/plutil',['-convert','xml1',file]);
}
function makeIcon(destination,directory){
  const iconset=path.join(directory,'app.iconset');fs.mkdirSync(iconset);
  const source=path.join(root,'assets','icon.png');
  for(const size of [16,32,128,256,512])for(const density of [1,2]){
    const target=path.join(iconset,`icon_${size}x${size}${density===2?'@2x':''}.png`),pixels=String(size*density);
    run('/usr/bin/sips',['-z',pixels,pixels,source,'--out',target]);
  }
  run('/usr/bin/iconutil',['-c','icns',iconset,'-o',destination]);fs.rmSync(iconset,{recursive:true});
}
function prepareMacRuntime(){
  if(process.platform!=='darwin')throw Error('macOS runtime requested on another platform');
  const electron=require('electron'),original=path.resolve(electron,'../../..');
  const fingerprint=createHash('sha256').update(fs.readFileSync(__filename)).update(fs.readFileSync(path.join(root,'assets','icon.png')))
    .update(JSON.stringify({root,name:metadata.productName,version:metadata.version,electron:require('electron/package.json').version})).digest('hex').slice(0,16);
  const directory=path.join(root,'build','dev',fingerprint),bundle=path.join(directory,metadata.productName+'.app');
  const executable=path.join(bundle,'Contents','MacOS',metadata.productName);
  if(fs.existsSync(path.join(directory,'ready.json'))&&fs.existsSync(executable))return executable;
  fs.mkdirSync(path.dirname(directory),{recursive:true});
  const staging=fs.mkdtempSync(path.join(path.dirname(directory),'.prepare-'));
  try{
    const stagedBundle=path.join(staging,metadata.productName+'.app');
    fs.cpSync(original,stagedBundle,{recursive:true,dereference:false,verbatimSymlinks:true,mode:fs.constants.COPYFILE_FICLONE});
    const contents=path.join(stagedBundle,'Contents'),resources=path.join(contents,'Resources'),info=path.join(contents,'Info.plist');
    const identity=metadata.build.appId+'.dev',old=readPlist(info);
    fs.renameSync(path.join(contents,'MacOS',old.CFBundleExecutable),path.join(contents,'MacOS',metadata.productName));
    updatePlist(info,{CFBundleName:metadata.productName,CFBundleDisplayName:metadata.productName,CFBundleExecutable:metadata.productName,
      CFBundleIdentifier:identity,CFBundleIconFile:'app.icns',CFBundleShortVersionString:metadata.version,CFBundleVersion:metadata.version,
      LSApplicationCategoryType:metadata.build.mac.category,NSBluetoothAlwaysUsageDescription:metadata.build.mac.extendInfo.NSBluetoothAlwaysUsageDescription});
    // Electron locates subprocess bundles by the main bundle's CFBundleName.
    const frameworks=path.join(contents,'Frameworks');
    for(const helper of fs.readdirSync(frameworks).filter(name=>/^Electron Helper.*\.app$/.test(name))){
      const location=path.join(frameworks,helper),plist=path.join(location,'Contents','Info.plist'),previous=readPlist(plist);
      const name=helper.slice(0,-4).replace(/^Electron/,metadata.productName);
      const kind=helper.slice('Electron Helper'.length,-4).replace(/[^A-Za-z0-9]/g,'').toLowerCase();
      fs.renameSync(path.join(location,'Contents','MacOS',previous.CFBundleExecutable||helper.slice(0,-4)),path.join(location,'Contents','MacOS',name));
      updatePlist(plist,{CFBundleName:name,CFBundleDisplayName:name,CFBundleExecutable:name,CFBundleIdentifier:identity+'.helper'+(kind?'.'+kind:''),CFBundleShortVersionString:metadata.version,CFBundleVersion:metadata.version});
      fs.renameSync(location,path.join(frameworks,name+'.app'));
    }
    makeIcon(path.join(resources,'app.icns'),staging);
    fs.rmSync(path.join(resources,'default_app.asar'),{force:true});
    const app=path.join(resources,'app');fs.mkdirSync(app,{recursive:true});
    fs.writeFileSync(path.join(app,'package.json'),JSON.stringify({name:metadata.name,productName:metadata.productName,version:metadata.version,main:'main.cjs'}));
    fs.writeFileSync(path.join(app,'main.cjs'),`const path=require('node:path');\nconst root=${JSON.stringify(root)};\nprocess.env.ATOMIC_SOURCE_ROOT=root;\nconst entry=process.env.ATOMIC_DEV_ENTRY;\nif(entry&&!/^scripts\\/[a-z0-9-]+\\.cjs$/.test(entry))throw Error('Invalid development entry');\nrequire(path.join(root,entry||'electron/main.cjs'));\n`);
    // Local ad-hoc signing repairs the copied runtime's now-changed metadata.
    run('/usr/bin/codesign',['--force','--deep','--sign','-',stagedBundle]);
    fs.writeFileSync(path.join(staging,'ready.json'),JSON.stringify({fingerprint,root}));
    try{fs.renameSync(staging,directory);}catch(error){if(!fs.existsSync(path.join(directory,'ready.json')))throw error;}
    return executable;
  }finally{fs.rmSync(staging,{recursive:true,force:true});}
}
function getLaunchSpec({entry}={}){
  if(entry&&!/^scripts\/[a-z0-9-]+\.cjs$/.test(entry))throw Error('Invalid development entry');
  const environment={...process.env};delete environment.ELECTRON_RUN_AS_NODE;
  if(process.platform==='darwin'){
    environment.ATOMIC_DEV_ENTRY=entry||'';
    return {command:prepareMacRuntime(),args:[],cwd:root,env:environment};
  }
  return {command:require('electron'),args:[entry?path.join(root,entry):root],cwd:root,env:environment};
}
if(require.main===module){
  try{
    const spec=getLaunchSpec(),child=spawn(spec.command,[...spec.args,...process.argv.slice(2)],{cwd:spec.cwd,env:spec.env,stdio:'inherit'});
    child.on('error',error=>{console.error(error.message);process.exitCode=1;});
    child.on('close',code=>{process.exitCode=code??1;});
  }catch(error){console.error(error.message);process.exitCode=1;}
}
module.exports={getLaunchSpec,prepareMacRuntime};
