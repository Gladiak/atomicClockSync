import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorldProjection,clampWorldCamera,zoomWorldCamera,focusWorldCamera} from '../src/world-map-geometry.mjs';
test('raster and overlays share an invertible Natural Earth frame at equator, city, polar and dateline positions',()=>{
 const projection=createWorldProjection();
 for(const coordinates of [[0,0],[12.5113,41.8919],[139.6917,35.6895],[-179,-70],[179,70],[0,89.9]]){
  const point=projection(coordinates),back=projection.invert(point);assert.ok(point[0]>=0&&point[0]<=1000&&point[1]>=0&&point[1]<=440);
  assert.ok(Math.abs(back[0]-coordinates[0])<1e-8);assert.ok(Math.abs(back[1]-coordinates[1])<1e-8);
 }
});
test('zoom keeps the point under the cursor fixed, until a map edge limits panning',()=>{
 const camera={scale:2,x:-450,y:-180},point=[420,200],next=zoomWorldCamera(camera,3,point);
 assert.ok(Math.abs((point[0]-camera.x)/camera.scale-(point[0]-next.x)/next.scale)<1e-8);
 assert.ok(Math.abs((point[1]-camera.y)/camera.scale-(point[1]-next.y)/next.scale)<1e-8);
 assert.deepEqual(zoomWorldCamera(next,1),{scale:1,x:0,y:0});
});
test('zoom and pan are bounded, finite and never lose the world outside the viewport',()=>{
 assert.deepEqual(clampWorldCamera({scale:NaN,x:Infinity,y:NaN}),{scale:1,x:0,y:0});
 assert.deepEqual(clampWorldCamera({scale:10,x:200,y:-10000}),{scale:4,x:0,y:-1320});
 const projection=createWorldProjection();
 for(const coordinates of [[12.5,42],[-179,80],[179,-80],[0,0]]){
  const point=projection(coordinates),camera=focusWorldCamera(point,3),x=point[0]*camera.scale+camera.x,y=point[1]*camera.scale+camera.y;
  assert.ok(x>=0&&x<=1000);assert.ok(y>=0&&y<=440);
  assert.ok(camera.x<=0&&camera.x>=1000*(1-camera.scale));
  assert.ok(camera.y<=0&&camera.y>=440*(1-camera.scale));
 }
});
