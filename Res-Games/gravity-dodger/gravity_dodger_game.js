const initGravityDodger = () => {
  if (document.querySelector("#gd-root")) {
    return;
  }
  const CONFIG = {
    gravity: 2.15,
    flapStrength: -0.66,
    maxFallSpeed: 0.8,
    gameSpeed: 0.26,
    speedRamp: 0.45,
    pumpkinSpawnInterval: 0.95,
    batSpawnInterval: 1.55,
    batMinInterval: 0.8,
    batFlapSpeed: 14,
    targetScore: 15,
    maxAttempts: 5,
    gameDuration: 30,
    invulnTime: 1.3,
    endDelay: 0.9,
    maxDt: 0.05,
    rewardCode: "BUYU15",
    landscapeShortEdge: 520,
    landscapeWitchScaleMul: 0.82,
    landscapeSpeedMul: 1.08,
    witchX: 0.22,
    hitboxShrink: 0.55,
    parallaxSlow: 0.3,
    parallaxFast: 0.6,
    cloudCount: 5,
    witchScale: 0.17,
    pumpkinRadius: 0.045,
    batRadius: 0.042,
    bgSilhouettes: {
      slowFill: "#2a1342",
      fastFill: "#12081d",
    },
  };
  const styleEl = document.createElement("style");
  styleEl.id = "gd-style";
  styleEl.textContent = `
#gd-root {
--gd-navy: #002d5b;
--gd-green: #76b82a;
--gd-white: #ffffff;
position: fixed;
inset: 0;
width: 100vw;
height: 100vh;
z-index: 9999;
margin: 0;
padding: 0;
overflow: hidden;
font-size: min(3.2vw, 2.8vh);
touch-action: manipulation;
user-select: none;
-webkit-user-select: none;
-webkit-tap-highlight-color: transparent;
padding-top: env(safe-area-inset-top, 0);
padding-right: env(safe-area-inset-right, 0);
padding-bottom: env(safe-area-inset-bottom, 0);
padding-left: env(safe-area-inset-left, 0);
box-sizing: border-box;
}
#gd-root.gd-landscape-mobile {
font-size: min(2.4vw, 3.2vh);
}
#gd-root[data-state="closing"] {
animation: gd-fade-out 0.28s ease forwards;
pointer-events: none;
}
@keyframes gd-fade-out {
0% {
opacity: 1;
transform: scale(1);
}
100% {
opacity: 0;
transform: scale(0.98);
}
}
@keyframes gd-card-in {
0% {
opacity: 0;
transform: translateY(1.2em) scale(0.96);
}
100% {
opacity: 1;
transform: translateY(0) scale(1);
}
}
@keyframes gd-pop {
0% {
opacity: 0;
transform: scale(0.4);
}
60% {
opacity: 1;
transform: scale(1.12);
}
100% {
opacity: 1;
transform: scale(1);
}
}
@keyframes gd-cta-pulse {
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
@keyframes gd-pulse {
0% {
opacity: 0.55;
}
50% {
opacity: 1;
}
100% {
opacity: 0.55;
}
}
@keyframes gd-tap {
0% {
transform: translateY(0) scale(1);
}
40% {
transform: translateY(0.25em) scale(0.9);
}
100% {
transform: translateY(0) scale(1);
}
}
@keyframes gd-hud-bump {
0% {
transform: scale(1);
}
40% {
transform: scale(1.35);
}
100% {
transform: scale(1);
}
}
#gd-close {
position: absolute;
top: 0.75em;
right: 0.75em;
z-index: 10002;
width: 2.25em;
height: 2.25em;
border: none;
border-radius: 50%;
background: rgba(0,0,0,0.45);
color: var(--gd-white);
font-size: 1.35em;
line-height: 1;
cursor: pointer;
display: flex;
align-items: center;
justify-content: center;
transition: transform 0.2s ease, opacity 0.2s ease;
}
@media (hover: hover) and (pointer: fine) {
#gd-close:hover {
transform: scale(1.12);
}
}
.gd-screen {
position: absolute;
inset: 0;
display: none;
flex-direction: column;
align-items: center;
justify-content: center;
padding: 1em;
box-sizing: border-box;
overflow-y: auto;
-webkit-overflow-scrolling: touch;
}
.gd-step-shell {
position: relative;
z-index: 2;
width: 100%;
max-width: 26em;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
flex: 0 0 auto;
margin: auto;
min-height: 0;
}
.gd-step-card {
width: 100%;
box-sizing: border-box;
background: rgba(255, 255, 255, 0.28);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border-radius: 1.25em;
padding: 1.35em 1.2em 1.45em;
display: flex;
flex-direction: column;
align-items: center;
text-align: center;
box-shadow:
0 0.35em 1.2em rgba(0, 45, 91, 0.12),
inset 0 1px 0 rgba(255, 255, 255, 0.55);
border: 1px solid rgba(255, 255, 255, 0.45);
animation: gd-card-in 0.45s ease both;
}
.gd-step-pill {
font-family: system-ui, sans-serif;
font-size: 0.68em;
font-weight: 700;
letter-spacing: 0.04em;
text-transform: uppercase;
color: var(--gd-navy);
background: rgba(255, 255, 255, 0.55);
padding: 0.35em 0.75em;
border-radius: 999px;
margin: 0 0 0.85em;
line-height: 1.2;
}
.gd-step-divider {
width: 3.5em;
height: 0.2em;
border-radius: 999px;
background: linear-gradient(90deg, transparent, rgba(0, 45, 91, 0.25), transparent);
margin: 0 0 0.9em;
flex-shrink: 0;
}
.gd-intro-bullets {
list-style: none;
margin: 0 0 1em;
padding: 0;
width: 100%;
max-width: 22em;
text-align: left;
}
.gd-intro-bullets li {
font-family: system-ui, sans-serif;
font-size: 0.82em;
font-weight: 500;
color: var(--gd-navy);
line-height: 1.45;
margin: 0 0 0.45em;
padding-left: 1.35em;
position: relative;
}
.gd-intro-bullets li::before {
content: "";
position: absolute;
left: 0;
top: 0.45em;
width: 0.45em;
height: 0.45em;
border-radius: 50%;
background: var(--gd-green);
opacity: 0.85;
}
.gd-end-stats-row {
display: flex;
flex-direction: row;
flex-wrap: wrap;
align-items: stretch;
justify-content: center;
gap: 0.65em;
width: 100%;
max-width: 22em;
margin: 0 0 1em;
}
.gd-end-stat {
flex: 1 1 5.5em;
min-width: 5em;
background: rgba(255, 255, 255, 0.4);
border-radius: 0.75em;
padding: 0.55em 0.45em;
font-family: system-ui, sans-serif;
}
.gd-end-stat-val {
font-weight: 800;
font-size: 1.05em;
color: var(--gd-navy);
line-height: 1.1;
}
.gd-end-stat-lab {
font-size: 0.58em;
font-weight: 600;
color: var(--gd-navy);
opacity: 0.75;
margin-top: 0.2em;
}
.gd-end-stat--wide {
flex: 1 1 100%;
max-width: 100%;
}
.gd-end-card--win .gd-step-card {
background: rgba(255, 255, 255, 0.32);
}
.gd-end-card--lose .gd-step-card {
background: rgba(255, 255, 255, 0.26);
}
#gd-root[data-state="intro"] #gd-screen-intro,
#gd-root[data-state="howto"] #gd-screen-howto,
#gd-root[data-state="game"] #gd-screen-game,
#gd-root[data-state="end-win"] #gd-screen-end-win,
#gd-root[data-state="end-lose"] #gd-screen-end-lose,
#gd-root[data-state="closing"][data-prev="intro"] #gd-screen-intro,
#gd-root[data-state="closing"][data-prev="howto"] #gd-screen-howto,
#gd-root[data-state="closing"][data-prev="game"] #gd-screen-game,
#gd-root[data-state="closing"][data-prev="end-win"] #gd-screen-end-win,
#gd-root[data-state="closing"][data-prev="end-lose"] #gd-screen-end-lose {
display: flex;
}
#gd-screen-intro,
#gd-screen-howto {
background: radial-gradient(circle at 50% 35%, #ff8c00 0%, #ff6a00 45%, #ff4500 100%);
}
#gd-screen-game {
padding: 0;
background: #160a2c;
}
#gd-screen-end-win {
background: radial-gradient(circle at 50% 40%, #7cfc00 0%, #32cd32 50%, #228b22 100%);
}
#gd-screen-end-lose {
background: radial-gradient(circle at 50% 35%, #ff8c00 0%, #ff6a00 45%, #ff4500 100%);
}
.gd-sil-canvas {
position: absolute;
left: 0;
right: 0;
bottom: 0;
width: 100%;
height: 38%;
pointer-events: none;
z-index: 0;
}
.gd-intro-content {
position: relative;
z-index: 1;
display: flex;
flex-direction: column;
align-items: center;
text-align: center;
max-width: 28em;
margin-top: 0.5em;
}
.gd-title {
font-family: system-ui, sans-serif;
font-weight: 800;
color: var(--gd-navy);
font-size: 1.55em;
margin: 0 0 0.45em;
line-height: 1.15;
}
.gd-end-inner .gd-title {
animation: gd-pop 0.6s cubic-bezier(0.2, 1.4, 0.4, 1) 0.15s both;
}
.gd-sub {
font-family: system-ui, sans-serif;
font-weight: 500;
color: var(--gd-navy);
font-size: 0.9em;
line-height: 1.5;
margin: 0 0 0.75em;
}
.gd-witch-wrap {
position: relative;
z-index: 1;
width: min(11em, 42vw);
height: min(9em, 34vw);
margin: 0.35em 0 0.85em;
animation: gd-witch-bob 3.2s ease-in-out infinite;
}
@keyframes gd-witch-bob {
0% {
transform: translateY(0);
}
50% {
transform: translateY(-0.85em);
}
100% {
transform: translateY(0);
}
}
#gd-intro-witch-canvas {
display: block;
width: 100%;
height: 100%;
}
.gd-btn {
font-family: system-ui, sans-serif;
font-weight: 700;
font-size: 1em;
color: var(--gd-white);
background: var(--gd-green);
border: none;
border-radius: 999px;
padding: 0.75em 1.35em;
cursor: pointer;
display: inline-flex;
align-items: center;
gap: 0.5em;
box-shadow: 0 0.2em 0 rgba(0,0,0,0.18);
transition: transform 0.15s ease, opacity 0.15s ease;
}
.gd-btn:active {
transform: translateY(0.1em);
box-shadow: 0 0.1em 0 rgba(0,0,0,0.18);
}
#gd-btn-start {
animation: gd-cta-pulse 1.6s ease-in-out infinite;
}
@media (hover: hover) and (pointer: fine) {
.gd-btn:hover {
transform: translateY(-0.06em);
}
}
.gd-btn--light {
background: var(--gd-navy);
font-size: 0.85em;
padding: 0.55em 1.1em;
}
.gd-btn--light[data-copied="true"] {
background: #16a34a;
}
.gd-code-box {
display: flex;
flex-direction: column;
align-items: center;
gap: 0.45em;
width: 100%;
max-width: 22em;
margin: 0 0 1em;
padding: 0.75em;
box-sizing: border-box;
background: rgba(255, 255, 255, 0.6);
border: 0.12em dashed rgba(0, 45, 91, 0.45);
border-radius: 0.85em;
animation: gd-pop 0.55s cubic-bezier(0.2, 1.4, 0.4, 1) 0.35s both;
}
.gd-code-lab {
font-family: system-ui, sans-serif;
font-size: 0.66em;
font-weight: 700;
letter-spacing: 0.06em;
text-transform: uppercase;
color: var(--gd-navy);
opacity: 0.8;
}
.gd-code-val {
font-family: ui-monospace, "Courier New", monospace;
font-size: 1.5em;
font-weight: 800;
letter-spacing: 0.12em;
color: var(--gd-navy);
line-height: 1.1;
}
.gd-copy-ta {
position: fixed;
left: -9999px;
top: 0;
opacity: 0;
}
.gd-howto-grid {
display: flex;
flex-direction: row;
align-items: flex-start;
justify-content: center;
gap: 1.25em;
margin: 0.75em 0 0.55em;
position: relative;
z-index: 1;
}
.gd-howto-col {
display: flex;
flex-direction: column;
align-items: center;
gap: 0.35em;
}
.gd-howto-mark {
font-size: 1.75em;
font-weight: 800;
line-height: 1;
}
.gd-howto-mark.ok {
color: #22c55e;
}
.gd-howto-mark.bad {
color: #ef4444;
}
.gd-howto-icon {
width: 5em;
height: 4.5em;
display: block;
}
.gd-howto-divider {
width: 1px;
align-self: stretch;
min-height: 5.5em;
background: rgba(0,45,91,0.35);
}
.gd-instruct-wrap {
width: 100%;
max-width: 22em;
margin: 0.5em auto 0.85em;
padding: 0.65em 0.75em;
background: rgba(255, 255, 255, 0.22);
border-radius: 0.85em;
border: 1px solid rgba(255, 255, 255, 0.35);
box-sizing: border-box;
}
.gd-instruct {
font-family: system-ui, sans-serif;
color: var(--gd-navy);
font-size: 0.82em;
line-height: 1.5;
text-align: center;
max-width: 100%;
margin: 0.3em 0;
position: relative;
z-index: 1;
}
.gd-instruct:first-child {
margin-top: 0;
}
.gd-instruct:last-child {
margin-bottom: 0;
}
.gd-instruct--tight {
margin-top: 0.15em;
margin-bottom: 0.35em;
font-size: 0.78em;
opacity: 0.92;
}
.gd-instruct strong {
font-weight: 800;
}
.gd-mini-witch {
width: 1.85em;
height: 1.55em;
display: block;
flex-shrink: 0;
}
#gd-game-canvas {
display: block;
width: 100%;
height: 100%;
touch-action: none;
cursor: pointer;
}
#gd-ready {
position: absolute;
left: 50%;
top: 64%;
transform: translate(-50%, -50%);
display: none;
flex-direction: column;
align-items: center;
gap: 0.3em;
padding: 0.7em 1.2em;
border-radius: 1em;
background: rgba(22, 10, 44, 0.5);
pointer-events: none;
z-index: 10001;
font-family: system-ui, sans-serif;
color: var(--gd-white);
text-align: center;
white-space: nowrap;
text-shadow: 0 0.1em 0.4em rgba(0, 0, 0, 0.5);
}
#gd-screen-game[data-phase="ready"] #gd-ready {
display: flex;
}
.gd-ready-hand {
font-size: 2em;
line-height: 1;
animation: gd-tap 1s ease-in-out infinite;
}
.gd-ready-title {
font-size: 1.2em;
font-weight: 800;
animation: gd-pulse 1.4s ease-in-out infinite;
}
.gd-ready-sub {
font-size: 0.72em;
font-weight: 600;
opacity: 0.85;
}
@media (pointer: coarse) {
.gd-ready-sub {
display: none;
}
}
#gd-hud {
position: absolute;
left: 50%;
bottom: max(0.5em, env(safe-area-inset-bottom, 0.5em));
transform: translateX(-50%);
display: flex;
flex-direction: row;
align-items: flex-end;
gap: 0.65em;
z-index: 10001;
font-family: system-ui, sans-serif;
color: var(--gd-navy);
pointer-events: none;
background: rgba(255, 255, 255, 0.72);
backdrop-filter: blur(8px);
-webkit-backdrop-filter: blur(8px);
padding: 0.35em 0.75em 0.4em;
border-radius: 999px;
box-shadow: 0 0.15em 0.5em rgba(0, 45, 91, 0.1);
}
#gd-root.gd-landscape-mobile #gd-hud {
bottom: auto;
top: max(0.45em, env(safe-area-inset-top, 0.45em));
transform: translateX(-50%);
padding: 0.28em 0.65em 0.32em;
gap: 0.5em;
}
#gd-root.gd-landscape-mobile .gd-hud-num {
font-size: 1.05em;
}
#gd-root.gd-landscape-mobile .gd-hud-lab {
font-size: 0.5em;
}
.gd-hud-cell {
display: flex;
flex-direction: column;
align-items: center;
min-width: 3.2em;
}
.gd-hud-num {
font-weight: 800;
font-size: 1.35em;
line-height: 1;
}
.gd-hud-cell[data-bump="true"] .gd-hud-num {
animation: gd-hud-bump 0.35s ease;
}
.gd-hud-cell[data-low="true"] .gd-hud-num {
color: #d61f1f;
}
.gd-hud-lab {
font-size: 0.55em;
font-weight: 600;
opacity: 0.9;
margin-top: 0.15em;
}
.gd-hud-sep {
font-weight: 700;
font-size: 1.1em;
opacity: 0.5;
padding-bottom: 0.35em;
}
#gd-end-stars-canvas {
position: absolute;
inset: 0;
width: 100%;
height: 100%;
pointer-events: none;
z-index: 0;
}
.gd-end-inner {
position: relative;
z-index: 1;
display: flex;
flex-direction: column;
align-items: center;
text-align: center;
width: 100%;
max-width: 26em;
padding: 0;
}
#gd-root.gd-landscape-mobile .gd-step-card {
padding: 1em 0.95em 1.1em;
}
#gd-root.gd-landscape-mobile .gd-witch-wrap {
width: min(8em, 28vw);
height: min(6.5em, 23vw);
margin: 0.25em 0 0.55em;
}
#gd-root.gd-landscape-mobile .gd-howto-icon {
width: 4.25em;
height: 3.85em;
}
#gd-root.gd-landscape-mobile .gd-intro-bullets {
margin-bottom: 0.65em;
}
@media (min-width: 768px) {
#gd-root {
font-size: min(2.1vw, 2.6vh);
}
.gd-title {
font-size: 1.75em;
}
}
@media (min-width: 1024px) {
#gd-root {
font-size: min(18px, 2.6vh);
}
}
@media (max-width: 767px) {
#gd-root:not(.gd-landscape-mobile) {
font-size: min(3.6vw, 2.8vh);
}
.gd-howto-grid {
gap: 0.85em;
}
}
@media (orientation: landscape) and (max-height: 520px) {
#gd-root:not(.gd-landscape-mobile) {
font-size: min(2.5vw, 4vh);
}
}
`;
  document.head.appendChild(styleEl);
  const root = document.createElement("div");
  root.id = "gd-root";
  root.dataset.state = "intro";
  const closeBtn = document.createElement("button");
  closeBtn.id = "gd-close";
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Kapat");
  closeBtn.textContent = "\u00d7";
  const screenIntro = document.createElement("div");
  screenIntro.id = "gd-screen-intro";
  screenIntro.className = "gd-screen";
  const introSil = document.createElement("canvas");
  introSil.className = "gd-sil-canvas";
  introSil.id = "gd-intro-sil-canvas";
  const introShell = document.createElement("div");
  introShell.className = "gd-step-shell";
  const introContent = document.createElement("div");
  introContent.className = "gd-intro-content gd-step-card";
  const introPill = document.createElement("div");
  introPill.className = "gd-step-pill";
  introPill.textContent = "Ad\u0131m 1 / 3 \u00b7 Kar\u015f\u0131lama";
  const introDivider = document.createElement("div");
  introDivider.className = "gd-step-divider";
  const introTitle = document.createElement("h1");
  introTitle.className = "gd-title";
  introTitle.textContent = "Gravity Dodger";
  const introSub = document.createElement("p");
  introSub.className = "gd-sub";
  introSub.textContent =
    "Cad\u0131lar Bayram\u0131 gecesi! S\u00fcp\u00fcrgesiyle s\u00fcz\u00fclen cad\u0131, b\u00fcy\u00fc kazan\u0131 i\u00e7in 15 parlayan balkaba\u011f\u0131 toplamal\u0131 \u2014 yaramaz yarasa s\u00fcr\u00fcs\u00fc ise her yerde!";
  const introBullets = document.createElement("ul");
  introBullets.className = "gd-intro-bullets";
  const introLi1 = document.createElement("li");
  introLi1.textContent = "Dokunu\u015f, t\u0131klama veya Bo\u015fluk tu\u015fu ile cad\u0131y\u0131 yukar\u0131 it.";
  const introLi2 = document.createElement("li");
  introLi2.textContent = "15 balkaba\u011f\u0131 toplayarak g\u00f6revi tamamla.";
  const introLi3 = document.createElement("li");
  introLi3.textContent = "Yarasalara, tavana ve zemine \u00e7arpmamaya dikkat et.";
  introBullets.appendChild(introLi1);
  introBullets.appendChild(introLi2);
  introBullets.appendChild(introLi3);
  const witchWrap = document.createElement("div");
  witchWrap.className = "gd-witch-wrap";
  const introWitchCv = document.createElement("canvas");
  introWitchCv.id = "gd-intro-witch-canvas";
  witchWrap.appendChild(introWitchCv);
  const btnHowto = document.createElement("button");
  btnHowto.type = "button";
  btnHowto.className = "gd-btn";
  btnHowto.innerHTML = `<span aria-hidden="true">\ud83e\udd87</span> Nas\u0131l oynan\u0131r <span aria-hidden="true">\u2192</span> <span aria-hidden="true">\ud83c\udf83</span>`;
  introContent.appendChild(introPill);
  introContent.appendChild(introDivider);
  introContent.appendChild(introTitle);
  introContent.appendChild(introSub);
  introContent.appendChild(introBullets);
  introContent.appendChild(witchWrap);
  introContent.appendChild(btnHowto);
  introShell.appendChild(introContent);
  screenIntro.appendChild(introSil);
  screenIntro.appendChild(introShell);
  const screenHowto = document.createElement("div");
  screenHowto.id = "gd-screen-howto";
  screenHowto.className = "gd-screen";
  const howtoSil = document.createElement("canvas");
  howtoSil.className = "gd-sil-canvas";
  howtoSil.id = "gd-howto-sil-canvas";
  const howtoShell = document.createElement("div");
  howtoShell.className = "gd-step-shell";
  const howtoCard = document.createElement("div");
  howtoCard.className = "gd-step-card";
  const howtoPill = document.createElement("div");
  howtoPill.className = "gd-step-pill";
  howtoPill.textContent = "Ad\u0131m 2 / 3 \u00b7 Kurallar";
  const howtoDivider = document.createElement("div");
  howtoDivider.className = "gd-step-divider";
  const howtoTitle = document.createElement("h1");
  howtoTitle.className = "gd-title";
  howtoTitle.textContent = "Nas\u0131l oynan\u0131r";
  const howtoGrid = document.createElement("div");
  howtoGrid.className = "gd-howto-grid";
  const colOk = document.createElement("div");
  colOk.className = "gd-howto-col";
  const markOk = document.createElement("div");
  markOk.className = "gd-howto-mark ok";
  markOk.textContent = "\u2713";
  const cvPump = document.createElement("canvas");
  cvPump.className = "gd-howto-icon";
  cvPump.id = "gd-howto-pumpkin";
  colOk.appendChild(markOk);
  colOk.appendChild(cvPump);
  const divLine = document.createElement("div");
  divLine.className = "gd-howto-divider";
  const colBad = document.createElement("div");
  colBad.className = "gd-howto-col";
  const markBad = document.createElement("div");
  markBad.className = "gd-howto-mark bad";
  markBad.textContent = "\u2717";
  const cvBat = document.createElement("canvas");
  cvBat.className = "gd-howto-icon";
  cvBat.id = "gd-howto-bat";
  colBad.appendChild(markBad);
  colBad.appendChild(cvBat);
  howtoGrid.appendChild(colOk);
  howtoGrid.appendChild(divLine);
  howtoGrid.appendChild(colBad);
  const instructWrap = document.createElement("div");
  instructWrap.className = "gd-instruct-wrap";
  const ins1 = document.createElement("p");
  ins1.className = "gd-instruct";
  ins1.innerHTML =
    "Ekrana <strong>dokun</strong>, <strong>t\u0131kla</strong> ya da <strong>Bo\u015fluk</strong> tu\u015funa bas; cad\u0131y\u0131 yukar\u0131 it.";
  const ins2 = document.createElement("p");
  ins2.className = "gd-instruct";
  ins2.innerHTML =
    "<strong>15 balkaba\u011f\u0131</strong> toplayarak \u00f6d\u00fcl i\u00e7in hak kazan.";
  const ins3 = document.createElement("p");
  ins3.className = "gd-instruct";
  ins3.innerHTML =
    "Toplam <strong>30 saniye</strong> ve <strong>5 hak</strong> s\u00fcren var.";
  instructWrap.appendChild(ins1);
  instructWrap.appendChild(ins2);
  instructWrap.appendChild(ins3);
  const btnStart = document.createElement("button");
  btnStart.type = "button";
  btnStart.className = "gd-btn";
  btnStart.id = "gd-btn-start";
  const miniWitchCv = document.createElement("canvas");
  miniWitchCv.className = "gd-mini-witch";
  miniWitchCv.id = "gd-btn-mini-witch";
  btnStart.appendChild(miniWitchCv);
  const startTxt = document.createElement("span");
  startTxt.textContent = "Oyunu ba\u015flat \u2192";
  btnStart.appendChild(startTxt);
  const startPump = document.createElement("span");
  startPump.setAttribute("aria-hidden", "true");
  startPump.textContent = "\ud83c\udf83";
  btnStart.appendChild(startPump);
  howtoCard.appendChild(howtoPill);
  howtoCard.appendChild(howtoDivider);
  howtoCard.appendChild(howtoTitle);
  howtoCard.appendChild(howtoGrid);
  howtoCard.appendChild(instructWrap);
  howtoCard.appendChild(btnStart);
  howtoShell.appendChild(howtoCard);
  screenHowto.appendChild(howtoSil);
  screenHowto.appendChild(howtoShell);
  const screenGame = document.createElement("div");
  screenGame.id = "gd-screen-game";
  screenGame.className = "gd-screen";
  screenGame.dataset.phase = "ready";
  const gameCv = document.createElement("canvas");
  gameCv.id = "gd-game-canvas";
  const readyEl = document.createElement("div");
  readyEl.id = "gd-ready";
  readyEl.innerHTML = `<div class="gd-ready-hand" aria-hidden="true">\ud83d\udc46</div><div class="gd-ready-title">Ba\u015flamak i\u00e7in dokun</div><div class="gd-ready-sub">veya Bo\u015fluk / \u2191 tu\u015funa bas</div>`;
  const hud = document.createElement("div");
  hud.id = "gd-hud";
  const hudTime = document.createElement("div");
  hudTime.className = "gd-hud-cell";
  const hudTimeNum = document.createElement("div");
  hudTimeNum.className = "gd-hud-num";
  hudTimeNum.id = "gd-hud-time";
  hudTimeNum.textContent = "30";
  const hudTimeLab = document.createElement("div");
  hudTimeLab.className = "gd-hud-lab";
  hudTimeLab.textContent = "S\u00fcre";
  hudTime.appendChild(hudTimeNum);
  hudTime.appendChild(hudTimeLab);
  const sep1 = document.createElement("div");
  sep1.className = "gd-hud-sep";
  sep1.textContent = "|";
  const hudScore = document.createElement("div");
  hudScore.className = "gd-hud-cell";
  const hudScoreNum = document.createElement("div");
  hudScoreNum.className = "gd-hud-num";
  hudScoreNum.id = "gd-hud-score";
  hudScoreNum.textContent = `0/${CONFIG.targetScore}`;
  const hudScoreLab = document.createElement("div");
  hudScoreLab.className = "gd-hud-lab";
  hudScoreLab.textContent = "Skor";
  hudScore.appendChild(hudScoreNum);
  hudScore.appendChild(hudScoreLab);
  const sep2 = document.createElement("div");
  sep2.className = "gd-hud-sep";
  sep2.textContent = "|";
  const hudAtt = document.createElement("div");
  hudAtt.className = "gd-hud-cell";
  const hudAttNum = document.createElement("div");
  hudAttNum.className = "gd-hud-num";
  hudAttNum.id = "gd-hud-attempts";
  hudAttNum.textContent = "5";
  const hudAttLab = document.createElement("div");
  hudAttLab.className = "gd-hud-lab";
  hudAttLab.textContent = "Hak";
  hudAtt.appendChild(hudAttNum);
  hudAtt.appendChild(hudAttLab);
  hud.appendChild(hudTime);
  hud.appendChild(sep1);
  hud.appendChild(hudScore);
  hud.appendChild(sep2);
  hud.appendChild(hudAtt);
  screenGame.appendChild(gameCv);
  screenGame.appendChild(readyEl);
  screenGame.appendChild(hud);
  const screenEndWin = document.createElement("div");
  screenEndWin.id = "gd-screen-end-win";
  screenEndWin.className = "gd-screen gd-end-card--win";
  const endWinStars = document.createElement("canvas");
  endWinStars.id = "gd-end-stars-canvas";
  const endWinShell = document.createElement("div");
  endWinShell.className = "gd-step-shell";
  const endWinInner = document.createElement("div");
  endWinInner.className = "gd-end-inner gd-step-card";
  const endWinPill = document.createElement("div");
  endWinPill.className = "gd-step-pill";
  endWinPill.textContent = "Ad\u0131m 3 / 3 \u00b7 Sonu\u00e7";
  const endWinDivider = document.createElement("div");
  endWinDivider.className = "gd-step-divider";
  const endWinTitle = document.createElement("h1");
  endWinTitle.className = "gd-title";
  endWinTitle.textContent = "\ud83c\udf83 Tebrikler!";
  const endWinSub = document.createElement("p");
  endWinSub.className = "gd-sub";
  endWinSub.textContent =
    "15 balkaba\u011f\u0131n\u0131n tamam\u0131n\u0131 toplad\u0131n. B\u00fcy\u00fc kazan\u0131 \u015fimdi \u0131\u015f\u0131l \u0131\u015f\u0131l!";
  const endWinStatsRow = document.createElement("div");
  endWinStatsRow.className = "gd-end-stats-row";
  const endWinStatSkor = document.createElement("div");
  endWinStatSkor.className = "gd-end-stat";
  const endWinScoreVal = document.createElement("div");
  endWinScoreVal.className = "gd-end-stat-val";
  endWinScoreVal.id = "gd-end-win-score-val";
  endWinScoreVal.textContent = "15";
  const endWinScoreLab = document.createElement("div");
  endWinScoreLab.className = "gd-end-stat-lab";
  endWinScoreLab.textContent = "Skor";
  endWinStatSkor.appendChild(endWinScoreVal);
  endWinStatSkor.appendChild(endWinScoreLab);
  const endWinStatSure = document.createElement("div");
  endWinStatSure.className = "gd-end-stat";
  const endWinTimeVal = document.createElement("div");
  endWinTimeVal.className = "gd-end-stat-val";
  endWinTimeVal.id = "gd-end-win-time-val";
  endWinTimeVal.textContent = "0 sn";
  const endWinTimeLab = document.createElement("div");
  endWinTimeLab.className = "gd-end-stat-lab";
  endWinTimeLab.textContent = "Kalan s\u00fcre";
  endWinStatSure.appendChild(endWinTimeVal);
  endWinStatSure.appendChild(endWinTimeLab);
  endWinStatsRow.appendChild(endWinStatSkor);
  endWinStatsRow.appendChild(endWinStatSure);
  const codeBox = document.createElement("div");
  codeBox.className = "gd-code-box";
  const codeLab = document.createElement("div");
  codeLab.className = "gd-code-lab";
  codeLab.textContent = "\u0130ndirim kodun";
  const codeVal = document.createElement("div");
  codeVal.className = "gd-code-val";
  codeVal.id = "gd-code-val";
  codeVal.textContent = CONFIG.rewardCode;
  const btnCopy = document.createElement("button");
  btnCopy.type = "button";
  btnCopy.className = "gd-btn gd-btn--light";
  btnCopy.id = "gd-btn-copy";
  btnCopy.textContent = "Kodu kopyala";
  codeBox.appendChild(codeLab);
  codeBox.appendChild(codeVal);
  codeBox.appendChild(btnCopy);
  const endWinStats = document.createElement("p");
  endWinStats.className = "gd-instruct gd-instruct--tight";
  endWinStats.id = "gd-end-win-stats";
  const btnClaim = document.createElement("button");
  btnClaim.type = "button";
  btnClaim.className = "gd-btn";
  btnClaim.textContent = "Al\u0131\u015fveri\u015fe ba\u015fla \u2192";
  endWinInner.appendChild(endWinPill);
  endWinInner.appendChild(endWinDivider);
  endWinInner.appendChild(endWinTitle);
  endWinInner.appendChild(endWinSub);
  endWinInner.appendChild(endWinStatsRow);
  endWinInner.appendChild(codeBox);
  endWinInner.appendChild(endWinStats);
  endWinInner.appendChild(btnClaim);
  endWinShell.appendChild(endWinInner);
  screenEndWin.appendChild(endWinStars);
  screenEndWin.appendChild(endWinShell);
  const screenEndLose = document.createElement("div");
  screenEndLose.id = "gd-screen-end-lose";
  screenEndLose.className = "gd-screen gd-end-card--lose";
  const endLoseShell = document.createElement("div");
  endLoseShell.className = "gd-step-shell";
  const endLoseInner = document.createElement("div");
  endLoseInner.className = "gd-end-inner gd-step-card";
  const endLosePill = document.createElement("div");
  endLosePill.className = "gd-step-pill";
  endLosePill.textContent = "Ad\u0131m 3 / 3 \u00b7 Sonu\u00e7";
  const endLoseDivider = document.createElement("div");
  endLoseDivider.className = "gd-step-divider";
  const endLoseTitle = document.createElement("h1");
  endLoseTitle.className = "gd-title";
  endLoseTitle.textContent = "\u00c7ok yak\u0131nd\u0131n! \ud83e\udd87";
  const endLoseSub = document.createElement("p");
  endLoseSub.className = "gd-sub";
  endLoseSub.textContent =
    "Bu sefer yarasa s\u00fcr\u00fcs\u00fc biraz \u015fans\u0131n\u0131n \u00f6n\u00fcne ge\u00e7ti. Bir tur daha!";
  const endLoseStatsRow = document.createElement("div");
  endLoseStatsRow.className = "gd-end-stats-row";
  const endLoseStat = document.createElement("div");
  endLoseStat.className = "gd-end-stat gd-end-stat--wide";
  const endLoseStatVal = document.createElement("div");
  endLoseStatVal.className = "gd-end-stat-val";
  endLoseStatVal.id = "gd-end-lose-stat-val";
  endLoseStatVal.textContent = "0";
  const endLoseStatLab = document.createElement("div");
  endLoseStatLab.className = "gd-end-stat-lab";
  endLoseStatLab.textContent = "Toplanan balkaba\u011f\u0131";
  endLoseStat.appendChild(endLoseStatVal);
  endLoseStat.appendChild(endLoseStatLab);
  endLoseStatsRow.appendChild(endLoseStat);
  const endLoseStats = document.createElement("p");
  endLoseStats.className = "gd-instruct gd-instruct--tight";
  endLoseStats.id = "gd-end-lose-stats";
  const btnRetry = document.createElement("button");
  btnRetry.type = "button";
  btnRetry.className = "gd-btn";
  btnRetry.textContent = "Yeniden dene \u2192";
  endLoseInner.appendChild(endLosePill);
  endLoseInner.appendChild(endLoseDivider);
  endLoseInner.appendChild(endLoseTitle);
  endLoseInner.appendChild(endLoseSub);
  endLoseInner.appendChild(endLoseStatsRow);
  endLoseInner.appendChild(endLoseStats);
  endLoseInner.appendChild(btnRetry);
  endLoseShell.appendChild(endLoseInner);
  screenEndLose.appendChild(endLoseShell);
  root.appendChild(closeBtn);
  root.appendChild(screenIntro);
  root.appendChild(screenHowto);
  root.appendChild(screenGame);
  root.appendChild(screenEndWin);
  root.appendChild(screenEndLose);
  document.body.appendChild(root);
  let gameLoopId = 0;
  let resizeRaf = 0;
  let lastTs = 0;
  let animTime = 0;
  let elapsed = 0;
  let timeLeft = CONFIG.gameDuration;
  let lastShownSecond = CONFIG.gameDuration;
  let score = 0;
  let attempts = CONFIG.maxAttempts;
  let parallaxSlowX = 0;
  let parallaxFastX = 0;
  let witchY = 0;
  let witchVy = 0;
  let witchH = 1;
  let witchW = 1;
  let unit = 1;
  let pumpkinTimer = 0;
  let batTimer = 0;
  let trailTimer = 0;
  let lastPumpkinY = 0.5;
  let flashTime = 0;
  let shakeTime = 0;
  let hurtCooldown = 0;
  let endDelay = 0;
  let pendingEnd = "";
  let gameW = 0;
  let gameH = 0;
  let speedScale = 1;
  let audioCtx = null;
  let noiseBuffer = null;
  const burstParticles = [];
  const clouds = [];
  const pumpkins = [];
  const bats = [];
  const views = {};
  const ctxGame = gameCv.getContext("2d");
  const skyStars = Array.from({ length: 70 }, () => ({
    x: Math.random(),
    y: Math.random() * 0.6,
    r: 0.4 + Math.random() * 1.3,
    ph: Math.random() * Math.PI * 2,
    sp: 1 + Math.random() * 2.5,
  }));
  const getAudio = () => {
    if (!audioCtx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        audioCtx = AC ? new AC() : null;
      } catch (err) {
        audioCtx = null;
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  };
  const playTone = (ac, opts) => {
    const { freq, to = freq, dur = 0.15, type = "sine", vol = 0.2, delay = 0 } = opts;
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  };
  const playNoise = (ac, opts) => {
    const { dur = 0.2, from = 800, to = 2400, vol = 0.15, q = 1.2 } = opts;
    if (!noiseBuffer) {
      const len = Math.floor(ac.sampleRate * 0.6);
      noiseBuffer = ac.createBuffer(1, len, ac.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i += 1) {
        data[i] = Math.random() * 2 - 1;
      }
    }
    const t0 = ac.currentTime;
    const src = ac.createBufferSource();
    src.buffer = noiseBuffer;
    const filter = ac.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = q;
    filter.frequency.setValueAtTime(from, t0);
    filter.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ac.destination);
    src.start(t0);
    src.stop(t0 + dur + 0.05);
  };
  const SOUNDS = {
    flap: (ac) => playNoise(ac, { dur: 0.16, from: 600, to: 2200, vol: 0.12 }),
    collect: (ac) => {
      playTone(ac, { freq: 880, to: 1320, dur: 0.12, type: "triangle", vol: 0.18 });
      playTone(ac, { freq: 1320, to: 1760, dur: 0.16, vol: 0.14, delay: 0.07 });
    },
    hit: (ac) => {
      playTone(ac, { freq: 220, to: 60, dur: 0.35, type: "sawtooth", vol: 0.16 });
      playNoise(ac, { dur: 0.25, from: 400, to: 120, vol: 0.2, q: 0.8 });
    },
    tick: (ac) => playTone(ac, { freq: 1000, dur: 0.05, type: "square", vol: 0.05 }),
    start: (ac) =>
      [523, 659, 784].forEach((f, i) =>
        playTone(ac, { freq: f, dur: 0.14, type: "triangle", vol: 0.15, delay: i * 0.08 })
      ),
    win: (ac) =>
      [523, 659, 784, 1047, 1319].forEach((f, i) =>
        playTone(ac, { freq: f, dur: 0.24, type: "triangle", vol: 0.16, delay: i * 0.1 })
      ),
    lose: (ac) =>
      [392, 330, 262, 196].forEach((f, i) =>
        playTone(ac, { freq: f, to: f * 0.97, dur: 0.28, vol: 0.16, delay: i * 0.16 })
      ),
    copy: (ac) => playTone(ac, { freq: 1200, to: 1600, dur: 0.1, vol: 0.12 }),
  };
  const playSound = (name) => {
    try {
      const ac = getAudio();
      if (ac && SOUNDS[name]) {
        SOUNDS[name](ac);
      }
    } catch (err) {
      return;
    }
  };
  const fitCanvas = (cv) => {
    const w = Math.max(1, cv.clientWidth);
    const h = Math.max(1, cv.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.max(1, Math.floor(w * dpr));
    cv.height = Math.max(1, Math.floor(h * dpr));
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  };
  const formatKabakSayisi = (n) => {
    if (n === 0) {
      return "Hi\u00e7 balkaba\u011f\u0131 yok";
    }
    if (n === 1) {
      return "1 balkaba\u011f\u0131";
    }
    return `${n} balkaba\u011f\u0131`;
  };
  const hillY = (x, w, h, near) => {
    const k = (x / w) * Math.PI * 2;
    if (near) {
      return h * (0.84 + 0.03 * Math.sin(k * 2 + 0.6) + 0.015 * Math.sin(k * 5 + 1.3));
    }
    return h * (0.68 + 0.05 * Math.sin(k + 1.1) + 0.025 * Math.sin(k * 3 + 0.4));
  };
  const drawBranch = (ctx, x, y, len, ang, width, depth) => {
    const ex = x + Math.cos(ang) * len;
    const ey = y + Math.sin(ang) * len;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    if (depth > 0) {
      drawBranch(ctx, ex, ey, len * 0.7, ang - 0.55, width * 0.62, depth - 1);
      drawBranch(ctx, ex, ey, len * 0.6, ang + 0.45, width * 0.6, depth - 1);
    }
  };
  const drawGrave = (ctx, x, y, s, cross) => {
    ctx.beginPath();
    if (cross) {
      ctx.rect(x - s * 0.09, y - s * 1.1, s * 0.18, s * 1.1);
      ctx.rect(x - s * 0.4, y - s * 0.85, s * 0.8, s * 0.17);
    } else {
      ctx.moveTo(x - s * 0.4, y);
      ctx.lineTo(x - s * 0.4, y - s * 0.6);
      ctx.arc(x, y - s * 0.6, s * 0.4, Math.PI, 0);
      ctx.lineTo(x + s * 0.4, y);
      ctx.closePath();
    }
    ctx.fill();
  };
  const drawHauntedHouse = (ctx, x, y, s) => {
    const parts = [
      [[-0.5, 0.05], [-0.5, -0.55], [0.5, -0.55], [0.5, 0.05]],
      [[-0.62, -0.5], [-0.06, -0.98], [0.56, -0.5]],
      [[0.18, -0.4], [0.18, -1.05], [0.44, -1.05], [0.44, -0.4]],
      [[0.11, -1.02], [0.31, -1.5], [0.51, -1.02]],
      [[-0.4, -0.6], [-0.4, -0.98], [-0.29, -0.98], [-0.29, -0.6]],
    ];
    parts.forEach((pts) => {
      ctx.beginPath();
      pts.forEach(([px, py], i) => {
        if (i === 0) {
          ctx.moveTo(x + px * s, y + py * s);
        } else {
          ctx.lineTo(x + px * s, y + py * s);
        }
      });
      ctx.closePath();
      ctx.fill();
    });
    ctx.save();
    ctx.fillStyle = "#ffcf5a";
    ctx.shadowColor = "rgba(255, 190, 70, 0.9)";
    ctx.shadowBlur = s * 0.25;
    [
      [-0.36, -0.42],
      [-0.08, -0.42],
      [-0.36, -0.2],
      [0.24, -0.88],
    ].forEach(([wx, wy]) => {
      ctx.fillRect(x + wx * s, y + wy * s, s * 0.14, s * 0.13);
    });
    ctx.beginPath();
    ctx.arc(x - s * 0.06, y - s * 0.72, s * 0.07, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  const drawSilhouetteTile = (ctx, w, h, near) => {
    const sz = Math.min(w, h);
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let i = 0; i <= 48; i += 1) {
      const x = (w * i) / 48;
      ctx.lineTo(x, hillY(x, w, h, near));
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
    if (near) {
      [
        [0.14, 0.34],
        [0.68, 0.27],
      ].forEach(([tx, ts]) => {
        const x = w * tx;
        drawBranch(ctx, x, hillY(x, w, h, true) + sz * 0.02, sz * ts * 0.45, -Math.PI / 2 - 0.06, sz * ts * 0.09, 3);
      });
      [
        [0.34, 0.07, false],
        [0.4, 0.06, true],
        [0.86, 0.075, false],
        [0.91, 0.055, true],
      ].forEach(([gx, gs, cross]) => {
        const x = w * gx;
        drawGrave(ctx, x, hillY(x, w, h, true) + sz * 0.01, sz * gs, cross);
      });
      ctx.lineWidth = Math.max(1, sz * 0.008);
      for (let i = 0; i < 9; i += 1) {
        const x = w * (0.47 + i * 0.015);
        const gy = hillY(x, w, h, true);
        ctx.fillRect(x, gy - sz * 0.07, sz * 0.012, sz * 0.08);
      }
      const fx0 = w * 0.47;
      const fx1 = w * 0.47 + w * 0.12 + sz * 0.012;
      ctx.beginPath();
      ctx.moveTo(fx0, hillY(fx0, w, h, true) - sz * 0.045);
      ctx.lineTo(fx1, hillY(fx1, w, h, true) - sz * 0.045);
      ctx.stroke();
    } else {
      const hx = w * 0.3;
      drawHauntedHouse(ctx, hx, hillY(hx, w, h, false) + sz * 0.02, sz * 0.15);
      const tx = w * 0.78;
      drawHauntedHouse(ctx, tx, hillY(tx, w, h, false) + sz * 0.02, sz * 0.09);
    }
  };
  const drawParkSilhouettes = (ctx, w, h, scroll, fillStyle, near) => {
    const off = ((scroll % w) + w) % w;
    ctx.save();
    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = fillStyle;
    ctx.lineCap = "round";
    [-off, w - off].forEach((ox) => {
      ctx.save();
      ctx.translate(ox, 0);
      drawSilhouetteTile(ctx, w, h, near);
      ctx.restore();
    });
    ctx.restore();
  };
  const drawHangingBatsSil = (ctx, w, h, t) => {
    ctx.save();
    ctx.strokeStyle = CONFIG.bgSilhouettes.slowFill;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (let i = 0; i < 5; i += 1) {
      const bx = (((i * 0.23 + t * 0.02 * (1 + i * 0.15)) % 1) * 1.2 - 0.1) * w;
      const by = h * (0.1 + (i % 3) * 0.07) + Math.sin(t * 1.3 + i) * h * 0.01;
      const sz = Math.min(w, h) * (0.012 + (i % 2) * 0.006);
      const fl = Math.sin(t * 10 + i * 1.7) * sz * 0.6;
      ctx.lineWidth = Math.max(1.5, sz * 0.35);
      ctx.beginPath();
      ctx.moveTo(bx - sz * 1.6, by - fl);
      ctx.quadraticCurveTo(bx - sz * 0.7, by - sz * 0.6 - fl * 0.3, bx, by);
      ctx.quadraticCurveTo(bx + sz * 0.7, by - sz * 0.6 - fl * 0.3, bx + sz * 1.6, by - fl);
      ctx.stroke();
    }
    ctx.restore();
  };
  const drawWitchSprite = (ctx, cx, cy, scale, t, capeFlap) => {
    const s = scale * 0.62;
    const flap = Math.sin(t * 7) * capeFlap;
    const hair = Math.sin(t * 9 + 1) * capeFlap;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const aura = ctx.createRadialGradient(0, -s * 0.2, s * 0.1, 0, -s * 0.2, s * 1.1);
    aura.addColorStop(0, "rgba(200, 140, 255, 0.35)");
    aura.addColorStop(1, "rgba(200, 140, 255, 0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, -s * 0.2, s * 1.1, 0, Math.PI * 2);
    ctx.fill();
    const capeG = ctx.createLinearGradient(-s * 0.75, 0, 0, 0);
    capeG.addColorStop(0, "#22073d");
    capeG.addColorStop(1, "#5b1a8f");
    ctx.fillStyle = capeG;
    ctx.beginPath();
    ctx.moveTo(-s * 0.02, -s * 0.2);
    ctx.bezierCurveTo(-s * 0.3, -s * 0.18 + flap * s * 0.3, -s * 0.55, -s * 0.05 + flap * s * 0.6, -s * 0.8, s * 0.02 + flap * s);
    ctx.quadraticCurveTo(-s * 0.62, s * 0.1 + flap * s * 0.5, -s * 0.68, s * 0.22 + flap * s * 0.7);
    ctx.quadraticCurveTo(-s * 0.4, s * 0.18, -s * 0.12, s * 0.12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ff7b29";
    ctx.beginPath();
    ctx.moveTo(-s * 0.04, -s * 0.42);
    ctx.quadraticCurveTo(-s * 0.3, -s * 0.36 + hair * s * 0.3, -s * 0.44, -s * 0.2 + hair * s * 0.5);
    ctx.quadraticCurveTo(-s * 0.26, -s * 0.24, -s * 0.34, -s * 0.08 + hair * s * 0.3);
    ctx.quadraticCurveTo(-s * 0.14, -s * 0.16, -s * 0.04, -s * 0.2);
    ctx.closePath();
    ctx.fill();
    const brG = ctx.createLinearGradient(-s * 1, 0, -s * 0.5, 0);
    brG.addColorStop(0, "#b7791f");
    brG.addColorStop(1, "#f6cd62");
    ctx.fillStyle = brG;
    ctx.beginPath();
    ctx.moveTo(-s * 0.5, s * 0.11);
    ctx.quadraticCurveTo(-s * 0.78, s * 0.02, -s * 1.0, -s * 0.02 + flap * s * 0.2);
    ctx.lineTo(-s * 0.97, s * 0.18);
    ctx.quadraticCurveTo(-s * 0.99, s * 0.32, -s * 0.93, s * 0.4 - flap * s * 0.2);
    ctx.quadraticCurveTo(-s * 0.72, s * 0.3, -s * 0.5, s * 0.22);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(120, 70, 10, 0.55)";
    ctx.lineWidth = Math.max(0.5, s * 0.012);
    for (let i = 0; i < 6; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.54, s * (0.13 + i * 0.016));
      ctx.lineTo(-s * 0.95, s * (0.0 + i * 0.075));
      ctx.stroke();
    }
    ctx.fillStyle = "#7a2e8f";
    ctx.fillRect(-s * 0.57, s * 0.1, s * 0.07, s * 0.13);
    const stickG = ctx.createLinearGradient(0, s * 0.05, 0, s * 0.2);
    stickG.addColorStop(0, "#a0652e");
    stickG.addColorStop(1, "#5e3517");
    ctx.strokeStyle = stickG;
    ctx.lineWidth = s * 0.065;
    ctx.beginPath();
    ctx.moveTo(-s * 0.55, s * 0.17);
    ctx.lineTo(s * 0.62, s * 0.08);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 220, 170, 0.35)";
    ctx.lineWidth = s * 0.018;
    ctx.beginPath();
    ctx.moveTo(-s * 0.5, s * 0.152);
    ctx.lineTo(s * 0.58, s * 0.068);
    ctx.stroke();
    const dressG = ctx.createLinearGradient(0, -s * 0.24, 0, s * 0.18);
    dressG.addColorStop(0, "#9b4fe0");
    dressG.addColorStop(1, "#4b167f");
    ctx.fillStyle = dressG;
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, -s * 0.22);
    ctx.quadraticCurveTo(s * 0.08, -s * 0.26, s * 0.12, -s * 0.16);
    ctx.quadraticCurveTo(s * 0.2, s * 0.02, s * 0.18, s * 0.12);
    ctx.lineTo(-s * 0.3, s * 0.16);
    ctx.quadraticCurveTo(-s * 0.22, -s * 0.05, -s * 0.1, -s * 0.22);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#3a0f63";
    ctx.beginPath();
    ctx.moveTo(-s * 0.05, s * 0.05);
    ctx.quadraticCurveTo(s * 0.2, s * 0.01, s * 0.31, s * 0.1);
    ctx.lineTo(s * 0.27, s * 0.2);
    ctx.quadraticCurveTo(s * 0.1, s * 0.16, -s * 0.05, s * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#1c0b2b";
    ctx.lineWidth = s * 0.07;
    ctx.beginPath();
    ctx.moveTo(s * 0.28, s * 0.15);
    ctx.lineTo(s * 0.25, s * 0.3);
    ctx.stroke();
    ctx.strokeStyle = "#ff8a3d";
    ctx.setLineDash([s * 0.03, s * 0.03]);
    ctx.beginPath();
    ctx.moveTo(s * 0.28, s * 0.15);
    ctx.lineTo(s * 0.25, s * 0.3);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#1c0b2b";
    ctx.beginPath();
    ctx.moveTo(s * 0.19, s * 0.29);
    ctx.lineTo(s * 0.3, s * 0.28);
    ctx.quadraticCurveTo(s * 0.42, s * 0.3, s * 0.47, s * 0.23);
    ctx.quadraticCurveTo(s * 0.45, s * 0.36, s * 0.3, s * 0.37);
    ctx.lineTo(s * 0.19, s * 0.37);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#6b23b0";
    ctx.lineWidth = s * 0.075;
    ctx.beginPath();
    ctx.moveTo(s * 0.02, -s * 0.14);
    ctx.quadraticCurveTo(s * 0.2, -s * 0.04, s * 0.34, s * 0.08);
    ctx.stroke();
    const skinG = ctx.createRadialGradient(-s * 0.01, -s * 0.38, s * 0.02, s * 0.03, -s * 0.33, s * 0.15);
    skinG.addColorStop(0, "#d3f59e");
    skinG.addColorStop(1, "#82bd4b");
    ctx.fillStyle = skinG;
    ctx.beginPath();
    ctx.arc(s * 0.35, s * 0.08, s * 0.045, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.03, -s * 0.33, s * 0.13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#79b244";
    ctx.beginPath();
    ctx.moveTo(s * 0.13, -s * 0.37);
    ctx.quadraticCurveTo(s * 0.26, -s * 0.31, s * 0.21, -s * 0.26);
    ctx.lineTo(s * 0.13, -s * 0.29);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(s * 0.09, -s * 0.36, s * 0.03, s * 0.036, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1c0b2b";
    ctx.beginPath();
    ctx.arc(s * 0.1, -s * 0.355, s * 0.017, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 120, 150, 0.5)";
    ctx.beginPath();
    ctx.arc(s * 0.05, -s * 0.27, s * 0.03, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3a1d10";
    ctx.lineWidth = Math.max(0.6, s * 0.013);
    ctx.beginPath();
    ctx.arc(s * 0.1, -s * 0.27, s * 0.04, 0.3, 1.5);
    ctx.stroke();
    ctx.fillStyle = "#ff7b29";
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, -s * 0.38);
    ctx.quadraticCurveTo(s * 0.0, -s * 0.47, s * 0.13, -s * 0.42);
    ctx.quadraticCurveTo(s * 0.02, -s * 0.41, -s * 0.03, -s * 0.33);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#3b1066";
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.45, s * 0.3, s * 0.065, -0.08, 0, Math.PI * 2);
    ctx.fill();
    const hatG = ctx.createLinearGradient(-s * 0.4, -s * 0.92, s * 0.15, -s * 0.45);
    hatG.addColorStop(0, "#22073d");
    hatG.addColorStop(1, "#6a22a8");
    ctx.fillStyle = hatG;
    ctx.beginPath();
    ctx.moveTo(-s * 0.17, -s * 0.45);
    ctx.quadraticCurveTo(-s * 0.08, -s * 0.78, -s * 0.44, -s * 0.92 + flap * s * 0.25);
    ctx.quadraticCurveTo(s * 0.02, -s * 0.74, s * 0.17, -s * 0.48);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ff8a3d";
    ctx.beginPath();
    ctx.moveTo(-s * 0.165, -s * 0.46);
    ctx.lineTo(s * 0.168, -s * 0.49);
    ctx.lineTo(s * 0.145, -s * 0.55);
    ctx.lineTo(-s * 0.148, -s * 0.53);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#ffd34d";
    ctx.lineWidth = Math.max(0.6, s * 0.016);
    ctx.strokeRect(-s * 0.03, -s * 0.545, s * 0.07, s * 0.06);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = Math.max(0.6, s * 0.02);
    ctx.beginPath();
    ctx.moveTo(s * 0.08, -s * 0.56);
    ctx.quadraticCurveTo(s * 0.0, -s * 0.72, -s * 0.2, -s * 0.82);
    ctx.stroke();
    ctx.restore();
  };
  const drawPumpkinSprite = (ctx, px, py, r, t) => {
    const pulse = 0.5 + 0.5 * Math.sin(t * 4 + px * 0.01);
    ctx.save();
    ctx.translate(px, py);
    const glow = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 2.1);
    glow.addColorStop(0, `rgba(255, 170, 60, ${0.35 + pulse * 0.25})`);
    glow.addColorStop(1, "rgba(255, 170, 60, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.1, 0, Math.PI * 2);
    ctx.fill();
    [
      [-0.5, 0.52, "#d9530f"],
      [0.5, 0.52, "#d9530f"],
      [-0.26, 0.66, "#f06a14"],
      [0.26, 0.66, "#f06a14"],
      [0, 0.6, "#ff8a24"],
    ].forEach(([ox, rx, col]) => {
      const g = ctx.createRadialGradient(ox * r - r * 0.2, -r * 0.35, r * 0.08, ox * r, 0, r);
      g.addColorStop(0, "#ffc070");
      g.addColorStop(0.5, col);
      g.addColorStop(1, "#9c3207");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(ox * r, 0, rx * r, r * 0.88, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(120, 40, 5, 0.4)";
      ctx.lineWidth = Math.max(0.5, r * 0.04);
      ctx.stroke();
    });
    ctx.fillStyle = "#4d7a2a";
    ctx.beginPath();
    ctx.moveTo(-r * 0.1, -r * 0.78);
    ctx.quadraticCurveTo(-r * 0.05, -r * 1.1, r * 0.18, -r * 1.18);
    ctx.lineTo(r * 0.21, -r * 1.05);
    ctx.quadraticCurveTo(r * 0.06, -r * 1.0, r * 0.1, -r * 0.78);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#6fae3c";
    ctx.beginPath();
    ctx.ellipse(-r * 0.3, -r * 0.92, r * 0.22, r * 0.1, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#5d8f2f";
    ctx.lineWidth = Math.max(0.5, r * 0.045);
    ctx.beginPath();
    ctx.arc(r * 0.34, -r * 0.92, r * 0.1, Math.PI, Math.PI * 2.5);
    ctx.stroke();
    const face = ctx.createRadialGradient(0, r * 0.1, 0, 0, r * 0.1, r * 0.7);
    face.addColorStop(0, "#fff7b0");
    face.addColorStop(1, "#ffb020");
    ctx.fillStyle = face;
    ctx.shadowColor = "rgba(255, 210, 70, 0.95)";
    ctx.shadowBlur = r * (0.3 + pulse * 0.5);
    ctx.beginPath();
    ctx.moveTo(-r * 0.42, -r * 0.04);
    ctx.lineTo(-r * 0.12, -r * 0.04);
    ctx.lineTo(-r * 0.27, -r * 0.32);
    ctx.closePath();
    ctx.moveTo(r * 0.42, -r * 0.04);
    ctx.lineTo(r * 0.12, -r * 0.04);
    ctx.lineTo(r * 0.27, -r * 0.32);
    ctx.closePath();
    ctx.moveTo(-r * 0.07, r * 0.13);
    ctx.lineTo(r * 0.07, r * 0.13);
    ctx.lineTo(0, r * 0.02);
    ctx.closePath();
    ctx.moveTo(-r * 0.5, r * 0.24);
    ctx.lineTo(-r * 0.32, r * 0.31);
    ctx.lineTo(-r * 0.22, r * 0.23);
    ctx.lineTo(-r * 0.07, r * 0.33);
    ctx.lineTo(r * 0.07, r * 0.23);
    ctx.lineTo(r * 0.22, r * 0.33);
    ctx.lineTo(r * 0.32, r * 0.23);
    ctx.lineTo(r * 0.5, r * 0.24);
    ctx.quadraticCurveTo(r * 0.1, r * 0.72, -r * 0.5, r * 0.24);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.beginPath();
    ctx.ellipse(-r * 0.42, -r * 0.45, r * 0.14, r * 0.07, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  const drawBatSprite = (ctx, bx, by, r, t, wing) => {
    const lift = Math.sin(t * CONFIG.batFlapSpeed * wing) * r * 0.8;
    ctx.save();
    ctx.translate(bx, by);
    const aura = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 2.2);
    aura.addColorStop(0, "rgba(255, 40, 90, 0.22)");
    aura.addColorStop(1, "rgba(255, 40, 90, 0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2);
    ctx.fill();
    const wingG = ctx.createLinearGradient(0, -r * 1.2, 0, r * 0.4);
    wingG.addColorStop(0, "#5a2b7c");
    wingG.addColorStop(1, "#1a0a26");
    [1, -1].forEach((side) => {
      ctx.save();
      ctx.scale(side, 1);
      ctx.fillStyle = wingG;
      ctx.beginPath();
      ctx.moveTo(r * 0.15, -r * 0.2);
      ctx.quadraticCurveTo(r * 1.0, -r * 0.9 - lift * 0.9, r * 2.1, -r * 0.55 - lift);
      ctx.quadraticCurveTo(r * 1.85, -r * 0.05 - lift * 0.6, r * 1.55, r * 0.12 - lift * 0.55);
      ctx.quadraticCurveTo(r * 1.35, -r * 0.05 - lift * 0.4, r * 1.05, r * 0.2 - lift * 0.35);
      ctx.quadraticCurveTo(r * 0.85, r * 0.02 - lift * 0.2, r * 0.55, r * 0.28 - lift * 0.15);
      ctx.quadraticCurveTo(r * 0.35, r * 0.1, r * 0.15, r * 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(170, 110, 210, 0.55)";
      ctx.lineWidth = Math.max(0.5, r * 0.05);
      ctx.beginPath();
      ctx.moveTo(r * 0.2, -r * 0.15);
      ctx.lineTo(r * 1.0, -r * 0.55 - lift * 0.75);
      ctx.lineTo(r * 2.1, -r * 0.55 - lift);
      ctx.moveTo(r * 1.0, -r * 0.55 - lift * 0.75);
      ctx.lineTo(r * 1.55, r * 0.12 - lift * 0.55);
      ctx.moveTo(r * 1.0, -r * 0.55 - lift * 0.75);
      ctx.lineTo(r * 1.05, r * 0.2 - lift * 0.35);
      ctx.stroke();
      ctx.restore();
    });
    ctx.fillStyle = "#2a1238";
    ctx.beginPath();
    ctx.moveTo(-r * 0.24, -r * 0.28);
    ctx.lineTo(-r * 0.3, -r * 0.7);
    ctx.lineTo(-r * 0.04, -r * 0.38);
    ctx.closePath();
    ctx.moveTo(r * 0.24, -r * 0.28);
    ctx.lineTo(r * 0.3, -r * 0.7);
    ctx.lineTo(r * 0.04, -r * 0.38);
    ctx.closePath();
    ctx.fill();
    const bodyG = ctx.createRadialGradient(-r * 0.1, -r * 0.2, r * 0.05, 0, 0, r * 0.45);
    bodyG.addColorStop(0, "#6a3790");
    bodyG.addColorStop(1, "#1c0b29");
    ctx.fillStyle = bodyG;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.36, r * 0.44, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff3b3b";
    ctx.shadowColor = "#ff2a2a";
    ctx.shadowBlur = r * 0.6;
    ctx.beginPath();
    ctx.arc(-r * 0.13, -r * 0.12, r * 0.085, 0, Math.PI * 2);
    ctx.arc(r * 0.13, -r * 0.12, r * 0.085, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-r * 0.11, -r * 0.145, r * 0.025, 0, Math.PI * 2);
    ctx.arc(r * 0.15, -r * 0.145, r * 0.025, 0, Math.PI * 2);
    ctx.moveTo(-r * 0.09, r * 0.08);
    ctx.lineTo(-r * 0.03, r * 0.08);
    ctx.lineTo(-r * 0.06, r * 0.2);
    ctx.closePath();
    ctx.moveTo(r * 0.09, r * 0.08);
    ctx.lineTo(r * 0.03, r * 0.08);
    ctx.lineTo(r * 0.06, r * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
  const drawCloudBlob = (ctx, x, y, rw, rh, a) => {
    ctx.save();
    ctx.globalAlpha = a;
    [
      [0, 0, 1, 1],
      [0.55, 0.08, 0.75, 0.85],
      [-0.5, 0.1, 0.65, 0.8],
    ].forEach(([ox, oy, sx, sy]) => {
      const rr = rw * sx;
      ctx.save();
      ctx.translate(x + rw * ox, y + rh * oy);
      ctx.scale(1, (rh * sy) / rr);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rr);
      g.addColorStop(0, "rgba(220, 196, 245, 0.9)");
      g.addColorStop(0.6, "rgba(165, 125, 205, 0.45)");
      g.addColorStop(1, "rgba(120, 80, 170, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, rr, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    ctx.restore();
  };
  const initClouds = () => {
    clouds.length = 0;
    for (let i = 0; i < CONFIG.cloudCount; i += 1) {
      clouds.push({
        x: Math.random() * gameW * 1.2,
        y: gameH * (0.15 + Math.random() * 0.5),
        rw: unit * (0.14 + Math.random() * 0.1),
        rh: unit * (0.05 + Math.random() * 0.04),
        speed: 0.6 + Math.random() * 1,
        alpha: 0.16 + Math.random() * 0.12,
      });
    }
  };
  const witchCenter = () => ({
    x: gameW * CONFIG.witchX + witchW * 0.5,
    y: witchY + witchH * 0.62,
  });
  const bumpHud = (cell) => {
    cell.dataset.bump = "false";
    void cell.offsetWidth;
    cell.dataset.bump = "true";
  };
  const spawnParticles = (x, y, count, opts) => {
    for (let i = 0; i < count; i += 1) {
      const ang = Math.random() * Math.PI * 2;
      const sp = opts.speed * (0.35 + Math.random() * 0.65);
      const life = opts.life * (0.6 + Math.random() * 0.4);
      burstParticles.push({
        type: opts.type || "spark",
        x,
        y,
        vx: Math.cos(ang) * sp + (opts.vx || 0),
        vy: Math.sin(ang) * sp + (opts.vy || 0),
        life,
        max: life,
        r: opts.size * (0.5 + Math.random() * 0.8),
        color: opts.colors[i % opts.colors.length],
        g: opts.gravity || 0,
        text: "",
      });
    }
  };
  const spawnPopup = (x, y, text, color) => {
    burstParticles.push({ type: "text", x, y: Math.max(unit * 0.12, y), vx: 0, vy: -unit * 0.25, life: 0.8, max: 0.8, r: unit * 0.07, color, g: 0, text });
  };
  const spawnRing = (x, y, r, color) => {
    burstParticles.push({ type: "ring", x, y, vx: 0, vy: 0, life: 0.45, max: 0.45, r, color, g: 0, text: "" });
  };
  const updateParticles = (dt) => {
    for (let i = burstParticles.length - 1; i >= 0; i -= 1) {
      const p = burstParticles[i];
      p.life -= dt;
      if (p.life <= 0) {
        burstParticles.splice(i, 1);
      } else {
        p.vy += p.g * dt;
        p.vx *= 1 - Math.min(1, dt * 1.5);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
    }
  };
  const resetGame = () => {
    elapsed = 0;
    timeLeft = CONFIG.gameDuration;
    lastShownSecond = CONFIG.gameDuration;
    score = 0;
    attempts = CONFIG.maxAttempts;
    parallaxSlowX = 0;
    parallaxFastX = 0;
    witchVy = 0;
    pumpkinTimer = 0.5;
    batTimer = 1.8;
    trailTimer = 0;
    lastPumpkinY = 0.45;
    flashTime = 0;
    shakeTime = 0;
    hurtCooldown = 0;
    endDelay = 0;
    pendingEnd = "";
    burstParticles.length = 0;
    pumpkins.length = 0;
    bats.length = 0;
    hudTimeNum.textContent = String(CONFIG.gameDuration);
    hudTime.dataset.low = "false";
    hudScoreNum.textContent = `0/${CONFIG.targetScore}`;
    hudAttNum.textContent = String(attempts);
    btnCopy.dataset.copied = "false";
    btnCopy.textContent = "Kodu kopyala";
    witchY = gameH * 0.45 - witchH * 0.5;
    initClouds();
  };
  const beginEnd = (result) => {
    if (screenGame.dataset.phase === "over") {
      return;
    }
    screenGame.dataset.phase = "over";
    pendingEnd = result;
    endDelay = CONFIG.endDelay;
    const wc = witchCenter();
    if (result === "end-win") {
      playSound("win");
      spawnParticles(wc.x, wc.y, 46, {
        speed: unit * 0.9,
        life: 1.1,
        size: unit * 0.018,
        colors: ["#ffd45a", "#ff8a24", "#c38bff", "#8ff0c0", "#ffffff"],
        gravity: unit * 0.6,
      });
    } else {
      playSound("lose");
    }
  };
  const finishGame = () => {
    if (pendingEnd === "end-win") {
      endWinScoreVal.textContent = String(score);
      endWinTimeVal.textContent = `${Math.ceil(timeLeft)} sn`;
      endWinStats.textContent =
        "Kodu sepette kullanarak indirimini hemen kap!";
      initStarBurst();
    } else {
      endLoseStatVal.textContent = String(score);
      endLoseStats.textContent =
        attempts <= 0
          ? "T\u00fcm haklar\u0131n bitti. Bir tur daha, bu sefer olacak!"
          : `S\u00fcre doldu. ${formatKabakSayisi(score)} toplad\u0131n.`;
    }
    setState(pendingEnd);
  };
  const loseLife = () => {
    if (root.dataset.state !== "game" || screenGame.dataset.phase !== "play") {
      return;
    }
    const wc = witchCenter();
    spawnParticles(wc.x, wc.y, 22, {
      type: "smoke",
      speed: unit * 0.5,
      life: 0.7,
      size: unit * 0.035,
      colors: ["rgba(150, 90, 200, 0.7)", "rgba(90, 50, 130, 0.7)", "rgba(255, 90, 120, 0.6)"],
    });
    spawnPopup(wc.x, wc.y - witchH * 0.4, "-1 hak", "#ff6b81");
    playSound("hit");
    try {
      if (navigator.vibrate) {
        navigator.vibrate(60);
      }
    } catch (err) {}
    attempts -= 1;
    hudAttNum.textContent = String(Math.max(0, attempts));
    bumpHud(hudAtt);
    flashTime = 0.3;
    shakeTime = 0.35;
    hurtCooldown = CONFIG.invulnTime;
    witchVy = 0;
    witchY = gameH * 0.45 - witchH * 0.5;
    if (attempts <= 0) {
      beginEnd("end-lose");
    }
  };
  const starBurstState = { stars: [], confetti: [], t: 0 };
  const initStarBurst = () => {
    starBurstState.stars = [];
    starBurstState.confetti = [];
    starBurstState.t = 0;
    for (let i = 0; i < 18; i += 1) {
      starBurstState.stars.push({
        x: 0.08 + Math.random() * 0.84,
        y: 0.08 + Math.random() * 0.84,
        rot: Math.random() * Math.PI * 2,
        delay: Math.random() * 0.7,
        maxR: 0.03 + Math.random() * 0.05,
      });
    }
    const colors = ["#ffd45a", "#ff8a24", "#9b4fe0", "#ffffff", "#ff4f8b"];
    for (let i = 0; i < 70; i += 1) {
      starBurstState.confetti.push({
        x: Math.random(),
        y: -Math.random() * 0.8,
        vy: 0.15 + Math.random() * 0.2,
        vx: (Math.random() - 0.5) * 0.06,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 6,
        size: 0.012 + Math.random() * 0.012,
        color: colors[i % colors.length],
      });
    }
  };
  const resizeIntroSil = () => {
    const v = fitCanvas(introSil);
    v.ctx.clearRect(0, 0, v.w, v.h);
    drawParkSilhouettes(v.ctx, v.w, v.h, 0, CONFIG.bgSilhouettes.slowFill, false);
    drawParkSilhouettes(v.ctx, v.w, v.h, v.w * 0.35, CONFIG.bgSilhouettes.fastFill, true);
  };
  const resizeHowtoSil = () => {
    const v = fitCanvas(howtoSil);
    v.ctx.clearRect(0, 0, v.w, v.h);
    drawParkSilhouettes(v.ctx, v.w, v.h, v.w * 0.5, CONFIG.bgSilhouettes.slowFill, false);
    drawParkSilhouettes(v.ctx, v.w, v.h, v.w * 0.1, CONFIG.bgSilhouettes.fastFill, true);
  };
  const resizeIntroWitch = () => {
    views.introWitch = fitCanvas(introWitchCv);
  };
  const resizeHowtoIcons = () => {
    views.pump = fitCanvas(cvPump);
    views.bat = fitCanvas(cvBat);
  };
  const resizeMiniWitch = () => {
    views.mini = fitCanvas(miniWitchCv);
  };
  const drawIntroAnim = () => {
    const iw = views.introWitch;
    if (iw) {
      iw.ctx.clearRect(0, 0, iw.w, iw.h);
      drawWitchSprite(iw.ctx, iw.w * 0.58, iw.h * 0.62, Math.min(iw.w * 0.75, iw.h) * 0.82, animTime, 0.12);
    }
    const mv = views.mini;
    if (mv) {
      mv.ctx.clearRect(0, 0, mv.w, mv.h);
      drawWitchSprite(mv.ctx, mv.w * 0.6, mv.h * 0.62, Math.min(mv.w * 0.75, mv.h) * 0.85, animTime, 0.1);
    }
    const pv = views.pump;
    if (pv) {
      pv.ctx.clearRect(0, 0, pv.w, pv.h);
      drawPumpkinSprite(pv.ctx, pv.w * 0.5, pv.h * 0.56, Math.min(pv.w, pv.h) * 0.3, animTime);
    }
    const bv = views.bat;
    if (bv) {
      bv.ctx.clearRect(0, 0, bv.w, bv.h);
      drawBatSprite(bv.ctx, bv.w * 0.5, bv.h * 0.5, Math.min(bv.w / 4.6, bv.h * 0.32), animTime, 0.8);
    }
  };
  const resizeCanvas = () => {
    const lm =
      window.innerWidth > window.innerHeight &&
      Math.min(window.innerWidth, window.innerHeight) <= CONFIG.landscapeShortEdge;
    root.classList.toggle("gd-landscape-mobile", lm);
    const rect = screenGame.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const prevH = gameH;
    gameW = Math.max(1, rect.width);
    gameH = Math.max(1, rect.height);
    gameCv.width = Math.floor(gameW * dpr);
    gameCv.height = Math.floor(gameH * dpr);
    ctxGame.setTransform(dpr, 0, 0, dpr, 0, 0);
    speedScale = lm ? CONFIG.landscapeSpeedMul : 1;
    unit = Math.min(gameW * 1.15, gameH * 0.75);
    const witchMul = lm ? CONFIG.landscapeWitchScaleMul : 1;
    witchH = unit * CONFIG.witchScale * witchMul;
    witchW = witchH * 0.9;
    if (root.dataset.state === "game" && prevH > 1) {
      witchY = Math.min(Math.max(witchY * (gameH / prevH), 0), gameH - witchH);
    }
    resizeIntroSil();
    resizeHowtoSil();
    resizeIntroWitch();
    resizeHowtoIcons();
    resizeMiniWitch();
    views.endStars = fitCanvas(endWinStars);
  };
  const scheduleResize = () => {
    if (resizeRaf) {
      cancelAnimationFrame(resizeRaf);
    }
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0;
      resizeCanvas();
    });
  };
  const setState = (s) => {
    root.dataset.state = s;
    scheduleResize();
  };
  const drawGameBackground = () => {
    const g = ctxGame.createLinearGradient(0, 0, 0, gameH);
    g.addColorStop(0, "#160a2c");
    g.addColorStop(0.45, "#3d1957");
    g.addColorStop(0.78, "#b2421f");
    g.addColorStop(1, "#f29a38");
    ctxGame.fillStyle = g;
    ctxGame.fillRect(0, 0, gameW, gameH);
    ctxGame.save();
    ctxGame.fillStyle = "#fff8e1";
    skyStars.forEach((st) => {
      ctxGame.globalAlpha = (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(animTime * st.sp + st.ph))) * (1 - st.y);
      ctxGame.beginPath();
      ctxGame.arc(st.x * gameW, st.y * gameH, st.r, 0, Math.PI * 2);
      ctxGame.fill();
    });
    ctxGame.restore();
    const mx = gameW * 0.8;
    const my = gameH * 0.17;
    const mr = unit * 0.11;
    const mg = ctxGame.createRadialGradient(mx, my, mr * 0.8, mx, my, mr * 3.2);
    mg.addColorStop(0, "rgba(255, 236, 170, 0.45)");
    mg.addColorStop(1, "rgba(255, 236, 170, 0)");
    ctxGame.fillStyle = mg;
    ctxGame.beginPath();
    ctxGame.arc(mx, my, mr * 3.2, 0, Math.PI * 2);
    ctxGame.fill();
    const mb = ctxGame.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, mr * 0.1, mx, my, mr);
    mb.addColorStop(0, "#fffbe6");
    mb.addColorStop(0.7, "#f6e3a1");
    mb.addColorStop(1, "#e0c27a");
    ctxGame.fillStyle = mb;
    ctxGame.beginPath();
    ctxGame.arc(mx, my, mr, 0, Math.PI * 2);
    ctxGame.fill();
    ctxGame.fillStyle = "rgba(200, 165, 95, 0.35)";
    [
      [0.3, -0.2, 0.18],
      [-0.25, 0.25, 0.14],
      [0.15, 0.4, 0.1],
      [-0.35, -0.3, 0.08],
    ].forEach(([cx, cy, cr]) => {
      ctxGame.beginPath();
      ctxGame.arc(mx + cx * mr, my + cy * mr, cr * mr, 0, Math.PI * 2);
      ctxGame.fill();
    });
    drawHangingBatsSil(ctxGame, gameW, gameH, animTime);
    drawParkSilhouettes(ctxGame, gameW, gameH, parallaxSlowX, CONFIG.bgSilhouettes.slowFill, false);
    clouds.forEach((c) => {
      drawCloudBlob(ctxGame, c.x, c.y, c.rw, c.rh, c.alpha);
    });
    drawParkSilhouettes(ctxGame, gameW, gameH, parallaxFastX, CONFIG.bgSilhouettes.fastFill, true);
  };
  const drawStarShape = (ctx, x, y, r, rot) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = "rgba(255,255,200,0.9)";
    ctx.beginPath();
    const spikes = 5;
    const outer = r;
    const inner = r * 0.42;
    for (let i = 0; i < spikes * 2; i += 1) {
      const rad = i % 2 === 0 ? outer : inner;
      const a = (i * Math.PI) / spikes - Math.PI / 2;
      const px = Math.cos(a) * rad;
      const py = Math.sin(a) * rad;
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
  const spawnPumpkin = () => {
    const next = Math.min(0.8, Math.max(0.15, lastPumpkinY + (Math.random() - 0.5) * 0.5));
    lastPumpkinY = next;
    const r = unit * CONFIG.pumpkinRadius;
    pumpkins.push({ x: gameW + r * 3, y: gameH * next, r, ph: Math.random() * Math.PI * 2 });
  };
  const spawnBat = () => {
    const raw = 0.12 + Math.random() * 0.76;
    const away = raw < lastPumpkinY ? -0.22 : 0.22;
    const shifted = Math.abs(raw - lastPumpkinY) < 0.14 ? lastPumpkinY + away : raw;
    const ny = shifted < 0.12 || shifted > 0.88 ? lastPumpkinY - away : shifted;
    const r = unit * CONFIG.batRadius;
    bats.push({
      x: gameW + r * 3,
      y: gameH * ny,
      baseY: gameH * ny,
      r,
      t: 0,
      phase: Math.random() * Math.PI * 2,
      amp: gameH * (0.025 + Math.random() * 0.05),
      wing: 0.85 + Math.random() * 0.4,
      speed: 1.05 + Math.random() * 0.25,
    });
  };
  const collectPumpkin = (p) => {
    score += 1;
    hudScoreNum.textContent = `${score}/${CONFIG.targetScore}`;
    bumpHud(hudScore);
    playSound("collect");
    spawnParticles(p.x, p.y, 18, {
      speed: unit * 0.7,
      life: 0.6,
      size: unit * 0.014,
      colors: ["#ffd45a", "#ff8a24", "#fff3b0"],
    });
    spawnRing(p.x, p.y, p.r, "rgba(255, 210, 90, 0.9)");
    spawnPopup(p.x, p.y - p.r, "+1", "#ffe27a");
    if (score >= CONFIG.targetScore) {
      beginEnd("end-win");
    }
  };
  const updateEntities = (dt, gs, active) => {
    const wc = witchCenter();
    const hx = wc.x;
    const hy = wc.y - witchH * 0.06;
    const bodyR = witchH * 0.18;
    for (let i = pumpkins.length - 1; i >= 0; i -= 1) {
      const p = pumpkins[i];
      p.x -= gs * dt;
      const dx = hx - p.x;
      const dy = hy - p.y;
      const reach = bodyR + p.r * 0.95;
      if (active && dx * dx + dy * dy < reach * reach) {
        pumpkins.splice(i, 1);
        collectPumpkin(p);
      } else if (p.x < -p.r * 3) {
        pumpkins.splice(i, 1);
      }
    }
    for (let i = bats.length - 1; i >= 0; i -= 1) {
      const b = bats[i];
      b.t += dt;
      b.x -= gs * b.speed * dt;
      b.y = Math.min(gameH * 0.92, Math.max(gameH * 0.08, b.baseY + Math.sin(b.t * 2.4 + b.phase) * b.amp));
      const dx = hx - b.x;
      const dy = hy - b.y;
      const reach = bodyR * 0.85 + b.r * CONFIG.hitboxShrink;
      if (active && hurtCooldown <= 0 && screenGame.dataset.phase === "play" && dx * dx + dy * dy < reach * reach) {
        bats.splice(i, 1);
        loseLife();
      } else if (b.x < -b.r * 4) {
        bats.splice(i, 1);
      }
    }
  };
  const gameStep = (dt) => {
    const phase = screenGame.dataset.phase;
    if (hurtCooldown > 0) {
      hurtCooldown -= dt;
    }
    if (flashTime > 0) {
      flashTime -= dt;
    }
    if (shakeTime > 0) {
      shakeTime -= dt;
    }
    const progress = Math.min(1, elapsed / CONFIG.gameDuration);
    const gs = CONFIG.gameSpeed * gameW * speedScale * (1 + CONFIG.speedRamp * progress);
    const drift = phase === "ready" ? 0.35 : 1;
    parallaxSlowX += gs * CONFIG.parallaxSlow * dt * drift;
    parallaxFastX += gs * CONFIG.parallaxFast * dt * drift;
    clouds.forEach((c) => {
      c.x -= c.speed * gs * 0.25 * dt * drift;
      if (c.x + c.rw * 2 < 0) {
        c.x = gameW + c.rw * 2 + Math.random() * gameW * 0.3;
        c.y = gameH * (0.15 + Math.random() * 0.5);
      }
    });
    updateParticles(dt);
    if (phase === "ready") {
      witchY = gameH * 0.45 - witchH * 0.5 + Math.sin(animTime * 3) * gameH * 0.015;
      return;
    }
    if (phase === "over") {
      updateEntities(dt, gs, false);
      endDelay -= dt;
      if (endDelay <= 0) {
        finishGame();
      }
      return;
    }
    elapsed += dt;
    timeLeft = Math.max(0, CONFIG.gameDuration - elapsed);
    const sec = Math.ceil(timeLeft);
    if (sec !== lastShownSecond) {
      lastShownSecond = sec;
      hudTimeNum.textContent = String(sec);
      hudTime.dataset.low = sec <= 5 ? "true" : "false";
      if (sec <= 5 && sec > 0) {
        playSound("tick");
        bumpHud(hudTime);
      }
    }
    witchVy = Math.min(witchVy + CONFIG.gravity * gameH * dt, CONFIG.maxFallSpeed * gameH);
    witchY += witchVy * dt;
    const atTop = witchY <= 0;
    const atBottom = witchY + witchH >= gameH;
    if (atTop) {
      witchY = 0;
      witchVy = Math.max(witchVy, 0);
    }
    if (atBottom) {
      witchY = gameH - witchH;
      witchVy = Math.min(witchVy, 0);
    }
    if ((atTop || atBottom) && hurtCooldown <= 0) {
      loseLife();
    }
    if (screenGame.dataset.phase !== "play") {
      return;
    }
    pumpkinTimer -= dt;
    if (pumpkinTimer <= 0) {
      pumpkinTimer = CONFIG.pumpkinSpawnInterval * (1 - 0.15 * progress);
      spawnPumpkin();
    }
    batTimer -= dt;
    if (batTimer <= 0) {
      batTimer = CONFIG.batSpawnInterval + (CONFIG.batMinInterval - CONFIG.batSpawnInterval) * progress;
      spawnBat();
    }
    trailTimer -= dt;
    if (trailTimer <= 0) {
      trailTimer = 0.03;
      const wc = witchCenter();
      spawnParticles(wc.x - witchH * 0.6, wc.y + witchH * 0.1, 1, {
        speed: unit * 0.06,
        vx: -gs * 0.5,
        life: 0.6,
        size: unit * 0.012,
        colors: [["#ffd45a", "#c38bff", "#8ff0c0"][Math.floor(Math.random() * 3)]],
      });
    }
    updateEntities(dt, gs, true);
    if (screenGame.dataset.phase === "play" && timeLeft <= 0) {
      beginEnd(score >= CONFIG.targetScore ? "end-win" : "end-lose");
    }
  };
  const drawParticles = () => {
    burstParticles.forEach((p) => {
      const k = Math.max(0, p.life / p.max);
      ctxGame.save();
      ctxGame.globalAlpha = k;
      if (p.type === "text") {
        ctxGame.font = `800 ${p.r}px system-ui, sans-serif`;
        ctxGame.textAlign = "center";
        ctxGame.textBaseline = "middle";
        ctxGame.lineWidth = p.r * 0.18;
        ctxGame.strokeStyle = "rgba(40, 12, 60, 0.9)";
        ctxGame.strokeText(p.text, p.x, p.y);
        ctxGame.fillStyle = p.color;
        ctxGame.fillText(p.text, p.x, p.y);
      } else if (p.type === "ring") {
        ctxGame.strokeStyle = p.color;
        ctxGame.lineWidth = p.r * 0.15 * k + 1;
        ctxGame.beginPath();
        ctxGame.arc(p.x, p.y, p.r * (1 + (1 - k) * 1.8), 0, Math.PI * 2);
        ctxGame.stroke();
      } else if (p.type === "smoke") {
        ctxGame.fillStyle = p.color;
        ctxGame.beginPath();
        ctxGame.arc(p.x, p.y, p.r * (1 + (1 - k) * 1.5), 0, Math.PI * 2);
        ctxGame.fill();
      } else {
        ctxGame.globalCompositeOperation = "lighter";
        ctxGame.fillStyle = p.color;
        ctxGame.beginPath();
        ctxGame.arc(p.x, p.y, p.r * k + 0.5, 0, Math.PI * 2);
        ctxGame.fill();
      }
      ctxGame.restore();
    });
  };
  const drawGame = () => {
    drawGameBackground();
    ctxGame.save();
    if (shakeTime > 0) {
      const mag = unit * 0.02 * (shakeTime / 0.35);
      ctxGame.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
    }
    pumpkins.forEach((p) => {
      drawPumpkinSprite(ctxGame, p.x, p.y + Math.sin(animTime * 3 + p.ph) * p.r * 0.12, p.r, animTime + p.ph);
    });
    bats.forEach((b) => {
      drawBatSprite(ctxGame, b.x, b.y, b.r, animTime + b.phase, b.wing);
    });
    const wc = witchCenter();
    const tilt = Math.max(-0.35, Math.min(0.4, (witchVy / Math.max(1, gameH * CONFIG.maxFallSpeed)) * 0.4));
    ctxGame.save();
    if (hurtCooldown > 0 && Math.floor(animTime * 14) % 2 === 0) {
      ctxGame.globalAlpha = 0.35;
    }
    ctxGame.translate(wc.x, wc.y);
    ctxGame.rotate(tilt);
    drawWitchSprite(ctxGame, 0, 0, witchH, animTime, 0.14);
    ctxGame.restore();
    drawParticles();
    ctxGame.restore();
    if (flashTime > 0) {
      const v = ctxGame.createRadialGradient(gameW * 0.5, gameH * 0.5, Math.min(gameW, gameH) * 0.25, gameW * 0.5, gameH * 0.5, Math.max(gameW, gameH) * 0.75);
      v.addColorStop(0, "rgba(255, 0, 40, 0)");
      v.addColorStop(1, `rgba(255, 0, 40, ${0.55 * (flashTime / 0.3)})`);
      ctxGame.fillStyle = v;
      ctxGame.fillRect(0, 0, gameW, gameH);
    }
  };
  const drawEndWinStars = (dt) => {
    const v = views.endStars;
    if (!v) {
      return;
    }
    const sctx = v.ctx;
    const sw = v.w;
    const sh = v.h;
    const base = Math.min(sw, sh);
    sctx.clearRect(0, 0, sw, sh);
    starBurstState.t += dt;
    starBurstState.stars.forEach((st) => {
      const age = Math.max(0, starBurstState.t - st.delay);
      const prog = Math.min(1, age / 0.8);
      sctx.save();
      sctx.globalAlpha = prog * (0.6 + 0.35 * Math.sin(age * 3 + st.rot));
      drawStarShape(sctx, st.x * sw, st.y * sh, st.maxR * base * prog, st.rot + age * 1.2);
      sctx.restore();
    });
    starBurstState.confetti.forEach((c) => {
      c.y += c.vy * dt;
      c.x += c.vx * dt;
      c.rot += c.vr * dt;
      if (c.y > 1.05) {
        c.y = -0.05;
        c.x = Math.random();
      }
      sctx.save();
      sctx.translate(c.x * sw, c.y * sh);
      sctx.rotate(c.rot);
      sctx.fillStyle = c.color;
      sctx.fillRect(-c.size * base * 0.5, -c.size * base * 0.25, c.size * base, c.size * base * 0.5 * Math.abs(Math.cos(c.rot * 1.3)) + 1);
      sctx.restore();
    });
  };
  const loop = (ts) => {
    const now = typeof ts === "number" ? ts : performance.now();
    const dt = lastTs ? Math.min(CONFIG.maxDt, Math.max(0, (now - lastTs) / 1000)) : 0;
    lastTs = now;
    animTime += dt;
    const state = root.dataset.state;
    if (state === "game") {
      gameStep(dt);
      drawGame();
    } else if (state === "end-win") {
      drawEndWinStars(dt);
    } else if (state === "intro" || state === "howto") {
      drawIntroAnim();
    }
    gameLoopId = requestAnimationFrame(loop);
  };
  const startGame = () => {
    root.dataset.state = "game";
    screenGame.dataset.phase = "ready";
    void root.offsetHeight;
    resizeCanvas();
    resetGame();
    playSound("start");
  };
  const copyCode = () => {
    const code = CONFIG.rewardCode;
    const done = () => {
      btnCopy.dataset.copied = "true";
      btnCopy.textContent = "Kopyaland\u0131 \u2713";
      playSound("copy");
    };
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = code;
      ta.setAttribute("readonly", "");
      ta.className = "gd-copy-ta";
      root.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch (err) {
        ta.remove();
        return;
      }
      ta.remove();
      done();
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(code).then(done).catch(fallback);
    } else {
      fallback();
    }
  };
  const onFlap = (e) => {
    if (root.dataset.state !== "game") {
      return;
    }
    if (e.cancelable) {
      e.preventDefault();
    }
    const phase = screenGame.dataset.phase;
    if (phase === "over") {
      return;
    }
    if (phase === "ready") {
      screenGame.dataset.phase = "play";
    }
    witchVy = CONFIG.flapStrength * gameH;
    playSound("flap");
    const wc = witchCenter();
    spawnParticles(wc.x - witchH * 0.2, wc.y + witchH * 0.2, 6, {
      speed: unit * 0.25,
      vy: unit * 0.3,
      life: 0.4,
      size: unit * 0.012,
      colors: ["#c38bff", "#ffd45a"],
    });
  };
  const onKey = (e) => {
    if (e.code !== "Space" && e.code !== "ArrowUp" && e.code !== "KeyW") {
      return;
    }
    if (root.dataset.state !== "game") {
      return;
    }
    e.preventDefault();
    if (e.repeat) {
      return;
    }
    onFlap(e);
  };
  const closeGame = () => {
    if (root.dataset.state === "closing") {
      return;
    }
    root.dataset.prev = root.dataset.state;
    root.dataset.state = "closing";
  };
  const destroy = () => {
    cancelAnimationFrame(gameLoopId);
    if (resizeRaf) {
      cancelAnimationFrame(resizeRaf);
    }
    window.removeEventListener("resize", scheduleResize);
    window.removeEventListener("orientationchange", scheduleResize);
    window.removeEventListener("keydown", onKey, true);
    if (audioCtx) {
      audioCtx.close().catch(() => {});
    }
    root.remove();
    styleEl.remove();
  };
  btnHowto.addEventListener("click", () => {
    getAudio();
    setState("howto");
  });
  btnStart.addEventListener(
    "click",
    () => {
      try {
        const _vlc = "<%VLSendClickFunc%>";
        if (_vlc.indexOf("<%") === -1) {
          new Function(_vlc)();
        }
      } catch (err) {
        root.dataset.track = "error";
      }
    },
    { once: true }
  );
  btnStart.addEventListener("click", startGame);
  btnRetry.addEventListener("click", startGame);
  btnCopy.addEventListener("click", copyCode);
  btnClaim.addEventListener("click", closeGame);
  closeBtn.addEventListener("click", closeGame);
  root.addEventListener(
    "animationend",
    (e) => {
      if (e.target === root && root.dataset.state === "closing") {
        destroy();
      }
    },
    true
  );
  hud.addEventListener("animationend", (e) => {
    const cell = e.target.parentElement;
    if (cell && cell.dataset.bump === "true") {
      cell.dataset.bump = "false";
    }
  });
  window.addEventListener("resize", scheduleResize);
  window.addEventListener("orientationchange", scheduleResize);
  gameCv.addEventListener("pointerdown", onFlap);
  window.addEventListener("keydown", onKey, true);
  scheduleResize();
  gameLoopId = requestAnimationFrame(loop);
  try {
    const _vli = "<%VLSendImpressionFunc%>";
    if (_vli.indexOf("<%") === -1) {
      new Function(_vli)();
    }
  } catch (err) {
    root.dataset.track = "error";
  }
};

initGravityDodger();
