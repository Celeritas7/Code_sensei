# Account isolation preparation

Prepared from main `6f9ac364791c8d5e9c9ecc60ca7fe54073db65e8`. This is an opt-in
staging build. The production index, Compose script, worker and packs are unchanged.
Merging this directory does not activate login or change a hosted database.

## Build

Run `npm ci --ignore-scripts`, `npm test`, and `npm run test:browser`.
`npm run stage` creates `.staging/` with configuration disabled. CI builds a
synthetic configuration, with mocked Auth/API responses and no paid provider calls.
For an approved isolated project, copy `config.example.json` to the ignored
`config.local.json`, fill its public configuration and run
`npm run stage -- --config access/config.local.json`. Serve `.staging/` on HTTPS or
loopback. Do not deploy the fixture artifact. Source hashes pin the reviewed input;
the builder refuses drift until its transformations have been reviewed again.

## Required contracts

The review candidates live in
[Commonplace](https://github.com/Celeritas7/Commonplace/tree/main/platform/operations/general-apps).
The companion change is [Commonplace PR #106](https://github.com/Celeritas7/Commonplace/pull/106).
01 creates protected identity mappings; 02 establishes legacy guards; 05 covers
the full Code_sensei graph. This client needs all three before activation, including
`code_sensei_current_user_id`, `code_sensei_apply_offline` and `code_sensei_save_project`.
Operators must verify each original app UUID against its Auth UUID. No email/name
lookup or first-login ownership claim is allowed. Commonplace enrollment does not
grant Code_sensei access.

Every private request uses the user's JWT and rechecks the mapping. Google uses
the pinned Supabase PKCE client. Review the real provider and exact redirect URLs
before release. The generated app no longer transmits the old shared AI secret.
`claude-proxy` needs the reviewed JWT/entitlement handler in canonical Akatsuki and
an explicit function grant; that deployment is not included here.

Shared curriculum is readable by Code_sensei members. The existing course-day and
diff-explanation INSERT paths additionally require a uniquely linked admin/operator.
Other shared content is browser read-only; preseed course days for viewers.
Personal exercise authoring remains owner scoped.

## Saved work and offline use

The local scope includes the project origin, Auth and original app UUID. Personal responses,
Compose drafts and queued saves cannot fall back to another account's storage.
A switch hides and disables the old page, rejects pending responses and requires
a reload. Persistent operation IDs and transactional receipts make offline Compose
retries safe after lost responses. Project file replacement is transactional.

Offline cold start offers **Continue saved study** for the last verified account
for seven days. Sign-out clears that permission while retaining work. Reconnecting
rechecks access. This prevents accidental account mixing; it does not encrypt
device storage or erase downloaded bytes remotely. Administrative actions need
online authorization. Existing non-Compose save controls do not gain offline
queuing here; resolve their errors online.

Old shell/data caches, Pyodide packs and unscoped keys remain. The new worker never
serves the old mixed REST cache and deletes no packs. Do not clear website data.
Each generated shell has a content-derived cache version, so a later build does
not keep serving an older access script. Pyodide keeps its existing cache.
Before same-origin cutover, verify old tabs and the worker handshake on each device.

Unscoped work is never assigned to the first login. An operator may set
`legacyOwner` to the verified original Auth UUID; that owner can recover Compose
drafts, lesson position and completion markers. Original keys remain, and conflicting
newer drafts retain a separate `legacy-copy:`. Old response caches and `cs_cl_queue`
are preserved but not replayed. Review the original owner and whether each pending
write already committed before conversion. This reconciliation is a release gate,
not a request to delete pending work.

## Remaining release gates

Complete deferred General_apps recovery, source/catalog review, verified mappings,
old-queue reconciliation, provider/callback checks and real device acceptance
before installation or live cutover. Test A/B, an unmapped Commonplace-only account,
revocation, offline reopening and switching on the existing origin. Browser tests
mock the provider; they do not establish real Google or iPad acceptance.
