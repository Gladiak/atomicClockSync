import {normalizeWatchModel,normalizeWatchSpecs,compareWatchModel} from './watch-spec-data.mjs';
import {compactWatchPhoto,normalizeWatchDetails} from './watch-collection-data.mjs';
import {photoDataBlob} from './watch-photo-frame.mjs';

export function catalogueFamilyMatches(family,candidate){
  const match=compareWatchModel(family,candidate.model,candidate.family);
  return match.compatible||match.status==='family';
}

// A variant is committed as a pair: never keep another colour's photo or sheet.
export async function loadCatalogueWatch(desktop,candidate,{module='',preparePhoto=compactWatchPhoto}={}){
  const model=normalizeWatchModel(candidate.model);
  if(!model)throw Error('identity');
  const responses=await Promise.allSettled([
    desktop.getWatchSpecs(candidate.id,model,true),desktop.getWatchPhoto(candidate.id,true)
  ]);
  const [sheet,image]=responses.map(result=>{if(result.status!=='fulfilled')throw Error('network');if(!result.value?.ok)throw Error(result.value?.code||'network');return result.value;});
  const specs=normalizeWatchSpecs(sheet.specs);
  if(!specs||specs.model!==model||normalizeWatchModel(sheet.model)!==model||normalizeWatchModel(image.model)!==model||
    (module&&specs.moduleIds.length&&!specs.moduleIds.includes(module)))throw Error('identity');
  const photo=await preparePhoto(photoDataBlob(image.dataURL));
  const details=normalizeWatchDetails({specs,photo,photoSource:{provider:'shockbase',model:image.model,pageURL:image.pageURL,imageURL:image.imageURL}});
  if(!details.photo||!details.photoSource)throw Error('image');
  return {model,details};
}
