const HOUR=3600000,SPAN=24*HOUR,MAX_GAP=1.5*HOUR;
// Hourly model samples, interpolated only at the exact 24-hour window edges.
// Missing temperatures and missing hours remain gaps, including across DST.
export function temperatureSeries(packet,epoch){
  const age=packet?epoch-packet.current?.time:Infinity;
  if(!Number.isFinite(epoch)||!Number.isFinite(age)||age< -1800000||age>=6*HOUR)return [];
  const end=epoch+SPAN;
  const rows=[...new Map((packet.hourly||[]).filter(row=>Number.isFinite(row.time)&&row.time>=epoch-HOUR&&row.time<=end+HOUR)
    .map(row=>[row.time,{time:row.time,temperature:Number.isFinite(row.temperature)?row.temperature:null}])).values()].sort((a,b)=>a.time-b.time);
  function edge(time){
    const exact=rows.find(row=>row.time===time);if(exact)return exact;
    const before=rows.findLast(row=>row.time<time),after=rows.find(row=>row.time>time);
    return {time,temperature:before&&after&&after.time-before.time<=MAX_GAP&&before.temperature!==null&&after.temperature!==null?
      before.temperature+(after.temperature-before.temperature)*(time-before.time)/(after.time-before.time):null};
  }
  return [edge(epoch),...rows.filter(row=>row.time>epoch&&row.time<end),edge(end)];
}
export function trendGeometry(series){
  const valid=series.filter(row=>Number.isFinite(row.temperature));
  if(valid.length<2)return null;
  const start=series[0].time,end=series.at(-1).time;if(end<=start)return null;
  const low=Math.min(...valid.map(row=>row.temperature)),high=Math.max(...valid.map(row=>row.temperature));
  const padding=Math.max(1,(high-low)*.18),min=low-padding,max=high+padding;
  const position=row=>({time:row.time,temperature:row.temperature,x:6+(row.time-start)/(end-start)*308,y:5+(max-row.temperature)/(max-min)*44});
  const segments=[];let segment=[],previous=null;
  for(const row of series){
    if(!Number.isFinite(row.temperature)||previous&&row.time-previous.time>MAX_GAP){if(segment.length)segments.push(segment);segment=[];}
    if(Number.isFinite(row.temperature))segment.push(position(row));
    previous=row;
  }
  if(segment.length)segments.push(segment);
  const coordinate=point=>point.x.toFixed(2)+','+point.y.toFixed(2);
  const connected=segments.filter(points=>points.length>1);
  if(!connected.length)return null;
  const lines=connected.map(points=>'M'+points.map(coordinate).join('L'));
  return {low,high,points:segments.flat(),line:lines.join(''),area:connected.map((points,i)=>lines[i]+'L'+points.at(-1).x.toFixed(2)+',54L'+points[0].x.toFixed(2)+',54Z').join(''),start,end};
}
