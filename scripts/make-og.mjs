#!/usr/bin/env node
// Render scripts/og-card.html at 1200x630 and write public/og.png.
//
// Usage:  node scripts/make-og.mjs        # needs playwright's chromium
//
// The numbers in the card come from profile.json, so the social preview stays honest after
// a sync instead of drifting from what the page says. Re-run after a sync that changes the
// headline counts, and commit the PNG — the build does NOT regenerate it.

import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const profile = JSON.parse(readFileSync(resolve(here, '../src/data/profile.json'), 'utf8'));

const stats = [
  { n: profile.flagships.reduce((s, f) => s + f.stars, 0), k: 'stars', tone: 'amber' },
  { n: profile.contributions.filter((c) => c.state === 'merged').length, k: 'merged upstream', tone: 'teal' },
  { n: profile.advisories.length, k: 'advisories', tone: '' },
  { n: profile.issues.length, k: 'issues filed', tone: '' },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

await page.goto(pathToFileURL(resolve(here, 'og-card.html')).href, { waitUntil: 'networkidle' });
await page.evaluate((rows) => {
  document.getElementById('stats').innerHTML = rows
    .map(
      (r) =>
        `<div class="stat"><div class="n ${r.tone}">${r.n}</div><div class="k">${r.k}</div></div>`,
    )
    .join('');
}, stats);
await page.evaluate(() => document.fonts.ready);

const out = resolve(here, '../public/og.png');
await page.screenshot({ path: out, type: 'png' });
await browser.close();

console.log(`wrote ${out}`);
console.log(stats.map((s) => `${s.n} ${s.k}`).join(' · '));
