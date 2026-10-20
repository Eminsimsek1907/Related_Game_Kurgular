function initSpotDiff() {
  if (document.querySelector("#vlSpotDiff")) {
    return;
  }

  const CONFIG = {
    timeLimit: 45,
    discountPerDiff: 2,
    diffCount: 6,
    wrongPenalty: 3,
    hintPenalty: 5,
    hints: 1,
    touchHitScale: 1.25,
    productName: "Seçili Ürün",
    ctaUrl: "#",
    view: { w: 400, h: 300 }
  };

  const SCENE = [
    { id: "wall", type: "wall", x: 0, y: 0, flat: true },
    { id: "window", type: "window", x: 326, y: 65 },
    { id: "frame", type: "frame", x: 68, y: 53, sun: true },
    { id: "clock", type: "clock", x: 228, y: 50, hour: 300, minute: 60 },
    { id: "lamp", type: "lamp", x: 150, y: 0, shade: "#f2b134", flat: true },
    { id: "butterfly", type: "butterfly", x: 318, y: 56, hidden: true },
    { id: "shelfTop", type: "shelf", x: 18, y: 128, w: 364 },
    { id: "vase", type: "vase", x: 52, y: 128, color: "#5b8def", flower: "#ff6b8a" },
    { id: "books", type: "books", x: 84, y: 128, colors: ["#d1495b", "#e4a83a", "#3d7ea6", "#6a994e"] },
    { id: "candle", type: "candle", x: 160, y: 128 },
    { id: "mug", type: "mug", x: 205, y: 128, color: "#f4a259", flip: false },
    { id: "cactus", type: "cactus", x: 250, y: 128 },
    { id: "bottle", type: "bottle", x: 300, y: 128, cap: "#2b2d42" },
    { id: "boxes", type: "boxes", x: 350, y: 128 },
    { id: "tag1", type: "tag", x: 100, y: 137, text: "₺149", tilt: -5 },
    { id: "tag2", type: "tag", x: 205, y: 137, text: "₺89", tilt: 4 },
    { id: "tag3", type: "tag", x: 300, y: 137, text: "₺249", tilt: -3 },
    { id: "shelfBottom", type: "shelf", x: 18, y: 212, w: 282 },
    { id: "bag", type: "bag", x: 70, y: 212, color: "#e0596b" },
    { id: "shoe", type: "shoe", x: 150, y: 212, color: "#4a6fa5", flip: false },
    { id: "sweaters", type: "sweaters", x: 230, y: 212 },
    { id: "gift", type: "gift", x: 277, y: 212, ribbon: "#e63946", bow: true },
    { id: "tag4", type: "tag", x: 70, y: 221, text: "₺399", tilt: 3 },
    { id: "tag5", type: "tag", x: 230, y: 221, text: "₺179", tilt: -4 },
    { id: "basket", type: "basket", x: 150, y: 264 },
    { id: "plant", type: "plant", x: 350, y: 264, leaves: [-62, -32, -6, 22, 50] }
  ];

  const DIFF_POOL = [
    { target: "lamp", set: { shade: "#3fb8a8" }, x: 150, y: 48, r: 22 },
    { target: "candle", set: { hidden: true }, x: 160, y: 111, r: 16 },
    { target: "mug", set: { flip: true }, x: 205, y: 114, r: 17 },
    { target: "tag3", set: { text: "₺279" }, x: 300, y: 151, r: 15 },
    { target: "bag", set: { color: "#3fa36b" }, x: 70, y: 190, r: 20 },
    { target: "shoe", set: { flip: true }, x: 150, y: 197, r: 20 },
    { target: "butterfly", set: { hidden: false }, x: 318, y: 56, r: 14 },
    { target: "clock", set: { hour: 150 }, x: 228, y: 50, r: 17 },
    { target: "gift", set: { bow: false }, x: 277, y: 182, r: 14 },
    { target: "books", set: { colors: ["#d1495b", "#7b5cd6", "#3d7ea6", "#6a994e"] }, x: 101, y: 109, r: 15 },
    { target: "frame", set: { sun: false }, x: 84, y: 44, r: 12 },
    { target: "plant", set: { leaves: [-62, -32, -6, 22] }, x: 369, y: 220, r: 16 },
    { target: "tag4", set: { text: "₺349" }, x: 70, y: 235, r: 15 }
  ];

  CONFIG.totalDiffs = Math.min(CONFIG.diffCount, DIFF_POOL.length);

  const bloom = (cx, cy, color) => `<g transform="translate(${cx} ${cy})">${[0, 72, 144, 216, 288]
    .map((a) => `<circle cx="0" cy="-3.2" r="3" fill="${color}" transform="rotate(${a})"/>`)
    .join("")}<circle r="2" fill="#ffd166"/></g>`;

  const SCENE_ART = {
    wall: (p, g) => `<rect width="400" height="300" fill="url(#${g}wall)"/><rect width="400" height="252" fill="url(#${g}stripes)"/><rect y="252" width="400" height="12" fill="#6b4226"/><rect y="252" width="400" height="2" fill="rgba(255,255,255,0.18)"/><rect y="264" width="400" height="36" fill="url(#${g}floor)"/><path d="M0 277 H400 M0 290 H400 M64 264 L58 277 M170 264 L168 277 M280 264 L284 277 M110 277 L106 290 M230 277 L232 290 M350 277 L354 290" stroke="rgba(0,0,0,0.14)" stroke-width="1" fill="none"/><ellipse cx="200" cy="300" rx="220" ry="18" fill="rgba(0,0,0,0.12)"/>`,
    window: (p, g) => `<rect x="-60" y="-49" width="120" height="98" rx="4" fill="#fdf8f1" stroke="#c9a37a" stroke-width="2"/><rect x="-54" y="-43" width="108" height="86" fill="url(#${g}sky)"/><circle cx="30" cy="-25" r="15" fill="rgba(255,224,138,0.3)"/><circle cx="30" cy="-25" r="10" fill="#ffe08a"/><g fill="#ffffff" opacity="0.92"><ellipse cx="-26" cy="-21" rx="16" ry="6"/><ellipse cx="-16" cy="-25" rx="10" ry="7"/><ellipse cx="14" cy="10" rx="13" ry="5"/></g><path d="M-54 27 Q-26 13 0 24 T54 19 V43 H-54 Z" fill="#8fcf8a"/><path d="M-54 35 Q-20 26 10 34 T54 31 V43 H-54 Z" fill="#6fb46d"/><path d="M0 -43 V43 M-54 0 H54" stroke="#fdf8f1" stroke-width="4"/><path d="M-50 -39 L-30 -39 L-50 -19 Z" fill="rgba(255,255,255,0.35)"/><rect x="-64" y="47" width="128" height="6" rx="2" fill="#e3cdb2"/>`,
    frame: (p) => `<rect x="-38" y="-29" width="76" height="58" rx="3" fill="#8a5a33"/><rect x="-35" y="-26" width="70" height="52" rx="2" fill="none" stroke="rgba(255,255,255,0.18)"/><rect x="-32" y="-23" width="64" height="46" fill="#fdf3e3"/><rect x="-28" y="-19" width="56" height="38" fill="#cfe9f7"/>${p.sun ? `<circle cx="16" cy="-9" r="6" fill="#ffb347"/>` : ""}<path d="M-28 19 L-12 -3 L-2 7 L8 -7 L28 19 Z" fill="#6aa66a"/><path d="M8 -7 L13 0 L3 0 Z M-12 -3 L-6 3 L-16 3 Z" fill="#ffffff"/>`,
    clock: (p) => `<circle r="17" fill="#fffdf7" stroke="#5b3a22" stroke-width="3"/>${Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="-12" x2="0" y2="-14.5" stroke="#8a6a4a" stroke-width="1.4" transform="rotate(${i * 30})"/>`).join("")}<line x1="0" y1="0" x2="0" y2="-8" stroke="#2b2118" stroke-width="2.5" stroke-linecap="round" transform="rotate(${p.hour})"/><line x1="0" y1="0" x2="0" y2="-12" stroke="#2b2118" stroke-width="1.6" stroke-linecap="round" transform="rotate(${p.minute})"/><circle r="1.8" fill="#d1495b"/>`,
    lamp: (p, g) => `<ellipse cx="0" cy="96" rx="78" ry="44" fill="url(#${g}glow)"/><line x1="0" y1="0" x2="0" y2="30" stroke="#3d2b1f" stroke-width="1.5"/><rect x="-4" y="27" width="8" height="7" rx="1.5" fill="#3d2b1f"/><path d="M-12 34 H12 L26 62 H-26 Z" fill="${p.shade}"/><path d="M-9 36 L-20 60 H-13 L-4 36 Z" fill="rgba(255,255,255,0.35)"/><ellipse cx="0" cy="62" rx="26" ry="3" fill="rgba(0,0,0,0.18)"/><circle cx="0" cy="64" r="9" fill="rgba(255,240,180,0.45)"/><circle cx="0" cy="64" r="5" fill="#fff4c2"/>`,
    butterfly: () => `<g transform="rotate(-15)"><ellipse cx="-5" cy="-3" rx="6" ry="5" fill="#ff8fab"/><ellipse cx="5" cy="-3" rx="6" ry="5" fill="#ff8fab"/><ellipse cx="-4" cy="4" rx="4" ry="3.5" fill="#ffc2d1"/><ellipse cx="4" cy="4" rx="4" ry="3.5" fill="#ffc2d1"/><circle cx="-5" cy="-3" r="1.6" fill="#ffffff" opacity="0.7"/><circle cx="5" cy="-3" r="1.6" fill="#ffffff" opacity="0.7"/><rect x="-1" y="-6" width="2" height="12" rx="1" fill="#3d2b1f"/><path d="M0 -6 L-3 -10 M0 -6 L3 -10" stroke="#3d2b1f" stroke-width="0.8" fill="none"/></g>`,
    shelf: (p, g) => `<rect x="0" y="0" width="${p.w}" height="7" rx="1.5" fill="url(#${g}wood)"/><rect x="0" y="0.8" width="${p.w}" height="1" fill="rgba(255,255,255,0.3)"/><rect x="0" y="7" width="${p.w}" height="3" fill="rgba(0,0,0,0.12)"/><path d="M18 7 H30 L18 21 Z M${p.w - 18} 7 H${p.w - 30} L${p.w - 18} 21 Z" fill="#6b4226"/>`,
    vase: (p) => `<path d="M0 -28 Q-4 -44 -10 -54 M0 -28 Q2 -46 4 -58 M0 -28 Q8 -42 14 -50" stroke="#4f8a4b" stroke-width="2" fill="none"/><ellipse cx="-5" cy="-42" rx="4.5" ry="2" transform="rotate(-35 -5 -42)" fill="#5f9e5a"/><ellipse cx="9" cy="-44" rx="4.5" ry="2" transform="rotate(30 9 -44)" fill="#5f9e5a"/>${bloom(-10, -54, p.flower)}${bloom(4, -58, p.flower)}${bloom(14, -50, p.flower)}<path d="M-8 0 Q-14 -12 -8 -24 Q-4 -30 -6 -34 H6 Q4 -30 8 -24 Q14 -12 8 0 Z" fill="${p.color}"/><path d="M-6 -6 Q-10 -14 -6 -22" stroke="rgba(255,255,255,0.45)" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    books: (p) => `${[
      { x: 0, w: 11, h: 44 },
      { x: 12, w: 10, h: 38 },
      { x: 23, w: 12, h: 46 }
    ]
      .map((b, i) => `<rect x="${b.x}" y="${-b.h}" width="${b.w}" height="${b.h}" rx="1.2" fill="${p.colors[i]}"/><rect x="${b.x + 1.5}" y="${-b.h + 4}" width="${b.w - 3}" height="1.6" fill="rgba(255,255,255,0.55)"/><rect x="${b.x + 1.5}" y="-7" width="${b.w - 3}" height="1.6" fill="rgba(255,255,255,0.55)"/><rect x="${b.x}" y="${-b.h}" width="2" height="${b.h}" fill="rgba(0,0,0,0.12)"/>`)
      .join("")}<rect x="36" y="-8" width="24" height="8" rx="1.2" fill="${p.colors[3]}"/><rect x="36" y="-5" width="24" height="1.4" fill="rgba(255,255,255,0.5)"/>`,
    candle: () => `<circle cx="0" cy="-30" r="9" fill="rgba(255,190,80,0.35)"/><rect x="-11" y="-28" width="22" height="28" rx="4" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.75)" stroke-width="1"/><rect x="-8" y="-20" width="16" height="18" rx="2" fill="#f6e3c5"/><line x1="0" y1="-20" x2="0" y2="-24" stroke="#333333" stroke-width="1"/><path d="M0 -34 Q4 -28 0 -24 Q-4 -28 0 -34 Z" fill="#ffb02e"/><path d="M0 -31 Q2 -27.5 0 -25 Q-2 -27.5 0 -31 Z" fill="#fff3b0"/><rect x="-9" y="-26" width="3" height="22" rx="1.5" fill="rgba(255,255,255,0.45)"/>`,
    mug: (p) => `<path d="M-6 -28 q-3 -5 0 -10 M2 -28 q3 -5 0 -10" stroke="rgba(255,255,255,0.85)" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M10 -20 Q19 -20 19 -13 Q19 -6 10 -6" stroke="${p.color}" stroke-width="4" fill="none"/><path d="M-12 -24 H10 V-6 Q10 0 4 0 H-6 Q-12 0 -12 -6 Z" fill="${p.color}"/><rect x="-12" y="-24" width="22" height="2.5" fill="rgba(0,0,0,0.12)"/><path d="M-5 -9 L-9 -13 Q-11 -16 -8 -17 Q-6 -17.5 -5 -15.5 Q-4 -17.5 -2 -17 Q1 -16 -1 -13 Z" fill="#ffffff" opacity="0.9"/>`,
    cactus: () => `<path d="M-4 -20 V-44 Q0 -52 4 -44 V-20 Z" fill="#5fae6a"/><path d="M-4 -30 H-9 V-38 M4 -34 H9 V-42" stroke="#5fae6a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M0 -46 V-22" stroke="rgba(0,0,0,0.14)" stroke-width="1"/><circle cx="0" cy="-49" r="3" fill="#ff7aa2"/><path d="M-12 -16 H12 L9 0 H-9 Z" fill="#d9764a"/><rect x="-14" y="-20" width="28" height="6" rx="1.5" fill="#e88a5c"/>`,
    bottle: (p, g) => `<rect x="-10" y="-28" width="20" height="28" rx="5" fill="url(#${g}glass)"/><rect x="-4" y="-34" width="8" height="7" fill="#d4af37"/><rect x="-6" y="-44" width="12" height="10" rx="2" fill="${p.cap}"/><rect x="-7" y="-24" width="3" height="18" rx="1.5" fill="rgba(255,255,255,0.55)"/><rect x="-6" y="-18" width="12" height="8" rx="1" fill="rgba(255,255,255,0.85)"/><line x1="-3" y1="-14" x2="3" y2="-14" stroke="#b23a48" stroke-width="1"/>`,
    boxes: () => `<rect x="-14" y="-20" width="28" height="20" rx="1.5" fill="#7fb3d5"/><rect x="-15" y="-22" width="30" height="4" rx="1" fill="#6a9fc4"/><rect x="-9" y="-34" width="18" height="12" rx="1.5" fill="#f2c14e"/><rect x="-10" y="-36" width="20" height="4" rx="1" fill="#e0ae3c"/><line x1="0" y1="-36" x2="0" y2="-22" stroke="#c0392b" stroke-width="1.5"/>`,
    tag: (p) => `<line x1="0" y1="0" x2="0" y2="7" stroke="#8a6a4a" stroke-width="1"/><g transform="rotate(${p.tilt})"><rect x="-15" y="6" width="30" height="16" rx="3" fill="#fffaf0" stroke="#c9a37a" stroke-width="1"/><circle cx="0" cy="9.5" r="1.3" fill="#c9a37a"/><text x="0" y="19.5" text-anchor="middle" font-size="8" font-weight="800" fill="#b23a48" font-family="system-ui, Segoe UI, sans-serif">${p.text}</text></g>`,
    bag: (p) => `<path d="M-14 -32 Q-14 -50 0 -50 Q14 -50 14 -32" stroke="#5b3a22" stroke-width="3" fill="none"/><path d="M-24 -32 H24 Q28 -32 29 -26 L32 -6 Q33 0 26 0 H-26 Q-33 0 -32 -6 L-29 -26 Q-28 -32 -24 -32 Z" fill="${p.color}"/><path d="M-24 -32 H24 L20 -16 Q0 -10 -20 -16 Z" fill="rgba(0,0,0,0.14)"/><rect x="-4" y="-18" width="8" height="7" rx="1.5" fill="#f2c14e"/><path d="M-24 -28 L-27 -6" stroke="rgba(255,255,255,0.35)" stroke-width="2" stroke-linecap="round"/>`,
    shoe: (p) => `<path d="M-26 -8 Q-28 -22 -18 -26 L-4 -30 Q2 -24 10 -22 Q26 -20 30 -12 V-8 Z" fill="${p.color}"/><path d="M-26 -8 Q-28 -22 -18 -26 L-16 -10 Z" fill="rgba(0,0,0,0.18)"/><path d="M-16 -14 Q0 -20 20 -14" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M-2 -26 L4 -22 M2 -28 L8 -24" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round"/><path d="M-28 0 H26 Q30 0 30 -5 V-8 H-28 Z" fill="#fafafa" stroke="#d6d6d6" stroke-width="1"/>`,
    sweaters: () => `<rect x="-24" y="-12" width="48" height="12" rx="3" fill="#c94f4f"/><rect x="-22" y="-23" width="44" height="11" rx="3" fill="#e9c46a"/><rect x="-20" y="-33" width="40" height="10" rx="3" fill="#2a9d8f"/><path d="M-20 -6 H20 M-18 -17.5 H18 M-16 -28 H16" stroke="rgba(0,0,0,0.13)" stroke-width="1"/>`,
    gift: (p) => `<rect x="-15" y="-22" width="30" height="22" rx="2" fill="#6c8ebf"/><rect x="-17" y="-28" width="34" height="7" rx="2" fill="#5a7bad"/><rect x="-3" y="-28" width="6" height="28" fill="${p.ribbon}"/>${p.bow ? `<ellipse cx="-6" cy="-32" rx="6" ry="4" transform="rotate(-25 -6 -32)" fill="${p.ribbon}"/><ellipse cx="6" cy="-32" rx="6" ry="4" transform="rotate(25 6 -32)" fill="${p.ribbon}"/><circle cx="0" cy="-30" r="2.5" fill="#b8202d"/>` : ""}`,
    basket: () => `<circle cx="-10" cy="-30" r="8" fill="#e76f51"/><circle cx="8" cy="-31" r="9" fill="#8ab17d"/><path d="M-16 -33 Q-10 -26 -4 -33 M-14 -26 Q-9 -32 -3 -27 M2 -36 Q8 -28 14 -36 M3 -28 Q9 -34 15 -28" stroke="rgba(255,255,255,0.4)" fill="none" stroke-width="1"/><path d="M-24 -26 H24 L18 0 H-18 Z" fill="#c8945a"/><path d="M-22 -18 H22 M-20 -9 H20 M-12 -26 L-10 0 M0 -26 V0 M12 -26 L10 0" stroke="#a87442" stroke-width="1.2" fill="none"/><rect x="-26" y="-28" width="52" height="5" rx="2" fill="#b07d48"/>`,
    plant: (p) => `${p.leaves
      .map((a, i) => `<g transform="translate(0 -28) rotate(${a})"><path d="M0 0 Q-10 -24 0 -50 Q10 -24 0 0 Z" fill="${i % 2 ? "#4fa860" : "#3f8f4e"}"/><path d="M0 -2 V-46" stroke="rgba(255,255,255,0.35)" stroke-width="1" fill="none"/></g>`)
      .join("")}<path d="M-18 -28 H18 L13 0 H-13 Z" fill="#e9e2d6"/><rect x="-17" y="-22" width="34" height="4" fill="#c9b8a0"/><rect x="-20" y="-31" width="40" height="5" rx="2" fill="#f4efe6"/>`
  };

  const sceneDefs = (g) => `<linearGradient id="${g}wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8ecdc"/><stop offset="1" stop-color="#ecd3b6"/></linearGradient><pattern id="${g}stripes" width="24" height="10" patternUnits="userSpaceOnUse"><rect width="12" height="10" fill="rgba(255,255,255,0.22)"/></pattern><linearGradient id="${g}floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9c6b45"/><stop offset="1" stop-color="#74482b"/></linearGradient><linearGradient id="${g}wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c08a57"/><stop offset="1" stop-color="#8a5a33"/></linearGradient><linearGradient id="${g}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a8dcff"/><stop offset="1" stop-color="#e9f7ff"/></linearGradient><linearGradient id="${g}glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffc8d6"/><stop offset="0.5" stop-color="#ff9fb8"/><stop offset="1" stop-color="#e87a98"/></linearGradient><radialGradient id="${g}glow"><stop offset="0" stop-color="rgba(255,226,140,0.55)"/><stop offset="1" stop-color="rgba(255,226,140,0)"/></radialGradient><filter id="${g}sh" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#3d2414" flood-opacity="0.28"/></filter>`;

  const renderItem = (p, g) => {
    if (p.hidden) {
      return "";
    }
    const flip = p.flip ? " scale(-1 1)" : "";
    const shadow = p.flat ? "" : ` filter="url(#${g}sh)"`;
    return `<g transform="translate(${p.x} ${p.y})${flip}"${shadow}>${SCENE_ART[p.type](p, g)}</g>`;
  };

  const renderScene = (diffs, g) => {
    const body = SCENE.map((item) => {
      const change = diffs.find((d) => d.target === item.id);
      return renderItem(change ? Object.assign({}, item, change.set) : item, g);
    }).join("");
    return `<svg class="vl-sd-scene" viewBox="0 0 ${CONFIG.view.w} ${CONFIG.view.h}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>${sceneDefs(g)}</defs>${body}</svg>`;
  };

  const pickDiffs = () => {
    const pool = DIFF_POOL.slice();
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = pool[i];
      pool[i] = pool[j];
      pool[j] = tmp;
    }
    return pool.slice(0, CONFIG.totalDiffs);
  };

  const makeVoucherCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let s = "";
    for (let i = 0; i < 8; i += 1) {
      s += chars[Math.floor(Math.random() * chars.length)];
    }
    return `${s}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  };

  const isCoarse = Boolean(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  const CTA_LABEL = "Kodu Kopyala & Alışverişe Başla";

  let activeVoucherCode = "";
  let activeDiffs = [];
  let timerInterval = null;
  let resultTimeout = null;
  let copyResetTimeout = null;
  let timeLeft = CONFIG.timeLimit;
  let foundCount = 0;
  let hintsLeft = CONFIG.hints;
  let timeExpired = false;
  let resultLock = false;
  let audioCtx = null;

  const styleEl = document.createElement("style");
  styleEl.id = "vlSpotDiffStyle";
  styleEl.textContent = `
#vlSpotDiff {
  --accent: #FFD700;
  --bg-dark: #12141a;
  --radius: 0.75em;
  font-size: 16px;
  box-sizing: border-box;
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: max(1em, env(safe-area-inset-top, 0px)) max(1em, env(safe-area-inset-right, 0px)) max(1em, env(safe-area-inset-bottom, 0px)) max(1em, env(safe-area-inset-left, 0px));
  font-family: system-ui, "Segoe UI", Roboto, sans-serif;
  color: #f4f4f5;
  opacity: 0;
  animation: vlSdFadeIn 0.45s ease forwards;
}

#vlSpotDiff[data-state="closing"] {
  animation: vlSdFadeOut 0.4s ease forwards;
}

#vlSpotDiff *,
#vlSpotDiff *::before,
#vlSpotDiff *::after {
  box-sizing: border-box;
}

#vlSpotDiff [hidden] {
  display: none !important;
}

#vlSpotDiff .vl-sd-shell {
  position: relative;
  width: 100%;
  max-width: min(96vw, 58em);
  max-height: calc(100vh - 2em);
  max-height: calc(100dvh - 2em);
  overflow: auto;
  background: linear-gradient(165deg, #4a1a24 0%, #2a1018 42%, #1a0a10 100%);
  border-radius: 1em;
  padding: 1.5em 1.2em 1.65em;
  border: 0.08em solid rgba(255, 215, 0, 0.22);
  box-shadow: 0 1.25em 4em rgba(0, 0, 0, 0.6), inset 0 0.06em 0 rgba(255, 255, 255, 0.06);
  animation: vlSdSlideUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

#vlSpotDiff .vl-sd-close {
  position: absolute;
  top: 0.65em;
  right: 0.65em;
  width: 2.25em;
  height: 2.25em;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 1.35em;
  line-height: 1;
  cursor: pointer;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
}

#vlSpotDiff .vl-sd-close:active {
  transform: scale(0.94);
}

#vlSpotDiff .vl-sd-screen {
  display: none;
  flex-direction: column;
  gap: 1em;
}

#vlSpotDiff .vl-sd-screen-play {
  gap: 0.75em;
}

#vlSpotDiff[data-state="intro"] .vl-sd-screen-intro,
#vlSpotDiff[data-state="playing"] .vl-sd-screen-play,
#vlSpotDiff[data-state="result"] .vl-sd-screen-result,
#vlSpotDiff[data-state="closing"][data-prev="intro"] .vl-sd-screen-intro,
#vlSpotDiff[data-state="closing"][data-prev="playing"] .vl-sd-screen-play,
#vlSpotDiff[data-state="closing"][data-prev="result"] .vl-sd-screen-result {
  display: flex;
}

#vlSpotDiff .vl-sd-title {
  font-size: clamp(1.25em, 4vw, 1.75em);
  font-weight: 800;
  text-align: center;
  margin: 0 2em 0 0;
  line-height: 1.2;
  color: var(--accent);
}

#vlSpotDiff .vl-sd-preview {
  width: min(100%, 17em);
  margin: 0 auto;
  border-radius: var(--radius);
  overflow: hidden;
  line-height: 0;
  border: 0.12em solid rgba(255, 215, 0, 0.35);
  box-shadow: 0 0.6em 1.6em rgba(0, 0, 0, 0.45);
  animation: vlSdFloat 3.2s ease-in-out infinite;
}

#vlSpotDiff .vl-sd-steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75em;
  font-size: clamp(0.95em, 3vw, 1.05em);
  line-height: 1.45;
  color: #c8ccd4;
}

#vlSpotDiff .vl-sd-steps li {
  display: flex;
  gap: 0.65em;
  align-items: flex-start;
}

#vlSpotDiff .vl-sd-step-num {
  flex-shrink: 0;
  width: 1.65em;
  height: 1.65em;
  border-radius: 50%;
  background: var(--accent);
  color: #1a1a1a;
  font-weight: 800;
  font-size: 0.9em;
  display: flex;
  align-items: center;
  justify-content: center;
}

#vlSpotDiff .vl-sd-btn {
  width: 100%;
  padding: 0.95em 1.2em;
  font-size: clamp(1em, 3vw, 1.15em);
  font-weight: 700;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  background: linear-gradient(180deg, #ffe566 0%, var(--accent) 100%);
  color: #1a1a1a;
  box-shadow: 0 0.35em 1.2em rgba(255, 215, 0, 0.35);
}

#vlSpotDiff .vl-sd-start {
  position: relative;
}

#vlSpotDiff .vl-sd-start::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: 0 0 0 0.25em rgba(255, 215, 0, 0.45);
  opacity: 0;
  pointer-events: none;
  animation: vlSdPulse 1.8s ease-in-out infinite;
}

#vlSpotDiff .vl-sd-btn:active,
#vlSpotDiff .vl-sd-cta:active {
  transform: scale(0.97);
}

#vlSpotDiff .vl-sd-btn-secondary {
  margin-top: 0.5em;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  box-shadow: none;
}

#vlSpotDiff .vl-sd-timer-wrap {
  text-align: center;
}

#vlSpotDiff .vl-sd-timer-num {
  font-size: clamp(1.75em, 5vw, 2.5em);
  font-weight: 800;
  letter-spacing: 0.02em;
  margin-bottom: 0.35em;
  line-height: 1;
}

#vlSpotDiff .vl-sd-timer-num.vl-sd-penalty {
  color: #f87171;
  animation: vlSdBump 0.45s ease;
}

#vlSpotDiff .vl-sd-timer-track {
  height: 0.55em;
  border-radius: 999em;
  background: rgba(255, 255, 255, 0.15);
  overflow: hidden;
}

#vlSpotDiff .vl-sd-timer-bar {
  height: 100%;
  width: var(--timer-progress, 100%);
  border-radius: 999em;
  background: linear-gradient(90deg, #4ade80 0%, var(--accent) 100%);
  transition: width 0.35s linear, background 0.35s ease;
}

#vlSpotDiff .vl-sd-timer-low .vl-sd-timer-bar {
  background: linear-gradient(90deg, #f87171 0%, #ef4444 100%);
}

#vlSpotDiff .vl-sd-hud {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5em 0.9em;
}

#vlSpotDiff .vl-sd-score {
  margin: 0;
  text-align: center;
  font-size: clamp(0.9em, 2.8vw, 1.05em);
  font-weight: 600;
  color: #e4e6eb;
}

#vlSpotDiff .vl-sd-hint {
  padding: 0.45em 0.9em;
  font-size: 0.85em;
  font-weight: 700;
  border-radius: 999em;
  border: 0.08em solid rgba(255, 215, 0, 0.55);
  background: rgba(255, 215, 0, 0.12);
  color: var(--accent);
  cursor: pointer;
}

#vlSpotDiff .vl-sd-hint:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

#vlSpotDiff .vl-sd-board {
  display: flex;
  flex-direction: column;
  gap: 1em;
  flex: 1;
  min-height: 0;
}

#vlSpotDiff .vl-sd-img-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4em;
}

#vlSpotDiff .vl-sd-img-cap {
  margin: 0;
  font-size: clamp(0.78em, 2.2vw, 0.9em);
  font-weight: 700;
  text-align: center;
  line-height: 1.3;
  color: #f5e8ec;
}

#vlSpotDiff .vl-sd-img-col {
  position: relative;
  flex: 1;
  min-width: 0;
  border-radius: var(--radius);
  overflow: hidden;
  border: 0.12em solid rgba(255, 255, 255, 0.14);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.42);
  padding: 0.35em;
}

#vlSpotDiff .vl-sd-img-stage {
  position: relative;
  display: block;
  width: min(100%, calc(30vh * 4 / 3));
  width: min(100%, calc(30dvh * 4 / 3));
  margin: 0 auto;
  line-height: 0;
  border-radius: 0.5em;
  overflow: hidden;
  cursor: crosshair;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
}

#vlSpotDiff .vl-sd-img-col.vl-sd-flash-wrong {
  animation: vlSdWrongFlash 0.45s ease;
}

#vlSpotDiff .vl-sd-scene {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  pointer-events: none;
}

#vlSpotDiff .vl-sd-hotspots {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}

#vlSpotDiff .vl-sd-diff {
  position: absolute;
  aspect-ratio: 1;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: crosshair;
  opacity: 1;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  background: transparent;
  color: transparent;
  pointer-events: auto;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

#vlSpotDiff .vl-sd-diff[data-found="true"] {
  pointer-events: auto;
  cursor: default;
}

#vlSpotDiff .vl-sd-diff-hit {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  border-radius: 50%;
  border: 0.2em solid #ff3b5c;
  box-sizing: border-box;
  opacity: 0;
  pointer-events: none;
  background: rgba(255, 59, 92, 0.12);
  box-shadow: 0 0 0 0.1em rgba(255, 255, 255, 0.85), 0 0 0.5em rgba(255, 59, 92, 0.6);
  transform-origin: center center;
}

#vlSpotDiff .vl-sd-diff[data-found="true"] .vl-sd-diff-hit {
  opacity: 1;
  animation: vlSdRipplePop 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

#vlSpotDiff .vl-sd-diff[data-found="true"]::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 0.15em solid var(--accent);
  pointer-events: none;
  animation: vlSdBurst 0.6s ease-out forwards;
}

#vlSpotDiff .vl-sd-diff[data-hint="true"] .vl-sd-diff-hit {
  opacity: 1;
  border-style: dashed;
  border-color: var(--accent);
  background: rgba(255, 215, 0, 0.14);
  box-shadow: 0 0 0.6em rgba(255, 215, 0, 0.7);
  animation: vlSdHintPulse 0.6s ease-in-out 3;
}

#vlSpotDiff .vl-sd-diff[data-missed="true"] .vl-sd-diff-hit {
  opacity: 1;
  border-style: dashed;
  border-color: #fbbf24;
  background: rgba(251, 191, 36, 0.15);
  box-shadow: 0 0 0.5em rgba(251, 191, 36, 0.6);
  animation: vlSdRipplePop 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

#vlSpotDiff .vl-sd-miss {
  position: absolute;
  width: 1.6em;
  height: 1.6em;
  z-index: 6;
  pointer-events: none;
  animation: vlSdMiss 0.75s ease forwards;
}

#vlSpotDiff .vl-sd-miss::before,
#vlSpotDiff .vl-sd-miss::after {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 0.28em;
  margin-top: -0.14em;
  border-radius: 999em;
  background: #ef4444;
  box-shadow: 0 0 0 0.08em #fff;
  transform: rotate(45deg);
}

#vlSpotDiff .vl-sd-miss::after {
  transform: rotate(-45deg);
}

#vlSpotDiff .vl-sd-pop {
  position: absolute;
  z-index: 7;
  pointer-events: none;
  font-size: 0.95em;
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
  color: #4ade80;
  text-shadow: 0 0.08em 0 #14532d, 0 0 0.4em rgba(0, 0, 0, 0.55);
  animation: vlSdPopUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

#vlSpotDiff .vl-sd-pop-bad {
  color: #f87171;
  text-shadow: 0 0.08em 0 #7f1d1d, 0 0 0.4em rgba(0, 0, 0, 0.55);
}

#vlSpotDiff .vl-sd-result-card {
  position: relative;
  overflow: hidden;
  background: var(--bg-dark);
  border-radius: var(--radius);
  padding: 1.5em 1.25em;
  text-align: center;
  border: 0.06em solid rgba(255, 255, 255, 0.1);
  animation: vlSdSlideUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

#vlSpotDiff .vl-sd-confetti {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;
}

#vlSpotDiff .vl-sd-confetti-piece {
  position: absolute;
  top: -1em;
  width: 0.45em;
  height: 0.8em;
  border-radius: 0.1em;
  background: var(--c);
  opacity: 0;
  animation-name: vlSdConfetti;
  animation-timing-function: cubic-bezier(0.25, 0.6, 0.4, 1);
  animation-fill-mode: forwards;
}

#vlSpotDiff .vl-sd-trophy {
  width: 3.5em;
  height: 3.5em;
  margin: 0 auto 0.85em;
  position: relative;
  animation: vlSdTrophy 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

#vlSpotDiff .vl-sd-trophy svg {
  display: block;
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0.3em 0.6em rgba(255, 215, 0, 0.35));
}

#vlSpotDiff .vl-sd-result-title {
  font-size: clamp(1.15em, 3.5vw, 1.45em);
  font-weight: 800;
  margin: 0 0 0.5em;
  color: var(--accent);
}

#vlSpotDiff .vl-sd-result-product {
  font-size: 1em;
  color: #b8bcc6;
  margin: 0 0 1em;
}

#vlSpotDiff .vl-sd-result-sub {
  font-size: 0.85em;
  color: #9ca3af;
  margin: 0 0 1em;
  min-height: 1.2em;
}

#vlSpotDiff .vl-sd-code {
  margin: 0 0 1em;
  padding: 0.75em 0.5em;
  border: 0.12em dashed rgba(255, 215, 0, 0.6);
  border-radius: var(--radius);
  background: rgba(255, 215, 0, 0.08);
}

#vlSpotDiff .vl-sd-code-label {
  display: block;
  margin-bottom: 0.4em;
  font-size: 0.72em;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #c8ccd4;
}

#vlSpotDiff .vl-sd-code-value {
  display: block;
  font-family: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: clamp(1em, 3.6vw, 1.3em);
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #fff;
  word-break: break-all;
  user-select: all;
  -webkit-user-select: all;
}

#vlSpotDiff .vl-sd-copy-buffer {
  position: fixed;
  top: 0;
  left: 0;
  width: 1px;
  height: 1px;
  opacity: 0;
}

#vlSpotDiff .vl-sd-cta {
  width: 100%;
  padding: 0.95em 1em;
  font-size: clamp(0.95em, 2.8vw, 1.05em);
  font-weight: 700;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  background: linear-gradient(180deg, #ffe566 0%, var(--accent) 100%);
  color: #1a1a1a;
}

#vlSpotDiff .vl-sd-cta[data-copied="true"] {
  background: linear-gradient(180deg, #86efac 0%, #4ade80 100%);
}

@media (pointer: coarse) {
  #vlSpotDiff .vl-sd-img-stage,
  #vlSpotDiff .vl-sd-diff {
    cursor: default;
  }

  #vlSpotDiff .vl-sd-hint {
    padding: 0.6em 1.1em;
  }
}

@media (min-width: 768px) {
  #vlSpotDiff .vl-sd-board {
    flex-direction: row;
    align-items: stretch;
    gap: 1.1em;
  }

  #vlSpotDiff .vl-sd-title {
    margin-right: 0;
  }

  #vlSpotDiff .vl-sd-img-stage {
    width: min(100%, calc(54vh * 4 / 3));
    width: min(100%, calc(54dvh * 4 / 3));
  }

  #vlSpotDiff .vl-sd-preview {
    width: min(100%, 22em);
  }
}

@media (min-width: 1024px) {
  #vlSpotDiff .vl-sd-shell {
    padding: 1.6em 1.6em 1.8em;
  }

  #vlSpotDiff .vl-sd-hint:hover {
    background: rgba(255, 215, 0, 0.22);
  }
}

@media (max-width: 767px) {
  #vlSpotDiff .vl-sd-shell {
    padding: 0.85em 0.65em 1em;
    max-width: 100%;
    border-radius: 0.85em;
  }

  #vlSpotDiff .vl-sd-title {
    font-size: 1.05em;
    margin-right: 2.25em;
    padding: 0 0.15em;
  }

  #vlSpotDiff .vl-sd-steps {
    font-size: 0.86em;
    gap: 0.55em;
  }

  #vlSpotDiff .vl-sd-timer-num {
    font-size: 1.5em;
    margin-bottom: 0.25em;
  }

  #vlSpotDiff .vl-sd-score {
    font-size: 0.8em;
    line-height: 1.35;
    padding: 0 0.2em;
  }

  #vlSpotDiff .vl-sd-hint {
    font-size: 0.75em;
  }

  #vlSpotDiff .vl-sd-screen-play {
    gap: 0.55em;
  }

  #vlSpotDiff .vl-sd-board {
    gap: 0.6em;
  }

  #vlSpotDiff .vl-sd-img-wrap {
    gap: 0.3em;
  }

  #vlSpotDiff .vl-sd-img-cap {
    font-size: 0.76em;
    line-height: 1.25;
  }

  #vlSpotDiff .vl-sd-img-col {
    padding: 0.25em;
  }
}

@keyframes vlSdFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes vlSdFadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes vlSdRipplePop {
  0% {
    transform: scale(0.65);
    opacity: 0.85;
  }
  55% {
    transform: scale(1.08);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes vlSdBurst {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.9);
    opacity: 0;
  }
}

@keyframes vlSdHintPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.25);
    opacity: 0.55;
  }
}

@keyframes vlSdMiss {
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 0;
  }
  20% {
    transform: translate(-50%, -50%) scale(1.15);
    opacity: 1;
  }
  70% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.9);
    opacity: 0;
  }
}

@keyframes vlSdPopUp {
  0% {
    transform: translate(-50%, -50%) scale(0.6);
    opacity: 0;
  }
  20% {
    transform: translate(-50%, -110%) scale(1.15);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -260%) scale(1);
    opacity: 0;
  }
}

@keyframes vlSdWrongFlash {
  0%,
  100% {
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: none;
    transform: translateX(0);
  }
  20% {
    transform: translateX(-0.3em);
  }
  35% {
    border-color: #ef4444;
    box-shadow: 0 0 0 0.15em rgba(239, 68, 68, 0.45);
    transform: translateX(0.3em);
  }
  55% {
    transform: translateX(-0.2em);
  }
  75% {
    transform: translateX(0.1em);
  }
}

@keyframes vlSdBump {
  0%,
  100% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.25);
  }
}

@keyframes vlSdPulse {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

@keyframes vlSdFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-0.3em);
  }
}

@keyframes vlSdTrophy {
  0% {
    transform: scale(0.3) rotate(-20deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.15) rotate(6deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes vlSdConfetti {
  0% {
    opacity: 1;
    transform: translate(0, 0) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translate(var(--dx), 26em) rotate(var(--rot));
  }
}

@keyframes vlSdSlideUp {
  from {
    opacity: 0;
    transform: translateY(1.25em);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;
  document.head.appendChild(styleEl);

  const root = document.createElement("div");
  root.id = "vlSpotDiff";
  root.dataset.state = "intro";
  root.style.setProperty("--timer-progress", "100%");

  const shell = document.createElement("div");
  shell.className = "vl-sd-shell";

  const btnClose = document.createElement("button");
  btnClose.type = "button";
  btnClose.className = "vl-sd-close";
  btnClose.setAttribute("aria-label", "Kapat");
  btnClose.textContent = "×";

  const screenIntro = document.createElement("div");
  screenIntro.className = "vl-sd-screen vl-sd-screen-intro";
  screenIntro.innerHTML = `
    <h1 class="vl-sd-title">Farkları Bul, İndirimi Kazan!</h1>
    <div class="vl-sd-preview">${renderScene([], "sdI")}</div>
    <ol class="vl-sd-steps">
      <li><span class="vl-sd-step-num">1</span><span>İki vitrin görseli neredeyse aynı. Mobilde alt alta, geniş ekranda yan yana durur.</span></li>
      <li><span class="vl-sd-step-num">2</span><span>Farkı gördüğün yere iki görselden birinde dokun. Yanlış dokunuş −${CONFIG.wrongPenalty} sn.</span></li>
      <li><span class="vl-sd-step-num">3</span><span>${CONFIG.totalDiffs} farkı ${CONFIG.timeLimit} sn içinde bul; her fark %${CONFIG.discountPerDiff} ek indirim ekler. Takılırsan ipucu kullan (−${CONFIG.hintPenalty} sn).</span></li>
    </ol>
    <button type="button" class="vl-sd-btn vl-sd-start">Oyuna Başla</button>
  `;

  const screenPlay = document.createElement("div");
  screenPlay.className = "vl-sd-screen vl-sd-screen-play";
  screenPlay.innerHTML = `
    <h1 class="vl-sd-title">Farkları Bul, İndirimi Kazan!</h1>
    <div class="vl-sd-timer-wrap">
      <div class="vl-sd-timer-num" data-role="timer-num">${CONFIG.timeLimit}</div>
      <div class="vl-sd-timer-track" data-role="timer-track">
        <div class="vl-sd-timer-bar"></div>
      </div>
    </div>
    <div class="vl-sd-hud">
      <p class="vl-sd-score" data-role="score">0/${CONFIG.totalDiffs} Fark Bulundu • %0 İndirim Kazanıldı</p>
      <button type="button" class="vl-sd-hint" data-role="hint"></button>
    </div>
    <div class="vl-sd-board" data-role="board">
      <div class="vl-sd-img-wrap">
        <p class="vl-sd-img-cap">Orijinal vitrin</p>
        <div class="vl-sd-img-col" data-side="left">
          <div class="vl-sd-img-stage">
            <div data-role="art-left">${renderScene([], "sdL")}</div>
            <div class="vl-sd-hotspots" data-role="hotspots"></div>
          </div>
        </div>
      </div>
      <div class="vl-sd-img-wrap">
        <p class="vl-sd-img-cap">Farklı vitrin</p>
        <div class="vl-sd-img-col" data-side="right" data-role="right-col">
          <div class="vl-sd-img-stage">
            <div data-role="art-right"></div>
            <div class="vl-sd-hotspots" data-role="hotspots"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  const screenResult = document.createElement("div");
  screenResult.className = "vl-sd-screen vl-sd-screen-result";
  screenResult.innerHTML = `
    <h1 class="vl-sd-title">Oyun Bitti</h1>
    <div class="vl-sd-result-card">
      <div class="vl-sd-confetti" data-role="confetti" aria-hidden="true"></div>
      <div class="vl-sd-trophy" aria-hidden="true"><svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="vlSdCup" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3a0"/><stop offset="0.45" stop-color="#ffd700"/><stop offset="1" stop-color="#d49b00"/></linearGradient></defs><path d="M18 12 H8 Q8 28 20 30 M46 12 H56 Q56 28 44 30" stroke="#d49b00" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M16 6 H48 V20 Q48 38 32 40 Q16 38 16 20 Z" fill="url(#vlSdCup)"/><path d="M21 10 V20 Q21 30 28 34" stroke="rgba(255,255,255,0.6)" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="28" y="40" width="8" height="9" fill="#d49b00"/><rect x="20" y="49" width="24" height="5" rx="1.5" fill="#ffd700"/><rect x="16" y="54" width="32" height="6" rx="2" fill="#8a5a33"/><path d="M32 13 L34.6 18.4 L40.5 19.1 L36.1 23 L37.3 28.8 L32 25.9 L26.7 28.8 L27.9 23 L23.5 19.1 L29.4 18.4 Z" fill="#fffbe0"/></svg></div>
      <p class="vl-sd-result-title" data-role="result-headline"></p>
      <p class="vl-sd-result-product" data-role="result-product"></p>
      <p class="vl-sd-result-sub" data-role="result-time"></p>
      <div class="vl-sd-code" data-role="code-wrap">
        <span class="vl-sd-code-label">İNDİRİM KODUN</span>
        <span class="vl-sd-code-value" data-role="code"></span>
      </div>
      <button type="button" class="vl-sd-cta" data-role="cta">${CTA_LABEL}</button>
      <button type="button" class="vl-sd-btn vl-sd-btn-secondary vl-sd-replay">Tekrar Oyna</button>
    </div>
  `;

  shell.appendChild(btnClose);
  shell.appendChild(screenIntro);
  shell.appendChild(screenPlay);
  shell.appendChild(screenResult);
  root.appendChild(shell);
  document.body.appendChild(root);

  const elTimerNum = screenPlay.querySelector("[data-role=\"timer-num\"]");
  const elTimerTrack = screenPlay.querySelector("[data-role=\"timer-track\"]");
  const elScore = screenPlay.querySelector("[data-role=\"score\"]");
  const elBoard = screenPlay.querySelector("[data-role=\"board\"]");
  const elArtRight = screenPlay.querySelector("[data-role=\"art-right\"]");
  const hotspotLayers = Array.from(screenPlay.querySelectorAll("[data-role=\"hotspots\"]"));
  const btnHint = screenPlay.querySelector("[data-role=\"hint\"]");
  const btnStart = screenIntro.querySelector(".vl-sd-start");
  const elResultHeadline = screenResult.querySelector("[data-role=\"result-headline\"]");
  const elResultProduct = screenResult.querySelector("[data-role=\"result-product\"]");
  const elResultTime = screenResult.querySelector("[data-role=\"result-time\"]");
  const elCodeWrap = screenResult.querySelector("[data-role=\"code-wrap\"]");
  const elCode = screenResult.querySelector("[data-role=\"code\"]");
  const elConfetti = screenResult.querySelector("[data-role=\"confetti\"]");
  const btnCta = screenResult.querySelector("[data-role=\"cta\"]");
  const btnReplay = screenResult.querySelector(".vl-sd-replay");

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

  const playTone = (freq, start, dur, type, vol, endFreq) => {
    const ac = getAudio();
    if (!ac) {
      return;
    }
    try {
      const t = ac.currentTime + start;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (endFreq) {
        osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
      }
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(vol, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    } catch (err) {
      audioCtx = null;
    }
  };

  const SFX = {
    start: () => {
      playTone(523, 0, 0.12, "triangle", 0.18);
      playTone(784, 0.1, 0.18, "triangle", 0.18);
    },
    found: () => {
      playTone(880, 0, 0.12, "sine", 0.22);
      playTone(1318, 0.08, 0.22, "sine", 0.2);
    },
    wrong: () => {
      playTone(220, 0, 0.22, "sawtooth", 0.1, 110);
    },
    hint: () => {
      playTone(660, 0, 0.1, "triangle", 0.15);
      playTone(990, 0.1, 0.1, "triangle", 0.15);
      playTone(660, 0.2, 0.14, "triangle", 0.12);
    },
    tick: () => {
      playTone(1200, 0, 0.05, "square", 0.05);
    },
    win: () => {
      [523, 659, 784, 1046].forEach((f, i) => playTone(f, i * 0.11, 0.3, "triangle", 0.2));
    },
    lose: () => {
      playTone(392, 0, 0.25, "triangle", 0.16, 330);
      playTone(294, 0.22, 0.4, "triangle", 0.16, 220);
    },
    copy: () => {
      playTone(1046, 0, 0.08, "sine", 0.15);
    }
  };

  const getDiscountPct = () => Math.min(foundCount * CONFIG.discountPerDiff, CONFIG.totalDiffs * CONFIG.discountPerDiff);

  const updateScoreText = () => {
    const pct = getDiscountPct();
    elScore.textContent = `${foundCount}/${CONFIG.totalDiffs} Fark Bulundu • %${pct} İndirim Kazanıldı`;
  };

  const updateHintBtn = () => {
    btnHint.textContent = `İpucu (${hintsLeft}) • −${CONFIG.hintPenalty} sn`;
    btnHint.disabled = hintsLeft <= 0;
  };

  const setTimerVisual = () => {
    const p = CONFIG.timeLimit > 0 ? (timeLeft / CONFIG.timeLimit) * 100 : 0;
    root.style.setProperty("--timer-progress", `${p}%`);
    elTimerNum.textContent = String(timeLeft);
    if (p < 30) {
      elTimerTrack.classList.add("vl-sd-timer-low");
    } else {
      elTimerTrack.classList.remove("vl-sd-timer-low");
    }
  };

  const clearGameTimer = () => {
    if (timerInterval !== null) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  const restartAnimClass = (el, className) => {
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
    el.addEventListener(
      "animationend",
      () => {
        el.classList.remove(className);
      },
      { once: true }
    );
  };

  const spawnFx = (stage, className, xPct, yPct, text) => {
    const el = document.createElement("span");
    el.className = className;
    el.style.left = `${xPct}%`;
    el.style.top = `${yPct}%`;
    if (text) {
      el.textContent = text;
    }
    el.addEventListener("animationend", () => el.remove(), { once: true });
    stage.appendChild(el);
  };

  const buildHotspots = () => {
    const scale = isCoarse ? CONFIG.touchHitScale : 1;
    hotspotLayers.forEach((layer) => {
      layer.innerHTML = "";
      activeDiffs.forEach((d, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.tabIndex = -1;
        btn.className = "vl-sd-diff";
        btn.dataset.index = String(i);
        btn.dataset.found = "false";
        btn.setAttribute("aria-label", "Fark");
        btn.style.left = `${(d.x / CONFIG.view.w) * 100}%`;
        btn.style.top = `${(d.y / CONFIG.view.h) * 100}%`;
        btn.style.width = `${((d.r * 2 * scale) / CONFIG.view.w) * 100}%`;
        const ring = document.createElement("span");
        ring.className = "vl-sd-diff-hit";
        btn.appendChild(ring);
        layer.appendChild(btn);
      });
    });
  };

  const getDiffButtons = (index) => elBoard.querySelectorAll(`.vl-sd-diff[data-index="${index}"]`);

  const launchConfetti = () => {
    elConfetti.innerHTML = "";
    const colors = ["#FFD700", "#ff6b8a", "#4ade80", "#60a5fa", "#f97316", "#c084fc"];
    for (let i = 0; i < 46; i += 1) {
      const piece = document.createElement("span");
      piece.className = "vl-sd-confetti-piece";
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.setProperty("--c", colors[i % colors.length]);
      piece.style.setProperty("--dx", `${((Math.random() - 0.5) * 8).toFixed(2)}em`);
      piece.style.setProperty("--rot", `${Math.round(Math.random() * 720 - 360)}deg`);
      piece.style.animationDelay = `${(Math.random() * 0.5).toFixed(2)}s`;
      piece.style.animationDuration = `${(1.6 + Math.random() * 1.2).toFixed(2)}s`;
      elConfetti.appendChild(piece);
    }
  };

  const showResult = () => {
    resultTimeout = null;
    const pct = getDiscountPct();
    activeVoucherCode = `${makeVoucherCode()}-P${pct}`;
    root.dataset.state = "result";
    btnCta.textContent = CTA_LABEL;
    btnCta.dataset.copied = "false";
    elCode.textContent = activeVoucherCode;
    elCodeWrap.hidden = pct === 0;
    btnCta.hidden = pct === 0;
    if (foundCount >= CONFIG.totalDiffs) {
      elResultHeadline.textContent = `Tebrikler! %${pct} İndirim Kazandın`;
      elResultProduct.textContent = `${CONFIG.productName} için indirim kodun hazır.`;
    } else if (pct > 0) {
      elResultHeadline.textContent = `%${pct} İndirim Kazandın`;
      elResultProduct.textContent = `${CONFIG.productName} için indirim kodun hazır.`;
    } else {
      elResultHeadline.textContent = "Bu sefer olmadı, tekrar dene!";
      elResultProduct.textContent = "Her bulduğun fark indirimini büyütür.";
    }
    elResultTime.textContent = timeExpired
      ? `${foundCount}/${CONFIG.totalDiffs} fark bulundu • Süre doldu`
      : `${foundCount}/${CONFIG.totalDiffs} fark bulundu • ${timeLeft} sn kala`;
    if (pct > 0) {
      launchConfetti();
      SFX.win();
    } else {
      elConfetti.innerHTML = "";
      SFX.lose();
    }
  };

  const endRound = (expired) => {
    if (resultLock) {
      return;
    }
    resultLock = true;
    timeExpired = expired;
    clearGameTimer();
    if (expired) {
      hotspotLayers.forEach((layer) => {
        layer.querySelectorAll(".vl-sd-diff[data-found=\"false\"]").forEach((btn) => {
          btn.dataset.hint = "false";
          btn.dataset.missed = "true";
        });
      });
    }
    resultTimeout = window.setTimeout(showResult, expired ? 1400 : 900);
  };

  const checkWin = () => {
    if (foundCount >= CONFIG.totalDiffs) {
      endRound(false);
    }
  };

  const applyPenalty = (seconds) => {
    timeLeft = Math.max(0, timeLeft - seconds);
    setTimerVisual();
    restartAnimClass(elTimerNum, "vl-sd-penalty");
    if (timeLeft <= 0) {
      endRound(true);
    }
  };

  const markFound = (index, stage) => {
    const d = activeDiffs[index];
    getDiffButtons(index).forEach((btn) => {
      btn.dataset.found = "true";
      btn.dataset.hint = "false";
    });
    foundCount += 1;
    updateScoreText();
    spawnFx(stage, "vl-sd-pop", (d.x / CONFIG.view.w) * 100, (d.y / CONFIG.view.h) * 100, `+%${CONFIG.discountPerDiff}`);
    SFX.found();
    checkWin();
  };

  const flashWrong = (col) => {
    restartAnimClass(col, "vl-sd-flash-wrong");
  };

  const registerMiss = (stage, xPct, yPct) => {
    spawnFx(stage, "vl-sd-miss", xPct, yPct);
    spawnFx(stage, "vl-sd-pop vl-sd-pop-bad", xPct, yPct, `−${CONFIG.wrongPenalty} sn`);
    flashWrong(stage.closest(".vl-sd-img-col"));
    SFX.wrong();
    applyPenalty(CONFIG.wrongPenalty);
  };

  const startPlaying = () => {
    resultLock = false;
    window.clearTimeout(resultTimeout);
    resultTimeout = null;
    clearGameTimer();
    timeLeft = CONFIG.timeLimit;
    foundCount = 0;
    hintsLeft = CONFIG.hints;
    timeExpired = false;
    activeDiffs = pickDiffs();
    elArtRight.innerHTML = renderScene(activeDiffs, "sdR");
    elConfetti.innerHTML = "";
    root.style.setProperty("--timer-progress", "100%");
    buildHotspots();
    updateScoreText();
    updateHintBtn();
    setTimerVisual();
    root.dataset.state = "playing";
    SFX.start();
    timerInterval = setInterval(() => {
      timeLeft = Math.max(0, timeLeft - 1);
      setTimerVisual();
      if (timeLeft <= 0) {
        endRound(true);
      } else if (timeLeft <= 5) {
        SFX.tick();
      }
    }, 1000);
  };

  const copyWithFallback = (text) => {
    const ta = document.createElement("textarea");
    ta.className = "vl-sd-copy-buffer";
    ta.value = text;
    ta.setAttribute("readonly", "");
    root.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch (err) {
      ta.blur();
    }
    ta.remove();
  };

  const copyText = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(() => copyWithFallback(text));
      return;
    }
    copyWithFallback(text);
  };

  btnCta.addEventListener("click", () => {
    copyText(activeVoucherCode);
    SFX.copy();
    btnCta.textContent = "Kopyalandı ✓";
    btnCta.dataset.copied = "true";
    window.clearTimeout(copyResetTimeout);
    copyResetTimeout = window.setTimeout(() => {
      btnCta.textContent = CTA_LABEL;
      btnCta.dataset.copied = "false";
    }, 2000);
    if (CONFIG.ctaUrl && CONFIG.ctaUrl !== "#") {
      window.setTimeout(() => {
        window.location.href = CONFIG.ctaUrl;
      }, 400);
    }
  });

  btnStart.addEventListener(
    "click",
    () => {
      try {
        const _vlc = "<%VLSendClickFunc%>";
        if (_vlc.indexOf("<%") === -1) {
          new Function(_vlc)();
        }
      } catch (err) {}
      startPlaying();
    },
    { once: true }
  );

  btnReplay.addEventListener("click", () => {
    startPlaying();
  });

  btnHint.addEventListener("click", () => {
    if (root.dataset.state !== "playing" || resultLock || hintsLeft <= 0) {
      return;
    }
    const target = hotspotLayers[0].querySelector(".vl-sd-diff[data-found=\"false\"]");
    if (!target) {
      return;
    }
    hintsLeft -= 1;
    updateHintBtn();
    getDiffButtons(target.dataset.index).forEach((btn) => {
      btn.dataset.hint = "true";
      btn.querySelector(".vl-sd-diff-hit").addEventListener(
        "animationend",
        () => {
          if (btn.dataset.hint === "true") {
            btn.dataset.hint = "false";
          }
        },
        { once: true }
      );
    });
    SFX.hint();
    applyPenalty(CONFIG.hintPenalty);
  });

  elBoard.addEventListener("click", (e) => {
    if (root.dataset.state !== "playing" || resultLock) {
      return;
    }
    const t = e.target;
    if (!(t instanceof Element)) {
      return;
    }
    const stage = t.closest(".vl-sd-img-stage");
    if (!stage) {
      return;
    }
    const diffBtn = t.closest(".vl-sd-diff");
    if (diffBtn) {
      if (diffBtn.dataset.found !== "true") {
        markFound(Number(diffBtn.dataset.index), stage);
      }
      return;
    }
    const rect = stage.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) {
      return;
    }
    registerMiss(stage, ((e.clientX - rect.left) / rect.width) * 100, ((e.clientY - rect.top) / rect.height) * 100);
  });

  btnClose.addEventListener("click", () => {
    clearGameTimer();
    window.clearTimeout(resultTimeout);
    window.clearTimeout(copyResetTimeout);
    resultLock = true;
    root.dataset.prev = root.dataset.state;
    root.dataset.state = "closing";
  });

  root.addEventListener("animationend", (e) => {
    if (e.target === root && root.dataset.state === "closing") {
      root.remove();
      styleEl.remove();
      if (audioCtx && audioCtx.close) {
        audioCtx.close().catch(() => {});
      }
    }
  });

  try {
    const _vli = "<%VLSendImpressionFunc%>";
    if (_vli.indexOf("<%") === -1) {
      new Function(_vli)();
    }
  } catch (err) {}
}

initSpotDiff();
