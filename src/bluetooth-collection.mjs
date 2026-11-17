import {normalizeBluetoothLink,normalizeWatchDetails} from './watch-collection-data.mjs';
import {normalizePreferences} from './trials.mjs';
import {catalogueFamilyMatches,loadCatalogueWatch} from './watch-catalogue.mjs';

export function createBluetoothCollection({desktop,getProfiles,getSettings,putProfile,notify,preparePhoto,createId=()=>crypto.randomUUID()}){
  const jobs=new Set();
  return {async sent(watch,at){
    const link=normalizeBluetoothLink({...watch,lastSentAt:at});
    if(!link)return;
    const existing=getProfiles().find(profile=>profile.bluetooth?.key===link.key);
    const profile=existing?{...existing,bluetooth:link}:{id:createId(),name:link.model,model:link.model,
      homeCity:'',position:'',systemVolume:'',settings:normalizePreferences(getSettings()),lastSuccess:null,bluetooth:link,
      details:normalizeWatchDetails({variant:{family:link.model,status:'pending'}})};
    if(!putProfile(profile))return;
    if(existing?.details.variant?.status!=='pending'&&existing)return;
    if(jobs.has(profile.id))return;
    jobs.add(profile.id);
    if(!existing)notify('Watch added to your collection. Looking up photo and technical sheet…');
    try{
      const response=await desktop.searchWatchPhotos(link.model);
      if(!response?.ok)throw Error(response?.code||'network');
      // Preserve catalogue order. The first result is a suggestion, not a colour identification.
      const candidate=response.results.find(item=>catalogueFamilyMatches(link.model,item));
      if(!candidate)throw Error('model');
      const imported=await loadCatalogueWatch(desktop,candidate,{module:link.module,preparePhoto});
      const current=getProfiles().find(item=>item.id===profile.id);
      // Deleted watches and a newer manual choice must never be restored/overwritten.
      if(!current||current.model!==profile.model||current.details.variant?.status!=='pending')return;
      const updated={...current,model:imported.model,name:current.name===profile.model?imported.model:current.name,
        details:normalizeWatchDetails({...current.details,...imported.details,note:current.details.note,acquiredAt:current.details.acquiredAt,
          variant:{family:link.model,status:'automatic'}})};
      if(putProfile(updated))notify('Photo and technical sheet saved. Review the automatic variant in your collection.');
    }catch{
      if(getProfiles().some(item=>item.id===profile.id&&item.details.variant?.status==='pending'))
        notify('Watch saved. Catalogue unavailable: choose a variant from your collection to complete it.');
    }finally{jobs.delete(profile.id);}
  }};
}
