// Ambil screenshot ASLI dari URL live setiap proyek -> img/porto/<slug>.webp + img/porto/status.json
//   • live:true di status.json hanya jika halaman benar-benar terbuka (HTTP < 400) dan hasilnya bukan gambar kosong.
//   • Jika gagal, screenshot lama TIDAK ditimpa/dihapus dan kartu tidak mendapat badge LIVE.
// Lokal :  npm i playwright sharp && npx playwright install chromium && node tools/screenshots.mjs [--only gym]
// Otomatis: GitHub > Actions > "Update screenshots portofolio" > Run workflow.
import { chromium } from 'playwright';
import sharp from 'sharp';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'img/porto'); mkdirSync(outDir, { recursive: true });
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const all = JSON.parse(readFileSync(join(root, 'tools/projects.json'), 'utf8'));
const statusFile = join(outDir, 'status.json');
const status = existsSync(statusFile) ? JSON.parse(readFileSync(statusFile, 'utf8')) : { projects: {} };
status.note = 'live=true hanya jika screenshot diambil dari URL live oleh tools/screenshots.mjs (HTTP < 400). source=repo: dirender dari kode repo, belum memverifikasi website live.';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'id-ID' });
const failed = [];
for (const p of all.filter(p => !only || p.slug === only)) {
  const page = await ctx.newPage();
  const prev = status.projects[p.slug] || {};
  try {
    const res = await page.goto(p.url, { waitUntil: 'load', timeout: 30000 });
    const code = res ? res.status() : 0;
    if (code >= 400 || !code) throw new Error('HTTP ' + code);
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(9000); // tunggu splash / preloader selesai
    const png = await page.screenshot({ type: 'png' });
    const small = sharp(png).resize(800, 500, { fit: 'cover', position: 'top' });
    const { channels } = await small.clone().stats();
    if (channels.every(c => c.stdev < 6)) throw new Error('halaman tampak kosong (stdev rendah)');
    const webp = await small.webp({ quality: 76 }).toBuffer();
    writeFileSync(join(outDir, p.slug + '.webp'), webp);
    status.projects[p.slug] = { shot: true, live: true, source: 'live', http: code, checkedAt: new Date().toISOString().slice(0, 10) };
    console.log('OK   ', p.slug.padEnd(18), Math.round(webp.length / 1024) + ' KB');
  } catch (e) {
    failed.push(p.slug);
    status.projects[p.slug] = { ...prev, shot: !!prev.shot, live: false, error: e.message.split('\n')[0].slice(0, 120), checkedAt: new Date().toISOString().slice(0, 10) };
    console.log('GAGAL', p.slug.padEnd(18), e.message.split('\n')[0]);
  }
  await page.close();
}
await browser.close();
writeFileSync(statusFile, JSON.stringify(status, null, 1));
console.log(`\nSelesai: ${all.length - failed.length} berhasil${failed.length ? ', gagal: ' + failed.join(', ') : ''}`);
