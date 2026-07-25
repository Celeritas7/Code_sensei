// spec-sheet.jsx — Engineering handoff spec sheets for Claude Code.
// Plain, document-style artboards. Theme-agnostic; uses paper tokens.

const SS = {
  bg: '#fdf8ec',
  ink: '#2a221a',
  muted: '#8a7d68',
  hairline: 'rgba(60, 45, 25, 0.13)',
  accent: '#b8412e',
  accentBg: 'rgba(184, 65, 46, 0.10)',
  surface2: '#ede4cd',
  font: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  mono: '"JetBrains Mono", Menlo, monospace',
};

function SSHeading({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: SS.muted, textTransform: 'uppercase', marginTop: 18, marginBottom: 8 }}>{children}</div>;
}
function SSCode({ children }) {
  return <code style={{ fontFamily: SS.mono, fontSize: 11.5, background: SS.surface2, padding: '1px 5px', borderRadius: 3, color: SS.ink }}>{children}</code>;
}
function SSRow({ k, v }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '6px 0', borderTop: `1px solid ${SS.hairline}`, fontSize: 12, lineHeight: 1.5 }}>
      <div style={{ width: 130, fontFamily: SS.mono, color: SS.accent, fontWeight: 600, flexShrink: 0 }}>{k}</div>
      <div style={{ flex: 1, color: SS.ink }}>{v}</div>
    </div>
  );
}
function SSBox({ children, accent = false }) {
  return (
    <div style={{
      background: accent ? SS.accentBg : '#fff',
      border: `1px solid ${accent ? SS.accent : SS.hairline}`,
      borderRadius: 8, padding: '10px 12px', fontSize: 12, lineHeight: 1.5,
      color: SS.ink,
    }}>{children}</div>
  );
}

function SpecFlow() {
  return (
    <>
      <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.4 }}>App flow</div>
      <div style={{ fontSize: 12, color: SS.muted, marginTop: 4 }}>Linear path from Home to Review. Dojo branches off via tab nav.</div>

      <SSHeading>Primary loop</SSHeading>
      <div style={{ fontFamily: SS.mono, fontSize: 11, lineHeight: 1.6, background: '#fff',
        border: `1px solid ${SS.hairline}`, borderRadius: 8, padding: 12, color: SS.ink }}>
        Home <span style={{ color: SS.accent }}>→</span> Lesson (micro-step ×6) <span style={{ color: SS.accent }}>→</span><br/>
        Exercise [MCQ | Tap-fill | Type-it] <span style={{ color: SS.accent }}>→</span><br/>
        <span style={{ marginLeft: 24 }}>if correct → Result(Correct) → next exercise</span><br/>
        <span style={{ marginLeft: 24 }}>if wrong &nbsp;→ Result(Wrong) → Review → save to Dojo</span>
      </div>

      <SSHeading>Tab nav</SSHeading>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <SSBox><b>Learn</b> — Home + lesson stack</SSBox>
        <SSBox><b>Practice</b> — start a session of mixed exercises</SSBox>
        <SSBox accent><b>Dojo ★</b> — mistake bank, the differentiator</SSBox>
        <SSBox><b>Sensei</b> — profile, belt path, settings</SSBox>
      </div>

      <SSHeading>Routes</SSHeading>
      <SSRow k="/home"            v="HomeV2 — single Continue CTA + missions" />
      <SSRow k="/lesson/:id"      v="LessonV2 — micro-step pager (swipe/tap)" />
      <SSRow k="/exercise/:id"    v="Renders MCQ | Tap | Type by exercise.kind" />
      <SSRow k="/result"          v="Modal route — Correct or Wrong, then auto-advance" />
      <SSRow k="/review/:attempt" v="ReviewV2 — fed by attempt + solution" />
      <SSRow k="/dojo"            v="DojoV2 — list of Mistake records, drill action" />

      <SSHeading>State (Zustand or Context)</SSHeading>
      <SSRow k="user"     v="{ id, name, xp, hearts, streak, beltLevel }" />
      <SSRow k="progress" v="{ trackId → { unitIdx, lessonIdx, stepIdx } }" />
      <SSRow k="mistakes" v="Mistake[] — see Components tab" />
      <SSRow k="session"  v="Active exercise stack + heart count for that run" />
    </>
  );
}

function SpecTokens() {
  return (
    <>
      <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.4 }}>Design tokens</div>
      <div style={{ fontSize: 12, color: SS.muted, marginTop: 4 }}>Theme A · Dojo Paper. All themes share the same shape; only values differ.</div>

      <SSHeading>Color · core</SSHeading>
      {[
        ['--bg',        '#f7f1e3', 'page background'],
        ['--surface',   '#fdf8ec', 'cards'],
        ['--surface-2', '#ede4cd', 'inset / muted fills'],
        ['--ink',       '#2a221a', 'primary text'],
        ['--muted',     '#8a7d68', 'secondary text'],
        ['--hairline',  'rgba(60,45,25,0.13)', '1px borders'],
        ['--accent',    '#b8412e', 'CTA, sensei, links'],
        ['--accent-bg', 'rgba(184,65,46,0.10)', 'soft accent surface'],
      ].map(([k, v, d]) => (
        <div key={k} style={{ display: 'flex', gap: 10, padding: '5px 0', borderTop: `1px solid ${SS.hairline}`, fontSize: 12 }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, background: v, border: `1px solid ${SS.hairline}`, flexShrink: 0 }} />
          <div style={{ width: 100, fontFamily: SS.mono, fontSize: 11, color: SS.accent }}>{k}</div>
          <div style={{ width: 110, fontFamily: SS.mono, fontSize: 11, color: SS.ink }}>{v}</div>
          <div style={{ flex: 1, color: SS.muted }}>{d}</div>
        </div>
      ))}

      <SSHeading>Color · semantic</SSHeading>
      <SSRow k="--success" v="#5b8a3a — correct, passing tests, +diff" />
      <SSRow k="--error"   v="#b8412e — wrong, failing tests, −diff" />
      <SSRow k="--warn"    v="#c98a2c — almost-right, due-soon" />

      <SSHeading>Type</SSHeading>
      <SSRow k="font.sans"   v={<>Inter — 400/500/600/700/800</>} />
      <SSRow k="font.mono"   v={<>JetBrains Mono — for all code</>} />
      <SSRow k="display"     v="28/-0.6 800 — screen titles" />
      <SSRow k="title"       v="22/-0.4 700 — card titles" />
      <SSRow k="body"        v="14/1.55 400 — paragraphs" />
      <SSRow k="caption"     v="11/1.5 700 1.5px tracking — eyebrows" />
      <SSRow k="code"        v="13/1.55 mono — code blocks" />

      <SSHeading>Radius & spacing</SSHeading>
      <SSRow k="--r-pill" v="999px — buttons, chips" />
      <SSRow k="--r-card" v="14px — cards, tiles" />
      <SSRow k="--r-input" v="8px — inputs, small tiles" />
      <SSRow k="space" v="4 / 8 / 12 / 16 / 20 / 24 / 32 — multiples of 4" />

      <SSHeading>Syntax tokens (code)</SSHeading>
      <SSRow k="kw"  v="#8a3722 — keywords (for, def, if)" />
      <SSRow k="str" v="#5b8a3a — strings" />
      <SSRow k="fn"  v="#7a5e1a — function names" />
      <SSRow k="num" v="#9a4f1e — numbers" />
      <SSRow k="com" v="#a89678 italic — comments" />
    </>
  );
}

function SpecComponents() {
  return (
    <>
      <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.4 }}>Components & data</div>
      <div style={{ fontSize: 12, color: SS.muted, marginTop: 4 }}>Build these as the public component surface.</div>

      <SSHeading>Core components</SSHeading>
      <SSRow k="<CodeBlock>"  v={<>Props: <SSCode>code, lang, highlight, showLineNumbers</SSCode>. Uses internal tokenizer; returns one row per line.</>} />
      <SSRow k="<DiffView>"   v={<>Props: <SSCode>userCode, solution, mode='split'|'yours'|'sensei'</SSCode>. Wraps two CodeBlocks with +/− gutters.</>} />
      <SSRow k="<MascotBubble>" v={<>Props: <SSCode>size, message, position</SSCode>. Mascot SVG + speech tail card.</>} />
      <SSRow k="<Pill>"       v={<>Props: <SSCode>tone, size, children</SSCode>. tones: accent | neutral | success | warn | error</>} />
      <SSRow k="<Btn>"        v={<>Props: <SSCode>primary, full, icon, onClick</SSCode>. 14px padding, 999 radius.</>} />
      <SSRow k="<HeartBar>"   v={<>Top-of-exercise hearts + progress bar combo.</>} />
      <SSRow k="<TokenChip>"  v={<>For tap-to-fill. State: idle | placed | correct | wrong.</>} />

      <SSHeading>Data: Mistake (Dojo entry)</SSHeading>
      <div style={{ fontFamily: SS.mono, fontSize: 11, lineHeight: 1.6, background: '#fff',
        border: `1px solid ${SS.hairline}`, borderRadius: 8, padding: 12, marginTop: 4 }}>
{`type Mistake = {
  id: string;
  lang: 'py' | 'js' | 'sql' | 'css';
  title: string;          // human label
  topic: string;          // 'Modulo · Loops'
  userCode: string;       // what the user wrote
  solution: string;       // canonical answer
  explanation: string;    // 1–2 sentence sensei note
  createdAt: ISO8601;
  dueAt: ISO8601;         // SRS schedule
  attempts: number;
  mastered: boolean;
};`}
      </div>

      <SSHeading>Data: Exercise</SSHeading>
      <div style={{ fontFamily: SS.mono, fontSize: 11, lineHeight: 1.6, background: '#fff',
        border: `1px solid ${SS.hairline}`, borderRadius: 8, padding: 12 }}>
{`type Exercise =
  | { kind: 'mcq', prompt, code?, options: {text, correct}[] }
  | { kind: 'tap', prompt, template: string,
      blanks: {answer, distractors[]}[] }
  | { kind: 'type', prompt, starter: string,
      tests: {input, expect}[] };`}
      </div>

      <SSHeading>SRS schedule</SSHeading>
      <SSBox>
        On wrong: dueAt = now. On correct in Dojo: dueAt = now + (2^attempts) days, capped at 30. After 5 successes → mastered=true, hide from default list.
      </SSBox>

      <SSHeading>Code execution</SSHeading>
      <SSRow k="Python"       v="Pyodide in a Web Worker. Cap 2s, sandbox stdout." />
      <SSRow k="JS"           v="Same-origin iframe with strict CSP. Cap 1s." />
      <SSRow k="SQL"          v="sql.js (SQLite WASM). Pre-seeded sample DBs." />
      <SSRow k="HTML/CSS"     v="srcdoc iframe; visual-diff later." />
    </>
  );
}

function SpecAcceptance() {
  return (
    <>
      <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.4 }}>Acceptance criteria</div>
      <div style={{ fontSize: 12, color: SS.muted, marginTop: 4 }}>What "v2 is done" means, screen by screen.</div>

      <SSHeading>Home</SSHeading>
      <SSBox>
        ✓ Single hero "Continue" card is the largest interactive on the screen.<br/>
        ✓ Streak / hearts / XP visible but secondary.<br/>
        ✓ Track switcher collapsed to one row; tapping opens a sheet.<br/>
        ✓ Missing: NO list of all units. Tracks live behind switcher.
      </SSBox>

      <SSHeading>Lesson</SSHeading>
      <SSBox>
        ✓ One idea per micro-step. Step indicator dots on top.<br/>
        ✓ Each step has at most one interactive moment (tap a line, etc).<br/>
        ✓ Forward swipe / "I get it" only — no backward branch logic v1.<br/>
        ✓ Total step count ≤ 8 per lesson.
      </SSBox>

      <SSHeading>Exercise (all kinds)</SSHeading>
      <SSBox>
        ✓ Top: ✕, progress bar, ♥ count. Tapping ✕ confirms exit.<br/>
        ✓ Body: prompt + code + answer surface — never all four panes.<br/>
        ✓ Single primary CTA: "Check". Disabled until answer present.<br/>
        ✓ MCQ: 3–4 options, no D-style trap. Tap = select, Check = commit.<br/>
        ✓ Tap-fill: drag OR tap to place. Distractors are plausible.<br/>
        ✓ Type-it: monospace editor + auto-indent + run output panel.
      </SSBox>

      <SSHeading>Result (interstitial)</SSHeading>
      <SSBox>
        ✓ Correct: full-bleed accent wash, mascot, XP chip, "Next →".<br/>
        ✓ Wrong: ink palette (not red wash), mascot dimmed, 1-line "why",<br/>
        &nbsp;&nbsp;hearts decrement animation, footer note "added to Dojo".<br/>
        ✓ Auto-advance after 1.5s if user idle on Correct only.
      </SSBox>

      <SSHeading>Review (★ hero)</SSHeading>
      <SSBox>
        ✓ Sensei explanation is FIRST, before any code.<br/>
        ✓ Diff toggle is real: Side-by-side / Yours / Sensei — all render.<br/>
        ✓ Show only the changed lines + 1 context line; collapse the rest.<br/>
        ✓ Tests start collapsed; tapping expands inline.<br/>
        ✓ "Try again" returns to the same exercise; "Save" pins to Dojo.
      </SSBox>

      <SSHeading>Dojo (★ hero)</SSHeading>
      <SSBox>
        ✓ Header counts items DUE today, not total.<br/>
        ✓ Big "Drill all due now" hero CTA at top.<br/>
        ✓ Filter chips: All · Due · per-language.<br/>
        ✓ Each card: lang tag, title, topic, time-since, due chip.<br/>
        ✓ Tapping a card opens a focused re-attempt of that exercise.<br/>
        ✓ Mastered items hidden by default; settings toggle to show.
      </SSBox>

      <SSHeading>Cross-cutting</SSHeading>
      <SSBox>
        ✓ All buttons ≥ 44×44 hit targets.<br/>
        ✓ Animation budget: 200ms ease-out for transitions; 600ms for celebrations.<br/>
        ✓ Code in any view uses <SSCode>&lt;CodeBlock&gt;</SSCode>; never raw &lt;pre&gt;.<br/>
        ✓ All screens scroll; sticky bottom CTA is allowed only on Lesson.<br/>
        ✓ Theming: every color reads from CSS vars; new themes = swap the var sheet.
      </SSBox>
    </>
  );
}

function SpecSheet({ kind }) {
  const Body = { flow: SpecFlow, tokens: SpecTokens, components: SpecComponents, acceptance: SpecAcceptance }[kind];
  return (
    <div style={{
      width: '100%', height: '100%', overflow: 'auto',
      background: SS.bg, padding: '24px 28px',
      fontFamily: SS.font, color: SS.ink, boxSizing: 'border-box',
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: SS.accent, textTransform: 'uppercase' }}>
        Code Sensei · v2 spec
      </div>
      <Body />
      <div style={{ marginTop: 28, paddingTop: 12, borderTop: `1px dashed ${SS.hairline}`, fontSize: 11, color: SS.muted }}>
        Owner: design · last updated for handoff · Theme A is the build target.
      </div>
    </div>
  );
}

Object.assign(window, { SpecSheet });
