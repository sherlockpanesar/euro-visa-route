// Guided "Prepare my application": stores answers ONLY in this browser (localStorage). Never submits to any portal.
const F=[
["You",[["1","surname","Surname (family name)"],["2","surname_birth","Surname at birth (if different)"],["3","first","First name(s)"],["4","dob","Date of birth","date"],["5","pob","Place of birth"],["6","cob","Country of birth"],["7","nat","Current nationality"],["9","sex","Sex","sel:Male|Female|Other"],["10","civil","Civil status","sel:Single|Married|Registered partnership|Separated|Divorced|Widow(er)|Other"]]],
["Passport",[["13","doc","Type of travel document","sel:Ordinary passport|Other"],["14","pno","Passport number"],["15","pissue","Date of issue","date"],["16","pexp","Valid until","date"],["17","pby","Issued by (country)"]]],
["Address & UK residence",[["19","addr","Home address in the UK"],["19","email","Email","email"],["19","tel","Phone"],["20","ukperm","UK residence permit / eVisa number"],["20","ukvalid","UK permission valid until","date"]]],
["Work or study",[["21","occ","Current occupation"],["22","emp","Employer or school: name, address, phone"]]],
["Trip",[["23","purpose","Main purpose","sel:Tourism|Visiting family or friends|Business|Cultural|Sports|Study (short)|Medical|Other"],["25","dest","Main destination"],["26","first_entry","Member state of first entry"],["27","entries","Entries requested","sel:Single entry|Two entries|Multiple entries"],["30","arrive","Intended arrival date","date"],["31","depart","Intended departure date","date"]]],
["Stay & funding",[["32","host","Hotel or host: name, address, email, phone"],["33","fund","Costs covered by","sel:Myself|Sponsor / host|Both"],["33","means","Means of support (e.g. cash, card, prepaid accommodation)"]]]];
const ALL=F.flatMap(g=>g[1]);let PS=null;
const ld=()=>JSON.parse(localStorage.getItem('evr_form')||'{}'),sv=o=>localStorage.setItem('evr_form',JSON.stringify(o));
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
async function country(iso){try{return await (await fetch(`data/countries/${iso.toLowerCase()}.json`)).json()}catch{return null}}
async function journeyHtml(iso){const c=await country(iso);if(!c)return '';
  return `<div class="alt"><b>How applying to ${c.name} works</b> <span class="k">(form: ${c.form_type})</span><ol>${c.journey.map(s=>`<li>${esc(s.step)}${s.url?` <a href="${s.url}" target="_blank" rel="noopener">open ↗</a>`:''}</li>`).join('')}</ol>
  <a class="btn2" href="${c.official_portal}" target="_blank" rel="noopener">${esc(c.portal_label)} ↗</a><small class="src"> · ${esc(c.portal_status||'')} · checked ${c.checked}${c.verified?'':' · <span class="badge nv">needs verification</span>'}</small></div>`;}
function openPrep(ctx){PS=ctx;const v={...ld()};v.nat=v.nat||ctx.natName;v.dest=ctx.destName;v.first_entry=v.first_entry||ctx.destName;v.arrive=ctx.from;v.depart=ctx.to;sv(v);step(0);}
function step(i){const v=ld(),g=F[i],o=document.querySelector('#prep');o.hidden=false;
  o.innerHTML=`<div class="card"><b>Prepare my application · ${i+1}/${F.length}: ${g[0]}</b>
  <p class="k">Saved only in this browser. We never submit anything for you: the portal needs your own account, signed declaration, payment and in-person biometrics.</p>
  ${g[1].map(([n,id,l,t='text'])=>`<label for="pf_${id}">${l} <span class="k">(field ${n})</span></label>${t.startsWith('sel:')?`<select id="pf_${id}"><option value=""></option>${t.slice(4).split('|').map(x=>`<option ${v[id]===x?'selected':''}>${x}</option>`).join('')}</select>`:`<input id="pf_${id}" type="${t}" value="${esc(v[id])}">`}`).join('')}
  <div class="row"><div>${i?'<button type="button" id="pb">Back</button>':''}</div><div><button type="button" id="pn">${i<F.length-1?'Next':'Show my answer sheet'}</button></div></div>
  <button type="button" id="pclr" style="background:#fff;color:#b42318;border:1px solid #b42318">Clear my saved answers</button></div>`;
  const keep=()=>{const w=ld();g[1].forEach(([,id])=>w[id]=document.querySelector('#pf_'+id).value);sv(w)};
  document.querySelector('#pn').onclick=()=>{keep();i<F.length-1?step(i+1):sheet()};
  const b=document.querySelector('#pb');if(b)b.onclick=()=>{keep();step(i-1)};
  document.querySelector('#pclr').onclick=()=>{localStorage.removeItem('evr_form');step(0)};
  o.scrollIntoView({behavior:'smooth'});}
async function sheet(){const v=ld(),c=await country(PS.iso),o=document.querySelector('#prep');
  const lab=n=>`${c.name} form · field ${n}`;
  o.innerHTML=`<div class="card"><b>Your ${c.name} answer sheet</b>
  <p class="warn">Copy these answers into the official form yourself. We do not auto-fill or submit government portals: you must create your own account, sign the declaration, pay, and give biometrics in person. Field numbers follow the EU harmonised Schengen form; the portal's exact wording may differ <span class="badge nv">needs verification</span>.</p>
  <table style="width:100%;border-collapse:collapse;font-size:.9rem">${ALL.map(([n,id,l])=>`<tr style="border-top:1px solid var(--b)"><td style="padding:6px 4px"><span class="k">${lab(n)}</span><br>${l}</td><td style="padding:6px 4px"><b>${esc(v[id])||'<span class="k">—</span>'}</b></td><td>${v[id]?`<button type="button" class="cp" data-v="${esc(v[id])}" style="width:auto;margin:0;padding:6px 10px;font-size:.8rem">Copy</button>`:''}</td></tr>`).join('')}</table>
  <button type="button" id="pdf">Download PDF</button><button type="button" id="ped" style="background:#fff;color:var(--a);border:1px solid var(--a)">Edit answers</button>
  <p class="k">${c.form_type.startsWith('harmonised')?'For paper-form centres, the PDF lists the harmonised-form field numbers so you can copy them onto the official form. It is not the official form itself.':'For online portals, use the PDF as a copy sheet while you fill in the portal.'}</p></div>
  <div class="card"><b>Your steps</b> <a class="btn2" href="${c.official_portal}" target="_blank" rel="noopener">${esc(c.portal_label)} ↗</a><ol>${c.journey.map(s=>`<li>${esc(s.step)}${s.url?` <a href="${s.url}" target="_blank" rel="noopener">open ↗</a>`:''}</li>`).join('')}</ol></div>
  <div class="card"><b>Documents for your profile</b><ul>${PS.checklist.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`;
  o.querySelectorAll('.cp').forEach(b=>b.onclick=()=>{navigator.clipboard?.writeText(b.dataset.v);b.textContent='Copied'});
  document.querySelector('#ped').onclick=()=>step(0);
  document.querySelector('#pdf').onclick=()=>{const {jsPDF}=window.jspdf,d=new jsPDF();let y=16;d.setFontSize(14);d.text(`${c.name}: Schengen application answer sheet`,12,y);y+=7;d.setFontSize(8);
    d.text('Prepared by the applicant. Not an official form. Copy into the official form; sign it yourself. Not legal advice.',12,y);y+=8;d.setFontSize(10);
    ALL.forEach(([n,id,l])=>{if(y>280){d.addPage();y=16}d.text(`${n}. ${l}`,12,y);d.text(d.splitTextToSize(String(v[id]||'-'),90),110,y);y+=7});
    y+=4;if(y>260){d.addPage();y=16}d.setFontSize(12);d.text('Steps',12,y);y+=6;d.setFontSize(9);c.journey.forEach((s,i)=>{const t=d.splitTextToSize(`${i+1}. ${s.step}${s.url?' ('+s.url+')':''}`,185);if(y>280){d.addPage();y=16}d.text(t,12,y);y+=5*t.length});
    d.save(`${c.iso.toLowerCase()}-answer-sheet.pdf`)};
  o.scrollIntoView({behavior:'smooth'});}
