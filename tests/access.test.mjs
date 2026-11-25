import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile(new URL('../access/core.js',import.meta.url),'utf8');
const A='10000000-0000-4000-8000-000000000001',B='10000000-0000-4000-8000-000000000002';
const legacyA='20000000-0000-4000-8000-000000000001',legacyB='20000000-0000-4000-8000-000000000002';
const base='https://fixture.example.invalid';
function memory(){const s={};Object.defineProperties(s,{getItem:{value:k=>s[k]??null},setItem:{value:(k,v)=>s[k]=String(v)},removeItem:{value:k=>delete s[k]}});return s;}
function setup(storage=memory(),extra={}){
 const env={URL,Headers,Response,TypeError,console};vm.runInNewContext(source,env);
 const state={actor:A,online:true,allowed:true,reads:[],writes:[],locks:[],fail:false,time:1000000000000};
 const user=()=>({id:state.actor,is_anonymous:false,email_confirmed_at:'2026-11-26'});
 const auth={getSession:async()=>({data:{session:{user:user(),access_token:'token-'+state.actor}}}),getUser:async()=>({data:{user:user()}}),signOut:async()=>{}};
 const receipts=new Map();let next=0;
 const fetcher=async(url,init)=>{
  const headers=new Headers(init.headers);state.reads.push({url,headers});
  if(state.fail)throw new TypeError('network lost');
  if(url.endsWith('code_sensei_current_user_id'))return Response.json(state.allowed?(state.actor===A?legacyA:legacyB):null,{status:state.allowed?200:403});
  if(url.endsWith('code_sensei_apply_offline')){
   const op=JSON.parse(init.body);state.writes.push(op);
   if(!receipts.has(op.operation_id))receipts.set(op.operation_id,[{id:++next}]);
   if(state.dropResponse){state.dropResponse=false;throw new TypeError('lost receipt response');}
   return Response.json(receipts.get(op.operation_id));
  }
  if(state.defer)return state.defer();
  return Response.json([{owner:state.actor,note:'retained note'}]);
 };
 const api=env.createCSAccess({auth,fetcher,storage,base,key:'sb_publishable_fixture',online:()=>state.online,now:()=>state.time,uuid:()=>String(++next),onLock:m=>state.locks.push(m),...extra});
 return {api,state,storage,receipts,auth};
}
test('verified mapping supplies identity and every request carries the user JWT',async()=>{
 const {api,state}=setup();await api.open();assert.equal(api.userId,legacyA);
 await api.request(base+'/rest/v1/code_sensei_user_notes');
 assert.ok(state.reads.every(r=>r.headers.get('Authorization')==='Bearer token-'+A));
 await assert.rejects(()=>api.request('https://other.example.invalid/rest/v1/x'),/destination/);
});
test('unmapped accounts fail closed without reading personal records',async()=>{
 const {api,state}=setup();state.allowed=false;await assert.rejects(()=>api.open(),/access/);
 assert.equal(api.ready,false);assert.equal(state.reads.length,1);
});
test('offline reload preserves own notes and drafts but account B has neither',async()=>{
 const {api,state,storage}=setup();await api.open();api.local.setItem('cs_cb_1','retained draft');
 const url=base+'/rest/v1/code_sensei_user_notes';await api.request(url);
 const reload=setup(storage);reload.state.online=false;reload.api.offline();
 assert.equal(reload.api.local.getItem('cs_cb_1'),'retained draft');
 assert.equal((await (await reload.api.request(url)).json())[0].owner,A);
 const b=setup(storage);b.state.actor=B;await b.api.open();
 assert.equal(b.api.local.getItem('cs_cb_1'),null);b.state.online=false;
 await assert.rejects(()=>b.api.request(url),/not saved/);
 assert.equal(storage['cs_account_v1:'+A+':'+legacyA+':cs_cb_1'],'retained draft');
});
test('switch during a request discards its response and blocks subsequent operations',async()=>{
 const {api,state}=setup();await api.open();let finish;
 state.defer=()=>new Promise(resolve=>{finish=resolve;});
 const pending=api.request(base+'/rest/v1/code_sensei_user_notes');
 while(!finish)await new Promise(resolve=>setTimeout(resolve,0));
 api.authChanged('SIGNED_IN',{user:{id:B}});finish(Response.json([{note:'A secret'}]));
 await assert.rejects(()=>pending,/changed/);assert.equal(api.ready,false);
 await assert.rejects(()=>api.request(base+'/rest/v1/code_sensei_user_notes'),/Sign in/);
});
test('revocation never falls back to a cached successful response',async()=>{
 const {api,state}=setup();await api.open();const url=base+'/rest/v1/code_sensei_user_notes';await api.request(url);
 state.allowed=false;await assert.rejects(()=>api.request(url),/access/);assert.equal(api.hasOffline(),false);
});
test('retry uses the same operation ID after a lost response and preserves newer queue entries',async()=>{
 const {api,state,receipts}=setup();await api.open();state.dropResponse=true;
 assert.equal(await api.write('post','code_sensei_attempts',{exercise_id:1,attempt_number:1}),null);
 assert.equal(api.pending(),1);await api.flush();assert.equal(api.pending(),0);
 assert.equal(receipts.size,1);assert.equal(state.writes[0].operation_id,state.writes[1].operation_id);
 state.online=false;await api.write('patch','code_sensei_exercises',{status:'done'},1);
 assert.equal(api.pending(),1);state.online=true;await api.flush();assert.equal(api.pending(),0);
});
test('offline queue remains under its original account during switching',async()=>{
 const {api,state,storage}=setup();await api.open();state.online=false;
 await api.write('post','code_sensei_attempts',{exercise_id:1,attempt_number:1});api.authChanged('SIGNED_OUT',null);
 const b=setup(storage);b.state.actor=B;await b.api.open();await b.api.flush();assert.equal(b.state.writes.length,0);
 const a=setup(storage);await a.api.open();assert.equal(a.api.pending(),1);await a.api.flush();assert.equal(a.api.pending(),0);
});
test('expired lease and signout deny offline reopen without deleting saved work',async()=>{
 const {api,state,storage}=setup();await api.open();api.local.setItem('cs_cb_1','saved');state.time+=8*86400000;state.online=false;
 assert.throws(()=>api.offline(),/verify/);await api.signOut();assert.equal(api.hasOffline(),false);
 assert.equal(storage['cs_account_v1:'+A+':'+legacyA+':cs_cb_1'],'saved');
});
test('legacy drafts are retained, never adopted by the first login; owner recovery keeps conflicts',async()=>{
 const storage=memory();storage.setItem('cs_cb_1','legacy');storage.setItem('cs_cl_queue','legacy queue');
 const noOwner=setup(storage);await noOwner.api.open();assert.equal(noOwner.api.local.getItem('cs_cb_1'),null);
 assert.throws(()=>noOwner.api.recoverLegacyDrafts(),/original owner/);
 const owner=setup(storage,{legacyOwner:A});await owner.api.open();owner.api.local.setItem('cs_cb_1','new draft');
 assert.equal(owner.api.recoverLegacyDrafts(),1);assert.equal(owner.api.local.getItem('cs_cb_1'),'new draft');
 assert.equal(owner.api.local.getItem('legacy-copy:cs_cb_1'),'legacy');assert.equal(storage.getItem('cs_cl_queue'),'legacy queue');
});
