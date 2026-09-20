/* Your Life, In Receipts - app logic */
const D=window.__RECEIPTS__,R=D.receipts;
const C={music:'#7ee0c5',food:'#ffb86b',travel:'#7aa7ff',home:'#c08bff',sub:'#ff9ed2',health:'#ff7a7a',apparel:'#ffd86b',money:'#6be0a0',income:'#8ef0a8',people:'#ffa8f0',learn:'#a0d8ff',event:'#ffcf6b',note:'#9b93ab'};
const LBL={music:'Music',food:'Food',travel:'Travel',home:'Home',sub:'Subscriptions',health:'Health',apparel:'Apparel',money:'Money',income:'Income',people:'People',learn:'Learning',event:'Events',note:'Notes'};
const $=id=>document.getElementById(id),fm=n=>n>=1e5?(n/1e5).toFixed(1)+'L':n>=1000?(n/1000).toFixed(1)+'k':Math.round(n);
const VIEWS=[['open','Overture'],['chapters','Chapters'],['web','Constellation'],['patterns','Patterns'],['archive','Archive']];
let view='open';
$('tabs').innerHTML=VIEWS.map(([k,l])=>`<button class="tab${k==view?' on':''}" data-v="${k}">${l}</button>`).join('');
$('tabs').onclick=e=>{const b=e.target.closest('[data-v]');if(!b)return;go(b.dataset.v)};
function go(v){view=v;VIEWS.forEach(([k])=>$('v-'+k).classList.toggle('hide',k!=v));
 document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t.dataset.v==v));window.scrollTo({top:0,behavior:'instant'})}

/* ---------- OVERTURE ---------- */
const M=D.meta;
$('stats').innerHTML=[[fm(M.plays),'songs played'],[M.hrs+'h','listening time'],['₹'+fm(M.spend),'spent'],[M.uniq_art,'artists met'],[D.moments.length,'scenes found'],[M.lifehrs+'h','lifetime, 2013–24']]
 .map(([a,b])=>`<div class="stat"><b>${a}</b><small>${b}</small></div>`).join('');
const nightPct=Math.round(100*(D.hours.slice(0,5).reduce((a,b)=>a+b,0))/D.hours.reduce((a,b)=>a+b,0));
$('thesis').innerHTML=`Read separately, a ₹30 train ticket and a 2&nbsp;AM Beatles record have nothing to do with each other.<br>Read together, they are the same Tuesday. ${nightPct}% of all listening happened between midnight and 5&nbsp;AM — this was a person who lived in the hours nobody else was awake in.`;

/* ---------- CHAPTERS ---------- */
const CH=D.chapters;
function chapTitle(c,i){const a=c.artists[0]?.n||'silence',cat=c.cats[0]?.n||'—';
 const night=c.night>.18,heavy=c.hrs>350,disc=c.newart>90;
 const t=[night?'The Small Hours':null,disc?'Open Season':null,heavy?'Total Immersion':null,cat=='Food'?'Everything Is Food':null][0]
  ||(disc?'Open Season':heavy?'Total Immersion':night?'The Small Hours':'Steady State');
 return t}
function chapStory(c){
 const a=c.artists.slice(0,3).map(x=>x.n),tot=c.cats.reduce((s,x)=>s+x.v,0)||1;
 const top=c.cats[0],share=top?Math.round(100*top.v/tot):0;
 const np=Math.round(c.night*100);
 return `${c.hrs} hours of music, ${c.newart} artists they'd never heard before. ${a[0]||'—'} led${a[1]?`, with ${a[1]} and ${a[2]||'others'} close behind`:''}. ₹${fm(c.spend)} left the account across ${c.tx} transactions — ${share}% of it on ${top?top.n.toLowerCase():'nothing'}. ${np}% of plays after midnight.`}
function per(p){const y=p.slice(0,4),h=p.slice(-1);return (h=='1'?'Jan–Jun ':'Jul–Dec ')+y}
let era=null;
function drawChaps(){
 $('chaps').innerHTML=CH.map((c,i)=>{const tot=c.cats.reduce((s,x)=>s+x.v,0)||1;
  return `<div class="card chap${era===i?' on':''}" data-c="${i}">
   <div class="era">${per(c.p)} · Chapter ${i+1}</div>
   <div class="ttl">${chapTitle(c,i)}</div>
   <p>${chapStory(c)}</p>
   <div class="bars">${c.cats.map(x=>`<i style="width:${100*x.v/tot}%;background:${C[({Food:'food',Transportation:'travel',Household:'home',subscription:'sub',Health:'health',Apparel:'apparel',Investment:'money'})[x.n]]||'#9b93ab'}"></i>`).join('')}</div>
   <div class="legend">${c.cats.slice(0,4).map(x=>`<span><i style="background:${C[({Food:'food',Transportation:'travel',Household:'home',subscription:'sub',Health:'health',Apparel:'apparel',Investment:'money'})[x.n]]||'#9b93ab'}"></i>${x.n} ₹${fm(x.v)}</span>`).join('')}</div>
  </div>`}).join('');
 $('chapDetail').innerHTML=era===null?'':(()=>{const c=CH[era],mx=c.artists[0]?.v||1;
  const dm=D.moments.filter(m=>m.d>=c.from&&m.d<=c.to).slice(0,4);
  return `<div class="card"><div class="kicker">Inside ${per(c.p)}</div>
   <div class="two" style="margin-top:14px"><div><div class="rit">${c.artists.map(a=>`<div><span style="color:var(--ink)">${a.n}</span><u style="width:${Math.max(6,100*a.v/mx)}%"></u><span>${a.v}h</span></div>`).join('')}</div></div>
   <div><div class="mlist" style="max-height:none">${dm.length?dm.map(m=>momCard(m)).join(''):'<p class="t3" style="color:var(--dim)">No multi-signal scenes in this era.</p>'}</div></div></div></div>`})();
}
$('chaps').onclick=e=>{const b=e.target.closest('[data-c]');if(!b)return;era=era==+b.dataset.c?null:+b.dataset.c;drawChaps();};
drawChaps();

/* ---------- CONSTELLATION ---------- */
const MO=D.moments;let sel=0,wmode='scene';
$('webMode').innerHTML=[['scene','Scene view'],['type','Type web']].map(([k,l])=>`<button class="f${k==wmode?' on':''}" data-w="${k}" style="${k==wmode?'background:var(--acc2);border-color:var(--acc2)':''}">${l}</button>`).join('');
$('webMode').onclick=e=>{const b=e.target.closest('[data-w]');if(!b)return;wmode=b.dataset.w;
 [...$('webMode').children].forEach(c=>{const on=c.dataset.w==wmode;c.classList.toggle('on',on);c.style.cssText=on?'background:var(--acc2);border-color:var(--acc2)':''});draw()};
function sceneTitle(m){const t=m.types;const has=x=>t.includes(x);
 if(m.late&&has('travel'))return 'A night that ended somewhere else';
 if(m.late)return 'The 2 AM version of this person';
 if(has('health'))return 'A day the body asked for something';
 if(has('travel')&&has('food')&&m.spend>500)return 'Out, and paying for it';
 if(has('income'))return 'Money arrived. Then it moved.';
 if(has('people'))return 'A day spent on other people';
 if(has('sub'))return 'Quiet maintenance of a life';
 return 'An ordinary day, densely recorded'}
function momCard(m){return `<button class="mom${MO[sel]&&MO[sel].d==m.d?' on':''}" data-m="${MO.indexOf(m)}">
 <div class="d">${new Date(m.d).toDateString().toUpperCase()}${m.late?' · 02:00':''}</div>
 <div class="h">${sceneTitle(m)}</div>
 <div class="chips">${m.types.map(t=>`<span class="chip" style="color:${C[t]};background:${C[t]}1c">${LBL[t]||t}</span>`).join('')}${m.spend?`<span class="chip">₹${fm(m.spend)}</span>`:''}${m.mins?`<span class="chip">${Math.round(m.mins)} min played</span>`:''}</div></button>`}
$('moms').onclick=e=>{const b=e.target.closest('[data-m]');if(!b)return;sel=+b.dataset.m;wmode='scene';drawMoms();draw()};
document.addEventListener('click',e=>{const b=e.target.closest('#chapDetail [data-m]');if(!b)return;sel=+b.dataset.m;go('web');drawMoms();draw()});
function drawMoms(){$('moms').innerHTML=MO.map(m=>momCard(m)).join('')}
function tip(a,b,c){$('tip').innerHTML=`<div class="t1">${a}</div><div class="t2">${b}</div><div class="t3">${c}</div>`}
function draw(){
 const s=$('svg');let h='';
 if(wmode=='scene'){
  const m=MO[sel],ids=m.ids,n=ids.length,cx=260,cy=200;
  h+=`<defs><radialGradient id="g"><stop offset="0" stop-color="#ffb86b33"/><stop offset="1" stop-color="transparent"/></radialGradient></defs>`;
  h+=`<circle cx="${cx}" cy="${cy}" r="150" fill="url(#g)"/><circle cx="${cx}" cy="${cy}" r="118" fill="none" stroke="#ffffff10"/><circle cx="${cx}" cy="${cy}" r="72" fill="none" stroke="#ffffff0a"/>`;
  const pts=ids.map((id,i)=>{const r=R[id],ang=(r.h/24)*2*Math.PI-Math.PI/2,rad=68+(i%3)*26+(r.t=='music'?16:0);
   return{id,x:cx+Math.cos(ang)*rad,y:cy+Math.sin(ang)*rad,r:R[id]}});
  pts.forEach((p,i)=>pts.slice(i+1).forEach(q=>{const dh=Math.abs(p.r.h-q.r.h);
   if(dh<=3&&p.r.t!=q.r.t)h+=`<line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" stroke="${C[p.r.t]}" stroke-opacity=".3" stroke-width="1"/>`}));
  h+=`<text x="${cx}" y="${cy-6}" text-anchor="middle" fill="#f4efe6" font-family="Fraunces,serif" font-size="17">${new Date(m.d).toDateString().split(' ').slice(1,3).join(' ')}</text>
      <text x="${cx}" y="${cy+13}" text-anchor="middle" fill="#8d8797" font-family="JetBrains Mono,monospace" font-size="10">${new Date(m.d).getFullYear()} · ${ids.length} receipts</text>`;
  pts.forEach(p=>{const sz=p.r.t=='music'?Math.min(13,5+(p.r.m||0)/14):Math.min(13,5+Math.log(1+(p.r.a||1))*1.6);
   h+=`<g class="node" data-r="${p.id}"><circle cx="${p.x}" cy="${p.y}" r="${sz}" fill="${C[p.r.t]}" fill-opacity=".85" stroke="${C[p.r.t]}" stroke-opacity=".4" stroke-width="6"/></g>`});
  h+=`<text x="260" y="396" text-anchor="middle" fill="#57506a" font-family="JetBrains Mono,monospace" font-size="9">ANGLE = HOUR OF DAY · SIZE = INTENSITY · LINE = WITHIN 3 HOURS</text>`;
 }else{
  const co={},tot={};
  Object.values(D.days).forEach(d=>{const t=d.types;t.forEach(a=>{tot[a]=(tot[a]||0)+1;t.forEach(b=>{if(a<b)co[a+'|'+b]=(co[a+'|'+b]||0)+1})})});
  const ts=Object.keys(tot).sort((a,b)=>tot[b]-tot[a]),cx=260,cy=195,mx=Math.max(...Object.values(co));
  const P={};ts.forEach((t,i)=>{const a=(i/ts.length)*2*Math.PI-Math.PI/2;P[t]={x:cx+Math.cos(a)*135,y:cy+Math.sin(a)*118}});
  Object.entries(co).forEach(([k,v])=>{const[a,b]=k.split('|');if(!P[a]||!P[b]||v<8)return;
   h+=`<line x1="${P[a].x}" y1="${P[a].y}" x2="${P[b].x}" y2="${P[b].y}" stroke="#fff" stroke-opacity="${.05+.5*v/mx}" stroke-width="${.5+3.5*v/mx}"/>`});
  ts.forEach(t=>{const r=8+Math.min(22,Math.sqrt(tot[t])*1.7);
   h+=`<g class="node" data-t="${t}"><circle cx="${P[t].x}" cy="${P[t].y}" r="${r}" fill="${C[t]}" fill-opacity=".8"/>
   <text x="${P[t].x}" y="${P[t].y+r+13}" text-anchor="middle" fill="#8d8797" font-family="JetBrains Mono,monospace" font-size="9.5">${(LBL[t]||t).toUpperCase()}</text></g>`});
  h+=`<text x="260" y="400" text-anchor="middle" fill="#57506a" font-family="JetBrains Mono,monospace" font-size="9">THICKER LINE = THESE TWO SHOW UP ON THE SAME DAY MORE OFTEN</text>`;
  tip('The type web','How the categories co-occur','Every line is a real habit: days where food and music both appear, days where travel drags spending with it. Tap a hub.');
 }
 s.innerHTML=h;
 s.querySelectorAll('[data-r]').forEach(g=>{const f=()=>{const r=R[+g.dataset.r];
  tip(`${r.ti} · ${LBL[r.t]||r.t}`,r.n||'(untitled)',r.t=='music'?`${r.s} — ${r.c} track${r.c>1?'s':''}, ${r.m} minutes${r.sk?`, ${r.sk} skipped`:''}. Album: ${r.al}.`:`${r.s}${r.a?` · ₹${r.a.toLocaleString('en-IN')} via ${r.md}`:''}`)};
  g.onmouseenter=f;g.onclick=f});
 s.querySelectorAll('[data-t]').forEach(g=>{const t=g.dataset.t,f=()=>{const rs=R.filter(r=>r.t==t);
  const spend=rs.reduce((a,b)=>a+(b.a||0),0);
  tip(LBL[t]||t,`${rs.length} receipts`,t=='music'?`${Math.round(rs.reduce((a,b)=>a+(b.m||0),0)/60)} hours across ${rs.length} listening sessions.`:`₹${Math.round(spend).toLocaleString('en-IN')} total. Most common: ${Object.entries(rs.reduce((m,r)=>(m[r.s]=(m[r.s]||0)+1,m),{})).sort((a,b)=>b[1]-a[1])[0][0]}.`)};
  g.onmouseenter=f;g.onclick=f});
}
drawMoms();draw();

/* ---------- PATTERNS ---------- */
const mh=Math.max(...D.hours),ms=Math.max(...D.shours);
$('clock').innerHTML=D.hours.map((v,i)=>`<div title="${i}:00"><b style="height:${72*v/mh}px;background:${C.music}"></b><b style="height:${52*D.shours[i]/ms}px;background:${C.food};opacity:.85"></b></div>`).join('');
$('clockAxis').innerHTML=[0,4,8,12,16,20,23].map(h=>`<span>${String(h).padStart(2,'0')}</span>`).join('');
const peak=D.hours.indexOf(mh),speak=D.shours.indexOf(ms);
$('clockNote').innerHTML=`Music peaks at <b style="color:${C.music}">${peak}:00</b>. Money moves at <b style="color:${C.food}">${speak}:00</b>. The two halves of this person barely overlap — the spender is a daytime creature, the listener is not.`;
const rmx=D.rituals[0].v;
$('rituals').innerHTML=D.rituals.map(r=>`<div><span style="color:var(--ink)">${r.n}</span><u style="width:${Math.max(5,100*r.v/rmx)}%"></u><span>${r.v}×</span></div>`).join('');
const hmx=Math.max(...Object.values(D.days).map(d=>d.mins||0)),smx=Math.max(...Object.values(D.days).map(d=>d.spend||0));
let hh='',cur=new Date('2015-01-05');const end=new Date('2018-10-01');
while(cur<end){const k=cur.toISOString().slice(0,10),d=D.days[k];
 let col='#ffffff0a';if(d){const m=(d.mins||0)/hmx,p=(d.spend||0)/smx;
  col=m>.02&&p>.02?`rgba(192,139,255,${.28+Math.min(.72,(m+p))})`:m>.02?`rgba(126,224,197,${.22+Math.min(.78,m*4)})`:p>.02?`rgba(255,184,107,${.22+Math.min(.78,p*4)})`:'#ffffff14'}
 hh+=`<i style="background:${col}" data-d="${k}"></i>`;cur.setDate(cur.getDate()+1)}
$('heat').innerHTML=hh;
$('heat').addEventListener('mouseover',e=>{const k=e.target.dataset?.d;if(!k)return;const d=D.days[k];
 $('heatTip').innerHTML=d?`<b style="color:var(--ink)">${new Date(k).toDateString()}</b> — ${d.n} receipts · ${d.mins?d.mins+' min of music':'no music'}${d.spend?` · ₹${d.spend.toLocaleString('en-IN')} spent`:''}${d.late?' · played past 2 AM':''}`:`<b style="color:var(--dim)">${new Date(k).toDateString()}</b> — nothing recorded. A silent day.`});
$('heat').addEventListener('click',e=>{const k=e.target.dataset?.d;if(!k||!D.days[k])return;const i=MO.findIndex(m=>m.d==k);
 if(i>=0){sel=i;go('web');drawMoms();draw()}else{$('q').value=k;go('archive');qy=k;render(true)}});
const lmx=D.artists[0].hrs;
$('loyal').innerHTML=D.artists.slice(0,12).map(a=>`<div><span style="color:var(--ink);cursor:pointer" data-a="${a.n}">${a.n}</span><u style="width:${Math.max(5,100*a.hrs/lmx)}%"></u><span>${a.hrs}h</span></div>`).join('');
$('loyal').onclick=e=>{const a=e.target.dataset?.a;if(!a)return;$('q').value=a;qy=a.toLowerCase();go('archive');render(true)};
$('loyalNote').innerHTML=`Across 11 years and ${fm(M.lifeplays)} plays, ${D.artists[0].n} never left. Tastes widened — ${M.uniq_art} artists passed through the 2015–18 window alone — but the centre held. Click any name to pull every session it appears in.`;

/* ---------- ARCHIVE ---------- */
let qy='',tf=new Set(),lim=60;
const TY=[...new Set(R.map(r=>r.t))].sort((a,b)=>R.filter(r=>r.t==b).length-R.filter(r=>r.t==a).length);
$('types').innerHTML=TY.map(t=>`<button class="f" data-t="${t}">${LBL[t]||t}</button>`).join('');
$('types').onclick=e=>{const b=e.target.closest('[data-t]');if(!b)return;const t=b.dataset.t;
 tf.has(t)?tf.delete(t):tf.add(t);
 [...$('types').children].forEach(c=>{const on=tf.has(c.dataset.t);c.classList.toggle('on',on);c.style.cssText=on?`background:${C[c.dataset.t]};border-color:${C[c.dataset.t]};color:#0c0b0f`:''});render(true)};
$('q').oninput=e=>{qy=e.target.value.toLowerCase().trim();render(true)};
$('more').onclick=()=>{lim+=60;render()};
function match(r){if(tf.size&&!tf.has(r.t))return false;if(!qy)return true;
 if(/^\d{1,2}\s*(am|pm)$/.test(qy)){let h=parseInt(qy);if(/pm/.test(qy)&&h<12)h+=12;if(/am/.test(qy)&&h==12)h=0;return r.h==h}
 return (r.n+' '+r.s+' '+r.d+' '+(r.al||'')+' '+(r.cat||'')+' '+(r.md||'')).toLowerCase().includes(qy)}
function render(reset){if(reset)lim=60;const f=R.filter(match);
 const spend=f.reduce((a,b)=>a+(b.a||0),0),mins=f.reduce((a,b)=>a+(b.m||0),0);
 $('qStat').innerHTML=`${f.length.toLocaleString()} receipts${f.length?` · ${f[0].d} → ${f[f.length-1].d}`:''}${spend?` · ₹${Math.round(spend).toLocaleString('en-IN')}`:''}${mins?` · ${Math.round(mins/60)}h played`:''}`;
 $('rlist').innerHTML=f.slice(0,lim).map(r=>`<div class="rec" style="--l:${C[r.t]}" data-d="${r.d}">
  <div class="dt">${r.d.slice(5)}<br>${r.ti}</div>
  <div><div class="nm">${(r.n||'(untitled)').replace(/</g,'&lt;')}</div><div class="sb">${(r.s||'').replace(/</g,'&lt;')}${r.t=='music'?` · ${r.c} tracks · ${r.m}m`:''}</div></div>
  <div class="am">${r.a?'₹'+r.a.toLocaleString('en-IN'):LBL[r.t]}</div></div>`).join('')||'<p class="t3" style="color:var(--dim)">Nothing matches. Try a broader word.</p>';
 $('more').style.display=f.length>lim?'':'none'}
$('rlist').onclick=e=>{const b=e.target.closest('[data-d]');if(!b)return;const i=MO.findIndex(m=>m.d==b.dataset.d);
 if(i>=0){sel=i;go('web');drawMoms();draw()}};
render(true);
