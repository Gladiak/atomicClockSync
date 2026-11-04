// Only public ShockBase search pages and product pictures are reachable here.
// No web page scripts or arbitrary renderer-supplied URLs are executed.
const ORIGIN='https://shockbase.org';
const HOSTS=new Set(['shockbase.org','www.shockbase.org']);
function siteURL(value,base=ORIGIN){
  const url=new URL(value,base);
  if(url.protocol!=='https:'||!HOSTS.has(url.hostname)||url.port||url.username||url.password)throw Error('source');
  url.hostname='shockbase.org';url.hash='';return url;
}
function modelQuery(value){
  if(typeof value!=='string'||value.length>100)throw Error('model');
  let query=value.normalize('NFKC').toUpperCase().replace(/[‐‑–—−]/g,'-').trim().replace(/^(?:CASIO\s+)?G-?SHOCK\s+/,'').replace(/^CASIO\s+/,'');
  query=query.split(/\s*\/\s*/)[0].trim().replace(/\s*-\s*/g,'-').replace(/\s+/g,'-');
  if(!/^[A-Z0-9]+(?:[-_][A-Z0-9]+)*$/.test(query)||query.length<3||query.length>80)throw Error('model');
  return query;
}
function entities(value){return value.replace(/&amp;|&#0*38;|&#x0*26;/gi,'&').replace(/&quot;|&#0*34;/gi,'"').replace(/&#0*39;|&apos;/gi,"'");}
function attribute(tag,name){return entities(tag.match(new RegExp('\\b'+name+'\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))','i'))?.slice(1).find(value=>value!==undefined)||'');}
function pictureURL(value,base){const url=siteURL(value,base);if(!/^\/pics2\/[A-Za-z0-9_/% .-]+\.(?:png|jpe?g|webp)$/i.test(url.pathname)||url.search)throw Error('source');return url.href;}
function parseSearch(html,query,base=ORIGIN+'/search.php'){
  const results=new Map();
  for(const match of html.matchAll(/<a\b([^>]+)>([\s\S]*?)<\/a\s*>/gi)){
    try{
      const page=siteURL(attribute(match[1],'href'),base);
      if(page.pathname!=='/watches/watch_dyn.php')continue;
      const model=page.searchParams.get('model');
      if(!model||model.length>80||!model.toUpperCase().includes(query))continue;
      const img=match[2].match(/<img\b[^>]*>/i)?.[0];if(!img)continue;
      const thumbnail=pictureURL(attribute(img,'src'),base);
      const clean=new URL('/watches/watch_dyn.php',ORIGIN);
      for(const key of ['model','series','subseries']){const value=page.searchParams.get(key);if(value)clean.searchParams.set(key,value);}
      results.set(model,{model,pageURL:clean.href,thumbnailURL:thumbnail});
    }catch{/* Ignore navigation, outside hosts and malformed markup. */}
  }
  return [...results.values()].sort((a,b)=>Number(b.model.toUpperCase()===query)-Number(a.model.toUpperCase()===query)||a.model.localeCompare(b.model)).slice(0,80);
}
function parseProductImage(html,pageURL,model,original=true){
  // The main front picture links to the original, before back/side galleries.
  for(const match of (original?html.matchAll(/<a\b([^>]+)>([\s\S]*?)<\/a\s*>/gi):[])){
    if(!/<img\b/i.test(match[2]))continue;
    try{const url=pictureURL(attribute(match[1],'href'),pageURL);const name=decodeURIComponent(new URL(url).pathname.split('/').at(-1)).replace(/\.(?:png|jpe?g|webp)$/i,'');if(name.toUpperCase()===model.toUpperCase())return url;}catch{}
  }
  for(const tag of html.matchAll(/<meta\b[^>]*>/gi))if(attribute(tag[0],'property').toLowerCase()==='og:image'){
    try{const url=pictureURL(attribute(tag[0],'content'),pageURL),name=decodeURIComponent(new URL(url).pathname.split('/').at(-1)).replace(/_medium\.(?:png|jpe?g|webp)$/i,'');if(name.toUpperCase()===model.toUpperCase())return url;}catch{}
  }
  throw Error('image');
}
function imageType(buffer){
  if(buffer.length>=8&&buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'image/png';
  if(buffer.length>=3&&buffer[0]===255&&buffer[1]===216&&buffer[2]===255)return 'image/jpeg';
  if(buffer.length>=12&&buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP')return 'image/webp';
  throw Error('image');
}
function createWatchPhotoService({fetch:fetcher=globalThis.fetch}={}){
  const candidates=new Map(),searches=new Map(),cache=new Map(),pending=new Map(),documents=new Map(),documentJobs=new Map();
  let counter=0,active=0,cacheBytes=0;const queue=[];
  async function pooled(fn){if(active>=3)await new Promise(resolve=>queue.push(resolve));active++;try{return await fn();}finally{active--;queue.shift()?.();}}
  async function request(value,maxBytes){
    let url=siteURL(value);
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
    try{
      for(let hop=0;hop<4;hop++){
        const response=await fetcher(url.href,{redirect:'manual',signal:controller.signal,headers:{'User-Agent':'AtomicClockSync/1.11 (user-requested watch catalogue lookup)','Accept':'text/html,image/png,image/jpeg,image/webp'}});
        if(response.status>=300&&response.status<400){const location=response.headers.get('location');await response.body?.cancel();if(!location)throw Error('network');url=siteURL(location,url);if(!['/search.php','/watches/watch_dyn.php'].includes(url.pathname)&&!url.pathname.startsWith('/pics2/'))throw Error('source');continue;}
        if(!response.ok)throw Error(response.status===429?'rate':'network');
        if(Number(response.headers.get('content-length'))>maxBytes){await response.body?.cancel();throw Error('size');}
        const reader=response.body.getReader(),chunks=[];let size=0;
        try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>maxBytes){await reader.cancel();throw Error('size');}chunks.push(Buffer.from(value));}}finally{reader.releaseLock();}
        return {buffer:Buffer.concat(chunks),url:url.href};
      }
      throw Error('network');
    }catch(error){if(['source','size','rate','image'].includes(error.message))throw error;throw Error('network');}
    finally{clearTimeout(timeout);}
  }
  async function search(value){
    const query=modelQuery(value),saved=searches.get(query);if(saved&&Date.now()-saved.at<15*60000)return saved.results;
    const page=await request(ORIGIN+'/search.php?search='+encodeURIComponent(query),2*1024*1024);
    let found=parseSearch(page.buffer.toString('utf8'),query,page.url);
    if(!found.length&&/(?:ER|JF|JR|DR|CR|DF)$/.test(query)){
      const shorter=query.slice(0,-2),fallback=await request(ORIGIN+'/search.php?search='+encodeURIComponent(shorter),2*1024*1024);
      found=parseSearch(fallback.buffer.toString('utf8'),shorter,fallback.url);
    }
    const results=found.map(item=>{const id=String(++counter);candidates.set(id,item);return{id,model:item.model,pageURL:item.pageURL,family:new URL(item.pageURL).searchParams.get('subseries')||''};});
    searches.set(query,{at:Date.now(),results});if(searches.size>20)searches.delete(searches.keys().next().value);
    // Search entries retain candidates for the whole app session; cap long sessions.
    if(candidates.size>2000){const keep=new Set([...searches.values()].flatMap(item=>item.results.map(result=>result.id)));for(const id of candidates.keys())if(!keep.has(id))candidates.delete(id);}
    return results;
  }
  async function document(candidate,refresh=false){
    const key=candidate.pageURL,saved=documents.get(key);
    if(!refresh&&saved&&Date.now()-saved.at<5*60000)return saved;
    if(documentJobs.has(key))return documentJobs.get(key);
    const job=request(key,2*1024*1024).then(page=>{
      const value={html:page.buffer.toString('utf8'),url:page.url,at:Date.now()};documents.set(key,value);
      while(documents.size>8)documents.delete(documents.keys().next().value);return value;
    }).finally(()=>documentJobs.delete(key));documentJobs.set(key,job);return job;
  }
  async function specs(id,input,refresh=false){
    if(typeof id!=='string'||!candidates.has(id))throw Error('selection');
    if(typeof input!=='string'||input.length>160||typeof refresh!=='boolean')throw Error('model');
    return pooled(async()=>{
      const candidate=candidates.get(id),page=await document(candidate,refresh);
      const {parseWatchSpecs}=require('./watch-specs.cjs'),{compareWatchModel}=await import('../src/watch-spec-data.mjs');
      const sheet=await parseWatchSpecs(page.html,page.url,candidate.model,page.at);
      return {model:sheet.model,family:sheet.subseries,pageURL:sheet.source.url,specs:sheet,validation:compareWatchModel(input,sheet.model,sheet.subseries,sheet.moduleIds)};
    });
  }
  async function photo(id,full=false){
    if(typeof id!=='string'||!candidates.has(id))throw Error('selection');
    const key=id+':'+Boolean(full);if(cache.has(key))return cache.get(key);if(pending.has(key))return pending.get(key);
    const job=pooled(async()=>{
      const candidate=candidates.get(id);let url=candidate.thumbnailURL,html='',pageURL='';
      if(full){const page=await document(candidate);html=page.html;pageURL=page.url;url=parseProductImage(html,pageURL,candidate.model);}
      let data;
      try{data=await request(url,full?8*1024*1024:1024*1024);}
      catch(error){
        if(!full||!['network','size'].includes(error.message))throw error;
        const fallback=parseProductImage(html,pageURL,candidate.model,false);if(fallback===url)throw error;
        url=fallback;data=await request(url,8*1024*1024);
      }
      const mime=imageType(data.buffer);
      const result={model:candidate.model,family:new URL(candidate.pageURL).searchParams.get('subseries')||'',pageURL:candidate.pageURL,imageURL:url,dataURL:`data:${mime};base64,${data.buffer.toString('base64')}`};
      cache.set(key,result);cacheBytes+=result.dataURL.length;while(cache.size>24||cacheBytes>32*1024*1024){const first=cache.keys().next().value;cacheBytes-=cache.get(first).dataURL.length;cache.delete(first);}return result;
    }).finally(()=>pending.delete(key));pending.set(key,job);return job;
  }
  return {search,photo,specs};
}
module.exports={createWatchPhotoService,modelQuery,parseSearch,parseProductImage,siteURL,pictureURL,imageType};
