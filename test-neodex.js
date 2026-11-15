// lancé par le test « local » de NeoDex : joue en lisant où est la prochaine feuille (comme un lecteur d'écran) et dirige la sauterelle au clavier ;
// vérifie qu'elle monte, puis la coccinelle, le décor selon l'altitude, le plein écran (avec NEO_SHOTS : garde des images du jeu, sans la teinte du thème)
module.exports = async ({ pj, sleep }) => {
  const ev = (type, k) => pj(`document.dispatchEvent(new KeyboardEvent('${type}', {key: '${k}', bubbles: true})), 0`);
  const label = () => pj(`document.getElementById('saCanvas').getAttribute('aria-label')`);
  const shot = async n => { if (!process.env.NEO_SHOTS) return; const d = await pj(`document.getElementById('saCanvas').toDataURL()`); require('fs').writeFileSync(require('path').join(process.env.NEO_SHOTS, 'sauterelle-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64')); };
  await sleep(500); await shot('0-depart');
  await ev('keydown', ' ');
  let held = null, l = '';
  const hold = async k => { if (held === k) return; if (held) await ev('keyup', held); held = k; if (k) await ev('keydown', k); };
  for (let i = 0; i < 250; i++) {
    l = await label();
    if (/tombée|piquée/.test(l)) break;
    await hold(/feuille à gauche/.test(l) ? 'ArrowLeft' : /feuille à droite/.test(l) ? 'ArrowRight' : null);
    if (i === 30) await shot('1-montee');
    if (i === 150) await shot('2-plus-haut');
    await sleep(60);
  }
  await hold(null); await shot('3-fin');
  const m = /(\d+) mètres/.exec(l = await label());
  if (!m || +m[1] < 20) throw new Error('la sauterelle devait monter : « ' + l + ' »');
  // la coccinelle porte la sauterelle ; le décor change en montant (herbes, arbres, nuages, lune) ; plein écran et place prise
  await pj(`window.__e = []; addEventListener('error', e => __e.push(e.message)); 0`);
  const S = code => pj(`(() => { const sa = document.getElementById('saCanvas').__sa.st(); ${code} })()`);
  await pj(`document.getElementById('saNew').click(), 0`); await sleep(200); await ev('keydown', ' '); await ev('keyup', ' ');
  await S(`sa.mode = 'play'; sa.items.push({x: sa.x, y: sa.y - 8, k: 'bug'}); return 0;`); await sleep(400);
  const carry = await S(`return sa.carry;`); if (!(carry > 0)) throw new Error('la coccinelle ne porte pas');
  await shot('4-coccinelle');
  for (const alt of [1000, 3000, 5200, 7600]) { await S(`sa.y = -${alt} + 60; sa.cam = sa.y - 96; sa.top = sa.y; sa.maxH = -sa.y; sa.carry = 999; sa.wasps = []; return 0;`); await sleep(500); await shot('5-' + alt); }
  await pj(`document.getElementById('saFs').click(), 0`); await sleep(700);
  const fs = await pj(`(() => { const c = document.getElementById('saCanvas'), r = c.getBoundingClientRect(); return document.fullscreenElement === c.parentElement && (Math.abs(r.height - innerHeight) < 3 || Math.abs(r.width - innerWidth) < 3); })()`);
  await pj(`document.fullscreenElement && document.exitFullscreen(), 0`); await sleep(300);
  if (!fs) throw new Error('le plein écran ne remplit pas l’écran');
  const L = await pj(`(() => { const r = document.getElementById('saCanvas').getBoundingClientRect(); let s = 0; for (let e = document.getElementById('saCanvas').parentElement; e; e = e.parentElement) s += e.scrollTop; return { bottom: Math.round(r.bottom + s), h: Math.round(r.height), wh: innerHeight, ww: innerWidth, sw: document.documentElement.scrollWidth }; })()`);
  if (L.bottom > L.wh + 1 || L.sw > L.ww + 1 || L.h < 300) throw new Error('le jeu dépasse la fenêtre ou reste petit : ' + JSON.stringify(L));
  const errs = await pj(`window.__e.join(' | ')`); if (errs) throw new Error('erreur : ' + errs);
  return l + ' · coccinelle · décors · plein écran · ' + L.h + ' px dans ' + L.ww + '×' + L.wh;
};
