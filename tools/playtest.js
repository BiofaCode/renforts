// Partie de test automatique : lance index.html dans Chromium (sans écran), joue avec un pilote
// simple, prend des captures et liste les erreurs JavaScript.
//
// Utilisation (depuis la racine du projet) :
//   NODE_PATH=$(npm root -g) node tools/playtest.js [options]
// Options :
//   --level N        opération à jouer (défaut 1)
//   --save '{...}'   sauvegarde JSON injectée (fusionnée avec level)
//   --seconds S      durée max de la partie en secondes réelles (défaut 90)
//   --every MS       intervalle entre deux captures (défaut 4000, 0 = aucune)
//   --out DIR        dossier des captures (défaut /tmp/renforts-shots)
//   --size WxH       taille d'écran (défaut 390x844, téléphone)
//   --menu-only      capture le menu puis s'arrête
//   --no-play        ne clique pas sur « Lancer l'opération »
// Le pilote choisit la porte qui donne le plus de soldats (window.__renforts.nextGate()).
// Sortie : une ligne JSON par seconde environ, puis "ERRORS [...]".
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : def; };
const flag = (name) => args.includes('--' + name);
const ROOT = path.resolve(__dirname, '..');
const LEVEL = +opt('level', 1);
const SAVE = Object.assign({ level: LEVEL, medals: 0, recruit: 0, seen: { intro: 1, crate: 1, mines: 1, barricade: 1, boss2: 1, squad: 1, nest: 1, tank: 1, movegate: 1 } }, JSON.parse(opt('save', '{}')));
const SECONDS = +opt('seconds', 90);
const EVERY = +opt('every', 4000);
const OUT = opt('out', '/tmp/renforts-shots');
const [W, H] = opt('size', '390x844').split('x').map(Number);
const FONTS = '/home/user/.renforts-test/@fontsource';
fs.mkdirSync(OUT, { recursive: true });

const body = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0}[hidden]{display:none!important}</style></head><body>' + body + '</body></html>';
const fontCss = '@font-face{font-family:"Black Ops One";src:url(/f/bo.woff2)}@font-face{font-family:"Chakra Petch";font-weight:500;src:url(/f/cp5.woff2)}@font-face{font-family:"Chakra Petch";font-weight:700;src:url(/f/cp7.woff2)}';
const fontFiles = {
  '/f/bo.woff2': FONTS + '/black-ops-one/files/black-ops-one-latin-400-normal.woff2',
  '/f/cp5.woff2': FONTS + '/chakra-petch/files/chakra-petch-latin-500-normal.woff2',
  '/f/cp7.woff2': FONTS + '/chakra-petch/files/chakra-petch-latin-700-normal.woff2'
};
const srv = http.createServer((q, r) => {
  const u = q.url.split('?')[0];
  if (u === '/') { r.writeHead(200, { 'content-type': 'text/html' }); return r.end(html); }
  if (fontFiles[u] && fs.existsSync(fontFiles[u])) { r.writeHead(200, { 'content-type': 'font/woff2' }); return fs.createReadStream(fontFiles[u]).pipe(r); }
  const f = path.join(ROOT, u);
  if (f.startsWith(ROOT) && fs.existsSync(f) && fs.statSync(f).isFile()) { r.writeHead(200); return fs.createReadStream(f).pipe(r); }
  r.writeHead(404); r.end();
}).listen(0);

(async () => {
  const port = srv.address().port;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1.5 });
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.route('**/*', (r) => {
    const u = r.request().url();
    if (u.includes('cdnjs.cloudflare.com/ajax/libs/three.js')) return r.fulfill({ path: path.join(ROOT, 'vendor/three.min.js'), contentType: 'application/javascript' });
    if (u.startsWith('https://fonts.googleapis.com/')) return r.fulfill({ body: fontCss, contentType: 'text/css' });
    if (u.startsWith('http://127.0.0.1:' + port)) return r.continue();
    return r.abort();
  });
  await page.addInitScript((s) => { try { localStorage.setItem('renforts.save', JSON.stringify(s)); } catch (e) {} }, SAVE);
  await page.goto('http://127.0.0.1:' + port + '/');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(OUT, 'menu.png') });
  if (flag('menu-only')) { console.log('ERRORS', JSON.stringify(errors)); await browser.close(); srv.close(); return; }
  if (!flag('no-play')) await page.click('#playBtn').catch((e) => errors.push('playBtn: ' + e.message));
  const t0 = Date.now();
  let lastShot = 0, n = 0, lastLog = 0;
  while (Date.now() - t0 < SECONDS * 1000) {
    const st = await page.evaluate(() => {
      const g = window.__renforts; if (!g) return { s: 'nohook' };
      const x = g.nextGate && g.nextGate();
      const ap = (c, o) => o.op === '+' ? c + o.v : o.op === '-' ? c - o.v : o.op === 'x' ? c * o.v : Math.floor(c / o.v);
      if (x && x.d - g.d < 40) g.steer(ap(g.count, x.opts[0]) >= ap(g.count, x.opts[1]) ? -2.8 : 2.8);
      return { s: g.state, c: g.count, d: Math.round(g.d), f: Math.round(g.finalD) };
    });
    if (Date.now() - lastLog > 1000) { lastLog = Date.now(); console.log(JSON.stringify(st)); }
    if (EVERY > 0 && Date.now() - lastShot > EVERY) { lastShot = Date.now(); await page.screenshot({ path: path.join(OUT, String(n++).padStart(3, '0') + '-' + st.s + '.png') }); }
    if (st.s === 'done' || st.s === 'nohook') { await page.waitForTimeout(1500); break; }
    await page.waitForTimeout(250);
  }
  await page.screenshot({ path: path.join(OUT, 'end.png') });
  console.log('ERRORS', JSON.stringify(errors));
  await browser.close();
  srv.close();
})();
