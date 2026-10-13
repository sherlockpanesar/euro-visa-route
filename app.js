let R;const $=s=>document.querySelector(s),gbp=n=>'£'+Math.round(n);
const PREP=['FR','DE','IT'];const today=new Date('2026-10-13'),FS='https://formsubmit.co/ajax/7b6dde70131e9207583b30d953377e74';
const nameToCode=n=>Object.entries(R.nationalities).find(([c,v])=>v.name.toLowerCase()===n.trim().toLowerCase())?.[0];
fetch('data/rules.json').then(r=>r.json()).then(j=>{R=j;
  $('#plist').innerHTML=Object.values(R.nationalities).map(v=>`<option value="${v.name}">`).join('');
  const opt=(o)=>Object.entries(o).sort((a,b)=>a[1].name.localeCompare(b[1].name)).map(([c,v])=>`<option value="${c}">${v.name}</option>`).join('');
  const g=`<optgroup label="Schengen area">${opt(R.schengen)}</optgroup><optgroup label="Outside Schengen">${opt(R.non_schengen)}</optgroup>`;
  $('#d1').innerHTML=g;$('#d2').innerHTML='<option value="">None</option>'+g;
  const q=new URLSearchParams(location.search);
  if(q.get('p')){const f=$('#f');const n=R.nationalities[q.get('p')];if(n)$('#pp').value=n.name;f.s.value=q.get('s')||'ILR';f.from.value=q.get('from');f.to.value=q.get('to');
    const d=(q.get('d')||'').split(',');$('#d1').value=d[0];$('#d2').value=d[1]||'';run();}
});
$('#f').onsubmit=e=>{e.preventDefault();run()};
const nv=r=>r.verified===false?' · <span class="badge nv">needs verification</span>':'';
const host=u=>{try{return new URL(u).hostname}catch{return u}};
const src=r=>`<small class="src">Source: <a href="${r.source||r.url}" target="_blank" rel="noopener">${host(r.source||r.url)}</a> · checked ${r.checked}${nv(r)}</small>`;
const btn=(u,t)=>u?`<a class="btn2" href="${u}" target="_blank" rel="noopener">${t} ↗</a>`:'';
function badge(p,s){const n=R.nationalities[p];
  let x='';if(n.refusal){const r=parseFloat(n.refusal.rate);x=`<span class="badge ${r>=25?'hi':r>=15?'md':'lo'}">Refusal: ${n.refusal.rate}%</span><small class="src">${n.refusal.label}</small>`+src(n.refusal);}
  if(p==='IN'&&s&&s.refusal_IN!=null)x+=`<span class="badge">Indian applicants to ${s.name}, 2025: ${s.refusal_IN}%</span>`+src({source:s.refusal_IN_source,checked:s.checked});
  if(x)return x;
  return `<span class="badge">Refusal: no data</span><small class="src">The EU publishes no nationality-level data for this passport.</small>`;}
const vfee=s=>s.visa_gbp??R.schengen_fee.eur*R.meta.fx_eur_gbp,sfee=s=>s.service_gbp??(s.service_eur||0)*R.meta.fx_eur_gbp;
const cost=s=>vfee(s)+sfee(s)+R.meta.insurance_gbp;
const ruleFor=(p,c)=>{const o=R.nationalities[p].overrides?.[c];return o?{...R.non_schengen[c],...o}:R.non_schengen[c]};
function nonEval(p,c,permit,days){const r=ruleFor(p,c);
  if(r.visa_required)return {r,ok:false,visa:true};
  if((r.any_status||(permit&&r.permit_ok))&&days<=r.max_days)return {r,ok:true};return {r,ok:false};}
function run(){
  const f=$('#f'),p=nameToCode($('#pp').value),st=f.s.value,from=new Date(f.from.value),to=new Date(f.to.value);
  if(!p){$('#out').innerHTML='<div class="card err">Pick a passport from the list.</div>';return}
  const sel=[$('#d1').value,$('#d2').value].filter((v,i,a)=>v&&a.indexOf(v)===i);
  if(!sel.length||isNaN(from)||isNaN(to)||to<from){$('#out').innerHTML='<div class="card err">Pick a destination and valid dates.</div>';return}
  const N=R.nationalities[p],days=Math.round((to-from)/864e5)+1,lead=(from-today)/864e5/7,permit=R.permit_statuses.includes(st);
  const sch=sel.filter(c=>R.schengen[c]),non=sel.filter(c=>R.non_schengen[c]);let prepIso=null;let h='',warns=[],alts=[],detail='',route='';
  if(sch.length){const c=sch[0],s=R.schengen[c],t=cost(s);
    h=`Apply to ${s.name}. About ${gbp(t)}. ${s.wait.startsWith('no data')?'Wait: no data':s.wait}.`;route=h;
    detail=`<p>You need a Schengen visa (type C) for ${sch.map(x=>R.schengen[x].name).join(' and ')}. Apply to <b>${s.name}</b> via ${s.centre}${sch.length>1?', your main destination (most nights; if nights are equal, the country you enter first).':'.'}</p>
    <p class="k">Cost: €90 visa fee (${s.visa_gbp?'£'+s.visa_gbp.toFixed(2):'~'+gbp(vfee(s))+' at ~'+R.meta.fx_eur_gbp+' €/£'}) + centre fee ${s.service_gbp&&s.verified?'£'+s.service_gbp.toFixed(2):s.service_eur?'€'+s.service_eur+' (~'+gbp(sfee(s))+')':'~'+gbp(sfee(s))} + insurance ~${gbp(R.meta.insurance_gbp)}${s.note?' · '+s.note:''}</p>${badge(p,s)}${src(R.schengen_fee)}${src(s)}
    ${PREP.includes(c)?'<div id="jr"></div><button type="button" id="prepbtn">Prepare my application</button>':btn(s.apply_url,'Start application')}`;if(PREP.includes(c))prepIso=c;
    if(N.restricted_dest?.includes(c))warns.push(`${s.name} restricts visas for ${N.name} citizens. Check the official page before applying.`);
    if(days>90)warns.push('Trips over 90 days cannot use a short-stay visa.');
    if(s.wait_weeks&&lead<s.wait_weeks)warns.push(`Your trip starts in about ${Math.max(0,Math.round(lead))} weeks, but the typical wait is ${s.wait}. Book now or move your dates.`);
    if(lead>26)warns.push('You can only apply up to 6 months before travel.');
    if(!permit)warns.push('Check that your UK permission is valid at least 3 months beyond your return.');}
  non.forEach(c=>{const {r,ok,visa}=nonEval(p,c,permit,days);
    if(visa){const cov=c==='CY'&&sch.length&&!R.nationalities[p].overrides?.CY;detail+=`<div class="alt"><b>${r.name}:</b> ${cov?'Covered if your Schengen visa is double or multiple entry (ask for it).':r.permit_rule}${src(r)}${cov?'':btn(r.apply_url,'Start application')}</div>`;
      if(!h){h=`Apply for a ${r.name} visa. ${r.cost_gbp?'About ~'+gbp(r.cost_gbp)+'. ':''}Wait: ${r.wait}.`;route=h}}
    else if(ok){const k=r.cost_gbp||0;detail+=`<div class="alt"><b>${r.name}:</b> ${r.permit_rule}${src(r)}${btn(r.entry_url,'Official entry rules')}</div>`;
      if(!h){h=`No visa needed for ${r.name}. ${k?'e-Visa ~'+gbp(k):'£0 in visa fees'}. Go when ready.`;route=h}}
    else{detail+=`<div class="alt"><b>${r.name}:</b> ${!permit&&r.permit_ok?'Your UK status may not qualify. ':''}${r.permit_rule}${days>r.max_days?` (max ${r.max_days} days; your trip is ${days})`:''}${src(r)}${btn(r.entry_url,'Official entry rules')}</div>`;
      if(!h){h=`Check ${r.name}: you probably need a national visa.`;route=h}}
    if(r.warn_after&&to>=new Date(r.warn_after))warns.push(`${r.name} changes its rules on ${r.warn_after}. Recheck before you travel.`);});
  Object.keys(R.non_schengen).filter(c=>!sel.includes(c)).map(c=>({c,...nonEval(p,c,permit,days)})).filter(x=>x.ok)
    .sort((a,b)=>(a.r.cost_gbp||0)-(b.r.cost_gbp||0)||(a.r.verified===false)-(b.r.verified===false)).slice(0,2)
    .forEach(({r})=>alts.push(`<b>${r.name}</b>: no Schengen visa needed. ${r.permit_rule}${src(r)}${btn(r.entry_url,'Official entry rules')}`));
  if(alts.length<2&&sch.length)Object.entries(R.schengen).filter(([c])=>!sel.includes(c)&&R.schengen[c].wait_weeks).sort((a,b)=>a[1].wait_weeks-b[1].wait_weeks)
    .slice(0,2-alts.length).forEach(([c,s])=>alts.push(`<b>${s.name}</b>, only if it genuinely becomes your main destination: ${s.wait}, about ~${gbp(cost(s))}.${src(s)}${btn(s.apply_url,'Official site')}`));
  const notes=N.notes.map(n=>`<div class="warn">ℹ️ ${n.text}${src(n)}</div>`).join('');
  const ck=[...R.checklist.base,...R.checklist[st]];const needVisa=sch.length||non.some(c=>nonEval(p,c,permit,days).visa);
  const summary=`${N.name} | ${st} | ${sel.join('+')} | ${f.from.value}→${f.to.value} | ${route}`;
  $('#out').innerHTML=`<div class="card"><div class="big">${h}</div><p class="k">${days}-day trip · ${N.name} passport · ${f.s.selectedOptions[0].text}</p>${detail}
  ${warns.map(w=>`<div class="warn">⚠️ ${w}</div>`).join('')}${sch.length?notes:''}</div>
  ${alts.length?`<div class="card"><b>2 alternatives</b>${alts.map(a=>`<div class="alt">${a}</div>`).join('')}</div>`:''}
  ${needVisa?`<div class="card"><b>Your document checklist</b><ul>${ck.map(x=>`<li>${x}</li>`).join('')}</ul>
  <b class="flag">Top 3 refusal causes: check these twice</b><ul>${R.checklist.refusal_causes.map(x=>`<li class="flag">${x}</li>`).join('')}</ul></div>
  <div class="card"><b>Want a second pair of eyes?</b><p class="k">We'll check your pack against this list before your appointment.</p>
  <form id="wlf"><input type="email" id="em" placeholder="you@example.com" required maxlength="254"><input type="text" id="hp" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
  <button>Get my pack checked (£39)</button></form><p class="k">We'll email you when pack checks launch. No spam; unsubscribe any time. <a href="privacy.html">Privacy note</a></p><p id="wl" role="status"></p></div>`:''}`;
  $('#prep').hidden=true;
  if(prepIso){journeyHtml(prepIso).then(x=>{const j=$('#jr');if(j)j.innerHTML=x});const pb=$('#prepbtn');if(pb)pb.onclick=()=>openPrep({iso:prepIso,natName:N.name,destName:(R.schengen[prepIso]||R.non_schengen[prepIso]).name,from:f.from.value,to:f.to.value,checklist:[...ck,...N.notes.map(n=>n.text)]});}
  const wf=$('#wlf');if(wf)wf.onsubmit=e=>{e.preventDefault();const em=$('#em').value.trim(),o=$('#wl');
    if(em.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)){o.className='err';o.textContent='Please enter a valid email.';return}
    o.className='k';o.textContent='Sending…';
    fetch(FS,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({email:em,route:summary.slice(0,500),_subject:'euro-visa-route waitlist',_captcha:'false',_honey:$('#hp').value})})
     .then(r=>r.json()).then(j=>{if(String(j.success)==='true'){o.className='ok';o.textContent="Thanks, you're on the list.";wf.reset()}else throw 0})
     .catch(()=>{o.className='err';o.textContent='Sorry, that didn’t go through. Please try again in a minute.'});};
}
