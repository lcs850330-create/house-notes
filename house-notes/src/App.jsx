import { useState, useEffect, useRef, useCallback } from "react";

// ── 顏色系統 ──
const C = {
  bg:"#f9f6f1", surface:"#fffdf9", surface2:"#fdf8f2",
  border:"#e8e0d4", border2:"#f0e8dc",
  text:"#37322a", text2:"#7a6f62", text3:"#b5a898",
  amber:"#c47d2e", amberBg:"#fef4e4", amberMid:"#f5d9a0", amberDeep:"#a86424",
  sage:"#6a8c72", sageBg:"#eef4ef", sageMid:"#b8d4bc",
  rose:"#c0614a", roseBg:"#fef0ed", roseMid:"#f0c0b4",
  blue:"#5a7fa8", blueBg:"#eef3fa",
};

const RENT_ITEMS = ["採光通風","格局動線","隔音效果","鄰居狀況","生活機能","交通便利","社區安全","屋況整潔"];
const BUY_ITEMS  = ["採光通風","格局動線","隔音效果","社區管理","生活機能","交通便利","增值潛力","學區條件"];
const CMP_STAR_KEYS = ["採光通風","格局動線","隔音效果","生活機能","交通便利","社區管理","增值/穩定","安全感"];
const STORAGE_KEY = "house_notes_v1";
const MAX_HOUSES = 10;

// ════════ 小元件 ════════
function Stars({ value, onChange, size=18 }) {
  const [hov, setHov] = useState(0);
  return (
    <div style={{display:"flex",gap:2}}>
      {[1,2,3,4,5].map(n=>(
        <span key={n}
          onMouseEnter={()=>setHov(n)} onMouseLeave={()=>setHov(0)}
          onClick={()=>onChange(n)}
          style={{fontSize:size,cursor:"pointer",color:n<=(hov||value)?C.amber:C.border,transition:"color .1s,transform .1s",display:"inline-block",transform:hov===n?"scale(1.2)":"scale(1)"}}>★</span>
      ))}
    </div>
  );
}

function PropRow({label,children}) {
  const [hov,setHov]=useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:"flex",alignItems:"center",minHeight:34,borderRadius:4,background:hov?C.surface2:"transparent",transition:"background .12s"}}>
      <div style={{width:185,flexShrink:0,fontSize:13,color:C.text3,padding:"6px 8px"}}>{label}</div>
      <div style={{flex:1,padding:"4px 8px"}}>{children}</div>
    </div>
  );
}

function FieldInput({value,onChange,placeholder,type="text"}) {
  return <input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={{border:"none",outline:"none",background:"transparent",fontFamily:"inherit",fontSize:13.5,color:C.text,width:"100%"}}/>;
}

function FieldSelect({value,onChange,options}) {
  return (
    <select value={value||""} onChange={e=>onChange(e.target.value)}
      style={{border:"none",outline:"none",background:"transparent",fontFamily:"inherit",fontSize:13.5,color:C.text,cursor:"pointer",width:"100%"}}>
      <option value="">— 選擇 —</option>
      {options.map(o=><option key={o}>{o}</option>)}
    </select>
  );
}

function H1({children}) {
  return <div style={{fontFamily:"'Noto Serif TC',serif",fontSize:21,fontWeight:600,color:C.text,margin:"28px 0 8px",display:"flex",alignItems:"center",gap:8}}>{children}</div>;
}
function Divider() { return <hr style={{border:"none",borderTop:`1px solid ${C.border2}`,margin:"18px 0"}}/>; }

function Callout({icon,children,variant="amber"}) {
  const bgs={amber:C.amberBg,sage:C.sageBg,rose:C.roseBg,blue:C.blueBg};
  const bds={amber:C.amberMid,sage:C.sageMid,rose:C.roseMid,blue:"#b8ccde"};
  return (
    <div style={{display:"flex",gap:12,background:bgs[variant],borderLeft:`3px solid ${bds[variant]}`,borderRadius:4,padding:"12px 14px",margin:"6px 0"}}>
      <span style={{fontSize:17,flexShrink:0,marginTop:1}}>{icon}</span>
      <div style={{flex:1,fontSize:13.5,color:C.text,lineHeight:1.8}}>{children}</div>
    </div>
  );
}

function ScoreCard({score,sub}) {
  const v=!score?{text:"請先給星評分",c:C.text2}:score>=4?{text:"✦ 強力推薦，值得出手",c:C.sage}:score>=3?{text:"◈ 尚可，進一步評估",c:C.amber}:{text:"✕ 不建議，繼續找",c:C.rose};
  return (
    <div style={{display:"flex",alignItems:"center",gap:20,background:"linear-gradient(135deg,#fef8ec,#fdf2dc)",border:`1px solid ${C.amberMid}`,borderRadius:8,padding:"20px 24px",margin:"10px 0"}}>
      <div style={{fontFamily:"'Noto Serif TC',serif",fontSize:52,fontWeight:600,color:C.amber,lineHeight:1}}>{score?score.toFixed(1):"—"}</div>
      <div>
        <div style={{fontSize:12,color:C.text3,marginBottom:4}}>{sub||"滿分 5.0"}</div>
        <div style={{fontSize:15,fontWeight:500,color:v.c}}>{v.text}</div>
      </div>
    </div>
  );
}

function Radar({items,values}) {
  const ref=useRef();
  useEffect(()=>{
    const canvas=ref.current; if(!canvas) return;
    const ctx=canvas.getContext("2d");
    const W=canvas.width,H=canvas.height,cx=W/2,cy=H/2,R=Math.min(W,H)/2-44;
    const n=items.length, ang=i=>Math.PI*2/n*i-Math.PI/2;
    ctx.clearRect(0,0,W,H);
    for(let g=1;g<=5;g++){
      ctx.beginPath();
      for(let i=0;i<n;i++){const r=R*g/5,x=cx+r*Math.cos(ang(i)),y=cy+r*Math.sin(ang(i));i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
      ctx.closePath();ctx.strokeStyle=g===5?"#e8e0d4":"#f0e8dc";ctx.lineWidth=g===5?1.5:1;ctx.stroke();
    }
    for(let i=0;i<n;i++){ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+R*Math.cos(ang(i)),cy+R*Math.sin(ang(i)));ctx.strokeStyle="#e8e0d4";ctx.lineWidth=1;ctx.stroke();}
    ctx.font="11px 'Noto Sans TC',sans-serif";ctx.fillStyle=C.text2;ctx.textAlign="center";ctx.textBaseline="middle";
    for(let i=0;i<n;i++){const r=R+24,x=cx+r*Math.cos(ang(i)),y=cy+r*Math.sin(ang(i));ctx.fillText(items[i],x,y);}
    ctx.beginPath();
    for(let i=0;i<n;i++){const r=R*(values[i]||0)/5,x=cx+r*Math.cos(ang(i)),y=cy+r*Math.sin(ang(i));i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
    ctx.closePath();ctx.fillStyle="rgba(196,125,46,0.18)";ctx.fill();ctx.strokeStyle=C.amber;ctx.lineWidth=2;ctx.stroke();
    for(let i=0;i<n;i++){const r=R*(values[i]||0)/5,x=cx+r*Math.cos(ang(i)),y=cy+r*Math.sin(ang(i));ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fillStyle=C.amber;ctx.fill();ctx.strokeStyle="#fef4e4";ctx.lineWidth=1.5;ctx.stroke();}
  },[items,values]);
  return <canvas ref={ref} width={300} height={300} style={{maxWidth:300,width:"100%",margin:"0 auto",display:"block"}}/>;
}

// ════════ AI 分析面板 ════════
function AIPanel({houses,mode,currentRatings,currentFields,currentChips}) {
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(null);
  const [err,setErr]=useState("");

  async function runAI() {
    setLoading(true); setResult(null); setErr("");
    // 整理資料送給 AI
    const housesSummary = houses.length>0
      ? houses.map(h=>{
          const vs=CMP_STAR_KEYS.map(k=>h.scores[k]).filter(v=>v>0);
          const avg=vs.length?vs.reduce((a,b)=>a+b,0)/vs.length:0;
          return `物件「${h.name}」：評分項目 ${JSON.stringify(h.scores)}，平均 ${avg.toFixed(1)}`;
        }).join("\n")
      : "（尚未建立比較物件）";

    const noteRatings = Object.entries(currentRatings).filter(([,v])=>v>0).map(([k,v])=>`${k}:${v}`).join("、");
    const noteFields = Object.entries(currentFields||{}).filter(([,v])=>v).map(([k,v])=>`${k}:${v}`).join("、");
    const pros=(currentChips?.pros||[]).join("、");
    const cons=(currentChips?.cons||[]).join("、");

    const prompt = `你是一位台灣專業房產顧問，幫助使用者分析看房資料。請用繁體中文回覆，格式清晰。

【模式】${mode==="rent"?"租屋":"買屋"}

【目前筆記物件評分】
${noteRatings||"尚未評分"}

【填寫欄位】
${noteFields||"尚未填寫"}

【勾選優點】${pros||"無"}
【勾選缺點】${cons||"無"}

【比較表格中的物件】
${housesSummary}

請提供以下分析（用 JSON 格式回覆，不要加 markdown code block）：
{
  "overall": "一句話總結（30字內）",
  "best_pick": "最推薦哪間（若有比較物件）或筆記物件的評語",
  "price_suggestion": "${mode==="rent"?"建議月租範圍或議價空間":"建議出價區間或議價策略"}",
  "risks": ["風險1", "風險2", "風險3"],
  "strengths": ["優勢1", "優勢2", "優勢3"],
  "next_steps": ["下一步1", "下一步2", "下一步3"],
  "score_comment": "針對評分的專業解讀（50字內）"
}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          messages:[{role:"user",content:prompt}]
        })
      });
      const data = await res.json();
      const text = data.content?.map(i=>i.text||"").join("").trim();
      const clean = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch(e) {
      setErr("分析失敗，請確認資料填寫後再試。");
    }
    setLoading(false);
  }

  const tagStyle=(c)=>({display:"inline-block",padding:"3px 10px",borderRadius:20,fontSize:12,margin:"3px 4px 3px 0",background:c==="rose"?C.roseBg:c==="sage"?C.sageBg:C.amberBg,color:c==="rose"?C.rose:c==="sage"?C.sage:C.amber,border:`1px solid ${c==="rose"?C.roseMid:c==="sage"?C.sageMid:C.amberMid}`});

  return (
    <div>
      <H1>🤖 AI 智能比價分析</H1>
      <Callout icon="✨" variant="amber">
        AI 將綜合你的筆記評分、勾選優缺點、以及比較表格中的所有物件，給出專業建議與出價策略。
      </Callout>
      <button onClick={runAI} disabled={loading}
        style={{display:"flex",alignItems:"center",gap:8,margin:"16px 0",padding:"10px 24px",borderRadius:8,border:`1.5px solid ${C.amber}`,background:loading?C.amberBg:C.amber,color:loading?C.amber:"#fff",fontSize:14,fontFamily:"inherit",cursor:loading?"not-allowed":"pointer",transition:"all .15s",fontWeight:500}}>
        {loading ? <><span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>⟳</span> 分析中…</> : "▶ 開始 AI 分析"}
      </button>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {err && <Callout icon="⚠️" variant="rose">{err}</Callout>}

      {result && (
        <div style={{display:"flex",flexDirection:"column",gap:12,animation:"fadeUp .4s ease"}}>
          <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

          {/* Overall */}
          <div style={{background:"linear-gradient(135deg,#fef8ec,#fdf2dc)",border:`1px solid ${C.amberMid}`,borderRadius:8,padding:"16px 20px"}}>
            <div style={{fontSize:11,color:C.text3,letterSpacing:"0.1em",marginBottom:6}}>AI 總結</div>
            <div style={{fontSize:16,fontWeight:600,color:C.text,fontFamily:"'Noto Serif TC',serif"}}>{result.overall}</div>
          </div>

          {/* Best pick + price */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div style={{background:C.sageBg,border:`1px solid ${C.sageMid}`,borderRadius:8,padding:"14px 16px"}}>
              <div style={{fontSize:11,color:C.text3,letterSpacing:"0.1em",marginBottom:6}}>🏆 最佳推薦</div>
              <div style={{fontSize:13.5,color:C.text,lineHeight:1.7}}>{result.best_pick}</div>
            </div>
            <div style={{background:C.amberBg,border:`1px solid ${C.amberMid}`,borderRadius:8,padding:"14px 16px"}}>
              <div style={{fontSize:11,color:C.text3,letterSpacing:"0.1em",marginBottom:6}}>💰 {mode==="rent"?"租金建議":"出價建議"}</div>
              <div style={{fontSize:13.5,color:C.text,lineHeight:1.7}}>{result.price_suggestion}</div>
            </div>
          </div>

          {/* Risks & Strengths */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div style={{background:C.roseBg,border:`1px solid ${C.roseMid}`,borderRadius:8,padding:"14px 16px"}}>
              <div style={{fontSize:11,color:C.text3,letterSpacing:"0.1em",marginBottom:8}}>⚠️ 潛在風險</div>
              {(result.risks||[]).map((r,i)=><div key={i} style={{fontSize:13,color:C.text,marginBottom:4,display:"flex",gap:6}}><span style={{color:C.rose,flexShrink:0}}>✕</span>{r}</div>)}
            </div>
            <div style={{background:C.sageBg,border:`1px solid ${C.sageMid}`,borderRadius:8,padding:"14px 16px"}}>
              <div style={{fontSize:11,color:C.text3,letterSpacing:"0.1em",marginBottom:8}}>✦ 主要優勢</div>
              {(result.strengths||[]).map((s,i)=><div key={i} style={{fontSize:13,color:C.text,marginBottom:4,display:"flex",gap:6}}><span style={{color:C.sage,flexShrink:0}}>✓</span>{s}</div>)}
            </div>
          </div>

          {/* Score comment */}
          <Callout icon="📊" variant="blue">
            <strong>評分解讀：</strong>{result.score_comment}
          </Callout>

          {/* Next steps */}
          <div style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,padding:"14px 16px"}}>
            <div style={{fontSize:11,color:C.text3,letterSpacing:"0.1em",marginBottom:8}}>📋 建議下一步</div>
            {(result.next_steps||[]).map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:6}}>
                <span style={{width:22,height:22,borderRadius:"50%",background:C.amberBg,color:C.amber,border:`1px solid ${C.amberMid}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,flexShrink:0,marginTop:1}}>{i+1}</span>
                <span style={{fontSize:13.5,color:C.text,lineHeight:1.7}}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════ PDF 匯出 ════════
function exportPDF(data) {
  const {mode,fields,ratings,chips,houses,note,items} = data;
  const avg = vals => vals.filter(v=>v>0).length ? vals.filter(v=>v>0).reduce((a,b)=>a+b,0)/vals.filter(v=>v>0).length : 0;
  const mainAvg = avg(items.map(i=>ratings[i]||0));
  const stars = n => "★".repeat(n)+"☆".repeat(5-n);
  const verdictTxt = !mainAvg?"尚未評分":mainAvg>=4?"強力推薦":mainAvg>=3?"值得考慮":"不建議";
  const verdictC = !mainAvg?"#b5a898":mainAvg>=4?"#6a8c72":mainAvg>=3?"#c47d2e":"#c0614a";

  const houseRows = houses.map(h=>{
    const vs=CMP_STAR_KEYS.map(k=>h.scores[k]).filter(v=>v>0);
    const a=vs.length?vs.reduce((x,y)=>x+y,0)/vs.length:0;
    return `<tr><td style="padding:8px 12px;border-bottom:1px solid #f0e8dc;font-weight:500">${h.name}</td>
      ${CMP_STAR_KEYS.map(k=>`<td style="padding:8px 12px;border-bottom:1px solid #f0e8dc;text-align:center">${h.scores[k]?stars(h.scores[k]):"—"}</td>`).join("")}
      <td style="padding:8px 12px;border-bottom:1px solid #f0e8dc;text-align:center;font-weight:700;color:${a>=4?"#6a8c72":a>=3?"#c47d2e":"#c0614a"}">${a?a.toFixed(1):"—"}</td></tr>`;
  }).join("");

  const html = `<!DOCTYPE html><html lang="zh-TW"><head><meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600&family=Noto+Sans+TC:wght@400;500&display=swap" rel="stylesheet">
  <title>看房報告</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Noto Sans TC',sans-serif;color:#37322a;background:#fff;padding:0}
    @page{margin:20mm 18mm}
    .cover{background:linear-gradient(135deg,#f5deb3,#e8c99a 40%,#d4a96a 70%,#c8906a);padding:48px 40px 36px;page-break-after:avoid}
    .cover-title{font-family:'Noto Serif TC',serif;font-size:34px;font-weight:600;color:#37322a;margin-bottom:6px}
    .cover-sub{font-size:13px;color:#7a6f62;letter-spacing:0.06em}
    .cover-meta{display:flex;gap:20px;margin-top:20px;flex-wrap:wrap}
    .cover-meta span{font-size:13px;color:#37322a;background:rgba(255,255,255,0.6);padding:4px 12px;border-radius:4px}
    .body{padding:32px 40px}
    h2{font-family:'Noto Serif TC',serif;font-size:18px;font-weight:600;color:#37322a;margin:28px 0 10px;border-left:3px solid #f5d9a0;padding-left:12px}
    .score-box{display:flex;align-items:center;gap:20px;background:linear-gradient(135deg,#fef8ec,#fdf2dc);border:1px solid #f5d9a0;border-radius:8px;padding:18px 22px;margin:10px 0}
    .score-big{font-family:'Noto Serif TC',serif;font-size:48px;font-weight:600;color:#c47d2e;line-height:1}
    .verdict{font-size:15px;font-weight:500}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:8px 0}
    .box{border-radius:6px;padding:14px 16px}
    .box-amber{background:#fef4e4;border:1px solid #f5d9a0}
    .box-sage{background:#eef4ef;border:1px solid #b8d4bc}
    .box-rose{background:#fef0ed;border:1px solid #f0c0b4}
    .box-label{font-size:10px;color:#b5a898;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px}
    .bar-row{display:flex;align-items:center;gap:10px;margin:5px 0}
    .bar-label{width:80px;font-size:11px;color:#7a6f62;text-align:right;flex-shrink:0}
    .bar-track{flex:1;height:5px;background:#f0e8dc;border-radius:3px;overflow:hidden}
    .bar-fill{height:100%;background:linear-gradient(90deg,#f5d9a0,#c47d2e);border-radius:3px}
    .bar-val{width:24px;font-size:11px;color:#b5a898;font-family:monospace}
    .chip{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;margin:3px 3px 3px 0}
    .chip-sage{background:#eef4ef;color:#6a8c72;border:1px solid #b8d4bc}
    .chip-rose{background:#fef0ed;color:#c0614a;border:1px solid #f0c0b4}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th{background:#fef4e4;padding:8px 12px;text-align:left;font-size:11px;color:#7a6f62;border-bottom:2px solid #f5d9a0}
    .note-box{background:#fdf8f2;border:1px solid #e8e0d4;border-radius:6px;padding:14px 16px;font-size:13px;line-height:1.8;color:#37322a;white-space:pre-wrap;min-height:60px}
    .footer{margin-top:40px;padding-top:14px;border-top:1px solid #f0e8dc;font-size:11px;color:#b5a898;display:flex;justify-content:space-between}
  </style></head><body>
  <div class="cover">
    <div style="font-size:48px;margin-bottom:12px">🏡</div>
    <div class="cover-title">看房報告</div>
    <div class="cover-sub">${mode==="rent"?"租屋":"買屋"} · ${new Date().toLocaleDateString("zh-TW")}</div>
    <div class="cover-meta">
      ${fields.address?`<span>📍 ${fields.address}</span>`:""}
      ${fields.price?`<span>💰 ${fields.price}</span>`:""}
      ${fields.date?`<span>📅 ${fields.date}</span>`:""}
      ${fields.agent?`<span>👤 ${fields.agent}</span>`:""}
    </div>
  </div>
  <div class="body">
    <h2>🎯 綜合評分</h2>
    <div class="score-box">
      <div class="score-big">${mainAvg?mainAvg.toFixed(1):"—"}</div>
      <div><div style="font-size:12px;color:#b5a898;margin-bottom:4px">滿分 5.0 · ${mode==="rent"?"租屋":"買屋"}模式</div>
        <div class="verdict" style="color:${verdictC}">${verdictTxt}</div></div>
    </div>

    <h2>📊 分項評分</h2>
    ${items.map(it=>`<div class="bar-row"><div class="bar-label">${it}</div><div class="bar-track"><div class="bar-fill" style="width:${(ratings[it]||0)/5*100}%"></div></div><div class="bar-val">${ratings[it]||"—"}</div></div>`).join("")}

    <h2>✅ 優缺點</h2>
    <div class="grid2">
      <div class="box box-sage"><div class="box-label">👍 優點</div>${(chips.pros||[]).map(t=>`<span class="chip chip-sage">${t}</span>`).join("")||"（未選擇）"}</div>
      <div class="box box-rose"><div class="box-label">👎 缺點</div>${(chips.cons||[]).map(t=>`<span class="chip chip-rose">${t}</span>`).join("")||"（未選擇）"}</div>
    </div>

    ${houses.length>0?`
    <h2>⚖️ 物件比較</h2>
    <div style="overflow-x:auto"><table>
      <thead><tr><th>物件</th>${CMP_STAR_KEYS.map(k=>`<th style="text-align:center">${k}</th>`).join("")}<th style="text-align:center">總分</th></tr></thead>
      <tbody>${houseRows}</tbody>
    </table></div>`:""}

    <h2>📝 現場備忘</h2>
    <div class="note-box">${note||"（未填寫）"}</div>

    <div class="footer">
      <span>看房筆記 · 自動生成報告</span>
      <span>${new Date().toLocaleString("zh-TW")}</span>
    </div>
  </div>
  <script>window.onload=()=>window.print();</script>
  </body></html>`;

  const win=window.open("","_blank");
  win.document.write(html);
  win.document.close();
}

// ════════════════════════════════════
//  主程式
// ════════════════════════════════════
const DEFAULT_STATE = {
  mode:"rent",
  rentFields:{address:"",price:"",size:"",layout:"",floor:"",condition:"",furniture:"",bath:"",pet:"",moveIn:"",lease:""},
  buyFields:{address:"",price:"",negotRange:"",size:"",layout:"",floor:"",age:"",project:"",buildType:"",parking:"",committee:"",fee:""},
  rentRatings:{}, buyRatings:{},
  rentChips:{pros:[],cons:[]}, buyChips:{pros:[],cons:[]},
  note:"", noteRisk:"",
  houses:[],
  weights: Object.fromEntries([...RENT_ITEMS,...BUY_ITEMS].map(i=>[i,2])),
};

export default function App() {
  const [tab,setTab]=useState("note");
  const [s,setS]=useState(()=>{
    try{
      const saved=localStorage.getItem(STORAGE_KEY);
      return saved?{...DEFAULT_STATE,...JSON.parse(saved)}:DEFAULT_STATE;
    }catch{return DEFAULT_STATE;}
  });
  const [saveFlash,setSaveFlash]=useState(false);

  // Auto-save
  useEffect(()=>{
    try{ localStorage.setItem(STORAGE_KEY,JSON.stringify(s)); }catch{}
    setSaveFlash(true);
    const t=setTimeout(()=>setSaveFlash(false),1200);
    return ()=>clearTimeout(t);
  },[s]);

  const u=(patch)=>setS(prev=>({...prev,...patch}));
  const mode=s.mode;
  const fields=mode==="rent"?s.rentFields:s.buyFields;
  const setFields=(f)=>u(mode==="rent"?{rentFields:{...s.rentFields,...f}}:{buyFields:{...s.buyFields,...f}});
  const ratings=mode==="rent"?s.rentRatings:s.buyRatings;
  const setRatings=(r)=>u(mode==="rent"?{rentRatings:{...s.rentRatings,...r}}:{buyRatings:{...s.buyRatings,...r}});
  const chips=mode==="rent"?s.rentChips:s.buyChips;
  const setChips=(c)=>u(mode==="rent"?{rentChips:{...s.rentChips,...c}}:{buyChips:{...s.buyChips,...c}});
  const items=mode==="rent"?RENT_ITEMS:BUY_ITEMS;

  const calcAvg=(rmap,its)=>{const vs=(its||items).map(i=>rmap[i]).filter(v=>v>0);return vs.length?vs.reduce((a,b)=>a+b,0)/vs.length:0;};
  const weightedAvg=(rmap,its)=>{let ws=0,wv=0;(its||items).forEach(i=>{const v=rmap[i]||0,w=s.weights[i]||2;if(v>0){ws+=w;wv+=v*w;}});return ws?wv/ws:0;};

  const RENT_PROS=["採光充足","通風良好","格局方正","近捷運站","生活機能佳","社區安靜","有停車位","有電梯","裝潢新穎","附傢俱","房東好溝通"];
  const RENT_CONS=["採光差","噪音嚴重","潮濕壁癌","水壓不足","屋況老舊","無對外窗","鄰近嫌惡設施","費用不透明"];
  const BUY_PROS=["採光充足","通風良好","格局方正","南北向","捷運直達","名校學區","低公設比","屋齡新","社區管理完善","停車方便","增值潛力佳"];
  const BUY_CONS=["採光差","西曬嚴重","屋齡老舊","漏水疑慮","格局畸零","公設比高","無管委會","海砂屋疑慮","鄰近嫌惡設施"];
  const prosData=mode==="rent"?RENT_PROS:BUY_PROS;
  const consData=mode==="rent"?RENT_CONS:BUY_CONS;

  function toggleChip(side,val){
    const arr=chips[side],on=arr.includes(val);
    setChips({[side]:on?arr.filter(x=>x!==val):[...arr,val]});
  }

  function addHouse(){
    if(s.houses.length>=MAX_HOUSES)return;
    const id=Date.now();
    u({houses:[...s.houses,{id,name:`物件 ${s.houses.length+1}`,scores:{},info:{}}]});
  }
  function removeHouse(id){u({houses:s.houses.filter(h=>h.id!==id)});}
  function updateHouseName(id,name){u({houses:s.houses.map(h=>h.id===id?{...h,name}:h)});}
  function updateHouseScore(id,key,val){u({houses:s.houses.map(h=>h.id===id?{...h,scores:{...h.scores,[key]:val}}:h)});}

  const navBtn=(id,label)=>(
    <button key={id} onClick={()=>setTab(id)} style={{padding:"12px 16px",fontSize:13,fontWeight:500,border:"none",background:"none",borderBottom:`2px solid ${tab===id?C.amber:"transparent"}`,color:tab===id?C.amber:C.text3,cursor:"pointer",transition:"all .15s",whiteSpace:"nowrap",fontFamily:"inherit"}}>{label}</button>
  );
  const modePill=(m,label)=>(
    <button key={m} onClick={()=>u({mode:m})} style={{padding:"5px 14px",borderRadius:20,fontSize:12,border:`1.5px solid ${mode===m?(m==="rent"?C.sage:C.amber):C.border}`,background:mode===m?(m==="rent"?C.sageBg:C.amberBg):C.surface,color:mode===m?(m==="rent"?C.sage:C.amber):C.text2,cursor:"pointer",transition:"all .15s",fontFamily:"inherit",fontWeight:500}}>{label}</button>
  );

  const chipStyle=(t,side,color)=>{
    const on=chips[side].includes(t);
    const map={sage:{bg:C.sageBg,c:C.sage,bd:C.sageMid,onBg:C.sage},rose:{bg:C.roseBg,c:C.rose,bd:C.roseMid,onBg:C.rose},amber:{bg:C.amberBg,c:C.amber,bd:C.amberMid,onBg:C.amber}};
    const m=map[color];
    return {padding:"4px 12px",borderRadius:20,fontSize:12.5,cursor:"pointer",border:`1.5px solid ${on?"transparent":m.bd}`,background:on?m.onBg:m.bg,color:on?"#fff":m.c,transition:"all .15s",userSelect:"none"};
  };

  return (
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Noto Sans TC',sans-serif",color:C.text}}>
      {/* NAV */}
      <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(249,246,241,0.95)",backdropFilter:"blur(10px)",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",padding:"0 28px",gap:0}}>
        {[["note","📋 看房筆記"],["compare","⚖️ 比較表格"],["score","🎯 評分系統"],["ai","🤖 AI 分析"]].map(([id,l])=>navBtn(id,l))}
        <div style={{flex:1}}/>
        {/* Save indicator */}
        <span style={{fontSize:11,color:saveFlash?C.sage:C.text3,marginRight:12,fontFamily:"monospace",transition:"color .3s"}}>
          {saveFlash?"✓ 已儲存":"自動儲存"}
        </span>
        <div style={{display:"flex",gap:6}}>
          {modePill("rent","🟢 租屋")}
          {modePill("buy","🟡 買屋")}
        </div>
      </div>

      <div style={{maxWidth:860,margin:"0 auto",padding:"0 36px 80px"}}>

        {/* ══ 看房筆記 ══ */}
        {tab==="note" && (
          <div>
            <div style={{height:150,background:"linear-gradient(135deg,#f5deb3,#e8c99a 35%,#d4a96a 65%,#c8906a)",borderRadius:"0 0 8px 8px",position:"relative",margin:"0 -36px"}}>
              <span style={{position:"absolute",bottom:-22,left:36,fontSize:64}}>🏡</span>
            </div>
            <div style={{paddingTop:44}}>
              <div contentEditable suppressContentEditableWarning style={{fontFamily:"'Noto Serif TC',serif",fontSize:36,fontWeight:600,outline:"none",marginBottom:12}}>看房筆記</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",paddingBottom:20,borderBottom:`1px solid ${C.border}`,marginBottom:4}}>
                {[["📅","date","date","date"],["📍","address","text","物件地址"],["👤","agent","text","仲介/屋主"]].map(([icon,key,type,ph])=>(
                  <div key={key} style={{display:"flex",alignItems:"center",gap:5,background:C.surface2,border:`1px solid ${C.border}`,borderRadius:4,padding:"3px 10px",fontSize:12}}>
                    {icon} <input type={type} value={fields[key]||""} onChange={e=>setFields({[key]:e.target.value})} placeholder={ph}
                      style={{border:"none",outline:"none",background:"transparent",fontSize:12,fontFamily:"inherit",color:C.text,width:type==="date"?"130px":"110px"}}/>
                  </div>
                ))}
              </div>
            </div>

            <H1>🗒 基本資訊</H1>
            {mode==="rent"?(
              <div>
                <PropRow label="💰 月租金"><FieldInput value={fields.price} onChange={v=>setFields({price:v})} placeholder="25,000 元 / 月"/></PropRow>
                <PropRow label="🔑 押金"><FieldInput value={fields.deposit} onChange={v=>setFields({deposit:v})} placeholder="2個月"/></PropRow>
                <PropRow label="📐 坪數"><FieldInput value={fields.size} onChange={v=>setFields({size:v})} placeholder="15 坪"/></PropRow>
                <PropRow label="🏢 格局"><FieldInput value={fields.layout} onChange={v=>setFields({layout:v})} placeholder="1房1廳1衛"/></PropRow>
                <PropRow label="🏗 樓層/總樓"><FieldInput value={fields.floor} onChange={v=>setFields({floor:v})} placeholder="3F / 8F"/></PropRow>
                <PropRow label="🏠 屋況"><FieldSelect value={fields.condition} onChange={v=>setFields({condition:v})} options={["全新裝潢","屋況良好","普通","需整理"]}/></PropRow>
                <PropRow label="📦 傢俱家電"><FieldSelect value={fields.furniture} onChange={v=>setFields({furniture:v})} options={["全配","半配","空屋"]}/></PropRow>
                <PropRow label="🐾 寵物/開伙"><FieldInput value={fields.pet} onChange={v=>setFields({pet:v})} placeholder="寵物不可 / 開伙可"/></PropRow>
                <PropRow label="📄 租約期"><FieldSelect value={fields.lease} onChange={v=>setFields({lease:v})} options={["半年","1年","2年","彈性"]}/></PropRow>
              </div>
            ):(
              <div>
                <PropRow label="💰 開價（萬）"><FieldInput value={fields.price} onChange={v=>setFields({price:v})} placeholder="1,580 萬"/></PropRow>
                <PropRow label="🤝 議價幅度"><FieldInput value={fields.negotRange} onChange={v=>setFields({negotRange:v})} placeholder="約 3~5%"/></PropRow>
                <PropRow label="📐 權狀/室內坪"><FieldInput value={fields.size} onChange={v=>setFields({size:v})} placeholder="38 / 28 坪"/></PropRow>
                <PropRow label="🏢 格局"><FieldInput value={fields.layout} onChange={v=>setFields({layout:v})} placeholder="3房2廳2衛"/></PropRow>
                <PropRow label="🏗 樓層/總樓"><FieldInput value={fields.floor} onChange={v=>setFields({floor:v})} placeholder="5F / 14F"/></PropRow>
                <PropRow label="🗓 屋齡"><FieldInput value={fields.age} onChange={v=>setFields({age:v})} placeholder="12 年"/></PropRow>
                <PropRow label="🏛 建築形式"><FieldSelect value={fields.buildType} onChange={v=>setFields({buildType:v})} options={["大樓","華廈","公寓","透天","別墅"]}/></PropRow>
                <PropRow label="🚗 車位"><FieldSelect value={fields.parking} onChange={v=>setFields({parking:v})} options={["含車位","另購（含）","另購（不含）","無"]}/></PropRow>
                <PropRow label="🏚 管委會"><FieldSelect value={fields.committee} onChange={v=>setFields({committee:v})} options={["有（運作良好）","有（較鬆散）","無"]}/></PropRow>
                <PropRow label="💳 管理費（月）"><FieldInput value={fields.fee} onChange={v=>setFields({fee:v})} placeholder="2,500 元"/></PropRow>
              </div>
            )}

            <Divider/>
            <H1>⭐ 環境評分</H1>
            {items.map(item=>(
              <PropRow key={item} label={`⭑ ${item}`}>
                <Stars value={ratings[item]||0} onChange={v=>setRatings({[item]:v})}/>
              </PropRow>
            ))}

            <Divider/>
            <H1>✅ 優缺點</H1>
            <div style={{fontSize:14,fontWeight:500,color:C.text2,margin:"12px 0 6px"}}>👍 優點</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {prosData.map(t=><span key={t} onClick={()=>toggleChip("pros",t)} style={chipStyle(t,"pros","sage")}>{t}</span>)}
            </div>
            <div style={{fontSize:14,fontWeight:500,color:C.text2,margin:"12px 0 6px"}}>👎 缺點</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {consData.map(t=><span key={t} onClick={()=>toggleChip("cons",t)} style={chipStyle(t,"cons","rose")}>{t}</span>)}
            </div>

            <Divider/>
            <H1>📝 備忘</H1>
            <div style={{background:C.sageBg,borderLeft:`3px solid ${C.sageMid}`,borderRadius:4,padding:"12px 14px",margin:"6px 0"}}>
              <textarea value={s.note} onChange={e=>u({note:e.target.value})} rows={4} placeholder="記錄第一印象、特殊條件、協商空間…"
                style={{border:"none",outline:"none",background:"transparent",fontFamily:"inherit",fontSize:13.5,color:C.text,lineHeight:1.8,resize:"none",width:"100%"}}/>
            </div>
            {mode==="buy"&&(
              <div style={{background:C.roseBg,borderLeft:`3px solid ${C.roseMid}`,borderRadius:4,padding:"12px 14px",margin:"6px 0"}}>
                <textarea value={s.noteRisk} onChange={e=>u({noteRisk:e.target.value})} rows={3} placeholder="注意：海砂屋/輻射屋/凶宅？鄰近嫌惡設施？"
                  style={{border:"none",outline:"none",background:"transparent",fontFamily:"inherit",fontSize:13.5,color:C.text,lineHeight:1.8,resize:"none",width:"100%"}}/>
              </div>
            )}

            <Divider/>
            <ScoreCard score={calcAvg(ratings)>0?calcAvg(ratings):null} sub={`滿分 5.0 · 已評 ${Object.values(ratings).filter(v=>v>0).length}/${items.length} 項`}/>

            {/* PDF export */}
            <button onClick={()=>exportPDF({mode,fields,ratings,chips,houses:s.houses,note:s.note,items})}
              style={{display:"flex",alignItems:"center",gap:8,marginTop:12,padding:"9px 20px",borderRadius:7,border:`1.5px solid ${C.amberMid}`,background:C.amberBg,color:C.amber,fontSize:13.5,fontFamily:"inherit",cursor:"pointer",transition:"all .15s",fontWeight:500}}>
              📄 匯出 PDF 報告
            </button>
          </div>
        )}

        {/* ══ 比較表格 ══ */}
        {tab==="compare"&&(
          <div>
            <H1>⚖️ 物件比較表</H1>
            <Callout icon="💡" variant="blue">最多比較 10 間物件，星評自動計算總分並顯示建議。</Callout>
            <div style={{margin:"16px 0 12px",display:"flex",alignItems:"center",gap:12}}>
              <button onClick={addHouse} disabled={s.houses.length>=MAX_HOUSES}
                style={{display:"flex",alignItems:"center",gap:6,padding:"7px 16px",borderRadius:6,border:`1.5px dashed ${C.amberMid}`,background:C.amberBg,color:C.amber,fontSize:13,cursor:s.houses.length>=MAX_HOUSES?"not-allowed":"pointer",fontFamily:"inherit",opacity:s.houses.length>=MAX_HOUSES?.5:1}}>
                ＋ 新增物件
              </button>
              <span style={{fontSize:12,color:C.text3,fontFamily:"monospace"}}>目前 {s.houses.length} 間 · 最多 10 間</span>
            </div>
            {s.houses.length===0?(
              <div style={{textAlign:"center",padding:"60px 0",color:C.text3,fontSize:14}}>點擊「新增物件」開始比較</div>
            ):(
              <div style={{overflowX:"auto",borderRadius:8,border:`1px solid ${C.border}`}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13.5,background:C.surface,minWidth:460}}>
                  <thead>
                    <tr style={{background:"linear-gradient(135deg,#fef4e4,#fdf0d8)"}}>
                      <th style={{padding:"11px 14px",textAlign:"left",fontSize:11,color:C.text3,letterSpacing:"0.08em",textTransform:"uppercase",borderBottom:`2px solid ${C.amberMid}`,minWidth:110,position:"sticky",left:0,background:"linear-gradient(135deg,#fef4e4,#fdf0d8)"}}>評分項目</th>
                      {s.houses.map(h=>(
                        <th key={h.id} style={{padding:"8px 12px",textAlign:"left",fontSize:13,borderBottom:`2px solid ${C.amberMid}`,minWidth:140,position:"relative"}}>
                          <input value={h.name} onChange={e=>updateHouseName(h.id,e.target.value)}
                            style={{border:"none",outline:"none",background:"transparent",fontFamily:"inherit",fontSize:13,fontWeight:500,color:C.text,width:"calc(100% - 24px)"}}/>
                          <button onClick={()=>removeHouse(h.id)}
                            style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.text3,fontSize:14,padding:"2px 4px",borderRadius:3}}>✕</button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[["📍 地址","addr"],["💰 開價/月租","price"],["📐 坪數","size"],["🏗 樓層","floor"],["🗓 屋齡","age"]].map(([label,key])=>(
                      <tr key={key} style={{borderBottom:`1px solid ${C.border2}`}}>
                        <td style={{padding:"8px 14px",fontSize:12.5,color:C.text2,background:C.surface2,fontWeight:500,position:"sticky",left:0}}>{label}</td>
                        {s.houses.map(h=>(
                          <td key={h.id} style={{padding:"6px 12px"}}>
                            <input placeholder="—" style={{border:"none",outline:"none",background:"transparent",fontFamily:"inherit",fontSize:13,color:C.text,width:"100%"}}/>
                          </td>
                        ))}
                      </tr>
                    ))}
                    {CMP_STAR_KEYS.map(key=>(
                      <tr key={key} style={{borderBottom:`1px solid ${C.border2}`}}>
                        <td style={{padding:"8px 14px",fontSize:12.5,color:C.text2,background:C.surface2,fontWeight:500,position:"sticky",left:0}}>⭑ {key}</td>
                        {s.houses.map(h=>(
                          <td key={h.id} style={{padding:"6px 12px"}}>
                            <Stars value={h.scores[key]||0} onChange={v=>updateHouseScore(h.id,key,v)} size={16}/>
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr style={{background:"linear-gradient(135deg,#fef8ec,#fdf4e0)",fontWeight:600,borderTop:`2px solid ${C.amberMid}`}}>
                      <td style={{padding:"10px 14px",fontSize:12.5,color:C.text2,position:"sticky",left:0,background:"linear-gradient(135deg,#fef8ec,#fdf4e0)"}}>🎯 綜合評分</td>
                      {s.houses.map(h=>{
                        const vs=CMP_STAR_KEYS.map(k=>h.scores[k]).filter(v=>v>0);
                        const a=vs.length?vs.reduce((x,y)=>x+y,0)/vs.length:0;
                        const sortedAvgs=[...s.houses].map(hh=>{const vvs=CMP_STAR_KEYS.map(k=>hh.scores[k]).filter(v=>v>0);return vvs.length?vvs.reduce((x,y)=>x+y,0)/vvs.length:0;}).sort((a,b)=>b-a);
                        const isTop=a>0&&a===sortedAvgs[0];
                        const cls=isTop?{bg:C.sageBg,c:C.sage,bd:C.sageMid}:a>=3?{bg:C.amberBg,c:C.amber,bd:C.amberMid}:a>0?{bg:C.roseBg,c:C.rose,bd:C.roseMid}:{bg:C.surface2,c:C.text3,bd:C.border};
                        return (
                          <td key={h.id} style={{padding:"8px 12px"}}>
                            <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",minWidth:42,padding:"4px 10px",borderRadius:20,fontFamily:"monospace",fontSize:13,fontWeight:600,background:cls.bg,color:cls.c,border:`1.5px solid ${cls.bd}`}}>
                              {a?a.toFixed(1):"—"}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                    <tr style={{borderTop:`1px solid ${C.amberMid}`}}>
                      <td style={{padding:"8px 14px",fontSize:12.5,color:C.text2,background:C.surface2,position:"sticky",left:0}}>💬 建議</td>
                      {s.houses.map(h=>{
                        const vs=CMP_STAR_KEYS.map(k=>h.scores[k]).filter(v=>v>0);
                        const a=vs.length?vs.reduce((x,y)=>x+y,0)/vs.length:0;
                        const v=!a?{t:"—",bg:C.surface2,c:C.text3}:a>=4?{t:"✦ 推薦",bg:C.sageBg,c:C.sage}:a>=3?{t:"◈ 考慮",bg:C.amberBg,c:C.amber}:{t:"✕ 不建議",bg:C.roseBg,c:C.rose};
                        return <td key={h.id} style={{padding:"8px 12px"}}><span style={{padding:"4px 10px",borderRadius:20,fontSize:12,background:v.bg,color:v.c}}>{v.t}</span></td>;
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══ 評分系統 ══ */}
        {tab==="score"&&(
          <div>
            <H1>🎯 綜合評分總覽</H1>
            <ScoreCard score={calcAvg(ratings)>0?calcAvg(ratings):null} sub={`滿分 5.0 · 已評 ${Object.values(ratings).filter(v=>v>0).length}/${items.length} 項（${mode==="rent"?"租屋":"買屋"}）`}/>
            <Divider/>
            <H1>📊 分項得分</H1>
            {items.map(item=>{
              const v=ratings[item]||0;
              return (
                <div key={item} style={{display:"flex",alignItems:"center",gap:10,margin:"6px 0"}}>
                  <div style={{width:88,fontSize:12,color:C.text2,textAlign:"right",flexShrink:0}}>{item}</div>
                  <div style={{flex:1,height:6,background:C.border2,borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${v/5*100}%`,background:`linear-gradient(90deg,${C.amberMid},${C.amber})`,borderRadius:3,transition:"width .5s"}}/>
                  </div>
                  <div style={{width:28,fontSize:12,color:C.text3,fontFamily:"monospace"}}>{v||"—"}</div>
                </div>
              );
            })}
            <Divider/>
            <H1>🕸 雷達圖</H1>
            <Radar items={items} values={items.map(i=>ratings[i]||0)}/>
            <Divider/>
            <H1>⚖️ 加權評分</H1>
            <Callout icon="🎛" variant="amber">調整各項目重要性（1–3★），計算個人化加權分數。</Callout>
            {items.map(item=>(
              <PropRow key={item} label={`⚖️ ${item}`}>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  {[1,2,3].map(w=>(
                    <label key={w} style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontSize:13,color:s.weights[item]===w?C.amber:C.text2}}>
                      <input type="radio" name={`w_${item}`} checked={(s.weights[item]||2)===w} onChange={()=>u({weights:{...s.weights,[item]:w}})} style={{accentColor:C.amber}}/>
                      {"★".repeat(w)}{"☆".repeat(3-w)}
                    </label>
                  ))}
                  <span style={{marginLeft:"auto",fontSize:12,color:C.text3,fontFamily:"monospace"}}>得分:{ratings[item]||"—"}</span>
                </div>
              </PropRow>
            ))}
            <ScoreCard score={weightedAvg(ratings)>0?weightedAvg(ratings):null} sub="加權後綜合分數（滿分 5.0）"/>
            <Divider/>
            <H1>🏆 物件排行榜</H1>
            {s.houses.length===0?(
              <Callout icon="📋" variant="blue">請先在「比較表格」新增物件並給分，排行榜將自動更新。</Callout>
            ):(
              <div>
                {[...s.houses].map(h=>({h,a:CMP_STAR_KEYS.map(k=>h.scores[k]).filter(v=>v>0).reduce((s,v,_,a)=>a.length?s+v/a.length:0,0)}))
                  .sort((a,b)=>b.a-a.a)
                  .map(({h,a},i)=>{
                    const medal=["🥇","🥈","🥉"][i]||`#${i+1}`;
                    const vBg=a>=4?C.sageBg:a>=3?C.amberBg:a>0?C.roseBg:C.surface2;
                    const vC=a>=4?C.sage:a>=3?C.amber:a>0?C.rose:C.text3;
                    return (
                      <div key={h.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:6,margin:"4px 0",background:i===0?C.amberBg:C.surface2,border:`1px solid ${i===0?C.amberMid:C.border2}`}}>
                        <span style={{fontSize:20}}>{medal}</span>
                        <span style={{flex:1,fontSize:14,color:C.text,fontWeight:i===0?600:400}}>{h.name}</span>
                        <span style={{padding:"4px 12px",borderRadius:20,fontFamily:"monospace",fontSize:13,fontWeight:600,background:vBg,color:vC}}>{a?a.toFixed(1):"—"}</span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ══ AI 分析 ══ */}
        {tab==="ai"&&(
          <AIPanel
            houses={s.houses}
            mode={mode}
            currentRatings={ratings}
            currentFields={fields}
            currentChips={chips}
          />
        )}
      </div>

      {/* 底部狀態列 */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(249,246,241,0.94)",backdropFilter:"blur(8px)",borderTop:`1px solid ${C.border}`,padding:"10px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:12,fontFamily:"monospace",color:C.text3,zIndex:99}}>
        <span>{mode==="rent"?"租屋模式":"買屋模式"} · 資料自動儲存於本機</span>
        <button onClick={()=>exportPDF({mode,fields,ratings,chips,houses:s.houses,note:s.note,items})}
          style={{padding:"6px 14px",borderRadius:6,border:`1px solid ${C.border}`,background:C.surface,fontFamily:"'Noto Sans TC',sans-serif",fontSize:12.5,color:C.text2,cursor:"pointer"}}>
          📄 匯出 PDF
        </button>
      </div>
    </div>
  );
}
