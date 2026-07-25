// screens.jsx — Code Sensei screens, themed via a `T` (theme) prop.
// Four screens: Home, Lesson, Exercise, Review.
// Theme contract:
//   T = {
//     name, font, mono,
//     bg, surface, surface2, ink, muted, hairline,
//     accent, accentInk, success, error, warn,
//     // syntax tokens
//     synBg, synKw, synStr, synFn, synNum, synCom, synVar, synOp,
//     // chrome flavor
//     mascot,            // (size) => JSX  — the sensei mascot
//     pillRadius,        // 999 for round, 8 for square
//     cardRadius,
//     accentBg,          // soft accent surface for highlights
//     dark,              // bool — for status bar tint, etc
//   }

// ─────────────────────────────────────────────────────────────
// Syntax highlighter — tiny per-language tokenizer
// Handles Python, JavaScript, SQL, HTML/CSS roughly. Not perfect,
// but visually convincing for screenshots.
// ─────────────────────────────────────────────────────────────
function tokenize(code, lang) {
  const out = [];
  let i = 0;
  const push = (cls, text) => out.push({ cls, text });

  const KW = {
    py:   /^(def|return|if|elif|else|for|while|in|not|and|or|import|from|as|class|True|False|None|print|len|range|input)\b/,
    js:   /^(const|let|var|function|return|if|else|for|while|of|in|new|class|true|false|null|undefined|console|import|export|from)\b/,
    sql:  /^(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP|BY|ORDER|HAVING|AS|AND|OR|NOT|IN|LIKE|LIMIT|CREATE|TABLE|VALUES|INTO)\b/i,
    html: /^(div|span|p|h1|h2|h3|a|img|button|input|label|form|ul|li|nav|header|footer|section|main|html|body|head|link|script|style)\b/,
  };

  while (i < code.length) {
    const ch = code[i];
    const rest = code.slice(i);

    // newline
    if (ch === '\n') { push('nl', '\n'); i++; continue; }
    // whitespace
    if (ch === ' ' || ch === '\t') {
      const m = rest.match(/^[ \t]+/);
      push('ws', m[0]); i += m[0].length; continue;
    }
    // comments
    if (lang === 'py' && ch === '#') { const m = rest.match(/^#[^\n]*/); push('com', m[0]); i += m[0].length; continue; }
    if (lang === 'js' && rest.startsWith('//')) { const m = rest.match(/^\/\/[^\n]*/); push('com', m[0]); i += m[0].length; continue; }
    if (lang === 'sql' && rest.startsWith('--')) { const m = rest.match(/^--[^\n]*/); push('com', m[0]); i += m[0].length; continue; }

    // strings
    if (ch === '"' || ch === "'" || ch === '`') {
      const q = ch;
      let j = i + 1;
      while (j < code.length && code[j] !== q) {
        if (code[j] === '\\') j += 2; else j++;
      }
      push('str', code.slice(i, j + 1)); i = j + 1; continue;
    }

    // numbers
    if (/[0-9]/.test(ch)) {
      const m = rest.match(/^[0-9]+(\.[0-9]+)?/);
      push('num', m[0]); i += m[0].length; continue;
    }

    // tags for HTML
    if (lang === 'html' && ch === '<') {
      const m = rest.match(/^<\/?[a-zA-Z][a-zA-Z0-9]*/);
      if (m) { push('kw', m[0]); i += m[0].length; continue; }
    }

    // keywords
    const kwRe = KW[lang];
    if (kwRe) {
      const m = rest.match(kwRe);
      if (m) { push('kw', m[0]); i += m[0].length; continue; }
    }

    // identifier (followed by '(' = function call)
    const idM = rest.match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (idM) {
      const after = rest[idM[0].length];
      const cls = after === '(' ? 'fn' : 'var';
      push(cls, idM[0]); i += idM[0].length; continue;
    }

    // punctuation/operators
    push('op', ch); i++;
  }
  return out;
}

function CodeBlock({ T, code, lang = 'py', showLineNumbers = true, highlight = {}, fontSize = 13, padding = 14 }) {
  const tokens = tokenize(code, lang);
  // split into lines
  const lines = [[]];
  for (const t of tokens) {
    if (t.cls === 'nl') lines.push([]);
    else lines[lines.length - 1].push(t);
  }
  const colorFor = (cls) => ({
    kw: T.synKw, str: T.synStr, fn: T.synFn, num: T.synNum,
    com: T.synCom, var: T.synVar, op: T.synOp, ws: T.synVar,
  }[cls] || T.synVar);

  return (
    <div style={{
      background: T.synBg, borderRadius: T.cardRadius, fontFamily: T.mono,
      fontSize, lineHeight: 1.55, padding, overflow: 'hidden',
      border: `1px solid ${T.hairline}`,
    }}>
      {lines.map((ln, i) => {
        const hl = highlight[i + 1];
        const bg = hl === '+' ? 'rgba(34,197,94,0.16)'
                 : hl === '-' ? 'rgba(239,68,68,0.16)'
                 : hl === '*' ? 'rgba(245,158,11,0.16)' : 'transparent';
        const marker = hl === '+' ? '+' : hl === '-' ? '−' : hl === '*' ? '!' : '';
        const markerColor = hl === '+' ? T.success : hl === '-' ? T.error : hl === '*' ? T.warn : T.muted;
        return (
          <div key={i} style={{
            display: 'flex', background: bg, margin: `0 -${padding}px`, padding: `0 ${padding}px`,
            minHeight: fontSize * 1.55,
          }}>
            {showLineNumbers && (
              <span style={{
                width: 22, color: T.muted, opacity: 0.6, textAlign: 'right',
                marginRight: 10, userSelect: 'none', fontVariantNumeric: 'tabular-nums',
              }}>{i + 1}</span>
            )}
            {marker && (
              <span style={{
                width: 12, color: markerColor, fontWeight: 700, marginRight: 4, userSelect: 'none',
              }}>{marker}</span>
            )}
            <span style={{ whiteSpace: 'pre', flex: 1 }}>
              {ln.length === 0 ? '\u00a0' : ln.map((t, k) => (
                <span key={k} style={{
                  color: colorFor(t.cls),
                  fontStyle: t.cls === 'com' ? 'italic' : 'normal',
                  fontWeight: t.cls === 'kw' ? 600 : 400,
                }}>{t.text}</span>
              ))}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Status bar (slim, themed)
// ─────────────────────────────────────────────────────────────
function StatusBar({ T }) {
  const c = T.dark ? '#fff' : T.ink;
  return (
    <div style={{
      height: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 14px', fontFamily: T.font, fontSize: 13, fontWeight: 600,
      color: c, background: T.bg, flexShrink: 0,
    }}>
      <span>9:41</span>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center', opacity: 0.9 }}>
        <svg width="14" height="10" viewBox="0 0 14 10" fill={c}><path d="M7 9.5L0.5 3a9 9 0 0113 0L7 9.5z"/></svg>
        <svg width="14" height="10" viewBox="0 0 14 10" fill={c}><rect x="0" y="6" width="3" height="4"/><rect x="4" y="4" width="3" height="6"/><rect x="8" y="2" width="3" height="8"/><rect x="12" y="0" width="2" height="10"/></svg>
        <svg width="20" height="10" viewBox="0 0 20 10" fill="none" stroke={c} strokeWidth="1"><rect x="0.5" y="0.5" width="16" height="9" rx="1.5"/><rect x="2" y="2" width="11" height="6" fill={c}/><rect x="17.5" y="3" width="2" height="4" fill={c}/></svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Pill / chip / button helpers
// ─────────────────────────────────────────────────────────────
function Pill({ T, children, tone = 'neutral', size = 'sm' }) {
  const tones = {
    accent:  { bg: T.accentBg,                  fg: T.accent },
    neutral: { bg: T.surface2,                  fg: T.muted  },
    success: { bg: 'rgba(34,197,94,0.14)',      fg: T.success },
    warn:    { bg: 'rgba(245,158,11,0.16)',     fg: T.warn    },
    error:   { bg: 'rgba(239,68,68,0.14)',      fg: T.error   },
  };
  const c = tones[tone];
  const pad = size === 'sm' ? '4px 10px' : '6px 12px';
  return (
    <span style={{
      background: c.bg, color: c.fg, padding: pad, borderRadius: T.pillRadius,
      fontFamily: T.font, fontSize: size === 'sm' ? 11 : 13, fontWeight: 600,
      letterSpacing: 0.2, display: 'inline-flex', alignItems: 'center', gap: 5,
      whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

function Btn({ T, children, primary = false, full = false, onClick, disabled = false, icon }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: full ? '100%' : 'auto',
      background: primary ? T.accent : 'transparent',
      color: primary ? T.accentInk : T.ink,
      border: primary ? 'none' : `1.5px solid ${T.hairline}`,
      padding: '14px 18px', borderRadius: T.pillRadius,
      fontFamily: T.font, fontSize: 15, fontWeight: 700,
      letterSpacing: 0.2, cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      opacity: disabled ? 0.4 : 1,
      boxShadow: primary ? `0 2px 0 ${T.accentShadow || 'rgba(0,0,0,0.12)'}` : 'none',
    }}>{icon}{children}</button>
  );
}

// ─────────────────────────────────────────────────────────────
// Bottom tab bar (4 tabs)
// ─────────────────────────────────────────────────────────────
function BottomTabs({ T, active = 'home' }) {
  const tabs = [
    { id: 'home', label: 'Learn', icon: 'M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V11z' },
    { id: 'practice', label: 'Practice', icon: 'M5 4h10l4 4v12a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1zm0 6h14M9 14h6M9 17h4' },
    { id: 'review', label: 'Review', icon: 'M3 12a9 9 0 1115.5 6.3L21 21l-4.7-2.5A9 9 0 013 12z M9 12h6' },
    { id: 'me', label: 'Sensei', icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0H5z' },
  ];
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-around', alignItems: 'stretch',
      background: T.bg, borderTop: `1px solid ${T.hairline}`,
      padding: '6px 0 8px', flexShrink: 0,
    }}>
      {tabs.map(t => {
        const on = t.id === active;
        return (
          <div key={t.id} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            padding: '6px 0',
          }}>
            <div style={{
              width: 56, height: 28, borderRadius: T.pillRadius,
              background: on ? T.accentBg : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke={on ? T.accent : T.muted} strokeWidth={on ? 2 : 1.6}
                strokeLinecap="round" strokeLinejoin="round">
                <path d={t.icon} />
              </svg>
            </div>
            <span style={{
              fontFamily: T.font, fontSize: 11, fontWeight: on ? 700 : 500,
              color: on ? T.ink : T.muted,
            }}>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 1 — Home / Dashboard
// ─────────────────────────────────────────────────────────────
function HomeScreen({ T }) {
  const tracks = [
    { lang: 'Python',   pct: 64, lessons: '12 / 18', tone: 'accent',  unit: 'Unit 3 · Loops' },
    { lang: 'SQL',      pct: 28, lessons: '5 / 18',  tone: 'neutral', unit: 'Unit 1 · SELECT basics' },
    { lang: 'JavaScript', pct: 0,  lessons: '0 / 22', tone: 'neutral', unit: 'Not started' },
  ];

  return (
    <div style={{ background: T.bg, minHeight: '100%', fontFamily: T.font, color: T.ink }}>
      {/* Greeting + streak */}
      <div style={{ padding: '18px 20px 12px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: T.muted, fontWeight: 500 }}>Ohayō, Sam</div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4, marginTop: 2 }}>
            Ready to train?
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: T.surface, borderRadius: T.pillRadius, padding: '8px 12px',
          border: `1px solid ${T.hairline}`,
        }}>
          <span style={{ fontSize: 16 }}>🔥</span>
          <span style={{ fontWeight: 700, fontSize: 15 }}>7</span>
        </div>
      </div>

      {/* Sensei greeting card */}
      <div style={{ margin: '4px 16px 18px', padding: '16px 16px',
        background: T.surface, borderRadius: T.cardRadius,
        border: `1px solid ${T.hairline}`,
        display: 'flex', gap: 14, alignItems: 'center',
      }}>
        <div style={{ flexShrink: 0 }}>{T.mascot(56)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
            Today's lesson
          </div>
          <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.4 }}>
            "A bug is just a teacher in disguise."
          </div>
        </div>
      </div>

      {/* Belt progress strip */}
      <div style={{ padding: '0 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.muted, textTransform: 'uppercase' }}>
          Belt · Yellow
        </span>
        <span style={{ fontSize: 11, color: T.muted }}>312 / 500 XP</span>
      </div>
      <div style={{ margin: '0 20px 22px' }}>
        <div style={{ height: 6, borderRadius: 3, background: T.surface2, overflow: 'hidden' }}>
          <div style={{ width: '62%', height: '100%', background: T.accent, borderRadius: 3 }} />
        </div>
      </div>

      {/* Tracks */}
      <div style={{ padding: '0 20px 6px', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.muted, textTransform: 'uppercase' }}>
        Your tracks
      </div>
      <div style={{ padding: '12px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tracks.map(tr => (
          <div key={tr.lang} style={{
            background: T.surface, borderRadius: T.cardRadius,
            border: `1px solid ${T.hairline}`,
            padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{tr.lang}</div>
              <Pill T={T} tone={tr.tone}>{tr.pct}%</Pill>
            </div>
            <div style={{ fontSize: 12, color: T.muted, marginBottom: 10 }}>{tr.unit}</div>
            <div style={{ height: 4, borderRadius: 2, background: T.surface2, overflow: 'hidden' }}>
              <div style={{
                width: `${tr.pct}%`, height: '100%',
                background: tr.pct > 0 ? T.accent : 'transparent', borderRadius: 2,
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: T.muted, fontVariantNumeric: 'tabular-nums' }}>
              <span>{tr.lessons} lessons</span>
              <span>→</span>
            </div>
          </div>
        ))}
      </div>

      {/* Daily challenge */}
      <div style={{ padding: '20px 16px 16px' }}>
        <div style={{
          background: T.accentBg, borderRadius: T.cardRadius,
          padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, background: T.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: T.accentInk, fontWeight: 800, fontSize: 18,
          }}>✦</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.accent }}>Daily challenge</div>
            <div style={{ fontSize: 12, color: T.ink, opacity: 0.75 }}>FizzBuzz · Python · 3 min</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.accent }}>+50 XP</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 2 — Lesson Player
// Instruction card with sensei + code example. "Try it" CTA.
// ─────────────────────────────────────────────────────────────
function LessonScreen({ T }) {
  const example = `# A for-loop walks every item.
for student in dojo:
    print(student)`;
  return (
    <div style={{ background: T.bg, minHeight: '100%', fontFamily: T.font, color: T.ink }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
        borderBottom: `1px solid ${T.hairline}`,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: T.surface2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: T.ink, fontSize: 18, fontWeight: 600,
        }}>‹</div>
        <div style={{ flex: 1 }}>
          <div style={{ height: 6, borderRadius: 3, background: T.surface2, overflow: 'hidden' }}>
            <div style={{ width: '40%', height: '100%', background: T.accent }} />
          </div>
        </div>
        <span style={{ fontSize: 12, color: T.muted, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>2 / 5</span>
        <span style={{ fontSize: 12, color: T.error, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>♥ 4</span>
      </div>

      {/* Title + meta */}
      <div style={{ padding: '20px 20px 14px' }}>
        <Pill T={T} tone="accent">Python · Unit 3 · Lesson 2</Pill>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, marginTop: 12, lineHeight: 1.2 }}>
          The for-loop
        </div>
        <div style={{ fontSize: 14, color: T.muted, marginTop: 6, lineHeight: 1.5 }}>
          Repeat a block of code once for each item in a collection.
        </div>
      </div>

      {/* Sensei explanation */}
      <div style={{
        margin: '0 16px 16px', padding: '14px',
        background: T.surface, borderRadius: T.cardRadius,
        border: `1px solid ${T.hairline}`,
        display: 'flex', gap: 12,
      }}>
        <div style={{ flexShrink: 0 }}>{T.mascot(44)}</div>
        <div style={{ flex: 1, fontSize: 13, lineHeight: 1.55, color: T.ink }}>
          Think of a <b>for-loop</b> like sweeping the dojo floor — you visit every tile,
          one at a time, and do the same thing on each.
        </div>
      </div>

      {/* Code example */}
      <div style={{ padding: '0 16px 6px', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.muted, textTransform: 'uppercase' }}>
        Example
      </div>
      <div style={{ padding: '8px 16px 0' }}>
        <CodeBlock T={T} code={example} lang="py" />
      </div>

      {/* Inline "what it prints" */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{
          background: T.surface, borderRadius: T.cardRadius,
          border: `1px dashed ${T.hairline}`, padding: '12px 14px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.muted, textTransform: 'uppercase', marginBottom: 6 }}>
            Output
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 13, lineHeight: 1.55, color: T.ink }}>
            Akari<br/>Ren<br/>Yumi
          </div>
        </div>
      </div>

      {/* Key points */}
      <div style={{ padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          ['for', 'starts the loop'],
          ['student', 'a name for the current item'],
          ['in dojo', 'the collection to walk'],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
            <span style={{
              fontFamily: T.mono, fontSize: 12, padding: '2px 8px',
              background: T.surface2, borderRadius: 6, color: T.synKw, fontWeight: 600,
            }}>{k}</span>
            <span style={{ color: T.muted }}>{v}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: '24px 16px 18px' }}>
        <Btn T={T} primary full>Try it →</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 3 — Exercise (fill-in-the-blank + code editor + run)
// ─────────────────────────────────────────────────────────────
function ExerciseScreen({ T }) {
  const before = `nums = [1, 2, 3, 4, 5]
total = 0
for n in `;
  const after = `:
    total += n
print(total)`;

  return (
    <div style={{ background: T.bg, minHeight: '100%', fontFamily: T.font, color: T.ink, display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
        borderBottom: `1px solid ${T.hairline}`,
      }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: T.surface2,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✕</div>
        <div style={{ flex: 1 }}>
          <div style={{ height: 6, borderRadius: 3, background: T.surface2, overflow: 'hidden' }}>
            <div style={{ width: '70%', height: '100%', background: T.accent }} />
          </div>
        </div>
        <span style={{ fontSize: 12, color: T.error, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>♥ 3</span>
      </div>

      {/* Prompt */}
      <div style={{ padding: '20px 20px 12px' }}>
        <Pill T={T} tone="warn">Challenge · 30 XP</Pill>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.3, marginTop: 12, lineHeight: 1.3 }}>
          Sum all the numbers in <code style={{
            fontFamily: T.mono, fontSize: 18, background: T.surface2, padding: '2px 8px',
            borderRadius: 6, color: T.synVar,
          }}>nums</code>
        </div>
      </div>

      {/* Multiple-choice options for the blank */}
      <div style={{ padding: '0 16px 8px', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.muted, textTransform: 'uppercase' }}>
        Tap to fill the blank
      </div>
      <div style={{ padding: '6px 16px 0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {[
          { t: 'nums',     on: true  },
          { t: 'range(5)', on: false },
          { t: 'total',    on: false },
          { t: 'n',        on: false },
        ].map(o => (
          <div key={o.t} style={{
            padding: '10px 14px', borderRadius: T.pillRadius,
            background: o.on ? T.accent : T.surface,
            color: o.on ? T.accentInk : T.ink,
            border: `1.5px solid ${o.on ? T.accent : T.hairline}`,
            fontFamily: T.mono, fontSize: 13, fontWeight: 700,
            boxShadow: o.on ? 'none' : `0 2px 0 ${T.hairline}`,
          }}>{o.t}</div>
        ))}
      </div>

      {/* Code editor */}
      <div style={{ padding: '18px 16px 0', flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.muted, textTransform: 'uppercase', marginBottom: 6 }}>
          Your code
        </div>
        <div style={{
          background: T.synBg, borderRadius: T.cardRadius, fontFamily: T.mono,
          fontSize: 13, lineHeight: 1.6, padding: '14px 12px',
          border: `1.5px solid ${T.accent}`,
          boxShadow: `0 0 0 4px ${T.accentBg}`,
        }}>
          {/* Render with the selected token inserted in the gap */}
          <RichCode T={T} parts={[
            { code: before, lang: 'py' },
            { blank: 'nums' },
            { code: after, lang: 'py' },
          ]} startLine={1} />
        </div>
      </div>

      {/* Output preview */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{
          background: T.surface, borderRadius: T.cardRadius,
          border: `1px solid ${T.hairline}`, padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: 11, background: T.success,
            color: '#fff', fontSize: 13, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>▸</div>
          <span style={{ fontFamily: T.mono, fontSize: 13, color: T.ink }}>15</span>
          <span style={{ flex: 1 }} />
          <Pill T={T} tone="success">Ran in 12ms</Pill>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '20px 16px 16px' }}>
        <Btn T={T} primary full>Check answer</Btn>
      </div>
    </div>
  );
}

// Render an exercise code block with text segments + a filled-in blank.
function RichCode({ T, parts, startLine = 1 }) {
  // Combine into one flat list of tokens, marking blank spans for highlight
  const segs = [];
  for (const p of parts) {
    if (p.code) segs.push(...tokenize(p.code, p.lang).map(t => ({ ...t, blank: false })));
    else if (p.blank !== undefined) segs.push({ cls: 'blank', text: p.blank, blank: true });
  }
  const lines = [[]];
  for (const t of segs) {
    if (t.cls === 'nl') lines.push([]);
    else lines[lines.length - 1].push(t);
  }
  const colorFor = (cls) => ({
    kw: T.synKw, str: T.synStr, fn: T.synFn, num: T.synNum,
    com: T.synCom, var: T.synVar, op: T.synOp, ws: T.synVar,
  }[cls] || T.synVar);

  return (
    <div>
      {lines.map((ln, i) => (
        <div key={i} style={{ display: 'flex' }}>
          <span style={{ width: 18, color: T.muted, opacity: 0.55, textAlign: 'right',
            marginRight: 10, userSelect: 'none' }}>{i + startLine}</span>
          <span style={{ whiteSpace: 'pre', flex: 1 }}>
            {ln.length === 0 ? '\u00a0' : ln.map((t, k) => t.blank ? (
              <span key={k} style={{
                background: T.accentBg, color: T.accent,
                padding: '1px 6px', borderRadius: 4, fontWeight: 700,
                border: `1.5px solid ${T.accent}`, margin: '0 1px',
              }}>{t.text}</span>
            ) : (
              <span key={k} style={{
                color: colorFor(t.cls),
                fontStyle: t.cls === 'com' ? 'italic' : 'normal',
                fontWeight: t.cls === 'kw' ? 600 : 400,
              }}>{t.text}</span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 4 — Code Review (THE HERO)
// Side-by-side: Your code vs. Sensei's solution. Diff'd, with
// inline sensei explanations of what went wrong + why.
// ─────────────────────────────────────────────────────────────
function ReviewScreen({ T }) {
  const userCode = `def sum_evens(nums):
    total = 0
    for n in nums:
        if n % 2 == 1:
            total += n
    return total`;

  const senseiCode = `def sum_evens(nums):
    total = 0
    for n in nums:
        if n % 2 == 0:
            total += n
    return total`;

  return (
    <div style={{ background: T.bg, minHeight: '100%', fontFamily: T.font, color: T.ink }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
        borderBottom: `1px solid ${T.hairline}`, background: T.bg,
      }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: T.surface2,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600 }}>‹</div>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 700, letterSpacing: -0.2 }}>Code review</div>
        <Pill T={T} tone="warn">Almost</Pill>
      </div>

      {/* Verdict header */}
      <div style={{
        padding: '18px 20px 14px',
        display: 'flex', alignItems: 'center', gap: 14,
        background: T.surface, borderBottom: `1px solid ${T.hairline}`,
      }}>
        <div style={{ flexShrink: 0 }}>{T.mascot(56)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>
            One small thing.
          </div>
          <div style={{ fontSize: 13, color: T.muted, marginTop: 4, lineHeight: 1.45 }}>
            Your structure is solid. You picked the wrong remainder to compare.
          </div>
        </div>
      </div>

      {/* Tab strip: Yours / Sensei's */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{
          display: 'inline-flex', background: T.surface2, padding: 3, borderRadius: T.pillRadius,
          fontSize: 13, fontWeight: 700,
        }}>
          <div style={{
            padding: '6px 14px', borderRadius: T.pillRadius - 2,
            background: T.surface, color: T.ink,
            boxShadow: `0 1px 2px ${T.hairline}`,
          }}>Diff</div>
          <div style={{ padding: '6px 14px', color: T.muted }}>Yours</div>
          <div style={{ padding: '6px 14px', color: T.muted }}>Sensei's</div>
        </div>
      </div>

      {/* Diff block — yours */}
      <div style={{ padding: '12px 16px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.muted, textTransform: 'uppercase' }}>
          Your attempt
        </span>
        <span style={{ fontSize: 11, color: T.error, fontWeight: 700 }}>− 1 line</span>
      </div>
      <div style={{ padding: '0 16px' }}>
        <CodeBlock T={T} code={userCode} lang="py" highlight={{ 4: '-' }} />
      </div>

      {/* Sensei's explanation card — sits between */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{
          background: T.accentBg, borderRadius: T.cardRadius,
          padding: '12px 14px', borderLeft: `3px solid ${T.accent}`,
          fontSize: 13, lineHeight: 1.55,
        }}>
          <div style={{ fontWeight: 700, color: T.accent, marginBottom: 4, fontSize: 12, letterSpacing: 0.5 }}>
            SENSEI SAYS
          </div>
          <span style={{ color: T.ink }}>
            <code style={{
              fontFamily: T.mono, background: T.surface, padding: '1px 6px',
              borderRadius: 4, fontSize: 12, fontWeight: 600,
            }}>n % 2 == 1</code> picks <b>odd</b> numbers. To find evens,
            the remainder must be <code style={{
              fontFamily: T.mono, background: T.surface, padding: '1px 6px',
              borderRadius: 4, fontSize: 12, fontWeight: 600, color: T.success,
            }}>0</code>.
          </span>
        </div>
      </div>

      {/* Sensei's solution */}
      <div style={{ padding: '14px 16px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.muted, textTransform: 'uppercase' }}>
          Sensei's way
        </span>
        <span style={{ fontSize: 11, color: T.success, fontWeight: 700 }}>+ 1 line</span>
      </div>
      <div style={{ padding: '0 16px' }}>
        <CodeBlock T={T} code={senseiCode} lang="py" highlight={{ 4: '+' }} />
      </div>

      {/* Test runner output */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{
          background: T.surface, borderRadius: T.cardRadius,
          border: `1px solid ${T.hairline}`, padding: '12px 14px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.muted, textTransform: 'uppercase', marginBottom: 8 }}>
            Tests · 2 / 3 passed
          </div>
          {[
            { name: 'sum_evens([1,2,3,4])', exp: '6', got: '4', ok: false },
            { name: 'sum_evens([2,4,6])',   exp: '12', got: '0', ok: false },
            { name: 'sum_evens([])',         exp: '0', got: '0', ok: true  },
          ].map(t => (
            <div key={t.name} style={{
              display: 'flex', alignItems: 'center', gap: 10, fontFamily: T.mono,
              fontSize: 12, padding: '5px 0', borderTop: `1px solid ${T.hairline}`,
            }}>
              <span style={{
                width: 14, height: 14, borderRadius: 7,
                background: t.ok ? T.success : T.error, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 800, flexShrink: 0,
              }}>{t.ok ? '✓' : '✕'}</span>
              <span style={{ flex: 1, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
              <span style={{ color: T.muted }}>→</span>
              <span style={{ color: t.ok ? T.success : T.error, fontWeight: 700 }}>{t.got}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div style={{ padding: '20px 16px 18px', display: 'flex', gap: 10 }}>
        <Btn T={T}>Retry</Btn>
        <div style={{ flex: 1 }}><Btn T={T} primary full>Got it →</Btn></div>
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, LessonScreen, ExerciseScreen, ReviewScreen, StatusBar, BottomTabs, CodeBlock, Pill, Btn });
