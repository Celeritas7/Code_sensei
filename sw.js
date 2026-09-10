// Code Sensei service worker — Phase 16 offline-first. Registered on https only (index.html) — never on localhost dev.
// shell: precached, network-first · Supabase REST GETs: network-first, cache fallback (lessons + compose problems open offline once seen)
// Pyodide CDN: cache-first (≈12 MB, cached lazily on first run) · everything else passes through.
const V='v3';const SHELL_C='cs-shell-'+V,DATA_C='cs-data-'+V,PY_C='cs-pyodide-v1';const KEEP=[SHELL_C,DATA_C,PY_C];
const SHELL=['./','./index.html','./css/compose.css','./js/compose.js','./manifest.json','./icons/icon.svg','./icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(SHELL_C).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>!KEEP.includes(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
const netFirst=(req,cn,fallback)=>fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque')){const cp=r.clone();caches.open(cn).then(c=>c.put(req,cp));}return r;})
  .catch(async err=>{const m=await caches.match(req);if(m)return m;if(fallback){const f=await caches.match(fallback);if(f)return f;}throw err;});
const cacheFirst=(req,cn)=>caches.match(req).then(m=>m||fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque')){const cp=r.clone();caches.open(cn).then(c=>c.put(req,cp));}return r;}));
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;const u=new URL(req.url);
  if(u.origin===location.origin){e.respondWith(netFirst(req,SHELL_C,req.mode==='navigate'?'./index.html':null));return;}
  if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('/pyodide/')){e.respondWith(cacheFirst(req,PY_C));return;}
  if(u.hostname.endsWith('.supabase.co')&&u.pathname.startsWith('/rest/v1/')){e.respondWith(netFirst(req,DATA_C,null));return;}
});
