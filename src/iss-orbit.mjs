import {json2satrec,twoline2satrec,propagate,gstime,eciToGeodetic,eciToEcf,ecfToLookAngles,jday,sunPos,shadowFraction} from '../assets/iss/vendor.mjs';
import {distanceKm} from './world-math.mjs';
const RAD=Math.PI/180, HOUR=3600000;
export function prepareOrbit(orbit){
  if(!orbit||!Number.isFinite(orbit.epoch))throw Error('No orbital elements');
  const satrec=orbit.kind==='omm'?json2satrec(orbit.data):twoline2satrec(orbit.data.line1,orbit.data.line2);
  if(satrec.error||!Number.isFinite(satrec.no)||satrec.satnum!=='25544')throw Error('Invalid ISS orbit');
  return {satrec,epoch:orbit.epoch,source:orbit.source,periodMinutes:2*Math.PI/satrec.no,inclination:satrec.inclo/RAD,eccentricity:satrec.ecco};
}
export function orbitHealth(orbit,epoch){
  const ageHours=orbit?(epoch-orbit.epoch)/HOUR:Infinity;
  return {ageHours,usable:ageHours>=-2&&ageHours<=72,aging:ageHours>24,stale:ageHours>72,future:ageHours< -2};
}
export function stateAt(model,epoch,observer=null,{light=true}={}){
  const date=new Date(epoch),value=propagate(model.satrec,date);
  if(!value?.position||!value.velocity)throw Error('Orbit propagation unavailable');
  const gmst=gstime(date),geodetic=eciToGeodetic(value.position,gmst),ecf=eciToEcf(value.position,gmst);
  const speedKms=Math.hypot(value.velocity.x,value.velocity.y,value.velocity.z);
  const state={epoch,latitude:geodetic.latitude/RAD,longitude:geodetic.longitude/RAD,altitude:geodetic.height,speedKms,ecf,
    periodMinutes:model.periodMinutes,inclination:model.inclination};
  if(![state.latitude,state.longitude,state.altitude,speedKms].every(Number.isFinite)||state.altitude<100||state.altitude>1000)throw Error('ISS state outside expected orbit');
  if(light){
    const sun=sunPos(jday(date)),shadow=shadowFraction(sun.rsun,value.position);
    state.shadow=shadow;state.sunlight=shadow>.99?'Earth shadow':shadow>.01?'Penumbra':'Sunlit';
    const sunEcf=eciToEcf(sun.rsun,gmst);
    state.sun={longitude:Math.atan2(sunEcf.y,sunEcf.x)/RAD,latitude:Math.atan2(sunEcf.z,Math.hypot(sunEcf.x,sunEcf.y))/RAD};
  }
  if(observer){
    const look=ecfToLookAngles({latitude:observer.latitude*RAD,longitude:observer.longitude*RAD,height:0},ecf);
    state.azimuth=look.azimuth/RAD;state.elevation=look.elevation/RAD;state.rangeKm=look.rangeSat;
    state.groundKm=distanceKm(observer,state);
    if(light){const a=observer.latitude*RAD,b=state.sun.latitude*RAD;
      state.observerSunAltitude=Math.asin(Math.sin(a)*Math.sin(b)+Math.cos(a)*Math.cos(b)*Math.cos((observer.longitude-state.sun.longitude)*RAD))/RAD;
      state.potentiallyVisible=state.elevation>=10&&state.shadow<.05&&state.observerSunAltitude<=-6;
    }
  }
  return state;
}
export const compass = degrees => ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'][Math.round(((degrees%360)+360)%360/22.5)%16];
export function groundTrack(model,epoch,before=45,after=90){
  const points=[];
  for(let t=epoch-before*60000;t<=epoch+after*60000;t+=30000){
    const s=stateAt(model,t,null,{light:false});points.push({time:t,coordinates:[s.longitude,s.latitude]});
  }
  return points;
}
export function relativisticShift(altitudeKm,speedKms){
  const c=299792458,R=6378137,mu=3.986004418e14,scale=86400e6;
  const gravity=mu/(c*c)*(1/R-1/(R+altitudeKm*1000))*scale;
  const motion=-((speedKms*1000)**2)/(2*c*c)*scale;
  return {gravity,motion,net:gravity+motion};
}
// Pass prediction is a separate worker task, never an interface or audio timer.
export function predictPasses(model,observer,start,{hours=48,minElevation=10}={}){
  const end=Math.min(start+hours*HOUR,model.epoch+72*HOUR),scanStart=start-15*60000,passes=[];
  if(end<=start)return passes;
  const elevation=t=>stateAt(model,t,observer,{light:false}).elevation-minElevation;
  const boundary=(a,b,rising)=>{while(b-a>500){const m=(a+b)/2;if((elevation(m)>=0)===rising)b=m;else a=m;}return (a+b)/2;};
  let previous=scanStart,above=elevation(previous)>=0,aos=above?scanStart:null;
  for(let time=scanStart+30000;time<=end+30000;time+=30000){
    const current=Math.min(time,end),up=elevation(current)>=0;
    if(up&&!above)aos=boundary(previous,current,true);
    if(!up&&above&&aos!==null){
      const los=boundary(previous,current,false);
      if(los>start){
        let lo=aos,hi=los;for(let i=0;i<25;i++){const a=lo+(hi-lo)/3,b=hi-(hi-lo)/3;if(elevation(a)<elevation(b))lo=a;else hi=b;}
        const peakTime=(lo+hi)/2,peak=stateAt(model,peakTime,observer);
        const visibleSegments=[];let visibleStart=null,last=aos;
        const isVisible=t=>stateAt(model,t,observer).potentiallyVisible;
        const refine=(a,b,wanted)=>{while(b-a>500){const m=(a+b)/2;if(isVisible(m)===wanted)b=m;else a=m;}return (a+b)/2;};
        for(let t=aos;t<=los+5000;t+=5000){const sample=Math.min(t,los),visible=isVisible(sample);
          if(visible&&visibleStart===null)visibleStart=refine(last,sample,true);
          if(!visible&&visibleStart!==null){visibleSegments.push({start:visibleStart,end:refine(last,sample,false)});visibleStart=null;}
          last=sample;if(sample===los)break;
        }
        if(visibleStart!==null)visibleSegments.push({start:visibleStart,end:los});
        const samples=Array.from({length:41},(_,i)=>{const s=stateAt(model,aos+(los-aos)*i/40,observer);return {time:s.epoch,azimuth:s.azimuth,elevation:s.elevation,visible:s.potentiallyVisible};});
        passes.push({start:aos,end:los,peakTime,maxElevation:peak.elevation,azimuthStart:samples[0].azimuth,azimuthEnd:samples.at(-1).azimuth,visibleSegments,samples});
      }aos=null;
    }
    above=up;previous=current;if(current===end)break;
  }
  return passes;
}
