// screens-v2.jsx — Code Sensei v2 screens
// Improvements over v1:
//   • Home: one big "Continue" action, less dashboard
//   • Lesson: micro-step cards (one idea per tap)
//   • Exercise: split into 3 distinct types (tap-fill, type-it, multi-choice)
//   • Result: celebration / failure interstitial
//   • Review v2: explanation FIRST, real tab toggle, tests collapsible
//   • Dojo: NEW — mistake bank for spaced-repetition drilling

// All v2 screens use the same theme contract as v1 (T = theme).
// Reuses CodeBlock, Pill, Btn, StatusBar, BottomTabs, RichCode from screens.jsx.

// ─────────────────────────────────────────────────────────────
// HOME v2 — focus on next action
// ─────────────────────────────────────────────────────────────
function HomeV2({ T }) {
  return (
    <div style={{ background: T.bg, minHeight: '100%', fontFamily: T.font, color: T.ink }}>
      {/* Streak strip — small, top-right */}
      <div style={{ padding: '14px 18px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>Ohayō, Sam</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Pill T={T} tone="warn">🔥 7</Pill>
          <Pill T={T} tone="error">♥ 5</Pill>
          <Pill T={T} tone="accent">✦ 312</Pill>
        </div>
      </div>

      {/* THE hero — big continue card */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{
          background: T.accent, borderRadius: T.cardRadius * 1.4,
          padding: '20px 18px', color: T.accentInk, position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 6px 0 ${T.accentShadow || 'rgba(0,0,0,0.18)'}`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, opacity: 0.8, textTransform: 'uppercase' }}>
            Continue training
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6, letterSpacing: -0.4, lineHeight: 1.15 }}>
            Python · Loops
          </div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>
            Lesson 2 of 5 · The for-loop
          </div>
          <div style={{ marginTop: 14, height: 6, background: 'rgba(255,255,255,0.25)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: '40%', height: '100%', background: T.accentInk }} />
          </div>
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1 }} />
            <div style={{
              background: T.accentInk, color: T.accent, padding: '10px 18px',
              borderRadius: T.pillRadius, fontWeight: 800, fontSize: 14,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>Continue →</div>
          </div>
          {/* Mascot — bottom-right peeking */}
          <div style={{ position: 'absolute', right: -6, bottom: -8, opacity: 0.85 }}>
            {T.mascot(80)}
          </div>
        </div>
      </div>

      {/* Belt strip — small, secondary */}
      <div style={{ padding: '20px 18px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: '#e8c75a',
            border: `2px solid ${T.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: T.ink,
          }}>★</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Yellow belt</div>
            <div style={{ fontSize: 11, color: T.muted }}>188 XP to Green</div>
          </div>
        </div>
        <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>See path →</span>
      </div>

      {/* Daily missions — only 2, simple */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.muted, textTransform: 'uppercase', marginBottom: 10 }}>
          Today's missions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { name: 'Finish 1 lesson',  prog: '0 / 1', xp: 30, done: false },
            { name: 'Drill 3 mistakes', prog: '1 / 3', xp: 20, done: false },
          ].map(m => (
            <div key={m.name} style={{
              background: T.surface, borderRadius: T.cardRadius,
              border: `1px solid ${T.hairline}`, padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: T.accentBg, color: T.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800,
              }}>✦</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{m.prog} · +{m.xp} XP</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All tracks — collapsed to a single row */}
      <div style={{ padding: '20px 16px 16px' }}>
        <div style={{
          background: T.surface, borderRadius: T.cardRadius,
          border: `1px solid ${T.hairline}`, padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Py', 'JS', 'SQL', 'CSS'].map((s, i) => (
              <div key={s} style={{
                width: 26, height: 26, borderRadius: 6,
                background: i === 0 ? T.accent : T.surface2,
                color: i === 0 ? T.accentInk : T.muted,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800, fontFamily: T.mono,
              }}>{s}</div>
            ))}
          </div>
          <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>Switch track</div>
          <span style={{ fontSize: 13, color: T.muted }}>›</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LESSON v2 — micro-step card (one idea per swipe)
// ─────────────────────────────────────────────────────────────
function LessonV2({ T }) {
  const code = `for student in dojo:
    print(student)`;
  return (
    <div style={{ background: T.bg, minHeight: '100%', fontFamily: T.font, color: T.ink, display: 'flex', flexDirection: 'column' }}>
      {/* Top progress — dots show micro-steps */}
      <div style={{ padding: '12px 16px 10px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${T.hairline}` }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✕</div>
        <div style={{ flex: 1, display: 'flex', gap: 4 }}>
          {[1, 1, 1, 0, 0, 0].map((on, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: on ? T.accent : T.surface2 }} />
          ))}
        </div>
        <span style={{ fontSize: 12, color: T.muted, fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>3/6</span>
      </div>

      {/* Single big idea card */}
      <div style={{ padding: '24px 20px 16px', flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.muted, textTransform: 'uppercase' }}>Step 3</div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6, marginTop: 8, lineHeight: 1.15 }}>
          Loops repeat your code,<br/>once per item.
        </div>

        {/* mascot saying it */}
        <div style={{ marginTop: 22, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0 }}>{T.mascot(48)}</div>
          <div style={{
            background: T.surface, borderRadius: T.cardRadius,
            border: `1px solid ${T.hairline}`, padding: '12px 14px',
            fontSize: 13, lineHeight: 1.55, position: 'relative',
          }}>
            Tap the line to see what runs each time.
            {/* speech tail */}
            <div style={{ position: 'absolute', left: -6, top: 14, width: 0, height: 0,
              borderTop: '6px solid transparent', borderBottom: '6px solid transparent',
              borderRight: `6px solid ${T.surface}` }} />
          </div>
        </div>

        {/* Interactive code — line 2 highlighted as "tap me" */}
        <div style={{ marginTop: 22 }}>
          <CodeBlock T={T} code={code} lang="py" highlight={{ 2: '*' }} />
        </div>

        {/* Inline annotation on tap */}
        <div style={{ marginTop: 12, padding: '10px 14px',
          background: T.accentBg, borderRadius: T.cardRadius, fontSize: 13, lineHeight: 1.5 }}>
          <b style={{ color: T.accent }}>Each time:</b> Python prints one student's name.
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{ padding: '16px', borderTop: `1px solid ${T.hairline}` }}>
        <Btn T={T} primary full>I get it →</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// EXERCISE v2a — Tap-to-fill (single, focused)
// ─────────────────────────────────────────────────────────────
function ExerciseTapV2({ T }) {
  return (
    <div style={{ background: T.bg, minHeight: '100%', fontFamily: T.font, color: T.ink, display: 'flex', flexDirection: 'column' }}>
      <ExHeader T={T} progress={0.6} />
      <div style={{ padding: '20px 20px 12px' }}>
        <Pill T={T} tone="accent">Tap to fill · 30 XP</Pill>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4, marginTop: 12, lineHeight: 1.25 }}>
          Make this loop print every name.
        </div>
      </div>

      <div style={{ padding: '6px 16px 0', flex: 1 }}>
        <div style={{
          background: T.synBg, borderRadius: T.cardRadius, fontFamily: T.mono,
          fontSize: 14, lineHeight: 1.65, padding: '14px 14px',
          border: `1px solid ${T.hairline}`,
        }}>
          <div style={{ display: 'flex' }}>
            <span style={{ width: 16, color: T.muted, opacity: 0.5, marginRight: 10 }}>1</span>
            <span style={{ whiteSpace: 'pre' }}>
              <span style={{ color: T.synKw, fontWeight: 600 }}>for</span>
              <span style={{ color: T.synVar }}> name </span>
              <span style={{ color: T.synKw, fontWeight: 600 }}>in</span>{' '}
              <BlankSlot T={T}>names</BlankSlot>
              <span style={{ color: T.synOp }}>:</span>
            </span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ width: 16, color: T.muted, opacity: 0.5, marginRight: 10 }}>2</span>
            <span style={{ whiteSpace: 'pre' }}>
              {'    '}
              <BlankSlot T={T} empty />
              <span style={{ color: T.synOp }}>(</span>
              <span style={{ color: T.synVar }}>name</span>
              <span style={{ color: T.synOp }}>)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Token tray */}
      <div style={{ padding: '20px 16px 6px', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.muted, textTransform: 'uppercase' }}>
        Tokens
      </div>
      <div style={{ padding: '6px 16px 0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {['names', 'print', 'range(3)', 'len(names)', 'input'].map((t, i) => (
          <div key={t} style={{
            padding: '10px 14px', borderRadius: T.pillRadius,
            background: i < 2 ? T.surface2 : T.surface,
            opacity: i < 2 ? 0.5 : 1,
            border: `1.5px solid ${T.hairline}`,
            fontFamily: T.mono, fontSize: 13, fontWeight: 700,
            color: T.ink, boxShadow: i < 2 ? 'none' : `0 2px 0 ${T.hairline}`,
            textDecoration: i < 2 ? 'line-through' : 'none',
          }}>{t}</div>
        ))}
      </div>

      <div style={{ padding: '20px 16px 16px' }}>
        <Btn T={T} primary full>Check</Btn>
      </div>
    </div>
  );
}

function BlankSlot({ T, children, empty = false }) {
  if (empty) {
    return <span style={{
      display: 'inline-block', minWidth: 56, height: 22,
      background: T.surface2, borderRadius: 4, verticalAlign: 'middle',
      border: `1.5px dashed ${T.muted}`,
    }} />;
  }
  return <span style={{
    background: T.accentBg, color: T.accent,
    padding: '1px 6px', borderRadius: 4, fontWeight: 700,
    border: `1.5px solid ${T.accent}`,
  }}>{children}</span>;
}

// ─────────────────────────────────────────────────────────────
// EXERCISE v2b — Type-it (real keyboard editor)
// ─────────────────────────────────────────────────────────────
function ExerciseTypeV2({ T }) {
  const code = `def greet(name):
    return "Hi, " + name`;
  return (
    <div style={{ background: T.bg, minHeight: '100%', fontFamily: T.font, color: T.ink, display: 'flex', flexDirection: 'column' }}>
      <ExHeader T={T} progress={0.4} />
      <div style={{ padding: '20px 20px 12px' }}>
        <Pill T={T} tone="warn">Type it · 50 XP</Pill>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.3, marginTop: 12, lineHeight: 1.3 }}>
          Write a function <code style={{ fontFamily: T.mono, background: T.surface2, padding: '2px 8px', borderRadius: 6, fontSize: 17, color: T.synFn }}>greet(name)</code> that returns "Hi, " + the name.
        </div>
      </div>

      {/* Editor */}
      <div style={{ padding: '0 16px', flex: 1 }}>
        <div style={{
          background: T.synBg, borderRadius: T.cardRadius, fontFamily: T.mono,
          fontSize: 13, lineHeight: 1.6, padding: '14px',
          border: `1px solid ${T.hairline}`, position: 'relative',
        }}>
          <CodeBlock T={T} code={code} lang="py" padding={0} />
          {/* fake caret */}
          <div style={{ position: 'absolute', right: 14, bottom: 14, fontSize: 11, color: T.muted }}>● Python 3</div>
        </div>
      </div>

      {/* Hint expandable */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{
          background: T.surface, borderRadius: T.cardRadius,
          border: `1px solid ${T.hairline}`, padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ flexShrink: 0 }}>{T.mascot(28)}</div>
          <span style={{ fontSize: 13, color: T.muted, flex: 1 }}>
            Stuck? <span style={{ color: T.accent, fontWeight: 700 }}>Show hint</span>
          </span>
          <span style={{ color: T.muted }}>›</span>
        </div>
      </div>

      {/* Mock code keyboard row */}
      <div style={{ padding: '14px 12px 6px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {['Tab', 'def', '"', '(', ')', ':', '+', '=', '_', '#'].map(k => (
          <div key={k} style={{
            padding: '8px 12px', background: T.surface, border: `1px solid ${T.hairline}`,
            borderRadius: 8, fontFamily: T.mono, fontSize: 13, fontWeight: 600, flexShrink: 0,
            boxShadow: `0 1px 0 ${T.hairline}`,
          }}>{k}</div>
        ))}
      </div>

      <div style={{ padding: '12px 16px 16px', display: 'flex', gap: 10 }}>
        <Btn T={T}>Run</Btn>
        <div style={{ flex: 1 }}><Btn T={T} primary full>Submit</Btn></div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// EXERCISE v2c — Multiple choice
// ─────────────────────────────────────────────────────────────
function ExerciseMCQV2({ T }) {
  const code = `nums = [1, 2, 3]
for n in nums:
    print(n * 2)`;
  return (
    <div style={{ background: T.bg, minHeight: '100%', fontFamily: T.font, color: T.ink, display: 'flex', flexDirection: 'column' }}>
      <ExHeader T={T} progress={0.2} />
      <div style={{ padding: '20px 20px 12px' }}>
        <Pill T={T} tone="success">Quick check · 10 XP</Pill>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.3, marginTop: 12, lineHeight: 1.3 }}>
          What does this print?
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <CodeBlock T={T} code={code} lang="py" />
      </div>

      <div style={{ padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {[
          { t: '1, 2, 3',  on: false, ok: false },
          { t: '2, 4, 6',  on: true,  ok: true  },
          { t: '2 4 6',    on: false, ok: false },
          { t: 'Error',    on: false, ok: false },
        ].map((o, i) => (
          <div key={o.t} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 16px',
            background: o.on ? T.accentBg : T.surface,
            border: `1.5px solid ${o.on ? T.accent : T.hairline}`,
            borderRadius: T.cardRadius,
            boxShadow: o.on ? 'none' : `0 2px 0 ${T.hairline}`,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6, background: T.surface2,
              border: `1.5px solid ${o.on ? T.accent : T.hairline}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: T.mono, fontSize: 12, fontWeight: 800,
              color: o.on ? T.accent : T.muted,
            }}>{['A','B','C','D'][i]}</div>
            <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 600 }}>{o.t}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '16px' }}>
        <Btn T={T} primary full>Check</Btn>
      </div>
    </div>
  );
}

function ExHeader({ T, progress = 0.5, hearts = 3 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: `1px solid ${T.hairline}` }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✕</div>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: T.surface2, overflow: 'hidden' }}>
        <div style={{ width: `${progress * 100}%`, height: '100%', background: T.accent }} />
      </div>
      <span style={{ fontSize: 12, color: T.error, fontWeight: 700 }}>♥ {hearts}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RESULT — celebration / failure interstitial
// ─────────────────────────────────────────────────────────────
function ResultCorrectV2({ T }) {
  return (
    <div style={{
      background: T.accentBg, minHeight: '100%', fontFamily: T.font, color: T.ink,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ marginBottom: 18 }}>{T.mascot(120)}</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: T.accent, letterSpacing: -0.8 }}>
          見事！
        </div>
        <div style={{ fontSize: 14, color: T.muted, marginTop: 4, fontWeight: 600 }}>
          (Migoto — well done.)
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 22, letterSpacing: -0.4 }}>
          You got it on the first try.
        </div>
        <div style={{
          marginTop: 22, display: 'flex', gap: 10,
        }}>
          <Pill T={T} tone="accent" size="lg">+30 XP</Pill>
          <Pill T={T} tone="warn" size="lg">🔥 7 day streak</Pill>
        </div>
      </div>
      <div style={{ padding: '0 16px 20px' }}>
        <Btn T={T} primary full>Next →</Btn>
      </div>
    </div>
  );
}

function ResultWrongV2({ T }) {
  return (
    <div style={{
      background: T.bg, minHeight: '100%', fontFamily: T.font, color: T.ink,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ marginBottom: 18, opacity: 0.85 }}>{T.mascot(110)}</div>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.6 }}>
          Not quite.
        </div>
        <div style={{ fontSize: 15, color: T.muted, marginTop: 8, lineHeight: 1.5, maxWidth: 280 }}>
          The remainder for even numbers is <code style={{ fontFamily: T.mono, color: T.accent, fontWeight: 700 }}>0</code>, not <code style={{ fontFamily: T.mono, color: T.error, fontWeight: 700 }}>1</code>.
        </div>
        <div style={{
          marginTop: 22, padding: '10px 16px', background: 'rgba(239,68,68,0.10)',
          borderRadius: T.pillRadius, color: T.error, fontWeight: 700, fontSize: 13,
        }}>
          − 1 ♥ · 4 left
        </div>
        <div style={{
          marginTop: 24, padding: '12px 14px', background: T.surface,
          borderRadius: T.cardRadius, border: `1px solid ${T.hairline}`,
          fontSize: 13, color: T.muted, maxWidth: 300,
        }}>
          We'll add this to your <b style={{ color: T.ink }}>Dojo</b> for a re-match later.
        </div>
      </div>
      <div style={{ padding: '0 16px 20px', display: 'flex', gap: 10 }}>
        <Btn T={T}>Skip</Btn>
        <div style={{ flex: 1 }}><Btn T={T} primary full>See review →</Btn></div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// REVIEW v2 — explanation FIRST, real tab toggle, tests collapsed
// ─────────────────────────────────────────────────────────────
function ReviewV2({ T }) {
  const userCode = `if n % 2 == 1:
    total += n`;
  const senseiCode = `if n % 2 == 0:
    total += n`;

  return (
    <div style={{ background: T.bg, minHeight: '100%', fontFamily: T.font, color: T.ink }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: `1px solid ${T.hairline}` }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>‹</div>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>Review</div>
      </div>

      {/* Explanation FIRST — hero of the screen */}
      <div style={{ padding: '22px 20px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ flexShrink: 0 }}>{T.mascot(64)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.accent, textTransform: 'uppercase', marginBottom: 6 }}>
            Sensei's lesson
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.35, letterSpacing: -0.3 }}>
            You filtered for odd numbers, not even.
          </div>
          <div style={{ fontSize: 14, color: T.muted, marginTop: 8, lineHeight: 1.55 }}>
            <code style={{ fontFamily: T.mono, background: T.surface2, padding: '1px 5px', borderRadius: 4, fontSize: 12, fontWeight: 600, color: T.ink }}>n % 2</code> gives the remainder. <b style={{ color: T.ink }}>Even</b> numbers leave 0.
          </div>
        </div>
      </div>

      {/* Diff toggle — real, not fake */}
      <div style={{ padding: '0 16px 8px' }}>
        <div style={{
          display: 'flex', background: T.surface2, padding: 3, borderRadius: T.pillRadius,
          fontSize: 13, fontWeight: 700,
        }}>
          {['Side-by-side', 'Yours', 'Sensei'].map((l, i) => (
            <div key={l} style={{
              flex: 1, textAlign: 'center', padding: '7px 0',
              borderRadius: T.pillRadius - 2,
              background: i === 0 ? T.surface : 'transparent',
              color: i === 0 ? T.ink : T.muted,
              boxShadow: i === 0 ? `0 1px 2px ${T.hairline}` : 'none',
            }}>{l}</div>
          ))}
        </div>
      </div>

      {/* Diff: yours (red) above sensei (green) — short, just the line that changed */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.error, textTransform: 'uppercase', marginBottom: 6 }}>
          Yours
        </div>
        <CodeBlock T={T} code={userCode} lang="py" highlight={{ 1: '-' }} showLineNumbers={false} />
      </div>
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.success, textTransform: 'uppercase', marginBottom: 6 }}>
          Sensei
        </div>
        <CodeBlock T={T} code={senseiCode} lang="py" highlight={{ 1: '+' }} showLineNumbers={false} />
      </div>

      {/* Tests — collapsed by default */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{
          background: T.surface, borderRadius: T.cardRadius,
          border: `1px solid ${T.hairline}`, padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 22, height: 22, borderRadius: 11, background: T.error, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>!</div>
          <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>1 of 3 tests passing</span>
          <span style={{ fontSize: 12, color: T.accent, fontWeight: 700 }}>Show ›</span>
        </div>
      </div>

      {/* CTAs */}
      <div style={{ padding: '20px 16px 18px', display: 'flex', gap: 10 }}>
        <Btn T={T}>Save</Btn>
        <div style={{ flex: 1 }}><Btn T={T} primary full>Try again →</Btn></div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DOJO — the differentiator. Mistake bank for re-drilling.
// ─────────────────────────────────────────────────────────────
function DojoV2({ T }) {
  const mistakes = [
    { id: 1, lang: 'Py',  title: 'Even/odd remainder',         topic: 'Modulo · Loops',     ago: '2h ago',  due: 'Now',   tone: 'error' },
    { id: 2, lang: 'Py',  title: 'Off-by-one in range',        topic: 'range() · Loops',    ago: 'Yesterday', due: 'Today', tone: 'warn'  },
    { id: 3, lang: 'SQL', title: 'Forgot WHERE clause',         topic: 'SELECT basics',      ago: '2 days',  due: 'Today', tone: 'warn'  },
    { id: 4, lang: 'JS',  title: '== vs ===',                   topic: 'Comparisons',        ago: '3 days',  due: 'Tomorrow', tone: 'neutral' },
    { id: 5, lang: 'Py',  title: 'Mutating list while looping', topic: 'Lists · Loops',      ago: '5 days',  due: 'In 3d', tone: 'neutral' },
  ];
  const langColor = { Py: '#3776ab', JS: '#f0c84a', SQL: '#7a5cf0', CSS: '#ff7a3d' };

  return (
    <div style={{ background: T.bg, minHeight: '100%', fontFamily: T.font, color: T.ink }}>
      {/* Header */}
      <div style={{ padding: '18px 20px 4px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.muted, textTransform: 'uppercase' }}>
          Your Dojo
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, marginTop: 4 }}>
          5 mistakes to drill
        </div>
        <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>
          Spaced practice — hit every one until it sticks.
        </div>
      </div>

      {/* Drill-all hero */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{
          background: T.accent, borderRadius: T.cardRadius,
          padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
          color: T.accentInk,
          boxShadow: `0 4px 0 ${T.accentShadow || 'rgba(0,0,0,0.18)'}`,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: T.accentInk, color: T.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800,
          }}>⚔</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>Drill all 3 due now</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>~4 min · +60 XP</div>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800 }}>→</span>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ padding: '18px 16px 6px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {['All · 5', 'Due · 3', 'Python · 3', 'SQL · 1', 'JS · 1'].map((t, i) => (
          <div key={t} style={{
            padding: '6px 12px', borderRadius: T.pillRadius,
            background: i === 0 ? T.ink : T.surface,
            color: i === 0 ? T.bg : T.muted,
            border: i === 0 ? 'none' : `1px solid ${T.hairline}`,
            fontSize: 12, fontWeight: 700, flexShrink: 0,
          }}>{t}</div>
        ))}
      </div>

      {/* Mistake cards */}
      <div style={{ padding: '12px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {mistakes.map(m => (
          <div key={m.id} style={{
            background: T.surface, borderRadius: T.cardRadius,
            border: `1px solid ${T.hairline}`, padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: langColor[m.lang], color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: T.mono, fontSize: 11, fontWeight: 800,
              flexShrink: 0,
            }}>{m.lang}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.title}
              </div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                {m.topic} · {m.ago}
              </div>
            </div>
            <Pill T={T} tone={m.tone}>{m.due}</Pill>
          </div>
        ))}
      </div>
      <div style={{ height: 16 }} />
    </div>
  );
}

Object.assign(window, {
  HomeV2, LessonV2, ExerciseTapV2, ExerciseTypeV2, ExerciseMCQV2,
  ResultCorrectV2, ResultWrongV2, ReviewV2, DojoV2,
});
