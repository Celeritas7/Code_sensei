// themes.jsx — Three Code Sensei themes + matching mascot drawings.
// Each theme is a single object with all tokens screens.jsx needs.

// ─────────────────────────────────────────────────────────────
// Mascots — each theme has its own little sensei character.
// All vector, no external assets.
// ─────────────────────────────────────────────────────────────

// THEME A — washi/paper sensei. Soft cream face, sumi-ink details, red headband.
function MascotPaper(size = 56) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      {/* face */}
      <circle cx="32" cy="34" r="20" fill="#f5ead4" stroke="#3a2e22" strokeWidth="1.5"/>
      {/* hair tuft */}
      <path d="M16 26 Q22 14 32 14 Q42 14 48 26 Q44 22 36 22 Q28 22 20 26 Z" fill="#1f1a16"/>
      {/* topknot */}
      <ellipse cx="32" cy="13" rx="4" ry="2.5" fill="#1f1a16"/>
      {/* headband */}
      <rect x="14" y="26" width="36" height="4" fill="#b8412e"/>
      <circle cx="32" cy="28" r="1.6" fill="#f5ead4"/>
      {/* eyes */}
      <path d="M24 36 Q26 34.5 28 36" stroke="#1f1a16" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      <path d="M36 36 Q38 34.5 40 36" stroke="#1f1a16" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      {/* mustache + smile */}
      <path d="M27 43 Q32 45 37 43" stroke="#1f1a16" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      <path d="M28 47 Q32 49 36 47" stroke="#1f1a16" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

// THEME B — terminal sensei. Pixel-style, mono green-on-dark.
function MascotTerminal(size = 56) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ imageRendering: 'pixelated' }}>
      <rect x="8" y="8" width="48" height="48" rx="4" fill="#0d1410" stroke="#3df58a" strokeWidth="1.5"/>
      {/* pixel face — drawn as 4px squares */}
      {/* eyes */}
      <rect x="20" y="22" width="6" height="6" fill="#3df58a"/>
      <rect x="38" y="22" width="6" height="6" fill="#3df58a"/>
      <rect x="22" y="24" width="2" height="2" fill="#0d1410"/>
      <rect x="40" y="24" width="2" height="2" fill="#0d1410"/>
      {/* visor line */}
      <rect x="14" y="18" width="36" height="2" fill="#3df58a" opacity="0.5"/>
      {/* mouth — terminal cursor */}
      <rect x="24" y="38" width="16" height="3" fill="#3df58a"/>
      <rect x="38" y="38" width="3" height="6" fill="#3df58a"/>
      {/* prompt > */}
      <text x="14" y="50" fontFamily="monospace" fontSize="8" fill="#3df58a" fontWeight="700">{'>_'}</text>
    </svg>
  );
}

// THEME C — playful sensei. Round, friendly, brand orange + purple gi.
function MascotPlayful(size = 56) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      {/* gi body */}
      <path d="M14 56 Q14 42 32 42 Q50 42 50 56 Z" fill="#7a5cf0"/>
      <path d="M30 42 L32 56 L34 42 Z" fill="#fff"/>
      {/* face */}
      <circle cx="32" cy="28" r="18" fill="#ffd9b8" stroke="#2a1f3a" strokeWidth="1.5"/>
      {/* hair */}
      <path d="M14 22 Q18 10 32 10 Q46 10 50 22 Q44 18 32 18 Q20 18 14 22 Z" fill="#2a1f3a"/>
      {/* headband */}
      <rect x="14" y="22" width="36" height="4" rx="1" fill="#ff7a3d"/>
      {/* eyes */}
      <circle cx="26" cy="30" r="2.5" fill="#2a1f3a"/>
      <circle cx="38" cy="30" r="2.5" fill="#2a1f3a"/>
      <circle cx="27" cy="29" r="0.8" fill="#fff"/>
      <circle cx="39" cy="29" r="0.8" fill="#fff"/>
      {/* cheeks */}
      <circle cx="22" cy="36" r="2.5" fill="#ff9a8a" opacity="0.6"/>
      <circle cx="42" cy="36" r="2.5" fill="#ff9a8a" opacity="0.6"/>
      {/* smile */}
      <path d="M27 38 Q32 42 37 38" stroke="#2a1f3a" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Themes
// ─────────────────────────────────────────────────────────────

const ThemePaper = {
  name: 'Dojo Paper',
  font: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  mono: '"JetBrains Mono", "SF Mono", Menlo, monospace',
  bg: '#f7f1e3',
  surface: '#fdf8ec',
  surface2: '#ede4cd',
  ink: '#2a221a',
  muted: '#8a7d68',
  hairline: 'rgba(60, 45, 25, 0.13)',
  accent: '#b8412e',         // sumi vermillion
  accentInk: '#fdf8ec',
  accentBg: 'rgba(184, 65, 46, 0.10)',
  accentShadow: 'rgba(120, 30, 18, 0.25)',
  success: '#5b8a3a',
  error: '#b8412e',
  warn: '#c98a2c',
  // syntax for paper
  synBg: '#fffbef',
  synKw: '#8a3722',
  synStr: '#5b8a3a',
  synFn: '#7a5e1a',
  synNum: '#9a4f1e',
  synCom: '#a89678',
  synVar: '#3a2e22',
  synOp: '#6b5945',
  pillRadius: 999,
  cardRadius: 14,
  dark: false,
  mascot: MascotPaper,
};

const ThemeTerminal = {
  name: 'Terminal Dark',
  font: '"JetBrains Mono", "SF Mono", Menlo, monospace',
  mono: '"JetBrains Mono", "SF Mono", Menlo, monospace',
  bg: '#0a0e0c',
  surface: '#111714',
  surface2: '#1a221e',
  ink: '#d8e4dc',
  muted: '#5e6e66',
  hairline: 'rgba(61, 245, 138, 0.14)',
  accent: '#3df58a',
  accentInk: '#0a0e0c',
  accentBg: 'rgba(61, 245, 138, 0.10)',
  accentShadow: 'rgba(0, 0, 0, 0.5)',
  success: '#3df58a',
  error: '#ff5b6b',
  warn: '#f5c83d',
  synBg: '#06090a',
  synKw: '#ff7ac6',
  synStr: '#f5c83d',
  synFn: '#7ad6ff',
  synNum: '#ff9d6b',
  synCom: '#4a5a52',
  synVar: '#d8e4dc',
  synOp: '#9aaaa2',
  pillRadius: 4,
  cardRadius: 6,
  dark: true,
  mascot: MascotTerminal,
};

const ThemePlayful = {
  name: 'Playful',
  font: '"Nunito", -apple-system, BlinkMacSystemFont, sans-serif',
  mono: '"JetBrains Mono", "SF Mono", Menlo, monospace',
  bg: '#fff8f3',
  surface: '#ffffff',
  surface2: '#f4ecff',
  ink: '#2a1f3a',
  muted: '#8b7ea3',
  hairline: 'rgba(122, 92, 240, 0.18)',
  accent: '#7a5cf0',
  accentInk: '#ffffff',
  accentBg: 'rgba(122, 92, 240, 0.12)',
  accentShadow: 'rgba(60, 30, 180, 0.30)',
  success: '#22b865',
  error: '#ff5b6b',
  warn: '#ff9a3d',
  synBg: '#fdfaff',
  synKw: '#7a5cf0',
  synStr: '#22b865',
  synFn: '#ff7a3d',
  synNum: '#e84e8a',
  synCom: '#a89bc4',
  synVar: '#2a1f3a',
  synOp: '#5a4b7a',
  pillRadius: 999,
  cardRadius: 18,
  dark: false,
  mascot: MascotPlayful,
};

Object.assign(window, { ThemePaper, ThemeTerminal, ThemePlayful });
