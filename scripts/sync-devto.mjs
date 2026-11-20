#!/usr/bin/env node
// Refresh the *writing* section of src/data/profile.json from the public dev.to (Forem) API.
//
// Usage:  node scripts/sync-devto.mjs        # no auth; reads /api/articles?username=…
//
// Best-effort by design: dev.to being down or slow must not cost the day's GitHub sync, so any
// failure keeps the previous list, prints a warning, and exits 0. An empty answer is treated
// the same way (an account with articles doesn't go to zero overnight).

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { recordHistory, seedFirstSeen } from './history.mjs';
import { writingRows } from './sync-lib.mjs';

const FILE = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/profile.json');
const USER = 'kanywst';
const PER_PAGE = 100;
const MAX_PAGES = 20;

async function fetchAll() {
  const all = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `https://dev.to/api/articles?username=${USER}&per_page=${PER_PAGE}&page=${page}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
    const batch = await res.json();
    if (!Array.isArray(batch)) throw new Error(`${url} → not an array`);
    all.push(...batch);
    if (batch.length < PER_PAGE) return all;
  }
  throw new Error(`more than ${MAX_PAGES * PER_PAGE} articles; raise MAX_PAGES`);
}

const profile = JSON.parse(readFileSync(FILE, 'utf8'));
let rows;
try {
  rows = writingRows(await fetchAll());
} catch (err) {
  console.warn(`! dev.to fetch failed, keeping the previous writing list: ${err.message}`);
  process.exit(0);
}
const prev = profile.writing?.length ?? 0;
// same shrink guard as the 0-draft list: a short 200 (a degraded or cached page) would
// otherwise cut the section, its count and the feed down to a handful of articles
if (!rows.length || rows.length < prev / 2) {
  const msg = `dev.to returned ${rows.length} articles (had ${prev}); keeping the previous writing list`;
  console.warn(`! ${msg}`);
  // an Actions annotation, so a guard that keeps tripping shows on the run summary
  if (process.env.GITHUB_ACTIONS) console.log(`::warning title=sync-devto::${msg}`);
  process.exit(0);
}

profile.writing = rows;
writeFileSync(FILE, JSON.stringify(profile, null, 2) + '\n');
// an article is "new" from the day it was published, not the day this script first ran
seedFirstSeen(Object.fromEntries(rows.map((r) => [r.url, r.date])));
recordHistory(profile);
console.log(`synced writing: ${rows.length} articles (latest ${rows[0].date}: ${rows[0].title})`);
