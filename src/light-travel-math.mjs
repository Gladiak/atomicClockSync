import { Body, BackdatePosition, HelioVector, Ecliptic, KM_PER_AU, C_AUDAY } from '../assets/world/vendor.mjs';

export const LIGHT_SPEED_KMS = 299792.458;
export const LIGHT_TARGETS = Object.freeze([
  { id:'sun', body:Body.Sun, name:'Sun', color:'#ffcf79', radius:0, size:10 },
  { id:'moon', body:Body.Moon, name:'Moon', color:'#d9e5ef', radius:0, size:3 },
  { id:'mercury', body:Body.Mercury, name:'Mercury', color:'#c5b6ad', radius:43, size:3 },
  { id:'venus', body:Body.Venus, name:'Venus', color:'#edc28d', radius:65, size:4 },
  { id:'mars', body:Body.Mars, name:'Mars', color:'#f18b68', radius:116, size:4 },
  { id:'jupiter', body:Body.Jupiter, name:'Jupiter', color:'#e4bd95', radius:153, size:7 },
  { id:'saturn', body:Body.Saturn, name:'Saturn', color:'#dfd09f', radius:188, size:6 },
  { id:'uranus', body:Body.Uranus, name:'Uranus', color:'#9ce2e3', radius:222, size:5 },
  { id:'neptune', body:Body.Neptune, name:'Neptune', color:'#8bafff', radius:257, size:5 },
].map(Object.freeze));
export const validLightEpoch = epoch => Number.isFinite(epoch) && epoch >= Date.UTC(1900,0,1) && epoch <= Date.UTC(2100,11,31,23,59,59,999);

export function lightObservation(id, epoch) {
  const target = LIGHT_TARGETS.find(item => item.id === id);
  if (!target || !validLightEpoch(epoch)) throw new RangeError('Invalid light-travel target or date');
  // Unlike GeoVector's special lunar path, BackdatePosition solves the emission
  // epoch for the Moon too. The receiver is Earth at the observation epoch.
  const vector = BackdatePosition(new Date(epoch), Body.Earth, target.body, false);
  const distanceAu = vector.Length();
  const seconds = distanceAu / C_AUDAY * 86400;
  return Object.freeze({ id, epoch, emittedAt:epoch-seconds*1000, seconds,
    distanceAu, distanceKm:distanceAu*KM_PER_AU, reflected:id !== 'sun' });
}

export function solarLayout(epoch) {
  if (!validLightEpoch(epoch)) throw new RangeError('Invalid solar-layout date');
  const point = (body, radius) => {
    const angle = Ecliptic(HelioVector(body, new Date(epoch))).elon*Math.PI/180;
    return { x:286+radius*Math.cos(angle), y:147+radius*.43*Math.sin(angle) };
  };
  const earth = point(Body.Earth,89);
  const moonAngle = Ecliptic(BackdatePosition(new Date(epoch),Body.Earth,Body.Moon,false)).elon*Math.PI/180;
  return Object.freeze({ earth, ...Object.fromEntries(LIGHT_TARGETS.map(target => [target.id,
    target.id === 'sun' ? {x:286,y:147} : target.id === 'moon'
      ? {x:earth.x+23*Math.cos(moonAngle),y:earth.y+17*Math.sin(moonAngle)} : point(target.body,target.radius)])) });
}

export function shiftLightMonths(epoch, months) {
  if (!validLightEpoch(epoch) || !Number.isInteger(months)) throw new RangeError('Invalid preview date');
  const date = new Date(epoch), day = date.getUTCDate();
  date.setUTCDate(1); date.setUTCMonth(date.getUTCMonth()+months);
  const last = new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate();
  date.setUTCDate(Math.min(day,last));
  return date.getTime();
}

export function playbackRate(speed, seconds) {
  if (speed === 'auto') return Math.max(1,seconds/12);
  const rate = Number(speed);
  if (![1,10,100,1000].includes(rate)) throw new RangeError('Invalid playback speed');
  return rate;
}
export function makeLightReplay(observation, monotonic, speed='auto') {
  if (!observation || !Number.isFinite(observation.seconds) || observation.seconds <= 0 || !Number.isFinite(monotonic)) throw new RangeError('Invalid light replay');
  playbackRate(speed,observation.seconds);
  return { observation, speed, played:0, resumedAt:monotonic, phase:'playing' };
}
export function lightReplayPosition(replay, monotonic) {
  const elapsed = replay.played + (replay.phase === 'playing' ? Math.max(0,monotonic-replay.resumedAt)/1000*playbackRate(replay.speed,replay.observation.seconds) : 0);
  const seconds = Math.min(replay.observation.seconds,elapsed);
  return { seconds, remaining:Math.max(0,replay.observation.seconds-seconds), fraction:seconds/replay.observation.seconds,
    complete:seconds >= replay.observation.seconds, epoch:replay.observation.emittedAt+seconds*1000 };
}
export function pauseLightReplay(replay, monotonic) {
  const position = lightReplayPosition(replay,monotonic);
  return {...replay,played:position.seconds,resumedAt:monotonic,phase:position.complete?'complete':'paused'};
}
export function resumeLightReplay(replay, monotonic) {
  return {...replay,resumedAt:monotonic,phase:replay.played >= replay.observation.seconds ? 'complete' : 'playing'};
}
export function retimeLightReplay(replay, speed, monotonic) {
  playbackRate(speed,replay.observation.seconds);
  const state = pauseLightReplay(replay,monotonic);
  return {...state,speed,phase:state.phase === 'complete' ? 'complete' : replay.phase};
}
