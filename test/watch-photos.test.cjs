const test=require('node:test'),assert=require('node:assert/strict');
const {createWatchPhotoService,modelQuery,parseSearch,parseProductImage,siteURL,pictureURL}=require('../electron/watch-photos.cjs');
const origin='https://shockbase.org',page=origin+'/watches/watch_dyn.php?model=GA-B2100C-9A&series=2100&subseries=GA-B2100';
const searchHTML=`<a href="/watches/watch_dyn.php?model=GA-B2100C-9A&amp;series=2100&amp;subseries=GA-B2100"><img src="../pics2/2100/GA-B2100/GA-B2100C-9A_small.webp"></a>`;
const productHTML=`<meta content="${origin}/pics2/2100/GA-B2100/GA-B2100C-9A_medium.webp" property="og:image"><a href="../pics2/2100/GA-B2100/GA-B2100C-9A.png"><img src="../pics2/2100/GA-B2100/GA-B2100C-9A_medium.webp"></a><a href="../pics2/2100/GA-B2100/GA-B2100C-9A_back.png"><img src="back.png"></a>`;
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==','base64');

test('model searches normalize prefixes and hyphens while rejecting arbitrary queries',()=>{
 assert.equal(modelQuery(' Casio G-Shock ga–b2100 / 5689 '),'GA-B2100');
 for(const input of ['',null,'https://example.com','GA<script>','../../user','GA-B2100?secret=yes','A'.repeat(110)])assert.throws(()=>modelQuery(input));
});
test('catalogue parsing keeps exact variants and public product images',()=>{
 const hostile=`<a href="https://elsewhere.test/watches/watch_dyn.php?model=GA-B2100"><img src="/pics2/a.png"></a><a href="/watches/watch_dyn.php?model=GA-B2100"><img src="https://elsewhere.test/a.png"></a>`;
 const found=parseSearch(hostile+searchHTML+searchHTML,'GA-B2100C-9A');assert.equal(found.length,1);assert.equal(found[0].model,'GA-B2100C-9A');assert.equal(found[0].pageURL,page);
 assert.equal(parseProductImage(productHTML,page,'GA-B2100C-9A'),origin+'/pics2/2100/GA-B2100/GA-B2100C-9A.png');
 assert.match(parseProductImage(productHTML,page,'GA-B2100C-9A',false),/_medium.webp$/);
 assert.throws(()=>parseProductImage(productHTML,page,'DW-5600-1'));
 for(const url of ['http://shockbase.org/','https://shockbase.org.evil.test/','https://shockbase.org@localhost/','https://shockbase.org:444/'])assert.throws(()=>siteURL(url));
 for(const url of ['/pics/private.png','/user/photo.png','/pics2/../user/photo.png','/pics2/a.svg','/pics2/a.png?url=https://elsewhere.test'])assert.throws(()=>pictureURL(url,origin));
});
test('search and image requests cache results, preserve source and fall back to the published preview',async()=>{
 const calls=[];
 const service=createWatchPhotoService({fetch:async url=>{
  calls.push(url);
  if(url.includes('/search.php'))return new Response(searchHTML);
  if(url.includes('/watches/'))return new Response(productHTML);
  if(url.endsWith('.png'))return new Response('',{status:404});
  return new Response(png);
 }});
 const found=await service.search('GA-B2100');assert.deepEqual(await service.search('GA-B2100'),found);assert.equal(calls.length,1);
 const [first,second]=await Promise.all([service.photo(found[0].id,true),service.photo(found[0].id,true)]);
 assert.equal(first,second);assert.match(first.dataURL,/^data:image\/png;base64,/);assert.match(first.imageURL,/_medium.webp$/);assert.equal(first.pageURL,page);assert.equal(calls.length,4);
 await service.photo(found[0].id,true);assert.equal(calls.length,4);await assert.rejects(service.photo('unknown',true),/selection/);
});
test('redirects outside ShockBase and excessive payloads are refused',async()=>{
 const redirected=createWatchPhotoService({fetch:async()=>new Response(null,{status:302,headers:{location:'https://localhost/private'}})});
 await assert.rejects(redirected.search('GW-6900'),/source/);
 const huge=createWatchPhotoService({fetch:async()=>new Response('data',{headers:{'content-length':'3000000'}})});
 await assert.rejects(huge.search('GW-6900'),/size/);
 const rate=createWatchPhotoService({fetch:async()=>new Response(null,{status:429})});await assert.rejects(rate.search('GW-6900'),/rate/);
});
test('regional suffix searches show the actual catalogue model instead of guessing a colour',async()=>{
 const service=createWatchPhotoService({fetch:async url=>new Response(url.endsWith('9AER')?'No matches':searchHTML)});
 const result=await service.search('GA-B2100C-9AER');assert.equal(result[0].model,'GA-B2100C-9A');
});
