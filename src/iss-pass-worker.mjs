import {prepareOrbit,predictPasses} from './iss-orbit.mjs';
onmessage=({data})=>{try{const model=prepareOrbit(data.orbit);postMessage({request:data.request,passes:predictPasses(model,data.observer,data.start)});}
  catch{postMessage({request:data.request,error:'Pass predictions are unavailable for these orbital elements.'});}};
