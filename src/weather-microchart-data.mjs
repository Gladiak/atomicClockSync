const HOUR=3600000,SPAN=24*HOUR,MAX_GAP=1.5*HOUR;
export const MICRO_METRICS=Object.freeze({
  humidity:{label:'Humidity',unit:'%',limits:[0,100]},
  pressure:{label:'Sea-level pressure',unit:'hPa',limits:[800,1100]},
  wind:{label:'Wind',unit:'km/h',limits:[0,500]},
  rain:{label:'Rain chance',unit:'%',limits:[0,100]},
  cloud:{label:'Cloud cover',unit:'%',limits:[0,100]}
});
const value=(row,field,limits)=>Number.isFinite(row?.[field])&&row[field]>=limits[0]&&row[field]<=limits[1]?row[field]:null;
function series(rows,start,end,field,limits){
  const samples=rows.map(row=>({time:row.time,value:value(row,field,limits)}));
  function edge(time){
    const exact=samples.find(row=>row.time===time);if(exact)return exact;
    const before=samples.findLast(row=>row.time<time),after=samples.find(row=>row.time>time);
    return {time,value:before&&after&&after.time-before.time<=MAX_GAP&&before.value!==null&&after.value!==null?
      before.value+(after.value-before.value)*(time-before.time)/(after.time-before.time):null};
  }
  return [edge(start),...samples.filter(row=>row.time>start&&row.time<end),edge(end)];
}
export function microchartGeometry(packet,epoch,kind){
  const metric=MICRO_METRICS[kind],age=epoch-packet?.current?.time;
  if(!metric||!Number.isFinite(epoch)||!Number.isFinite(age)||age< -1800000||age>=6*HOUR)return null;
  const end=epoch+SPAN;
  const rows=[...new Map((Array.isArray(packet.hourly)?packet.hourly:[])
    .filter(row=>Number.isFinite(row.time)&&row.time>=epoch-HOUR&&row.time<=end+HOUR).map(row=>[row.time,row])).values()].sort((a,b)=>a.time-b.time);
  const primary=kind==='rain'?[]:series(rows,epoch,end,kind,metric.limits),secondary=kind==='wind'?series(rows,epoch,end,'gusts',metric.limits):[];
  // Probabilities describe the hour ending at the timestamp. Clip the edge
  // intervals; do not interpolate a probability into an instantaneous reading.
  const intervals=kind==='rain'?rows.filter(row=>row.time>epoch&&row.time-HOUR<end&&value(row,kind,metric.limits)!==null)
    .map(row=>({start:Math.max(epoch,row.time-HOUR),end:Math.min(end,row.time),value:row.rain})):[];
  const values=kind==='rain'?intervals.map(row=>row.value):[...primary,...secondary].map(row=>row.value).filter(Number.isFinite);
  if(!values.length)return null;
  const low=Math.min(...values),high=Math.max(...values);
  let min=0,max=100;
  if(kind==='pressure'){const span=Math.max(8,high-low);min=(low+high-span)/2;max=min+span;}
  if(kind==='wind')max=Math.max(10,Math.ceil(high/5)*5);
  const x=time=>2+(time-epoch)/SPAN*156,y=reading=>29-(reading-min)/(max-min)*26;
  const coordinate=row=>x(row.time).toFixed(2)+','+y(row.value).toFixed(2);
  function segments(samples){
    const result=[];let points=[],previous=null;
    const finish=()=>{if(points.length>1)result.push(points);points=[];};
    for(const row of samples){
      if(row.value===null||previous&&row.time-previous.time>MAX_GAP)finish();
      if(row.value!==null)points.push(row);previous=row;
    }
    finish();return result;
  }
  const groups=segments(primary),gusts=segments(secondary);
  // Share the other tiles' line and subtle fill while keeping each hourly
  // probability constant across its interval and leaving missing hours blank.
  let previousEnd=null;
  for(const row of intervals){
    if(row.start!==previousEnd)groups.push([]);
    groups.at(-1).push({time:row.start,value:row.value},{time:row.end,value:row.value});
    previousEnd=row.end;
  }
  const path=group=>'M'+group.map(coordinate).join('L');
  if(!groups.length&&!gusts.length)return null;
  return {start:epoch,end,low,high,min,max,line:groups.map(path).join(''),secondary:gusts.map(path).join(''),
    area:groups.map(group=>path(group)+'L'+x(group.at(-1).time).toFixed(2)+',29L'+x(group[0].time).toFixed(2)+',29Z').join('')};
}
