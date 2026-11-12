// lancé par le test « local » de NeoDex : joue en lisant où est la prochaine feuille (comme un lecteur d'écran) et dirige la sauterelle au clavier ;
// vérifie qu'elle monte (avec NEO_SHOTS : garde des images du jeu, sans la teinte du thème)
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
  return l;
};
