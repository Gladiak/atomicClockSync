import {SPEC_FEATURES,compareWatchModel} from './watch-spec-data.mjs';
import {t,dateTimeFormat,numberFormat,getLanguage} from './i18n.mjs';
export const modelMessages={exact:'Exact model match.',regional:'Equivalent regional suffix. The entered code is preserved.',family:'Only the family matches. Choose the exact colour variant.',mismatch:'Different model or colour variant. Check the code on your watch.',module:'The module number differs from the catalogue.',missing:'Enter the exact model before importing.',invalid:'The model code is not valid.'};
const node=(tag,cls,text,parent)=>{const el=document.createElement(tag);el.className=cls;if(text!=null)el.textContent=text;parent?.append(el);return el;};
export function modelCheck(input,specs){return compareWatchModel(input,specs.model,specs.subseries,specs.moduleIds);}
export function renderWatchSpecs(parent,specs,desktop){
 parent.replaceChildren();
 if(!specs){node('p','muted-text',t('Import a model sheet from ShockBase. It stays available offline after saving.'),parent);return;}
 const unknown=t('Not available'),nf=numberFormat({maximumFractionDigits:2});
 const val=v=>v===null||v===undefined?unknown:typeof v==='number'?nf.format(v):t(v);
 const yes=v=>v===true?t('Present'):v===false?t('Absent'):unknown;
 const section=(title,items)=>{const box=node('section','spec-section',null,parent);node('h3','',t(title),box);const dl=node('dl','spec-facts',null,box);for(const [label,value]of items){node('dt','',t(label),dl);node('dd','',value,dl);}};
 const top=node('div','spec-identity',null,parent);node('strong','',specs.model,top);if(specs.nickname)node('span','muted-text',specs.nickname,top);
 const highlights=node('div','spec-highlights',null,parent);
 for(const [label,value]of [['Weight',specs.physical.weightG===null?unknown:nf.format(specs.physical.weightG)+' g'],['Dimensions · H × W × T',specs.physical.sizeMm?specs.physical.sizeMm.map(n=>nf.format(n)).join(' × ')+' mm':unknown],['Water resistance',specs.physical.waterResistanceM===null?unknown:nf.format(specs.physical.waterResistanceM)+' m']]){const item=node('div','',null,highlights);node('span','tiny-label',t(label),item);node('strong','',value,item);}
 const release=specs.release?(specs.release.month?dateTimeFormat({month:'long',year:'numeric',timeZone:'UTC'}).format(Date.UTC(specs.release.year,specs.release.month-1,1)):String(specs.release.year)):unknown;
 section('Identity',[['Catalogue family',val(specs.subseries)],['Series',val(specs.series)],['Module',specs.moduleIds.join(' / ')||unknown],['Release',release],['Collection',val(specs.edition.collection)],['Special edition',val(specs.edition.special)],['Limited edition',yes(specs.edition.limited)]]);
 section('Materials & display',[['Band',val(specs.materials.band)],['Bezel',val(specs.materials.bezel)],['Glass',val(specs.materials.glass)],['Timekeeping',val(specs.display.timekeeping)],['Display polarity',val(specs.display.polarity)],['LCD type',val(specs.display.lcd)],['Light',val(specs.display.light)]]);
 section('Colours',[['Band',val(specs.colors.band)],['Bezel',val(specs.colors.bezel)],['Watch face',val(specs.colors.face)],['Display',val(specs.colors.display)]]);
 section('Power & functions',[['Battery',val(specs.power.battery)],['Rechargeable',yes(specs.power.rechargeable)],['Nominal battery life',specs.power.batteryLifeYears===null?unknown:t('{0} years',nf.format(specs.power.batteryLifeYears))],['World Time cities',val(specs.functions.worldTimeCities)],['Time zones',val(specs.functions.timeZones)],['Alarms',val(specs.functions.alarms)]]);
 const features=node('div','spec-features',null,parent);
 for(const group of [...new Set(SPEC_FEATURES.map(f=>f.group))]){const box=node('section','spec-section',null,features);node('h3','',t(group),box);const dl=node('dl','spec-facts',null,box);for(const feature of SPEC_FEATURES.filter(f=>f.group===group)){node('dt','',t(feature.label),dl);const state=specs.features[feature.key];node('dd','spec-state '+(state===true?'is-present':state===false?'is-absent':'is-unknown'),yes(state),dl);}}
 node('p','muted-text',t('Catalogue capabilities do not confirm Bluetooth compatibility with this app.'),parent);
 if(specs.warnings.length)node('p','spec-warning',t('Some source values could not be validated and are shown as unavailable.'),parent);
 if(specs.manuals.length){const manuals=node('div','spec-manuals',null,parent);node('h3','',t('Official Casio manuals'),manuals);for(const manual of [...specs.manuals].sort((a,b)=>(b.language===getLanguage())-(a.language===getLanguage())||a.language.localeCompare(b.language))){const button=node('button','secondary-button',t('Manual · {0} ↗',manual.language.toUpperCase()),manuals);button.type='button';button.onclick=()=>desktop.openWatchManual(manual.url);}}
 const source=node('div','spec-source',null,parent);const link=node('button','text-button',t('Source: ShockBase ↗'),source);link.type='button';link.onclick=()=>desktop.openWatchPhotoSource(specs.source.url);node('span','muted-text',t('Retrieved · {0}',dateTimeFormat({day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(specs.source.retrievedAt)),source);
}
