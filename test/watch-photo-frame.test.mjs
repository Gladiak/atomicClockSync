import test from 'node:test';import assert from 'node:assert/strict';
import {watchPhotoBounds,watchPhotoPlacement} from '../src/watch-photo-frame.mjs';
import {normalizeWatchDetails} from '../src/watch-collection-data.mjs';
function pixels(width,height,background=[255,255,255,255]){const data=new Uint8ClampedArray(width*height*4);for(let i=0;i<data.length;i+=4)data.set(background,i);return {width,height,data};}
function rectangle(image,x,y,w,h,color){for(let row=y;row<y+h;row++)for(let col=x;col<x+w;col++)image.data.set(color,(row*image.width+col)*4);}

test('white catalogue borders are removed without erasing white dial details',()=>{
 const image=pixels(160,120);rectangle(image,90,10,40,90,[35,45,55,255]);rectangle(image,100,40,20,20,[255,255,255,255]);
 const bounds=watchPhotoBounds(image);assert.ok(bounds.left>80);assert.ok(bounds.width<50);assert.equal(bounds.removed[0],1);assert.equal(bounds.removed[50*160+110],0);
 const place=watchPhotoPlacement(bounds);assert.equal(place.x+place.width/2,240);assert.equal(place.y+place.height/2,240);assert.equal(place.height,400);
});
test('transparent frames preserve dark watch parts that touch the edge',()=>{
 const image=pixels(100,180,[0,0,0,0]);rectangle(image,30,0,40,140,[0,0,0,255]);
 const bounds=watchPhotoBounds(image);assert.equal(bounds.removed[35],0);assert.equal(bounds.top,0);assert.equal(bounds.removed[0],1);
});
test('busy photo backgrounds and single-colour images keep their original content',()=>{
 const image=pixels(80,80);for(let y=0;y<80;y++)for(let x=0;x<80;x++)image.data.set([x*3,y*3,(x+y)%2*200,255],(y*80+x)*4);
 const bounds=watchPhotoBounds(image);assert.deepEqual([bounds.left,bounds.top,bounds.width,bounds.height],[0,0,80,80]);assert.equal(bounds.removed.some(Boolean),false);
 const solid=watchPhotoBounds(pixels(40,90,[0,20,40,255]));assert.equal(solid.removed,null);assert.equal(solid.height,90);
});
test('photo provenance persists only for a saved image and a valid catalogue source',()=>{
 const source={provider:'shockbase',model:'GW-6900-1',pageURL:'https://shockbase.org/watches/watch_dyn.php?model=GW-6900-1',imageURL:'https://shockbase.org/pics2/6900/GW-6900/GW-6900-1.png'};
 const photo='data:image/webp;base64,UklGRg==';assert.deepEqual(normalizeWatchDetails({photo,photoSource:source}).photoSource,source);
 assert.equal(normalizeWatchDetails({photoSource:source}).photoSource,undefined);
 assert.equal(normalizeWatchDetails({photo,photoSource:{...source,pageURL:'https://elsewhere.test/'}}).photoSource,undefined);
});
