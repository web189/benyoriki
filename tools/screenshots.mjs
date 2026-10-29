// Ambil screenshot ASLI semua website di portofolio -> img/porto/<slug>.webp
// Jalankan lokal :  npm i playwright sharp && npx playwright install chromium && node tools/screenshots.mjs
// Satu proyek saja:  node tools/screenshots.mjs --only gym
// Atau otomatis lewat GitHub Actions (tab Actions > "Update screenshots portofolio" > Run workflow).
import { chromium } from 'playwright';
import sharp from 'sharp';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const projects = JSON.parse(readFileSync(join(root, 'tools/projects.json'), 'utf8')).filter(p => !only || p.slug === only);
mkdirSync(join(root, 'img/porto'), { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, locale: 'id-ID' });
let ok = 0, fail = [];
for (const p of projects) {
  const page = await ctx.newPage();
  try {
    await page.goto(p.url, { waitUntil: 'load', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(2500); // beri waktu splash/animasi masuk selesai
    const png = await page.screenshot({ type: 'png' });
    const webp = await sharp(png).resize(800, 500, { fit: 'cover', position: 'top' }).webp({ quality: 78 }).toBuffer();
    writeFileSync(join(root, 'img/porto', p.slug + '.webp'), webp);
    console.log('OK  ', p.slug, Math.round(webp.length / 1024) + ' KB'); ok++;
  } catch (e) { console.log('GAGAL', p.slug, e.message.split('\n')[0]); fail.push(p.slug); }
  await page.close();
}
await browser.close();
console.log(`\nSelesai: ${ok} berhasil, ${fail.length} gagal ${fail.join(', ')}`);
