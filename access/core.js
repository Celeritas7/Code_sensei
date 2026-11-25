/* Staging-only account boundary. The database is the authorization authority. */
(function (root) {
  'use strict';
  root.createCSAccess = function ({ auth, fetcher = fetch, storage = localStorage,
    online = () => navigator.onLine, now = Date.now, uuid = () => crypto.randomUUID(),
    base, key, onLock = () => {}, legacyOwner = null }) {
    const markerKey = 'cs_access_last_verified_v1', maxAge = 7 * 86400000;
    const validId = value => typeof value === 'string' && /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(value);
    const parse = raw => { try { return JSON.parse(raw); } catch { return null; } };
    let active = null, epoch = 0, closed = false, flushing = null, openingSub = null, observedSubject = null;
    const failure = (message, retryable = false) => Object.assign(new Error(message), { retryable });
    const scope = () => {
      if (!active || closed) throw failure('Sign in to open saved work.');
      return active.sub + ':' + active.legacy;
    };
    function lock(message = 'Account access changed. Sign in again.') {
      epoch++; closed = true; active = null;
      storage.removeItem(markerKey); onLock(message);
    }
    function assertCurrent(expected, generation) {
      if (generation !== epoch || closed || scope() !== expected) throw failure('Account changed; operation stopped.');
    }
    const localKey = (name, expected = scope()) => 'cs_account_v1:' + expected + ':' + name;
    const local = {
      getItem: name => storage.getItem(localKey(name)),
      setItem: (name, value) => storage.setItem(localKey(name), value),
      removeItem: name => storage.removeItem(localKey(name))
    };
    function lease() {
      const saved = parse(storage.getItem(markerKey));
      return saved && validId(saved.sub) && validId(saved.legacy) &&
        saved.at <= now() && now() - saved.at <= maxAge ? saved : null;
    }
    async function identity(token) {
      const response = await fetcher(base + '/rest/v1/rpc/code_sensei_current_user_id', {
        method: 'POST', cache: 'no-store', headers: { apikey: key,
          Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: '{}'
      });
      if (!response.ok) throw failure('This account does not have Code Sensei access.');
      const id = await response.json();
      if (!validId(id)) throw failure('No verified Code Sensei identity was returned.');
      return id;
    }
    async function open() {
      const generation = epoch;
      if (closed) throw failure('Reload before signing in with another account.');
      const { data, error } = await auth.getSession();
      const session = data?.session;
      if (error || !session?.access_token) throw failure('Sign in to Code Sensei.');
      openingSub = session.user?.id;
      if (observedSubject && observedSubject !== openingSub) { lock(); throw failure('Account changed during sign-in.'); }
      const verified = await auth.getUser(session.access_token);
      const user = verified.data?.user;
      if (verified.error || !validId(user?.id) || user.id !== session.user?.id ||
          user.is_anonymous !== false || !user.email_confirmed_at) {
        lock('A verified account is required.'); throw failure('A verified account is required.');
      }
      let legacy;
      try { legacy = await identity(session.access_token); }
      catch (error) { if (!(error instanceof TypeError)) lock(error.message); throw error; }
      if (generation !== epoch || closed) throw failure('Account changed during sign-in.');
      active = { sub: user.id, legacy, at: now(), offline: false };
      openingSub = null;
      storage.setItem(markerKey, JSON.stringify(active));
      return { ...active };
    }
    function offline() {
      if (online()) throw failure('Offline study is available when the device is offline.');
      const saved = lease();
      if (!saved || closed) throw failure('Connect and verify this account before offline study.');
      active = { ...saved, offline: true };
      return { ...active };
    }
    async function tokenFor(expected, generation) {
      assertCurrent(expected, generation);
      if (!online()) throw failure('Offline', true);
      const { data, error } = await auth.getSession();
      assertCurrent(expected, generation);
      if (error || !data?.session?.access_token || data.session.user?.id !== active.sub) {
        lock(); throw failure('Sign in again.');
      }
      let mapped;
      try { mapped = await identity(data.session.access_token); }
      catch (error) {
        assertCurrent(expected, generation);
        if (error instanceof TypeError) throw failure('Connection unavailable.', true);
        lock(error.message); throw error;
      }
      assertCurrent(expected, generation);
      if (mapped !== active.legacy) { lock(); throw failure('Account mapping changed.'); }
      active.offline = false;
      active.at = now(); storage.setItem(markerKey, JSON.stringify(active));
      return data.session.access_token;
    }
    async function request(url, init = {}, expected = scope()) {
      const generation = epoch;
      assertCurrent(expected, generation);
      const target = new URL(url), project = new URL(base);
      if (target.origin !== project.origin || !/^\/(rest|functions)\/v1\//.test(target.pathname))
        throw failure('Unexpected data destination.');
      const method = (init.method || 'GET').toUpperCase();
      const savedKey = localKey('response:' + target.href, expected);
      const savedResponse = () => {
        assertCurrent(expected, generation);
        const allowed = lease();
        if (!allowed || allowed.sub + ':' + allowed.legacy !== expected) throw failure('Reconnect to verify offline access.');
        const saved = storage.getItem(savedKey);
        if (method !== 'GET' || saved === null) throw failure('This item is not saved offline.', true);
        return new Response(saved, { status: 200, headers: { 'Content-Type': 'application/json' } });
      };
      if (!online()) return savedResponse();
      let token;
      try { token = await tokenFor(expected, generation); }
      catch (error) { if (!online() && error.retryable) return savedResponse(); throw error; }
      const headers = new Headers(init.headers);
      headers.set('apikey', key); headers.set('Authorization', 'Bearer ' + token);
      headers.set('Content-Type', 'application/json'); headers.set('Prefer', 'return=representation');
      let response;
      try { response = await fetcher(target.href, { ...init, method, headers, cache: 'no-store' }); }
      catch { assertCurrent(expected, generation); if (!online()) return savedResponse(); throw failure('Connection unavailable.', true); }
      assertCurrent(expected, generation);
      if (!response.ok) {
        if ([401,403].includes(response.status)) { lock('Access denied. Reconnect with an authorized account.'); }
        throw failure('Save or load failed (HTTP ' + response.status + ').', response.status >= 500);
      }
      if (method === 'GET') {
        const text = await response.clone().text(); assertCurrent(expected, generation);
        // Quota failure must not turn a successful server read into a lost save.
        try { storage.setItem(savedKey, text); } catch { /* keep existing packs */ }
      }
      return response;
    }
    async function rpc(name, args, expected = scope()) {
      return (await request(base + '/rest/v1/rpc/' + name, { method: 'POST', body: JSON.stringify(args) }, expected)).json();
    }
    async function edge(name, body) {
      const expected = scope();
      if (!await rpc('ga_can_call_edge', { requested_function: name }, expected)) throw failure('This account has no access to this service.');
      return request(base + '/functions/v1/' + name, { method: 'POST', body: JSON.stringify(body) }, expected);
    }
    const queueKey = expected => localKey('cs_cl_queue_v2', expected);
    const queueRead = expected => parse(storage.getItem(queueKey(expected))) || [];
    function enqueue(operation, expected) {
      if (scope() !== expected) throw failure('Account changed; save stopped.');
      const rows = queueRead(expected);
      if (!rows.some(row => row.operation_id === operation.operation_id)) rows.push(operation);
      // Do not swallow storage/quota errors and claim an offline save succeeded.
      storage.setItem(queueKey(expected), JSON.stringify(rows));
    }
    async function write(action, table, data, id) {
      const expected = scope();
      const operation = { operation_id: uuid(), payload: { action, table, data, ...(id == null ? {} : { id }) } };
      // Persist before sending: a lost response retries the same server receipt.
      enqueue(operation, expected);
      if (!online()) return null;
      try {
        const result = await rpc('code_sensei_apply_offline', operation, expected);
        storage.setItem(queueKey(expected), JSON.stringify(queueRead(expected).filter(row => row.operation_id !== operation.operation_id)));
        return result;
      } catch (error) { if (error.retryable) return null; throw error; }
    }
    async function flush() {
      if (flushing || !active || closed || !online()) return;
      const expected = scope(), generation = epoch;
      flushing = (async () => {
        let count = 0;
        for (const operation of queueRead(expected)) {
          assertCurrent(expected, generation);
          await rpc('code_sensei_apply_offline', operation, expected);
          assertCurrent(expected, generation);
          storage.setItem(queueKey(expected), JSON.stringify(queueRead(expected).filter(row => row.operation_id !== operation.operation_id)));
          count++;
        }
        return count;
      })();
      try { return await flushing; } finally { flushing = null; }
    }
    // Recovery requires an operator-supplied verified owner, never the first login.
    // Retain the original keys and any collision as a separate recovery copy.
    function recoverLegacyDrafts() {
      if (!active || active.offline || active.sub !== legacyOwner) throw failure('Legacy recovery needs the verified original owner.');
      const recovered = [];
      for (const name of Object.keys(storage)) {
        if (!/^(cs_cb_\d+|cs_last_lesson|cs_xpl_.+|cs_step_.+)$/.test(name)) continue;
        const value = storage.getItem(name), target = localKey(name);
        if (storage.getItem(target) === null) storage.setItem(target, value);
        else if (storage.getItem(target) !== value) storage.setItem(localKey('legacy-copy:' + name), value);
        recovered.push(name);
      }
      return recovered.length;
    }
    function authChanged(event, session) {
      const subject = session?.user?.id, expected = active?.sub || openingSub || observedSubject;
      if (event === 'SIGNED_OUT' || (expected && subject && subject !== expected)) lock();
      if (subject) observedSubject = subject;
    }
    return { open, offline, request, rpc, edge, write, flush, local, lock, authChanged,
      recoverLegacyDrafts, scope, get userId() { scope(); return active.legacy; },
      get ready() { return !!active && !closed; }, get canRecover() { return active?.sub === legacyOwner; },
      hasOffline: () => !!lease() && !closed,
      async signOut() { lock('Signed out. Saved work remains on this device.'); await auth.signOut({ scope: 'local' }); },
      pending: () => queueRead(scope()).length };
  };
})(globalThis);
