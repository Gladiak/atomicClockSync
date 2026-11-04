import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {normalizeWatchSpecs,normalizeWatchModel,compareWatchModel,officialManualURL} from '../src/watch-spec-data.mjs';
import {normalizeWatchDetails} from '../src/watch-collection-data.mjs';
const require=createRequire(import.meta.url),{parseWatchSpecs}=require('../electron/watch-specs.cjs'),{createWatchPhotoService}=require('../electron/watch-photos.cjs');
const model='GA-B2100C-9A',page='https://shockbase.org/watches/watch_dyn.php?model='+model+'&series=2100&subseries=GA-B2100';
// Representative public table structure, including ShockBase's omitted cell/row ends.
const row=(key,value)=>`<tr><td>${key}:<td>${value}</tr>`;
const manual='https://www.casio.com/content/dam/casio/global/support/manuals/watches/pdf/56/5689/qw5689_IT.pdf';
const html=`<div id="header2outer"><header2inner><div>${model}</b></div></header2inner></div><table>${row('Module','<a>5689</a>')}${row('Subseries','GA-B2100')}${row('Series','2100')}${row('Release','<a>May 2022</a><button>show details</button>')}${row('Band','resin')}${row('Glass','Mineral Glass')}${row('Weight','52 g')}${row('Size (HxWxT)','48,5 x 45.4 x 11.9 mm')}${row('Battery','ctl920')}${row('Battery Life','Rechargeable')}${row('Timekeeping','Analog / Digital')}<tr><td class="cellactive"><a>Bluetooth</a><td class="cellinactive">Multi Band / <br>Wave Ceptor<td class="cellactive"><a>Tough Solar</a></tr><tr><td class="cellactive"><a>Water Resistance:<br>200m</a><td class="cellinactive"><a>GPS</a><td class="cellinactive"><a>Multi Stop Watch</a></tr><tr><td class="cellactive">Cities: 38/+300<td class="cellactive">Time Zones: 38<td class="cellactive">Alarms: 5</tr></table><a href="${manual}">IT</a><a href="${manual.replaceAll('5689','5713')}">wrong module</a><a href="https://evil.test/qw5689_EN.pdf">bad</a>`;

test('model identity distinguishes exact, regional, family, colour, edition and module',()=>{
 assert.equal(normalizeWatchModel('Casio G-Shock ga – b2100c – 9a / 5689'),'GA-B2100C-9A');
 for(const [input,status]of [[model,'exact'],[model+'ER','regional'],[model+'JF','regional'],['GA-B2100','family'],['GA-B2100C','family'],['GA-B2100C-1A','mismatch'],['GA-B2100C-9A1','mismatch'],['GW-B2100C-9A','mismatch'],[model+'_Special','mismatch'],[model+'/5713','module'],['','missing'],['<script>','invalid']]){
  const match=compareWatchModel(input,model,'GA-B2100',['5689']);assert.equal(match.status,status,input);assert.equal(match.compatible,['exact','regional'].includes(status),input);
 }
 assert.equal(compareWatchModel(model+'/5689',model,'GA-B2100',['5689']).compatible,true);
 assert.equal(compareWatchModel('DW-5600E-1_Atmos','DW-5600E-1_ATMOS').status,'exact');
});
test('public catalogue table normalizes dimensions, material, identity and tri-state features',async()=>{
 const sheet=await parseWatchSpecs(html,page,model,1793750000000);
 assert.deepEqual(sheet.physical,{weightG:52,sizeMm:[48.5,45.4,11.9],waterResistanceM:200});
 assert.equal(sheet.materials.band,'Resin');assert.equal(sheet.display.timekeeping,'Analog-digital');assert.equal(sheet.features.bluetooth,true);assert.equal(sheet.features.radio,false);assert.equal(sheet.features.multiband6,false);assert.equal(sheet.features.gps,false);assert.equal(sheet.features.altimeter,null);assert.equal(sheet.features.toughSolar,true);
 assert.deepEqual(sheet.release,{year:2022,month:5});assert.deepEqual(sheet.power,{battery:'CTL920',rechargeable:true,batteryLifeYears:null});assert.deepEqual(sheet.manuals,[{language:'it',url:manual}]);assert.deepEqual(sheet.functions,{worldTimeCities:'38/+300',timeZones:38,alarms:5});
 const details=normalizeWatchDetails({specs:sheet,note:'Personal note',acquiredAt:'2026-01-01'});assert.deepEqual(details.specs,sheet);assert.deepEqual(normalizeWatchDetails(details),details);
});
test('catalogue response identity cannot be adopted when page heading, URL or subseries differ',async()=>{
 for(const [body,url,expected] of [[html.replace(model,'GW-9500-1'),page,model],[html,page.replace('9A','1A'),model],[html,page,'DW-5600-1'],[html.replace('GA-B2100</tr>','GW-9500</tr>'),page,model]])await assert.rejects(parseWatchSpecs(body,url,expected),/identity/);
 await assert.rejects(parseWatchSpecs(`<div id="header2outer"><header2inner>${model}</header2inner></div>`,page,model),/schema/);
});
test('missing and invalid values remain unknown, never zero or invented absence',async()=>{
 const sheet=await parseWatchSpecs(html.replace('52 g','Unknown').replace('48,5 x 45.4 x 11.9 mm','999 x 45 x 11 mm').replace('Rechargeable','2 years'),page,model);
 const invalidLife=await parseWatchSpecs(html.replace('Rechargeable','999 years').replace('May 2022','May 1800'),page,model);assert.equal(invalidLife.power.batteryLifeYears,null);assert.ok(invalidLife.warnings.includes('batteryLife'));assert.equal(invalidLife.release,null);assert.ok(invalidLife.warnings.includes('release'));
 assert.equal(sheet.physical.weightG,null);assert.equal(sheet.physical.sizeMm,null);assert.ok(sheet.warnings.includes('size'));assert.equal(sheet.power.batteryLifeYears,2);assert.equal(sheet.power.rechargeable,false);
 const normalized=normalizeWatchSpecs({...sheet,physical:{weightG:'52',sizeMm:[48,45,Infinity],waterResistanceM:-1},features:{bluetooth:'yes',gps:0},functions:{alarms:'5',timeZones:Infinity},manuals:[{language:'en',url:manual.replaceAll('5689','5713')}]});
 assert.deepEqual(normalized.physical,{weightG:null,sizeMm:null,waterResistanceM:null});assert.equal(normalized.features.bluetooth,null);assert.equal(normalized.features.gps,null);assert.equal(normalized.functions.alarms,null);assert.deepEqual(normalized.manuals,[]);
 for(const value of [{...sheet,source:{...sheet.source,url:'https://evil.test/'}},{...sheet,model:'GW-9500-1'},{...sheet,source:{...sheet.source,retrievedAt:'today'}}])assert.equal(normalizeWatchSpecs(value),null);
 for(const url of ['http://www.casio.com/manuals/qw5689.pdf','https://www.casio.com.evil.test/manuals/qw5689.pdf','https://www.casio.com/manuals/qw5689.pdf?next=evil','https://www.casio.com/manuals/qw5689.html'])assert.equal(officialManualURL(url),null);
});
test('spec service checks chosen model, caches documents and explicitly refreshes imports',async()=>{
 let pages=0;
 const service=createWatchPhotoService({fetch:async url=>{if(url.includes('/search.php'))return new Response(`<a href="${page}"><img src="/pics2/2100/GA-B2100/GA-B2100C-9A_small.webp"></a>`);pages++;return new Response(html);}});
 const [candidate]=await service.search(model);assert.equal(candidate.family,'GA-B2100');
 const exact=await service.specs(candidate.id,model);assert.equal(exact.validation.status,'exact');assert.equal(pages,1);
 const mismatch=await service.specs(candidate.id,'GA-B2100C-1A');assert.equal(mismatch.validation.compatible,false);assert.equal(pages,1);
 await service.specs(candidate.id,model,true);assert.equal(pages,2);
 await assert.rejects(service.specs('bad',model),/selection/);
});
