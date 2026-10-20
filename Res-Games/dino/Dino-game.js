(function () {
  if (document.querySelector("#dino-game-overlay")) {
    return;
  }

  const CONFIG = {
    BRAND_NAME: "X Marka",
    BRAND_COLOR: "#E63946",
    BRAND_SECONDARY: "#1D3557",
    GROUND_Y_RATIO: 0.78,
    GROUND_Y_RATIO_PORTRAIT: 0.68,
    WORLD_REF: 560,
    UNIT_MIN: 0.6,
    UNIT_MAX: 1.3,
    GRAVITY: 0.72,
    JUMP_FORCE: -14.5,
    DOUBLE_JUMP_FORCE: -12.5,
    JUMP_CUT: -8,
    COYOTE_FRAMES: 6,
    JUMP_BUFFER_FRAMES: 8,
    INITIAL_SPEED: 7,
    MAX_SPEED: 15,
    SPEED_INCREMENT: 0.0045,
    DINO_WIDTH: 48,
    DINO_HEIGHT: 56,
    OBSTACLE_MIN_GAP_BASE: 720,
    OBSTACLE_MIN_GAP_FLOOR: 380,
    GAP_SHRINK_PER_SCORE: 320,
    GAP_SPEED_FACTOR: 52,
    GAP_RANDOM: 0.6,
    COIN_SPAWN_CHANCE: 0.0035,
    REWARD_MILESTONE: 500,
    DING_EVERY: 100,
    DAY_CYCLE: 3000,
    BIRD_FROM_SCORE: 400,
    BIRD_BASE_CHANCE: 0.42,
    ROCK_CHANCE: 0.18,
    MAX_OBSTACLES: 10,
    MAX_COINS: 5,
    MAX_PARTICLES: 90,
    PARTICLE_BURST: 10,
    DEATH_DELAY_FRAMES: 48,
    CODE_PREFIX: "RUN"
  };

  const LS_HI = "dino_highscore";
  const LS_COINS = "dino_total_coins";
  const TAU = Math.PI * 2;

  let rafId = null;
  let resizeRaf = null;
  let gameStarted = false;
  let rewardUntil = 0;
  let impressionFired = false;
  let lastFrameTs = 0;
  let onKeyDownRef = null;
  let onKeyUpRef = null;
  let onCanvasPointerDownRef = null;
  let onPointerUpRef = null;
  let onDeathScreenClickRef = null;
  let onPlayAgainRef = null;
  let storedTotalCoins = 0;
  let hudTick = 0;

  const State = {
    score: 0,
    scoreAcc: 0,
    highScore: 0,
    coinsRun: 0,
    isRunning: false,
    isDead: false,
    newRecord: false,
    clock: 0,
    dinoAlt: 0,
    dinoVy: 0,
    jumpCount: 0,
    jumpHeld: false,
    jumpBuffer: 0,
    coyote: 0,
    onGround: true,
    squash: 0,
    runAnim: 0,
    gameSpeed: CONFIG.INITIAL_SPEED,
    distance: 0,
    spawnIn: 0,
    nextDing: CONFIG.DING_EVERY,
    deathTimer: 0,
    restartReadyAt: 0,
    shake: 0,
    flash: 0,
    milestoneShown: false,
    particles: [],
    popups: [],
    obstacles: [],
    coins: []
  };

  const view = {
    w: 0,
    h: 0,
    dpr: 1,
    unit: 1,
    ww: 0,
    wh: 0,
    groundRatio: CONFIG.GROUND_Y_RATIO
  };

  const audio = {
    ctx: null,
    muted: false
  };

  const hexToRgb = (hex) => {
    const clean = hex.replace("#", "");
    const full = clean.length === 3 ? clean.split("").map((ch) => ch + ch).join("") : clean;
    const num = parseInt(full, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  };

  const shadeHex = (hex, amt) => {
    const out = hexToRgb(hex).map((v) => Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt)));
    return `rgb(${out[0]}, ${out[1]}, ${out[2]})`;
  };

  const PALETTE = {
    skyTop: ["#4fb3ff", "#0a1233"],
    skyBottom: ["#ffe2b8", "#3b2d5e"],
    mountain: ["#8fa6d6", "#242a4f"],
    mountainLow: ["#d3dcef", "#3a3f68"],
    hill: ["#e9a965", "#3a2c4f"],
    hillLow: ["#f3c58a", "#4a3a5e"],
    near: ["#d98f4c", "#2e2440"],
    nearDark: ["#bb7536", "#241c34"],
    sandTop: ["#f8d394", "#6b5578"],
    sand: ["#ecb771", "#54425f"],
    dirt: ["#b5743c", "#2b2034"],
    cloud: ["#ffffff", "#8a8fc0"],
    cloudShade: ["#e3ecfa", "#5d6194"],
    grass: ["#98a83f", "#3d4a3a"]
  };

  const PAL_RGB = {};
  Object.keys(PALETTE).forEach((key) => {
    PAL_RGB[key] = [hexToRgb(PALETTE[key][0]), hexToRgb(PALETTE[key][1])];
  });

  const mixColor = (key, t, alpha) => {
    const a = PAL_RGB[key][0];
    const b = PAL_RGB[key][1];
    const r = Math.round(a[0] + (b[0] - a[0]) * t);
    const g = Math.round(a[1] + (b[1] - a[1]) * t);
    const bl = Math.round(a[2] + (b[2] - a[2]) * t);
    return `rgba(${r}, ${g}, ${bl}, ${alpha === undefined ? 1 : alpha})`;
  };

  const DINO_COLORS = {
    light: shadeHex(CONFIG.BRAND_COLOR, 0.35),
    mid: shadeHex(CONFIG.BRAND_COLOR, 0),
    dark: shadeHex(CONFIG.BRAND_COLOR, -0.3),
    outline: shadeHex(CONFIG.BRAND_COLOR, -0.62),
    spike: shadeHex(CONFIG.BRAND_SECONDARY, 0.15),
    belly: "#ffe8d2"
  };

  const DINO_SVG = `
    <svg class="dino-start-svg" viewBox="0 0 130 112" aria-hidden="true">
      <defs>
        <linearGradient id="dino-svg-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${DINO_COLORS.light}"/>
          <stop offset="0.55" stop-color="${DINO_COLORS.mid}"/>
          <stop offset="1" stop-color="${DINO_COLORS.dark}"/>
        </linearGradient>
      </defs>
      <ellipse cx="62" cy="106" rx="38" ry="5" fill="rgba(0,0,0,0.3)"/>
      <path d="M30 62 L22 46 L38 52 Z M42 51 L39 33 L53 45 Z M55 44 L57 27 L66 42 Z" fill="${DINO_COLORS.spike}" stroke="${DINO_COLORS.outline}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M38 72 Q18 72 5 50 Q22 62 40 58 Z" fill="url(#dino-svg-body)" stroke="${DINO_COLORS.outline}" stroke-width="2.4" stroke-linejoin="round"/>
      <rect x="40" y="80" width="11" height="22" rx="5.5" fill="${DINO_COLORS.dark}" stroke="${DINO_COLORS.outline}" stroke-width="2.2"/>
      <ellipse cx="57" cy="70" rx="24" ry="21" fill="url(#dino-svg-body)" stroke="${DINO_COLORS.outline}" stroke-width="2.4"/>
      <rect x="61" y="38" width="20" height="32" rx="9" fill="${DINO_COLORS.mid}"/>
      <rect x="58" y="12" width="52" height="38" rx="17" fill="url(#dino-svg-body)" stroke="${DINO_COLORS.outline}" stroke-width="2.4"/>
      <ellipse cx="64" cy="76" rx="13" ry="14" fill="${DINO_COLORS.belly}"/>
      <rect x="62" y="82" width="11" height="22" rx="5.5" fill="${DINO_COLORS.mid}" stroke="${DINO_COLORS.outline}" stroke-width="2.2"/>
      <path d="M77 64 Q87 64 87 75" stroke="${DINO_COLORS.dark}" stroke-width="5" stroke-linecap="round" fill="none"/>
      <circle cx="92" cy="28" r="8" fill="#ffffff" stroke="${DINO_COLORS.outline}" stroke-width="2"/>
      <circle cx="94.5" cy="29" r="4.2" fill="#1b1b2f"/>
      <circle cx="96" cy="27" r="1.5" fill="#ffffff"/>
      <ellipse cx="85" cy="41" rx="4.5" ry="2.6" fill="rgba(255,120,150,0.6)"/>
      <path d="M90 42 Q98 47 106 41" stroke="${DINO_COLORS.outline}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <circle cx="104" cy="23" r="1.4" fill="${DINO_COLORS.outline}"/>
      <ellipse cx="47" cy="60" rx="9" ry="4.5" fill="rgba(255,255,255,0.3)" transform="rotate(-25 47 60)"/>
      <ellipse cx="76" cy="19" rx="11" ry="3.5" fill="rgba(255,255,255,0.35)"/>
    </svg>
  `;

  const styleEl = document.createElement("style");
  styleEl.id = "dino-game-css";
  styleEl.textContent = `
#dino-game-overlay {
  --dino-brand: ${CONFIG.BRAND_COLOR};
  --dino-brand-light: ${shadeHex(CONFIG.BRAND_COLOR, 0.25)};
  --dino-brand-dark: ${shadeHex(CONFIG.BRAND_COLOR, -0.4)};
  --dino-secondary: ${CONFIG.BRAND_SECONDARY};
  --dino-gold: #ffc93c;
  --dino-glass: rgba(14, 20, 36, 0.55);
  --dino-card: rgba(16, 22, 40, 0.9);
  --dino-line: rgba(255, 255, 255, 0.14);
  --dino-muted: #aab3c7;
  font-size: clamp(13px, calc(2vmin + 6px), 18px);
  box-sizing: border-box;
  position: fixed;
  inset: 0;
  z-index: 999999;
  background: #0e1118;
  font-family: "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Roboto, Arial, sans-serif;
  color: #ffffff;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  animation: dino-overlay-in 0.35s ease both;
}

#dino-game-overlay[data-state="closing"] {
  animation: dino-overlay-out 0.3s ease forwards;
  pointer-events: none;
}

#dino-game-overlay *,
#dino-game-overlay *::before,
#dino-game-overlay *::after {
  box-sizing: border-box;
}

#dino-game-canvas-wrap {
  position: absolute;
  inset: 0;
}

#dino-game-canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
  cursor: pointer;
  -webkit-touch-callout: none;
}

#dino-game-hud {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 0.6em 6.6em 0.6em 0.7em;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5em;
  pointer-events: none;
  z-index: 4;
}

#dino-game-hud .dino-hud-brand {
  font-size: 0.85em;
  font-weight: 800;
  color: #ffffff;
  flex: 0 1 auto;
  max-width: 30%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0.45em 0.95em;
  border-radius: 2em;
  background: var(--dino-glass);
  border: 0.07em solid var(--dino-line);
  backdrop-filter: blur(6px);
}

#dino-game-hud .dino-hud-brand::before {
  content: "";
  display: inline-block;
  width: 0.6em;
  height: 0.6em;
  margin-right: 0.45em;
  border-radius: 50%;
  background: var(--dino-brand);
  box-shadow: 0 0 0.5em var(--dino-brand);
}

#dino-game-hud .dino-hud-score {
  font-size: 2em;
  font-weight: 900;
  text-align: center;
  flex: 1 1 auto;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.03em;
  line-height: 1.1;
  text-shadow: 0 0.08em 0 rgba(0, 0, 0, 0.25), 0 0.15em 0.6em rgba(0, 0, 0, 0.35);
}

#dino-game-hud .dino-hud-score[data-pulse="true"] {
  animation: dino-score-pulse 0.45s ease;
}

#dino-game-hud .dino-hud-meta {
  font-size: 0.8em;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.35em;
}

#dino-game-hud .dino-hud-meta span {
  display: block;
  padding: 0.35em 0.85em;
  border-radius: 2em;
  background: var(--dino-glass);
  border: 0.07em solid var(--dino-line);
  font-weight: 800;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  backdrop-filter: blur(6px);
}

#dino-hud-coins {
  color: var(--dino-gold);
}

#dino-reward-banner {
  position: absolute;
  top: 4em;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #ffe08a, #ff9f1c);
  color: #3b2300;
  padding: 0.6em 1.3em;
  border-radius: 2em;
  font-size: 0.9em;
  font-weight: 800;
  white-space: nowrap;
  z-index: 5;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  box-shadow: 0 0.4em 1.2em rgba(255, 159, 28, 0.45);
}

#dino-reward-banner[data-visible="true"] {
  visibility: visible;
  animation: slide-in-banner 0.45s cubic-bezier(0.2, 1.4, 0.4, 1) forwards;
}

#dino-close-btn,
#dino-sound-btn {
  position: absolute;
  top: 0.5em;
  width: 2.3em;
  height: 2.3em;
  padding: 0;
  border: 0.07em solid var(--dino-line);
  border-radius: 50%;
  background: var(--dino-glass);
  color: #ffffff;
  font-size: 1.15em;
  line-height: 1;
  cursor: pointer;
  z-index: 9;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  backdrop-filter: blur(6px);
}

#dino-close-btn {
  right: 0.5em;
}

#dino-sound-btn {
  right: 3.1em;
}

#dino-sound-btn svg {
  width: 1em;
  height: 1em;
  display: block;
}

#dino-sound-btn[data-muted="true"] .dino-sound-wave {
  display: none;
}

#dino-sound-btn[data-muted="false"] .dino-sound-off {
  display: none;
}

#dino-close-btn:active,
#dino-sound-btn:active {
  transform: scale(0.92);
}

#dino-start-screen,
#dino-death-screen {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3.4em 0.75em 0.75em;
  z-index: 6;
  pointer-events: none;
}

#dino-start-screen .dino-screen-inner,
#dino-death-screen .dino-screen-inner {
  position: relative;
  z-index: 1;
  pointer-events: auto;
  text-align: center;
  padding: 1.3em 1.4em;
  max-width: min(92vw, 24em);
  max-height: 100%;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  overflow-y: auto;
  scrollbar-width: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--dino-card);
  border: 0.07em solid var(--dino-line);
  border-radius: 1.3em;
  box-shadow: 0 1.2em 3em rgba(0, 0, 0, 0.45), inset 0 0.07em 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
}

#dino-start-screen[data-state="open"] {
  opacity: 1;
  visibility: visible;
}

#dino-start-screen[data-state="open"] .dino-screen-inner {
  animation: dino-card-in 0.5s cubic-bezier(0.2, 1.2, 0.4, 1) both;
}

#dino-start-screen[data-state="close"] {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s ease, visibility 0.25s;
}

#dino-death-screen[data-state="hidden"] {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

#dino-death-screen[data-state="open"] {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  background: radial-gradient(circle at 50% 40%, rgba(10, 14, 30, 0.35), rgba(5, 8, 18, 0.78));
  animation: dino-fade-in 0.3s ease both;
}

#dino-death-screen[data-state="open"] .dino-screen-inner {
  animation: slide-in-death-inner 0.45s cubic-bezier(0.2, 1.2, 0.4, 1) both;
}

.dino-start-brand {
  font-size: 0.8em;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #ffffff;
  background: var(--dino-brand);
  padding: 0.35em 1em;
  border-radius: 2em;
  box-shadow: 0 0.3em 0.9em rgba(0, 0, 0, 0.3);
}

.dino-start-title {
  font-size: 1.9em;
  font-weight: 900;
  line-height: 1.1;
  margin: 0.35em 0 0.1em;
  background: linear-gradient(180deg, #ffffff, #ffd9a0);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.dino-start-dino {
  width: 7.5em;
  height: 6.4em;
  margin: 0.25em auto 0.2em;
  animation: dino-idle 0.7s ease-in-out infinite;
}

.dino-start-svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.dino-start-tips {
  list-style: none;
  margin: 0.4em 0 1em;
  padding: 0;
  width: 100%;
  font-size: 0.85em;
  color: #d5dbea;
  line-height: 1.4;
  display: flex;
  flex-direction: column;
  gap: 0.45em;
}

.dino-start-tips li {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.35em;
  padding: 0.5em 0.75em;
  border-radius: 0.7em;
  background: rgba(255, 255, 255, 0.06);
}

.dino-kbd {
  display: inline-block;
  padding: 0.12em 0.55em;
  border-radius: 0.35em;
  background: rgba(255, 255, 255, 0.16);
  border-bottom: 0.14em solid rgba(0, 0, 0, 0.4);
  font-size: 0.9em;
  font-weight: 800;
  color: #ffffff;
}

#dino-start-btn,
#dino-play-again {
  display: inline-block;
  padding: 0.85em 2.4em;
  border: none;
  border-radius: 3em;
  background: linear-gradient(180deg, var(--dino-brand-light), var(--dino-brand));
  color: #ffffff;
  font-family: inherit;
  font-size: 1.1em;
  font-weight: 900;
  letter-spacing: 0.06em;
  cursor: pointer;
  box-shadow: 0 0.3em 0 var(--dino-brand-dark), 0 0.6em 1.4em rgba(0, 0, 0, 0.35);
  animation: dino-btn-pulse 1.6s ease-in-out infinite;
}

#dino-start-btn:active,
#dino-play-again:active {
  animation: none;
  transform: translateY(0.2em);
  box-shadow: 0 0.1em 0 var(--dino-brand-dark), 0 0.3em 0.8em rgba(0, 0, 0, 0.35);
}

.dino-start-hint {
  font-size: 0.8em;
  color: var(--dino-muted);
  margin-top: 0.85em;
}

.dino-death-badge {
  display: none;
  font-size: 0.8em;
  font-weight: 900;
  letter-spacing: 0.12em;
  color: #3b2300;
  background: linear-gradient(135deg, #ffe08a, #ffb703);
  padding: 0.3em 0.95em;
  border-radius: 2em;
  margin-bottom: 0.45em;
}

.dino-death-badge[data-visible="true"] {
  display: inline-block;
  animation: dino-badge-pop 0.6s cubic-bezier(0.2, 1.6, 0.4, 1) 0.2s both;
}

.dino-death-title {
  font-size: 1.8em;
  font-weight: 900;
  letter-spacing: 0.04em;
  color: #ffffff;
  margin-bottom: 0.5em;
  text-shadow: 0 0.1em 0 var(--dino-brand-dark);
}

#dino-death-screen .dino-death-title,
#dino-death-screen .dino-death-stats {
  align-self: stretch;
  width: 100%;
}

.dino-death-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.45em;
  margin-bottom: 0.8em;
}

.dino-stat {
  display: flex;
  flex-direction: column;
  gap: 0.15em;
  padding: 0.45em 0.3em;
  border-radius: 0.8em;
  background: rgba(255, 255, 255, 0.06);
  border: 0.07em solid var(--dino-line);
}

.dino-stat span {
  font-size: 0.68em;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--dino-muted);
}

.dino-stat strong {
  font-size: 1.2em;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

#dino-death-screen .dino-death-discount {
  align-self: center;
  width: 100%;
}

.dino-death-discount {
  margin: 0 0 1em;
  padding: 0.8em 0.9em;
  border-radius: 0.9em;
  background: linear-gradient(135deg, rgba(255, 201, 60, 0.16), rgba(230, 57, 70, 0.16));
  border: 0.09em dashed rgba(255, 201, 60, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dino-discount-pct {
  font-size: 1.05em;
  font-weight: 800;
  color: #ffd166;
  margin-bottom: 0.55em;
  width: 100%;
  text-align: center;
}

.dino-discount-code-row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: center;
  gap: 0.5em;
  width: 100%;
}

#dino-discount-code {
  flex: 1 1 auto;
  min-width: 0;
  text-align: center;
  font-family: ui-monospace, "Cascadia Code", Consolas, monospace;
  font-size: 0.95em;
  font-weight: 700;
  padding: 0.55em 0.7em;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 0.5em;
  color: #ffffff;
  letter-spacing: 0.06em;
  word-break: break-all;
  user-select: all;
  -webkit-user-select: all;
}

#dino-copy-code {
  flex: 0 0 auto;
  padding: 0.55em 0.95em;
  border: none;
  border-radius: 0.5em;
  background: #ffffff;
  color: #1b1b2f;
  font-family: inherit;
  font-size: 0.85em;
  font-weight: 800;
  cursor: pointer;
}

#dino-copy-code[data-copied="true"] {
  background: #2ecc71;
  color: #ffffff;
  animation: dino-badge-pop 0.35s ease both;
}

#dino-death-screen #dino-play-again {
  align-self: center;
  margin-bottom: 0.75em;
}

#dino-death-screen .dino-total-coins {
  align-self: stretch;
  width: 100%;
}

.dino-total-coins {
  font-size: 0.8em;
  color: var(--dino-muted);
}

#dino-confetti {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.dino-confetti-piece {
  position: absolute;
  top: -1em;
  width: 0.55em;
  height: 0.9em;
  border-radius: 0.12em;
  animation-name: dino-confetti-fall;
  animation-timing-function: linear;
  animation-fill-mode: both;
}

#dino-orient-layer {
  position: absolute;
  left: 50%;
  bottom: 1.2em;
  transform: translateX(-50%);
  z-index: 7;
  align-items: center;
  gap: 0.7em;
  width: max-content;
  max-width: 92%;
  padding: 0.55em 1em;
  border-radius: 2em;
  background: var(--dino-glass);
  border: 0.07em solid var(--dino-line);
  font-size: 0.8em;
  pointer-events: none;
  backdrop-filter: blur(6px);
}

#dino-orient-layer[data-state="landscape"] {
  display: none;
}

#dino-orient-layer[data-state="portrait"] {
  display: flex;
  animation: dino-fade-in 0.4s ease both;
}

.dino-phone-icon {
  flex: none;
  width: 1.1em;
  height: 1.8em;
  border: 0.16em solid #ffffff;
  border-radius: 0.3em;
  animation: rotate-hint 1.4s ease-in-out infinite alternate;
}

.dino-orient-text {
  max-width: 18em;
  text-align: left;
  line-height: 1.3;
}

@keyframes dino-overlay-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes dino-overlay-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes dino-fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes dino-idle {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-0.35em);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes dino-card-in {
  0% {
    opacity: 0;
    transform: translateY(1.2em) scale(0.96);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes slide-in-banner {
  0% {
    transform: translate(-50%, -120%) scale(0.8);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, 0) scale(1);
    opacity: 1;
  }
}

@keyframes slide-in-death-inner {
  0% {
    transform: translateY(-12%) scale(0.96);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes dino-score-pulse {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes dino-btn-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes dino-badge-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  70% {
    transform: scale(1.15);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes dino-confetti-fall {
  0% {
    transform: translate3d(0, -2em, 0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate3d(var(--dino-drift), 110vh, 0) rotate(var(--dino-spin));
    opacity: 0.2;
  }
}

@keyframes rotate-hint {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(90deg);
  }
}

@media (max-width: 767px) {
  #dino-game-hud {
    padding-right: 6.6em;
  }

  #dino-game-hud .dino-hud-score {
    font-size: 1.6em;
  }

  #dino-game-hud .dino-hud-brand {
    max-width: 34%;
    font-size: 0.78em;
  }

  #dino-reward-banner {
    white-space: normal;
    text-align: center;
    width: max-content;
    max-width: 86%;
  }

  .dino-discount-code-row {
    flex-direction: column;
    align-items: stretch;
  }

  #dino-discount-code {
    flex: none;
    width: 100%;
  }

  #dino-copy-code {
    width: 100%;
  }
}

@media (max-height: 460px) {
  #dino-start-screen,
  #dino-death-screen {
    padding-top: 3.1em;
    padding-bottom: 0.5em;
  }

  #dino-start-screen .dino-screen-inner,
  #dino-death-screen .dino-screen-inner {
    padding: 0.9em 1.3em;
  }

  .dino-start-dino {
    width: 4.4em;
    height: 3.7em;
  }

  .dino-start-hint {
    margin-top: 0.5em;
  }

  .dino-death-stats {
    margin-bottom: 0.55em;
  }

  .dino-death-discount {
    margin-bottom: 0.7em;
    padding: 0.6em 0.8em;
  }

  .dino-start-title {
    font-size: 1.55em;
  }

  .dino-start-tips {
    margin: 0.3em 0 0.7em;
    gap: 0.3em;
  }

  .dino-start-tips li {
    padding: 0.35em 0.7em;
  }

  .dino-death-title {
    font-size: 1.5em;
    margin-bottom: 0.35em;
  }
}

@media (pointer: coarse) {
  #dino-close-btn,
  #dino-sound-btn {
    min-width: 2.5em;
    min-height: 2.5em;
  }

  #dino-sound-btn {
    right: 3.3em;
  }
}

@media (min-width: 768px) {
  #dino-start-screen .dino-screen-inner,
  #dino-death-screen .dino-screen-inner {
    max-width: 26em;
    padding: 1.6em 1.8em;
  }
}

@media (min-width: 1024px) {
  #dino-game-hud .dino-hud-score {
    font-size: 2.2em;
  }
}
`;

  const overlay = document.createElement("div");
  overlay.id = "dino-game-overlay";
  overlay.dataset.state = "open";

  const canvasWrap = document.createElement("div");
  canvasWrap.id = "dino-game-canvas-wrap";

  const canvas = document.createElement("canvas");
  canvas.id = "dino-game-canvas";

  const hud = document.createElement("div");
  hud.id = "dino-game-hud";
  hud.innerHTML = `
    <div class="dino-hud-brand">${CONFIG.BRAND_NAME}</div>
    <div class="dino-hud-score" id="dino-hud-score" data-pulse="false">0</div>
    <div class="dino-hud-meta">
      <span id="dino-hud-coins">₺ 0</span>
      <span id="dino-hud-hi">EN İYİ: 0</span>
    </div>
  `;

  const rewardBanner = document.createElement("div");
  rewardBanner.id = "dino-reward-banner";
  rewardBanner.textContent = "Harika! 500 puanı geçtin, indirimin büyüyor!";
  rewardBanner.dataset.visible = "false";

  const closeBtn = document.createElement("button");
  closeBtn.id = "dino-close-btn";
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Kapat");
  closeBtn.textContent = "×";

  const soundBtn = document.createElement("button");
  soundBtn.id = "dino-sound-btn";
  soundBtn.type = "button";
  soundBtn.setAttribute("aria-label", "Sesi aç / kapat");
  soundBtn.dataset.muted = "false";
  soundBtn.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/>
      <path class="dino-sound-wave" d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path class="dino-sound-off" d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;

  const startScreen = document.createElement("div");
  startScreen.id = "dino-start-screen";
  startScreen.dataset.state = "open";
  startScreen.innerHTML = `
    <div class="dino-screen-inner">
      <div class="dino-start-brand">${CONFIG.BRAND_NAME}</div>
      <div class="dino-start-title">Dino Koşusu</div>
      <div class="dino-start-dino">${DINO_SVG}</div>
      <ul class="dino-start-tips">
        <li><span class="dino-kbd">Boşluk</span><span class="dino-kbd">↑</span><span>veya ekrana dokun: zıpla</span></li>
        <li>Uzun bas, daha yükseğe zıpla. Havada tekrar bas, çift zıpla!</li>
        <li>₺ topla, engellerden kaç, skoruna göre indirim kazan.</li>
      </ul>
      <button type="button" id="dino-start-btn">BAŞLA</button>
      <div class="dino-start-hint" id="dino-start-best">En iyi skorun: 0</div>
    </div>
  `;

  const deathScreen = document.createElement("div");
  deathScreen.id = "dino-death-screen";
  deathScreen.dataset.state = "hidden";
  deathScreen.innerHTML = `
    <div id="dino-confetti"></div>
    <div class="dino-screen-inner">
      <div class="dino-death-badge" id="dino-death-badge" data-visible="false">YENİ REKOR!</div>
      <div class="dino-death-title">OYUN BİTTİ</div>
      <div class="dino-death-stats" id="dino-death-stats"></div>
      <div class="dino-death-discount" id="dino-death-discount-wrap">
        <div class="dino-discount-pct" id="dino-discount-pct"></div>
        <div class="dino-discount-code-row">
          <code id="dino-discount-code"></code>
          <button type="button" id="dino-copy-code">Kopyala</button>
        </div>
      </div>
      <button type="button" id="dino-play-again">YENİDEN OYNA</button>
      <div class="dino-total-coins" id="dino-total-coins-label"></div>
    </div>
  `;

  const orientLayer = document.createElement("div");
  orientLayer.id = "dino-orient-layer";
  orientLayer.dataset.state = "landscape";
  orientLayer.innerHTML = `
    <div class="dino-phone-icon"></div>
    <div class="dino-orient-text">Daha geniş görüş için cihazını yatay çevirebilirsin.</div>
  `;

  canvasWrap.appendChild(canvas);
  overlay.appendChild(canvasWrap);
  overlay.appendChild(hud);
  overlay.appendChild(rewardBanner);
  overlay.appendChild(soundBtn);
  overlay.appendChild(closeBtn);
  overlay.appendChild(startScreen);
  overlay.appendChild(deathScreen);
  overlay.appendChild(orientLayer);

  const ctx = canvas.getContext("2d");
  const hudScoreEl = hud.querySelector("#dino-hud-score");
  const hudCoinsEl = hud.querySelector("#dino-hud-coins");
  const hudHiEl = hud.querySelector("#dino-hud-hi");
  const startBtn = startScreen.querySelector("#dino-start-btn");
  const startBestEl = startScreen.querySelector("#dino-start-best");
  const confettiLayer = deathScreen.querySelector("#dino-confetti");

  const getAudioCtx = () => {
    if (audio.muted) {
      return null;
    }
    try {
      if (!audio.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) {
          return null;
        }
        audio.ctx = new AC();
      }
      if (audio.ctx.state === "suspended") {
        const resumed = audio.ctx.resume();
        if (resumed && resumed.catch) {
          resumed.catch(() => {});
        }
      }
      return audio.ctx;
    } catch (e) {
      return null;
    }
  };

  const playTone = (opts) => {
    const ac = getAudioCtx();
    if (!ac) {
      return;
    }
    try {
      const t0 = ac.currentTime + (opts.delay || 0);
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = opts.type || "square";
      osc.frequency.setValueAtTime(opts.from, t0);
      osc.frequency.exponentialRampToValueAtTime(opts.to, t0 + opts.dur);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(opts.vol, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + opts.dur + 0.03);
    } catch (e) {}
  };

  const playNoise = (dur, vol, freq) => {
    const ac = getAudioCtx();
    if (!ac) {
      return;
    }
    try {
      const len = Math.max(1, Math.floor(ac.sampleRate * dur));
      const buffer = ac.createBuffer(1, len, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i += 1) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      }
      const src = ac.createBufferSource();
      const filter = ac.createBiquadFilter();
      const gain = ac.createGain();
      src.buffer = buffer;
      filter.type = "lowpass";
      filter.frequency.value = freq;
      gain.gain.value = vol;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);
      src.start();
    } catch (e) {}
  };

  const SFX = {
    jump: () => playTone({ from: 360, to: 760, dur: 0.15, type: "square", vol: 0.045 }),
    doubleJump: () => playTone({ from: 560, to: 1180, dur: 0.16, type: "triangle", vol: 0.08 }),
    land: () => playNoise(0.06, 0.07, 700),
    coin: () => {
      playTone({ from: 988, to: 988, dur: 0.08, type: "square", vol: 0.04 });
      playTone({ from: 1319, to: 1319, dur: 0.2, type: "square", vol: 0.04, delay: 0.07 });
    },
    ding: () => {
      playTone({ from: 880, to: 880, dur: 0.07, type: "triangle", vol: 0.06 });
      playTone({ from: 1175, to: 1175, dur: 0.12, type: "triangle", vol: 0.06, delay: 0.07 });
    },
    reward: () => {
      [523, 659, 784, 1047].forEach((f, i) => {
        playTone({ from: f, to: f, dur: 0.16, type: "triangle", vol: 0.08, delay: i * 0.08 });
      });
    },
    hit: () => {
      playTone({ from: 320, to: 55, dur: 0.45, type: "sawtooth", vol: 0.09 });
      playNoise(0.3, 0.16, 1400);
    },
    over: () => {
      [659, 523, 392].forEach((f, i) => {
        playTone({ from: f, to: f * 0.97, dur: 0.18, type: "triangle", vol: 0.07, delay: i * 0.13 });
      });
    },
    click: () => playTone({ from: 600, to: 980, dur: 0.09, type: "triangle", vol: 0.06 })
  };

  const readNum = (key) => {
    try {
      const v = parseInt(localStorage.getItem(key) || "0", 10);
      return Number.isFinite(v) ? v : 0;
    } catch (e) {
      return 0;
    }
  };

  const writeNum = (key, v) => {
    try {
      localStorage.setItem(key, String(v));
    } catch (e) {}
  };

  const readStorage = () => {
    State.highScore = readNum(LS_HI);
    return { hi: State.highScore, totalCoins: readNum(LS_COINS) };
  };

  const hash = (n) => {
    const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
  };

  const getObstacleGap = () => {
    const shrink = Math.floor(State.score / CONFIG.GAP_SHRINK_PER_SCORE) * 55;
    const base = Math.max(CONFIG.OBSTACLE_MIN_GAP_FLOOR, CONFIG.OBSTACLE_MIN_GAP_BASE - shrink);
    return Math.max(base, State.gameSpeed * CONFIG.GAP_SPEED_FACTOR);
  };

  const scoreToDiscount = (s) => {
    if (s >= 2500) {
      return 30;
    }
    if (s >= 1800) {
      return 25;
    }
    if (s >= 1200) {
      return 20;
    }
    if (s >= 700) {
      return 15;
    }
    if (s >= 350) {
      return 12;
    }
    if (s >= 150) {
      return 8;
    }
    if (s >= 50) {
      return 5;
    }
    return 3;
  };

  const makeDiscountCode = (score, pct) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let tail = "";
    for (let i = 0; i < 6; i += 1) {
      tail += chars[Math.floor(Math.random() * chars.length)];
    }
    const mid = String(score % 10000).padStart(4, "0");
    return `${CONFIG.CODE_PREFIX}-${pct}-${mid}-${tail}`;
  };

  const updateHudDom = () => {
    hudScoreEl.textContent = String(State.score);
    hudCoinsEl.textContent = `₺ ${State.coinsRun}`;
    hudHiEl.textContent = `EN İYİ: ${Math.max(State.highScore, State.score)}`;
  };

  const pulseScore = () => {
    hudScoreEl.dataset.pulse = "false";
    void hudScoreEl.offsetWidth;
    hudScoreEl.dataset.pulse = "true";
  };

  const getGroundY = () => {
    return view.wh * view.groundRatio;
  };

  const getDinoX = () => {
    return Math.min(140, Math.max(48, view.ww * 0.12));
  };

  const dayNightFactor = () => {
    const p = (State.score % CONFIG.DAY_CYCLE) / CONFIG.DAY_CYCLE;
    const smooth = (t) => t * t * (3 - 2 * t);
    if (p < 0.55) {
      return 0;
    }
    if (p < 0.65) {
      return smooth((p - 0.55) / 0.1);
    }
    if (p < 0.9) {
      return 1;
    }
    return 1 - smooth((p - 0.9) / 0.1);
  };

  const addParticle = (p) => {
    if (State.particles.length >= CONFIG.MAX_PARTICLES) {
      State.particles.shift();
    }
    State.particles.push(p);
  };

  const spawnDust = (count) => {
    const x = getDinoX() + 20;
    const y = getGroundY() - 2;
    for (let i = 0; i < count; i += 1) {
      const life = 18 + Math.random() * 14;
      addParticle({
        kind: "dust",
        x: x + (Math.random() - 0.5) * 16,
        y,
        vx: -(1 + Math.random() * 2.5),
        vy: -(0.4 + Math.random() * 1.6),
        grav: 0.06,
        size: 2.5 + Math.random() * 3,
        color: "rgba(214, 170, 120, 0.85)",
        life,
        max: life
      });
    }
  };

  const spawnSparkles = (x, y, count, colors) => {
    for (let i = 0; i < count; i += 1) {
      const a = Math.random() * TAU;
      const sp = 1.5 + Math.random() * 3.5;
      const life = 22 + Math.random() * 16;
      addParticle({
        kind: i % 2 === 0 ? "spark" : "dot",
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 1,
        grav: 0.09,
        size: 3 + Math.random() * 3.5,
        color: colors[i % colors.length],
        life,
        max: life
      });
    }
  };

  const spawnRing = (x, y, color) => {
    addParticle({
      kind: "ring",
      x,
      y,
      vx: 0,
      vy: 0,
      grav: 0,
      size: 22,
      color,
      life: 20,
      max: 20
    });
  };

  const addPopup = (x, y, text, color) => {
    State.popups.push({ x, y, text, color, life: 42, max: 42 });
  };

  const launchConfetti = (count) => {
    confettiLayer.innerHTML = "";
    const colors = [CONFIG.BRAND_COLOR, "#ffc93c", "#4cc9f0", "#7bed9f", "#ffffff", CONFIG.BRAND_SECONDARY];
    for (let i = 0; i < count; i += 1) {
      const piece = document.createElement("span");
      piece.className = "dino-confetti-piece";
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = `${Math.random() * 0.7}s`;
      piece.style.animationDuration = `${1.8 + Math.random() * 1.6}s`;
      piece.style.setProperty("--dino-drift", `${(Math.random() - 0.5) * 10}em`);
      piece.style.setProperty("--dino-spin", `${360 + Math.random() * 720}deg`);
      confettiLayer.appendChild(piece);
    }
  };

  const resetGame = () => {
    State.score = 0;
    State.scoreAcc = 0;
    State.coinsRun = 0;
    State.isRunning = true;
    State.isDead = false;
    State.newRecord = false;
    State.dinoAlt = 0;
    State.dinoVy = 0;
    State.jumpCount = 0;
    State.jumpHeld = false;
    State.jumpBuffer = 0;
    State.coyote = 0;
    State.onGround = true;
    State.squash = 0;
    State.gameSpeed = CONFIG.INITIAL_SPEED;
    State.spawnIn = 0;
    State.nextDing = CONFIG.DING_EVERY;
    State.deathTimer = 0;
    State.shake = 0;
    State.flash = 0;
    State.milestoneShown = false;
    State.obstacles = [];
    State.coins = [];
    State.particles = [];
    State.popups = [];
    rewardUntil = 0;
    rewardBanner.dataset.visible = "false";
    deathScreen.dataset.state = "hidden";
    confettiLayer.innerHTML = "";
    hudTick = 0;
    updateHudDom();
  };

  const resizeCanvas = () => {
    const w = canvasWrap.clientWidth;
    const h = canvasWrap.clientHeight;
    if (w <= 0 || h <= 0) {
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    view.w = w;
    view.h = h;
    view.dpr = dpr;
    view.unit = Math.min(CONFIG.UNIT_MAX, Math.max(CONFIG.UNIT_MIN, Math.min(w, h) / CONFIG.WORLD_REF));
    view.ww = w / view.unit;
    view.wh = h / view.unit;
    view.groundRatio = h > w ? CONFIG.GROUND_Y_RATIO_PORTRAIT : CONFIG.GROUND_Y_RATIO;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.imageSmoothingEnabled = true;
  };

  const spawnObstacle = () => {
    if (State.obstacles.length >= CONFIG.MAX_OBSTACLES) {
      return 0;
    }
    const x = view.ww + 30;
    let birdChance = CONFIG.BIRD_BASE_CHANCE;
    if (State.score > 900) {
      birdChance = 0.52;
    }
    if (State.score > 1600) {
      birdChance = 0.6;
    }
    const useBird = State.score >= CONFIG.BIRD_FROM_SCORE && Math.random() < birdChance;
    if (useBird) {
      const roll = Math.random();
      let alt = 104;
      if (roll < 0.34) {
        alt = 8;
      } else if (roll < 0.67) {
        alt = 38;
      }
      State.obstacles.push({
        type: "bird",
        x,
        alt,
        width: 46,
        height: 36,
        phase: Math.random() * TAU
      });
      return 46;
    }
    if (Math.random() < CONFIG.ROCK_CHANCE) {
      State.obstacles.push({
        type: "rock",
        x,
        width: 44,
        height: 30
      });
      return 44;
    }
    const variant = 1 + Math.floor(Math.random() * 3);
    let w = 28;
    let h = 50;
    if (variant === 2) {
      w = 42;
      h = 52;
    }
    if (variant === 3) {
      w = 56;
      h = 54;
    }
    State.obstacles.push({
      type: "cactus",
      variant,
      x,
      width: w,
      height: h,
      flower: Math.random() < 0.45
    });
    return w;
  };

  const spawnCoin = () => {
    if (State.coins.length >= CONFIG.MAX_COINS) {
      return;
    }
    const alt = 48 + Math.random() * 120;
    State.coins.push({
      x: view.ww + 20,
      alt,
      phase: Math.random() * TAU,
      r: 13,
      cy: getGroundY() - alt
    });
  };

  const aabbHit = (ax, ay, aw, ah, bx, by, bw, bh, inset) => {
    const i = inset || 0;
    return (
      ax + i < bx + bw - i &&
      ax + aw - i > bx + i &&
      ay + i < by + bh - i &&
      ay + ah - i > by + i
    );
  };

  const dinoBox = () => {
    const x = getDinoX();
    const top = getGroundY() - State.dinoAlt - CONFIG.DINO_HEIGHT;
    return [
      { x: x + 7, y: top + 22, w: 27, h: 30 },
      { x: x + 25, y: top + 4, w: 21, h: 19 }
    ];
  };

  const obstacleBox = (o, gy) => {
    if (o.type === "bird") {
      const top = gy - o.alt - o.height;
      return { x: o.x + 8, y: top + 10, w: 32, h: 18 };
    }
    const top = gy - o.height;
    return { x: o.x + 5, y: top + 5, w: o.width - 10, h: o.height - 5 };
  };

  const doJump = (force, isDouble) => {
    State.dinoVy = force;
    State.onGround = false;
    State.coyote = 0;
    State.squash = 0.22;
    if (isDouble) {
      spawnRing(getDinoX() + 22, getGroundY() - State.dinoAlt - 6, "rgba(255, 255, 255, 0.9)");
      SFX.doubleJump();
    } else {
      spawnDust(5);
      SFX.jump();
    }
  };

  const tryJump = () => {
    if (State.isDead || !State.isRunning) {
      return;
    }
    const grounded = State.onGround || (State.coyote > 0 && State.jumpCount === 0);
    if (grounded) {
      doJump(CONFIG.JUMP_FORCE, false);
      State.jumpCount = 1;
      return;
    }
    const landingSoon = State.dinoVy > 0 && State.dinoAlt < State.dinoVy * CONFIG.JUMP_BUFFER_FRAMES;
    if (landingSoon || State.jumpCount >= 2) {
      State.jumpBuffer = CONFIG.JUMP_BUFFER_FRAMES;
      return;
    }
    doJump(CONFIG.DOUBLE_JUMP_FORCE, true);
    State.jumpCount = 2;
  };

  const releaseJump = () => {
    State.jumpHeld = false;
  };

  const startGame = () => {
    if (gameStarted) {
      return;
    }
    gameStarted = true;
    startScreen.dataset.state = "close";
    resetGame();
    updateOrientationUi();
    SFX.click();
  };

  const restartGame = () => {
    SFX.click();
    resetGame();
  };

  const handlePrimaryAction = () => {
    if (!document.body.contains(overlay) || overlay.dataset.state === "closing") {
      return;
    }
    if (State.isDead) {
      if (deathScreen.dataset.state === "open" && performance.now() >= State.restartReadyAt) {
        restartGame();
      }
      return;
    }
    if (!gameStarted) {
      startGame();
      return;
    }
    State.jumpHeld = true;
    tryJump();
  };

  const onGameOver = () => {
    State.isDead = true;
    State.isRunning = false;
    State.jumpHeld = false;
    State.shake = 16;
    State.flash = 0.55;
    State.squash = -0.25;
    State.deathTimer = CONFIG.DEATH_DELAY_FRAMES;
    spawnSparkles(getDinoX() + 30, getGroundY() - State.dinoAlt - 30, CONFIG.PARTICLE_BURST + 6, [CONFIG.BRAND_COLOR, "#ffffff", "#ffd166"]);
    SFX.hit();
    const { hi, totalCoins } = readStorage();
    State.newRecord = State.score > hi && hi > 0;
    if (State.score > hi) {
      writeNum(LS_HI, State.score);
      State.highScore = State.score;
    }
    const newTotal = totalCoins + State.coinsRun;
    writeNum(LS_COINS, newTotal);
    storedTotalCoins = newTotal;
    const pct = scoreToDiscount(State.score);
    const code = makeDiscountCode(State.score, pct);
    const statsEl = overlay.querySelector("#dino-death-stats");
    const totalEl = overlay.querySelector("#dino-total-coins-label");
    const pctEl = overlay.querySelector("#dino-discount-pct");
    const codeEl = overlay.querySelector("#dino-discount-code");
    const copyBtn = overlay.querySelector("#dino-copy-code");
    const badgeEl = overlay.querySelector("#dino-death-badge");
    statsEl.innerHTML = `
      <div class="dino-stat"><span>Skor</span><strong>${State.score}</strong></div>
      <div class="dino-stat"><span>En İyi</span><strong>${State.highScore}</strong></div>
      <div class="dino-stat"><span>Bu Tur</span><strong>₺ ${State.coinsRun}</strong></div>
    `;
    totalEl.textContent = `Toplam toplanan: ₺ ${storedTotalCoins}`;
    pctEl.textContent = `Skoruna göre %${pct} indirim kazandın!`;
    codeEl.textContent = code;
    copyBtn.dataset.copied = "false";
    copyBtn.textContent = "Kopyala";
    badgeEl.dataset.visible = State.newRecord ? "true" : "false";
    startBestEl.textContent = `En iyi skorun: ${State.highScore}`;
    updateHudDom();
  };

  const showDeathScreen = () => {
    deathScreen.dataset.state = "open";
    State.restartReadyAt = performance.now() + 450;
    launchConfetti(State.newRecord ? 64 : 34);
    SFX.over();
  };

  const checkMilestones = () => {
    if (!State.milestoneShown && State.score >= CONFIG.REWARD_MILESTONE) {
      State.milestoneShown = true;
      rewardBanner.dataset.visible = "true";
      rewardUntil = performance.now() + 3000;
      spawnSparkles(getDinoX() + 24, getGroundY() - State.dinoAlt - 40, CONFIG.PARTICLE_BURST + 8, ["#ffd166", "#ffffff", CONFIG.BRAND_COLOR]);
      SFX.reward();
    }
    if (rewardUntil && performance.now() > rewardUntil) {
      rewardBanner.dataset.visible = "false";
      rewardUntil = 0;
    }
    if (State.score >= State.nextDing) {
      State.nextDing += CONFIG.DING_EVERY;
      pulseScore();
      if (State.score < CONFIG.REWARD_MILESTONE || State.score >= CONFIG.REWARD_MILESTONE + CONFIG.DING_EVERY) {
        SFX.ding();
      }
    }
  };

  const updateDino = (k) => {
    const wasGround = State.onGround;
    State.dinoVy += CONFIG.GRAVITY * k;
    if (!State.jumpHeld && State.jumpCount === 1 && State.dinoVy < CONFIG.JUMP_CUT) {
      State.dinoVy = CONFIG.JUMP_CUT;
    }
    State.dinoAlt -= State.dinoVy * k;
    if (State.dinoAlt <= 0) {
      State.dinoAlt = 0;
      State.dinoVy = 0;
      State.jumpCount = 0;
      State.onGround = true;
      State.coyote = CONFIG.COYOTE_FRAMES;
      if (!wasGround) {
        State.squash = -0.24;
        spawnDust(6);
        SFX.land();
      }
      if (State.jumpBuffer > 0) {
        State.jumpBuffer = 0;
        tryJump();
      }
    } else {
      State.onGround = false;
      State.coyote = Math.max(0, State.coyote - k);
    }
    State.jumpBuffer = Math.max(0, State.jumpBuffer - k);
  };

  const updateEffects = (k) => {
    for (let i = State.particles.length - 1; i >= 0; i -= 1) {
      const p = State.particles[i];
      p.vy += p.grav * k;
      p.x += p.vx * k;
      p.y += p.vy * k;
      p.life -= k;
      if (p.life <= 0) {
        State.particles.splice(i, 1);
      }
    }
    for (let i = State.popups.length - 1; i >= 0; i -= 1) {
      const p = State.popups[i];
      p.y -= 0.9 * k;
      p.life -= k;
      if (p.life <= 0) {
        State.popups.splice(i, 1);
      }
    }
    State.shake = Math.max(0, State.shake - 0.8 * k);
    State.flash = Math.max(0, State.flash - 0.04 * k);
    State.squash *= Math.pow(0.82, k);
  };

  const update = (k) => {
    State.clock += k;
    updateEffects(k);
    if (!gameStarted) {
      State.distance += 2.2 * k;
      State.runAnim += 0.22 * k;
      return;
    }
    if (State.isDead) {
      if (State.deathTimer > 0) {
        State.deathTimer -= k;
        if (State.deathTimer <= 0) {
          showDeathScreen();
        }
      }
      return;
    }
    if (!State.isRunning) {
      return;
    }

    State.scoreAcc += k;
    State.score = Math.floor(State.scoreAcc);
    const ramp = 1 + State.score * 0.00012;
    State.gameSpeed = Math.min(
      CONFIG.MAX_SPEED,
      State.gameSpeed + CONFIG.SPEED_INCREMENT * ramp * k
    );
    checkMilestones();
    updateDino(k);
    State.distance += State.gameSpeed * k;
    State.runAnim += State.gameSpeed * 0.035 * k;

    State.spawnIn -= State.gameSpeed * k;
    if (State.spawnIn <= 0) {
      State.spawnIn = spawnObstacle() + getObstacleGap() * (1 + Math.random() * CONFIG.GAP_RANDOM);
    }

    if (Math.random() < CONFIG.COIN_SPAWN_CHANCE * k) {
      spawnCoin();
    }

    const gy = getGroundY();
    for (let i = State.obstacles.length - 1; i >= 0; i -= 1) {
      const o = State.obstacles[i];
      o.x -= (State.gameSpeed + (o.type === "bird" ? 1.2 : 0)) * k;
      if (o.x + o.width < -40) {
        State.obstacles.splice(i, 1);
      }
    }

    for (let i = State.coins.length - 1; i >= 0; i -= 1) {
      const c = State.coins[i];
      c.x -= State.gameSpeed * k;
      c.cy = gy - c.alt + Math.sin(State.clock * 0.05 + c.phase) * 14;
      if (c.x + c.r < -20) {
        State.coins.splice(i, 1);
      }
    }

    if (State.onGround && Math.random() < 0.2 * k) {
      spawnDust(1);
    }

    const boxes = dinoBox();
    for (let i = 0; i < State.obstacles.length; i += 1) {
      const ob = obstacleBox(State.obstacles[i], gy);
      for (let j = 0; j < boxes.length; j += 1) {
        const b = boxes[j];
        if (aabbHit(b.x, b.y, b.w, b.h, ob.x, ob.y, ob.w, ob.h, 0)) {
          onGameOver();
          return;
        }
      }
    }

    for (let i = State.coins.length - 1; i >= 0; i -= 1) {
      const c = State.coins[i];
      const hit = boxes.some((b) => aabbHit(b.x, b.y, b.w, b.h, c.x - c.r, c.cy - c.r, c.r * 2, c.r * 2, -4));
      if (hit) {
        State.scoreAcc += 10;
        State.score = Math.floor(State.scoreAcc);
        State.coinsRun += 1;
        spawnSparkles(c.x, c.cy, CONFIG.PARTICLE_BURST, ["#ffd166", "#fff3b0", "#ffb703"]);
        addPopup(c.x, c.cy - 16, "+10", "#ffd166");
        SFX.coin();
        State.coins.splice(i, 1);
      }
    }

    hudTick += 1;
    if (hudTick % 3 === 0) {
      updateHudDom();
    }
  };

  const roundRectPath = (x, y, w, h, r) => {
    const rad = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
    ctx.lineTo(x + w, y + h - rad);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    ctx.lineTo(x + rad, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
    ctx.lineTo(x, y + rad);
    ctx.quadraticCurveTo(x, y, x + rad, y);
    ctx.closePath();
  };

  const drawRoundedRect = (x, y, w, h, r) => {
    roundRectPath(x, y, w, h, r);
    ctx.fill();
  };

  const ridgeNoise = (xw, f1, f2, sharp) => {
    if (sharp) {
      return (1 - Math.abs(Math.sin(xw * f1))) * 0.7 + (1 - Math.abs(Math.sin(xw * f2 + 1.7))) * 0.3;
    }
    return (0.5 + 0.5 * Math.sin(xw * f1)) * 0.65 + (0.5 + 0.5 * Math.sin(xw * f2 + 2.1)) * 0.35;
  };

  const drawRidge = (W, gy, layer, fill, edge) => {
    ctx.beginPath();
    ctx.moveTo(-40, gy + 4);
    for (let x = -40; x <= W + 40; x += 10) {
      ctx.lineTo(x, gy - layer.lift - layer.amp * ridgeNoise(x + layer.offset, layer.f1, layer.f2, layer.sharp));
    }
    ctx.lineTo(W + 40, gy + 4);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (edge) {
      ctx.strokeStyle = edge;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  const drawSun = (x, y, a) => {
    ctx.globalAlpha = a;
    const glow = ctx.createRadialGradient(x, y, 20, x, y, 120);
    glow.addColorStop(0, "rgba(255, 220, 130, 0.6)");
    glow.addColorStop(1, "rgba(255, 220, 130, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, 120, 0, TAU);
    ctx.fill();
    const disk = ctx.createRadialGradient(x - 8, y - 8, 4, x, y, 32);
    disk.addColorStop(0, "#fffbe0");
    disk.addColorStop(0.6, "#ffd166");
    disk.addColorStop(1, "#ffab40");
    ctx.fillStyle = disk;
    ctx.beginPath();
    ctx.arc(x, y, 32, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  const drawMoon = (x, y, a) => {
    ctx.globalAlpha = a;
    const glow = ctx.createRadialGradient(x, y, 16, x, y, 100);
    glow.addColorStop(0, "rgba(200, 210, 255, 0.4)");
    glow.addColorStop(1, "rgba(200, 210, 255, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, 100, 0, TAU);
    ctx.fill();
    const disk = ctx.createRadialGradient(x - 8, y - 8, 4, x, y, 26);
    disk.addColorStop(0, "#ffffff");
    disk.addColorStop(1, "#cfd3f0");
    ctx.fillStyle = disk;
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(140, 145, 190, 0.35)";
    ctx.beginPath();
    ctx.arc(x - 8, y - 4, 5, 0, TAU);
    ctx.arc(x + 9, y + 7, 3.5, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 6, y - 10, 2.5, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  const drawSky = (W, gy, nf) => {
    const g = ctx.createLinearGradient(0, 0, 0, gy);
    g.addColorStop(0, mixColor("skyTop", nf));
    g.addColorStop(1, mixColor("skyBottom", nf));
    ctx.fillStyle = g;
    ctx.fillRect(-40, -40, W + 80, gy + 48);
    if (nf > 0.02) {
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 70; i += 1) {
        const sx = hash(i + 0.5) * W;
        const sy = hash(i + 50.5) * Math.max(40, gy - 160);
        const size = 0.8 + hash(i + 90.5) * 1.6;
        ctx.globalAlpha = nf * (0.55 + 0.45 * Math.sin(State.clock * 0.06 + i * 1.7));
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    const orbX = W * 0.78;
    const orbY = Math.max(70, gy - 330);
    if (nf < 0.99) {
      drawSun(orbX, orbY + nf * 300, 1 - nf);
    }
    if (nf > 0.01) {
      drawMoon(orbX - 30, orbY + (1 - nf) * 300, nf);
    }
  };

  const drawCloud = (x, y, s, nf) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    const g = ctx.createLinearGradient(0, -36, 0, 12);
    g.addColorStop(0, mixColor("cloud", nf));
    g.addColorStop(1, mixColor("cloudShade", nf));
    ctx.fillStyle = g;
    drawRoundedRect(-46, -6, 96, 18, 9);
    const puffs = [[-26, -4, 16], [-6, -16, 22], [18, -10, 18], [36, -2, 12]];
    for (let i = 0; i < puffs.length; i += 1) {
      ctx.beginPath();
      ctx.arc(puffs[i][0], puffs[i][1], puffs[i][2], 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.beginPath();
    ctx.ellipse(-10, -26, 10, 4, -0.2, 0, TAU);
    ctx.fill();
    ctx.restore();
  };

  const drawClouds = (W, gy, nf) => {
    const tile = 320;
    const offset = State.distance * 0.08 + State.clock * 0.25;
    const first = Math.floor(offset / tile) - 1;
    const count = Math.ceil(W / tile) + 3;
    const top = Math.max(40, gy - 440);
    const span = Math.max(60, gy - 270 - top);
    for (let i = 0; i < count; i += 1) {
      const idx = first + i;
      if (hash(idx * 3.1) < 0.3) {
        continue;
      }
      const x = idx * tile - offset + hash(idx + 5) * 120;
      const y = top + hash(idx + 9) * span;
      drawCloud(x, y, 0.6 + hash(idx + 13) * 0.7, nf);
    }
  };

  const drawDuneCacti = (W, gy, layer, color) => {
    const tile = 210;
    const first = Math.floor(layer.offset / tile) - 1;
    const count = Math.ceil(W / tile) + 3;
    ctx.fillStyle = color;
    for (let i = 0; i < count; i += 1) {
      const idx = first + i;
      if (hash(idx * 1.37 + 4) < 0.55) {
        continue;
      }
      const x = idx * tile - layer.offset + hash(idx + 2) * 120;
      const base = gy - layer.lift - layer.amp * ridgeNoise(x + layer.offset, layer.f1, layer.f2, layer.sharp) + 3;
      const h = 16 + hash(idx + 6) * 20;
      drawRoundedRect(x - 3, base - h, 6, h, 3);
      drawRoundedRect(x - 9, base - h * 0.7, 4, h * 0.35, 2);
      drawRoundedRect(x - 9, base - h * 0.4, 8, 4, 2);
      drawRoundedRect(x + 5, base - h * 0.82, 4, h * 0.38, 2);
      drawRoundedRect(x + 1, base - h * 0.48, 8, 4, 2);
    }
  };

  const drawBackground = (W, gy, nf) => {
    drawSky(W, gy, nf);
    drawClouds(W, gy, nf);
    const mountains = { offset: State.distance * 0.06, amp: 200, lift: 30, f1: 0.0045, f2: 0.011, sharp: true };
    const mg = ctx.createLinearGradient(0, gy - 230, 0, gy);
    mg.addColorStop(0, mixColor("mountain", nf));
    mg.addColorStop(1, mixColor("mountainLow", nf));
    drawRidge(W, gy, mountains, mg, null);
    const haze = ctx.createLinearGradient(0, gy - 140, 0, gy);
    haze.addColorStop(0, mixColor("skyBottom", nf, 0));
    haze.addColorStop(1, mixColor("skyBottom", nf, 0.55));
    ctx.fillStyle = haze;
    ctx.fillRect(-40, gy - 140, W + 80, 144);
    const hills = { offset: State.distance * 0.22, amp: 70, lift: 6, f1: 0.0065, f2: 0.017, sharp: false };
    const hg = ctx.createLinearGradient(0, gy - 80, 0, gy);
    hg.addColorStop(0, mixColor("hill", nf));
    hg.addColorStop(1, mixColor("hillLow", nf));
    drawRidge(W, gy, hills, hg, "rgba(255, 255, 255, 0.18)");
    const near = { offset: State.distance * 0.45, amp: 26, lift: 0, f1: 0.012, f2: 0.031, sharp: false };
    drawDuneCacti(W, gy, near, mixColor("nearDark", nf));
    drawRidge(W, gy, near, mixColor("near", nf), "rgba(255, 255, 255, 0.14)");
  };

  const drawGround = (W, H, gy, nf) => {
    const depth = Math.max(10, H - gy);
    const g = ctx.createLinearGradient(0, gy, 0, H);
    g.addColorStop(0, mixColor("sandTop", nf));
    g.addColorStop(Math.min(1, 26 / depth), mixColor("sand", nf));
    g.addColorStop(1, mixColor("dirt", nf));
    ctx.fillStyle = g;
    ctx.fillRect(-40, gy, W + 80, depth + 40);
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillRect(-40, gy - 1, W + 80, 2.5);
    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    ctx.fillRect(-40, gy + 4, W + 80, 3);
    const dist = State.distance;
    ctx.strokeStyle = "rgba(90, 55, 25, 0.16)";
    ctx.lineWidth = 2;
    ctx.setLineDash([24, 30]);
    ctx.lineDashOffset = dist % 54;
    ctx.beginPath();
    ctx.moveTo(-40, gy + 16);
    ctx.lineTo(W + 40, gy + 16);
    ctx.stroke();
    ctx.setLineDash([10, 42]);
    ctx.lineDashOffset = (dist + 20) % 52;
    ctx.beginPath();
    ctx.moveTo(-40, gy + 30);
    ctx.lineTo(W + 40, gy + 30);
    ctx.stroke();
    ctx.setLineDash([]);
    const tile = 38;
    const first = Math.floor(dist / tile) - 1;
    const count = Math.ceil(W / tile) + 3;
    const grass = mixColor("grass", nf);
    for (let i = 0; i < count; i += 1) {
      const idx = first + i;
      const x = idx * tile - dist;
      const r1 = hash(idx);
      if (r1 > 0.45) {
        const px = x + hash(idx + 1) * tile;
        const py = gy + 10 + hash(idx + 2) * Math.min(depth - 14, 110);
        const rx = 1.6 + hash(idx + 3) * 3.4;
        ctx.fillStyle = "rgba(90, 60, 40, 0.35)";
        ctx.beginPath();
        ctx.ellipse(px, py, rx, rx * 0.62, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
        ctx.beginPath();
        ctx.ellipse(px - rx * 0.3, py - rx * 0.25, rx * 0.45, rx * 0.25, 0, 0, TAU);
        ctx.fill();
      }
      if (r1 < 0.2) {
        const tx = x + hash(idx + 4) * tile;
        const th = 5 + hash(idx + 5) * 5;
        ctx.strokeStyle = grass;
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(tx, gy + 1);
        ctx.lineTo(tx - 3, gy - th);
        ctx.moveTo(tx + 2, gy + 1);
        ctx.lineTo(tx + 2, gy - th - 2);
        ctx.moveTo(tx + 4, gy + 1);
        ctx.lineTo(tx + 7, gy - th + 1);
        ctx.stroke();
        ctx.lineCap = "butt";
      }
    }
  };

  const cactusGradient = (x, w) => {
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, "#2c7a3b");
    g.addColorStop(0.35, "#64c35f");
    g.addColorStop(0.65, "#46a54b");
    g.addColorStop(1, "#1f5c2c");
    return g;
  };

  const drawCactusPillar = (x, bottom, w, h) => {
    const r = w / 2;
    ctx.beginPath();
    ctx.moveTo(x, bottom);
    ctx.lineTo(x, bottom - h + r);
    ctx.arc(x + r, bottom - h + r, r, Math.PI, 0);
    ctx.lineTo(x + w, bottom);
    ctx.closePath();
    ctx.fillStyle = cactusGradient(x, w);
    ctx.fill();
    ctx.strokeStyle = "#17451f";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.strokeStyle = "rgba(20, 70, 30, 0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.4, bottom - h + r * 0.9);
    ctx.lineTo(x + w * 0.4, bottom - 1);
    ctx.moveTo(x + w * 0.7, bottom - h + r * 1.1);
    ctx.lineTo(x + w * 0.7, bottom - 1);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = Math.max(1, w * 0.13);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + w * 0.24, bottom - h + r * 1.1);
    ctx.lineTo(x + w * 0.24, bottom - h * 0.45);
    ctx.stroke();
    ctx.lineCap = "butt";
    ctx.strokeStyle = "#fff7d6";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    for (let yy = bottom - h + r + 3; yy < bottom - 4; yy += 7) {
      ctx.moveTo(x + 0.5, yy);
      ctx.lineTo(x - 2.2, yy - 1.6);
      ctx.moveTo(x + w - 0.5, yy + 3);
      ctx.lineTo(x + w + 2.2, yy + 1.4);
    }
    ctx.stroke();
  };

  const drawCactusArm = (trunkX, trunkW, joinY, dir, reach, up, t) => {
    const armX = dir < 0 ? trunkX - reach - t : trunkX + trunkW + reach;
    drawCactusPillar(armX, joinY - t * 0.5, t, up);
    const cx0 = dir < 0 ? armX : trunkX + trunkW - 2;
    const cx1 = dir < 0 ? trunkX + 2 : armX + t;
    const cg = ctx.createLinearGradient(0, joinY - t, 0, joinY);
    cg.addColorStop(0, "#5cbf5a");
    cg.addColorStop(1, "#2a6f36");
    ctx.fillStyle = cg;
    roundRectPath(cx0, joinY - t, cx1 - cx0, t, t / 2);
    ctx.fill();
    ctx.strokeStyle = "#17451f";
    ctx.lineWidth = 1.2;
    ctx.stroke();
  };

  const drawFlower = (x, y) => {
    ctx.fillStyle = "#ff6fa5";
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * TAU - Math.PI / 2;
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(a) * 3, y + Math.sin(a) * 3, 2.6, 1.8, a, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = "#ffd23f";
    ctx.beginPath();
    ctx.arc(x, y, 1.8, 0, TAU);
    ctx.fill();
  };

  const drawCactus = (o, gy) => {
    const x = o.x;
    const h = o.height;
    if (o.variant === 1) {
      const tx = x + 8.5;
      drawCactusArm(tx, 11, gy - 20, -1, 2.5, 15, 6);
      drawCactusArm(tx, 11, gy - 28, 1, 2.5, 12, 6);
      drawCactusPillar(tx, gy, 11, h);
      if (o.flower) {
        drawFlower(tx + 5.5, gy - h + 1);
      }
    } else if (o.variant === 2) {
      drawCactusArm(x + 20, 11, gy - 22, 1, 2, 11, 6);
      drawCactusPillar(x + 20, gy, 11, 40);
      drawCactusPillar(x + 2, gy, 13, h);
      if (o.flower) {
        drawFlower(x + 8.5, gy - h + 1);
      }
    } else {
      drawCactusPillar(x + 1, gy, 10, 38);
      drawCactusPillar(x + 45, gy, 10, 34);
      drawCactusArm(x + 21, 14, gy - 30, -1, 2, 13, 6);
      drawCactusArm(x + 21, 14, gy - 36, 1, 2, 12, 6);
      drawCactusPillar(x + 21, gy, 14, h);
      if (o.flower) {
        drawFlower(x + 28, gy - h + 1);
      }
    }
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.beginPath();
    ctx.ellipse(x + o.width / 2, gy + 1.5, o.width / 2 + 3, 3, 0, 0, TAU);
    ctx.fill();
  };

  const drawRock = (o, gy) => {
    const x = o.x;
    const w = o.width;
    const h = o.height;
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, gy + 1.5, w / 2 + 4, 3.5, 0, 0, TAU);
    ctx.fill();
    const g = ctx.createLinearGradient(0, gy - h, 0, gy);
    g.addColorStop(0, "#b3a79c");
    g.addColorStop(1, "#5d534d");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x + 1, gy);
    ctx.lineTo(x + 4, gy - h * 0.55);
    ctx.quadraticCurveTo(x + 9, gy - h, x + w * 0.45, gy - h);
    ctx.quadraticCurveTo(x + w * 0.85, gy - h * 0.98, x + w - 2, gy - h * 0.4);
    ctx.lineTo(x + w, gy);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#3e3632";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.strokeStyle = "rgba(50, 40, 35, 0.55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.5, gy - h * 0.9);
    ctx.lineTo(x + w * 0.42, gy - h * 0.55);
    ctx.lineTo(x + w * 0.55, gy - h * 0.3);
    ctx.moveTo(x + w * 0.72, gy - h * 0.6);
    ctx.lineTo(x + w * 0.82, gy - h * 0.35);
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.ellipse(x + w * 0.32, gy - h * 0.72, w * 0.14, h * 0.1, -0.5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(120, 160, 70, 0.75)";
    ctx.beginPath();
    ctx.ellipse(x + w * 0.62, gy - h * 0.96, 5, 2, 0.1, 0, TAU);
    ctx.fill();
  };

  const drawWing = (px, py, angle, fill) => {
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle);
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.quadraticCurveTo(0, -20, 18, -25);
    ctx.quadraticCurveTo(14, -10, 9, 3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#2b1660";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.moveTo(-1, -3);
    ctx.lineTo(10, -17);
    ctx.moveTo(3, 0);
    ctx.lineTo(12, -9);
    ctx.stroke();
    ctx.restore();
  };

  const drawBird = (o, gy) => {
    const top = gy - o.alt - o.height;
    const cx = o.x + 26;
    const cy = top + 20;
    const flap = Math.sin(State.clock * 0.32 + o.phase);
    const wingAngle = flap * 0.9 + 0.4;
    ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
    ctx.beginPath();
    ctx.ellipse(cx, gy + 1.5, 16, 3, 0, 0, TAU);
    ctx.fill();
    drawWing(cx + 2, cy - 3, wingAngle - 0.25, "#4a2a8a");
    ctx.fillStyle = "#5b35a8";
    ctx.beginPath();
    ctx.moveTo(cx + 14, cy - 2);
    ctx.lineTo(cx + 27, cy - 8);
    ctx.lineTo(cx + 23, cy + 1);
    ctx.lineTo(cx + 28, cy + 6);
    ctx.lineTo(cx + 13, cy + 4);
    ctx.closePath();
    ctx.fill();
    const bg = ctx.createLinearGradient(0, cy - 12, 0, cy + 10);
    bg.addColorStop(0, "#a77bff");
    bg.addColorStop(0.55, "#6a3fd1");
    bg.addColorStop(1, "#43238f");
    ctx.fillStyle = bg;
    ctx.strokeStyle = "#2b1660";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.ellipse(cx + 2, cy, 15, 9.5, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(244, 227, 255, 0.9)";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 9, 4.5, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#ff7a59";
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy - 11);
    ctx.lineTo(cx - 11, cy - 18);
    ctx.lineTo(cx - 10, cy - 11);
    ctx.lineTo(cx - 6, cy - 16);
    ctx.lineTo(cx - 7, cy - 9);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(cx - 13, cy - 4, 8, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffb02e";
    ctx.strokeStyle = "#b86b00";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 19, cy - 7);
    ctx.lineTo(cx - 31, cy - 3);
    ctx.lineTo(cx - 19, cy - 1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#f08c00";
    ctx.beginPath();
    ctx.moveTo(cx - 19, cy - 1);
    ctx.lineTo(cx - 27, cy);
    ctx.lineTo(cx - 19, cy + 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(cx - 15, cy - 6, 3, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#1b1b2f";
    ctx.beginPath();
    ctx.arc(cx - 16.2, cy - 6, 1.6, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#2b1660";
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 19.5, cy - 10.5);
    ctx.lineTo(cx - 12, cy - 8.5);
    ctx.stroke();
    ctx.lineCap = "butt";
    drawWing(cx + 4, cy - 2, wingAngle, "#b892ff");
  };

  const drawCoin = (c) => {
    const r = c.r;
    const sx = Math.max(0.16, Math.abs(Math.cos(State.clock * 0.09 + c.phase)));
    const glow = ctx.createRadialGradient(c.x, c.cy, r * 0.3, c.x, c.cy, r * 2.1);
    glow.addColorStop(0, "rgba(255, 214, 90, 0.45)");
    glow.addColorStop(1, "rgba(255, 214, 90, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(c.x, c.cy, r * 2.1, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.translate(c.x, c.cy);
    ctx.scale(sx, 1);
    ctx.fillStyle = "#b8730c";
    ctx.beginPath();
    ctx.arc(0, 1.8, r, 0, TAU);
    ctx.fill();
    const face = ctx.createRadialGradient(-r * 0.35, -r * 0.4, 1, 0, 0, r);
    face.addColorStop(0, "#fff6c2");
    face.addColorStop(0.45, "#ffd23f");
    face.addColorStop(1, "#e09412");
    ctx.fillStyle = face;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#a8650a";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.strokeStyle = "rgba(168, 101, 10, 0.55)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.7, 0, TAU);
    ctx.stroke();
    if (sx > 0.4) {
      ctx.fillStyle = "#a8650a";
      ctx.font = `900 ${Math.round(r * 1.15)}px "Segoe UI", Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("₺", 0, 1);
    }
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, -r * 0.45, r * 0.32, r * 0.16, -0.6, 0, TAU);
    ctx.fill();
    ctx.restore();
  };

  const drawDinoLeg = (hx, hy, angle, color) => {
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.strokeStyle = DINO_COLORS.outline;
    ctx.lineWidth = 1.3;
    roundRectPath(-3.6, -1, 7.2, 14, 3.6);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(1.8, 12.6, 5.2, 2.6, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  const drawDino = (gy) => {
    const x = getDinoX();
    const alt = State.dinoAlt;
    const air = alt > 0.5;
    const dead = State.isDead;
    const shadowScale = Math.max(0.35, 1 - alt / 220);
    ctx.fillStyle = `rgba(0, 0, 0, ${0.24 * shadowScale})`;
    ctx.beginPath();
    ctx.ellipse(x + 24, gy + 1.5, 21 * shadowScale, 4.2 * shadowScale, 0, 0, TAU);
    ctx.fill();

    const swing = dead || air ? 0 : Math.sin(State.runAnim) * 0.7;
    let backAngle = swing;
    let frontAngle = -swing;
    if (dead) {
      backAngle = 0.5;
      frontAngle = -0.3;
    } else if (air) {
      backAngle = 0.65;
      frontAngle = -0.45;
    }
    const bob = !air && !dead ? -Math.abs(Math.cos(State.runAnim)) * 1.6 : 0;
    const tilt = air && !dead ? Math.max(-0.22, Math.min(0.22, State.dinoVy * 0.016)) : 0;
    const sq = State.squash;
    const wag = Math.sin(State.runAnim * 0.5) * 2.5;

    ctx.save();
    ctx.translate(x + 24, gy - alt);
    ctx.rotate(tilt);
    ctx.scale(1 - sq * 0.45, 1 + sq);
    ctx.translate(0, bob);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    drawDinoLeg(-7, -15, backAngle, DINO_COLORS.dark);

    const bodyGrad = ctx.createLinearGradient(0, -57, 0, 0);
    bodyGrad.addColorStop(0, DINO_COLORS.light);
    bodyGrad.addColorStop(0.55, DINO_COLORS.mid);
    bodyGrad.addColorStop(1, DINO_COLORS.dark);
    ctx.strokeStyle = DINO_COLORS.outline;
    ctx.lineWidth = 1.6;

    ctx.fillStyle = DINO_COLORS.spike;
    ctx.beginPath();
    ctx.moveTo(-16, -30);
    ctx.lineTo(-21, -38);
    ctx.lineTo(-11, -36);
    ctx.closePath();
    ctx.moveTo(-10, -37);
    ctx.lineTo(-12, -46);
    ctx.lineTo(-3, -41);
    ctx.closePath();
    ctx.moveTo(-3, -40);
    ctx.lineTo(-1, -49);
    ctx.lineTo(5, -42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(-9, -33);
    ctx.quadraticCurveTo(-24, -31, -34, -42 + wag);
    ctx.quadraticCurveTo(-25, -22, -8, -19);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -27, 17, 15, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    roundRectPath(3, -45, 13, 20, 6);
    ctx.fill();

    roundRectPath(2, -57, 25, 21, 9);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = DINO_COLORS.belly;
    ctx.beginPath();
    ctx.ellipse(5, -23, 9.5, 10.5, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(200, 140, 110, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-1, -27);
    ctx.quadraticCurveTo(5, -25, 12, -27);
    ctx.moveTo(-1, -21);
    ctx.quadraticCurveTo(5, -19, 12, -21);
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.ellipse(-5, -33, 7, 3.6, -0.5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.beginPath();
    ctx.ellipse(11, -53.5, 7, 2.4, 0, 0, TAU);
    ctx.fill();

    ctx.save();
    ctx.translate(11, -27);
    ctx.rotate(air ? -0.6 : 0.5 + Math.sin(State.runAnim + 1) * 0.35);
    ctx.fillStyle = DINO_COLORS.dark;
    ctx.strokeStyle = DINO_COLORS.outline;
    ctx.lineWidth = 1.2;
    roundRectPath(-2.2, -1, 4.4, 9, 2.2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = DINO_COLORS.outline;
    if (dead) {
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(14, -52);
      ctx.lineTo(20, -46);
      ctx.moveTo(20, -52);
      ctx.lineTo(14, -46);
      ctx.stroke();
    } else if (State.clock % 220 < 7) {
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(13.5, -49);
      ctx.lineTo(21, -49);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(17, -49, 4.6, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#1b1b2f";
      ctx.beginPath();
      ctx.arc(18.6, -48.6, 2.5, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(19.5, -50, 0.95, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = DINO_COLORS.outline;
    ctx.beginPath();
    ctx.arc(25, -51.5, 0.9, 0, TAU);
    ctx.fill();
    if (dead) {
      ctx.fillStyle = "#5a1020";
      ctx.beginPath();
      ctx.ellipse(21, -40.5, 2.4, 1.8, 0, 0, TAU);
      ctx.fill();
    } else {
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(17, -41.5);
      ctx.quadraticCurveTo(21.5, -38.5, 26, -42);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(255, 120, 150, 0.55)";
    ctx.beginPath();
    ctx.ellipse(13, -42.5, 2.8, 1.7, 0, 0, TAU);
    ctx.fill();

    drawDinoLeg(6, -15, frontAngle, DINO_COLORS.mid);
    ctx.restore();
    ctx.lineCap = "butt";
    ctx.lineJoin = "miter";
  };

  const drawSparkle = (x, y, s) => {
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.quadraticCurveTo(x, y, x + s, y);
    ctx.quadraticCurveTo(x, y, x, y + s);
    ctx.quadraticCurveTo(x, y, x - s, y);
    ctx.quadraticCurveTo(x, y, x, y - s);
    ctx.fill();
  };

  const drawEffects = () => {
    for (let i = 0; i < State.particles.length; i += 1) {
      const p = State.particles[i];
      const t = Math.max(0, p.life / p.max);
      ctx.globalAlpha = t;
      if (p.kind === "ring") {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3 * t + 0.5;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size * (1.6 - t), p.size * 0.45 * (1.6 - t), 0, 0, TAU);
        ctx.stroke();
      } else if (p.kind === "spark") {
        ctx.fillStyle = p.color;
        drawSparkle(p.x, p.y, p.size * (0.5 + t * 0.6));
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.4 + t * 0.6), 0, TAU);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `900 20px "Segoe UI", Arial, sans-serif`;
    ctx.lineWidth = 4;
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(60, 30, 0, 0.7)";
    for (let i = 0; i < State.popups.length; i += 1) {
      const p = State.popups[i];
      ctx.globalAlpha = Math.min(1, (p.life / p.max) * 2);
      ctx.strokeText(p.text, p.x, p.y);
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, p.x, p.y);
    }
    ctx.globalAlpha = 1;
    ctx.lineJoin = "miter";
  };

  const render = () => {
    const W = view.ww;
    const H = view.wh;
    if (W < 2 || H < 2) {
      return;
    }
    const gy = getGroundY();
    const nf = dayNightFactor();
    const s = view.dpr * view.unit;
    const shakeX = State.shake > 0 ? (Math.random() - 0.5) * State.shake : 0;
    const shakeY = State.shake > 0 ? (Math.random() - 0.5) * State.shake : 0;
    ctx.setTransform(s, 0, 0, s, shakeX * s, shakeY * s);

    drawBackground(W, gy, nf);
    drawGround(W, H, gy, nf);

    for (let i = 0; i < State.coins.length; i += 1) {
      drawCoin(State.coins[i]);
    }

    for (let i = 0; i < State.obstacles.length; i += 1) {
      const o = State.obstacles[i];
      if (o.type === "cactus") {
        drawCactus(o, gy);
      } else if (o.type === "rock") {
        drawRock(o, gy);
      } else {
        drawBird(o, gy);
      }
    }

    drawDino(gy);
    drawEffects();

    if (nf > 0) {
      ctx.fillStyle = `rgba(12, 16, 48, ${nf * 0.18})`;
      ctx.fillRect(-40, -40, W + 80, H + 80);
    }
    if (State.flash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${State.flash})`;
      ctx.fillRect(-40, -40, W + 80, H + 80);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  };

  const loop = (ts) => {
    if (!document.body.contains(overlay)) {
      rafId = null;
      return;
    }
    const delta = lastFrameTs ? ts - lastFrameTs : 16.667;
    lastFrameTs = ts;
    const k = Math.min(2.5, Math.max(0.25, delta / 16.667));
    update(k);
    render();
    rafId = requestAnimationFrame(loop);
  };

  const startLoop = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    lastFrameTs = 0;
    rafId = requestAnimationFrame(loop);
  };

  const updateOrientationUi = () => {
    const narrow = Math.min(window.innerWidth, window.innerHeight);
    const portrait = window.innerWidth < window.innerHeight;
    if (narrow < 768 && portrait && !gameStarted) {
      orientLayer.dataset.state = "portrait";
    } else {
      orientLayer.dataset.state = "landscape";
    }
  };

  const onResize = () => {
    if (resizeRaf !== null) {
      cancelAnimationFrame(resizeRaf);
    }
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = null;
      resizeCanvas();
      updateOrientationUi();
    });
  };

  const fallbackCopy = (txt) => {
    const ta = document.createElement("textarea");
    ta.value = txt;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch (err) {}
    ta.remove();
  };

  const initGame = () => {
    if (document.querySelector("#dino-game-overlay")) {
      return;
    }
    document.head.appendChild(styleEl);
    document.body.appendChild(overlay);
    storedTotalCoins = readStorage().totalCoins;
    startBestEl.textContent = `En iyi skorun: ${State.highScore}`;
    updateHudDom();
    resizeCanvas();

    onKeyDownRef = (e) => {
      const isJumpKey = e.code === "Space" || e.key === " " || e.code === "ArrowUp" || e.key === "ArrowUp";
      if (!isJumpKey) {
        return;
      }
      e.preventDefault();
      if (e.repeat) {
        return;
      }
      handlePrimaryAction();
    };
    onKeyUpRef = (e) => {
      if (e.code === "Space" || e.key === " " || e.code === "ArrowUp" || e.key === "ArrowUp") {
        releaseJump();
      }
    };
    onCanvasPointerDownRef = (e) => {
      if (e.button > 0) {
        return;
      }
      e.preventDefault();
      handlePrimaryAction();
    };
    onPointerUpRef = () => {
      releaseJump();
    };
    window.addEventListener("keydown", onKeyDownRef);
    window.addEventListener("keyup", onKeyUpRef);
    canvas.addEventListener("pointerdown", onCanvasPointerDownRef);
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    window.addEventListener("pointerup", onPointerUpRef);
    window.addEventListener("pointercancel", onPointerUpRef);

    startBtn.addEventListener(
      "click",
      () => {
        try {
          const _vlc = "<%VLSendClickFunc%>";
          if (_vlc.indexOf("<%") === -1) {
            new Function(_vlc)();
          }
        } catch (e) {}
        startGame();
      },
      { once: true }
    );

    onPlayAgainRef = () => {
      if (State.isDead && deathScreen.dataset.state === "open") {
        restartGame();
      }
    };
    overlay.querySelector("#dino-play-again").addEventListener("click", onPlayAgainRef);

    soundBtn.addEventListener("click", () => {
      audio.muted = !audio.muted;
      soundBtn.dataset.muted = audio.muted ? "true" : "false";
      SFX.click();
    });

    onDeathScreenClickRef = (e) => {
      const t = e.target;
      if (!t || t.id !== "dino-copy-code") {
        return;
      }
      const codeNode = overlay.querySelector("#dino-discount-code");
      const txt = codeNode ? codeNode.textContent : "";
      const markCopied = () => {
        t.dataset.copied = "true";
        t.textContent = "Kopyalandı";
        SFX.coin();
        setTimeout(() => {
          if (document.body.contains(t)) {
            t.dataset.copied = "false";
            t.textContent = "Kopyala";
          }
        }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(markCopied).catch(() => {
          fallbackCopy(txt);
          markCopied();
        });
      } else {
        fallbackCopy(txt);
        markCopied();
      }
    };
    deathScreen.addEventListener("click", onDeathScreenClickRef);
    startLoop();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    updateOrientationUi();
    overlay.dataset.state = "open";
    if (!impressionFired) {
      impressionFired = true;
      try {
        const _vli = "<%VLSendImpressionFunc%>";
        if (_vli.indexOf("<%") === -1) {
          new Function(_vli)();
        }
      } catch (e) {}
    }
  };

  const teardown = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (resizeRaf !== null) {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = null;
    }
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onResize);
    if (onKeyDownRef) {
      window.removeEventListener("keydown", onKeyDownRef);
      onKeyDownRef = null;
    }
    if (onKeyUpRef) {
      window.removeEventListener("keyup", onKeyUpRef);
      onKeyUpRef = null;
    }
    if (onCanvasPointerDownRef) {
      canvas.removeEventListener("pointerdown", onCanvasPointerDownRef);
      onCanvasPointerDownRef = null;
    }
    if (onPointerUpRef) {
      window.removeEventListener("pointerup", onPointerUpRef);
      window.removeEventListener("pointercancel", onPointerUpRef);
      onPointerUpRef = null;
    }
    if (onDeathScreenClickRef) {
      deathScreen.removeEventListener("click", onDeathScreenClickRef);
      onDeathScreenClickRef = null;
    }
    if (onPlayAgainRef) {
      const playAgainBtn = overlay.querySelector("#dino-play-again");
      if (playAgainBtn) {
        playAgainBtn.removeEventListener("click", onPlayAgainRef);
      }
      onPlayAgainRef = null;
    }
    if (audio.ctx) {
      try {
        audio.ctx.close();
      } catch (e) {}
      audio.ctx = null;
    }
    overlay.remove();
    if (styleEl.parentNode) {
      styleEl.remove();
    }
  };

  const onOverlayAnimEnd = (e) => {
    if (e.target !== overlay || overlay.dataset.state !== "closing") {
      return;
    }
    overlay.removeEventListener("animationend", onOverlayAnimEnd);
    teardown();
  };

  const closeGame = () => {
    if (overlay.dataset.state === "closing") {
      return;
    }
    overlay.dataset.state = "closing";
    overlay.addEventListener("animationend", onOverlayAnimEnd);
  };

  initGame();

  closeBtn.addEventListener("click", closeGame);

})();
