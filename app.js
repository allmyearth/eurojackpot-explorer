'use strict';
const main = new Set(), euro = new Set();
const $ = id => document.getElementById(id);
const sorted = set => [...set].sort((a,b)=>a-b);
function renderGrid(id, count, selected, max) {
  const grid=$(id); grid.replaceChildren();
  for(let n=1;n<=count;n++){
    const b=document.createElement('button'); b.type='button'; b.className='ball'+(selected.has(n)?' active':'')+(max===2?' star':''); b.textContent=n; b.setAttribute('aria-pressed',String(selected.has(n)));
    b.setAttribute('aria-label',`${max===2?'Euro':'Main'} number ${n}`);
    b.onclick=()=>{if(selected.has(n))selected.delete(n);else if(selected.size<max)selected.add(n);else {setMessage(`Select exactly ${max} numbers; remove one before adding another.`);return;} update();};
    grid.append(b);
  }
}
function update(){renderGrid('main-grid',50,main,5);renderGrid('euro-grid',12,euro,2);$('search').disabled=main.size!==5||euro.size!==2;$('selection').textContent=`Main: ${sorted(main).join(', ')||'—'}   |   Euro: ${sorted(euro).join(', ')||'—'}`;setMessage('');$('results').classList.add('hidden');}
function setMessage(s){$('message').textContent=s;}
function element(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=String(text);return el;}
function balls(nums, matched, star=false){const row=element('div','balls');for(const n of nums){const b=element('span','mini'+(star?' star':'')+(matched.includes(n)?' hit':''),n);row.append(b);}return row;}
function showResults(rows){$('results').classList.remove('hidden');$('overview').replaceChildren();$('categories').replaceChildren();$('draws').replaceChildren();
 const exact=rows.filter(r=>r.main_matches===5&&r.euro_matches===2);
 $('overview').append(element('p','lead',exact.length?`Exact 5+2 combination found on ${exact.length} drawing(s).`:'No exact 5+2 combination among the returned historical results.'));
 $('overview').append(element('p','muted',`${rows.length} historical result(s) returned (maximum 100).`));
 if(!rows.length){$('draws').append(element('p','muted','No historical draws met the search threshold.'));return;}
 const groups=new Map();for(const r of rows){const key=`${r.main_matches} + ${r.euro_matches}`;groups.set(key,(groups.get(key)||0)+1);}
 const groupWrap=element('div','chips');for(const [key,count] of groups)groupWrap.append(element('span','chip',`${key}: ${count}`));$('categories').append(groupWrap);
 for(const r of rows){const card=element('article','draw-card');const heading=element('div','line');heading.append(element('strong','',r.draw_date),element('span','pill',`${r.main_matches} + ${r.euro_matches}`));card.append(heading);card.append(element('div','small-label','Main numbers'));card.append(balls(r.drawn_main,r.matched_main));card.append(element('div','small-label','Euro numbers'));card.append(balls(r.drawn_euro,r.matched_euro,true));$('draws').append(card);}
}
async function search(){const cfg=window.EJ_CONFIG||{};const url=(cfg.supabaseUrl||'').trim().replace(/\/$/,'');const key=(cfg.publishableKey||'').trim();if(!/^https:\/\/[^/]+\.supabase\.co$/.test(url)||!key||key.startsWith('YOUR_')){setMessage('Set your Supabase Project URL and publishable key in config.js first.');return;}
 const button=$('search');button.disabled=true;setMessage('Searching historical draws…');$('results').classList.add('hidden');
 try{const res=await fetch(`${url}/rest/v1/rpc/explorer_search`,{method:'POST',headers:{'Content-Type':'application/json','apikey':key,'Authorization':`Bearer ${key}`},body:JSON.stringify({p_main:sorted(main),p_euro:sorted(euro)})});const body=await res.json();if(!res.ok)throw new Error(body.message||`API error ${res.status}`);if(!Array.isArray(body))throw new Error('Unexpected database response.');showResults(body);setMessage('Search complete.');}catch(err){setMessage(`Search failed: ${err.message}. Check your Supabase URL, API key, Data API exposure, and function permissions.`);}finally{button.disabled=main.size!==5||euro.size!==2;}}
$('clear').onclick=()=>{main.clear();euro.clear();update();};$('search').onclick=search;update();
