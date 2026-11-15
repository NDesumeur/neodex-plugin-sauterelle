// Sauterelle : une sauterelle saute de feuille en feuille, toujours plus haut, du jardin jusqu'aux étoiles.
// Jeu NeoDex en pixel art dessiné à la main (police bitmap, cadres et boutons en pixels). Il tourne dans le bac à sable de NeoDex.
const HTML = `<div class="appWrap wide">
  <div class="agHead"><span class="label">Sauterelle</span><span class="hint">← → ou appuyer à côté de la sauterelle : se diriger · P : pause</span></div>
  <div class="gMain"><div class="gameBox"><canvas id="saCanvas" width="144" height="200" role="img" aria-label="Sauterelle"></canvas></div>
    <div class="gSide">
      <div class="sysCard"><b>RECORDS</b><div class="gStats" id="saStats"></div></div>
      <div class="row"><button class="btn main" id="saNew">NOUVELLE PARTIE</button><button class="btn" id="saFs">PLEIN ÉCRAN</button></div>
      <div class="hint">La sauterelle saute toute seule : dirige-la pour qu'elle retombe sur une feuille. Les feuilles vertes tiennent, les bleues glissent, les sèches cassent sous les pattes et les nuages ne portent qu'une fois. Un champignon rouge l'envoie très haut, des ailes de libellule la font voler un moment. Plus haut, des guêpes : saute-leur dessus, mais ne les touche pas de côté. Si elle tombe en bas de l'écran, c'est fini. Elle passe d'un bord à l'autre de l'écran.</div>
    </div></div>
</div>`;
const CSS = `.gMain{display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap}
.gameBox{display:grid;place-items:center;padding:10px;background:#05010b;flex:0 1 auto;min-width:min(100%,240px);position:relative}
.gameBox:fullscreen{padding:0}
.gameBox:fullscreen canvas{height:min(100vh,calc(100vw * 200 / 144));max-width:none;max-height:none}
.gameBox canvas{height:max(300px,calc(100vh - 190px));max-width:100%;max-height:calc(100vh - 190px);width:auto;aspect-ratio:144/200;image-rendering:pixelated;cursor:var(--cp,pointer);touch-action:none}
.gSide{display:flex;flex-direction:column;gap:14px;flex:1;min-width:250px;max-width:420px}
.gSide .sysCard{display:flex;flex-direction:column}
.gStats{display:grid;grid-template-columns:1fr auto;gap:4px 14px}
.gStats b{text-align:right}`;
/* ---------- l'habillage pixel art, dessiné à la main : police bitmap (accents compris), cadres, boutons, icônes ----------
   Tout est en pixels pleins, agrandis par 2 sans lissage : aucun dégradé, aucune ombre floue. */
const PXK = (() => {
  // chaque lettre : ses lignes, de haut en bas, à partir de la ligne 2 de la case (0-1 : accents des majuscules, 9-10 : jambages)
  const S = {
    A: '.###. #...# #...# ##### #...# #...# #...#', B: '####. #...# #...# ####. #...# #...# ####.', C: '.###. #...# #.... #.... #.... #...# .###.',
    D: '####. #...# #...# #...# #...# #...# ####.', E: '##### #.... #.... ####. #.... #.... #####', F: '##### #.... #.... ####. #.... #.... #....',
    G: '.###. #...# #.... #.### #...# #...# .####', H: '#...# #...# #...# ##### #...# #...# #...#', I: '### .#. .#. .#. .#. .#. ###',
    J: '..### ...#. ...#. ...#. #..#. #..#. .##..', K: '#...# #..#. #.#.. ##... #.#.. #..#. #...#', L: '#.... #.... #.... #.... #.... #.... #####',
    M: '#...# ##.## #.#.# #.#.# #...# #...# #...#', N: '#...# ##..# #.#.# #..## #...# #...# #...#', O: '.###. #...# #...# #...# #...# #...# .###.',
    P: '####. #...# #...# ####. #.... #.... #....', Q: '.###. #...# #...# #...# #.#.# #..#. .##.#', R: '####. #...# #...# ####. #.#.. #..#. #...#',
    S: '.#### #.... #.... .###. ....# ....# ####.', T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..', U: '#...# #...# #...# #...# #...# #...# .###.',
    V: '#...# #...# #...# #...# #...# .#.#. ..#..', W: '#...# #...# #...# #.#.# #.#.# ##.## #...#', X: '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
    Y: '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..', Z: '##### ....# ...#. ..#.. .#... #.... #####',
    a: '..... ..... .###. ....# .#### #...# .####', b: '#.... #.... ####. #...# #...# #...# ####.', c: '..... ..... .###. #.... #.... #.... .###.',
    d: '....# ....# .#### #...# #...# #...# .####', e: '..... ..... .###. #...# ##### #.... .###.', f: '..## .#.. #### .#.. .#.. .#.. .#..',
    g: '..... ..... .#### #...# #...# #...# .#### ....# .###.', h: '#.... #.... ####. #...# #...# #...# #...#', i: '.#. ... ##. .#. .#. .#. ###',
    'ı': '... ... ##. .#. .#. .#. ###', j: '...# .... ..## ...# ...# ...# ...# #..# .##.', k: '#... #... #..# #.#. ##.. #.#. #..#',
    l: '##. .#. .#. .#. .#. .#. ###', m: '..... ..... ##.#. #.#.# #.#.# #.#.# #...#', n: '..... ..... ####. #...# #...# #...# #...#',
    o: '..... ..... .###. #...# #...# #...# .###.', p: '..... ..... ####. #...# #...# #...# ####. #.... #....', q: '..... ..... .#### #...# #...# #...# .#### ....# ....#',
    r: '.... .... #.## ##.. #... #... #...', s: '..... ..... .#### #.... .###. ....# ####.', t: '.#.. .#.. #### .#.. .#.. .#.. ..##',
    u: '..... ..... #...# #...# #...# #..## .##.#', v: '..... ..... #...# #...# #...# .#.#. ..#..', w: '..... ..... #...# #...# #.#.# #.#.# .#.#.',
    x: '..... ..... #...# .#.#. ..#.. .#.#. #...#', y: '..... ..... #...# #...# #...# #...# .#### ....# .###.', z: '..... ..... ##### ...#. ..#.. .#... #####',
    0: '.###. #...# #..## #.#.# ##..# #...# .###.', 1: '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.', 2: '.###. #...# ....# ...#. ..#.. .#... #####',
    3: '####. ....# ....# .###. ....# ....# ####.', 4: '...#. ..##. .#.#. #..#. ##### ...#. ...#.', 5: '##### #.... ####. ....# ....# #...# .###.',
    6: '.###. #.... #.... ####. #...# #...# .###.', 7: '##### ....# ...#. ..#.. .#... .#... .#...', 8: '.###. #...# #...# .###. #...# #...# .###.',
    9: '.###. #...# #...# .#### ....# ....# .###.',
    '.': '. . . . . . #', ',': '.. .. .. .. .. .# .# #.', ':': '. . # . . . #', ';': '.. .. .# .. .. .# .# #.', '!': '# # # # # . #',
    '?': '.###. #...# ....# ...#. ..#.. ..... ..#..', "'": '# # . . . . .', '"': '#.# #.# ... ... ... ... ...', '-': '... ... ... ### ... ... ...',
    '+': '..... ..#.. ..#.. ##### ..#.. ..#.. .....', '/': '....# ...#. ...#. ..#.. .#... .#... #....', '(': '.# #. #. #. #. #. .#', ')': '#. .# .# .# .# .# #.',
    '%': '##..# ##.#. ...#. ..#.. .#... .#.## #..##', '·': '. . . # . . .', '×': '..... ..... #...# .#.#. ..#.. .#.#. #...#',
    '<': '...# ..#. .#.. #... .#.. ..#. ...#', '>': '#... .#.. ..#. ...# ..#. .#.. #...', '=': '.... .... #### .... #### .... ....',
    '_': '..... ..... ..... ..... ..... ..... #####', '#': '.#.#. .#.#. ##### .#.#. ##### .#.#. .#.#.', '&': '.##.. #..#. #.#.. .#... #.#.# #..#. .##.#',
    '…': '..... ..... ..... ..... ..... ..... #.#.#', '«': '..... ..#.# .#.#. #.#.. .#.#. ..#.# .....', '»': '..... #.#.. .#.#. ..#.# .#.#. #.#.. .....',
    '◀': '...# ..## .### #### .### ..## ...#', '▶': '#... ##.. ###. #### ###. ##.. #...', '→': '..... ..#.. ...#. ##### ...#. ..#.. .....',
    '←': '..... ..#.. .#... ##### .#... ..#.. .....', '↑': '..#.. .###. #.#.# ..#.. ..#.. ..#.. ..#..', '↓': '..#.. ..#.. ..#.. ..#.. #.#.# .###. ..#..',
    '*': '..... #.#.# .###. ##### .###. #.#.# .....', '[': '## #. #. #. #. #. ##', ']': '## .# .# .# .# .# ##', '|': '# # # # # # #',
    '@': '.###. #...# #.### #.#.# #.### #.... .###.', '€': '..### .#... ####. .#... ####. .#... ..###', '$': '..#.. .#### #.#.. .###. ..#.# ####. ..#..',
    '°': '.#. #.# .#. ... ... ... ...', '~': '..... ..... .#..# #.##. ..... ..... .....', '♪': '..##. ..#.# ..#.. ..#.. .##.. ###.. .#...',
  };
  const ACC = { a: ['..#', '.#.'], g: ['#..', '.#.'], c: ['.#.', '#.#'], d: ['...', '#.#'], t: ['.#.#', '#.#.'], z: ['.#.', '##.'] };  // aigu, grave, circonflexe, tréma, tilde, cédille
  const COMP = { é: 'ea', è: 'eg', ê: 'ec', ë: 'ed', á: 'aa', à: 'ag', â: 'ac', ä: 'ad', í: 'ıa', ì: 'ıg', î: 'ıc', ï: 'ıd', ó: 'oa', ò: 'og', ô: 'oc', ö: 'od',
    ú: 'ua', ù: 'ug', û: 'uc', ü: 'ud', ÿ: 'yd', ñ: 'nt', ç: 'cz', É: 'Ea', È: 'Eg', Ê: 'Ec', Ë: 'Ed', Á: 'Aa', À: 'Ag', Â: 'Ac', Ä: 'Ad', Í: 'Ia', Î: 'Ic', Ï: 'Id',
    Ó: 'Oa', Ô: 'Oc', Ö: 'Od', Ú: 'Ua', Ù: 'Ug', Û: 'Uc', Ü: 'Ud', Ñ: 'Nt', Ç: 'Cz' };
  const SUB = { 'œ': 'oe', 'Œ': 'OE', '’': "'", '‘': "'", '“': '"', '”': '"', '–': '-', '—': '-', ' ': ' ', ' ': ' ', '•': '·', '✓': 'v', 'ᐸ': '<', 'ᐳ': '>', '＜': '<', '＞': '>', '｜': '|', '／': '/', '！': '!', '？': '?', '（': '(', '）': ')', '：': ':', '　': ' ' };  // ᐸ ᐳ : les < > des titres YouTube
  const H = 11, glyphs = new Map(); let raster;
  function glyph(ch) {
    let g = glyphs.get(ch); if (g) return g;
    const px = [], add = (rows, ox, oy) => rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === '#') px.push([ox + x, oy + y]); });
    const c = COMP[ch], src = S[c ? c[0] : ch]; let w = 3;
    if (src) {
      const rows = src.split(' '); w = Math.max(...rows.map(r => r.length)); add(rows, 0, 2);
      if (c) { const a = ACC[c[1]]; add(a, Math.floor((w - a[0].length) / 2), c[1] === 'z' ? 9 : /[A-Z]/.test(c[0]) ? 0 : 1); }
    } else if (ch !== ' ') {  // japonais, emoji… : la lettre du système, réduite à des pixels nets (sans lissage) sur la même hauteur que la police
      const q = (raster ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })), RW = 16;
      q.canvas.width = RW; q.canvas.height = H; q.font = '11px "MS Gothic", "Yu Gothic UI", Meiryo, "Segoe UI Symbol", sans-serif'; q.fillStyle = '#000'; q.fillText(ch, 0, 10);
      const d = q.getImageData(0, 0, RW, H).data; let mx = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < RW; x++) if (d[(y * RW + x) * 4 + 3] > 110) { px.push([x, y]); mx = Math.max(mx, x + 1); }
      w = mx || 3;
      if (!px.length) { w = 5; add(['#####', '#...#', '#...#', '#...#', '#...#', '#...#', '#####'], 0, 2); }  // vraiment inconnue : une petite case
    }
    g = { w, px }; glyphs.set(ch, g); return g;
  }
  function layout(text) {
    let x = 0; const items = [];
    for (const ch of String(text)) for (const c of SUB[ch] ?? ch) { const g = glyph(c); items.push([g, x]); x += g.w + 1; }
    return { w: Math.max(0, x - 1), items };
  }
  function draw(g, text, x, y, color, s = 1) {  // (x, y) : coin haut gauche de la case
    const L = layout(text); g.fillStyle = color;
    for (const [gl, ox] of L.items) for (const [px, py] of gl.px) g.fillRect(x + (ox + px) * s, y + py * s, s, s);
    return L.w * s;
  }
  const bmp = new Map();
  function sprite(text, color, s = 1) {  // le texte tout prêt, gardé pour les images suivantes du jeu
    const k = text + '|' + color + '|' + s; let c = bmp.get(k); if (c) return c;
    c = document.createElement('canvas'); c.width = Math.max(1, layout(text).w * s); c.height = H * s; draw(c.getContext('2d'), text, 0, 0, color, s);
    if (bmp.size > 400) bmp.delete(bmp.keys().next().value);
    bmp.set(k, c); return c;
  }
  // comme fillText : (x, y) sur la ligne de base, aligné à gauche, au centre ou à droite
  function fill(g, text, x, y, color, s = 1, align = 'left') {
    const c = sprite(String(text), color, s), dx = align === 'center' ? -c.width / 2 : align === 'right' ? -c.width : 0;
    g.drawImage(c, Math.round(x + dx), Math.round(y - 9 * s));
  }
  const scale = size => Math.max(1, Math.round((size || 8) / 8));
  function art(rows, pal, s = 1) {  // un dessin en lignes de caractères, chaque caractère une couleur de la palette (« . » : transparent)
    const c = document.createElement('canvas'); c.width = Math.max(...rows.map(r => r.length)) * s; c.height = rows.length * s;
    const g = c.getContext('2d');
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const col = pal[r[x]]; if (col) { g.fillStyle = col; g.fillRect(x * s, y * s, s, s); } } });
    return c;
  }
  return { H, layout, draw, sprite, fill, scale, art };
})();

// les pièces de l'interface, pixel par pixel (K : contour, les autres lettres : la palette du jeu)
const PX_PANEL = ['..KKKKKKKKKKKK..', '.KAAAAAAAAAAAAK.', 'KALAAAAAAAAAALSK', 'KAAKKKKKKKKKKSSK', 'KAAKHHHHHHHHKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK',
  'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKKKKKKKKKKSSK', 'KALSSSSSSSSSSLSK', '.KSSSSSSSSSSSSK.', '..KKKKKKKKKKKK..'];
const PX_CARD = ['.KKKKKKKKKK.', 'KFFFFFFFFFFK', 'KFHHHHHHHHFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFSSSSSSSSFK', 'KFFFFFFFFFFK', '.KKKKKKKKKK.'];
const PX_BTN = ['.KKKKKKKKKK.', 'KWWWWWWWWWWK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KBBBBBBBBBBK', 'KKKKKKKKKKKK', 'KDDDDDDDDDDK', '.KKKKKKKKKK.'];
const PX_BTN_DOWN = ['............', '............', '.KKKKKKKKKK.', 'KBBBBBBBBBBK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KWWWWWWWWWWK', '.KKKKKKKKKK.'];
const PX_TRACK = ['.KKKKKKKKKK.', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KHHHHHHHHHHK', '.KKKKKKKKKK.'];
const PX_KNOB = ['.KKKKK.', 'KWWWWWK', 'KWAAABK', 'KWAAABK', 'KKKKKKK', 'KWAAABK', 'KWAAABK', 'KBBBBBK', 'KDDDDDK', '.KKKKK.'];
const PX_RAIL = ['KDDDDDDK', 'KDDDDDDK', 'KDDDDDDK', 'KDDHHDDK'];
const PX_ICONS = {
  play: ['kk......', 'kakk....', 'kaaakk..', 'kaaaaakk', 'kaaaaaak', 'kaaaaakk', 'kaaakk..', 'kakk....', 'kk......'],
  full: ['www...www', 'w.......w', 'w.......w', '.........', '....a....', '.........', 'w.......w', 'w.......w', 'www...www'],
  note: ['...aaaaaa', '...aaaaaa', '...a....a', '...a....a', '...a....a', '.aaa..aaa', 'aaaa.aaaa', 'aaaa.aaaa', '.aa...aa.'],
  star: ['....g....', '....g....', '...ggg...', 'ggggwgggg', '.ggwwwgg.', '..ggggg..', '..oo.oo..', '.oo...oo.', '.o.....o.'],
  crown: ['g...g...g', 'gg.ggg.gg', 'ggggggggg', 'grgggggrg', 'ggggggggg', 'ooooooooo'],
  folder: ['oooo.....', 'oggoooooo', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ooooooooo'],
  vol: ['....w....', '...ww..b.', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', '...ww..b.', '....w....'],
  clock: ['..wwwww..', '.w.....w.', 'w...a...w', 'w...a...w', 'w...aaa.w', 'w.......w', 'w.......w', '.w.....w.', '..wwwww..'],
  cursor: ['....a....', '..aaaaa..', '.a..a..a.', '.a.....a.', 'aaa.w.aaa', '.a.....a.', '.a..a..a.', '..aaaaa..', '....a....'],
  plus: ['...b...', '...b...', '...b...', 'bbbbbbb', '...b...', '...b...', '...b...'],
  down: ['wwwwwww', '.wwwww.', '..www..', '...w...'],
};

/* habille la page du jeu : root = son conteneur, T = sa palette, icons = [motif du texte, icône] pour les boutons et libellés */
function pxSkin(root, { T, icons = [], emblem, title }) {
  root.classList.add('pxk'); const s = 2, url = c => c.toDataURL();
  const btnPal = (M, W, B, D) => ({ K: T.k, W, M, B, D });
  const BN = btnPal(T.btn, T.btnHi, T.btnLo, T.k2), BH = btnPal(T.btnHov, T.btnHovHi, T.btnLo, T.k2);
  const BA = btnPal(T.acc, T.accL, T.accS, T.accD), BAH = btnPal(T.accL, '#ffffff', T.acc, T.accD);
  const img = { panel: PXK.art(PX_PANEL, { K: T.k, A: T.acc, S: T.accS, L: T.rivet, H: T.hl, D: T.fill }, s),
    card: PXK.art(PX_CARD, { K: T.k, F: T.line, H: T.hl, D: T.fill, S: T.k2 }, s), cardOn: PXK.art(PX_CARD, { K: T.k, F: T.acc, H: T.accS, D: T.fillOn, S: T.accD }, s),
    btn: PXK.art(PX_BTN, BN, s), btnH: PXK.art(PX_BTN, BH, s), btnD: PXK.art(PX_BTN_DOWN, BH, s),
    main: PXK.art(PX_BTN, BA, s), mainH: PXK.art(PX_BTN, BAH, s), mainD: PXK.art(PX_BTN_DOWN, BA, s),
    track: PXK.art(PX_TRACK, { K: T.k, D: T.k2, H: T.line }, s), knob: PXK.art(PX_KNOB, { K: T.k, W: T.accL, A: T.acc, B: T.accS, D: T.accD }, s),
    rail: PXK.art(PX_RAIL, { K: T.k, D: T.k2, H: T.line }, s), tile: PXK.art(T.tile, { x: T.bgDot, ':': T.bgDot2, '+': T.spark, '*': T.spark2 }, s) };
  const u = Object.fromEntries(Object.entries(img).map(([k, c]) => [k, url(c)]));
  const nine = (k, sl) => `border-style:solid;border-width:${sl * s}px;border-image:url(${u[k]}) ${sl * s} fill / ${sl * s}px stretch`;
  const IP = { k: T.k, w: T.text, a: T.acc, b: T.acc2, g: T.gold, o: T.orange, r: T.red, n: T.green, N: T.green2, m: T.muted, s: T.accS };
  const iconUrl = new Map(), icon = name => {
    let v = iconUrl.get(name); if (!v) { const c = PXK.art(PX_ICONS[name] || emblem, IP, s); v = { u: url(c), w: c.width, h: c.height }; iconUrl.set(name, v); }
    const b = document.createElement('b'); b.className = 'pxI'; b.setAttribute('aria-hidden', 'true'); b.style.cssText = `width:${v.w}px;height:${v.h}px;background-image:url(${v.u})`; return b;
  };
  const R = '.pxk.pxk';
  const css = document.createElement('style');
  css.textContent = `html,html body{background:${T.bg} url(${u.tile}) 0 0/${img.tile.width}px ${img.tile.height}px repeat!important}
::-webkit-scrollbar{width:16px;height:16px} ::-webkit-scrollbar-track{background:url(${u.rail}) 0 0/16px 8px repeat-y} ::-webkit-scrollbar-thumb{${nine('main', 4)}} ::-webkit-scrollbar-corner{background:none}
${R}{color:${T.text}}
${R} .px{box-shadow:none;background:none}
${R} .agHead{gap:18px;margin:0}
${R} .agHead .label{display:flex;align-items:center;gap:12px}
${R} .btn,${R} .tab{${nine('btn', 4)};height:auto;min-height:0;padding:0 6px 4px;margin:0;color:${T.text};font:12px/1 monospace;display:inline-flex;align-items:center;gap:6px;filter:none;text-shadow:none;letter-spacing:0;cursor:var(--cp,pointer)}
${R} .btn:hover,${R} .tab:hover{border-image-source:url(${u.btnH})}
${R} .btn:active,${R} .tab:active{border-image-source:url(${u.btnD});padding:4px 6px 0}
${R} .btn.main,${R} .tab.on{border-image-source:url(${u.main});color:${T.k}}
${R} .btn.main:hover,${R} .tab.on:hover{border-image-source:url(${u.mainH})}
${R} .btn.main:active,${R} .tab.on:active{border-image-source:url(${u.mainD})}
${R} .btn:focus-visible,${R} .tab:focus-visible{outline:2px dashed ${T.acc2};outline-offset:2px}
${R} .btn .pxV,${R} .tab .pxV{white-space:nowrap}
${R} .sysCard{${nine('card', 4)};padding:4px 6px;gap:8px;background:none}
${R} .sysCard.on{border-image-source:url(${u.cardOn})}
${R} .sysCard.on>b{color:${T.acc}}
${R} .sysCard>b{color:${T.text}}
${R} .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
${R} .gameBox,${R} .thBox{${nine('panel', 5)};box-shadow:none;background:none;padding:2px;gap:8px;grid-template-rows:auto auto}
${R} .gameBox canvas,${R} .thBox canvas{display:block;background:#05010b}
${R} .gameBox:fullscreen,${R} .thBox:fullscreen{border:0;padding:0;background:#000}
${R} .rhFs{position:static;opacity:1;justify-self:end;margin:0 6px 6px 0}
${R} .rhTabs{gap:8px;flex-wrap:wrap}
${R} .hint{color:${T.muted};line-height:24px}
${R} label{color:${T.muted};display:inline-flex;align-items:center;gap:8px}
${R} .rhDel{color:${T.red};top:6px;right:8px}
${R} input[type=range]{-webkit-appearance:none;appearance:none;background:none;height:20px;width:150px}
${R} input[type=range]::-webkit-slider-runnable-track{height:12px;${nine('track', 2)}}
${R} input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:20px;border:0;background:url(${u.knob}) 0 0/100% 100%;margin-top:-8px;cursor:var(--cp,pointer)}
${R} .pxSel{justify-content:space-between;gap:10px;max-width:100%;overflow:hidden}
${R} .rhImport .pxSel{flex:1;min-width:0}
.pxMenu{position:fixed;z-index:50;${nine('card', 4)};padding:2px;max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;color:${T.text}}
.pxMenu button{all:unset;padding:3px 8px;cursor:var(--cp,pointer);white-space:nowrap}
.pxMenu button:hover,.pxMenu button:focus-visible,.pxMenu button.on{background:${T.btnHov};color:${T.text}}
.pxMenu button.on{color:${T.acc}}
.pxT{position:relative;white-space:normal;font:12px/1 monospace;letter-spacing:0;text-transform:none}
.pxT i{display:inline-block;vertical-align:middle;background:currentColor;-webkit-mask:var(--m) 0 0/100% 100% no-repeat;mask:var(--m) 0 0/100% 100% no-repeat;image-rendering:pixelated}
.pxI{display:inline-block;vertical-align:middle;background:0 0/100% 100% no-repeat;image-rendering:pixelated;margin-right:6px}
.pxV>.pxI+.pxI{margin-left:-4px}
.pxSr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`;
  document.head.append(css);
  // un mot = une image (en masque : sa couleur suit celle du texte), une règle par mot pour ne pas répéter l'image
  const words = new Map(), sheet = document.head.appendChild(document.createElement('style')).sheet;
  const word = w => {
    let k = words.get(w);
    if (!k) { const c = PXK.sprite(w, '#fff', s); k = 'pw' + words.size; words.set(w, k); sheet.insertRule(`.${k}{--m:url(${c.toDataURL()});width:${c.width}px;height:${c.height}px}`, sheet.cssRules.length); }
    const i = document.createElement('i'); i.className = k; return i;
  };
  function render(vis, text, lead) {
    const parts = [], ic = lead && icons.find(([re]) => re.test(text.trim()));
    if (ic) parts.push(icon(ic[1]));
    for (const m of text.matchAll(/(★+)|(\s+)|([^\s★]+)/g)) {
      if (m[1]) for (const _ of m[1]) parts.push(icon('star'));
      else if (m[2]) parts.push(document.createTextNode(' '));
      else parts.push(word(m[3]));
    }
    vis.replaceChildren(...parts);
  }
  const lead = node => node.parentElement?.matches('button,label,.tab,.btn') && !node.previousSibling;
  function pixText(node) {  // le texte reste dans la page (lecteur d'écran, copier) ; on voit ses lettres en pixels
    const wrap = document.createElement('span'), sr = document.createElement('span'), vis = document.createElement('span');
    wrap.className = 'pxT'; sr.className = 'pxSr'; vis.className = 'pxV'; vis.setAttribute('aria-hidden', 'true');
    const first = lead(node); node.replaceWith(wrap); sr.append(node); wrap.append(sr, vis); render(vis, node.data, first);
  }
  function pxSelect(sel) {  // une liste déroulante en pixels ; la vraie reste cachée et garde sa valeur et ses événements
    sel.dataset.px = '1'; sel.style.display = 'none';
    const b = document.createElement('button'), lab = document.createElement('span'); b.type = 'button'; b.className = 'btn pxSel'; b.append(lab, icon('down')); sel.after(b);
    const sync = () => { const t = sel.selectedOptions[0]?.textContent || '—'; if (lab.dataset.t !== t) { lab.dataset.t = t; lab.textContent = t; } };
    const d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    Object.defineProperty(sel, 'value', { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, v); sync(); } });
    new MutationObserver(sync).observe(sel, { childList: true, subtree: true, characterData: true, attributes: true });
    sel.addEventListener('change', sync);
    b.onclick = () => {
      document.querySelector('.pxMenu')?.remove();
      const m = document.createElement('div'), r = b.getBoundingClientRect(); m.className = 'pxMenu'; m.setAttribute('role', 'listbox');
      for (const o of sel.options) {
        const it = document.createElement('button'); it.type = 'button'; it.textContent = o.textContent; it.className = o.selected ? 'on' : ''; it.setAttribute('role', 'option');
        it.onclick = () => { sel.value = o.value; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); close(); b.focus(); };
        m.append(it);
      }
      root.append(m);
      const below = innerHeight - r.bottom; m.style.minWidth = r.width + 'px'; m.style.left = Math.min(r.left, innerWidth - m.offsetWidth - 4) + 'px';
      m.style.top = (below > m.offsetHeight + 8 || below > r.top ? r.bottom + 2 : r.top - m.offsetHeight - 2) + 'px';
      const close = () => { m.remove(); removeEventListener('pointerdown', out, true); removeEventListener('keydown', key, true); removeEventListener('blur', close); };
      const out = e => { if (!m.contains(e.target) && e.target !== b && !b.contains(e.target)) close(); };
      const key = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); b.focus(); } };
      addEventListener('pointerdown', out, true); addEventListener('keydown', key, true); addEventListener('blur', close);
      (m.querySelector('.on') || m.firstChild)?.focus();
    };
    sync();
  }
  const SKIP = 'select,option,textarea,script,style,canvas,.pxT,[data-pxskip]';
  let queued = false;
  function pass() {
    queued = false;
    root.querySelectorAll('select.gSel:not([data-px])').forEach(pxSelect);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), todo = [];
    for (let n; (n = w.nextNode());) if (n.data.trim() && n.parentElement && !n.parentElement.closest(SKIP)) todo.push(n);
    todo.forEach(pixText);
  }
  new MutationObserver(ms => {
    for (const m of ms) if (m.type === 'characterData') { const wrap = m.target.parentNode?.closest?.('.pxT'); if (wrap) render(wrap.lastChild, m.target.data, false); }
    if (!queued) { queued = true; queueMicrotask(pass); }
  }).observe(root, { childList: true, subtree: true, characterData: true });
  // le titre : grosses lettres à contour, trois tons, et l'emblème du jeu
  const lab = root.querySelector('.agHead .label');
  if (lab) {
    const L = PXK.layout(title), c = document.createElement('canvas'), g = c.getContext('2d'), on = [];
    c.width = L.w + 3; c.height = PXK.H + 3;
    for (const [gl, ox] of L.items) for (const [x, y] of gl.px) on.push([ox + x + 1, y + 1]);
    g.fillStyle = T.k; for (const [x, y] of on) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [2, 2], [1, 2], [2, 1]]) g.fillRect(x + dx, y + dy, 1, 1);
    for (const [x, y] of on) { g.fillStyle = y <= 5 ? T.accL : y <= 7 ? T.acc : T.accS; g.fillRect(x, y, 1, 1); }
    const big = document.createElement('canvas'), z = 4; big.width = c.width * z; big.height = c.height * z;
    const bg = big.getContext('2d'); bg.imageSmoothingEnabled = false; bg.drawImage(c, 0, 0, big.width, big.height);
    const t = document.createElement('b'); t.className = 'pxI'; t.style.cssText = `width:${big.width}px;height:${big.height}px;background-image:url(${big.toDataURL()})`;
    const e = PXK.art(emblem, IP, 3), em = document.createElement('b'); em.className = 'pxI'; em.style.cssText = `width:${e.width}px;height:${e.height}px;background-image:url(${e.toDataURL()})`;
    const sr = document.createElement('span'); sr.className = 'pxSr'; sr.textContent = lab.textContent;
    lab.dataset.pxskip = '1'; lab.replaceChildren(em, t, sr);
  }
  pass();
}


export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const host = ctx.host, { el, toast, sfx } = host;
  const folder = ctx.folder;
  host.addStyle(CSS);
  view.innerHTML = HTML;
  pxSkin(view.querySelector('.appWrap'), { title: "SAUTERELLE", T: {"k": "#0c0a12", "k2": "#16121e", "fill": "#221c2c", "fillOn": "#2e263a", "hl": "#3a3046", "line": "#62566e", "acc": "#5aaa2a", "accL": "#c8f0a0", "accS": "#3a7a1a", "accD": "#14280a", "rivet": "#f0f0f8", "btn": "#3a3046", "btnHi": "#62566e", "btnLo": "#16121e", "btnHov": "#443852", "btnHovHi": "#82768e", "text": "#f4f0f8", "muted": "#c0b8cc", "acc2": "#7ee07a", "gold": "#ffd84a", "orange": "#ff8a3a", "red": "#ff4a3a", "green": "#7ee07a", "green2": "#2f8a3a", "bg": "#100c16", "bgDot": "#221c2c", "bgDot2": "#16121e", "spark": "#14280a", "spark2": "#5aaa2a", "tile": ["................", "...:............", "................", "..........+.....", "................", "................", ".....:..........", "................", "................", ".............:..", "................", "..+.............", "................", ".........:......", "................", "................"]},
  emblem: ["..........k.", ".........k..", "......kkkk..", ".....knnnwk.", "..kkkknnnkkk", ".kNNNNNnnnk.", "kNNNNNNNNk..", ".kkkkkkkk...", "..kN.kN.....", ".kN..kN.....", "kN....kN....", "............"],
  icons: [[/^NOUVELLE/, 'play'], [/^RECORDS/, 'crown'], [/^PLEIN/, 'full']] });
  const $ = id => view.querySelector('#' + id) || document.getElementById(id);
  const doc = async n => { try { return await folder.read(n); } catch { return null; } };
  const games = { best: {}, ...(await doc('games')) };
  let gamesTimer = null;
  const saveGames = () => { clearTimeout(gamesTimer); gamesTimer = setTimeout(() => { gamesTimer = null; folder.write('games', games).catch(() => {}); }, 500); };
  const best = (k, v) => { const b = games.best[k]; if (v > (b ?? 0)) {  // un score nul n'est jamais un record
    games.best[k] = v; saveGames(); return true; } return false; };
  const gstore = (k, init) => (games[k] ??= init);
function gameLoop(st, appKey, update, draw) {
  cancelAnimationFrame(st.raf);
  const STEP = 1000 / 60; let acc = 0, last = performance.now();
  const frame = t => {
    if (!view.classList.contains('on')) { st.raf = 0; if (st.mode === 'play') st.mode = 'pause'; return; }  // leaving the tab pauses the game
    st.raf = requestAnimationFrame(frame);
    acc += Math.min(200, t - last); last = t;
    while (acc >= STEP) { if (st.mode === 'play') update(); st.tick++; acc -= STEP; }
    draw();
  };
  st.raf = requestAnimationFrame(frame);
}
function gameText(g, w, lines, y0) {  // lignes centrées en police pixel, sur une bande sombre
  g.fillStyle = 'rgba(11,3,28,.72)'; g.fillRect(0, y0 - 14, w, lines.length * 14 + 14);
  lines.forEach(([text, color, size], i) => PXK.fill(g, text, w / 2, y0 + i * 14, color, PXK.scale(size), 'center'));
}
const px = (g, color, x, y, w = 1, h = 1) => { g.fillStyle = color; g.fillRect(Math.round(x), Math.round(y), w, h); };
function sprite(g, rows, x, y, pal) { rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = pal[r[i]]; if (c) px(g, c, x + i, y + j); } }); }
const seeded = s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pxFont = (g, text, x, y, color, size = 8, align = 'left') => { const s = PXK.scale(size); PXK.fill(g, text, x + s, y + s, '#05010b', s, align); PXK.fill(g, text, x, y, color, s, align); };

/* ---------- Sauterelle : une sauterelle saute de feuille en feuille, toujours plus haut : jardin, ciel, crépuscule, nuit, étoiles.
   Feuilles fixes, feuilles qui glissent, feuilles sèches qui cassent, nuages qui ne portent qu'une fois, champignons ressorts, ailes de libellule, guêpes ---------- */
const SA = {W: 144, H: 200, HUD: 12, G: .18, JUMP: -5.2, SPRING: -9, WING: -6.5, BUG: -2.4, CARRY: 240, PW: 22, ZONE: 2000};
// une nouvelle partie garde le même objet : la boucle du jeu (gameLoop) continue de tourner dessus
const renew = (old, o) => { if (!old) return o; for (const k of Object.keys(old)) if (k !== 'raf') delete old[k]; return Object.assign(old, o); };
const sas = gstore('sauterelle', {games: 0, total: 0, wasps: 0});
let sa = null, saac = null, saMute = false, saNoWasp = false;
function saBeep(f, d, type = 'square', slide = 0, vol = .04) { if (saMute) return; try { saac ??= new AudioContext(); const o = saac.createOscillator(), g = saac.createGain(), t = saac.currentTime; o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g).connect(saac.destination); o.start(t); o.stop(t + d); } catch {} }
// le saut normal monte de 75 pixels : l'écart entre deux feuilles « sûres » ne dépasse jamais 58
const saGapMax = h => 22 + Math.min(36, h / 140);
function saGen() {
  const r = sa.rnd;
  while (sa.top > sa.cam - 60) {
    const h = -sa.top, gm = saGapMax(h), y = sa.top - Math.round(gm * (.55 + .45 * r())), x = Math.floor(r() * (SA.W - SA.PW));
    const t = r() < Math.min(.35, h / 7000) ? 'move' : h > 900 && r() < Math.min(.22, h / 9000) ? 'cloud' : 'leaf';
    sa.plats.push({x, y, t, vx: t === 'move' ? (r() < .5 ? -1 : 1) * (.4 + Math.min(.8, h / 8000)) : 0, spring: t === 'leaf' && r() < .07, used: 0});
    if (r() < Math.min(.4, .1 + h / 6000)) {  // une feuille sèche en plus, entre deux : elle casse sous les pattes
      const dx = (x + 40 + Math.floor(r() * 60)) % (SA.W - SA.PW); sa.plats.push({x: dx, y: Math.round((y + sa.top) / 2), t: 'dry', vx: 0, used: 0});
    }
    if (h > 600 && r() < .015) sa.items.push({x: (x + 60) % (SA.W - 10), y: y - 30});
    else if (!saNoWasp && h > 300 && r() < .012) sa.items.push(  // shortcut: le joueur automatique de la vérification ne sait pas viser après une coccinelle, elle y est testée à part
      {x: (x + 70) % (SA.W - 10), y: y - 30, k: 'bug'});
    if (!saNoWasp && h > 1300 && r() < Math.min(.14, h / 30000)) sa.wasps.push({x: r() * (SA.W - 12), y: Math.round((y + sa.top) / 2) - 6, vx: (r() < .5 ? -1 : 1) * (.5 + r() * .5), dead: 0});
    sa.top = y;
  }
  const low = sa.cam + SA.H + 40;  // ce qui est passé sous l'écran ne sert plus
  sa.plats = sa.plats.filter(p => p.y < low); sa.wasps = sa.wasps.filter(w => w.y < low); sa.items = sa.items.filter(i => i.y < low && !i.taken);
}
function saNew() {
  const g = sa?.g;
  sa = renew(sa, {g, mode: 'ready', tick: 0, seen: 0, rnd: seeded(Date.now() % 1e9), keys: new Set(), x: SA.W / 2 - 5, y: 0, vx: 0, vy: 0, face: 1, cam: -SA.H + 24, top: 0, maxH: 0, squash: 0, wing: 0, carry: 0,
    plats: [{x: 0, y: 0, t: 'ground', w: SA.W, vx: 0, used: 0}], wasps: [], items: [], bits: [], dead: 0, why: '', record: false, stomps: 0, drag: 0});
  saGen(); saInfo();
}
const saWrapDx = (from, to) => ((to - from) % SA.W + SA.W * 1.5) % SA.W - SA.W / 2;
function saOver(why) { sa.mode = 'over'; sa.why = why; sa.dead = 0; const m = Math.floor(sa.maxH / 10); sas.games++; sas.total += m; sa.record = best('sauterelle', m); saveGames(); saInfo(); saBeep(300, .6, 'sawtooth', 50, .06); }
function saUpdate() {
  const dir = (sa.keys.has('R') ? 1 : 0) - (sa.keys.has('L') ? 1 : 0);
  if (dir) sa.face = dir;
  sa.vx += (dir * 2.3 - sa.vx) * .18;
  sa.x = ((sa.x + sa.vx) % SA.W + SA.W) % SA.W;
  if (sa.squash) sa.squash--;
  if (sa.wing) { sa.wing--; sa.vy = SA.WING; } else if (sa.carry) { sa.carry--; sa.vy = SA.BUG; } else sa.vy = Math.min(7, sa.vy + SA.G);
  const py = sa.y; sa.y += sa.vy;
  for (const p of sa.plats) {
    if (p.t === 'move') { p.x += p.vx; if (p.x < 0 || p.x > SA.W - SA.PW) { p.vx = -p.vx; p.x = Math.max(0, Math.min(SA.W - SA.PW, p.x)); } }
    if (p.gone || sa.vy <= 0 || !(py <= p.y && sa.y >= p.y)) continue;
    const w = p.w || SA.PW, cx = sa.x + 5;
    if (!(cx + 4 > p.x && cx - 4 < p.x + w)) continue;
    if (p.t === 'dry') {  // elle casse : la sauterelle passe à travers
      p.gone = 1; for (let i = 0; i < 6; i++) sa.bits.push({x: p.x + 3 + i * 3, y: p.y, vx: (sa.rnd() - .5) * 1.2, vy: sa.rnd() * -1, t: 50, c: i % 2 ? '#a8783a' : '#c8984a'});
      saBeep(160, .08, 'sawtooth', 90, .03); continue;
    }
    sa.y = p.y; p.used = 8; sa.squash = 6;
    if (p.spring && Math.abs(cx - (p.x + w / 2)) < 7) { sa.vy = SA.SPRING; p.boing = 12; saBeep(300, .25, 'square', 900, .04); }
    else { sa.vy = SA.JUMP; saBeep(520, .05, 'square', 700, .025); }
    if (p.t === 'cloud') { p.gone = 1; for (let i = 0; i < 8; i++) sa.bits.push({x: p.x + i * 3, y: p.y, vx: (sa.rnd() - .5) * .8, vy: -.3 - sa.rnd() * .5, t: 30, c: '#f0f4ff'}); }
    break;
  }
  for (const it of sa.items) if (!it.taken && Math.abs(sa.x + 5 - it.x - 5) < 9 && Math.abs(sa.y - 5 - it.y - 4) < 10) { it.taken = 1; if (it.k === 'bug') { sa.carry = SA.CARRY; [520, 660, 520, 780].forEach((f, i) => setTimeout(() => saBeep(f, .07, 'triangle'), i * 70)); } else { sa.wing = 150; [660, 880, 1100].forEach((f, i) => setTimeout(() => saBeep(f, .08), i * 60)); } }
  for (const w of sa.wasps) {
    if (w.dead) { w.y += w.dead++ * .15; continue; }
    w.x += w.vx; if (w.x < 0 || w.x > SA.W - 12) w.vx = -w.vx;
    const ox = Math.abs(sa.x + 5 - (w.x + 6)) < 9, top = w.y + 1;
    if (!ox || sa.y < w.y - 1 || sa.y - 9 > w.y + 8) continue;
    if (sa.wing || sa.carry) { w.dead = 1; continue; }
    if (sa.vy > 0 && py <= top + 3) { w.dead = 1; sa.vy = -6; sa.stomps++; sas.wasps++; saBeep(200, .15, 'square', 80, .05); continue; }  // écrasée par en dessus : on rebondit
    return saOver('piquée');
  }
  for (const b of sa.bits) { b.x += b.vx; b.y += b.vy; b.vy += .08; b.t--; } sa.bits = sa.bits.filter(b => b.t > 0);
  for (const p of sa.plats) { if (p.used) p.used--; if (p.boing) p.boing--; }
  sa.maxH = Math.max(sa.maxH, -sa.y);
  sa.cam = Math.min(sa.cam, sa.y - 96);
  saGen();
  if (sa.y - sa.cam > SA.H + 12) saOver('tombée');
}
/* ---------- le dessin, tout en pixels ---------- */
const saMix = (a, b, t) => '#' + [1, 3, 5].map(i => Math.round(parseInt(a.substr(i, 2), 16) * (1 - t) + parseInt(b.substr(i, 2), 16) * t).toString(16).padStart(2, '0')).join('');
const SA_SKY = ['#78c0e8', '#5a9ad8', '#4a64b0', '#2a2a6a', '#120e30', '#06040e'];
const SA_HOP = {  // la sauterelle de profil, tournée vers la droite (un seul œil visible) : grande patte arrière repliée, puis tendue au saut
  up: ["............k...", "...........k....", "..........kkkk..", "....kkkkkkggggk.", "..kkGGGGGgggwek.", ".kGGyyyyGGggeek.", "kGDDDDDDDGGgggk.", ".kDDDDDDDDGGkk..", "..kGkkkkkkkkk...", ".kGk....kl.kl...", ".kGk...kl..kl...", "kGk...kl..kl....", "kk.....k...k...."],
  down: ["....kkk.....k...", "...kgggk...k....", "..kgGGGgk.kkkk..", "..kGkkkGgkggggk.", "..kGk.kkGgggwek.", ".kkGkkyyyGggeek.", "kGGDkGGGGGGgggk.", ".kDDDDDDDDGGkk..", "..kkkkkkkkkkk...", "..kGk....klkl...", ".kGk....kl.kl...", "kkk.....k..k...."]};
const SA_HOP_PAL = {k: '#14200a', g: '#96e650', G: '#50aa32', D: '#326e1e', y: '#dce678', w: '#ffffff', e: '#14200a', l: '#28501a'};
const saMirror = rows => rows.map(r => [...r].reverse().join(''));
const SA_WASP = [['....ww.ww...', '...wWwwWw...', '..kkkkkkk...', '.kyykyykyk..', 'kyykyykyyek.', '.kyykyykyk.s', '..kkkkkkk...'], ['............', '...ww..ww...', '..kWkkkWk...', '.kyykyykyk..', 'kyykyykyyek.', '.kyykyykyk.s', '..kkkkkkk...']];
const SA_WASP_PAL = {k: '#1a1408', y: '#ffd84a', w: '#e8f4ff', W: '#a8c8e8', e: '#ff4a3a', s: '#1a1408'};
function saPlat(g, p, sx, sy) {
  const w = p.w || SA.PW, d = p.used > 4 ? 1 : 0; sy += d;
  if (p.t === 'ground') { px(g, '#3a8a2a', 0, sy, SA.W, 4); px(g, '#2a6a1a', 0, sy + 4, SA.W, 3); px(g, '#6a4a2a', 0, sy + 7, SA.W, 40); for (let x = 0; x < SA.W; x += 3) px(g, '#5ac03a', x + (x % 2), sy - 1 - (x * 7 % 3 === 0 ? 1 : 0), 1, 2); for (let x = 5; x < SA.W; x += 17) px(g, '#5a3a1a', x, sy + 12 + x % 9, 3, 2); return; }
  if (p.t === 'cloud') { const c = '#f0f4ff', s = '#b8c4e0'; px(g, '#6a7aa0', sx + 1, sy - 2, w - 2, 1); px(g, c, sx + 3, sy - 4, 6, 2); px(g, c, sx + 10, sy - 5, 7, 3); px(g, c, sx, sy - 2, w, 3); px(g, s, sx + 1, sy + 1, w - 2, 2); return; }
  const [L, M, D] = p.t === 'dry' ? ['#d8a85a', '#b8843a', '#7a5020'] : p.t === 'move' ? ['#8ae0c8', '#3ab8a0', '#1a7060'] : ['#9ae05a', '#5aaa2a', '#2a6a1a'];
  const K = '#14200a', rows = [[-1, 6, w - 9, L], [0, 3, w - 5, L], [1, 1, w - 3, M], [2, 2, w - 3, M], [3, 4, w - 6, D]];  // [rangée, début, fin, couleur]
  px(g, K, sx + 6, sy - 2, w - 14, 1); px(g, K, sx + 4, sy + 4, w - 9, 1); px(g, K, sx, sy + 1, 1, 1);
  for (const [dy, a, b, c] of rows) { px(g, K, sx + a - 1, sy + dy, 1, 1); px(g, K, sx + b + 1, sy + dy, 1, 1); px(g, c, sx + a, sy + dy, b - a + 1, 1); }
  px(g, D, sx + 2, sy + 1, w - 5, 1);  // la nervure du milieu
  for (let i = 6; i < w - 5; i += 4) { px(g, D, sx + i, sy, 1, 1); px(g, D, sx + i + 1, sy - 1 + (i < w - 9 ? 0 : 1), 1, 1); px(g, D, sx + i, sy + 2, 1, 1); }  // les nervures de côté
  px(g, D, sx + w - 2, sy + 1, 3, 1); px(g, D, sx + w + 1, sy + 2, 1, 1);  // la tige
  if (p.t === 'dry') { px(g, '#7a5020', sx + 7, sy + 1, 1, 2); px(g, '#7a5020', sx + 14, sy + 2, 2, 1); }
  if (p.spring) { const b = p.boing > 6 ? 1 : 0, cx = sx + w / 2 - 4; sprite(g, b ? ['.kkkkkk.', 'krrwrrwk', 'kkkkkkkk'] : ['..kkkk..', '.krwrrk.', 'krrrrwrk', 'kkkkkkkk', '..kwwk..'], cx, sy - (b ? 3 : 5), {k: '#2a0a10', r: '#e83a3a', w: '#ffffff'}); }
}
const SA_BUG = ['..kk....', '.kddrr..', 'kddrkrrk', 'krrrrrrk', 'krkrrkrk', '.krrrrk.', '..kkkk..'], SA_BUG_PAL = {k: '#1a0a0a', d: '#2a1a1a', r: '#e83a2a'};
function saBlob(g, col, cx, cy, r) { for (let yy = -r; yy <= r; yy++) { const hw = Math.round(Math.sqrt(r * r - yy * yy)); px(g, col, cx - hw, cy + yy, hw * 2 + 1, 1); } }
function saSides(g) {
  const {W, H, HUD} = SA, P = .75, S = 36;
  for (let k = Math.floor(sa.cam * P / S) - 1; k < Math.floor((sa.cam * P + H) / S) + 2; k++) {
    const hh = (k * 2246822519 >>> 0) % 1000, wy = Math.round(k * S - sa.cam * P + HUD), alt = -k * S / P, left = hh % 2 === 0, X = d => left ? d : W - 1 - d;
    if (alt < 1900) {  // les herbes hautes, qui ondulent
      for (let b = 0; b < 3; b++) { const h = 24 + (hh >> b) % 14, x = 2 + b * 4 + hh % 3; for (let j = 0; j < h; j++) px(g, j > h - 3 ? '#c8f080' : b === 1 ? '#3a8a2a' : '#4a9a3a', X(x + Math.round(Math.sin(j / 8 + sa.tick / 45 + b) * 1.5)), wy + S - j, 1, 1);
        if (b === 1 && hh % 3 === 0) { px(g, '#e8d070', X(x) - 1, wy + S - h - 3, 3, 3); px(g, '#c8a040', X(x), wy + S - h - 2, 1, 1); } }  // un épi
    } else if (alt < 4300) {  // les arbres : un tronc, des branches et le feuillage
      const r = 11 + hh % 6, cx = X(r - 4), cy = wy + S / 2;
      px(g, '#4a3020', X(left ? 0 : 3), wy, 4, S); px(g, '#5a3a24', X(left ? 4 : 4), cy + 6, 1, 1);
      saBlob(g, '#1e5028', cx, cy, r); saBlob(g, '#2e6a32', cx + (left ? -1 : 1), cy - 1, r - 2); saBlob(g, '#4a9a4a', cx + (left ? 2 : -2), cy - r / 2, Math.round(r / 3));
      for (let i = 0; i < 5; i++) px(g, '#6aba5a', cx + ((hh * (i + 3)) % (r * 2)) - r + 2, cy + ((hh * (i + 7)) % r) - r / 2, 2, 1);
    } else if (alt < 6600) {  // les gros nuages
      const c = alt < 5400 ? '#e8f0ff' : '#c8b8e0', sh = alt < 5400 ? '#b8c8e8' : '#9a88c0', cx = X(6 + hh % 10);
      saBlob(g, sh, cx, wy + 22, 12); saBlob(g, c, cx, wy + 19, 12); saBlob(g, c, cx + (left ? 12 : -12), wy + 23, 8); saBlob(g, c, cx + (left ? -6 : 6), wy + 13, 9);
    }
  }
  const my = Math.round(-7600 * P - sa.cam * P + HUD);  // la lune, tout là-haut
  if (my > -30 && my < H + 30) { saBlob(g, '#f4ecc8', W - 30, my, 15); saBlob(g, '#d8cca0', W - 26, my + 4, 4); saBlob(g, '#d8cca0', W - 36, my - 5, 3); px(g, '#d8cca0', W - 33, my + 7, 2, 2); }
}
function saDraw() {
  const g = sa.g, {W, H, HUD} = SA;
  for (; sa.seen < sa.tick; sa.seen++) if (sa.mode === 'over') sa.dead++;
  g.imageSmoothingEnabled = false;
  // le ciel change avec l'altitude, en six bandes nettes entre deux teintes
  for (let y = HUD; y < H; y += 2) {
    const f = Math.max(0, -(sa.cam + y) / SA.ZONE), z = Math.min(SA_SKY.length - 1, Math.floor(f)), fr = f - z, n = SA_SKY[Math.min(SA_SKY.length - 1, z + 1)];
    px(g, saMix(SA_SKY[z], n, Math.floor(fr * 6) / 6), 0, y, W, 2);
  }
  // étoiles au-dessus du crépuscule, nuages et collines plus bas (ils défilent moins vite : de la profondeur)
  for (let k = Math.floor((sa.cam * .5) / 24) - 1; k < Math.floor((sa.cam * .5 + H) / 24) + 1; k++) {
    const hh = (k * 2654435761 >>> 0) % 1000, wy = k * 24 - sa.cam * .5 + HUD, alt = -k * 48;
    if (alt > SA.ZONE * 2.2) { px(g, (sa.tick + hh) % 90 < 6 ? '#fff8d0' : '#d8d8f8', hh % W, wy, 1, 1); if (hh % 3 === 0) px(g, '#9898c8', (hh * 7) % W, wy + 11, 1, 1); }
    else if (alt > 200 && alt < SA.ZONE * 2 && hh % 3 === 0) { const cx = (hh * 3 + sa.tick * .05) % (W + 40) - 30; px(g, '#a8d4f0', cx, wy, 26, 3); px(g, '#a8d4f0', cx + 5, wy - 3, 12, 3); px(g, '#94c4e8', cx + 2, wy + 3, 22, 1); }
  }
  { const hy = Math.round(-sa.cam * .5 + 62); if (hy - 20 < H) for (let x = 0; x < W; x++) { const t = Math.round(10 + 6 * Math.sin(x / 13) + 4 * Math.sin(x / 5.3)); px(g, '#4a9a5a', x, hy - t, 1, H); px(g, '#6aba6a', x, hy - t, 1, 1); } }
  saSides(g);
  for (const p of sa.plats) if (!p.gone) saPlat(g, p, Math.round(p.x), Math.round(p.y - sa.cam));
  for (const it of sa.items) { const ix = it.x, iy = it.y - sa.cam + Math.round(Math.sin(sa.tick / 12) * 2); if (it.k === 'bug') { const f = (sa.tick >> 2) % 2; px(g, '#e8f4ff', ix + 1, iy - 2 + f, 3, 2); px(g, '#e8f4ff', ix + 5, iy - 2 + f, 3, 2); sprite(g, SA_BUG, ix, iy, SA_BUG_PAL); continue; } sprite(g, ['kkk..kkk', 'kwwkkwwk', 'kwwkkwwk', '.kkbbkk.', '...kbk..', '...kbk..', '....k...'], ix, iy, {k: '#1a2a3a', w: '#d8f4ff', b: '#3ab8e8'}); }
  for (const w of sa.wasps) { const f = (sa.tick >> 2) % 2; sprite(g, w.vx > 0 ? saMirror(SA_WASP[f]) : SA_WASP[f], Math.round(w.x), Math.round(w.y - sa.cam), w.dead ? {...SA_WASP_PAL, y: '#a89a6a'} : SA_WASP_PAL); }
  for (const b of sa.bits) px(g, b.c, b.x, b.y - sa.cam, 2, 2);
  // la sauterelle : pattes tendues en montée, repliées en descente ; ailes de libellule qui battent quand elle vole
  const fall = sa.mode === 'over' ? sa.dead * sa.dead * .04 : 0, rows = sa.vy < -1.5 || sa.wing ? SA_HOP.up : SA_HOP.down, hx = Math.round(sa.x) - 3, hy = Math.round(sa.y - sa.cam - rows.length + fall + (sa.squash > 3 ? 1 : 0));
  if (sa.carry) { const f = (sa.tick >> 1) % 2; px(g, '#e8f4ff', hx + 3, hy - 9 + f, 4, 2); px(g, '#e8f4ff', hx + 9, hy - 9 + f, 4, 2); sprite(g, SA_BUG, hx + 4, hy - 8, SA_BUG_PAL); for (const d of [6, 9]) px(g, '#1a0a0a', hx + d, hy - 1, 1, 2); }  // la coccinelle tient la sauterelle
  const pal = sa.mode === 'over' ? {...SA_HOP_PAL, g: '#a8b88a', G: '#788a5a', D: '#58684a'} : SA_HOP_PAL;
  for (const ox of [0, hx > W - 16 ? -W : hx < 0 ? W : null].filter(v => v !== null)) {
    if (sa.wing) { const up = (sa.tick >> 1) % 2; px(g, '#d8f4ff', hx + ox + 3, hy + (up ? 0 : 4), 9, 2); px(g, '#3ab8e8', hx + ox + 4, hy + (up ? 1 : 5), 7, 1); }
    sprite(g, sa.face > 0 ? rows : saMirror(rows), hx + ox, hy, pal);
  }
  px(g, '#0e0a14', 0, 0, W, HUD);
  const m = Math.floor(sa.maxH / 10); pxFont(g, m + ' m', 4, 9, '#ffffff', 8); pxFont(g, 'record ' + (games.best.sauterelle || 0), W - 4, 9, '#ffd84a', 8, 'right');
  if (sa.wing) { px(g, '#2a2236', 4, HUD + 2, 40, 3); px(g, '#3ab8e8', 4, HUD + 2, Math.round(40 * sa.wing / 150), 3); }
  if (sa.carry) { px(g, '#2a2236', 4, HUD + 2, 40, 3); px(g, '#e83a2a', 4, HUD + 2, Math.round(40 * sa.carry / SA.CARRY), 3); }
  if (sa.mode === 'ready') gameText(g, W, [['SAUTERELLE', '#ffd84a', 12], ['← → : se diriger', '#ffffff'], ['Elle saute toute seule !', '#b0f0a0']], 70);
  if (sa.mode === 'pause') gameText(g, W, [['PAUSE', '#ffd84a', 12], ['Entrée : reprendre', '#b8b0c8']], 80);
  if (sa.mode === 'over' && sa.dead > 30) gameText(g, W, [[sa.why === 'piquée' ? 'PIQUÉE !' : 'TOMBÉE !', '#ff4a3a', 12], [m + ' mètres', '#ffffff'], [sa.record ? 'NOUVEAU RECORD !' : 'Record ' + (games.best.sauterelle || 0) + ' m', '#ffd84a'], [sa.dead > 60 ? 'Espace : rejouer' : '', '#b8b0c8']], 70);
  if (sa.tick % 15 === 0) {  // pour les lecteurs d'écran (et le test) : où est la prochaine feuille sûre
    const nx = saNext(); let where = 'aucune';
    if (nx) { const dx = saWrapDx(sa.x + 5, nx.x + (nx.w || SA.PW) / 2); where = Math.abs(dx) < 6 ? 'au-dessus' : dx < 0 ? 'à gauche' : 'à droite'; }
    g.canvas.setAttribute('aria-label', 'Sauterelle : ' + m + ' mètres' + (sa.mode === 'over' ? ', ' + sa.why : '') + '. Prochaine feuille ' + where + '.');
  }
}
// la feuille à viser : la plus haute où elle peut encore se poser, vu sa vitesse (temps de chute jusqu'à la feuille × vitesse de côté)
function saNext() {
  let pick = null;
  for (const p of sa.plats) {
    if (p.gone || p.t === 'dry' || p.t === 'ground') continue;
    const disc = sa.vy * sa.vy + 2 * SA.G * (p.y - sa.y); if (disc < 0) continue;
    const t = (-sa.vy + Math.sqrt(disc)) / SA.G, dx = Math.abs(saWrapDx(sa.x + 5, p.x + SA.PW / 2)) - SA.PW / 2 + 2;
    if (t < 2 || dx > 2.1 * t) continue;
    if (!pick || p.y < pick.y) pick = p;
  }
  return pick;
}
function saInfo() {
  $('saStats').replaceChildren(...[['Record', (games.best.sauterelle || 0) + ' m'], ['Mètres en tout', sas.total], ['Guêpes écrasées', sas.wasps], ['Parties', sas.games]].flatMap(([a, b]) => [el('span', '', a), el('b', '', String(b))]));
}
document.addEventListener('keydown', e => {
  if (!view.classList.contains('on') || !sa || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
  const k = e.key;
  if (sa.mode === 'over') { if ((k === ' ' || k === 'Enter') && sa.dead > 60) { e.preventDefault(); saNew(); sa.mode = 'play'; } return; }
  if (k === 'p' || k === 'P' || k === 'Escape') { if (sa.mode === 'play') sa.mode = 'pause'; else if (sa.mode === 'pause') sa.mode = 'play'; return; }
  if (k === 'ArrowLeft' || k === 'q' || k === 'a') { e.preventDefault(); sa.keys.add('L'); sa.mode = 'play'; }
  else if (k === 'ArrowRight' || k === 'd') { e.preventDefault(); sa.keys.add('R'); sa.mode = 'play'; }
  else if ((k === ' ' || k === 'Enter') && sa.mode !== 'play') { e.preventDefault(); sa.mode = 'play'; }
});
document.addEventListener('keyup', e => { if (!sa) return; if (['ArrowLeft', 'q', 'a'].includes(e.key)) sa.keys.delete('L'); if (['ArrowRight', 'd'].includes(e.key)) sa.keys.delete('R'); });
{ const cv = $('saCanvas');  // à la souris ou au doigt : appuyer à gauche ou à droite de la sauterelle
  const steer = e => { const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * SA.W; sa.keys.clear(); sa.keys.add(x < sa.x + 5 ? 'L' : 'R'); };
  cv.onpointerdown = e => { e.preventDefault(); if (!sa) return; if (sa.mode === 'over') { if (sa.dead > 60) { saNew(); sa.mode = 'play'; } return; } sa.mode = 'play'; sa.drag = 1; steer(e); cv.setPointerCapture?.(e.pointerId); };
  cv.onpointermove = e => { if (sa?.drag) steer(e); };
  cv.onpointerup = () => { if (sa) { sa.drag = 0; sa.keys.clear(); } }; }
$('saNew').onclick = () => { saNew(); $('saNew').blur(); };
{  // vérification : les feuilles sûres sont toujours à portée de saut ; un joueur automatique monte à 300 m sans guêpes ;
   // une guêpe touchée de côté pique, écrasée par-dessus elle fait rebondir ; une feuille sèche casse ; le champignon envoie plus haut
  const bad = [], keep = sa, keepS = JSON.stringify(sas), keepB = games.best.sauterelle;
  saMute = true; saNoWasp = true;
  sa = null; saNew(); const all = new Set();
  for (let c = sa.cam; c > -40000; c -= 100) { sa.cam = c; saGen(); sa.plats.forEach(p => all.add(p)); }
  const safe = [...all].filter(p => p.t !== 'dry').sort((a, b) => b.y - a.y);
  for (let i = 1; i < safe.length; i++) if (safe[i - 1].y - safe[i].y > 60) bad.push('écart ' + (safe[i - 1].y - safe[i].y) + ' à ' + -safe[i].y);
  for (let run = 0; run < 3; run++) {
    sa = null; saNew(); sa.mode = 'play';
    for (let t = 0; t < 30000 && sa.mode === 'play' && sa.maxH < 3000; t++) {
      const nx = saNext(); sa.keys.clear();
      if (nx) { const dx = saWrapDx(sa.x + 5, nx.x + SA.PW / 2); if (dx > 2) sa.keys.add('R'); else if (dx < -2) sa.keys.add('L'); }
      saUpdate();
    }
    if (sa.maxH < 3000) bad.push('joueur auto bloqué à ' + Math.floor(sa.maxH / 10) + ' m (' + sa.why + ')');
  }
  saNoWasp = false;
  const one = (setup) => { sa = null; saNew(); sa.mode = 'play'; sa.plats = [{x: 0, y: 0, t: 'ground', w: SA.W, vx: 0, used: 0}]; sa.top = -99999; sa.wasps = []; sa.items = []; setup(); };
  one(() => { sa.x = 60; sa.y = -20; sa.vy = 0; sa.wasps.push({x: 59, y: -26, vx: 0, dead: 0}); }); saUpdate(); if (sa.mode !== 'over' || sa.why !== 'piquée') bad.push('guêpe sans effet');
  one(() => { sa.x = 60; sa.y = -30; sa.vy = 3; sa.wasps.push({x: 59, y: -28, vx: 0, dead: 0}); }); saUpdate(); if (sa.mode !== 'play' || !sa.wasps[0].dead || sa.vy >= 0) bad.push('guêpe pas écrasée');
  one(() => { sa.plats.push({x: 50, y: -40, t: 'dry', vx: 0, used: 0}); sa.x = 55; sa.y = -42; sa.vy = 3; }); saUpdate(); if (!sa.plats[1].gone || sa.vy < 0) bad.push('feuille sèche solide');
  one(() => { sa.plats.push({x: 50, y: -40, t: 'leaf', vx: 0, used: 0, spring: true}); sa.x = 56; sa.y = -42; sa.vy = 3; }); saUpdate(); if (sa.vy !== SA.SPRING) bad.push('champignon sans ressort');
  one(() => { sa.x = 60; sa.y = -20; sa.vy = 0; sa.items.push({x: 60, y: -26, k: 'bug'}); }); saUpdate(); { const y0 = sa.y; for (let t = 0; t < 100; t++) saUpdate(); if (!(sa.carry > 0 && y0 - sa.y > 200)) bad.push('coccinelle ' + sa.carry + ' ' + (y0 - sa.y)); for (let t = 0; t < SA.CARRY; t++) saUpdate(); if (sa.carry) bad.push('coccinelle sans fin'); }
  one(() => { sa.y = 50; sa.vy = 5; sa.cam = -SA.H + 24; }); for (let t = 0; t < 60 && sa.mode === 'play'; t++) saUpdate(); if (sa.why !== 'tombée') bad.push('chute pas vue');
  console.assert(!bad.length, 'sauterelle', bad);
  Object.assign(sas, JSON.parse(keepS)); if (keepB === undefined) delete games.best.sauterelle; else games.best.sauterelle = keepB;
  sa = keep; saMute = false;
}
$('saFs').onclick = () => { $('saFs').blur(); try { document.fullscreenElement ? document.exitFullscreen() : $('saCanvas').parentElement.requestFullscreen?.().catch(() => {}); } catch {} };
$('saCanvas').__sa = {st: () => sa};
ctx.onOpen(() => {
  if (!sa || !sa.g) { saNew(); sa.g = $('saCanvas').getContext('2d'); }
  gameLoop(sa, 'sauterelle', saUpdate, saDraw); saInfo();
});
}
