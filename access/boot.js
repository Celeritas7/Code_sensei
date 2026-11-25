/* Included only by the explicit staging builder, after the existing app. */
const csGate = document.getElementById('cs-access-gate');
const csMessage = document.getElementById('cs-access-message');
const csConfig = window.CS_STAGE_CONFIG;
let CS;
function csLock(message) {
  document.documentElement.classList.remove('cs-access-open');
  document.getElementById('cs-app').inert = true;
  csMessage.textContent = message;
  document.getElementById('cs-reload').hidden = false;
}
async function csWorker() {
  if (!('serviceWorker' in navigator)) throw new Error('This browser needs service-worker support for this staging build.');
  await navigator.serviceWorker.register('./sw.js');
  await navigator.serviceWorker.ready;
  // A previous worker cached anonymous REST responses. Never start the client
  // until the new worker confirms it does not serve that mixed cache.
  for (let attempt = 0; attempt < 30; attempt++) {
    const controller = navigator.serviceWorker.controller;
    if (controller && await new Promise(resolve => {
      const channel = new MessageChannel();
      const timer = setTimeout(() => { channel.port1.close(); resolve(false); }, 300);
      channel.port1.onmessage = e => { clearTimeout(timer); channel.port1.close(); resolve(e.data === 'cs-access-v1'); };
      controller.postMessage('CS_ACCESS_VERSION', [channel.port2]);
    })) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('The account-safe offline update is not ready. Reconnect and reload; keep your saved data.');
}
async function csEnter(offline) {
  try {
    await csWorker();
    if (offline) CS.offline(); else await CS.open();
    if (offline) {
      try { Object.assign(P, JSON.parse(CS.local.getItem('cs_player_state') || '{}')); } catch {}
      try { Object.assign(D, JSON.parse(CS.local.getItem('cs_daily_state') || '{}')); } catch {}
    } else {
      await Promise.all([playerLoad(), dailyLoad()]);
      CS.local.setItem('cs_player_state', JSON.stringify(P));
      CS.local.setItem('cs_daily_state', JSON.stringify(D));
    }
    if (matchMedia('(max-width:700px)').matches) goMHome(); else goDash();
    if (!CS.ready) throw new Error('Account changed while loading. Reload to continue.');
    document.getElementById('cs-recover').hidden = !CS.canRecover;
    document.getElementById('cs-app').inert = false;
    document.documentElement.classList.add('cs-access-open');
    if (!offline) clFlushQueue();
  } catch (error) { csLock(error.message || 'Unable to verify account access.'); }
}
if (!csConfig?.projectUrl || !csConfig?.publishableKey) {
  csLock('This is a preparation build. Configure the reviewed staging project before signing in.');
} else {
  const client = window.supabase.createClient(csConfig.projectUrl, csConfig.publishableKey, {
    auth: { storageKey: 'cs_verified_auth_v1', flowType: 'pkce', persistSession: true,
      autoRefreshToken: true, detectSessionInUrl: true }
  });
  CS = createCSAccess({ auth: client.auth, base: csConfig.projectUrl,
    key: csConfig.publishableKey, onLock: csLock, legacyOwner: csConfig.legacyOwner });
  // Synchronous callback: no Auth requests or awaits inside the SDK lock.
  client.auth.onAuthStateChange((event, session) => CS.authChanged(event, session));
  window.addEventListener('storage', event => {
    if (event.key !== 'cs_verified_auth_v1') return;
    let session; try { session = JSON.parse(event.newValue); } catch { /* removal */ }
    CS.authChanged(session?.user ? 'SIGNED_IN' : 'SIGNED_OUT', session);
  });
  window.addEventListener('pageshow', event => { if (event.persisted) { CS.lock('Rechecking account after returning to this page.'); location.reload(); } });
  document.getElementById('cs-google').onclick = async () => {
    if (CS.ready) return;
    const { error } = await client.auth.signInWithOAuth({ provider: 'google', options: {
      redirectTo: csConfig.redirectUrl || location.origin + location.pathname } });
    if (error) csMessage.textContent = error.message;
  };
  document.getElementById('cs-offline').hidden = !CS.hasOffline();
  document.getElementById('cs-offline').onclick = () => csEnter(true);
  document.getElementById('cs-signout').onclick = () => CS.signOut().catch(error => csLock(error.message));
  document.getElementById('cs-recover').onclick = () => {
    try { exToast('Recovered ' + CS.recoverLegacyDrafts() + ' saved draft entries. Original copies retained.'); }
    catch (error) { exToast(error.message); }
  };
  if (navigator.onLine) csEnter(false);
  else csMessage.textContent = 'Offline. Continue the last verified account’s saved study, or reconnect to sign in.';
}
document.getElementById('cs-reload').onclick = () => location.reload();

async function csFetch(url, init) { return CS.request(url, init); }
async function csRead(table, query = '') { return (await csFetch(SB + '/' + table + '?' + query)).json(); }
async function csWrite(table, method, query, data) {
  const response = await csFetch(SB + '/' + table + (query ? '?' + query : ''), {
    method, body: data === undefined ? undefined : JSON.stringify(data)
  });
  const rows = await response.json();
  if (!Array.isArray(rows) || (method !== 'DELETE' && !rows.length)) throw new Error('The record is unavailable; nothing was saved.');
  return rows;
}
