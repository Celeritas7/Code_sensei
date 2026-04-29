// screens-tier1.jsx — Tier 1 MVP-completeness screens (Theme A · Dojo Paper)
// Adds: Splash, Track picker, Placement quiz, Daily goal, Profile,
// Lesson summary, Out-of-hearts, Empty Dojo.

// Pull shared components off window — each Babel <script> gets its own scope.
const { Btn, Pill, StatusBar, BottomTabs, CodeBlock } = window;

// ─────────────────────────────────────────────────────────────
// 01 · SPLASH / SIGN-IN
// ─────────────────────────────────────────────────────────────
function SplashT1({ T }) {
  return (
    <div style={{ background: T.bg, minHeight: '100%', fontFamily: T.font, color: T.ink, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
        <div>{T.mascot(140)}</div>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.8, marginTop: 24 }}>
          Code Sensei
        </div>
        <div style={{ fontSize: 14, color: T.muted, marginTop: 6, lineHeight: 1.5, maxWidth: 280 }}>
          Learn to code. Train against your own mistakes.
        </div>
      </div>
      <div style={{ padding: '0 20px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Btn T={T} primary full icon={<span style={{ fontSize: 14 }}>G</span>}>Continue with Google</Btn>
        <Btn T={T} full>Continue with email</Btn>
        <div style={{ textAlign: 'center', fontSize: 12, color: T.muted, marginTop: 6 }}>
          Already a student? <span style={{ color: T.accent, fontWeight: 700 }}>Sign in</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 02 · TRACK PICKER
// ─────────────────────────────────────────────────────────────
function TrackPickerT1({ T }) {
  const tracks = [
    { id: 'py',   name: 'Python',     desc: 'Friendly, readable, great first language.', tag: 'Most popular', on: true },
    { id: 'sql',  name: 'SQL',        desc: 'Talk to databases.',                         tag: 'Quick wins',   on: false },
    { id: 'js',   name: 'JavaScript', desc: 'Build for the web.',                         tag: null,           on: false },
    { id: 'css',  name: 'HTML & CSS', desc: 'Make websites you can share.',               tag: 'Beginner-friendly', on: false },
  ];
  return (
    <div style={{ background: T.bg, minHeight: '100%', fontFamily: T.font, color: T.ink, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 20px 8px' }}>
        <div style={{ height: 4, borderRadius: 2, background: T.surface2, overflow: 'hidden' }}>
          <div style={{ width: '33%', height: '100%', background: T.accent }} />
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.muted, textTransform: 'uppercase', marginTop: 14 }}>
          Step 1 of 3
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, marginTop: 4, lineHeight: 1.2 }}>
          What do you<br/>want to learn?
        </div>
        <div style={{ fontSize: 14, color: T.muted, marginTop: 6 }}>
          Pick one to start. You can add more later.
        </div>
      </div>

      <div style={{ padding: '18px 16px 0', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {tracks.map(t => (
          <div key={t.id} style={{
            background: t.on ? T.accentBg : T.surface,
            border: `1.5px solid ${t.on ? T.accent : T.hairline}`,
            borderRadius: T.cardRadius, padding: '14px 14px',
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: t.on ? 'none' : `0 2px 0 ${T.hairline}`,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: t.on ? T.accent : T.surface2,
              color: t.on ? T.accentInk : T.muted,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: T.mono, fontSize: 13, fontWeight: 800,
            }}>{t.id === 'py' ? 'Py' : t.id === 'js' ? 'JS' : t.id === 'sql' ? 'SQL' : 'CSS'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>{t.name}</span>
                {t.tag && <Pill T={T} tone="neutral">{t.tag}</Pill>}
              </div>
              <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>{t.desc}</div>
            </div>
            <div style={{
              width: 22, height: 22, borderRadius: 11,
              border: `2px solid ${t.on ? T.accent : T.hairline}`,
              background: t.on ? T.accent : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: T.accentInk, fontSize: 12, fontWeight: 800,
            }}>{t.on && '✓'}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '16px' }}>
        <Btn T={T} primary full>Continue →</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 03 · PLACEMENT QUIZ
// ─────────────────────────────────────────────────────────────
function PlacementT1({ T }) {
  return (
    <div style={{ background: T.bg, minHeight: '100%', fontFamily: T.font, color: T.ink, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 20px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: T.surface2, overflow: 'hidden' }}>
            <div style={{ width: '66%', height: '100%', background: T.accent }} />
          </div>
          <span style={{ fontSize: 12, color: T.muted, fontWeight: 700 }}>Skip</span>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.muted, textTransform: 'uppercase', marginTop: 14 }}>
          Step 2 of 3 · Placement
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.4, marginTop: 4, lineHeight: 1.25 }}>
          Have you coded before?
        </div>
        <div style={{ fontSize: 13, color: T.muted, marginTop: 6 }}>
          We'll skip lessons you already know. Pick the closest match.
        </div>
      </div>

      <div style={{ padding: '12px 16px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { t: 'Total beginner',   d: "I've never written code.",                     on: false },
          { t: 'Tried a tutorial', d: "I've copied some code, didn't really get it.", on: true  },
          { t: 'Some experience',  d: 'I can write a for-loop and an if statement.',  on: false },
          { t: 'Comfortable',      d: "I'm here to brush up.",                        on: false },
        ].map(o => (
          <div key={o.t} style={{
            background: o.on ? T.accentBg : T.surface,
            border: `1.5px solid ${o.on ? T.accent : T.hairline}`,
            borderRadius: T.cardRadius, padding: '14px 16px',
            boxShadow: o.on ? 'none' : `0 2px 0 ${T.hairline}`,
          }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{o.t}</div>
            <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>{o.d}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 16px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flexShrink: 0 }}>{T.mascot(40)}</div>
        <div style={{ fontSize: 12, color: T.muted, flex: 1, lineHeight: 1.4 }}>
          Or take a 5-question test for a precise placement.
        </div>
      </div>
      <div style={{ padding: '0 16px 16px', display: 'flex', gap: 10 }}>
        <Btn T={T}>Take test</Btn>
        <div style={{ flex: 1 }}><Btn T={T} primary full>Continue →</Btn></div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 04 · DAILY GOAL
// ─────────────────────────────────────────────────────────────
function DailyGoalT1({ T }) {
  const goals = [
    { min: 5,  label: 'Casual',   sub: '1 lesson a day' },
    { min: 10, label: 'Regular',  sub: '2 lessons',  on: true, tag: 'Recommended' },
    { min: 20, label: 'Serious',  sub: '4 lessons' },
    { min: 30, label: 'Intense',  sub: '6 lessons' },
  ];
  return (
    <div style={{ background: T.bg, minHeight: '100%', fontFamily: T.font, color: T.ink, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 20px 12px' }}>
        <div style={{ height: 4, borderRadius: 2, background: T.surface2, overflow: 'hidden' }}>
          <div style={{ width: '100%', height: '100%', background: T.accent }} />
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.muted, textTransform: 'uppercase', marginTop: 14 }}>
          Step 3 of 3 · Daily goal
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.4, marginTop: 4, lineHeight: 1.25 }}>
          How long each day?
        </div>
        <div style={{ fontSize: 13, color: T.muted, marginTop: 6 }}>
          Small streaks beat big bursts. You can change this later.
        </div>
      </div>

      <div style={{ padding: '14px 16px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {goals.map(g => (
          <div key={g.min} style={{
            background: g.on ? T.accentBg : T.surface,
            border: `1.5px solid ${g.on ? T.accent : T.hairline}`,
            borderRadius: T.cardRadius, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: g.on ? 'none' : `0 2px 0 ${T.hairline}`,
          }}>
            <div style={{
              width: 52, height: 44, borderRadius: 10,
              background: g.on ? T.accent : T.surface2,
              color: g.on ? T.accentInk : T.ink,
              display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2,
              fontFamily: T.mono, fontWeight: 800,
            }}>
              <span style={{ fontSize: 18 }}>{g.min}</span>
              <span style={{ fontSize: 10 }}>min</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{g.label}</span>
                {g.tag && <Pill T={T} tone="accent">{g.tag}</Pill>}
              </div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{g.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flexShrink: 0 }}>{T.mascot(40)}</div>
        <div style={{
          background: T.surface, borderRadius: T.cardRadius, border: `1px solid ${T.hairline}`,
          padding: '10px 12px', fontSize: 13, lineHeight: 1.4, flex: 1,
        }}>
          Pick one you'll actually do. Tomorrow-you will thank you.
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <Btn T={T} primary full>Start training →</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 05 · PROFILE / SENSEI TAB
// ─────────────────────────────────────────────────────────────
function ProfileT1({ T }) {
  return (
    <div style={{ background: T.bg, minHeight: '100%', fontFamily: T.font, color: T.ink }}>
      {/* Hero — belt + name */}
      <div style={{ padding: '20px 20px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: T.surface, border: `3px solid ${T.accent}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>{T.mascot(58)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.3 }}>Sam</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Joined April 2026 · 3 weeks</div>
          <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
            <Pill T={T} tone="warn">🔥 7 day streak</Pill>
          </div>
        </div>
        <div style={{ fontSize: 18, color: T.muted }}>⚙</div>
      </div>

      {/* Stats grid */}
      <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { v: '312',  l: 'XP'         },
          { v: '7',    l: 'Streak'     },
          { v: '24',   l: 'Lessons'    },
        ].map(s => (
          <div key={s.l} style={{
            background: T.surface, border: `1px solid ${T.hairline}`, borderRadius: T.cardRadius,
            padding: '12px 10px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.3, fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2, fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Belt path */}
      <div style={{ padding: '20px 20px 8px', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.muted, textTransform: 'uppercase' }}>
        Belt path
      </div>
      <div style={{ padding: '0 16px' }}>
        <div style={{
          background: T.surface, border: `1px solid ${T.hairline}`, borderRadius: T.cardRadius,
          padding: '14px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            {[
              { c: '#fff',    on: true },
              { c: '#e8c75a', on: true, current: true },
              { c: '#5b8a3a', on: false },
              { c: '#3b6cb0', on: false },
              { c: '#7a3722', on: false },
              { c: '#1a1a1a', on: false },
            ].map((b, i) => (
              <React.Fragment key={i}>
                <div style={{
                  width: 26, height: 26, borderRadius: 6, background: b.c,
                  border: `2px solid ${b.current ? T.accent : T.hairline}`,
                  opacity: b.on ? 1 : 0.35,
                  boxShadow: b.current ? `0 0 0 3px ${T.accentBg}` : 'none',
                }} />
                {i < 5 && <div style={{ flex: 1, height: 2, background: i < 1 ? T.accent : T.surface2, borderRadius: 1 }} />}
              </React.Fragment>
            ))}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Yellow belt · 188 XP to Green</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Master loops, conditionals, and lists.</div>
        </div>
      </div>

      {/* Achievements */}
      <div style={{ padding: '20px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.muted, textTransform: 'uppercase' }}>
          Achievements · 4 of 22
        </div>
        <span style={{ fontSize: 12, color: T.accent, fontWeight: 700 }}>See all ›</span>
      </div>
      <div style={{ padding: '0 16px 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {[
          { e: '🌱', l: 'First step', on: true },
          { e: '🔥', l: '7 day',      on: true },
          { e: '⚔',  l: '50 drills',  on: true },
          { e: '🎯', l: 'Perfect',    on: true },
          { e: '🏯', l: 'Locked',     on: false },
          { e: '🌸', l: 'Locked',     on: false },
          { e: '⛩',  l: 'Locked',     on: false },
          { e: '🥋', l: 'Locked',     on: false },
        ].map((a, i) => (
          <div key={i} style={{
            aspectRatio: '1', background: a.on ? T.surface : T.surface2,
            border: `1px solid ${T.hairline}`, borderRadius: T.cardRadius,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            opacity: a.on ? 1 : 0.5,
          }}>
            <div style={{ fontSize: 22, filter: a.on ? 'none' : 'grayscale(1)' }}>{a.e}</div>
            <div style={{ fontSize: 9, color: T.muted, marginTop: 4, fontWeight: 600 }}>{a.l}</div>
          </div>
        ))}
      </div>

      {/* Settings rows */}
      <div style={{ padding: '20px 16px 16px' }}>
        <div style={{
          background: T.surface, border: `1px solid ${T.hairline}`, borderRadius: T.cardRadius,
          overflow: 'hidden',
        }}>
          {[
            ['Daily goal', '10 min'],
            ['Notifications', 'On at 6 PM'],
            ['Sound',  'On'],
            ['Account', 'sam@example.com'],
          ].map(([k, v], i, arr) => (
            <div key={k} style={{
              display: 'flex', alignItems: 'center', padding: '12px 14px',
              borderTop: i === 0 ? 'none' : `1px solid ${T.hairline}`,
            }}>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{k}</span>
              <span style={{ fontSize: 13, color: T.muted, marginRight: 8 }}>{v}</span>
              <span style={{ color: T.muted }}>›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 06 · END-OF-LESSON SUMMARY
// ─────────────────────────────────────────────────────────────
function LessonSummaryT1({ T }) {
  return (
    <div style={{ background: T.bg, minHeight: '100%', fontFamily: T.font, color: T.ink, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px 24px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: T.accent, textTransform: 'uppercase' }}>
          Lesson complete
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, marginTop: 6 }}>
          The for-loop
        </div>
      </div>

      <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { v: '+30', l: 'XP earned',  tone: 'accent' },
          { v: '4/5', l: 'Correct',    tone: 'success' },
          { v: '3:42', l: 'Time',       tone: 'neutral' },
        ].map(s => (
          <div key={s.l} style={{
            background: T.surface, border: `1px solid ${T.hairline}`, borderRadius: T.cardRadius,
            padding: '14px 8px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.3 }}>{s.v}</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2, fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* What you learned */}
      <div style={{ padding: '20px 20px 8px', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.muted, textTransform: 'uppercase' }}>
        What you learned
      </div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          'for-loops walk every item once',
          'Indentation defines the loop body',
          'You can name the loop variable anything',
        ].map(t => (
          <div key={t} style={{
            background: T.surface, border: `1px solid ${T.hairline}`, borderRadius: T.cardRadius,
            padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ width: 22, height: 22, borderRadius: 11, background: T.success, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>✓</div>
            <span style={{ fontSize: 13 }}>{t}</span>
          </div>
        ))}
      </div>

      {/* Mistake added to dojo */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{
          background: T.accentBg, borderRadius: T.cardRadius,
          padding: '12px 14px', borderLeft: `3px solid ${T.accent}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ fontSize: 22 }}>⚔</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.accent }}>1 mistake saved to Dojo</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Drill it tomorrow to make it stick.</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Sensei sign-off */}
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flexShrink: 0 }}>{T.mascot(48)}</div>
        <div style={{ fontSize: 13, fontStyle: 'italic', color: T.muted, lineHeight: 1.5, flex: 1 }}>
          "Mastery is just yesterday's mistakes, sharpened."
        </div>
      </div>

      <div style={{ padding: '20px 16px 16px', display: 'flex', gap: 10 }}>
        <Btn T={T}>Home</Btn>
        <div style={{ flex: 1 }}><Btn T={T} primary full>Next lesson →</Btn></div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 07 · OUT OF HEARTS
// ─────────────────────────────────────────────────────────────
function OutOfHeartsT1({ T }) {
  return (
    <div style={{ background: T.bg, minHeight: '100%', fontFamily: T.font, color: T.ink, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ marginBottom: 18, opacity: 0.85 }}>{T.mascot(110)}</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
          {[0, 0, 0, 0, 0].map((_, i) => (
            <span key={i} style={{ fontSize: 22, opacity: 0.25 }}>♡</span>
          ))}
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>
          Rest, young grasshopper.
        </div>
        <div style={{ fontSize: 14, color: T.muted, marginTop: 8, lineHeight: 1.5, maxWidth: 280 }}>
          You're out of hearts. They refill in <b style={{ color: T.ink }}>2h 14m</b> — or earn one back now.
        </div>
      </div>

      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Drill option — uses your differentiator */}
        <div style={{
          background: T.accent, color: T.accentInk, borderRadius: T.cardRadius,
          padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: `0 4px 0 ${T.accentShadow || 'rgba(0,0,0,0.18)'}`,
        }}>
          <div style={{ fontSize: 22 }}>⚔</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>Drill 3 mistakes · earn ♥ 1</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>~3 min · keep training</div>
          </div>
          <span style={{ fontWeight: 800 }}>→</span>
        </div>

        <div style={{
          background: T.surface, border: `1px solid ${T.hairline}`, borderRadius: T.cardRadius,
          padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ fontSize: 22 }}>♥</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Refill all hearts</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Pro feature</div>
          </div>
          <Pill T={T} tone="accent">Pro</Pill>
        </div>

        <Btn T={T} full>Wait for refill</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 08 · EMPTY DOJO
// ─────────────────────────────────────────────────────────────
function EmptyDojoT1({ T }) {
  return (
    <div style={{ background: T.bg, minHeight: '100%', fontFamily: T.font, color: T.ink, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '18px 20px 4px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.muted, textTransform: 'uppercase' }}>
          Your Dojo
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, marginTop: 4 }}>
          A clean slate.
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
        {/* Empty illustration: stylized empty scroll */}
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ marginBottom: 14 }}>
          <rect x="22" y="28" width="76" height="68" rx="4" fill={T.surface} stroke={T.hairline} strokeWidth="1.5"/>
          <line x1="32" y1="44" x2="74" y2="44" stroke={T.surface2} strokeWidth="3" strokeLinecap="round"/>
          <line x1="32" y1="56" x2="86" y2="56" stroke={T.surface2} strokeWidth="3" strokeLinecap="round"/>
          <line x1="32" y1="68" x2="62" y2="68" stroke={T.surface2} strokeWidth="3" strokeLinecap="round"/>
          {/* sumi dot */}
          <circle cx="88" cy="38" r="6" fill={T.accent} opacity="0.85"/>
        </svg>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.3 }}>
          No mistakes yet.
        </div>
        <div style={{ fontSize: 14, color: T.muted, marginTop: 8, lineHeight: 1.5, maxWidth: 260 }}>
          When you slip up in a lesson, the problem lands here. Drill it again later, and it sticks.
        </div>
      </div>

      <div style={{ padding: '0 16px 8px' }}>
        <div style={{
          background: T.surface, border: `1px solid ${T.hairline}`, borderRadius: T.cardRadius,
          padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ flexShrink: 0 }}>{T.mascot(40)}</div>
          <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.45, flex: 1 }}>
            <i>"The dojo fills as you train. Every miss is a future win."</i>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 16px 16px' }}>
        <Btn T={T} primary full>Start a lesson →</Btn>
      </div>
    </div>
  );
}

Object.assign(window, {
  SplashT1, TrackPickerT1, PlacementT1, DailyGoalT1,
  ProfileT1, LessonSummaryT1, OutOfHeartsT1, EmptyDojoT1,
});
