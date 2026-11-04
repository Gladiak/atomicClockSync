const {siteURL}=require('./watch-photos.cjs');
function decode(value){return value.replace(/&(?:amp|lt|gt|quot|apos|nbsp);|&#(?:x[0-9a-f]+|\d+);/gi,token=>{
 const named={'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&nbsp;':' '};if(named[token.toLowerCase()])return named[token.toLowerCase()];
 const number=token[2].toLowerCase()==='x'?parseInt(token.slice(3,-1),16):Number(token.slice(2,-1));return number>0&&number<=0x10ffff?String.fromCodePoint(number):'';
});}
function plain(value){return decode(value.replace(/<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim();}
function attr(value,name){return decode(value.match(new RegExp('\\b'+name+'\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))','i'))?.slice(1).find(v=>v!==undefined)||'');}
function cells(html){
 // Starting a new cell or row also closes an omitted </td> in older pages.
 const result=[];let current=null;
 for(const token of html.replace(/<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>/gi,'').matchAll(/<\/?(?:td|th|tr)\b[^>]*>|[^<]+|<(?!\/?(?:td|th|tr)\b)[^>]*>/gi)){
  const raw=token[0];if(/^<\/?(?:td|th|tr)\b/i.test(raw)){
   if(current){result.push({...current,text:plain(current.html)});current=null;}
   if(/^<td\b/i.test(raw))current={attributes:raw,html:''};
  }else if(current)current.html+=raw;
 }
 if(current)result.push({...current,text:plain(current.html)});return result;
}
const featureNames={
 'bluetooth':'bluetooth','multi band 6':'multiband6','tough solar':'toughSolar','solar':'solar',
 'altimeter':'altimeter','barometer':'barometer','compass':'compass','thermometer':'thermometer','gps':'gps','depth meter':'depthMeter','heart rate monitor':'heartRate','step tracker':'stepTracker',
 'world time':'worldTime','moon graph':'moonGraph','tide graph':'tideGraph','sunrise sunset':'sunriseSunset','auto-back light':'autoLight','vibration':'vibration','multi date format':'multiDate','multi language week day':'multiWeekday',
 'carbon core guard':'carbonCoreGuard','mud resistance':'mudResistance','low temperature resistance':'lowTemperature','magnetic resistance':'magneticResistance','tough mvt':'toughMovement','dlc':'dlc','screw back':'screwBack','alpha gel / vibration resistance':'alphaGel'
};
const months=['january','february','march','april','may','june','july','august','september','october','november','december'];
async function parseWatchSpecs(html,pageURL,expectedModel,retrievedAt=Date.now()){
 const {normalizeWatchModel,normalizeWatchSpecs,officialManualURL}=await import('../src/watch-spec-data.mjs');
 const url=siteURL(pageURL);if(url.pathname!=='/watches/watch_dyn.php')throw Error('source');
 const heading=html.match(/<div\b[^>]*\bid=["']header2outer["'][^>]*>([\s\S]*?)<\/header2inner\s*>/i)?.[1];
 const model=normalizeWatchModel(plain(heading||'')),expected=normalizeWatchModel(expectedModel);
 if(!model||model!==expected||model!==normalizeWatchModel(url.searchParams.get('model')))throw Error('identity');
 const entries=cells(html),values=new Map();for(let i=0;i<entries.length-1;i++)if(entries[i].text.endsWith(':'))values.set(entries[i].text.replace(/:$/,'').toLowerCase(),entries[i+1].text);
 const get=key=>values.get(key.toLowerCase())||null;
 if(get('subseries')&&url.searchParams.get('subseries')&&normalizeWatchModel(get('subseries'))!==normalizeWatchModel(url.searchParams.get('subseries')))throw Error('identity');
 const features={},functions={worldTimeCities:null,timeZones:null,alarms:null};let water=null;
 for(const cell of entries){
  const classes=attr(cell.attributes,'class').split(/\s+/),active=classes.includes('cellactive'),inactive=classes.includes('cellinactive');if(!active&&!inactive)continue;
  const state=active&&!inactive?true:inactive&&!active?false:null;
  const firstLink=cell.html.match(/<a\b[^>]*>([\s\S]*?)<\/a>/i)?.[1],name=plain(firstLink||cell.html).toLowerCase();
  if(featureNames[name])features[featureNames[name]]=state;
  if(/^multi band\b/.test(name)){features.radio=state;if(name==='multi band 6')features.multiband6=state;}
  if(name==='tough solar'||name==='solar')features.solar=state;
  if(/^water resistance\s*:/.test(name)&&state===true)water=Number(name.match(/([\d.,]+)\s*m\b/)?.[1]?.replace(',','.'))||null;
  if(active){const cities=cell.text.match(/^Cities:\s*(.+)$/i),zones=cell.text.match(/^Time Zones:\s*(\d+)$/i),alarms=cell.text.match(/^Alarms:\s*(\d+)$/i);if(cities)functions.worldTimeCities=cities[1];if(zones)functions.timeZones=Number(zones[1]);if(alarms)functions.alarms=Number(alarms[1]);}
 }
 if(features.radio===false&&features.multiband6===undefined)features.multiband6=false;
 if(features.solar===false&&features.toughSolar===undefined)features.toughSolar=false;
 const warnings=[];
 function measured(value,regex,key){if(!value||/^(?:unknown|none|n\/a|[-–—]+)$/i.test(value))return null;const match=value.match(regex);if(!match){warnings.push(key);return null;}return Number(match[1].replace(',','.'));}
 const weight=measured(get('weight'),/^([\d.,]+)\s*g$/i,'weight'),dimension=get('size (hxwxt)'),size=dimension?.match(/^([\d.,]+)\s*[x×]\s*([\d.,]+)\s*[x×]\s*([\d.,]+)\s*mm$/i);
 if(dimension&&!size&&!/^unknown$/i.test(dimension))warnings.push('size');
 const release=get('release'),date=release?.match(/\b([A-Za-z]+)\s+(\d{4})\b/),month=date?months.indexOf(date[1].toLowerCase())+1:0;
 if(release&&!month&&!/^unknown$/i.test(release))warnings.push('release');
 const life=get('battery life'),rechargeable=/rechargeable/i.test(life||'')?true:/^\d+(?:[.,]\d+)?\s*years?$/i.test(life||'')?false:null;
 if(life&&rechargeable===null&&!/^(?:unknown|none|n\/a|[-–—]+)$/i.test(life))warnings.push('batteryLife');
 const years=rechargeable===false?measured(life,/^([\d.,]+)\s*years?$/i,'batteryLife'):null;
 const modules=[...new Set((get('module')||'').match(/\b\d{3,5}\b/g)||[])];
 const manuals=[];
 for(const anchor of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)){
  const href=officialManualURL(attr(anchor[1],'href'));if(!href)continue;
  // A manual for another module must never be attached through a related-model slider.
  const token=new URL(href).pathname.match(/\bqw(\d{3,5})(?:_|\.)/i)?.[1];if(!token||!modules.includes(token))continue;
  const language=href.match(/_([A-Z]{2})\.pdf$/i)?.[1]?.toLowerCase();const mapped={jp:'ja',cn:'zh',tw:'zh'}[language]||language||(new URL(href).hostname==='support.casio.jp'?'ja':null);
  if(mapped)manuals.push({language:mapped,url:href});
 }
 if(!Object.keys(features).length)warnings.push('features');
 const result=normalizeWatchSpecs({version:1,model,subseries:get('subseries'),series:get('series'),moduleIds:modules,nickname:get('nickname'),release:month?{year:Number(date[2]),month}:null,
 edition:{collection:get('collection'),special:get('special edition'),limited:/^yes$/i.test(get('limited edition'))?true:/^no$/i.test(get('limited edition'))?false:null},
 materials:{band:get('band'),bezel:get('bezel'),glass:get('glass')},colors:{band:get('color band'),bezel:get('color bezel'),face:get('color watchface'),display:get('color display')},
 display:{timekeeping:get('timekeeping'),polarity:get('display'),lcd:get('lcd type'),light:get('light type')},power:{battery:get('battery'),rechargeable,batteryLifeYears:years},physical:{weightG:weight,sizeMm:size?size.slice(1).map(v=>Number(v.replace(',','.'))):null,waterResistanceM:water},
 features,functions,manuals,source:{provider:'shockbase',url:url.href,retrievedAt},warnings});
 if(!result||(!modules.length&&![get('weight'),get('battery'),get('glass')].some(Boolean)))throw Error('schema');
 if(years!==null&&result.power.batteryLifeYears===null)result.warnings.push('batteryLife');if(month&&result.release===null)result.warnings.push('release');
 if(weight!==null&&result.physical.weightG===null)result.warnings.push('weight');if(size&&result.physical.sizeMm===null)result.warnings.push('size');if(water!==null&&result.physical.waterResistanceM===null)result.warnings.push('water');
 return result;
}
module.exports={parseWatchSpecs,cells};
