import {readFile,writeFile,mkdir,copyFile,cp} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),out=resolve(root,'.staging');
const source=await readFile(resolve(root,'index.html'),'utf8');
const composeSource=await readFile(resolve(root,'js/compose.js'),'utf8');
const hash=text=>createHash('sha256').update(text).digest('hex');
const baseline=JSON.parse(await readFile(resolve(root,'access/source-lock.json'),'utf8'));
if(hash(source)!==baseline.index || hash(composeSource)!==baseline.compose) throw Error('Source changed. Review the staging transformations and update source-lock.json.');
let config={projectUrl:null,publishableKey:null,redirectUrl:null,legacyOwner:null};
if(process.argv.includes('--fixture'))config={...config,projectUrl:'https://fixture.example.invalid',publishableKey:'sb_publishable_synthetic'};
const configArg=process.argv.indexOf('--config');
if(configArg!==-1)config={...config,...JSON.parse(await readFile(process.argv[configArg+1],'utf8'))};
if(config.projectUrl){const url=new URL(config.projectUrl);if(url.username||url.password||url.pathname!=='/'||url.search||url.hash||
  !(url.protocol==='https:'||url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)))throw Error('Use an HTTPS project origin or a loopback fixture.');
  config.projectUrl=url.origin;
  if(!config.publishableKey?.startsWith('sb_publishable_'))throw Error('Only a public publishable key belongs in this package.');
}
if(config.legacyOwner && !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(config.legacyOwner))throw Error('legacyOwner must be an operator-verified Auth UUID.');
function one(text,from,to){if(!text.includes(from)||text.indexOf(from)!==text.lastIndexOf(from))throw Error('Staging replacement drift: '+from.slice(0,60));return text.replace(from,to);}
let html=source,compose=composeSource;
html=html.replace(/const SB='[^']+';\nconst SB_FN='[^']+';\nconst K='[^']+';[\s\S]*?const GH_API=/,
 "const SB=window.CS_STAGE_CONFIG.projectUrl+'/rest/v1';\nconst SB_FN=window.CS_STAGE_CONFIG.projectUrl+'/functions/v1';\nconst GH_API=");
html=html.replace(/async function sbq\([\s\S]*?\nfunction md\(/,
 `async function sbq(table,query=''){return csRead(table,query);}
async function sbPatch(table,id,data){return csWrite(table,'PATCH','id=eq.'+encodeURIComponent(id),data);}
async function sbPost(table,data){return csWrite(table,'POST','',data);}
function sbFail(msg){exToast(msg);}
async function getUserId(){return CS.userId;}
function md(`);
html=html.replace(/async function senseiCall\(body\)\{let r;try\{[\s\S]*?\n  let d=null;/,
 "async function senseiCall(body){const r=await CS.edge('claude-proxy',body);\n  let d=null;");
html=one(html,"playerLoad();dailyLoad();\nif(matchMedia('(max-width:700px)').matches)goMHome();else goDash();\nif('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});",'// Verified boot is loaded after the app definitions.');
html=html.replaceAll('fetch(`${SB}/','csFetch(`${SB}/').replaceAll(',headers:HDR','');
compose=compose.replace("fetch(SB+'/code_sensei_exercises'","csFetch(SB+'/code_sensei_exercises'").replaceAll(',headers:HDR','');
html=html.replaceAll('localStorage.', 'CS.local.');
// Theme is a nonpersonal preference read before the account boundary opens.
html=html.replaceAll("CS.local.getItem('cs_theme')","localStorage.getItem('cs_theme')").replaceAll("CS.local.setItem('cs_theme'","localStorage.setItem('cs_theme'");
compose=compose.replaceAll('localStorage.','CS.local.');
compose=compose.replace(/function clQGet\([\s\S]*?\nwindow.addEventListener\('online',[^\n]+\n/,
 `function clPost(table,data){return CS.write('post',table,data);}
function clPatch(table,id,data){return CS.write('patch',table,data,id);}
async function clFlushQueue(){if(!CS?.ready)return;try{const n=await CS.flush();if(n)exToast('Synced '+n+' saved changes');}catch(e){exToast(e.message);}}
window.addEventListener('online',()=>{if(CS?.ready){clFlushQueue();if(S.view==='compose'&&CL.offline){CL.list=null;goCompose();}}});
`);
// Cached empty/deleted sets must not resurrect previous items after revocation.
compose=compose.replace('if(Array.isArray(rows)&&rows.length)','if(Array.isArray(rows))');
html=html.replace("Add a row to code_sensei_users with name=Aniket.","Ask the administrator to verify your account mapping.");
html=html.replaceAll('Welcome back, Aniket','Welcome back').replaceAll('>Aniket</div>','>Learner</div>');
html=html.replace(/    let projId;[\s\S]*?for\(const fd of fileData\)\{await sbPost\('code_sensei_py_files',fd\);\}/,
 `    const files=tFiles.filter(f=>f.code.trim()).map(f=>({filename:f.name||'untitled.py',code_content:f.code}));
    await CS.rpc('code_sensei_save_project',{project_id:existing[0]?.id||null,project_name:pn,view_mode:tMode,files});`);
// Wrap the old app: inert while signed out, including its fixed-position tools.
html=one(html,'<body>',`<body>
<section id="cs-access-gate" aria-live="polite"><h1>Code Sensei</h1><p id="cs-access-message">Checking your account…</p>
<button id="cs-google">Continue with Google</button> <button id="cs-offline" hidden>Continue saved study</button>
<button id="cs-reload" hidden>Reload</button></section><div id="cs-app" inert>
<aside id="cs-access-bar"><button id="cs-signout">Sign out</button><button id="cs-recover" hidden>Recover original-owner drafts</button></aside>`);
html=one(html,'</head>',`<style>#cs-app{visibility:hidden}#cs-access-gate{max-width:36rem;margin:15vh auto;padding:1.5rem}#cs-access-gate button,#cs-access-bar button{padding:.65rem;margin:.3rem}#cs-access-bar{position:fixed;right:1rem;top:.2rem;z-index:2000}.cs-access-open #cs-app{visibility:visible}.cs-access-open #cs-access-gate{display:none}</style>
<script src="js/access-config.js"></script><script src="vendor/supabase.js"></script><script src="js/access-core.js"></script></head>`);
html=one(html,'</body>','</div><script src="js/access-boot.js"></script></body>');
if(/headers:HDR|const HDR|CS_SECRET|name=eq.Aniket/.test(html+compose))throw Error('An anonymous private-data path remains.');
await mkdir(resolve(out,'js'),{recursive:true});await mkdir(resolve(out,'vendor'),{recursive:true});
for(const path of ['css','icons','manifest.json'])await cp(resolve(root,path),resolve(out,path),{recursive:true});
await writeFile(resolve(out,'index.html'),html);await writeFile(resolve(out,'js/compose.js'),compose);
await writeFile(resolve(out,'js/access-config.js'),'window.CS_STAGE_CONFIG = '+JSON.stringify(config).replaceAll('<','\\u003c')+';\n');
for(const [from,to] of [['core.js','js/access-core.js'],['boot.js','js/access-boot.js'],['sw.js','sw.js']])await copyFile(resolve(root,'access',from),resolve(out,to));
await copyFile(resolve(root,'node_modules/@supabase/supabase-js/dist/umd/supabase.js'),resolve(out,'vendor/supabase.js'));
await writeFile(resolve(out,'PREPARATION.txt'),'Staging only. Requires reviewed General_apps candidates 01, 02, 05 and verified owner mappings. No automatic enrollment or live deployment.\n');
console.log('Prepared .staging; original app and offline worker unchanged.');
