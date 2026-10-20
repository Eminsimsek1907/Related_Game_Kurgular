function initDartGame() {
    if (document.querySelector("#dart-game-wrap")) {
        return;
    }

    const SECTOR_ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
    const STORAGE_KEY = "dart_best_score";
    const THROW_MS = 680;
    const LAUNCH_BELOW_R = 1.72;
    const ARC_SAG = 0.26;
    const aimMoveRaf = { id: 0 };

    let gaussianSpare = null;

    const gaussianRandom = () => {
        if (gaussianSpare !== null) {
            const z = gaussianSpare;
            gaussianSpare = null;
            return z;
        }
        const u = 1 - Math.random();
        const v = Math.random();
        const mag = Math.sqrt(-2 * Math.log(u));
        const z0 = mag * Math.cos(2 * Math.PI * v);
        gaussianSpare = mag * Math.sin(2 * Math.PI * v);
        return z0;
    };

    const angleToSectorIndex = (angle) => {
        let deg = angle * 180 / Math.PI;
        deg = (deg + 90 + 9 + 720) % 360;
        return Math.floor(deg / 18) % 20;
    };

    const dartSvg = (cls) => `
        <svg class="${cls}" data-spent="false" viewBox="0 0 40 56" width="100%" height="100%" aria-hidden="true">
            <defs>
                <linearGradient id="dart-svg-barrel" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0" stop-color="#7b818a"/>
                    <stop offset="0.5" stop-color="#f4f6f9"/>
                    <stop offset="1" stop-color="#6c727b"/>
                </linearGradient>
            </defs>
            <path d="M20 1 L21.3 13 L18.7 13 Z" fill="#d9dde3"/>
            <rect x="17.2" y="13" width="5.6" height="14" rx="1.6" fill="url(#dart-svg-barrel)"/>
            <path d="M17.2 16 H22.8 M17.2 19 H22.8 M17.2 22 H22.8 M17.2 25 H22.8" stroke="#555b64" stroke-width="0.7"/>
            <rect x="19" y="27" width="2" height="11" fill="#22262c"/>
            <path d="M20 33 L31 46 L31 54 L20 46 Z" fill="#e53935"/>
            <path d="M20 33 L9 46 L9 54 L20 46 Z" fill="#b71c1c"/>
            <path d="M20 33 L20 54" stroke="#ffd54f" stroke-width="1.6"/>
        </svg>
    `;

    const SCORE_RINGS = {
        BULL: 0.05,
        OUTER_BULL: 0.1,
        TRIPLE_IN: 0.57,
        TRIPLE_OUT: 0.63,
        DOUBLE_IN: 0.88,
        DOUBLE_OUT: 0.95
    };
    const SWAY_RATIO = 0.055;
    const SPREAD_RATIO = 0.03;

    let audioCtx = null;

    const playTone = (type) => {
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === "suspended") {
                audioCtx.resume();
            }
            const now = audioCtx.currentTime;
            const gain = audioCtx.createGain();
            gain.connect(audioCtx.destination);
            if (type === "whoosh") {
                const len = Math.floor(audioCtx.sampleRate * 0.35);
                const buffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < len; i += 1) {
                    data[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / len);
                }
                const src = audioCtx.createBufferSource();
                const filter = audioCtx.createBiquadFilter();
                filter.type = "bandpass";
                filter.frequency.setValueAtTime(900, now);
                filter.frequency.exponentialRampToValueAtTime(2600, now + 0.35);
                gain.gain.setValueAtTime(0.18, now);
                src.buffer = buffer;
                src.connect(filter);
                filter.connect(gain);
                src.start(now);
                return;
            }
            if (type === "thud") {
                const osc = audioCtx.createOscillator();
                osc.type = "triangle";
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);
                gain.gain.setValueAtTime(0.5, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
                osc.connect(gain);
                osc.start(now);
                osc.stop(now + 0.2);
                return;
            }
            if (type === "win") {
                [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
                    const osc = audioCtx.createOscillator();
                    const g = audioCtx.createGain();
                    const t = now + i * 0.09;
                    osc.type = "sine";
                    osc.frequency.value = freq;
                    g.gain.setValueAtTime(0, t);
                    g.gain.linearRampToValueAtTime(0.18, t + 0.04);
                    g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
                    osc.connect(g);
                    g.connect(audioCtx.destination);
                    osc.start(t);
                    osc.stop(t + 0.7);
                });
            }
        } catch (e) {}
    };

    const style = document.createElement("style");
    style.id = "dart-game-style";
    style.textContent = `
        @keyframes dart-welcome-out {
            0% {
                opacity: 1;
                transform: scale(1);
            }
            100% {
                opacity: 0;
                transform: scale(0.92);
            }
        }

        @keyframes dart-fly-up {
            0% {
                opacity: 1;
                transform: translate(-50%, 0) scale(1);
            }
            100% {
                opacity: 0.35;
                transform: translate(-50%, -12em) scale(0.65);
            }
        }

        @keyframes dart-sway {
            0% {
                transform: rotate(-8deg);
            }
            100% {
                transform: rotate(8deg);
            }
        }

        @keyframes dart-hit-pop {
            0% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.4);
            }
            25% {
                opacity: 1;
                transform: translate(-50%, -90%) scale(1.15);
            }
            70% {
                opacity: 1;
                transform: translate(-50%, -130%) scale(1);
            }
            100% {
                opacity: 0;
                transform: translate(-50%, -170%) scale(0.9);
            }
        }

        @keyframes dart-gameover-in {
            0% {
                opacity: 0;
                transform: scale(0.94);
            }
            100% {
                opacity: 1;
                transform: scale(1);
            }
        }

        #dart-game-wrap {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            max-width: 100%;
            max-height: 100%;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            justify-content: flex-start;
            box-sizing: border-box;
            padding:
                max(0.75rem, env(safe-area-inset-top))
                max(0.75rem, env(safe-area-inset-right))
                max(0.75rem, env(safe-area-inset-bottom))
                max(0.75rem, env(safe-area-inset-left));
            font-size: clamp(14px, 2.8vw, 18px);
            line-height: 1.35;
            font-family:
                system-ui,
                -apple-system,
                "Segoe UI",
                Roboto,
                Arial,
                sans-serif;
            color: #f5f0e8;
            background-color: #3d1818;
            background-image:
                repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 1.15em,
                    rgba(0, 0, 0, 0.22) 1.15em,
                    rgba(0, 0, 0, 0.22) 1.2em
                ),
                repeating-linear-gradient(
                    90deg,
                    #4a1f1f,
                    #4a1f1f 2.4em,
                    #5c2828 2.4em,
                    #5c2828 4.75em,
                    #3f1717 4.75em,
                    #3f1717 5em
                );
            background-size:
                100% 100%,
                100% 100%;
            overflow: hidden;
        }

        #dart-game-wrap[data-state="welcome"] #dart-game-main {
            filter: brightness(0.72);
        }

        #dart-close-btn {
            position: absolute;
            top: max(0.5rem, env(safe-area-inset-top));
            right: max(0.5rem, env(safe-area-inset-right));
            width: 2.75em;
            height: 2.75em;
            min-width: 44px;
            min-height: 44px;
            border-radius: 50%;
            border: 0.12em solid rgba(255, 255, 255, 0.35);
            background: rgba(0, 0, 0, 0.35);
            color: #ffffff;
            font-size: 1.35em;
            font-weight: 700;
            line-height: 1;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100002;
            transition: opacity 0.2s ease;
        }

        #dart-close-btn:hover {
            opacity: 0.9;
        }

        #dart-game-wrap[data-state="welcome"] #dart-finish-btn,
        #dart-game-wrap[data-state="gameover"] #dart-finish-btn {
            display: none;
        }

        #dart-finish-btn {
            position: absolute;
            top: max(0.5rem, env(safe-area-inset-top));
            right: calc(max(0.5rem, env(safe-area-inset-right)) + 3.5em);
            padding: 0.45em 0.75em;
            min-height: 44px;
            border-radius: 0.5em;
            border: 0.1em solid rgba(255, 255, 255, 0.28);
            background: rgba(0, 0, 0, 0.28);
            color: #fde8c8;
            font-size: 0.82em;
            font-weight: 700;
            letter-spacing: 0.04em;
            cursor: pointer;
            z-index: 100002;
        }

        #dart-welcome-overlay {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(10, 5, 5, 0.72);
            z-index: 100001;
            padding: 1em;
            box-sizing: border-box;
        }

        #dart-welcome-overlay[data-closing="true"] #dart-welcome-card {
            animation: dart-welcome-out 0.45s ease forwards;
        }

        #dart-welcome-card {
            width: min(92vw, 28em);
            max-height: min(86vh, 38em);
            overflow: auto;
            border-radius: 1em;
            padding: 1.15em 1.25em 1.35em;
            background: linear-gradient(165deg, #2a1515 0%, #1a0c0c 100%);
            border: 0.12em solid rgba(255, 210, 150, 0.35);
            box-shadow:
                0 0.6em 2em rgba(0, 0, 0, 0.55),
                inset 0 0 0 0.06em rgba(255, 255, 255, 0.06);
            font-size: 1em;
        }

        #dart-welcome-card h1 {
            margin: 0.35em 0 0.15em;
            text-align: center;
            font-size: 1.35em;
            letter-spacing: 0.08em;
            color: #ffd9a0;
        }

        #dart-welcome-lead {
            margin: 0 0 0.4em;
            font-size: 0.82em;
            color: #d8c8b4;
            text-align: center;
        }

        #dart-welcome-icon {
            display: block;
            width: 4.5em;
            height: 4.5em;
            margin: 0 auto 0.25em;
        }

        #dart-welcome-card ul {
            margin: 0.5em 0 0.85em;
            padding-left: 1.15em;
            font-size: 0.82em;
            color: #e8dcc8;
        }

        #dart-welcome-card li {
            margin-bottom: 0.35em;
        }

        #dart-start-btn {
            display: block;
            width: 100%;
            margin-top: 0.35em;
            padding: 0.75em 1em;
            border: none;
            border-radius: 0.65em;
            background: linear-gradient(180deg, #e85a2c 0%, #b83218 100%);
            color: #fff8f0;
            font-size: 1em;
            font-weight: 800;
            letter-spacing: 0.12em;
            cursor: pointer;
            box-shadow: 0 0.35em 0 #5c1a0d;
        }

        #dart-start-btn:active {
            transform: translateY(0.12em);
            box-shadow: 0 0.2em 0 #5c1a0d;
        }

        #dart-game-main {
            position: relative;
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
            width: 100%;
            max-width: 72em;
            margin: 0 auto;
            align-self: center;
        }

        #dart-game-bar {
            display: flex;
            flex-direction: column;
            gap: 0.5em;
            padding: 0.35em 0 0.5em;
            flex-shrink: 0;
        }

        #dart-round-label {
            text-align: center;
            font-size: 0.82em;
            font-weight: 700;
            letter-spacing: 0.05em;
            color: #ffe8c4;
            text-shadow: 0 0.08em 0.2em rgba(0, 0, 0, 0.45);
        }

        #dart-hint {
            text-align: center;
            font-size: 0.72em;
            font-weight: 600;
            color: rgba(255, 228, 196, 0.82);
            margin-top: 0.15em;
        }

        #dart-score-row {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 0.5em;
        }

        #dart-scoreboard {
            margin-left: auto;
            padding: 0.45em 0.65em;
            border-radius: 0.55em;
            background: rgba(0, 0, 0, 0.38);
            border: 0.08em solid rgba(255, 255, 255, 0.12);
            font-size: 0.82em;
            font-weight: 700;
            letter-spacing: 0.04em;
        }

        #dart-scoreboard span {
            display: block;
        }

        #dart-dart-strip {
            display: flex;
            flex-direction: row;
            justify-content: center;
            gap: 0.65em;
            padding: 0.25em 0;
        }

        .dart-strip-icon {
            width: 1.65em;
            height: 2.4em;
            opacity: 1;
            transition: opacity 0.35s ease;
        }

        .dart-strip-icon[data-spent="true"] {
            opacity: 0.22;
        }

        #dart-hit-pop {
            position: absolute;
            left: 50%;
            top: 50%;
            padding: 0.3em 0.7em;
            border-radius: 0.6em;
            background: linear-gradient(180deg, #ffd54f 0%, #ff9800 100%);
            color: #3a1400;
            font-size: 1.1em;
            font-weight: 900;
            letter-spacing: 0.06em;
            white-space: nowrap;
            box-shadow: 0 0.3em 0.9em rgba(0, 0, 0, 0.45);
            pointer-events: none;
            opacity: 0;
            z-index: 3;
        }

        #dart-hit-pop[data-active="true"] {
            animation: dart-hit-pop 1.1s ease-out forwards;
        }

        #dart-hit-pop[data-tier="miss"] {
            background: linear-gradient(180deg, #9e9e9e 0%, #616161 100%);
            color: #ffffff;
        }

        #dart-hit-pop[data-tier="great"] {
            background: linear-gradient(180deg, #ff5252 0%, #c62828 100%);
            color: #ffffff;
        }

        #dart-canvas-wrap {
            position: relative;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 0;
            padding: 0.25em 0 1.15em;
            margin-bottom: 0.35em;
        }

        #dart-canvas {
            display: block;
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            touch-action: none;
            cursor: grab;
            user-select: none;
            border-radius: 50%;
            box-shadow:
                0 0 0 0.45em #5a3a1e,
                0 0 0 0.7em #2e1a0b,
                0 0.9em 2.4em rgba(0, 0, 0, 0.7);
        }

        #dart-canvas[data-aim-drag="true"] {
            cursor: grabbing;
        }

        #dart-throw-zone {
            position: relative;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 0.45em 0 0.75em;
            gap: 0.55em;
            min-height: 5.5em;
        }

        #dart-fire-btn {
            padding: 0.55em 1.35em;
            min-height: 44px;
            border-radius: 0.55em;
            border: 0.1em solid rgba(255, 200, 120, 0.45);
            background: linear-gradient(180deg, #c94a24 0%, #8f3018 100%);
            color: #fff8f0;
            font-size: 0.82em;
            font-weight: 800;
            letter-spacing: 0.14em;
            cursor: pointer;
            box-shadow: 0 0.25em 0 #4a1508;
        }

        #dart-fire-btn[data-disabled="true"] {
            opacity: 0.38;
            pointer-events: none;
            cursor: default;
            box-shadow: none;
        }

        #dart-fire-btn:active:not([data-disabled="true"]) {
            transform: translateY(0.1em);
        }

        #dart-throw-fly {
            position: absolute;
            top: 0.45em;
            left: 50%;
            width: 2.2em;
            height: 3.2em;
            pointer-events: none;
            opacity: 0;
            z-index: 2;
        }

        #dart-throw-fly[data-active="true"] {
            opacity: 1;
            animation: dart-fly-up 0.55s ease-out forwards;
        }

        #dart-throw-preview {
            width: 2.2em;
            height: 3.2em;
            transform-origin: 50% 80%;
            animation: dart-sway 1.2s ease-in-out infinite alternate;
        }

        #dart-throw-preview[data-paused="true"] {
            animation: none;
            opacity: 0.35;
        }

        #dart-gameover-overlay {
            position: absolute;
            inset: 0;
            display: none;
            align-items: center;
            justify-content: center;
            background: rgba(8, 4, 4, 0.78);
            z-index: 100003;
            padding: 1em;
            box-sizing: border-box;
        }

        #dart-game-wrap[data-state="gameover"] #dart-gameover-overlay {
            display: flex;
        }

        #dart-gameover-card {
            width: min(90vw, 22em);
            padding: 1.25em 1.2em 1.4em;
            border-radius: 1em;
            background: linear-gradient(165deg, #241010 0%, #140808 100%);
            border: 0.12em solid rgba(255, 200, 130, 0.4);
            animation: dart-gameover-in 0.4s ease forwards;
            text-align: center;
        }

        #dart-gameover-card h2 {
            margin: 0 0 0.65em;
            font-size: 1.2em;
            letter-spacing: 0.12em;
            color: #ffc98a;
        }

        #dart-gameover-stats {
            font-size: 0.95em;
            font-weight: 700;
            margin-bottom: 1em;
            color: #f0e4d4;
        }

        .dart-go-gap {
            margin-top: 0.45em;
        }

        #dart-go-reward {
            margin-top: 0.65em;
            padding: 0.65em 0.55em;
            border-radius: 0.55em;
            background: rgba(40, 22, 12, 0.65);
            border: 0.08em solid rgba(255, 190, 100, 0.35);
            font-size: 0.88em;
            font-weight: 700;
            color: #ffe8c8;
            line-height: 1.4;
        }

        #dart-go-code {
            margin-top: 0.5em;
            font-size: 1.05em;
            letter-spacing: 0.12em;
            color: #fff2a8;
            word-break: break-all;
        }

        #dart-replay-btn,
        #dart-exit-btn {
            display: block;
            width: 100%;
            margin-top: 0.5em;
            padding: 0.65em 0.85em;
            border-radius: 0.55em;
            font-size: 0.92em;
            font-weight: 800;
            letter-spacing: 0.08em;
            cursor: pointer;
            border: 0.1em solid rgba(255, 255, 255, 0.2);
        }

        #dart-replay-btn {
            background: linear-gradient(180deg, #2e9d4a 0%, #1d6b32 100%);
            color: #f4fff6;
        }

        #dart-exit-btn {
            background: rgba(0, 0, 0, 0.35);
            color: #e8ddd0;
        }

        @media (min-width: 768px) {
            #dart-game-wrap {
                font-size: clamp(15px, 1.35vw, 17px);
            }

            #dart-game-bar {
                flex-direction: row;
                align-items: flex-start;
                justify-content: space-between;
                padding-top: 0.15em;
            }

            #dart-round-label {
                flex: 1;
                text-align: left;
                padding-top: 0.25em;
            }

            #dart-hint {
                text-align: left;
            }

            #dart-score-row {
                flex: 0 0 auto;
                flex-direction: column;
                align-items: flex-end;
                gap: 0.35em;
                margin-top: 3.4em;
            }

            #dart-body {
                display: flex;
                flex-direction: row;
                flex: 1;
                min-height: 0;
                gap: 0.85em;
                align-items: stretch;
            }

            #dart-dart-strip {
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 0 0.25em;
                gap: 0.85em;
            }

            .dart-strip-icon {
                width: 1.85em;
                height: 2.65em;
            }

            #dart-canvas-col {
                flex: 1;
                display: flex;
                flex-direction: column;
                min-width: 0;
                min-height: 0;
            }

            #dart-canvas-wrap {
                flex: 1;
            }
        }

        @media (min-width: 1024px) {
            #dart-game-wrap {
                font-size: 17px;
            }

            #dart-welcome-card {
                width: min(36em, 92vw);
                max-height: min(88vh, 40em);
                padding: 1.35em 1.5em 1.5em;
            }

            #dart-welcome-card h1 {
                font-size: 1.5em;
            }

            #dart-welcome-card ul {
                font-size: 0.88em;
            }
        }

        @media (max-width: 767px) {
            #dart-score-row {
                justify-content: center;
            }

            #dart-scoreboard {
                margin-left: 0;
            }

            #dart-finish-btn {
                right: max(0.5rem, env(safe-area-inset-right));
                top: calc(max(0.5rem, env(safe-area-inset-top)) + 3.2em);
                font-size: 0.78em;
            }
        }

        @media (pointer: coarse) {
            #dart-close-btn {
                width: 3em;
                height: 3em;
                font-size: 1.45em;
            }

            #dart-start-btn {
                padding: 0.85em 1em;
            }

            #dart-canvas {
                cursor: grab;
            }

            #dart-canvas[data-aim-drag="true"] {
                cursor: grabbing;
            }
        }
    `;
    document.head.appendChild(style);

    const wrap = document.createElement("div");
    wrap.id = "dart-game-wrap";
    wrap.dataset.state = "welcome";

    wrap.innerHTML = `
        <button type="button" id="dart-close-btn" aria-label="Kapat">×</button>
        <button type="button" id="dart-finish-btn">OYUNU BİTİR</button>
        <div id="dart-welcome-overlay">
            <div id="dart-welcome-card">
                <svg id="dart-welcome-icon" viewBox="0 0 100 100" aria-hidden="true">
                    <circle cx="50" cy="50" r="46" fill="#1a1a1a"/>
                    <circle cx="50" cy="50" r="38" fill="#eaeaea"/>
                    <circle cx="50" cy="50" r="6" fill="#c62828"/>
                    <circle cx="50" cy="50" r="14" fill="#2e7d32"/>
                    <circle cx="50" cy="50" r="30" fill="none" stroke="#c62828" stroke-width="4"/>
                    <circle cx="50" cy="50" r="22" fill="none" stroke="#2e7d32" stroke-width="4"/>
                </svg>
                <h1>DART OYUNU</h1>
                <p id="dart-welcome-lead">Nasıl Oynanır</p>
                <ul>
                    <li>Tahtada basılı tutup sürükleyerek nişan al.</li>
                    <li>Nişangah elin titrediği için hafifçe sallanır; doğru anı yakala.</li>
                    <li>Toplam 3 atış hakkın var. Atış için Boşluk tuşuna bas veya FIRLAT düğmesini kullan.</li>
                    <li>Tahtanın merkezine yakın nişan al, daha fazla puan kazan.</li>
                    <li>Bullseye (merkez): 50 puan.</li>
                    <li>Bull (iç yeşil alan): 25 puan.</li>
                    <li>Triple halka: sektör puanı ×3.</li>
                    <li>Double halka: sektör puanı ×2.</li>
                    <li>Normal sektörler: 1–20 arası puan.</li>
                    <li>Oyun sonunda puana göre indirim mesajı ve kod gösterilir.</li>
                </ul>
                <button type="button" id="dart-start-btn">OYUNU BAŞLAT</button>
            </div>
        </div>
        <div id="dart-game-main">
            <div id="dart-game-bar">
                <div>
                    <div id="dart-round-label">KALAN ATIŞ: 3</div>
                    <div id="dart-hint">Nişan: tahtada sürükle · Atış: Boşluk veya FIRLAT</div>
                </div>
                <div id="dart-score-row">
                    <div id="dart-scoreboard">
                        <span id="dart-total-score">PUAN: 0</span>
                    </div>
                </div>
            </div>
            <div id="dart-body">
                <div id="dart-dart-strip" aria-hidden="true">
                    ${dartSvg("dart-strip-icon")}
                    ${dartSvg("dart-strip-icon")}
                    ${dartSvg("dart-strip-icon")}
                </div>
                <div id="dart-canvas-col">
                    <div id="dart-canvas-wrap">
                        <canvas id="dart-canvas" width="400" height="400"></canvas>
                        <div id="dart-hit-pop" data-active="false"></div>
                    </div>
                    <div id="dart-throw-zone">
                        <div id="dart-throw-fly" data-active="false">
                            ${dartSvg("dart-fly-icon")}
                        </div>
                        <div id="dart-throw-preview">
                            ${dartSvg("dart-preview-icon")}
                        </div>
                        <button type="button" id="dart-fire-btn">FIRLAT</button>
                    </div>
                </div>
            </div>
        </div>
        <div id="dart-gameover-overlay">
            <div id="dart-gameover-card">
                <h2>OYUN BİTTİ</h2>
                <div id="dart-gameover-stats">
                    <div id="dart-go-total"></div>
                    <div id="dart-go-best" class="dart-go-gap"></div>
                    <div id="dart-go-reward"></div>
                    <div id="dart-go-code"></div>
                </div>
                <button type="button" id="dart-replay-btn">YENİDEN OYNA</button>
                <button type="button" id="dart-exit-btn">ÇIKIŞ</button>
            </div>
        </div>
    `;

    (document.body || document.documentElement).appendChild(wrap);

    const canvas = wrap.querySelector("#dart-canvas");
    const ctx = canvas.getContext("2d");
    const welcomeOverlay = wrap.querySelector("#dart-welcome-overlay");
    const welcomeCard = wrap.querySelector("#dart-welcome-card");
    const startBtn = wrap.querySelector("#dart-start-btn");
    const closeBtn = wrap.querySelector("#dart-close-btn");
    const finishBtn = wrap.querySelector("#dart-finish-btn");
    const roundLabel = wrap.querySelector("#dart-round-label");
    const totalScoreEl = wrap.querySelector("#dart-total-score");
    const stripIcons = wrap.querySelectorAll(".dart-strip-icon");
    const throwFly = wrap.querySelector("#dart-throw-fly");
    const throwPreview = wrap.querySelector("#dart-throw-preview");
    const fireBtn = wrap.querySelector("#dart-fire-btn");
    const gameoverOverlay = wrap.querySelector("#dart-gameover-overlay");
    const gameoverTotal = wrap.querySelector("#dart-go-total");
    const gameoverBest = wrap.querySelector("#dart-go-best");
    const gameoverReward = wrap.querySelector("#dart-go-reward");
    const gameoverCode = wrap.querySelector("#dart-go-code");
    const replayBtn = wrap.querySelector("#dart-replay-btn");
    const exitBtn = wrap.querySelector("#dart-exit-btn");
    const canvasWrap = wrap.querySelector("#dart-canvas-wrap");
    const hitPop = wrap.querySelector("#dart-hit-pop");
    const BOARD_FILL = 0.86;

    let swayTime = 0;
    let boardRadius = 0;
    let centerX = 0;
    let centerY = 0;
    let throwIndex = 0;
    let totalScore = 0;
    let aimX = 0;
    let aimY = 0;
    let dartMarks = [];
    let throwing = false;
    let aimDragActive = false;
    let resizeRaf = 0;

    const readBest = () => {
        const v = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
        return Number.isFinite(v) ? v : 0;
    };

    const writeBestIfGame = (value) => {
        const prev = readBest();
        if (value > prev) {
            localStorage.setItem(STORAGE_KEY, String(value));
        }
    };

    const makeDiscountCode = () => {
        const a = Math.random().toString(36).slice(2, 5).toUpperCase();
        const b = String(Math.floor(Math.random() * 900 + 100));
        return "DART-" + a + b;
    };

    const getRewardForScore = (s) => {
        if (s <= 0) {
            return {
                text: "Bu sefer puan toplayamadın. Bir dahaki sefere!",
                code: null
            };
        }
        if (s < 35) {
            return {
                text: "İsabet gelişiyor! %5 indirim kazandın.",
                code: makeDiscountCode()
            };
        }
        if (s < 75) {
            return {
                text: "Güzel atışlar! %10 indirim kazandın.",
                code: makeDiscountCode()
            };
        }
        if (s < 130) {
            return {
                text: "Çok iyi performans! %15 indirim kazandın.",
                code: makeDiscountCode()
            };
        }
        return {
            text: "Efsane isabet! %20 indirim kazandın.",
            code: makeDiscountCode()
        };
    };

    const updateScoreboard = () => {
        totalScoreEl.textContent = "PUAN: " + totalScore;
    };

    const setStrip = () => {
        stripIcons.forEach((node, i) => {
            node.dataset.spent = i < throwIndex ? "true" : "false";
        });
    };

    const setFireEnabled = () => {
        const ok = wrap.dataset.state === "playing" && !throwing && throwIndex < 3;
        fireBtn.dataset.disabled = ok ? "false" : "true";
    };

    const setPlayingUi = () => {
        const left = 3 - throwIndex;
        roundLabel.textContent = "KALAN ATIŞ: " + left;
        setStrip();
        updateScoreboard();
        setFireEnabled();
    };

    const clampAimToBoard = (x, y) => {
        const cx = centerX;
        const cy = centerY;
        const R = boardRadius;
        const dx = x - cx;
        const dy = y - cy;
        const d = Math.hypot(dx, dy);
        if (d <= R || d === 0) {
            return { x, y };
        }
        const t = R / d;
        return {
            x: cx + dx * t,
            y: cy + dy * t
        };
    };

    const getLaunchCanvasPos = () => {
        const rawY = centerY + boardRadius * LAUNCH_BELOW_R;
        const capY = canvas.height - boardRadius * 0.1;
        return {
            x: centerX + (aimX - centerX) * 0.14,
            y: rawY < capY ? rawY : capY
        };
    };

    const syncAimFromEvent = (clientX, clientY) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;
        const c = clampAimToBoard(x, y);
        aimX = c.x;
        aimY = c.y;
    };

    const scheduleAimRedraw = () => {
        if (aimMoveRaf.id) {
            return;
        }
        aimMoveRaf.id = requestAnimationFrame(() => {
            aimMoveRaf.id = 0;
            if (wrap.dataset.state === "playing" && !throwing && throwIndex < 3) {
                redrawMarks();
            }
        });
    };

    const getSwayedAim = () => {
        const amp = boardRadius * SWAY_RATIO;
        const t = swayTime;
        return clampAimToBoard(
            aimX + Math.sin(t * 0.0017) * amp + Math.sin(t * 0.0043) * amp * 0.35,
            aimY + Math.cos(t * 0.0023) * amp + Math.sin(t * 0.0031) * amp * 0.35
        );
    };

    const drawAimReticle = () => {
        if (wrap.dataset.state !== "playing" || throwing || throwIndex >= 3) {
            return;
        }
        const sway = getSwayedAim();
        const ax = sway.x;
        const ay = sway.y;
        ctx.save();
        ctx.strokeStyle = "rgba(255, 210, 120, 0.95)";
        ctx.lineWidth = Math.max(1.5, boardRadius * 0.008);
        ctx.beginPath();
        ctx.arc(ax, ay, boardRadius * 0.045, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ax - boardRadius * 0.09, ay);
        ctx.lineTo(ax + boardRadius * 0.09, ay);
        ctx.moveTo(ax, ay - boardRadius * 0.09);
        ctx.lineTo(ax, ay + boardRadius * 0.09);
        ctx.stroke();
        ctx.restore();
    };

    const drawDart = (x, y, angle, scale) => {
        const u = boardRadius * 0.011 * scale;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
        ctx.beginPath();
        ctx.ellipse(u * 2.4, u * 16, u * 2.6, u * 13, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#cfd4db";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(u * 0.75, u * 5);
        ctx.lineTo(-u * 0.75, u * 5);
        ctx.closePath();
        ctx.fill();

        const barrel = ctx.createLinearGradient(-u * 1.7, 0, u * 1.7, 0);
        barrel.addColorStop(0, "#6d737c");
        barrel.addColorStop(0.5, "#f5f7fa");
        barrel.addColorStop(1, "#5f656e");
        ctx.fillStyle = barrel;
        ctx.fillRect(-u * 1.7, u * 5, u * 3.4, u * 11);

        ctx.strokeStyle = "#4a5058";
        ctx.lineWidth = Math.max(0.6, u * 0.35);
        ctx.beginPath();
        for (let k = 0; k < 4; k += 1) {
            ctx.moveTo(-u * 1.7, u * (7 + k * 2.5));
            ctx.lineTo(u * 1.7, u * (7 + k * 2.5));
        }
        ctx.stroke();

        ctx.fillStyle = "#1f232a";
        ctx.fillRect(-u * 0.6, u * 16, u * 1.2, u * 9);

        ctx.fillStyle = "#e53935";
        ctx.beginPath();
        ctx.moveTo(0, u * 19);
        ctx.lineTo(u * 6, u * 27);
        ctx.lineTo(u * 6, u * 31);
        ctx.lineTo(0, u * 27);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#b71c1c";
        ctx.beginPath();
        ctx.moveTo(0, u * 19);
        ctx.lineTo(-u * 6, u * 27);
        ctx.lineTo(-u * 6, u * 31);
        ctx.lineTo(0, u * 27);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#ffd54f";
        ctx.lineWidth = Math.max(0.8, u * 0.7);
        ctx.beginPath();
        ctx.moveTo(0, u * 19);
        ctx.lineTo(0, u * 31);
        ctx.stroke();

        ctx.restore();
    };

    const showHitPop = (fx, fy, label, tier) => {
        const canvasRect = canvas.getBoundingClientRect();
        const wrapRect = canvasWrap.getBoundingClientRect();
        hitPop.textContent = label;
        hitPop.dataset.tier = tier;
        hitPop.style.left = (canvasRect.left - wrapRect.left + fx / canvas.width * canvasRect.width) + "px";
        hitPop.style.top = (canvasRect.top - wrapRect.top + fy / canvas.height * canvasRect.height) + "px";
        hitPop.dataset.active = "false";
        void hitPop.offsetWidth;
        hitPop.dataset.active = "true";
    };

    const drawDistanceGuide = () => {
        if (wrap.dataset.state !== "playing" || throwing || throwIndex >= 3) {
            return;
        }
        if (boardRadius <= 0) {
            return;
        }
        const p = getLaunchCanvasPos();
        const sway = getSwayedAim();
        ctx.save();
        ctx.setLineDash([boardRadius * 0.045, boardRadius * 0.06]);
        ctx.strokeStyle = "rgba(255, 232, 200, 0.32)";
        ctx.lineWidth = Math.max(1, boardRadius * 0.007);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(sway.x, sway.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    };

    const drawBoard = () => {
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        centerX = w / 2;
        centerY = h / 2;
        boardRadius = Math.min(w, h) / 2 * BOARD_FILL;
        const R = boardRadius;
        const cx = centerX;
        const cy = centerY;
        const rings = SCORE_RINGS;

        const backing = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.16);
        backing.addColorStop(0, "#1c1c1c");
        backing.addColorStop(1, "#070707");
        ctx.beginPath();
        ctx.arc(cx, cy, R * 1.16, 0, Math.PI * 2);
        ctx.fillStyle = backing;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(220, 224, 230, 0.4)";
        ctx.lineWidth = Math.max(1, R * 0.012);
        ctx.stroke();

        const sectors = 20;
        const step = (Math.PI * 2) / sectors;

        for (let i = 0; i < sectors; i += 1) {
            const a0 = -Math.PI / 2 - step / 2 + i * step;
            const a1 = a0 + step;
            const baseDark = i % 2 === 0;

            const ringPaint = (rIn, rOut, fillEven, fillOdd) => {
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(a0) * rIn, cy + Math.sin(a0) * rIn);
                ctx.arc(cx, cy, rIn, a0, a1);
                ctx.lineTo(cx + Math.cos(a1) * rOut, cy + Math.sin(a1) * rOut);
                ctx.arc(cx, cy, rOut, a1, a0, true);
                ctx.closePath();
                ctx.fillStyle = baseDark ? fillEven : fillOdd;
                ctx.fill();
            };

            ringPaint(R * rings.OUTER_BULL, R * rings.TRIPLE_IN, "#1b1b1b", "#f1e4c3");
            ringPaint(R * rings.TRIPLE_IN, R * rings.TRIPLE_OUT, "#d32f2f", "#2e8b3a");
            ringPaint(R * rings.TRIPLE_OUT, R * rings.DOUBLE_IN, "#1b1b1b", "#f1e4c3");
            ringPaint(R * rings.DOUBLE_IN, R * rings.DOUBLE_OUT, "#d32f2f", "#2e8b3a");
        }

        ctx.beginPath();
        ctx.arc(cx, cy, R * rings.OUTER_BULL, 0, Math.PI * 2);
        ctx.fillStyle = "#2e8b3a";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, R * rings.BULL, 0, Math.PI * 2);
        ctx.fillStyle = "#d32f2f";
        ctx.fill();

        const shade = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.3, R * 0.05, cx, cy, R * rings.DOUBLE_OUT);
        shade.addColorStop(0, "rgba(255, 255, 255, 0.1)");
        shade.addColorStop(1, "rgba(0, 0, 0, 0.22)");
        ctx.beginPath();
        ctx.arc(cx, cy, R * rings.DOUBLE_OUT, 0, Math.PI * 2);
        ctx.fillStyle = shade;
        ctx.fill();

        ctx.save();
        ctx.strokeStyle = "rgba(205, 210, 218, 0.85)";
        ctx.lineWidth = Math.max(0.8, R * 0.006);
        [rings.BULL, rings.OUTER_BULL, rings.TRIPLE_IN, rings.TRIPLE_OUT, rings.DOUBLE_IN, rings.DOUBLE_OUT].forEach((r) => {
            ctx.beginPath();
            ctx.arc(cx, cy, R * r, 0, Math.PI * 2);
            ctx.stroke();
        });
        ctx.beginPath();
        for (let i = 0; i < sectors; i += 1) {
            const a = -Math.PI / 2 - step / 2 + i * step;
            ctx.moveTo(cx + Math.cos(a) * R * rings.OUTER_BULL, cy + Math.sin(a) * R * rings.OUTER_BULL);
            ctx.lineTo(cx + Math.cos(a) * R * rings.DOUBLE_OUT, cy + Math.sin(a) * R * rings.DOUBLE_OUT);
        }
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.fillStyle = "#f5f2ea";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const labelR = R * 1.06;
        const fs = Math.max(10, R * 0.085);
        ctx.font = "800 " + fs + "px system-ui, Arial, sans-serif";
        for (let i = 0; i < sectors; i += 1) {
            const mid = -Math.PI / 2 + i * step;
            const lx = cx + Math.cos(mid) * labelR;
            const ly = cy + Math.sin(mid) * labelR;
            ctx.fillText(String(SECTOR_ORDER[i]), lx, ly);
        }
        ctx.restore();
    };

    const redrawMarks = () => {
        drawBoard();
        dartMarks.forEach((d) => {
            drawDart(centerX + d.nx * boardRadius, centerY + d.ny * boardRadius, d.angle, 0.85);
        });
        drawDistanceGuide();
        drawAimReticle();
    };

    const calculateScore = (x, y) => {
        const cx = centerX;
        const cy = centerY;
        const R = boardRadius;
        const rings = SCORE_RINGS;
        const dist = Math.hypot(x - cx, y - cy);
        if (dist > R * rings.DOUBLE_OUT) {
            return { points: 0, label: "ISKA", tier: "miss" };
        }
        if (dist < R * rings.BULL) {
            return { points: 50, label: "BULLSEYE! 50", tier: "great" };
        }
        if (dist < R * rings.OUTER_BULL) {
            return { points: 25, label: "BULL 25", tier: "great" };
        }
        const angle = Math.atan2(y - cy, x - cx);
        const idx = angleToSectorIndex(angle);
        const base = SECTOR_ORDER[idx];
        if (dist > R * rings.TRIPLE_IN && dist < R * rings.TRIPLE_OUT) {
            return { points: base * 3, label: "TRIPLE " + base + " = " + base * 3, tier: "great" };
        }
        if (dist > R * rings.DOUBLE_IN) {
            return { points: base * 2, label: "DOUBLE " + base + " = " + base * 2, tier: "great" };
        }
        return { points: base, label: "+" + base, tier: "normal" };
    };

    const clipToBoard = (x, y) => {
        const cx = centerX;
        const cy = centerY;
        const R = boardRadius;
        const d = Math.hypot(x - cx, y - cy);
        if (d <= R) {
            return { x, y };
        }
        const t = R / d;
        return {
            x: cx + (x - cx) * t,
            y: cy + (y - cy) * t
        };
    };

    const resizeCanvas = () => {
        const rect = canvasWrap.getBoundingClientRect();
        const cw = rect.width;
        const ch = rect.height;
        const side = Math.floor(Math.min(cw, ch, 480));
        const size = Math.max(220, side);
        if (canvas.width !== size || canvas.height !== size) {
            canvas.width = size;
            canvas.height = size;
        }
        centerX = canvas.width / 2;
        centerY = canvas.height / 2;
        boardRadius = Math.min(canvas.width, canvas.height) / 2 * BOARD_FILL;
        const ac = clampAimToBoard(aimX || centerX, aimY || centerY);
        aimX = ac.x;
        aimY = ac.y;
        redrawMarks();
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

    const throwDart = () => {
        if (throwing || wrap.dataset.state !== "playing" || throwIndex >= 3) {
            return;
        }
        const swayed = getSwayedAim();
        const targetX = swayed.x;
        const targetY = swayed.y;
        throwing = true;
        setFireEnabled();
        throwPreview.dataset.paused = "true";
        throwFly.dataset.active = "true";
        playTone("whoosh");

        const stdDev = boardRadius * SPREAD_RATIO;
        let fx = targetX + gaussianRandom() * stdDev;
        let fy = targetY + gaussianRandom() * stdDev;
        const clipped = clipToBoard(fx, fy);
        fx = clipped.x;
        fy = clipped.y;

        const landTilt = (Math.random() - 0.5) * 0.7;
        const lp = getLaunchCanvasPos();
        const sx = lp.x;
        const sy = lp.y;
        const midx = (sx + fx) * 0.5;
        const midy = (sy + fy) * 0.5;
        const px = -(fy - sy);
        const py = fx - sx;
        const plen = Math.hypot(px, py) || 1;
        const mx = midx + (px / plen) * boardRadius * ARC_SAG;
        const my = midy + (py / plen) * boardRadius * ARC_SAG * 0.55;
        const start = performance.now();

        const bezierPt = (u) => {
            const o = 1 - u;
            const x = o * o * sx + 2 * o * u * mx + u * u * fx;
            const y = o * o * sy + 2 * o * u * my + u * u * fy;
            return { x, y };
        };

        const step = (now) => {
            const t = Math.min(1, (now - start) / THROW_MS);
            const pt = bezierPt(t);
            let ang = landTilt;
            if (t < 0.97) {
                const pt2 = bezierPt(Math.min(1, t + 0.035));
                ang = Math.atan2(pt2.x - pt.x, -(pt2.y - pt.y));
            }
            drawBoard();
            dartMarks.forEach((d) => {
                drawDart(centerX + d.nx * boardRadius, centerY + d.ny * boardRadius, d.angle, 0.85);
            });
            drawDart(pt.x, pt.y, ang, 2.2 - t * 1.35);
            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                const result = calculateScore(fx, fy);
                totalScore += result.points;
                dartMarks.push({
                    nx: (fx - centerX) / boardRadius,
                    ny: (fy - centerY) / boardRadius,
                    angle: landTilt
                });
                playTone("thud");
                showHitPop(fx, fy, result.label, result.tier);
                throwIndex += 1;
                throwFly.dataset.active = "false";
                throwPreview.dataset.paused = "false";
                throwing = false;
                setPlayingUi();
                redrawMarks();
                if (throwIndex >= 3) {
                    setTimeout(() => {
                        if (wrap.dataset.state === "playing" && throwIndex >= 3) {
                            showGameOver();
                        }
                    }, 1100);
                }
            }
        };
        requestAnimationFrame(step);
    };

    const showGameOver = () => {
        writeBestIfGame(totalScore);
        const best = readBest();
        const reward = getRewardForScore(totalScore);
        gameoverTotal.textContent = "TOPLAM PUAN: " + totalScore;
        gameoverBest.textContent = "EN İYİ SKOR: " + best;
        gameoverReward.textContent = reward.text;
        if (reward.code) {
            gameoverCode.textContent = "İNDİRİM KODU: " + reward.code;
        } else {
            gameoverCode.textContent = "";
        }
        wrap.dataset.state = "gameover";
        setFireEnabled();
        if (totalScore > 0) {
            playTone("win");
        }
    };

    const resetGame = () => {
        wrap.dataset.state = "playing";
        throwIndex = 0;
        totalScore = 0;
        aimX = 0;
        aimY = 0;
        aimDragActive = false;
        canvas.dataset.aimDrag = "false";
        dartMarks = [];
        throwing = false;
        throwPreview.dataset.paused = "false";
        throwFly.dataset.active = "false";
        scheduleResize();
        setPlayingUi();
    };

    const onKeyDown = (e) => {
        if (wrap.dataset.state !== "playing" || document.querySelector("#dart-game-wrap") !== wrap) {
            return;
        }
        const ae = document.activeElement;
        const tn = ae && ae.tagName;
        if (tn === "INPUT" || tn === "TEXTAREA" || tn === "SELECT") {
            return;
        }
        if (e.code === "Space" || e.key === " ") {
            e.preventDefault();
            throwDart();
        }
    };

    const swayLoop = (now) => {
        if (!wrap.isConnected) {
            return;
        }
        if (wrap.dataset.state === "playing" && !throwing && throwIndex < 3) {
            swayTime = now;
            redrawMarks();
        }
        requestAnimationFrame(swayLoop);
    };

    window.addEventListener("resize", scheduleResize);
    window.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(swayLoop);

    startBtn.addEventListener(
        "click",
        () => {
            try {
                const _vlc = "<%VLSendClickFunc%>";
                if (_vlc.indexOf("<%") === -1) {
                    new Function(_vlc)();
                }
            } catch (e) {}
            welcomeOverlay.dataset.closing = "true";
        },
        { once: true }
    );

    const onWelcomeAnimEnd = (e) => {
        if (e.target !== welcomeCard || welcomeOverlay.dataset.closing !== "true") {
            return;
        }
        if (e.animationName !== "dart-welcome-out") {
            return;
        }
        welcomeOverlay.removeEventListener("animationend", onWelcomeAnimEnd, true);
        welcomeOverlay.remove();
        wrap.dataset.state = "playing";
        scheduleResize();
        setPlayingUi();
    };
    welcomeOverlay.addEventListener("animationend", onWelcomeAnimEnd, true);

    closeBtn.addEventListener("click", () => {
        window.removeEventListener("resize", scheduleResize);
        window.removeEventListener("keydown", onKeyDown);
        wrap.remove();
        const st = document.querySelector("#dart-game-style");
        if (st) {
            st.remove();
        }
    });

    finishBtn.addEventListener("click", () => {
        showGameOver();
    });

    replayBtn.addEventListener("click", () => {
        resetGame();
    });

    exitBtn.addEventListener("click", () => {
        closeBtn.click();
    });

    fireBtn.addEventListener("click", () => {
        throwDart();
    });

    const endAimDrag = (e) => {
        if (!aimDragActive) {
            return;
        }
        aimDragActive = false;
        canvas.dataset.aimDrag = "false";
        try {
            canvas.releasePointerCapture(e.pointerId);
        } catch (err) {}
        scheduleAimRedraw();
    };

    canvas.addEventListener("pointerdown", (e) => {
        if (wrap.dataset.state !== "playing" || throwing || throwIndex >= 3) {
            return;
        }
        if (e.pointerType === "mouse" && e.button !== 0) {
            return;
        }
        e.preventDefault();
        aimDragActive = true;
        canvas.dataset.aimDrag = "true";
        try {
            canvas.setPointerCapture(e.pointerId);
        } catch (err) {}
        syncAimFromEvent(e.clientX, e.clientY);
        scheduleAimRedraw();
    });

    canvas.addEventListener("pointermove", (e) => {
        if (!aimDragActive) {
            return;
        }
        if (wrap.dataset.state !== "playing" || throwing || throwIndex >= 3) {
            return;
        }
        e.preventDefault();
        syncAimFromEvent(e.clientX, e.clientY);
        scheduleAimRedraw();
    });

    canvas.addEventListener("pointerup", endAimDrag);
    canvas.addEventListener("pointercancel", endAimDrag);

    try {
        const _vli = "<%VLSendImpressionFunc%>";
        if (_vli.indexOf("<%") === -1) {
            new Function(_vli)();
        }
    } catch (e) {}
}

initDartGame();
