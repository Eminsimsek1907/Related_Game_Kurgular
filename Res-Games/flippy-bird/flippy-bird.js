const initFlippyBird = () => {
  if (document.querySelector("#flippyBirdCanvas")) {
    return;
  }
    const CONFIG = {
      worldHeight: 640,
      groundHeight: 92,
      maxStep: 1 / 120,
      gravity: 1500,
      flapStrength: 470,
      maxFallSpeed: 720,
      birdRadius: 17,
      birdHitboxScale: 0.78,
      birdXRatio: 0.3,
      birdXMax: 190,
      pipeWidth: 66,
      pipeCapHeight: 26,
      pipeCapOverhang: 5,
      pipeSpawnWide: 245,
      pipeSpawnTight: 185,
      spawnEaseMaxScore: 95,
      baseGap: 184,
      minGap: 132,
      gapEaseMaxScore: 150,
      gapMargin: 64,
      maxGapShift: 170,
      basePipeSpeed: 145,
      speedPerScore: 0.75,
      maxPipeSpeed: 260,
      speedEaseMaxScore: 110,
      coinRadius: 11,
      coinValue: 5,
      powerUpChance: 0.2,
      powerUpRadius: 15,
      magnetStrength: 320,
      magnetRange: 170,
      effectDurationMs: 5000,
      particleFlapCount: 6,
      starCount: 60,
      bobSpeed: 3,
      bobAmp: 10,
      blinkSpeed: 2.8,
      deathGravity: 1700,
      resultDelayMs: 900,
      hudFontPx: 36,
      hudSmallPx: 13,
      passScoreInterval: 1,
      masterVolume: 0.8,
      cloudTile: 900,
      cityTile: 560,
      uiFont: '"Trebuchet MS", "Segoe UI", system-ui, sans-serif',
      pixelFont: '"Press Start 2P", monospace',
      nightStartScore: 110,
      nightFadeScore: 70,
      skyStops: [
        { score: 0, top: [78, 186, 236], bot: [200, 238, 252] },
        { score: 60, top: [112, 158, 226], bot: [255, 208, 160] },
        { score: 120, top: [92, 62, 140], bot: [255, 140, 110] },
        { score: 180, top: [14, 20, 56], bot: [50, 46, 108] },
      ],
      powerColors: {
        shield: [52, 152, 219],
        slowMo: [155, 89, 182],
        magnet: [231, 76, 60],
      },
      effectLabels: {
        shield: "Kalkan",
        slowMo: "Yavaş",
        magnet: "Mıknatıs",
      },
      rewards: [
        { min: 0, title: "Çırak Kanat", discount: "%5", code: "KANAT5", colors: ["#eef5fb", "#a9bfd1", "#5f7789"] },
        { min: 20, title: "Bronz Madalya", discount: "%10", code: "KANAT10", colors: ["#ffd3a8", "#d98a4a", "#7f4219"] },
        { min: 50, title: "Gümüş Madalya", discount: "%15", code: "KANAT15", colors: ["#ffffff", "#c9d3dc", "#6f7c88"] },
        { min: 100, title: "Altın Madalya", discount: "%20", code: "KANAT20", colors: ["#fff6b0", "#ffcc33", "#a87808"] },
        { min: 180, title: "Platin Madalya", discount: "%25", code: "KANAT25", colors: ["#f2fffd", "#9fe8e0", "#2f817c"] },
      ],
      confettiColors: ["#ffd54a", "#ff7a4d", "#4fc3f7", "#7be36a", "#c58bff", "#ffffff"],
      confettiCount: 22,
    };

    const styleEl = document.createElement("style");
    styleEl.id = "flippyBirdStyle";
    styleEl.textContent = `
@import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");
#flippyBirdRoot {
position: fixed;
inset: 0;
z-index: 2147483000;
display: flex;
align-items: center;
justify-content: center;
margin: 0;
padding: 0;
overflow: hidden;
touch-action: none;
user-select: none;
-webkit-user-select: none;
background: rgba(6, 10, 26, 0.78);
font-family: "Trebuchet MS", "Segoe UI", system-ui, sans-serif;
animation: fbFadeIn 0.3s ease-out both;
}
#flippyBirdRoot[data-state="closing"] {
animation: fbFadeOut 0.28s ease-in forwards;
}
#flippyBirdRoot *,
#flippyBirdRoot *::before,
#flippyBirdRoot *::after {
box-sizing: border-box;
}
.fb-stage {
position: relative;
width: 100%;
height: 100%;
overflow: hidden;
font-size: 16px;
background: #4ebaec;
animation: fbStageIn 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.15) both;
}
#flippyBirdCanvas {
display: block;
width: 100%;
height: 100%;
touch-action: none;
cursor: pointer;
-webkit-tap-highlight-color: transparent;
}
#flippyBirdCanvas[data-shake="true"] {
animation: fbShake 0.42s ease-out;
}
.fb-flash {
position: absolute;
inset: 0;
z-index: 2;
background: #ffffff;
opacity: 0;
pointer-events: none;
}
.fb-flash[data-active="true"] {
animation: fbFlash 0.35s ease-out;
}
.fb-close {
position: absolute;
top: calc(0.7em + env(safe-area-inset-top, 0px));
right: 0.7em;
z-index: 6;
display: flex;
align-items: center;
justify-content: center;
width: 2.4em;
height: 2.4em;
padding: 0;
border: 0.14em solid rgba(255, 255, 255, 0.85);
border-radius: 50%;
background: rgba(20, 28, 60, 0.45);
color: #ffffff;
cursor: pointer;
touch-action: manipulation;
-webkit-tap-highlight-color: transparent;
}
.fb-close svg {
width: 1.1em;
height: 1.1em;
}
.fb-close:active {
transform: scale(0.92);
}
.fb-screen {
position: absolute;
inset: 0;
z-index: 3;
display: flex;
align-items: center;
justify-content: center;
padding: 3.4em 1em 1.2em;
overflow-x: hidden;
overflow-y: auto;
background: radial-gradient(circle at 50% 40%, rgba(10, 20, 50, 0.15), rgba(10, 20, 50, 0.55));
opacity: 0;
visibility: hidden;
pointer-events: none;
}
.fb-stage[data-phase="start"] .fb-start,
.fb-stage[data-phase="over"] .fb-result {
opacity: 1;
visibility: visible;
pointer-events: auto;
animation: fbFadeIn 0.3s ease-out both;
}
.fb-stage[data-phase="start"] .fb-start .fb-card,
.fb-stage[data-phase="over"] .fb-result .fb-card {
animation: fbPop 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.3) both;
}
.fb-card {
position: relative;
width: 100%;
max-width: 21em;
margin: auto;
padding: 1.3em 1.2em 1.3em;
border: 0.2em solid #5a3408;
border-radius: 1.4em;
background: linear-gradient(180deg, #fffdf4 0%, #fff0c7 100%);
box-shadow: 0 0.35em 0 #b9822a, 0 1.2em 2.4em rgba(0, 0, 0, 0.35);
color: #4a3212;
text-align: center;
}
.fb-logo {
display: block;
width: 6em;
height: 4.5em;
margin: -0.2em auto 0.4em;
overflow: visible;
animation: fbBob 1.6s ease-in-out infinite;
}
.fb-logo-wing {
transform-box: fill-box;
transform-origin: 90% 40%;
animation: fbWing 0.32s ease-in-out infinite alternate;
}
.fb-title {
margin: 0;
font-family: "Press Start 2P", monospace;
font-size: 1.3em;
line-height: 1.35;
color: #ffb21e;
text-shadow: 0.08em 0.08em 0 #7a4a0c, -0.04em -0.04em 0 #7a4a0c, 0.04em -0.04em 0 #7a4a0c, -0.04em 0.04em 0 #7a4a0c;
}
.fb-sub {
margin: 0.7em 0 0.9em;
font-size: 0.92em;
line-height: 1.4;
color: #6b4a1c;
}
.fb-tips {
display: grid;
grid-template-columns: 1fr 1fr;
gap: 0.45em;
margin: 0 0 0.9em;
padding: 0;
list-style: none;
}
.fb-tips li {
display: flex;
align-items: center;
gap: 0.45em;
padding: 0.45em 0.55em;
border-radius: 0.8em;
background: rgba(255, 178, 30, 0.16);
font-size: 0.78em;
font-weight: 700;
line-height: 1.2;
text-align: left;
}
.fb-tips li.fb-tip-wide {
grid-column: 1 / -1;
}
.fb-tips svg {
flex: 0 0 auto;
width: 1.8em;
height: 1.8em;
}
.fb-best {
margin: 0 0 0.9em;
font-size: 0.85em;
font-weight: 700;
color: #8a6326;
}
.fb-best strong {
font-family: "Press Start 2P", monospace;
font-size: 0.9em;
color: #e07a00;
}
.fb-btn {
display: flex;
align-items: center;
justify-content: center;
gap: 0.5em;
width: 100%;
min-height: 2.9em;
padding: 0.7em 1.2em;
border: 0;
border-radius: 0.9em;
background: linear-gradient(180deg, #ffcf3f 0%, #ff9f1a 100%);
box-shadow: 0 0.3em 0 #c06a00, 0 0.6em 1.2em rgba(192, 106, 0, 0.35);
color: #ffffff;
font-family: inherit;
font-size: 1.05em;
font-weight: 800;
letter-spacing: 0.02em;
text-shadow: 0 0.08em 0 rgba(120, 60, 0, 0.6);
cursor: pointer;
touch-action: manipulation;
-webkit-tap-highlight-color: transparent;
}
.fb-btn svg {
width: 1em;
height: 1em;
}
.fb-btn:active {
transform: translateY(0.2em);
box-shadow: 0 0.1em 0 #c06a00;
}
.fb-btn-green {
background: linear-gradient(180deg, #7be36a 0%, #34b04a 100%);
box-shadow: 0 0.3em 0 #1f7a33, 0 0.6em 1.2em rgba(31, 122, 51, 0.35);
text-shadow: 0 0.08em 0 rgba(20, 80, 30, 0.6);
}
.fb-btn-green:active {
box-shadow: 0 0.1em 0 #1f7a33;
}
.fb-medal {
display: block;
width: 5.6em;
height: 6.4em;
margin: -0.3em auto 0.2em;
animation: fbMedalIn 0.7s 0.15s cubic-bezier(0.2, 0.9, 0.3, 1.3) both;
}
.fb-over-title {
margin: 0;
font-size: 1.6em;
font-weight: 900;
line-height: 1.2;
letter-spacing: 0.04em;
color: #e8542a;
text-shadow: 0.06em 0.06em 0 #5a1f08;
}
.fb-tier {
margin: 0.35em 0 0.7em;
font-size: 1em;
font-weight: 800;
color: #6b4a1c;
}
.fb-record {
display: none;
margin: 0 auto 0.6em;
padding: 0.3em 0.8em;
border-radius: 2em;
background: linear-gradient(180deg, #ff7a4d, #e8542a);
color: #ffffff;
font-size: 0.8em;
font-weight: 800;
}
.fb-record[data-visible="true"] {
display: inline-block;
animation: fbPulse 0.9s ease-in-out infinite;
}
.fb-stats {
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 0.45em;
margin: 0 0 0.8em;
}
.fb-stat {
padding: 0.5em 0.3em;
border-radius: 0.8em;
background: #ffffff;
box-shadow: inset 0 -0.15em 0 rgba(0, 0, 0, 0.08);
}
.fb-stat span {
display: block;
font-size: 0.72em;
font-weight: 700;
color: #9a7a44;
}
.fb-stat strong {
display: block;
margin-top: 0.35em;
font-family: "Press Start 2P", monospace;
font-size: 0.9em;
color: #4a3212;
}
.fb-reward {
margin: 0 0 0.6em;
padding: 0.7em;
border: 0.14em dashed #e0a019;
border-radius: 1em;
background: #fffaf0;
}
.fb-reward-label {
margin: 0 0 0.5em;
font-size: 0.88em;
font-weight: 700;
}
.fb-reward-label strong {
color: #e8542a;
}
.fb-code-row {
display: flex;
gap: 0.45em;
}
.fb-code {
display: flex;
flex: 1 1 auto;
align-items: center;
justify-content: center;
min-width: 0;
padding: 0.6em 0.4em;
border-radius: 0.65em;
background: #3b2a14;
color: #ffd54a;
font-family: "Press Start 2P", monospace;
font-size: 0.8em;
letter-spacing: 0.08em;
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
user-select: all;
-webkit-user-select: all;
}
.fb-copy {
flex: 0 0 auto;
min-width: 6.4em;
padding: 0.55em 0.8em;
border: 0;
border-radius: 0.65em;
background: #2f80ed;
box-shadow: 0 0.2em 0 #1d5bb0;
color: #ffffff;
font-family: inherit;
font-size: 0.85em;
font-weight: 800;
cursor: pointer;
touch-action: manipulation;
-webkit-tap-highlight-color: transparent;
}
.fb-copy:active {
transform: translateY(0.15em);
box-shadow: 0 0.05em 0 #1d5bb0;
}
.fb-copy[data-copied="true"] {
background: #2fae5a;
box-shadow: 0 0.2em 0 #1f7a3f;
}
.fb-next {
margin: 0 0 0.85em;
font-size: 0.78em;
font-weight: 700;
color: #9a7a44;
}
.fb-copy-helper {
position: absolute;
left: 0;
top: 0;
width: 1px;
height: 1px;
opacity: 0;
pointer-events: none;
}
.fb-confetti {
position: absolute;
inset: 0;
z-index: 1;
overflow: hidden;
pointer-events: none;
}
.fb-confetti i {
position: absolute;
top: -2em;
display: block;
width: 0.55em;
height: 0.9em;
border-radius: 0.12em;
opacity: 0;
animation: fbConfetti 2.6s ease-in forwards;
}
.fb-result .fb-card {
z-index: 2;
}
@keyframes fbFadeIn {
from {
opacity: 0;
}
to {
opacity: 1;
}
}
@keyframes fbFadeOut {
from {
opacity: 1;
}
to {
opacity: 0;
}
}
@keyframes fbStageIn {
from {
opacity: 0;
transform: scale(0.92) translateY(1em);
}
to {
opacity: 1;
transform: none;
}
}
@keyframes fbPop {
0% {
opacity: 0;
transform: scale(0.8) translateY(1em);
}
60% {
opacity: 1;
transform: scale(1.03);
}
100% {
opacity: 1;
transform: none;
}
}
@keyframes fbShake {
0%,
100% {
transform: none;
}
15% {
transform: translate(-0.5em, 0.25em);
}
30% {
transform: translate(0.45em, -0.3em);
}
45% {
transform: translate(-0.35em, 0.2em);
}
60% {
transform: translate(0.25em, -0.15em);
}
75% {
transform: translate(-0.12em, 0.08em);
}
}
@keyframes fbFlash {
0% {
opacity: 0.85;
}
100% {
opacity: 0;
}
}
@keyframes fbBob {
0%,
100% {
transform: translateY(0) rotate(-4deg);
}
50% {
transform: translateY(-0.35em) rotate(3deg);
}
}
@keyframes fbWing {
from {
transform: rotate(-20deg);
}
to {
transform: rotate(24deg);
}
}
@keyframes fbMedalIn {
0% {
opacity: 0;
transform: scale(0.3) rotate(-25deg);
}
70% {
opacity: 1;
transform: scale(1.1) rotate(6deg);
}
100% {
opacity: 1;
transform: none;
}
}
@keyframes fbPulse {
0%,
100% {
transform: scale(1);
}
50% {
transform: scale(1.08);
}
}
@keyframes fbConfetti {
0% {
opacity: 1;
transform: translateY(0) rotate(0deg);
}
85% {
opacity: 1;
}
100% {
opacity: 0;
transform: translateY(52em) rotate(760deg);
}
}
@media (max-width: 767px) {
#flippyBirdRoot {
touch-action: manipulation;
}
.fb-card {
max-width: 20em;
}
}
@media (max-height: 600px) {
.fb-stage {
font-size: 13px;
}
.fb-logo {
display: none;
}
.fb-medal {
width: 4.4em;
height: 5em;
}
}
@media (pointer: coarse) {
.fb-btn {
min-height: 3.2em;
}
.fb-close {
width: 2.8em;
height: 2.8em;
}
.fb-copy {
min-height: 2.8em;
}
}
@media (pointer: fine) {
.fb-btn:hover,
.fb-copy:hover {
filter: brightness(1.07);
}
.fb-close:hover {
background: rgba(20, 28, 60, 0.7);
}
}
@media (min-width: 768px) {
.fb-stage {
width: min(92vw, 34em);
height: min(92vh, 46em);
border-radius: 1.6em;
box-shadow: 0 1.6em 4em rgba(0, 0, 0, 0.5), 0 0 0 0.3em rgba(255, 255, 255, 0.12);
}
}
@media (min-width: 1024px) {
.fb-stage {
font-size: 17px;
}
}
`;
    document.head.appendChild(styleEl);

    const root = document.createElement("div");
    root.id = "flippyBirdRoot";
    root.dataset.state = "open";
    const stage = document.createElement("div");
    stage.className = "fb-stage";
    stage.dataset.phase = "start";
    const canvas = document.createElement("canvas");
    canvas.id = "flippyBirdCanvas";
    canvas.dataset.shake = "false";
    stage.appendChild(canvas);
    stage.insertAdjacentHTML(
      "beforeend",
      `
<div class="fb-flash" data-active="false"></div>
<button type="button" class="fb-close" aria-label="Kapat">
<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/></svg>
</button>
<div class="fb-screen fb-start">
<div class="fb-card">
<svg class="fb-logo" viewBox="0 0 120 90" aria-hidden="true">
<defs>
<radialGradient id="fbLogoBody" cx="0.38" cy="0.3" r="0.75">
<stop offset="0" stop-color="#fff6b5"/>
<stop offset="0.5" stop-color="#f7d33c"/>
<stop offset="1" stop-color="#e09a14"/>
</radialGradient>
</defs>
<path d="M30 44L10 30L16 46L8 60L32 56Z" fill="#e67e22" stroke="#5a3408" stroke-width="3" stroke-linejoin="round"/>
<ellipse cx="58" cy="48" rx="34" ry="29" fill="url(#fbLogoBody)" stroke="#5a3408" stroke-width="3.5"/>
<ellipse cx="64" cy="63" rx="21" ry="10" fill="#fff4cd" opacity="0.9"/>
<path d="M54 20Q57 4 68 9Q62 14 64 20Z" fill="#f39c12" stroke="#5a3408" stroke-width="2.5" stroke-linejoin="round"/>
<ellipse cx="73" cy="38" rx="12" ry="12.5" fill="#ffffff" stroke="#5a3408" stroke-width="2.5"/>
<circle cx="77" cy="39" r="5.5" fill="#1a1a2e"/>
<circle cx="79" cy="36.5" r="2" fill="#ffffff"/>
<ellipse cx="79" cy="53" rx="6" ry="3.5" fill="#ff7878" opacity="0.5"/>
<path d="M84 47Q100 44 110 52L85 56Z" fill="#ff8f3d" stroke="#5a3408" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M85 56L105 57Q96 66 84 63Z" fill="#e4572e" stroke="#5a3408" stroke-width="2.5" stroke-linejoin="round"/>
<g class="fb-logo-wing">
<ellipse cx="44" cy="52" rx="19" ry="11" fill="#fff3c4" stroke="#5a3408" stroke-width="3"/>
<path d="M30 50H50M32 56H48" stroke="#c98a1c" stroke-width="2" stroke-linecap="round"/>
</g>
</svg>
<h2 class="fb-title">FLIPPY BIRD</h2>
<p class="fb-sub">Boruların arasından süzül, altınları topla ve skoruna göre indirim kodunu kap!</p>
<ul class="fb-tips">
<li class="fb-tip-wide"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="#ffb21e" stroke-width="2" opacity="0.55"/><circle cx="12" cy="12" r="5.5" fill="#ffb21e"/></svg>Kanat çırpmak için ekrana dokun, tıkla ya da Boşluk tuşuna bas.</li>
<li><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#ffd700" stroke="#b8860b" stroke-width="2"/><circle cx="12" cy="12" r="6.5" fill="none" stroke="#fff3a0" stroke-width="1.5"/><path d="M12 7.5l1.3 2.8 3 .3-2.3 2 .7 3-2.7-1.6-2.7 1.6.7-3-2.3-2 3-.3z" fill="#fff8c8"/></svg>Altın: +5 puan</li>
<li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l8.7 5v10L12 22l-8.7-5V7z" fill="#3498db" stroke="#1f6ea3" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 7l4 2v4c0 2.2-1.8 3.6-4 4.4-2.2-.8-4-2.2-4-4.4V9z" fill="#dff1ff"/></svg>Kalkan: dokunulmazlık</li>
<li><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="#9b59b6"/><path d="M8 6h8M8 18h8M9 6c0 4 6 4 6 6s-6 2-6 6M15 6c0 4-6 4-6 6s6 2 6 6" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/></svg>Kum saati: zaman yavaşlar</li>
<li><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="#e74c3c"/><path d="M8 7v5a4 4 0 0 0 8 0V7" fill="none" stroke="#ffffff" stroke-width="3"/><path d="M6.5 7h3M14.5 7h3" stroke="#ffe08a" stroke-width="3"/></svg>Mıknatıs: altınları çeker</li>
</ul>
<p class="fb-best">En iyi skorun: <strong class="fb-best-value">0</strong></p>
<button type="button" class="fb-btn fb-start-btn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg>Oyuna Başla</button>
</div>
</div>
<div class="fb-screen fb-result">
<div class="fb-confetti"></div>
<div class="fb-card">
<div class="fb-medal-slot"></div>
<h3 class="fb-over-title">OYUN BİTTİ</h3>
<p class="fb-tier"></p>
<span class="fb-record" data-visible="false">Yeni Rekor!</span>
<div class="fb-stats">
<div class="fb-stat"><span>Skor</span><strong class="fb-res-score">0</strong></div>
<div class="fb-stat"><span>En İyi</span><strong class="fb-res-best">0</strong></div>
<div class="fb-stat"><span>Altın</span><strong class="fb-res-coins">0</strong></div>
</div>
<div class="fb-reward">
<p class="fb-reward-label"><strong class="fb-res-discount"></strong> indirim kazandın!</p>
<div class="fb-code-row">
<span class="fb-code"></span>
<button type="button" class="fb-copy" data-copied="false">Kopyala</button>
</div>
</div>
<p class="fb-next"></p>
<button type="button" class="fb-btn fb-btn-green fb-replay-btn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V2L7 6.5 12 11V8a5 5 0 1 1-5 5H4a8 8 0 1 0 8-8z" fill="currentColor"/></svg>Tekrar Oyna</button>
</div>
</div>
`,
    );
    root.appendChild(stage);
    document.body.appendChild(root);

    const ctx = canvas.getContext("2d");
    const flashEl = stage.querySelector(".fb-flash");
    const closeBtn = stage.querySelector(".fb-close");
    const startBtn = stage.querySelector(".fb-start-btn");
    const replayBtn = stage.querySelector(".fb-replay-btn");
    const copyBtn = stage.querySelector(".fb-copy");
    const bestValueEl = stage.querySelector(".fb-best-value");
    const medalSlot = stage.querySelector(".fb-medal-slot");
    const tierEl = stage.querySelector(".fb-tier");
    const recordEl = stage.querySelector(".fb-record");
    const resScoreEl = stage.querySelector(".fb-res-score");
    const resBestEl = stage.querySelector(".fb-res-best");
    const resCoinsEl = stage.querySelector(".fb-res-coins");
    const resDiscountEl = stage.querySelector(".fb-res-discount");
    const codeEl = stage.querySelector(".fb-code");
    const nextEl = stage.querySelector(".fb-next");
    const confettiEl = stage.querySelector(".fb-confetti");

    const gameState = {
      phase: "start",
      score: 0,
      coins: 0,
      highScore: 0,
      prevHighScore: 0,
      skyScore: 0,
      pipes: [],
      coinItems: [],
      powerUpItems: [],
      particles: [],
      popups: [],
      stars: [],
      clouds: [],
      buildings: [],
      bird: {
        y: 0,
        vy: 0,
        angle: 0,
        bob: 0,
        wingT: 0,
        flapBoost: 0,
        deathVy: 0,
        deathX: 0,
        deathY: 0,
        deathT: 0,
        landed: false,
      },
      scroll: 0,
      time: 0,
      blinkT: 0,
      lastGapY: 0,
      lastTime: 0,
      animFrameId: 0,
      audioCtx: null,
      masterGain: null,
      noiseBuffer: null,
      view: { gw: 0, gh: 0, scale: 1, dpr: 1 },
      resizeRaf: 0,
      activeEffects: { shield: 0, slowMo: 0, magnet: 0 },
    };

    try {
      const stored = localStorage.getItem("flippyBirdHighScore");
      if (stored !== null) {
        gameState.highScore = Math.max(0, parseInt(stored, 10) || 0);
      }
    } catch (e) {}
    bestValueEl.textContent = String(gameState.highScore);

    const saveHigh = () => {
      try {
        localStorage.setItem("flippyBirdHighScore", String(gameState.highScore));
      } catch (e) {}
    };

    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
    const mixColor = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
    const rgb = (c, alpha) => (alpha === undefined ? `rgb(${c[0]}, ${c[1]}, ${c[2]})` : `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`);
    const hash = (n) => {
      const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
      return s - Math.floor(s);
    };
    const groundY = () => CONFIG.worldHeight - CONFIG.groundHeight;
    const birdX = () => Math.min(gameState.view.gw * CONFIG.birdXRatio, CONFIG.birdXMax);
    const restY = () => groundY() * 0.45;

    const getAudio = () => {
      if (!gameState.audioCtx) {
        try {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (AC) {
            gameState.audioCtx = new AC();
            gameState.masterGain = gameState.audioCtx.createGain();
            gameState.masterGain.gain.value = CONFIG.masterVolume;
            gameState.masterGain.connect(gameState.audioCtx.destination);
          }
        } catch (e) {
          gameState.audioCtx = null;
        }
      }
      return gameState.audioCtx;
    };

    const resumeAudio = () => {
      const a = getAudio();
      if (a && a.state === "suspended") {
        try {
          a.resume();
        } catch (e) {}
      }
    };

    const playTone = (type, from, to, duration, volume, delay) => {
      const a = getAudio();
      if (!a) {
        return;
      }
      try {
        const t0 = a.currentTime + (delay || 0);
        const o = a.createOscillator();
        const g = a.createGain();
        o.type = type;
        o.frequency.setValueAtTime(from, t0);
        if (to !== from) {
          o.frequency.exponentialRampToValueAtTime(to, t0 + duration);
        }
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(volume, t0 + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
        o.connect(g);
        g.connect(gameState.masterGain);
        o.start(t0);
        o.stop(t0 + duration + 0.02);
      } catch (e) {}
    };

    const getNoiseBuffer = (a) => {
      if (!gameState.noiseBuffer) {
        const len = Math.floor(a.sampleRate * 0.5);
        const buf = a.createBuffer(1, len, a.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i += 1) {
          data[i] = Math.random() * 2 - 1;
        }
        gameState.noiseBuffer = buf;
      }
      return gameState.noiseBuffer;
    };

    const playNoise = (filterType, from, to, duration, volume, delay) => {
      const a = getAudio();
      if (!a) {
        return;
      }
      try {
        const t0 = a.currentTime + (delay || 0);
        const src = a.createBufferSource();
        const f = a.createBiquadFilter();
        const g = a.createGain();
        src.buffer = getNoiseBuffer(a);
        f.type = filterType;
        f.Q.value = 1.2;
        f.frequency.setValueAtTime(from, t0);
        f.frequency.exponentialRampToValueAtTime(to, t0 + duration);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(volume, t0 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
        src.connect(f);
        f.connect(g);
        g.connect(gameState.masterGain);
        src.start(t0);
        src.stop(t0 + duration + 0.02);
      } catch (e) {}
    };

    const playFlap = () => {
      playNoise("bandpass", 900, 2600, 0.12, 0.22, 0);
      playTone("triangle", 360, 620, 0.08, 0.06, 0);
    };

    const playCoin = () => {
      playTone("square", 988, 988, 0.06, 0.05, 0);
      playTone("square", 1319, 1319, 0.16, 0.05, 0.05);
      playTone("sine", 2637, 2637, 0.12, 0.03, 0.05);
    };

    const playPower = () => {
      const notes = [392, 523.25, 659.25, 783.99];
      notes.forEach((freq, i) => {
        playTone("triangle", freq, freq, 0.18, 0.12, i * 0.06);
      });
    };

    const playHit = () => {
      playNoise("lowpass", 1800, 200, 0.22, 0.4, 0);
      playTone("square", 180, 60, 0.2, 0.12, 0);
    };

    const playDeath = () => {
      playTone("sawtooth", 620, 110, 0.55, 0.08, 0.2);
    };

    const playPass = () => {
      playTone("sine", 988, 988, 0.09, 0.14, 0);
      playTone("sine", 1319, 1319, 0.18, 0.12, 0.07);
    };

    const initStars = () => {
      gameState.stars = [];
      for (let i = 0; i < CONFIG.starCount; i += 1) {
        gameState.stars.push({
          fx: Math.random(),
          y: 10 + Math.random() * 300,
          s: 0.6 + Math.random() * 1.6,
          tw: Math.random() * Math.PI * 2,
        });
      }
      gameState.clouds = [];
      for (let i = 0; i < 7; i += 1) {
        gameState.clouds.push({
          fx: i / 7 + Math.random() * 0.08,
          y: 50 + Math.random() * 190,
          s: 0.55 + Math.random() * 0.6,
          par: 0.05 + Math.random() * 0.07,
        });
      }
      gameState.buildings = [];
      let x = 0;
      let seed = 0;
      while (x < CONFIG.cityTile) {
        const w = 34 + Math.random() * 40;
        const roll = Math.random();
        gameState.buildings.push({
          x,
          w,
          h: 60 + Math.random() * 110,
          roof: roll < 0.25 ? "antenna" : roll < 0.5 ? "step" : "flat",
          seed,
        });
        x += w + 3 + Math.random() * 10;
        seed += 1;
      }
    };

    const skyPalette = (score) => {
      const stops = CONFIG.skyStops;
      let i = 0;
      while (i < stops.length - 2 && score >= stops[i + 1].score) {
        i += 1;
      }
      const a = stops[i];
      const b = stops[i + 1];
      const t = clamp((score - a.score) / (b.score - a.score), 0, 1);
      return {
        top: mixColor(a.top, b.top, t),
        bot: mixColor(a.bot, b.bot, t),
        night: clamp((score - CONFIG.nightStartScore) / CONFIG.nightFadeScore, 0, 1),
        dusk: clamp(score / stops[2].score, 0, 1),
      };
    };

    const roundRectPath = (x, y, w, h, r) => {
      const rr = Math.min(r, w * 0.5, h * 0.5);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    };

    const drawCloud = (x, y, s) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(s, s);
      const puffs = [
        [0, 0, 26],
        [28, -14, 30],
        [60, -4, 24],
        [84, 6, 17],
        [-22, 8, 17],
      ];
      ctx.fillStyle = "rgba(160, 190, 220, 0.45)";
      ctx.beginPath();
      puffs.forEach((p) => {
        ctx.moveTo(p[0] + p[2], p[1] + 7);
        ctx.arc(p[0], p[1] + 7, p[2], 0, Math.PI * 2);
      });
      ctx.fill();
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.beginPath();
      puffs.forEach((p) => {
        ctx.moveTo(p[0] + p[2], p[1]);
        ctx.arc(p[0], p[1], p[2], 0, Math.PI * 2);
      });
      ctx.fill();
      ctx.restore();
    };

    const drawCity = (par, heightMul, color, windowColor, windowAlpha, xShift) => {
      const gw = gameState.view.gw;
      const gy = groundY() - 8;
      const tile = CONFIG.cityTile;
      const offset = (((gameState.scroll * par + xShift) % tile) + tile) % tile;
      ctx.fillStyle = rgb(color);
      ctx.beginPath();
      for (let tx = -offset; tx < gw; tx += tile) {
        gameState.buildings.forEach((b) => {
          const bx = tx + b.x;
          const h = b.h * heightMul;
          if (bx > gw || bx + b.w < 0) {
            return;
          }
          ctx.rect(bx, gy - h, b.w, h + 8);
          if (b.roof === "antenna") {
            ctx.rect(bx + b.w * 0.5 - 1.5, gy - h - 16, 3, 16);
          } else if (b.roof === "step") {
            ctx.rect(bx + b.w * 0.2, gy - h - 9, b.w * 0.6, 9);
          }
        });
      }
      ctx.fill();
      if (!windowColor) {
        return;
      }
      ctx.fillStyle = rgb(windowColor, windowAlpha);
      ctx.beginPath();
      for (let tx = -offset; tx < gw; tx += tile) {
        gameState.buildings.forEach((b) => {
          const bx = tx + b.x;
          const h = b.h * heightMul;
          if (bx > gw || bx + b.w < 0) {
            return;
          }
          const cols = Math.floor((b.w - 8) / 10);
          const rows = Math.floor((h - 12) / 14);
          for (let r = 0; r < rows; r += 1) {
            for (let c = 0; c < cols; c += 1) {
              if ((b.seed * 7 + r * 3 + c * 5) % 4 !== 0) {
                ctx.rect(bx + 6 + c * 10, gy - h + 8 + r * 14, 5, 7);
              }
            }
          }
        });
      }
      ctx.fill();
    };

    const drawBushes = (par, yOff, radius, color) => {
      const gw = gameState.view.gw;
      const gy = groundY();
      const period = 44;
      const offset = gameState.scroll * par;
      const first = Math.floor(offset / period) - 1;
      ctx.fillStyle = rgb(color);
      ctx.beginPath();
      for (let i = first; i * period - offset < gw + period; i += 1) {
        const x = i * period - offset;
        const r = radius * (0.75 + 0.35 * hash(i));
        ctx.moveTo(x + r, gy + yOff);
        ctx.arc(x, gy + yOff, r, 0, Math.PI * 2);
      }
      ctx.rect(0, gy + yOff, gw, -yOff + 2);
      ctx.fill();
    };

    const drawBackground = (pal) => {
      const gw = gameState.view.gw;
      const gh = gameState.view.gh;
      const gy = groundY();
      const g = ctx.createLinearGradient(0, 0, 0, gy);
      g.addColorStop(0, rgb(pal.top));
      g.addColorStop(1, rgb(pal.bot));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, gw, gh);

      if (pal.night > 0) {
        const tile = Math.max(CONFIG.cloudTile, gw);
        const t = gameState.time * 2.4;
        gameState.stars.forEach((st) => {
          const a = pal.night * (0.45 + Math.sin(t + st.tw) * 0.4);
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, a)})`;
          ctx.beginPath();
          ctx.arc(st.fx * tile, st.y, st.s, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      const sunX = gw * 0.76;
      const sunY = 120 + pal.dusk * 190;
      if (pal.night < 1) {
        ctx.save();
        ctx.globalAlpha = 1 - pal.night;
        const glow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 110);
        glow.addColorStop(0, "rgba(255, 244, 190, 0.7)");
        glow.addColorStop(1, "rgba(255, 244, 190, 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(sunX - 110, sunY - 110, 220, 220);
        const sun = ctx.createRadialGradient(sunX - 8, sunY - 8, 4, sunX, sunY, 34);
        sun.addColorStop(0, "#fffbe0");
        sun.addColorStop(1, rgb(mixColor([255, 214, 77], [255, 130, 60], pal.dusk)));
        ctx.fillStyle = sun;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 34, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      if (pal.night > 0) {
        const mx = gw * 0.72;
        const my = 104;
        ctx.save();
        ctx.globalAlpha = pal.night;
        const glow = ctx.createRadialGradient(mx, my, 8, mx, my, 80);
        glow.addColorStop(0, "rgba(240, 240, 210, 0.45)");
        glow.addColorStop(1, "rgba(240, 240, 210, 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(mx - 80, my - 80, 160, 160);
        ctx.fillStyle = "#f4f1d0";
        ctx.beginPath();
        ctx.arc(mx, my, 23, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(196, 190, 150, 0.6)";
        ctx.beginPath();
        ctx.arc(mx - 7, my - 5, 5, 0, Math.PI * 2);
        ctx.moveTo(mx + 13, my + 6);
        ctx.arc(mx + 8, my + 6, 5, 0, Math.PI * 2);
        ctx.moveTo(mx + 3, my - 11);
        ctx.arc(mx + 1, my - 11, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      const cloudTile = Math.max(CONFIG.cloudTile, gw + 260);
      ctx.save();
      ctx.globalAlpha = 0.9 - pal.night * 0.55;
      gameState.clouds.forEach((c) => {
        const travel = gameState.scroll * c.par + gameState.time * 6;
        const x = ((((c.fx * cloudTile - travel) % cloudTile) + cloudTile) % cloudTile) - 130;
        drawCloud(x, c.y, c.s);
      });
      ctx.restore();

      const n = pal.night;
      drawCity(0.12, 0.72, mixColor([166, 214, 234], [38, 44, 92], n), null, 0, 190);
      drawCity(0.25, 1, mixColor([120, 182, 208], [26, 32, 68], n), mixColor([235, 245, 255], [255, 210, 110], n), 0.35 + n * 0.55, 0);
      drawBushes(0.5, -10, 26, mixColor([108, 196, 84], [40, 88, 62], n));
      drawBushes(0.5, -2, 20, mixColor([82, 170, 64], [30, 70, 50], n));
    };

    const drawGround = () => {
      const gw = gameState.view.gw;
      const gh = gameState.view.gh;
      const gy = groundY();
      const stripe = 28;
      const off = gameState.scroll % stripe;
      ctx.fillStyle = "#ded895";
      ctx.fillRect(0, gy, gw, gh - gy);
      ctx.fillStyle = "rgba(170, 140, 70, 0.35)";
      ctx.beginPath();
      const dirtOff = gameState.scroll % 56;
      for (let x = -dirtOff - 56; x < gw + 56; x += 56) {
        ctx.moveTo(x + 17, gy + 42);
        ctx.ellipse(x + 10, gy + 42, 7, 3, 0, 0, Math.PI * 2);
        ctx.moveTo(x + 47, gy + 66);
        ctx.ellipse(x + 38, gy + 66, 9, 3.5, 0, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.fillStyle = "#8be04e";
      ctx.fillRect(0, gy, gw, 18);
      ctx.fillStyle = "#6cc23a";
      ctx.beginPath();
      for (let x = -off - stripe; x < gw + stripe; x += stripe) {
        ctx.moveTo(x, gy + 18);
        ctx.lineTo(x + 14, gy + 18);
        ctx.lineTo(x + 24, gy);
        ctx.lineTo(x + 10, gy);
        ctx.closePath();
      }
      ctx.fill();
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.fillRect(0, gy, gw, 3);
      ctx.fillStyle = "#4f8f2a";
      ctx.fillRect(0, gy + 18, gw, 4);
      ctx.fillStyle = "rgba(120, 90, 30, 0.25)";
      ctx.fillRect(0, gy + 22, gw, 6);
      ctx.fillStyle = "#3d6e1f";
      ctx.fillRect(0, gy - 2, gw, 2.5);
    };

    const spawnParticles = (x, y, count, colors, kind) => {
      for (let i = 0; i < count; i += 1) {
        const ang = Math.random() * Math.PI * 2;
        const sp = kind === "puff" ? 30 + Math.random() * 60 : kind === "feather" ? 80 + Math.random() * 160 : 120 + Math.random() * 220;
        gameState.particles.push({
          x,
          y,
          vx: Math.cos(ang) * sp - (kind === "puff" ? 60 : 0),
          vy: Math.sin(ang) * sp,
          life: 1,
          decay: kind === "puff" ? 2.6 : kind === "feather" ? 0.9 : 1.8,
          grav: kind === "puff" ? 0 : kind === "feather" ? 90 : 180,
          color: colors[i % colors.length],
          size: kind === "puff" ? 3 + Math.random() * 4 : 2 + Math.random() * 3,
          kind: kind || "spark",
          rot: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 8,
        });
      }
    };

    const updateParticles = (dt) => {
      gameState.particles = gameState.particles.filter((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += p.grav * dt;
        p.rot += p.spin * dt;
        if (p.kind === "feather") {
          p.vx *= 1 - dt * 1.5;
          p.vy *= 1 - dt * 1.2;
        }
        p.life -= dt * p.decay;
        return p.life > 0;
      });
      gameState.popups = gameState.popups.filter((p) => {
        p.y -= 46 * dt;
        p.life -= dt * 1.3;
        return p.life > 0;
      });
    };

    const drawParticles = () => {
      gameState.particles.forEach((p) => {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        if (p.kind === "feather") {
          ctx.ellipse(p.x, p.y, p.size * 2.4, p.size, p.rot, 0, Math.PI * 2);
        } else {
          ctx.arc(p.x, p.y, p.kind === "puff" ? p.size * (1.6 - p.life * 0.6) : p.size, 0, Math.PI * 2);
        }
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    const addPopup = (x, y, text, color) => {
      gameState.popups.push({ x, y, text, color, life: 1 });
    };

    const drawPopups = () => {
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineJoin = "round";
      gameState.popups.forEach((p) => {
        const s = 1 + (1 - p.life) * 0.25;
        ctx.font = /^[+\d]/.test(p.text) ? `16px ${CONFIG.pixelFont}` : `900 17px ${CONFIG.uiFont}`;
        ctx.globalAlpha = clamp(p.life * 1.6, 0, 1);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(s, s);
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#3b2a14";
        ctx.strokeText(p.text, 0, 0);
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, 0, 0);
        ctx.restore();
      });
      ctx.restore();
    };

    const easeInQuad = (u) => {
      return u * u;
    };

    const difficultyT = (score, cap) => {
      if (cap <= 0) {
        return 1;
      }
      return Math.min(1, score / cap);
    };

    const currentGap = () => {
      const t = easeInQuad(difficultyT(gameState.score, CONFIG.gapEaseMaxScore));
      return CONFIG.baseGap - (CONFIG.baseGap - CONFIG.minGap) * t;
    };

    const currentSpawnSpan = () => {
      const t = easeInQuad(difficultyT(gameState.score, CONFIG.spawnEaseMaxScore));
      return CONFIG.pipeSpawnWide - (CONFIG.pipeSpawnWide - CONFIG.pipeSpawnTight) * t;
    };

    const pipeSpeedNow = () => {
      const te = easeInQuad(difficultyT(gameState.score, CONFIG.speedEaseMaxScore));
      let s =
        CONFIG.basePipeSpeed + gameState.score * CONFIG.speedPerScore * (0.55 + 0.45 * te);
      s = Math.min(CONFIG.maxPipeSpeed, s);
      if (gameState.activeEffects.slowMo > 0) {
        s *= 0.5;
      }
      return s;
    };

    const drawBird = (bx, by, angle, wing, dead) => {
      const r = CONFIG.birdRadius;
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(angle);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.lineWidth = r * 0.11;
      ctx.strokeStyle = "#5a3408";

      ctx.fillStyle = "#e67e22";
      ctx.beginPath();
      ctx.moveTo(-r * 0.85, -r * 0.1);
      ctx.lineTo(-r * 1.55, -r * 0.55);
      ctx.lineTo(-r * 1.35, -r * 0.05);
      ctx.lineTo(-r * 1.6, r * 0.32);
      ctx.lineTo(-r * 0.85, r * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      const body = ctx.createRadialGradient(-r * 0.3, -r * 0.45, r * 0.15, 0, 0, r * 1.25);
      body.addColorStop(0, "#fff6b5");
      body.addColorStop(0.45, "#f7d33c");
      body.addColorStop(1, "#e09a14");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.12, r * 0.95, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 244, 205, 0.9)";
      ctx.beginPath();
      ctx.ellipse(r * 0.18, r * 0.48, r * 0.66, r * 0.34, -0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#f39c12";
      ctx.beginPath();
      ctx.moveTo(-r * 0.15, -r * 0.88);
      ctx.quadraticCurveTo(-r * 0.05, -r * 1.5, r * 0.3, -r * 1.28);
      ctx.quadraticCurveTo(r * 0.1, -r * 1.08, r * 0.22, -r * 0.9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 110, 110, 0.5)";
      ctx.beginPath();
      ctx.ellipse(r * 0.66, r * 0.2, r * 0.2, r * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = r * 0.08;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(r * 0.5, -r * 0.3, r * 0.38, r * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (dead) {
        ctx.strokeStyle = "#3a2a1a";
        ctx.lineWidth = r * 0.1;
        ctx.beginPath();
        ctx.moveTo(r * 0.36, -r * 0.46);
        ctx.lineTo(r * 0.68, -r * 0.14);
        ctx.moveTo(r * 0.68, -r * 0.46);
        ctx.lineTo(r * 0.36, -r * 0.14);
        ctx.stroke();
        ctx.strokeStyle = "#5a3408";
      } else {
        ctx.fillStyle = "#1a1a2e";
        ctx.beginPath();
        ctx.arc(r * 0.62, -r * 0.27, r * 0.17, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(r * 0.68, -r * 0.35, r * 0.06, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.lineWidth = r * 0.09;
      ctx.fillStyle = "#ff8f3d";
      ctx.beginPath();
      ctx.moveTo(r * 0.78, -r * 0.02);
      ctx.quadraticCurveTo(r * 1.25, -r * 0.12, r * 1.52, r * 0.14);
      ctx.lineTo(r * 0.8, r * 0.24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#e4572e";
      ctx.beginPath();
      ctx.moveTo(r * 0.8, r * 0.24);
      ctx.lineTo(r * 1.38, r * 0.26);
      ctx.quadraticCurveTo(r * 1.1, r * 0.5, r * 0.76, r * 0.44);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.translate(-r * 0.12, r * 0.12);
      ctx.rotate(wing);
      const wg = ctx.createLinearGradient(0, -r * 0.4, 0, r * 0.4);
      wg.addColorStop(0, "#fffbe6");
      wg.addColorStop(1, "#f2b632");
      ctx.fillStyle = wg;
      ctx.lineWidth = r * 0.1;
      ctx.beginPath();
      ctx.ellipse(-r * 0.32, 0, r * 0.62, r * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(170, 110, 20, 0.65)";
      ctx.lineWidth = r * 0.06;
      ctx.beginPath();
      ctx.moveTo(-r * 0.78, -r * 0.03);
      ctx.lineTo(-r * 0.2, -r * 0.05);
      ctx.moveTo(-r * 0.72, r * 0.14);
      ctx.lineTo(-r * 0.25, r * 0.12);
      ctx.stroke();
      ctx.restore();

      ctx.restore();
    };

    const pipeRects = (p) => {
      const gy = groundY();
      const pw = CONFIG.pipeWidth;
      const ov = CONFIG.pipeCapOverhang;
      const ch = CONFIG.pipeCapHeight;
      const gapTop = p.gapY - p.gapSize * 0.5;
      const gapBot = p.gapY + p.gapSize * 0.5;
      return [
        { x: p.x, y: -40, w: pw, h: gapTop - ch + 40, cap: false, shadow: false },
        { x: p.x - ov, y: gapTop - ch, w: pw + ov * 2, h: ch, cap: true, shadow: false },
        { x: p.x, y: gapBot + ch, w: pw, h: gy - gapBot - ch + 6, cap: false, shadow: true },
        { x: p.x - ov, y: gapBot, w: pw + ov * 2, h: ch, cap: true, shadow: false },
      ];
    };

    const drawPipeSegment = (rc) => {
      if (rc.h <= 0) {
        return;
      }
      const g = ctx.createLinearGradient(rc.x, 0, rc.x + rc.w, 0);
      g.addColorStop(0, "#3f8f2b");
      g.addColorStop(0.18, "#a6ea6a");
      g.addColorStop(0.42, "#73c946");
      g.addColorStop(0.8, "#3f9a2c");
      g.addColorStop(1, "#2a6b1d");
      ctx.fillStyle = g;
      ctx.fillRect(rc.x, rc.y, rc.w, rc.h);
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.fillRect(rc.x + rc.w * 0.13, rc.y, rc.w * 0.07, rc.h);
      if (rc.shadow) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
        ctx.fillRect(rc.x, rc.y, rc.w, 7);
      }
      if (rc.cap) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
        ctx.fillRect(rc.x + 3, rc.y + 3, rc.w - 6, 3);
        ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
        ctx.fillRect(rc.x + 3, rc.y + rc.h - 5, rc.w - 6, 3);
      }
      ctx.strokeStyle = "#1f4f16";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(rc.x, rc.y, rc.w, rc.h);
    };

    const drawPipes = () => {
      const gw = gameState.view.gw;
      gameState.pipes.forEach((p) => {
        if (p.x > gw + 20 || p.x + CONFIG.pipeWidth < -20) {
          return;
        }
        pipeRects(p).forEach(drawPipeSegment);
      });
    };

    const drawCoinShape = (cx, cy, rad, alpha, scaleMul, spin) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(cx, cy);
      ctx.scale(scaleMul * (spin === undefined ? 1 : spin), scaleMul);
      const g = ctx.createRadialGradient(0, -rad * 0.3, 0, 0, 0, rad);
      g.addColorStop(0, "#fff9c4");
      g.addColorStop(0.45, "#ffd700");
      g.addColorStop(1, "#b8860b");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#8b6914";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 255, 200, 0.9)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, rad * 0.72, 0, Math.PI * 2);
      ctx.stroke();
      const spikes = 5;
      const ir = rad * 0.28;
      const or = rad * 0.5;
      ctx.fillStyle = "rgba(255, 248, 200, 0.95)";
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i += 1) {
        const rr = i % 2 === 0 ? or : ir;
        const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI * 0.5;
        const px = Math.cos(a) * rr;
        const py = Math.sin(a) * rr;
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawCoins = () => {
      const br = CONFIG.coinRadius;
      gameState.coinItems.forEach((c) => {
        if (c.popping) {
          drawCoinShape(c.x, c.y, br, Math.max(0, c.popAlpha), c.popScale, 1);
        } else {
          const spin = 0.35 + Math.abs(Math.cos(gameState.time * 3.2 + c.phase)) * 0.65;
          drawCoinShape(c.x, c.y, br, 1, 1, spin);
        }
      });
    };

    const drawHex = (cx, cy, s) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i += 1) {
        const a = (i / 6) * Math.PI * 2 - Math.PI * 0.5;
        const px = cx + Math.cos(a) * s;
        const py = cy + Math.sin(a) * s;
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
    };

    const drawPowerUpIcon = (type, x, y, s) => {
      ctx.save();
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      if (type === "shield") {
        ctx.fillStyle = "#ffffff";
        drawHex(x, y, s);
        ctx.fill();
        ctx.fillStyle = rgb(CONFIG.powerColors.shield);
        drawHex(x, y, s * 0.55);
        ctx.fill();
      } else if (type === "slowMo") {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = s * 0.24;
        ctx.beginPath();
        ctx.moveTo(x - s * 0.6, y - s);
        ctx.lineTo(x + s * 0.6, y - s);
        ctx.moveTo(x - s * 0.6, y + s);
        ctx.lineTo(x + s * 0.6, y + s);
        ctx.moveTo(x - s * 0.5, y - s);
        ctx.lineTo(x + s * 0.5, y + s);
        ctx.moveTo(x + s * 0.5, y - s);
        ctx.lineTo(x - s * 0.5, y + s);
        ctx.stroke();
      } else if (type === "magnet") {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = s * 0.42;
        ctx.beginPath();
        ctx.moveTo(x - s * 0.62, y - s * 0.75);
        ctx.lineTo(x - s * 0.62, y);
        ctx.arc(x, y, s * 0.62, Math.PI, 0, true);
        ctx.lineTo(x + s * 0.62, y - s * 0.75);
        ctx.stroke();
        ctx.strokeStyle = "#ffe08a";
        ctx.beginPath();
        ctx.moveTo(x - s * 0.62, y - s * 0.95);
        ctx.lineTo(x - s * 0.62, y - s * 0.62);
        ctx.moveTo(x + s * 0.62, y - s * 0.95);
        ctx.lineTo(x + s * 0.62, y - s * 0.62);
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawPowerUps = () => {
      gameState.powerUpItems.forEach((pu) => {
        const col = CONFIG.powerColors[pu.type];
        const y = pu.y + Math.sin(gameState.time * 3 + pu.phase) * 4;
        const glow = ctx.createRadialGradient(pu.x, y, pu.r * 0.4, pu.x, y, pu.r * 1.9);
        glow.addColorStop(0, rgb(col, 0.5));
        glow.addColorStop(1, rgb(col, 0));
        ctx.fillStyle = glow;
        ctx.fillRect(pu.x - pu.r * 1.9, y - pu.r * 1.9, pu.r * 3.8, pu.r * 3.8);
        const orb = ctx.createRadialGradient(pu.x - pu.r * 0.35, y - pu.r * 0.4, pu.r * 0.1, pu.x, y, pu.r);
        orb.addColorStop(0, rgb(mixColor(col, [255, 255, 255], 0.6)));
        orb.addColorStop(1, rgb(col));
        ctx.fillStyle = orb;
        ctx.beginPath();
        ctx.arc(pu.x, y, pu.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 2;
        ctx.stroke();
        drawPowerUpIcon(pu.type, pu.x, y, pu.r * 0.55);
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.beginPath();
        ctx.ellipse(pu.x - pu.r * 0.4, y - pu.r * 0.5, pu.r * 0.25, pu.r * 0.12, -0.6, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const effectRemaining = (key) => {
      return Math.max(0, gameState.activeEffects[key] || 0);
    };

    const drawEffectRing = (bx, by, key) => {
      const rem = effectRemaining(key);
      if (rem <= 0) {
        return;
      }
      const col = CONFIG.powerColors[key];
      const offsets = { shield: 9, slowMo: 14, magnet: 19 };
      const r = CONFIG.birdRadius + offsets[key];
      const total = CONFIG.effectDurationMs / 1000;
      const frac = Math.min(1, rem / total);
      const blinkOff = rem < 1.2 && Math.sin(gameState.time * 24) < 0;
      ctx.save();
      ctx.translate(bx, by);
      if (key === "shield") {
        const bubble = ctx.createRadialGradient(-6, -8, 4, 0, 0, r);
        bubble.addColorStop(0, "rgba(255, 255, 255, 0.05)");
        bubble.addColorStop(1, rgb(col, blinkOff ? 0.1 : 0.32));
        ctx.fillStyle = bubble;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = rgb(col, blinkOff ? 0.35 : 0.9);
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, 0, r, -Math.PI * 0.5, -Math.PI * 0.5 + Math.PI * 2 * frac);
      ctx.stroke();
      ctx.restore();
    };

    const drawHUD = () => {
      const gw = gameState.view.gw;
      const pad = 12;
      ctx.save();
      ctx.lineJoin = "round";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.font = `${CONFIG.hudFontPx}px ${CONFIG.pixelFont}`;
      ctx.lineWidth = 9;
      ctx.strokeStyle = "#3b2a14";
      ctx.strokeText(String(gameState.score), gw * 0.5, 34);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(String(gameState.score), gw * 0.5, 34);

      const beating = gameState.prevHighScore > 0 && gameState.score > gameState.prevHighScore;
      ctx.font = `bold ${CONFIG.hudSmallPx}px ${CONFIG.uiFont}`;
      ctx.lineWidth = 4;
      const bestText = beating ? "YENİ REKOR!" : `REKOR ${gameState.highScore}`;
      ctx.strokeText(bestText, gw * 0.5, 80);
      ctx.fillStyle = beating ? "#ffd54a" : "#fff4cf";
      ctx.fillText(bestText, gw * 0.5, 80);

      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(20, 28, 60, 0.38)";
      roundRectPath(pad, 16, 82, 32, 16);
      ctx.fill();
      drawCoinShape(pad + 17, 32, 10, 1, 1, 1);
      ctx.font = `13px ${CONFIG.pixelFont}`;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(String(gameState.coins), pad + 34, 33);

      let py = 56;
      ["shield", "slowMo", "magnet"].forEach((key) => {
        const rem = effectRemaining(key);
        if (rem <= 0) {
          return;
        }
        const col = CONFIG.powerColors[key];
        const frac = Math.min(1, rem / (CONFIG.effectDurationMs / 1000));
        ctx.fillStyle = "rgba(20, 28, 60, 0.42)";
        roundRectPath(pad, py, 112, 26, 13);
        ctx.fill();
        ctx.fillStyle = rgb(col, 0.55);
        roundRectPath(pad, py, Math.max(26, 112 * frac), 26, 13);
        ctx.fill();
        ctx.fillStyle = rgb(col);
        ctx.beginPath();
        ctx.arc(pad + 13, py + 13, 9, 0, Math.PI * 2);
        ctx.fill();
        drawPowerUpIcon(key, pad + 13, py + 13, 5);
        ctx.font = `bold 12px ${CONFIG.uiFont}`;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`${CONFIG.effectLabels[key]} ${rem.toFixed(1)}`, pad + 28, py + 13.5);
        py += 32;
      });
      ctx.restore();
    };

    const drawStartOverlay = () => {
      const gw = gameState.view.gw;
      const cx = gw * 0.5;
      const pulse = (gameState.blinkT * 0.5) % 1;
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineJoin = "round";
      ctx.font = `${Math.min(22, gw * 0.068)}px ${CONFIG.pixelFont}`;
      ctx.lineWidth = 8;
      ctx.strokeStyle = "#3b2a14";
      ctx.strokeText("HAZIR MISIN?", cx, 140);
      ctx.fillStyle = "#ffd54a";
      ctx.fillText("HAZIR MISIN?", cx, 140);
      ctx.font = `bold 17px ${CONFIG.uiFont}`;
      ctx.lineWidth = 5;
      ctx.strokeText("Uçmak için ekrana dokun", cx, 184);
      ctx.fillStyle = "#ffffff";
      ctx.fillText("Uçmak için ekrana dokun", cx, 184);
      ctx.font = `bold 13px ${CONFIG.uiFont}`;
      ctx.lineWidth = 4;
      ctx.strokeText("ya da Boşluk tuşuna bas", cx, 207);
      ctx.fillStyle = "#fff4cf";
      ctx.fillText("ya da Boşluk tuşuna bas", cx, 207);

      const ty = groundY() - 120;
      ctx.strokeStyle = `rgba(255, 255, 255, ${1 - pulse})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, ty, 14 + pulse * 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
      ctx.beginPath();
      ctx.arc(cx, ty, 11 - Math.sin(pulse * Math.PI) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx - 10, ty - 44);
      ctx.lineTo(cx, ty - 54);
      ctx.lineTo(cx + 10, ty - 44);
      ctx.stroke();
      ctx.restore();
    };

    const birdHitbox = () => {
      const r = CONFIG.birdRadius;
      if (gameState.phase === "dead" || gameState.phase === "over") {
        return { bx: gameState.bird.deathX, by: gameState.bird.deathY, r };
      }
      return { bx: birdX(), by: gameState.bird.y, r };
    };

    const birdCollisionBox = () => {
      const h = birdHitbox();
      return { bx: h.bx, by: h.by, r: h.r * CONFIG.birdHitboxScale };
    };

    const circleHitsRect = (cx, cy, r, rc) => {
      const nx = Math.max(rc.x, Math.min(cx, rc.x + rc.w));
      const ny = Math.max(rc.y, Math.min(cy, rc.y + rc.h));
      const dx = cx - nx;
      const dy = cy - ny;
      return dx * dx + dy * dy < r * r;
    };

    const pulseFx = (el, key) => {
      el.dataset[key] = "false";
      void el.offsetWidth;
      el.dataset[key] = "true";
    };

    const checkCollisions = () => {
      if (gameState.phase !== "playing") {
        return;
      }
      const { bx, by, r } = birdCollisionBox();
      const vis = birdHitbox();
      const gy = groundY();
      const shield = gameState.activeEffects.shield > 0;

      if (by + r >= gy) {
        if (shield) {
          gameState.bird.y = gy - vis.r - 1;
          gameState.bird.vy = -CONFIG.flapStrength * 0.85;
          gameState.bird.flapBoost = 1;
          playFlap();
          spawnParticles(vis.bx, gy - 4, 8, ["#8be04e", "#ffffff", "#5dade2"], "spark");
        } else {
          gameState.bird.y = Math.min(gameState.bird.y, gy - vis.r * 0.85);
          triggerDeath();
          return;
        }
      }

      if (!shield) {
        const hit = gameState.pipes.some((p) => pipeRects(p).some((rc) => circleHitsRect(bx, by, r, rc)));
        if (hit) {
          triggerDeath();
          return;
        }
      }

      gameState.coinItems.forEach((c) => {
        if (c.popping) {
          return;
        }
        const dx = vis.bx - c.x;
        const dy = vis.by - c.y;
        if (dx * dx + dy * dy < (vis.r + CONFIG.coinRadius) ** 2) {
          c.popping = true;
          c.popScale = 1;
          c.popAlpha = 1;
          gameState.score += CONFIG.coinValue;
          gameState.coins += 1;
          playCoin();
          spawnParticles(c.x, c.y, 10, ["#ffd700", "#fff9c4", "#f1c40f"], "spark");
          addPopup(c.x, c.y - 22, `+${CONFIG.coinValue}`, "#ffd54a");
        }
      });

      for (let pi = gameState.powerUpItems.length - 1; pi >= 0; pi -= 1) {
        const pu = gameState.powerUpItems[pi];
        const dx = vis.bx - pu.x;
        const dy = vis.by - pu.y;
        if (dx * dx + dy * dy < (vis.r + pu.r) ** 2) {
          gameState.activeEffects[pu.type] = CONFIG.effectDurationMs / 1000;
          playPower();
          spawnParticles(pu.x, pu.y, 16, [rgb(CONFIG.powerColors[pu.type]), "#ffffff", "#ffe08a"], "spark");
          addPopup(pu.x, pu.y - 26, CONFIG.effectLabels[pu.type].toLocaleUpperCase("tr-TR"), rgb(mixColor(CONFIG.powerColors[pu.type], [255, 255, 255], 0.45)));
          gameState.powerUpItems.splice(pi, 1);
        }
      }
    };

    const triggerDeath = () => {
      const bird = gameState.bird;
      gameState.phase = "dead";
      stage.dataset.phase = "dead";
      bird.deathX = birdX();
      bird.deathY = bird.y;
      bird.deathVy = bird.y + CONFIG.birdRadius >= groundY() - 2 ? 0 : -200;
      bird.deathT = 0;
      bird.landed = false;
      playHit();
      playDeath();
      pulseFx(canvas, "shake");
      pulseFx(flashEl, "active");
      spawnParticles(bird.deathX, bird.deathY, 12, ["#f7d33c", "#fff6b5", "#e67e22"], "feather");
      if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        saveHigh();
      }
    };

    const spawnPipe = (x) => {
      const gy = groundY();
      const gap = currentGap();
      const minY = CONFIG.gapMargin + gap * 0.5;
      const maxY = gy - CONFIG.gapMargin - gap * 0.5;
      const lo = Math.max(minY, gameState.lastGapY - CONFIG.maxGapShift);
      const hi = Math.min(maxY, gameState.lastGapY + CONFIG.maxGapShift);
      const gapY = lo + Math.random() * Math.max(0, hi - lo);
      const hadPrev = gameState.pipes.length > 0;
      const pipe = {
        x,
        gapY,
        gapSize: gap,
        passed: false,
      };
      gameState.pipes.push(pipe);
      gameState.lastGapY = gapY;

      const coinRoll = Math.random();
      if (coinRoll > 0.08) {
        gameState.coinItems.push({
          x: pipe.x + CONFIG.pipeWidth * 0.5,
          y: gapY,
          popping: false,
          popScale: 1,
          popAlpha: 1,
          phase: Math.random() * Math.PI * 2,
        });
      }

      if (hadPrev && Math.random() < CONFIG.powerUpChance) {
        const types = ["shield", "slowMo", "magnet"];
        const type = types[Math.floor(Math.random() * types.length)];
        gameState.powerUpItems.push({
          x: pipe.x - currentSpawnSpan() * 0.5 + CONFIG.pipeWidth * 0.5,
          y: gapY,
          r: CONFIG.powerUpRadius,
          type,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    const resetGame = () => {
      gameState.phase = "ready";
      stage.dataset.phase = "ready";
      gameState.score = 0;
      gameState.coins = 0;
      gameState.skyScore = 0;
      gameState.prevHighScore = gameState.highScore;
      gameState.pipes = [];
      gameState.coinItems = [];
      gameState.powerUpItems = [];
      gameState.particles = [];
      gameState.popups = [];
      gameState.lastGapY = groundY() * 0.5;
      gameState.bird.y = restY();
      gameState.bird.vy = 0;
      gameState.bird.angle = 0;
      gameState.bird.bob = 0;
      gameState.bird.flapBoost = 0;
      gameState.bird.landed = false;
      gameState.bird.deathT = 0;
      gameState.activeEffects = { shield: 0, slowMo: 0, magnet: 0 };
      copyBtn.dataset.copied = "false";
      copyBtn.textContent = "Kopyala";
      confettiEl.innerHTML = "";
    };

    const flap = () => {
      resumeAudio();
      if (gameState.phase === "ready") {
        gameState.phase = "playing";
        stage.dataset.phase = "playing";
      }
      if (gameState.phase !== "playing") {
        return;
      }
      const bird = gameState.bird;
      bird.vy = -CONFIG.flapStrength;
      bird.flapBoost = 1;
      playFlap();
      spawnParticles(birdX() - CONFIG.birdRadius * 0.7, bird.y + 6, CONFIG.particleFlapCount, ["rgba(255, 255, 255, 0.85)", "#fff4c2", "#ffe9a8"], "puff");
    };

    const updatePlaying = (dt) => {
      const gw = gameState.view.gw;
      const bird = gameState.bird;
      const r = CONFIG.birdRadius;
      Object.keys(gameState.activeEffects).forEach((key) => {
        gameState.activeEffects[key] = Math.max(0, gameState.activeEffects[key] - dt);
      });

      bird.vy = Math.min(CONFIG.maxFallSpeed, bird.vy + CONFIG.gravity * dt);
      bird.y += bird.vy * dt;
      if (bird.y < r) {
        bird.y = r;
        bird.vy = Math.max(0, bird.vy);
      }
      bird.flapBoost = Math.max(0, bird.flapBoost - dt * 2.6);
      bird.wingT += dt * (9 + 26 * bird.flapBoost);
      const targetAngle = bird.vy < 0 ? -0.42 : Math.min(1.35, -0.42 + (bird.vy / CONFIG.maxFallSpeed) * 2.1);
      const rate = targetAngle < bird.angle ? 16 : 4.5;
      bird.angle += (targetAngle - bird.angle) * Math.min(1, dt * rate);

      const spd = pipeSpeedNow();
      gameState.scroll += spd * dt;
      gameState.pipes.forEach((p) => {
        p.x -= spd * dt;
      });
      gameState.coinItems.forEach((c) => {
        c.x -= spd * dt;
        if (c.popping) {
          c.popScale += dt * 3.2;
          c.popAlpha -= dt * 2.4;
        }
      });
      gameState.powerUpItems.forEach((pu) => {
        pu.x -= spd * dt;
      });

      if (gameState.activeEffects.magnet > 0) {
        const bx = birdX();
        gameState.coinItems.forEach((c) => {
          if (c.popping) {
            return;
          }
          const dx = bx - c.x;
          const dy = bird.y - c.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          if (d < CONFIG.magnetRange) {
            const step = Math.min(d, CONFIG.magnetStrength * dt);
            c.x += (dx / d) * step;
            c.y += (dy / d) * step;
          }
        });
      }

      gameState.coinItems = gameState.coinItems.filter((c) => !(c.popping && c.popAlpha <= 0) && c.x > -40);

      const passX = birdX() - r * CONFIG.birdHitboxScale;
      gameState.pipes.forEach((p) => {
        if (!p.passed && p.x + CONFIG.pipeWidth < passX) {
          p.passed = true;
          gameState.score += CONFIG.passScoreInterval;
          playPass();
          addPopup(birdX(), bird.y - 34, `+${CONFIG.passScoreInterval}`, "#ffffff");
        }
      });

      gameState.pipes = gameState.pipes.filter((p) => p.x > -CONFIG.pipeWidth - CONFIG.pipeCapOverhang * 2 - 10);
      gameState.powerUpItems = gameState.powerUpItems.filter((p) => p.x > -40);

      const last = gameState.pipes[gameState.pipes.length - 1];
      if (!last) {
        spawnPipe(gw + 40);
      } else {
        const spacing = currentSpawnSpan();
        if (last.x + spacing <= gw + 40) {
          spawnPipe(last.x + spacing);
        }
      }

      checkCollisions();
    };

    const showResult = () => {
      gameState.phase = "over";
      stage.dataset.phase = "over";
      const score = gameState.score;
      const rewards = CONFIG.rewards;
      const tierIndex = rewards.reduce((acc, t, i) => (score >= t.min ? i : acc), 0);
      const tier = rewards[tierIndex];
      const next = rewards[tierIndex + 1];
      const c = tier.colors;
      medalSlot.innerHTML = `
<svg class="fb-medal" viewBox="0 0 120 136" aria-hidden="true">
<defs>
<linearGradient id="fbMedalFace" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${c[0]}"/>
<stop offset="0.55" stop-color="${c[1]}"/>
<stop offset="1" stop-color="${c[2]}"/>
</linearGradient>
</defs>
<path d="M30 2h24l16 48H46z" fill="#e8542a"/>
<path d="M30 2h8l16 48h-8z" fill="#ff8a5c"/>
<path d="M90 2H66L50 50h24z" fill="#2f80ed"/>
<path d="M90 2h-8L66 50h8z" fill="#5a9ff5"/>
<circle cx="60" cy="88" r="44" fill="${c[2]}"/>
<circle cx="60" cy="86" r="40" fill="url(#fbMedalFace)"/>
<circle cx="60" cy="86" r="30" fill="none" stroke="${c[0]}" stroke-width="3" stroke-dasharray="4 4" opacity="0.85"/>
<path d="M60 66L64.7 79.5L79.1 80.4L67.6 88.5L71.6 102.6L60 94L48.4 102.6L52.4 88.5L40.9 80.4L55.3 79.5Z" fill="${c[0]}" stroke="${c[2]}" stroke-width="2.5" stroke-linejoin="round"/>
<ellipse cx="42" cy="66" rx="12" ry="6" fill="#ffffff" opacity="0.5" transform="rotate(-30 42 66)"/>
</svg>`;
      tierEl.textContent = tier.title;
      resScoreEl.textContent = String(score);
      resBestEl.textContent = String(gameState.highScore);
      resCoinsEl.textContent = String(gameState.coins);
      resDiscountEl.textContent = tier.discount;
      codeEl.textContent = tier.code;
      nextEl.textContent = next ? `${next.title} ve ${next.discount} indirim için ${next.min - score} puan daha topla!` : "En büyük ödülü kazandın, tebrikler!";
      bestValueEl.textContent = String(gameState.highScore);
      const isRecord = score > gameState.prevHighScore && score > 0;
      recordEl.dataset.visible = isRecord ? "true" : "false";
      confettiEl.innerHTML = "";
      if (isRecord || tierIndex > 0) {
        for (let i = 0; i < CONFIG.confettiCount; i += 1) {
          const piece = document.createElement("i");
          piece.style.left = `${Math.random() * 100}%`;
          piece.style.background = CONFIG.confettiColors[i % CONFIG.confettiColors.length];
          piece.style.animationDelay = `${(Math.random() * 0.9).toFixed(2)}s`;
          piece.style.animationDuration = `${(2.2 + Math.random() * 1.4).toFixed(2)}s`;
          confettiEl.appendChild(piece);
        }
      }
      playPower();
    };

    const updateDead = (dt) => {
      const bird = gameState.bird;
      const gy = groundY();
      const r = CONFIG.birdRadius;
      bird.deathT += dt;
      if (!bird.landed) {
        bird.deathVy = Math.min(CONFIG.maxFallSpeed * 1.4, bird.deathVy + CONFIG.deathGravity * dt);
        bird.deathY += bird.deathVy * dt;
        if (bird.deathY >= gy - r * 0.85) {
          bird.deathY = gy - r * 0.85;
          bird.landed = true;
          playNoise("lowpass", 600, 120, 0.12, 0.25, 0);
          spawnParticles(bird.deathX, gy - 2, 8, ["#ded895", "#c9b96b", "#8be04e"], "spark");
        }
      }
      bird.angle += (Math.PI * 0.5 - bird.angle) * Math.min(1, dt * 7);
      if (bird.landed && bird.deathT >= CONFIG.resultDelayMs / 1000) {
        showResult();
      }
    };

    const updateStart = (dt) => {
      const bird = gameState.bird;
      bird.bob += CONFIG.bobSpeed * dt;
      bird.wingT += dt * 12;
      bird.y = restY() + Math.sin(bird.bob) * CONFIG.bobAmp;
      bird.angle = Math.sin(bird.bob * 0.8) * 0.1;
      gameState.scroll += CONFIG.basePipeSpeed * dt;
    };

    const render = () => {
      const v = gameState.view;
      ctx.setTransform(v.dpr * v.scale, 0, 0, v.dpr * v.scale, 0, 0);
      const pal = skyPalette(gameState.skyScore);
      drawBackground(pal);
      drawPipes();
      drawCoins();
      drawPowerUps();
      drawGround();
      if (pal.night > 0) {
        ctx.fillStyle = `rgba(8, 12, 40, ${pal.night * 0.25})`;
        ctx.fillRect(0, 0, v.gw, v.gh);
      }

      const bird = gameState.bird;
      const dead = gameState.phase === "dead" || gameState.phase === "over";
      const { bx, by } = birdHitbox();
      let wing = Math.sin(bird.wingT) * 0.85;
      if (dead) {
        wing = 0.4;
      } else if (gameState.phase === "playing" && bird.vy > 380 && bird.flapBoost < 0.05) {
        wing = 0.7;
      }
      if (gameState.phase === "playing") {
        drawEffectRing(bx, by, "shield");
        drawEffectRing(bx, by, "slowMo");
        drawEffectRing(bx, by, "magnet");
      }
      drawBird(bx, by, bird.angle, wing, dead);
      drawParticles();
      drawPopups();
      if (gameState.phase === "playing" || gameState.phase === "dead") {
        drawHUD();
      }
      if (gameState.phase === "ready") {
        drawStartOverlay();
      }
    };

    const step = (dt) => {
      gameState.time += dt;
      gameState.blinkT += CONFIG.blinkSpeed * dt;
      gameState.skyScore += (gameState.score - gameState.skyScore) * Math.min(1, dt * 1.5);
      if (gameState.phase === "playing") {
        updatePlaying(dt);
      } else if (gameState.phase === "dead") {
        updateDead(dt);
      } else if (gameState.phase === "start" || gameState.phase === "ready") {
        updateStart(dt);
      }
      updateParticles(dt);
    };

    const loop = (t) => {
      gameState.animFrameId = requestAnimationFrame(loop);
      if (!gameState.lastTime) {
        gameState.lastTime = t;
      }
      const dt = Math.min(0.1, Math.max(0, (t - gameState.lastTime) / 1000));
      gameState.lastTime = t;
      const steps = Math.max(1, Math.ceil(dt / CONFIG.maxStep));
      for (let i = 0; i < steps; i += 1) {
        step(dt / steps);
      }
      render();
    };

    const applyResize = () => {
      const cw = Math.max(1, stage.clientWidth);
      const ch = Math.max(1, stage.clientHeight);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const v = gameState.view;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      v.dpr = dpr;
      v.scale = ch / CONFIG.worldHeight;
      v.gw = cw / v.scale;
      v.gh = CONFIG.worldHeight;
    };

    const scheduleResize = () => {
      if (gameState.resizeRaf) {
        cancelAnimationFrame(gameState.resizeRaf);
      }
      gameState.resizeRaf = requestAnimationFrame(() => {
        gameState.resizeRaf = 0;
        applyResize();
        render();
      });
    };

    const onPointerDown = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) {
        return;
      }
      if (gameState.phase !== "ready" && gameState.phase !== "playing") {
        return;
      }
      e.preventDefault();
      flap();
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        closeGame();
        return;
      }
      if (e.code !== "Space" && e.key !== " ") {
        return;
      }
      if (gameState.phase !== "ready" && gameState.phase !== "playing") {
        return;
      }
      e.preventDefault();
      if (!e.repeat) {
        flap();
      }
    };

    const onVisibility = () => {
      gameState.lastTime = 0;
    };

    const copyCode = () => {
      const code = codeEl.textContent;
      const done = () => {
        copyBtn.dataset.copied = "true";
        copyBtn.textContent = "Kopyalandı!";
        playTone("sine", 1319, 1319, 0.12, 0.08, 0);
      };
      const fallback = () => {
        const ta = document.createElement("textarea");
        ta.value = code;
        ta.setAttribute("readonly", "");
        ta.className = "fb-copy-helper";
        stage.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
        } catch (e) {}
        ta.remove();
        done();
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(code).then(done).catch(fallback);
      } else {
        fallback();
      }
    };

    const destroy = () => {
      cancelAnimationFrame(gameState.animFrameId);
      if (gameState.resizeRaf) {
        cancelAnimationFrame(gameState.resizeRaf);
      }
      window.removeEventListener("resize", scheduleResize);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("visibilitychange", onVisibility);
      if (gameState.audioCtx) {
        try {
          gameState.audioCtx.close();
        } catch (e) {}
      }
      root.remove();
      styleEl.remove();
    };

    const onRootAnimationEnd = (e) => {
      if (e.target !== root) {
        return;
      }
      root.removeEventListener("animationend", onRootAnimationEnd);
      root.dataset.state = "close";
      destroy();
    };

    const closeGame = () => {
      if (root.dataset.state !== "open") {
        return;
      }
      root.dataset.state = "closing";
      root.addEventListener("animationend", onRootAnimationEnd);
    };

    initStars();
    applyResize();
    gameState.bird.y = restY();
    gameState.animFrameId = requestAnimationFrame(loop);

    window.addEventListener("resize", scheduleResize);
    window.addEventListener("keydown", onKeyDown, { passive: false });
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("pointerdown", onPointerDown, { passive: false });
    canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
    canvas.addEventListener("animationend", () => {
      canvas.dataset.shake = "false";
    });
    flashEl.addEventListener("animationend", () => {
      flashEl.dataset.active = "false";
    });
    closeBtn.addEventListener("click", closeGame);
    copyBtn.addEventListener("click", copyCode);
    startBtn.addEventListener("click", () => {
      startBtn.blur();
      resumeAudio();
      resetGame();
    });
    startBtn.addEventListener(
      "click",
      () => {
        try {
          const _vlc = "<%VLSendClickFunc%>";
          if (_vlc.indexOf("<%") === -1) {
            new Function(_vlc)();
          }
        } catch (e) {}
      },
      { once: true },
    );
    replayBtn.addEventListener("click", () => {
      replayBtn.blur();
      resumeAudio();
      resetGame();
    });

    try {
      const _vli = "<%VLSendImpressionFunc%>";
      if (_vli.indexOf("<%") === -1) {
        new Function(_vli)();
      }
    } catch (e) {}
};

initFlippyBird();
