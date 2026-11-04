// One schema is shared by the catalogue importer, persisted profiles and UI.
export const SPEC_FEATURES = Object.freeze([
  ['bluetooth','Bluetooth','Connection'],['radio','Radio time reception','Connection'],['multiband6','Multiband 6','Connection'],
  ['solar','Solar power','Power'],['toughSolar','Tough Solar','Power'],
  ['altimeter','Altimeter','Sensors'],['barometer','Barometer','Sensors'],['compass','Compass','Sensors'],['thermometer','Thermometer','Sensors'],['gps','GPS','Sensors'],['depthMeter','Depth meter','Sensors'],['heartRate','Heart rate monitor','Sensors'],['stepTracker','Step tracker','Sensors'],
  ['worldTime','World Time','Functions'],['moonGraph','Moon graph','Functions'],['tideGraph','Tide graph','Functions'],['sunriseSunset','Sunrise and sunset','Functions'],['autoLight','Automatic light','Functions'],['vibration','Vibration alarm','Functions'],['multiDate','Multiple date formats','Functions'],['multiWeekday','Multiple weekday languages','Functions'],
  ['carbonCoreGuard','Carbon Core Guard','Protection'],['mudResistance','Mud resistance','Protection'],['lowTemperature','Low-temperature resistance','Protection'],['magneticResistance','Magnetic resistance','Protection'],['toughMovement','Tough Movement','Protection'],['dlc','DLC coating','Protection'],['screwBack','Screw back','Protection'],['alphaGel','Vibration resistance','Protection']
].map(([key,label,group])=>Object.freeze({key,label,group})));
const text=(value,max=120)=>typeof value==='string'?value.replace(/[\x00-\x1f\x7f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max):'';
const unknown=value=>!value||/^(?:unknown|no information|n\/a|none|[-–—]+)$/i.test(value);
export function catalogueValue(value){const clean=text(value);return unknown(clean)?null:clean;}
export function normalizeWatchModel(value){
  if(typeof value!=='string'||value.length>160)return '';
  const clean=value.normalize('NFKC').toUpperCase().replace(/[‐‑–—−]/g,'-').trim()
    .replace(/^(?:CASIO\s+)?G-?SHOCK\s+/,'').replace(/^CASIO\s+/,'').split(/\s*\/\s*/)[0].replace(/\s*-\s*/g,'-').replace(/\s+/g,'-');
  return clean.length<=80&&/^[A-Z0-9]+(?:[-_][A-Z0-9]+)*$/.test(clean)&&/\d/.test(clean)?clean:'';
}
function regionalBase(value){return value.split('-').length>=3?value.replace(/(?:ER|JF|JR|DR|CR|DF)$/,''):value;}
export function compareWatchModel(input,model,family='',moduleIds=[]){
  const entered=normalizeWatchModel(input),catalogue=normalizeWatchModel(model),base=normalizeWatchModel(family);
  let status='mismatch';
  if(!String(input??'').trim())status='missing';
  else if(!entered||!catalogue)status='invalid';
  else if(entered===catalogue)status='exact';
  else if(regionalBase(entered)===regionalBase(catalogue))status='regional';
  else if(entered.split('-').length===2&&!entered.includes('_')&&(catalogue.startsWith(entered+'-')||catalogue.startsWith(entered)&&base===entered))status='family';
  const module=typeof input==='string'?input.match(/\/\s*(\d{3,5})\s*$/)?.[1]:null;
  if(module&&['exact','regional','family'].includes(status)&&moduleIds.length&&!moduleIds.includes(module))status='module';
  return {status,entered,catalogue,family:base||null,compatible:['exact','regional'].includes(status)};
}
export function cataloguePageURL(value,model){
  try{const url=new URL(value);if(url.protocol!=='https:'||!['shockbase.org','www.shockbase.org'].includes(url.hostname)||url.port||url.username||url.password||url.pathname!=='/watches/watch_dyn.php'||normalizeWatchModel(url.searchParams.get('model'))!==normalizeWatchModel(model))return null;
    url.hostname='shockbase.org';url.hash='';return url.href;
  }catch{return null;}
}
export function officialManualURL(value){
  try{const url=new URL(value);if(url.protocol!=='https:'||url.port||url.username||url.password||url.search||url.hash)return null;
    if(!['www.casio.com','casio.com','support.casio.com','support.casio.jp','www.casio.co.jp'].includes(url.hostname))return null;
    if(!/^\/(?:content\/dam\/casio\/.*|storage\/pdf\/.*|storage\/manual\/.*|manuals\/.*)\.pdf$/i.test(url.pathname))return null;
    return url.href;
  }catch{return null;}
}
const canonical=new Map(Object.entries({
 'resin':'Resin','bio-based resin':'Bio-based resin','bio based resin':'Bio-based resin','bio-resin':'Bio-based resin',
 'metal':'Metal','stainless steel':'Stainless steel','titanium':'Titanium','carbon':'Carbon','carbon fiber':'Carbon fibre','fabric':'Fabric','cloth':'Fabric','leather':'Leather','composite':'Composite',
 'mineral glass':'Mineral glass','sapphire glass':'Sapphire glass','mineral':'Mineral glass','sapphire':'Sapphire glass',
 'analog / digital':'Analog-digital','analog/digital':'Analog-digital','analog-digital':'Analog-digital','analogue / digital':'Analog-digital','analog':'Analog','analogue':'Analog','digital':'Digital',
 'positive':'Positive','negative':'Negative','lcd':'LCD','stn':'STN LCD','stn lcd':'STN LCD','mip':'MIP LCD','mip lcd':'MIP LCD','dual layer lcd':'Dual-layer LCD','dual-layer lcd':'Dual-layer LCD',
 'electro luminescence (el)':'Electroluminescent (EL)','electroluminescence':'Electroluminescent (EL)','led':'LED','super illuminator':'Super Illuminator',
 'black':'Black','white':'White','yellow':'Yellow','red':'Red','green':'Green','blue':'Blue','silver':'Silver','gold':'Gold','gray':'Grey','grey':'Grey','orange':'Orange','pink':'Pink','purple':'Purple','brown':'Brown','beige':'Beige','transparent':'Transparent','clear':'Transparent','multicolor':'Multicolour','multi color':'Multicolour'
}));
export function normalizeCatalogueValue(value){const clean=catalogueValue(value);if(!clean)return null;return canonical.get(clean.toLowerCase())||clean;}
const number=(value,min,max)=>typeof value==='number'&&Number.isFinite(value)&&value>=min&&value<=max?value:null;
const integer=(value,min,max)=>Number.isInteger(value)?number(value,min,max):null;
const bool=value=>typeof value==='boolean'?value:null;
const group=(value,keys)=>Object.fromEntries(keys.map(key=>[key,normalizeCatalogueValue(value?.[key])]));
export function normalizeWatchSpecs(value){
  if(value?.version!==1)return null;
  const model=normalizeWatchModel(value.model),url=cataloguePageURL(value.source?.url,model),retrievedAt=number(value.source?.retrievedAt,0,Date.UTC(2101,0,1));
  if(!model||!url||retrievedAt===null||value.source?.provider!=='shockbase')return null;
  const modules=[...new Set((Array.isArray(value.moduleIds)?value.moduleIds:[]).filter(id=>typeof id==='string'&&/^\d{3,5}$/.test(id)))].slice(0,6);
  const features=Object.fromEntries(SPEC_FEATURES.map(({key})=>[key,bool(value.features?.[key])]));
  const size=Array.isArray(value.physical?.sizeMm)&&value.physical.sizeMm.length===3?value.physical.sizeMm:null;
  const validSize=size&&number(size[0],10,150)!==null&&number(size[1],10,150)!==null&&number(size[2],1,60)!==null;
  const year=integer(value.release?.year,1900,2100),month=integer(value.release?.month,1,12);
  const manuals=[];for(const manual of Array.isArray(value.manuals)?value.manuals:[]){const href=officialManualURL(manual?.url);if(href&&modules.includes(new URL(href).pathname.match(/\bqw(\d{3,5})(?:_|\.)/i)?.[1])&&/^(en|it|fr|de|es|ja|zh|ko|pt|ru|th|vi)$/.test(manual.language)&&!manuals.some(item=>item.language===manual.language))manuals.push({language:manual.language,url:href});}
  const life=number(value.power?.batteryLifeYears,.1,30),rechargeable=bool(value.power?.rechargeable);
  const battery=catalogueValue(value.power?.battery)?.toUpperCase();
  const cities=catalogueValue(value.functions?.worldTimeCities);
  return {version:1,model,subseries:normalizeWatchModel(value.subseries)||null,series:/^\d{1,6}$/.test(value.series)?value.series:null,moduleIds:modules,nickname:catalogueValue(value.nickname),
    release:year===null?null:{year,month},edition:{collection:catalogueValue(value.edition?.collection),special:catalogueValue(value.edition?.special),limited:bool(value.edition?.limited)},
    materials:group(value.materials,['band','bezel','glass']),colors:group(value.colors,['band','bezel','face','display']),display:group(value.display,['timekeeping','polarity','lcd','light']),
    power:{battery:battery&&/^[A-Z0-9+ /().-]{2,50}$/.test(battery)?battery:null,rechargeable,batteryLifeYears:rechargeable===true?null:life},
    physical:{weightG:number(value.physical?.weightG,1,1500),sizeMm:validSize?size.map(v=>Math.round(v*100)/100):null,waterResistanceM:number(value.physical?.waterResistanceM,1,2000)},features,
    functions:{worldTimeCities:cities&&/^\d{1,4}(?:\s*\/\s*\+?\d{1,4})?$/.test(cities)?cities.replace(/\s/g,''):null,timeZones:integer(value.functions?.timeZones,0,100),alarms:integer(value.functions?.alarms,0,20)},
    manuals,source:{provider:'shockbase',url,retrievedAt},warnings:[...new Set((Array.isArray(value.warnings)?value.warnings:[]).filter(key=>['weight','size','water','batteryLife','release','features'].includes(key)))].slice(0,6)};
}
