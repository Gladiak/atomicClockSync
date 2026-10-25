import { normalizePreferences } from './trials.mjs';

export const LAB_FIELDS = Object.freeze([
  ['stationId','Station'],['deviceId','Output'],['volume','App volume'],['channel','Channel'],
  ['wave','Waveform'],['duration','Duration'],['advanceMs','Manual advance'],
  ['model','Model / home city'],['position','Placement'],['systemVolume','System volume note'],
]);
export function variableVolume(trial) {
  return Boolean(trial.volumeChanges?.length) || (trial.endVolume != null && trial.endVolume !== trial.snapshot?.settings.volume);
}
export function baselineIssue(trial) {
  if (!trial?.snapshot?.settings) return 'missing';
  if (trial.status === 'interrupted') return 'interrupted';
  if (variableVolume(trial)) return 'volume';
  return null;
}
export function trialValues(trial) {
  if (!trial?.snapshot) return null;
  const {settings,watch={}}=trial.snapshot;
  return {...settings,model:[watch.model,watch.homeCity].filter(Boolean).join(' / '),position:watch.position||'',systemVolume:watch.systemVolume??''};
}
export function filterTrials(history, watch='all', station='all') {
  return history.filter(trial => (watch==='all' || (watch==='unlinked' ? !trial.snapshot?.profileId : trial.snapshot?.profileId===watch))
    && (station==='all' || (trial.snapshot?.settings.stationId ?? trial.stationId)===station)).toSorted((a,b)=>b.at-a.at);
}
export function summarizeTrials(trials) {
  const counts={get:0,err:0,unverified:0}, excluded={missing:0,interrupted:0,volume:0}, groups=new Map();
  for(const trial of trials) {
    counts[['get','err'].includes(trial.outcome)?trial.outcome:'unverified']++;
    const issue=baselineIssue(trial);
    if(issue){excluded[issue]++;continue;}
    // An unlinked trial cannot establish that two attempts used the same watch.
    // Exact saved conditions define groups; handwritten notes are not normalised away.
    const key=JSON.stringify([trial.snapshot.profileId||`unlinked:${trial.id}`,trialValues(trial)]);
    if(!groups.has(key))groups.set(key,{key,trial,get:0,err:0,unverified:0});
    groups.get(key)[['get','err'].includes(trial.outcome)?trial.outcome:'unverified']++;
  }
  const configurations=[...groups.values()].map(group=>({...group,verified:group.get+group.err,rate:group.get+group.err?group.get/(group.get+group.err):null}));
  configurations.sort((a,b)=>b.verified-a.verified || (b.rate??-1)-(a.rate??-1) || b.trial.at-a.trial.at);
  const verified=counts.get+counts.err;
  return {counts,verified,rate:verified?counts.get/verified:null,excluded,configurations,total:trials.length};
}
export function compareTrials(a,b) {
  if(!a||!b||a.id===b.id)return {kind:'select',differences:[]};
  const left=trialValues(a),right=trialValues(b);
  if(!left||!right)return {kind:'missing',differences:[]};
  const differences=LAB_FIELDS.filter(([key])=>left[key]!==right[key]).map(([key])=>key);
  const sameWatch=Boolean(a.snapshot.profileId)&&a.snapshot.profileId===b.snapshot.profileId;
  const stable=!baselineIssue(a)&&!baselineIssue(b);
  const completeNotes=Boolean(left.position&&right.position&&left.systemVolume!==''&&right.systemVolume!=='');
  return {kind:!sameWatch?'watch':!stable?'unstable':!completeNotes?'notes':differences.length===1?'one':differences.length===0?'same':'many',differences,left,right};
}
export function prepareTrial(baseline,field,value) {
  if(baselineIssue(baseline))throw new RangeError('Baseline is not stable');
  if(!['volume','channel','wave','duration'].includes(field))throw new RangeError('Invalid experiment field');
  const original=baseline.snapshot.settings;
  const desired={...original,[field]:['volume','duration'].includes(field)?Number(value):value};
  if(['volume','duration'].includes(field)&&!Number.isInteger(desired[field]))throw new RangeError('Invalid numeric value');
  const settings=normalizePreferences(desired);
  if(settings[field]!==desired[field] || settings[field]===original[field])throw new RangeError('Choose a different valid value');
  if(Object.keys(original).some(key=>key!==field && settings[key]!==original[key]))throw new RangeError('More than one setting changed');
  return settings;
}
