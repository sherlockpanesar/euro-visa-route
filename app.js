let R;const $=s=>document.querySelector(s),gbp=n=>'£'+Math.round(n);
const today=new Date('2026-10-13');
fetch('data/rules.json').then(r=>r.json()).then(j=>{R=j;
  const all={...R.schengen,...R.non_schengen};
  $('#dest').innerHTML=Object.entries(all).map(([c,v])=>`<label><input type="checkbox" value="${c}">${v.name}</label>`).join('');
  const q=new URLSearchParams(location.search);
  if(q.get('p')){const f=$('#f');f.p.value=q.get('p');f.s.value=q.get('s');f.from.value=q.get('from');f.to.value=q.get('to');
    q.get('d').split(',').forEach(c=>{const i=$(`#dest input[value=${c}]`);if(i)i.checked=true});window._order=q.get('d').split(',');run();}
});
const order=[];document.addEventListener('change',e=>{if(e.target.closest('#dest')){const v=e.target.value,i=order.indexOf(v);if(i>=0)order.splice(i,1);if(e.target.checked)order.push(v)}});
$('#f').onsubmit=e=>{e.preventDefault();run()};
const src=r=>`<small class="src">Source: <a href="${r.source||r.url}" target="_blank">${new URL(r.source||r.url).hostname}</a> · checked ${r.checked}${r.verified===false?' · <span class="badge nv">needs verification</span>':''}</small>`;
function badge(p,s){if(p==='TH')return `<span class="badge lo">Refusal: likely low</span><small class="src">No Thai-nationality data; Thailand-filed avg 6.2% (2025).</small>`;
  const r=s.refusal_in;if(r==null)return `<span class="badge">Refusal: no data</span>`;
  return `<span class="badge ${r>=25?'hi':r>=15?'md':'lo'}">Refusal for Indian applicants: ${r}%</span>`+src(R.refusal_source);}
function schengenCost(s){return R.schengen_fee.eur*R.meta.fx_eur_gbp+s.service_gbp+R.meta.insurance_gbp}
function run(){
  const f=$('#f'),p=f.p.value,st=f.s.value,from=new Date(f.from.value),to=new Date(f.to.value);
  const sel=(window._order||order).filter(c=>$(`#dest input[value=${c}]`)?.checked);
  if(!sel.length||isNaN(from)||isNaN(to)||to<from){$('#out').innerHTML='<div class="card">Pick at least one destination and valid dates.</div>';return}
  const days=Math.round((to-from)/864e5)+1,lead=(from-today)/864e5/7,permit=R.permit_statuses.includes(st);
  const sch=sel.filter(c=>R.schengen[c]),non=sel.filter(c=>R.non_schengen[c]);let h='',warns=[],alts=[],detail='';
  if(sch.length){const c=sch[0],s=R.schengen[c],cost=schengenCost(s);
    h=`Apply to ${s.name}. About ${gbp(cost)}. ${s.wait}.`;
    detail=`<p>You need a Schengen visa (type C). It covers ${sch.map(x=>R.schengen[x].name).join(', ')}. Apply to <b>${s.name}</b> via ${s.centre}${sch.length>1?' because it is your main destination (most nights). If nights are equal, apply to the country you enter first.':'.'}</p>
    <p class="k">Cost: €90 visa fee (${gbp(90*R.meta.fx_eur_gbp)}) + ${s.centre} fee ~${gbp(s.service_gbp)} + insurance ~${gbp(R.meta.insurance_gbp)}</p>${badge(p,s)}${src(R.schengen_fee)}${src(s)}`;
    if(days>90)warns.push('Trips over 90 days cannot use a short-stay visa.');
    if(lead<s.wait_weeks)warns.push(`Your trip starts in about ${Math.max(0,Math.round(lead))} weeks, but the typical wait is ${s.wait}. Book an appointment now or move your dates.`);
    if(lead>26)warns.push('You can only apply up to 6 months before travel.');
    if(!permit)warns.push('Check that your UK permission is valid at least 3 months beyond your return; centres may refuse to accept the application otherwise.');
  }
  non.forEach(c=>{const n=R.non_schengen[c];
    if(n.visa_required){const covered=c==='CY'&&sch.length;detail+=`<div class="alt"><b>${n.name}:</b> ${covered?'Covered if your Schengen visa is double or multiple entry (ask for it).':n.rule}${src(n)}</div>`;
      if(!sch.length)h=h||`Apply for a ${n.name} visa. ${n.cost_gbp?'About '+gbp(n.cost_gbp)+'. ':''}${n.wait}.`;}
    else if(permit&&days<=n.max_days){const cost=n.cost_gbp?n.cost_gbp[p]:0;detail+=`<div class="alt"><b>${n.name}:</b> ${n.rule}${src(n)}</div>`;h=h||`No visa needed for ${n.name}. ${cost?'e-Visa about '+gbp(cost):'£0 in visa fees'}. Go when ready.`;}
    else{detail+=`<div class="alt"><b>${n.name}:</b> ${permit?`Visa-free only up to ${n.max_days} days; your trip is ${days}.`:'Your UK status may not qualify. You probably need a national visa; check the source.'}${src(n)}</div>`;h=h||`Check ${n.name}: you may need a national visa.`;}
    if(n.warn_after&&to>=new Date(n.warn_after))warns.push(`${n.name}'s rules change on ${n.warn_after}. Recheck before you travel.`);
  });
  // alternatives
  if(permit)Object.entries(R.non_schengen).filter(([c,n])=>!sel.includes(c)&&!n.visa_required&&days<=n.max_days)
    .sort((a,b)=>((a[1].cost_gbp||{})[p]||0)-((b[1].cost_gbp||{})[p]||0)||(a[1].verified===false)-(b[1].verified===false)).slice(0,2)
    .forEach(([c,n])=>alts.push(`<b>${n.name}</b>: no Schengen visa needed. ${n.rule}${src(n)}`));
  if(alts.length<2&&sch.length)Object.entries(R.schengen).filter(([c])=>!sel.includes(c)).sort((a,b)=>(a[1].wait_weeks-b[1].wait_weeks))
    .slice(0,2-alts.length).forEach(([c,s])=>alts.push(`<b>${s.name}</b>, only if it genuinely becomes your main destination: ${s.wait}, about ${gbp(schengenCost(s))}.${src(s)}`));
  const ck=[...R.checklist.base,...R.checklist[st]];
  $('#out').innerHTML=`<div class="card"><div class="big">${h}</div><p class="k">${days}-day trip · ${p==='IN'?'Indian':'Thai'} passport · ${f.s.selectedOptions[0].text}</p>${detail}
  ${warns.map(w=>`<div class="warn">⚠️ ${w}</div>`).join('')}</div>
  ${alts.length?`<div class="card"><b>2 alternatives</b>${alts.map(a=>`<div class="alt">${a}</div>`).join('')}</div>`:''}
  ${sch.length||sel.some(c=>R.non_schengen[c].visa_required)?`<div class="card"><b>Your document checklist</b><ul>${ck.map(x=>`<li>${x}</li>`).join('')}</ul>
  <b class="flag">Top 3 refusal causes: check these twice</b><ul>${R.checklist.refusal_causes.map(x=>`<li class="flag">${x}</li>`).join('')}</ul></div>
  <div class="card"><b>Want a second pair of eyes?</b><p class="k">We will check your pack against this list before your appointment. Join the waitlist; no payment is taken.</p>
  <input type="email" id="em" placeholder="you@example.com"><button id="pay">Get my pack checked (£39)</button><p id="wl" class="k"></p></div>`:''}`;
  // TODO: wire a form service (e.g. Formspree) - emails are currently only stored in this browser's localStorage, NOT collected.
  const b=$('#pay');if(b)b.onclick=()=>{const e=$('#em').value.trim();
    if(e.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)){$('#wl').textContent='Please enter a valid email.';return}
    const l=JSON.parse(localStorage.getItem('waitlist')||'[]');l.push({email:e,profile:{p,st,sel},at:new Date().toISOString()});localStorage.setItem('waitlist',JSON.stringify(l));
    $('#wl').textContent="Thanks, you're on the list.";};
}
