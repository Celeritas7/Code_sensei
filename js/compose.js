// ═══════════════════════════════════════
// PHASE 13 — COMPOSE LAB  (13.1: scoped rendering — focus never rebuilds the DOM)
// Loaded by index_patched.html; relies on sbq/sbPost/sbPatch/xpAward/exToast/mascotBubble/mascotSvg/srsPlusDays/getUserId/esc/setNav/S/dailyBump.
// Render scopes: clRender() = whole page (problem load / theme) · clRenderTop() = header+strip+problem card
// · clRenderStack() = block cards · clSetActive() = class toggles only · clRenderPal/Out/Attempts/Sensei/Ovl = own container.
// ═══════════════════════════════════════
const CL={list:null,pid:null,lang:'python',group:'All',blocks:[],active:-1,attempts:[],ran:null,keysOpen:true,chat:[],live:false,pending:null,reveal:false,solved:{},hintIdx:0};
const CL_KEYS={python:[['def','for','while','if','elif','else:','in','range(','return','import','not','and','or','True'],['print(','input(','len(','int(','str(','sum(','sorted(','enumerate(','open(','.get(','.split(','.upper('],['":"',')','[]','{}','" "','+=','==','%','self']]};
const CL_XP=20;
const clJ=v=>{if(typeof v==='string'){try{return JSON.parse(v);}catch(e){return null;}}return v;};
const clNorm=s=>String(s==null?'':s).replace(/\r/g,'').replace(/[ \t]+$/gm,'').replace(/\n+$/,'');
const clProb=()=>CL.list.find(p=>p.id===CL.pid);
const clEl=id=>document.getElementById(id);
const clMine=()=>CL.list.filter(p=>p.lang===CL.lang);

// ─── Entry ───
async function goCompose(lang){
  S.view='compose';setNav('nav-compose');if(lang)CL.lang=lang;
  clEl('main').innerHTML='<div class="pg"><div class="ld"><div class="spin"></div>Opening Compose Lab\u2026</div></div>';
  if(!CL.list){
    const [rows,atts]=await Promise.all([
      sbq('code_sensei_exercises','select=*&category=eq.compose&order=sort_order.asc,id.asc'),
      sbq('code_sensei_attempts','select=exercise_id,result&result=eq.pass')]);
    CL.list=(Array.isArray(rows)?rows:[]).map(r=>({id:r.id,title:r.title,statement:r.problem_statement||'',group:r.concept||'General',lang:r.language||'python',expected:r.expected_output||'',blocks:clJ(r.blocks)||[{name:'main',code:''}],solution:clJ(r.solution)||[],hints:clJ(r.hints)||['Break the problem into the smallest step you can name.'],status:r.status}));
    (Array.isArray(atts)?atts:[]).forEach(a=>{CL.solved[a.exercise_id]=true;});
    CL.list.forEach(p=>{if(p.status==='done')CL.solved[p.id]=true;});
  }
  const mine=clMine();
  if(!mine.length){clEl('main').innerHTML='<div class="pg"><button class="back" onclick="goDash()">\u2190 Dashboard</button><h2>\u2328 Compose Lab</h2><p class="sub">No compose problems for '+esc(CL.lang)+' yet.</p><div class="cd" style="margin-top:14px"><div style="font-size:13px;color:var(--tm)">Run <code style="font-family:var(--dojo-font-mono)">migrations/008_compose_lab.sql</code> to seed the Python set.</div></div></div>';return;}
  if(!CL.pid||!mine.find(p=>p.id===CL.pid))clLoad(mine.find(p=>!CL.solved[p.id])?.id||mine[0].id,true);
  clRender();
  clPyReady().catch(()=>{});
}
function clLoad(id,silent){const p=CL.list.find(x=>x.id===id);if(!p)return;CL.pid=id;
  CL.blocks=p.blocks.map(b=>({name:b.name,code:b.code||'',collapsed:false,auto:true}));CL.active=-1;CL.attempts=[];CL.ran=null;CL.pending=null;CL.reveal=false;CL.hintIdx=0;
  CL.chat=[{r:'s',t:'Stuck on <b>'+esc(p.title)+'</b>? Ask me anything \u2014 I nudge, I don\u2019t hand over the answer.'}];
  if(!silent)clRender();}
function clReset(){clLoad(CL.pid);}

// ─── Scope 0: whole page shell (only on load / theme) ───
function clRender(){const m=clEl('main');if(!m||S.view!=='compose')return;
  m.innerHTML='<div class="pg"><div id="cl-top"></div>'+
  '<div class="cl-composer"><div class="cl-composer-hd"><span>Compose \u00b7 '+esc(CL.lang)+'</span><span id="cl-count"></span></div><div id="cl-stack"></div>'+
  '<button class="cl-addblk" id="cl-add">+ Add block</button><div id="cl-pal"></div></div>'+
  '<div class="cl-actions"><button class="cl-run" id="cl-run">\u25b6 Assemble &amp; run</button><button class="cl-gbtn" id="cl-reveal">Reveal solution</button><button class="cl-gbtn" id="cl-resetbtn">Reset</button></div>'+
  '<div id="cl-out"></div><div id="cl-attempts"></div><div id="cl-sensei"></div><div id="cl-ovl"></div></div>';
  clEl('cl-add').addEventListener('click',clAddBlk);
  clEl('cl-run').addEventListener('click',clRun);
  clEl('cl-reveal').addEventListener('click',clReveal);
  clEl('cl-resetbtn').addEventListener('click',clReset);
  clRenderTop();clRenderStack();clRenderPal();clRenderOut();clRenderAttempts();clRenderSensei();clRenderOvl();}

// ─── Scope 1: header · chips · strip · problem card ───
function clRenderTop(){const el=clEl('cl-top');if(!el)return;const p=clProb();const mine=clMine();const solvedN=mine.filter(x=>CL.solved[x.id]).length;
  el.innerHTML='<button class="back" onclick="goDash()">\u2190 Dashboard</button>'+
  '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><h2 style="color:var(--g);margin:0">\u2328 Compose Lab</h2><span style="flex:1"></span><span class="cl-mini">'+solvedN+' / '+mine.length+' solved</span></div>'+
  '<p class="sub">Build it in blocks \u00b7 Key palette \u00b7 Runs for real in your browser</p>'+
  '<div class="cl-progress"><i style="width:'+Math.round(solvedN/mine.length*100)+'%"></i></div>'+
  '<div class="cl-groupbar">'+clGroupBar(mine)+'</div>'+
  '<div class="cl-striprow"><span class="lbl">Problems</span><div class="cl-strip">'+clStrip(mine)+'</div></div>'+
  '<div class="cl-exhead"><span class="cl-exid">#'+p.id+'</span><h3>'+esc(p.title)+'</h3><span class="grp">'+esc(p.group)+'</span></div>'+
  '<div class="cl-stmt">'+esc(p.statement)+'</div>'+
  '<div class="cl-expect"><span class="k">Expected</span><pre>'+esc(p.expected)+'</pre></div>';}
function clGroupBar(mine){const groups=[];mine.forEach(p=>{if(!groups.includes(p.group))groups.push(p.group);});
  let h='<button class="cl-gchip'+(CL.group==='All'?' on':'')+'" onclick="clGroup(\'All\')">All<span class="n">'+mine.length+'</span></button>';
  groups.forEach(g=>{const all=mine.filter(p=>p.group===g),done=all.filter(p=>CL.solved[p.id]).length;
    h+='<button class="cl-gchip'+(CL.group===g?' on':'')+'" onclick="clGroup('+JSON.stringify(g).replace(/"/g,'&quot;')+')">'+esc(g)+'<span class="n">'+done+'/'+all.length+'</span></button>';});return h;}
function clStrip(mine){const groups=[];mine.forEach(p=>{if(!groups.includes(p.group))groups.push(p.group);});let h='';
  groups.forEach(g=>{if(CL.group!=='All'&&CL.group!==g)return;h+='<span class="glab">'+esc(g)+'</span>';
    mine.filter(p=>p.group===g).forEach(p=>{h+='<button class="cl-pchip'+(p.id===CL.pid?' on':'')+(CL.solved[p.id]?' solved':'')+'" onclick="clLoad('+p.id+')"><b>#'+p.id+'</b>'+esc(p.title)+'</button>';});});return h;}
function clGroup(g){CL.group=g;clRenderTop();}

// ─── Scope 2: block stack (createElement + listeners; rebuilt only on structural change) ───
function clRenderStack(){const st=clEl('cl-stack');if(!st)return;st.innerHTML='';
  CL.blocks.forEach((b,i)=>st.appendChild(clCard(b,i)));
  const c=clEl('cl-count');if(c)c.textContent=CL.blocks.length+' block'+(CL.blocks.length===1?'':'s');}
function clCard(b,i){
  const card=document.createElement('div');card.className='cl-blk'+(i===CL.active?' active':'')+(b.collapsed?' collapsed':'');card.dataset.i=i;card.draggable=true;
  const hd=document.createElement('div');hd.className='cl-blk-hd';
  const grip=document.createElement('span');grip.className='cl-grip';grip.textContent='\u283f';
  const name=document.createElement('input');name.className='cl-blk-name';name.value=b.name;name.spellcheck=false;
  name.addEventListener('input',()=>{b.name=name.value;b.auto=false;clRenderPalHead();});
  name.addEventListener('focus',()=>clSetActive(i));
  const badge=document.createElement('span');badge.className='cl-ins';badge.textContent='keys insert here';badge.style.display=i===CL.active?'':'none';
  const tools=document.createElement('span');tools.className='cl-blk-tools';
  const col=clIbtn(b.collapsed?'\u2304':'\u2303','Collapse',()=>{b.collapsed=!b.collapsed;card.classList.toggle('collapsed',b.collapsed);col.textContent=b.collapsed?'\u2304':'\u2303';if(b.collapsed&&CL.active===i)clSetActive(-1);});
  const dup=clIbtn('\u29c9','Duplicate',()=>{CL.blocks.splice(i+1,0,{name:b.name+'_copy',code:b.code,collapsed:false,auto:false});CL.active=i+1;clRenderStack();clRenderPalHead();});
  const del=clIbtn('\u00d7','Delete',()=>{if(CL.blocks.length<2)return;CL.blocks.splice(i,1);CL.active=CL.active===i?-1:CL.active>i?CL.active-1:CL.active;clRenderStack();clRenderPalHead();});del.classList.add('x');
  tools.append(col,dup,del);
  hd.append(grip,name,badge,tools);
  hd.addEventListener('click',e=>{if(e.target===hd||e.target===grip)clSetActive(i);});
  const body=document.createElement('div');body.className='cl-blk-body';
  const gut=document.createElement('div');gut.className='cl-gutter';
  const ta=document.createElement('textarea');ta.className='cl-ta';ta.id='cl-ta-'+i;ta.spellcheck=false;ta.placeholder='\u2026';ta.value=b.code;ta.wrap='off';ta.setAttribute('autocapitalize','off');ta.setAttribute('autocorrect','off');
  const paintGut=()=>{const n=ta.value.split('\n').length;if(gut.children.length!==n){let h='';for(let k=1;k<=n;k++)h+='<div>'+k+'</div>';gut.innerHTML=h;}};
  ta.addEventListener('input',()=>{b.code=ta.value;paintGut();clGrow(ta);});
  ta.addEventListener('focus',()=>clSetActive(i));
  ta.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();clInsertAt(ta,'    ');}if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();clRun();}});
  body.append(gut,ta);card.append(hd,body);
  card.addEventListener('dragstart',e=>{if(e.target!==card)return;_clDrag=i;card.classList.add('dragging');e.dataTransfer.effectAllowed='move';});
  card.addEventListener('dragover',e=>e.preventDefault());
  card.addEventListener('drop',e=>{e.preventDefault();if(_clDrag==null||_clDrag===i)return;const mv=CL.blocks.splice(_clDrag,1)[0];CL.blocks.splice(i,0,mv);CL.active=i;_clDrag=null;clRenderStack();clRenderPalHead();});
  card.addEventListener('dragend',()=>{card.classList.remove('dragging');_clDrag=null;});
  paintGut();requestAnimationFrame(()=>clGrow(ta));
  return card;}
function clIbtn(txt,title,fn){const b=document.createElement('button');b.className='cl-ibtn';b.title=title;b.textContent=txt;b.addEventListener('click',e=>{e.stopPropagation();fn();});return b;}
function clGrow(el){el.style.height='auto';el.style.height=Math.max(46,el.scrollHeight)+'px';}
let _clDrag=null;

// ─── Scope 3: per-card active state — class toggles only, no rebuild ───
function clSetActive(i){if(CL.active===i)return;const st=clEl('cl-stack');if(!st)return;
  const prev=st.querySelector('.cl-blk.active');if(prev){prev.classList.remove('active');const b=prev.querySelector('.cl-ins');if(b)b.style.display='none';}
  CL.active=i;
  if(i>=0){const card=st.querySelector('.cl-blk[data-i="'+i+'"]');if(card){card.classList.add('active');const b=card.querySelector('.cl-ins');if(b)b.style.display='';}}
  clRenderPalHead();}
function clAddBlk(){CL.blocks.push({name:'block '+(CL.blocks.length+1),code:'',collapsed:false,auto:true});CL.active=CL.blocks.length-1;clRenderStack();clRenderPalHead();clEl('cl-ta-'+CL.active)?.focus();}

// ─── Palette (own container; header text updates separately) ───
function clRenderPal(){const el=clEl('cl-pal');if(!el)return;const rows=CL_KEYS[CL.lang]||CL_KEYS.python;el.innerHTML='';
  const pal=document.createElement('div');pal.className='cl-palette';
  const hd=document.createElement('div');hd.className='cl-pal-hd';
  const t=document.createElement('span');t.className='t';t.id='cl-pal-t';
  const tog=document.createElement('button');tog.textContent=CL.keysOpen?'Hide keys \u2303':'Show keys \u2304';tog.addEventListener('click',()=>{CL.keysOpen=!CL.keysOpen;clRenderPal();});
  hd.append(t,tog);pal.appendChild(hd);
  if(CL.keysOpen){const wrap=document.createElement('div');wrap.className='cl-pal-rows';
    rows.forEach(r=>{const row=document.createElement('div');row.className='cl-pal-row';
      r.forEach(k=>{const kb=document.createElement('button');kb.className='cl-key';kb.textContent=k;kb.addEventListener('pointerdown',e=>e.preventDefault());kb.addEventListener('click',()=>clKey(k));row.appendChild(kb);});
      wrap.appendChild(row);});pal.appendChild(wrap);}
  el.appendChild(pal);clRenderPalHead();}
function clRenderPalHead(){const t=clEl('cl-pal-t');if(!t)return;
  t.innerHTML=CL.keysOpen?'Key palette \u2192 <em>'+esc(CL.active>=0&&CL.blocks[CL.active]?CL.blocks[CL.active].name:'\u2014')+'</em>':'Key palette';}
function clKey(k){let i=CL.active;if(i<0){i=CL.blocks.length-1;clSetActive(i);}const t=clEl('cl-ta-'+i);if(!t)return;
  clInsertAt(t,/[\w)]$/.test(k)&&!/\($/.test(k)?k+' ':k);t.focus();}
function clInsertAt(t,txt){const s=t.selectionStart,e=t.selectionEnd;t.value=t.value.slice(0,s)+txt+t.value.slice(e);t.selectionStart=t.selectionEnd=s+txt.length;t.dispatchEvent(new Event('input',{bubbles:true}));}
function clAssemble(){const isMain=b=>b.name.trim().toLowerCase()==='main';return CL.blocks.filter(b=>!isMain(b)).concat(CL.blocks.filter(isMain)).map(b=>b.code).filter(c=>c.trim()).join('\n\n');}

// ─── Pyodide runner ───
let _clPy=null,_clPyLoading=null;
async function clPyReady(){if(_clPy)return _clPy;if(_clPyLoading)return _clPyLoading;
  _clPyLoading=(async()=>{if(!window.loadPyodide)await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});
    _clPy=await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'});return _clPy;})();return _clPyLoading;}
async function clRunPy(src){const py=await clPyReady();py.runPython('import sys,io\n_b=io.StringIO()\nsys.stdout=_b\nsys.stderr=_b');let err=null;
  try{await py.runPythonAsync(src);}catch(e){err=String(e.message||e).trim().split('\n').slice(-4).join('\n');}
  const out=py.runPython('import sys\n_v=sys.stdout.getvalue()\nsys.stdout=sys.__stdout__\nsys.stderr=sys.__stderr__\n_v');return{out:String(out||''),err};}
async function clRun(){const btn=clEl('cl-run');if(!btn||btn.disabled)return;const p=clProb();const src=clAssemble();
  if(!src.trim()){exToast('\u26a0 Nothing to run \u2014 add some code first');return;}
  btn.disabled=true;btn.innerHTML='<span class="spin" style="width:12px;height:12px;border-width:2px;margin:0"></span> '+(_clPy?'Running\u2026':'Booting Python\u2026');
  let r;try{r=await clRunPy(src);}catch(e){r={out:'',err:'Could not start Python: '+e};}
  btn.disabled=false;btn.innerHTML='\u25b6 Run again';
  const ok=!r.err&&clNorm(r.out)===clNorm(p.expected);CL.ran={ok,out:r.out,err:r.err,src};
  if(ok){if(!CL.solved[p.id]){CL.solved[p.id]=true;xpAward(CL_XP,p.title);try{dailyBump('drills_done',1);}catch(e){}
      sbPost('code_sensei_attempts',{exercise_id:p.id,attempt_number:CL.attempts.length+1,result:'pass',code:src,notes:'compose lab'}).catch(()=>{});
      sbPatch('code_sensei_exercises',p.id,{status:'done'}).catch(()=>{});clRenderTop();}}
  else CL.attempts.unshift({n:CL.attempts.length+1,src,out:r.out,err:r.err,expected:p.expected,open:CL.attempts.length===0,saved:false,mark:null});
  clRenderOut();clRenderAttempts();}

// ─── Output (own container) ───
function clRenderOut(){const el=clEl('cl-out');if(!el)return;if(!CL.ran){el.innerHTML='';return;}const r=CL.ran;
  el.innerHTML='<div class="cl-out"><div class="cl-out-hd">Output<span class="cl-pill '+(r.ok?'ok':'no')+'">'+(r.ok?'\u2713 MATCHES EXPECTED':'\u2717 DOES NOT MATCH')+'</span></div>'+
  (r.err?'<pre class="err">'+esc(r.err)+'</pre>':'<pre>'+(esc(r.out)||'<span style="color:var(--td)">(no output)</span>')+'</pre>')+'</div>'+(r.ok?clSolvedHtml():'');}
function clSolvedHtml(){const mine=clMine();const i=mine.findIndex(x=>x.id===CL.pid);const nxt=mine[i+1];
  return '<div class="cl-solved">\u2713 Solved \u2014 output matches exactly.<button onclick="clReveal()">Compare with reference</button>'+(nxt?'<button onclick="clLoad('+nxt.id+')">Next \u2192</button>':'')+'</div>'+
  '<div style="margin-top:12px">'+mascotBubble('<em>'+['\u201cClean. Now make it shorter.\u201d','\u201cIt runs. Do you know <b>why</b> it runs?\u201d','\u201cOne more belt-stitch earned.\u201d'][CL.pid%3]+'</em>',40,'proud')+'</div>';}

// ─── Attempts stack (own container) ───
function clDiffHtml(mineRaw,expRaw,ai){const mine=clNorm(mineRaw).split('\n'),exp=clNorm(expRaw).split('\n'),n=Math.max(mine.length,exp.length);let a='',b='';
  for(let i=0;i<n;i++){const m=mine[i],e=exp[i],same=m===e;const pick=ai!=null&&!same&&m!==undefined;
    a+='<span class="cl-dl '+(m===undefined?'':same?'good':'bad')+(pick?' pick'+(CL.attempts[ai].mark===i?' marked':''):'')+'"'+(pick?' onclick="clMark('+ai+','+i+')"':'')+'>'+(m===undefined?'\u00a0':esc(m)||'\u00a0')+'</span>';
    b+='<span class="cl-dl '+(e===undefined?'':same?'good':'bad')+'">'+(e===undefined?'\u00a0':esc(e)||'\u00a0')+'</span>';}
  return '<div class="cl-diffgrid"><div><div class="h">Your output</div><pre>'+a+'</pre></div><div><div class="h">Expected</div><pre>'+b+'</pre></div></div>';}
function clRenderAttempts(){const el=clEl('cl-attempts');if(!el)return;if(!CL.attempts.length){el.innerHTML='';return;}
  let h='<div class="cl-stack"><div class="cl-stack-hd">Failed attempts <span class="cnt">'+CL.attempts.length+'</span><span class="note">Nothing is saved automatically \u2014 pick what\u2019s worth a re-match</span></div>';
  CL.attempts.forEach((a,i)=>{const why=a.err?a.err.split('\n').pop():'output mismatch \u2014 '+clNorm(a.out).split('\n')[0].slice(0,44);
    h+='<div class="cl-att'+(a.open?' open':'')+(a.saved?' saved':'')+'"><div class="cl-att-hd" onclick="clToggleAtt('+i+')"><span class="num">#'+a.n+'</span><span class="why">'+esc(why||'(empty output)')+'</span>'+
    '<button class="sv'+(a.saved?' done':'')+'" onclick="event.stopPropagation();'+(a.saved?'':'clSaveAtt('+i+')')+'">'+(a.saved?'\u2713 In Dojo':'Save to Dojo')+'</button><span class="chev">\u25be</span></div>'+
    '<div class="cl-att-body">'+(a.err?'<div class="cl-att-err">'+esc(a.err)+'</div>':'')+'<div class="cl-markhint">Click a line in <em>Your output</em> to mark the one you got wrong \u2014 that line becomes the re-match.</div>'+clDiffHtml(a.out,a.expected,i)+'</div></div>';});
  el.innerHTML=h+'</div>';}
function clToggleAtt(i){CL.attempts[i].open=!CL.attempts[i].open;clRenderAttempts();}
function clMark(i,l){CL.attempts[i].mark=CL.attempts[i].mark===l?null:l;clRenderAttempts();}
function clSaveAtt(i){const a=CL.attempts[i];if(a.mark==null){exToast('\u26a0 Mark the wrong line first');a.open=true;clRenderAttempts();return;}CL.pending=a;clRenderOvl();}

// ─── Overlays: save sheet · reveal (own container) ───
function clRenderOvl(){const el=clEl('cl-ovl');if(!el)return;el.innerHTML=CL.pending?clSaveSheetHtml():CL.reveal?clRevealHtml():'';}
function clCloseSheet(){CL.pending=null;CL.reveal=false;clRenderOvl();}
function clReveal(){CL.reveal=true;clRenderOvl();}
function clSaveSheetHtml(){const a=CL.pending,p=clProb();const mine=clNorm(a.out).split('\n')[a.mark]||'(no line)';const exp=clNorm(a.expected).split('\n')[a.mark]||'(nothing)';
  return '<div class="cl-ovl" onclick="if(event.target===this)clCloseSheet()"><div class="cl-sheet"><div class="cl-sheet-hd"><h3>\u2694 Send to the Dojo</h3><button class="cl-ibtn" onclick="clCloseSheet()">\u00d7</button></div><div class="cl-sheet-bd">'+
  '<div class="cl-expect"><span class="k">Marked line</span><pre>'+esc(mine)+'\n\u2192 should be: '+esc(exp)+'</pre></div>'+
  '<div class="cl-sol"><div class="n">wrong_answers \u00b7 type-the-fix re-match</div><pre>'+esc(p.title)+'\nyour line:    '+esc(mine)+'\ncorrect line: '+esc(exp)+'\ndue: tomorrow</pre></div>'+
  '<div class="cl-sol"><div class="n">mistakes \u00b7 keeps the code</div><pre>'+esc(a.src)+'</pre></div>'+
  '<div class="cl-actions"><button class="cl-run" id="cl-save-btn" onclick="clConfirmSave()">Save both</button><button class="cl-gbtn" onclick="clCloseSheet()">Cancel</button></div></div></div></div>';}
async function clConfirmSave(){const a=CL.pending,p=clProb();const btn=clEl('cl-save-btn');if(btn){btn.disabled=true;btn.textContent='Saving\u2026';}
  const mine=clNorm(a.out).split('\n')[a.mark]||'';const exp=clNorm(a.expected).split('\n')[a.mark]||'';const uid=await getUserId();const now=new Date().toISOString();
  const q='Fix the line that produced the wrong output in \u201c'+p.title+'\u201d.\n\n'+p.statement+'\n\nYour output line '+(a.mark+1)+' was:\n'+mine+'\n\nWhat should that line of output have been?';
  const [w,m]=await Promise.all([
    sbPost('code_sensei_wrong_answers',{user_id:uid==null?null:String(uid),challenge_id:'compose:'+p.id+':'+a.n+':'+Date.now(),topic_id:'python',module_number:null,question:q,code_snippet:a.src,correct_answer:exp,your_answer:mine,options:null,source:'compose',challenge_type:'type_the_fix',miss_count:1,drill_count:0,mastered:false,last_missed_at:now,due_at:srsPlusDays(1)}),
    sbPost('code_sensei_mistakes',{user_id:uid,topic_id:'python',module_number:null,title:'Compose: '+p.title,description:a.err?a.err.split('\n').pop():'Output mismatch on line '+(a.mark+1),code_snippet:a.src,correct_form:exp,tags:['compose',p.group]})]);
  a.saved=true;CL.pending=null;S.dojoLoaded=false;clRenderOvl();clRenderAttempts();
  exToast(w&&m?'\u2694 Saved \u2014 re-match queued in the Dojo':'\u26a0 Partly saved \u2014 check console');}
function clRevealHtml(){const p=clProb();return '<div class="cl-ovl" onclick="if(event.target===this)clCloseSheet()"><div class="cl-sheet"><div class="cl-sheet-hd"><h3>Reference \u00b7 '+esc(p.title)+'</h3><button class="cl-ibtn" onclick="clCloseSheet()">\u00d7</button></div><div class="cl-sheet-bd">'+
  (CL.ran&&CL.ran.ok?'<div class="cl-sol"><div class="n">yours</div><pre>'+esc(CL.ran.src)+'</pre></div>':'')+
  p.solution.map(b=>'<div class="cl-sol"><div class="n">'+esc(b.name)+'</div><pre>'+esc(b.code)+'</pre></div>').join('')+
  '<div class="cl-ro">Read-only \u2014 nothing is copied into your blocks.</div></div></div></div>';}

// ─── Sensei hints (own container) ───
function clRenderSensei(){const el=clEl('cl-sensei');if(!el)return;
  el.innerHTML='<div class="cl-sensei"><div class="cl-sensei-hd">'+mascotSvg(26,'calm')+'<span class="t">Sensei \u00b7 hints</span>'+
  '<span class="cl-srctog"><button class="'+(CL.live?'':'on')+'" onclick="CL.live=false;clRenderSensei()">Canned</button><button class="'+(CL.live?'on':'')+'" onclick="CL.live=true;clRenderSensei()">Claude</button></span></div>'+
  '<div class="cl-chat" id="cl-chat">'+CL.chat.map(m=>'<div class="cl-msg '+m.r+'">'+m.t+'</div>').join('')+'</div>'+
  '<div class="cl-quick"><button onclick="clAsk(\'Give me a nudge\')">Give me a nudge</button><button onclick="clAsk(\'What am I missing?\')">What am I missing?</button><button onclick="clAsk(\'Explain the expected output\')">Explain the expected output</button></div>'+
  '<div class="cl-chat-in"><input id="cl-chat-in" placeholder="Ask the sensei\u2026" onkeydown="if(event.key===\'Enter\')clAsk(this.value)" /><button onclick="clAsk(document.getElementById(\'cl-chat-in\').value)">Ask</button></div></div>';
  const c=clEl('cl-chat');if(c)c.scrollTop=c.scrollHeight;}
async function clAsk(q){q=String(q||'').trim();if(!q)return;const p=clProb();CL.chat.push({r:'u',t:esc(q)});CL.chat.push({r:'s',t:'<span style="color:var(--td)">thinking\u2026</span>'});clRenderSensei();let reply;
  if(CL.live){try{const r=await fetch(SB_FN+'/claude-proxy',{method:'POST',headers:{'Content-Type':'application/json','x-cs-secret':CS_SECRET},body:JSON.stringify({system:'You are Sensei, a terse Python coding coach. Give ONE short nudge (max 2 sentences). Never give the full solution. Use `backticks` for code tokens.',messages:[{role:'user',content:'Problem: '+p.title+' \u2014 '+p.statement+'\nExpected stdout: '+p.expected+'\nStudent code:\n'+clAssemble()+'\n\nQuestion: '+q}]})});
      const d=await r.json();reply=d.text||d.content?.[0]?.text||d.reply||JSON.stringify(d).slice(0,200);}catch(e){reply='Claude is unreachable right now. Canned nudge: '+p.hints[0];}}
  else reply=p.hints[Math.min(CL.hintIdx++,p.hints.length-1)];
  CL.chat.pop();CL.chat.push({r:'s',t:esc(reply).replace(/`([^`]+)`/g,'<code>$1</code>')});clRenderSensei();}
