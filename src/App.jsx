import React, { useState } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

const BENCHMARKS = {
  "Height":     { p10: 70.0, p25: 71.4, p50: 72.8, p75: 74.3, p90: 75.5, unit: "in",  dec: 1 },
  "Weight":     { p10: 164,  p25: 175,  p50: 186,  p75: 200,  p90: 211,  unit: "lbs", dec: 0 },
  "Wingspan":   { p10: 71.5, p25: 72.8, p50: 74.5, p75: 76.3, p90: 78.0, unit: "in",  dec: 1 },
  "40 Yard":    { p10: 5.22, p25: 5.07, p50: 4.94, p75: 4.81, p90: 4.70, unit: "s",   dec: 2, speed: true },
  "Shuttle":    { p10: 4.86, p25: 4.70, p50: 4.56, p75: 4.44, p90: 4.32, unit: "s",   dec: 2, speed: true },
  "Vertical":   { p10: 22.9, p25: 25.2, p50: 27.5, p75: 30.3, p90: 32.6, unit: "in",  dec: 1 },
  "Broad Jump": { p10: 95.0, p25: 99.6, p50:104.9, p75:109.3, p90:114.0, unit: "in",  dec: 1 },
  "Hand":       { p10: 8.5,  p25: 9.0,  p50: 9.2,  p75: 9.5,  p90: 10.0, unit: "in",  dec: 1 },
  "Arm":        { p10: 29.8, p25: 30.5, p50: 31.5, p75: 32.5, p90: 33.8, unit: "in",  dec: 1 },
};

const DEFAULTS = {
  "Height": "74.0", "Weight": "195", "Wingspan": "75.5",
  "40 Yard": "4.88", "Shuttle": "4.52", "Vertical": "28.0",
  "Broad Jump": "106.0", "Hand": "9.3", "Arm": "31.5",
};

function getPercentile(value, bench) {
  const pts = [[bench.p10,10],[bench.p25,25],[bench.p50,50],[bench.p75,75],[bench.p90,90]];
  if (bench.speed) {
    if (value >= pts[0][0]) return Math.max(0, 10 - ((value-pts[0][0])/(pts[0][0]-pts[1][0]))*15);
    if (value <= pts[4][0]) return Math.min(100, 90 + ((pts[4][0]-value)/(pts[3][0]-pts[4][0]))*10);
    for (let i=0;i<4;i++){const [v1,p1]=pts[i],[v2,p2]=pts[i+1];if(value<=v1&&value>=v2)return p1+((v1-value)/(v1-v2))*(p2-p1);}
  } else {
    if (value <= pts[0][0]) return Math.max(0, 10 - ((pts[0][0]-value)/(pts[1][0]-pts[0][0]))*15);
    if (value >= pts[4][0]) return Math.min(100, 90 + ((value-pts[4][0])/(pts[4][0]-pts[3][0]))*10);
    for (let i=0;i<4;i++){const [v1,p1]=pts[i],[v2,p2]=pts[i+1];if(value>=v1&&value<=v2)return p1+((value-v1)/(v2-v1))*(p2-p1);}
  }
  return 50;
}

function col(pct){if(pct>=90)return"#F59E0B";if(pct>=75)return"#22C55E";if(pct>=50)return"#60A5FA";if(pct>=25)return"#F97316";return"#EF4444";}
function tier(pct){if(pct>=90)return"ELITE";if(pct>=75)return"TOP 25%";if(pct>=50)return"ABOVE AVG";if(pct>=25)return"AVERAGE";return"BELOW AVG";}
function f(v,d){if(v==null||isNaN(v))return"—";return d===0?Math.round(v).toString():Number(v).toFixed(d);}

const card = {background:"#0D1B2A",borderRadius:10,padding:20,border:"1px solid #1B2D42"};
const lbl  = {fontSize:9,color:"#1565C0",letterSpacing:3,fontWeight:"bold",marginBottom:14};

function GradientTrack({pcts,inputs}){
  return(
    <div style={card}>
      <div style={lbl}>▬ GRADIENT TRACK</div>
      {Object.entries(BENCHMARKS).map(([key,bench])=>{
        const pct=pcts[key]; if(pct==null)return null;
        const c=col(pct),raw=parseFloat(inputs[key]),cp=Math.max(1,Math.min(99,pct));
        return(
          <div key={key} style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:5}}>
              <span style={{fontSize:11,fontWeight:"bold",color:"#94A3B8",width:82}}>{key}</span>
              <span style={{fontSize:12,color:"white",fontWeight:"bold"}}>{f(raw,bench.dec)}<span style={{fontSize:9,color:"#475569",marginLeft:2}}>{bench.unit}</span></span>
              <span style={{fontSize:16,fontWeight:"bold",color:c}}>{Math.round(pct)}<span style={{fontSize:9,color:"#475569",fontWeight:"normal"}}>th</span></span>
            </div>
            <div style={{position:"relative",height:28}}>
              <div style={{position:"absolute",top:8,left:0,right:0,height:10,borderRadius:5,background:"linear-gradient(to right,#7F1D1D,#EF4444 18%,#F97316 35%,#60A5FA 52%,#22C55E 70%,#F59E0B 100%)",opacity:0.15}}/>
              <div style={{position:"absolute",top:8,left:0,width:`${cp}%`,height:10,borderRadius:5,background:"linear-gradient(to right,#7F1D1D,#EF4444 18%,#F97316 35%,#60A5FA 52%,#22C55E 70%,#F59E0B 100%)"}}/>
              <div style={{position:"absolute",top:3,left:`calc(${cp}% - 10px)`,width:20,height:20,borderRadius:"50%",background:c,border:"2px solid white",boxShadow:`0 0 10px ${c},0 0 20px ${c}44`,zIndex:2}}/>
              {[10,25,50,75,90].map(t=><div key={t} style={{position:"absolute",top:18,left:`${t}%`,width:1,height:4,background:"#1E293B",transform:"translateX(-50%)"}}/>)}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",paddingLeft:"10%",paddingRight:"10%",marginTop:4}}>
              {[bench.p10,bench.p25,bench.p50,bench.p75,bench.p90].map((v,i)=>(
                <div key={i} style={{textAlign:"center"}}>
                  <div style={{fontSize:8,color:"#374151"}}>{f(v,bench.dec)}</div>
                  <div style={{fontSize:7,color:"#1E293B"}}>{[10,25,50,75,90][i]}th</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ArcGauge({pct,label,display}){
  const r=32,cx=44,cy=48,circ=2*Math.PI*r,track=circ*0.75,fill=track*Math.max(0,Math.min(100,pct))/100,c=col(pct);
  const ma=(135+270*Math.max(0,Math.min(100,pct))/100)*Math.PI/180;
  return(
    <div style={{textAlign:"center",padding:"10px 6px",background:"#060F1C",borderRadius:8,border:`1px solid ${c}33`}}>
      <svg width="88" height="78" viewBox="0 0 88 78">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1E2D3D" strokeWidth="7" strokeDasharray={`${track} ${circ}`} strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`}/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={c} strokeWidth="7" strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`} style={{filter:`drop-shadow(0 0 3px ${c})`}}/>
        <circle cx={cx+r*Math.cos(ma)} cy={cy+r*Math.sin(ma)} r={4} fill="white" style={{filter:`drop-shadow(0 0 5px ${c})`}}/>
        <text x={cx} y={cy-4} textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="Arial">{Math.round(pct)}</text>
        <text x={cx} y={cy+9} textAnchor="middle" fill="#4B5563" fontSize="6.5" fontFamily="Arial" letterSpacing="0.5">PCT</text>
      </svg>
      <div style={{fontSize:9,color:"#64748B",fontWeight:"bold"}}>{label}</div>
      <div style={{fontSize:10,color:"white",fontWeight:"bold",marginTop:2}}>{display}</div>
      <div style={{fontSize:8,color:c,fontWeight:"bold",marginTop:1}}>{tier(pct)}</div>
    </div>
  );
}

function ArcGauges({pcts,inputs}){
  return(
    <div style={card}>
      <div style={lbl}>◉ ARC GAUGES</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
        {Object.entries(BENCHMARKS).map(([key,bench])=>{
          const pct=pcts[key]; if(pct==null)return null;
          return <ArcGauge key={key} pct={pct} label={key} display={`${f(parseFloat(inputs[key]),bench.dec)} ${bench.unit}`}/>;
        })}
      </div>
    </div>
  );
}

function RadarWeb({pcts,inputs}){
  const data=Object.entries(pcts).filter(([,v])=>v!=null).map(([k,v])=>({subject:k,prospect:Math.round(v),average:50,fullMark:100}));
  return(
    <div style={card}>
      <div style={lbl}>⬡ RADAR WEB</div>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="68%">
          <PolarGrid stroke="#1E2D3A"/>
          <PolarAngleAxis dataKey="subject" tick={{fill:"#94A3B8",fontSize:9,fontWeight:"bold"}}/>
          <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false}/>
          <Radar dataKey="average" stroke="#2D3748" fill="#2D3748" fillOpacity={0.12} strokeDasharray="4 3" strokeWidth={1}/>
          <Radar dataKey="prospect" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.28} strokeWidth={2}/>
        </RadarChart>
      </ResponsiveContainer>
      <div style={{display:"flex",gap:14,justifyContent:"center",marginTop:6}}>
        <div style={{display:"flex",alignItems:"center",gap:5,fontSize:9,color:"#6B7280"}}><div style={{width:16,height:1,borderTop:"2px dashed #4B5563"}}/> Avg (50th)</div>
        <div style={{display:"flex",alignItems:"center",gap:5,fontSize:9,color:"#60A5FA"}}><div style={{width:16,height:2,background:"#3B82F6"}}/> Prospect</div>
      </div>
      <div style={{marginTop:12}}>
        {Object.entries(pcts).filter(([,v])=>v!=null).map(([key,pct])=>{
          const bench=BENCHMARKS[key],c=col(pct),raw=parseFloat(inputs[key]);
          return(
            <div key={key} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"1px solid #0D1B2A"}}>
              <span style={{fontSize:9,color:"#94A3B8",width:66,flexShrink:0}}>{key}</span>
              <span style={{fontSize:9,color:"#475569",width:46,flexShrink:0}}>{f(raw,bench.dec)} {bench.unit}</span>
              <div style={{flex:1,height:3,borderRadius:2,background:"#1E2D3A"}}>
                <div style={{height:"100%",borderRadius:2,width:`${Math.max(1,Math.min(99,pct))}%`,background:c}}/>
              </div>
              <span style={{fontSize:11,fontWeight:"bold",color:c,width:26,textAlign:"right",flexShrink:0}}>{Math.round(pct)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TierCard({pcts,inputs}){
  const vals=Object.values(pcts).filter(v=>v!=null);
  const overall=vals.reduce((a,b)=>a+b,0)/vals.length,c=col(overall);
  return(
    <div style={card}>
      <div style={lbl}>◈ TIER CARD</div>
      <div style={{background:"#060F1C",borderRadius:8,padding:"12px 16px",marginBottom:14,border:`1px solid ${c}44`,display:"flex",alignItems:"center",gap:16}}>
        <svg width="56" height="56" viewBox="0 0 56 56" style={{flexShrink:0}}>
          <circle cx="28" cy="28" r="24" fill="none" stroke="#1E2D3A" strokeWidth="6"/>
          <circle cx="28" cy="28" r="24" fill="none" stroke={c} strokeWidth="6"
            strokeDasharray={`${2*Math.PI*24*overall/100} ${2*Math.PI*24}`}
            strokeLinecap="round" transform="rotate(-90 28 28)"
            style={{filter:`drop-shadow(0 0 5px ${c})`}}/>
          <text x="28" y="33" textAnchor="middle" fill="white" fontSize="15" fontWeight="bold" fontFamily="Arial">{Math.round(overall)}</text>
        </svg>
        <div>
          <div style={{fontSize:18,fontWeight:"bold",color:c,letterSpacing:1}}>{tier(overall)}</div>
          <div style={{fontSize:9,color:"#4B6A8A",marginTop:2}}>Composite · QB · Sophomore</div>
        </div>
      </div>
      {Object.entries(BENCHMARKS).map(([key,bench])=>{
        const pct=pcts[key]; if(pct==null)return null;
        const c=col(pct),raw=parseFloat(inputs[key]),t=tier(pct);
        return(
          <div key={key} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:6,background:"#060F1C",marginBottom:4,border:`1px solid ${c}18`}}>
            <span style={{fontSize:10,fontWeight:"bold",color:"#CBD5E1",width:70,flexShrink:0}}>{key}</span>
            <span style={{fontSize:11,color:"white",fontWeight:"bold",width:58,flexShrink:0}}>{f(raw,bench.dec)}<span style={{fontSize:8,color:"#374151",marginLeft:2}}>{bench.unit}</span></span>
            <div style={{flex:1,height:5,borderRadius:3,background:"#1E2D3A",overflow:"hidden"}}>
              <div style={{height:"100%",borderRadius:3,width:`${Math.max(1,Math.min(99,pct))}%`,background:`linear-gradient(to right,${c}66,${c})`,boxShadow:`0 0 6px ${c}77`}}/>
            </div>
            <span style={{fontSize:13,fontWeight:"bold",color:c,width:30,textAlign:"right",flexShrink:0}}>{Math.round(pct)}</span>
            <span style={{fontSize:7,fontWeight:"bold",color:c,border:`1px solid ${c}`,borderRadius:3,padding:"2px 5px",width:60,textAlign:"center",flexShrink:0,letterSpacing:0.4}}>{t}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function App(){
  const [inputs,setInputs]=useState(DEFAULTS);
  const pcts={};
  Object.entries(BENCHMARKS).forEach(([k,b])=>{
    const v=parseFloat(inputs[k]);
    pcts[k]=isNaN(v)?null:Math.min(100,Math.max(0,getPercentile(v,b)));
  });

  return(
    <div style={{background:"#060F1C",minHeight:"100vh",color:"white",fontFamily:"Arial,sans-serif",padding:"18px 20px"}}>
      <div style={{marginBottom:16,paddingBottom:14,borderBottom:"1px solid #0D1B2A"}}>
        <div style={{fontSize:8,color:"#1565C0",letterSpacing:4,fontWeight:"bold",marginBottom:3}}>UC CAMP · PROSPECT EVALUATION</div>
        <div style={{fontSize:20,fontWeight:"bold",letterSpacing:1}}>PERCENTILE REFERENCE — ALL VIEWS</div>
        <div style={{fontSize:10,color:"#4B6A8A",marginTop:2}}>QB · Sophomore · n = 1,598 · Edit any field below to update all views live</div>
      </div>

      <div style={{background:"#0D1B2A",borderRadius:8,padding:"12px 14px",marginBottom:16,border:"1px solid #1B2D42"}}>
        <div style={{fontSize:8,color:"#4B6A8A",letterSpacing:2,fontWeight:"bold",marginBottom:8}}>PROSPECT MEASURABLES</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(9,1fr)",gap:8}}>
          {Object.entries(BENCHMARKS).map(([key,bench])=>{
            const pct=pcts[key],c=pct!=null?col(pct):"#1B2D42";
            return(
              <div key={key}>
                <div style={{fontSize:7,color:"#4B6A8A",marginBottom:3,fontWeight:"bold",letterSpacing:0.5}}>{key.toUpperCase()}</div>
                <input type="number" step="0.01" value={inputs[key]}
                  onChange={e=>setInputs(p=>({...p,[key]:e.target.value}))}
                  style={{width:"100%",padding:"5px 6px",background:"#060F1C",border:`1.5px solid ${c}`,borderRadius:4,color:"white",fontSize:12,fontWeight:"bold",outline:"none",boxSizing:"border-box"}}/>
                {pct!=null&&<div style={{fontSize:8,color:c,marginTop:2,fontWeight:"bold"}}>{Math.round(pct)}th</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <GradientTrack pcts={pcts} inputs={inputs}/>
        <ArcGauges     pcts={pcts} inputs={inputs}/>
        <RadarWeb      pcts={pcts} inputs={inputs}/>
        <TierCard      pcts={pcts} inputs={inputs}/>
      </div>
    </div>
  );
}
