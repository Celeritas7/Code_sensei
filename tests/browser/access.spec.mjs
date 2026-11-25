import {test,expect} from '@playwright/test';
const A='10000000-0000-4000-8000-000000000001',B='10000000-0000-4000-8000-000000000002';
const legacyA='20000000-0000-4000-8000-000000000001',legacyB='20000000-0000-4000-8000-000000000002';
test.beforeEach(async({context})=>{
 await context.addInitScript(({A})=>{
  if(localStorage.getItem('fixture_actor')===null)localStorage.setItem('fixture_actor',A);
  const user=()=>({id:localStorage.getItem('fixture_actor'),is_anonymous:false,email_confirmed_at:'2026-11-26'});
  let listener;
  const mock={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:user(),access_token:'synthetic-'+user().id}}}),
    getUser:async()=>({data:{user:user()}}),onAuthStateChange:fn=>{listener=fn;return{data:{subscription:{unsubscribe(){}}}};},
    signInWithOAuth:async options=>{window.oauthOptions=options;return{error:null};},
    signOut:async()=>{localStorage.setItem('fixture_actor','');listener?.('SIGNED_OUT',null);}}})};
  Object.defineProperty(window,'supabase',{get:()=>mock,set:()=>{}});
  window.switchFixture=id=>{localStorage.setItem('fixture_actor',id);listener?.('SIGNED_IN',{user:{id}});};
 },{A});
 await context.route('https://**/*',async route=>{
  const request=route.request(),url=new URL(request.url());
  if(url.origin!=='https://fixture.example.invalid')return route.abort();
  const actor=request.headers().authorization?.replace('Bearer synthetic-','');
  if(![A,B].includes(actor))return route.fulfill({status:401,json:{error:'missing verified JWT'}});
  const legacy=actor===A?legacyA:legacyB;
  if(url.pathname.endsWith('/code_sensei_current_user_id'))return route.fulfill({json:legacy});
  if(url.pathname.endsWith('/code_sensei_player'))return route.fulfill({json:[{id:actor===A?1:2,user_id:legacy,xp:20,active_days:[],hearts:5}]});
  if(url.pathname.endsWith('/code_sensei_daily'))return route.fulfill({json:[]});
  if(url.pathname.endsWith('/code_sensei_exercises'))return route.fulfill({json:[{id:actor===A?1:2,user_id:legacy,title:actor===A?'A practice':'B practice',category:'compose',language:'python',blocks:[{name:'main',code:'print(42)'}],expected_output:'42',status:'todo'}]});
  if(url.pathname.endsWith('/code_sensei_user_notes'))return route.fulfill({json:[{id:'fixture-note',note_text:actor+' private note'}]});
  return route.fulfill({json:[]});
 });
});
test('verified boot, owner-scoped drafts and explicit Google action',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.locator('html')).toHaveClass(/cs-access-open/);
 await page.evaluate(()=>goCompose());await expect(page.locator('#main')).toContainText('A practice');
 await page.evaluate(()=>{CL.blocks=[{name:'main',code:'saved draft',collapsed:false,auto:false}];clSync();});
 expect(await page.evaluate(({A,legacyA})=>localStorage.getItem('cs_account_v1:'+A+':'+legacyA+':cs_cb_1'),{A,legacyA})).toContain('saved draft');
 await page.getByRole('button',{name:'Sign out',exact:true}).click();
 await expect(page.locator('#cs-access-gate')).toBeVisible();
 await page.getByRole('button',{name:'Continue with Google'}).click();
 expect(await page.evaluate(()=>window.oauthOptions.provider)).toBe('google');
 expect(errors).toEqual([]);
});
test('account change hides old state and B cannot load A cached responses or drafts',async({page})=>{
 await page.goto('/');await expect(page.locator('html')).toHaveClass(/cs-access-open/);
 await page.evaluate(async()=>{await csRead('code_sensei_user_notes');CS.local.setItem('cs_cb_1','A draft');});
 await page.evaluate(B=>switchFixture(B),B);
 await expect(page.locator('#cs-access-gate')).toBeVisible();
 expect(await page.locator('#cs-app').evaluate(el=>el.inert)).toBe(true);
 await page.reload();await expect(page.locator('html')).toHaveClass(/cs-access-open/);
 expect(await page.evaluate(()=>CS.local.getItem('cs_cb_1'))).toBeNull();
 await page.evaluate(()=>goCompose());await expect(page.locator('#main')).toContainText('B practice');
 await expect(page.locator('#main')).not.toContainText('A practice');
});
test('cold offline reload keeps the worker, lesson pack and own Compose draft',async({page,context})=>{
 await page.goto('/');await expect(page.locator('html')).toHaveClass(/cs-access-open/);
 await page.evaluate(async()=>{await goCompose();CS.local.setItem('cs_cb_1',JSON.stringify([{n:'main',c:'print(99)',col:false,auto:false}]));
  const pack=await caches.open('cs-pyodide-v1');await pack.put('https://cdn.jsdelivr.net/pyodide/fixture.js',new Response('runtime fixture'));});
 await context.setOffline(true);await page.reload();
 await page.getByRole('button',{name:'Continue saved study'}).click();
 await expect(page.locator('html')).toHaveClass(/cs-access-open/);
 await page.evaluate(()=>goCompose());await expect(page.locator('#main')).toContainText('A practice');
 expect(await page.evaluate(()=>CL.blocks[0].code)).toBe('print(99)');
 expect(await page.evaluate(async()=>!!await(await caches.open('cs-pyodide-v1')).match('https://cdn.jsdelivr.net/pyodide/fixture.js'))).toBe(true);
});
test('old mixed API cache is preserved but never served by the new worker',async({page})=>{
 await page.goto('/');await expect(page.locator('html')).toHaveClass(/cs-access-open/);
 await page.evaluate(async()=>{const old=await caches.open('cs-data-v3');await old.put('https://fixture.example.invalid/rest/v1/code_sensei_user_notes?',Response.json([{note_text:'old unscoped secret'}]));});
 expect(await page.evaluate(async()=>await csRead('code_sensei_user_notes'))).toEqual([{id:'fixture-note',note_text:A+' private note'}]);
 expect(await page.evaluate(()=>caches.keys())).toContain('cs-data-v3');
});
