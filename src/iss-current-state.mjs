import {orbitHealth,stateAt} from './iss-orbit.mjs';
// Both the dashboard and detailed tracker use identical validity and unit rules.
export function currentIssState(model,fix,epoch,observer=null,{allowFix=true,light=true}={}){
 if(model&&orbitHealth(model,epoch).usable){try{return {...stateAt(model,epoch,observer,{light}),estimated:true};}catch{/* A failed propagator never becomes a guessed position. */}}
 if(allowFix&&fix&&Math.abs(epoch-fix.timestamp)<30000&&[fix.timestamp,fix.latitude,fix.longitude,fix.altitude,fix.velocity].every(Number.isFinite)
  &&Math.abs(fix.latitude)<=90&&Math.abs(fix.longitude)<=180&&fix.altitude>=150&&fix.altitude<=1000&&fix.velocity>=20000&&fix.velocity<=35000){
  return {...fix,speedKms:fix.velocity/3600,epoch:fix.timestamp,estimated:false};
 }
 return null;
}
