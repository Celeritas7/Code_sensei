# Code Sensei — Engineering Handoff

A Duolingo-style mobile app that teaches Python, SQL, JavaScript, and HTML/CSS to complete beginners. The differentiating feature is the **Dojo** — a personal mistake bank with spaced repetition. Users learn from their own past mistakes, not from a generic curriculum.

This document is the build plan. Read it top to bottom, then build in the numbered order below. The visual reference is `Code Sensei.html` (a design canvas of artboards). The four artboards in the **Engineering handoff** section are the source of truth for tokens, components, and acceptance criteria — when the visual artboards and the spec sheets disagree, **the spec sheets win.**

---

## Stack assumptions (change if your team prefers otherwise)

- **Framework:** React Native (Expo) or React + Capacitor for Android. The mockups are Android-shaped (360×780).
- **State:** Zustand or Redux Toolkit. Store shape is in `Engineering handoff · Flow & state`.
- **Routing:** React Navigation (native stack + bottom tabs).
- **Persistence:** SQLite (Expo SQLite or `react-native-sqlite-storage`) for the mistake bank, AsyncStorage for prefs.
- **Code execution:**
  - Python → Pyodide in a hidden WebView
  - SQL → sql.js in a hidden WebView
  - JS → sandboxed iframe / `JavaScriptCore` evaluator
  - HTML/CSS → live iframe preview
  Pick whatever your team prefers; the API surface is the same (`runCode(lang, source) → {stdout, stderr, ok}`).
- **Code editor:** CodeMirror 6 (web) or `react-native-code-editor` (native) with syntax highlighting matching the syntax tokens in `Design tokens`.
- **Diff view:** Build on top of the `diff` npm package; render with the colors from `Design tokens`.

If your stack diverges from these, that's fine — the design system, screens, and acceptance criteria are framework-agnostic.

---

## Build order

Build in this order. Don't jump ahead — each step depends on the one above.

### 1. Foundation — `Engineering handoff · Design tokens`

Create `src/theme/tokens.ts` with every value from this artboard:

- Color tokens (paper, ink, accent, success, danger, surfaces, hairline)
- Type scale (display, h1, h2, body, caption, mono)
- Radii, shadows, spacing scale
- Syntax-highlighting tokens (keyword, string, number, comment, function, operator)

Theme A (**Dojo Paper**) is the default. Structure tokens so adding Theme B (Terminal) or Theme C (Playful) later is just a second tokens file — components consume tokens, never hardcoded values.

**Done when:** A `<ThemeProvider>` exposes the full token tree via `useTheme()` and a Storybook (or equivalent) shows every token rendered as a swatch.

### 2. State + routing — `Engineering handoff · Flow & state`

Build the empty shell:

- React Navigation tree matching the routes in the artboard
- Bottom tabs: **Home / Practice / Dojo / Sensei**
- Zustand store with the slices shown in the artboard (`user`, `progress`, `hearts`, `streak`, `mistakes`, `currentSession`)
- Stub screens for every route (just a centred title); wire the navigation so all transitions work

**Done when:** You can tap through every screen by name without any real content rendered.

### 3. Shared primitives — `Engineering handoff · Components & data`

Build the reusable components called out in the artboard:

- `<CodeBlock language code highlightLines? />`
- `<DiffView yours theirs />` with red/green tokens from step 1
- `<MascotBubble side="left|right" tone>`
- `<HeartsRow count />`, `<StreakChip />`, `<XPChip />`
- `<Pill tone>`, `<Btn primary|secondary>`, `<ProgressDots total current />`

Also model the data types:

- `Mistake` (id, exerciseId, lang, snippet, expected, dueAt, intervalDays, ease)
- `Exercise` discriminated union: `MCQ | TapFill | TypeIt`
- `SRS.schedule(mistake, outcome) → nextDueAt` (SM-2 lite is fine; spec proposes intervals 1d / 3d / 7d / 14d / 30d)
- `runCode(lang, source) → Promise<{ ok, stdout, stderr }>`

**Done when:** Each component renders correctly in isolation against the design tokens, and unit tests cover the SRS schedule + code-runner adapter.

### 4. Core flow screens — `v2 · Refined flow` section of the canvas

Now wire the real screens, in this order:

1. **Home v2** — single big "Continue" hero, missions secondary, tracks collapsed.
2. **Lesson v2** — micro-step pager. 4–6 cards per lesson, each card = one idea + one tiny tap. Dot progress at the top.
3. **Exercise v2 — MCQ** — focused 3–4 option layout with a single big check button.
4. **Exercise v2 — Tap-fill** — token tray, used tokens dimmed, `runCode` on submit.
5. **Exercise v2 — Type-it** — real `<CodeBlock>` editable, run/submit, code-keyboard row above the OS keyboard.
6. **Result · Correct** — celebratory wash, mascot, XP chip. Auto-advance after 1.5s or tap to continue.
7. **Result · Wrong** — calm ink palette, 1-line "why", **and a write-through to the Mistake bank** (this is non-negotiable — the wrong-answer interstitial is also when `mistakes.add()` fires).
8. **Code Review** — explanation FIRST, then the diff toggle, tests collapsed behind a "see tests" tap. This is the hero screen of the app — give it the most polish.
9. **Dojo (mistake bank)** — list of due mistakes, "Drill all due now" hero, language filters, due chips. Tapping an item starts a focused drill session that respects SRS.

**Done when:** A user can complete a lesson end-to-end, get a wrong answer, see it land in Dojo, and drill it later. This is the minimum demoable loop.

### 5. Onboarding + edges — `Tier 1 · MVP completeness` section

These wrap the core flow into a shippable app:

10. **Splash / sign-in** — Google + email.
11. **Track picker** (step 1/3) — Python pre-selected, multi-select allowed.
12. **Placement** (step 2/3) — 4 self-rate options + a 5-question test as an alt path. Self-rate is good enough for V1.
13. **Daily goal** (step 3/3) — 5 / 10 / 20 / 30 min. "Regular (10 min)" is the default.
14. **Profile / Sensei tab** — belt path, stats grid, achievement gallery, settings.
15. **Lesson summary** — XP / correct / time, "what you learned", "added to Dojo" callout.
16. **Out of hearts** — drill-mistakes-to-earn-a-heart CTA. **Wire the heart-refill loop here** — answering a Dojo drill correctly grants a heart back. This is what makes hearts feel fair instead of punitive.
17. **Empty Dojo** — empty-scroll illustration, encouraging copy.

**Done when:** A new user can sign up, complete onboarding, do a lesson, and see all empty / edge / refill states behave correctly.

### 6. Verify — `Engineering handoff · Acceptance criteria`

Use this artboard as your test checklist before merging anything to `main`. Each screen has 3–6 criteria; tick them off in PRs.

---

## Things easy to miss (read this twice)

These are cross-cutting and tend to get skipped because they don't live on a single screen:

1. **Mistake-bank write-through.** Every wrong answer (in lessons, exercises, AND Dojo drills) calls `mistakes.add()`. Without this, the Dojo is empty and the differentiator vanishes.
2. **Heart refill via drilling.** Correctly answering a Dojo drill grants `+1 heart` (cap at 5). The Out-of-hearts screen links directly to Dojo.
3. **SRS scheduling.** A mistake's `dueAt` advances on correct drill, resets on wrong drill. Don't show mistakes in the Dojo list before their `dueAt`.
4. **Streak ≠ progress.** Streak only increments on hitting the daily goal in **lessons**, not from drilling. Drilling refills hearts; lessons advance streaks. Two different loops.
5. **The Code Review tab strip is a real toggle.** "Diff / Yours / Sensei's" actually switches the rendered code block. The v1 mock has it as decoration — don't copy that.
6. **Theme tokens, not hardcoded values.** Every `#hex` in component code is a code-review red flag. Pull from `useTheme()`.
7. **Slide / artboard order in the canvas is intentional.** v1 (the three theme directions) is for compare-and-contrast only. **Skip v1.** v2 + Tier 1 are what you're building.

---

## Out of scope for V1 (don't build these yet)

- Daily challenge mode
- Belt-up / level-up ceremony screens
- Leaderboard / community / friends
- Heart-refill-via-payment (Tier 2; for now, hearts refill via drilling and via 4-hour timer)
- AI Sensei chat
- Multiple themes (build with Theme A; add Theme B/C in V2)
- Mistake detail page (V1 just shows the mistake inline in the drill)

---

## How to use the canvas (`Code Sensei.html`)

- Open `Code Sensei.html` — it's a pan/zoom design canvas.
- Sections from top to bottom: **v1** (compare-only, skip), **v2** (build), **Tier 1** (build), **Engineering handoff** (4 spec sheets — your source of truth).
- Click the expand icon on any artboard to focus it full-screen. Use ←/→ to flip between artboards in focus mode, Esc to exit.
- The handoff artboards are scrollable inside the artboard — open them full-screen and read top to bottom.

When in doubt, open the artboard and read the spec. If the spec is silent, ask the design team before guessing.

---

## Definition of done for V1

A new user can:

1. Sign up with Google.
2. Pick Python, breeze through placement and goal.
3. Land on Home with a single "Continue" CTA.
4. Complete a Lesson (4–6 micro-steps).
5. Hit one MCQ, one tap-fill, one type-it exercise — get at least one wrong.
6. See the wrong answer in the **Code Review** screen with a clear explanation and diff.
7. See the wrong answer appear in the **Dojo** tab.
8. Lose hearts, get sent to **Out of hearts**, drill a Dojo mistake, earn a heart back, return to a lesson.
9. See the **Lesson summary** with XP, time, and the "added to Dojo" callout when applicable.
10. Build a streak across 2 days.

If all 10 work end-to-end against real persistence (SQLite), V1 is shippable.
