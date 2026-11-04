import {solarAltitude,solarPosition} from './world-math.mjs';

// Golden-hour light stays gentle; no fixed clock-hour or weather-service guess.
export function atmosphereForAltitude(altitude){
  return !Number.isFinite(altitude)?'neutral':altitude>=6?'day':altitude>=-6?'twilight':'night';
}
export function solarAtmosphere(epoch,city){
  if(!Number.isFinite(epoch)||epoch<Date.UTC(1900,0,1)||epoch>=Date.UTC(2101,0,1)
    ||!Number.isFinite(city?.latitude)||!Number.isFinite(city?.longitude))return 'neutral';
  return atmosphereForAltitude(solarAltitude(city,solarPosition(epoch)));
}
