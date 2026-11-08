// Builds the playable single-page game: dist/index.html
// Usage: node build.mjs
import fs from 'node:fs';
const order = JSON.parse(fs.readFileSync('src/_order.json', 'utf8'));
const mime = { png: 'image/png', webp: 'image/webp' };
let js = order.map(f => fs.readFileSync(f, 'utf8')).join('');
// Data files become globals the game reads
const data = {};
for (const f of fs.existsSync('data') ? fs.readdirSync('data') : []) {
  if (f.endsWith('.json')) data[f.replace('.json', '')] = JSON.parse(fs.readFileSync('data/' + f, 'utf8'));
}
js = js.replace('/*@@DATA@@*/', 'const DATA=' + JSON.stringify(data) + ';');
// Inline every asset so the page has no outside files to lose
// catch typos before they ship: the game must at least parse
try { new Function(js.replace(/__ASSET\(([^)]+)\)__/g, 'A')); } catch (e) { console.error('BUILD STOPPED - code error: ' + e.message); process.exit(1); }
js = js.replace(/__ASSET\(([^)]+)\)__/g, (_, p) => {
  const ext = p.split('.').pop();
  return `data:${mime[ext]};base64,` + fs.readFileSync('assets/' + p).toString('base64');
});
// third-party libraries (vendor/*.js) go in before the game, e.g. PeerJS for online play
const vendor = fs.existsSync('vendor') ? fs.readdirSync('vendor').filter(f => f.endsWith('.js')).sort().map(f => '<script>' + fs.readFileSync('vendor/' + f, 'utf8') + '</script>').join('') : '';
const page = fs.readFileSync('src/page_head.html', 'utf8') + vendor + '<script>' + js + '</script>' + fs.readFileSync('src/page_tail.html', 'utf8');
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/index.html', page);
for (const f of ['manifest.json', 'icon-192.png', 'icon-512.png']) if (fs.existsSync('public/' + f)) fs.copyFileSync('public/' + f, 'dist/' + f);
console.log('built dist/index.html', (page.length / 1024 / 1024).toFixed(2), 'MB');
