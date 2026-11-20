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
// Held like the sync-profile guards: warned, annotated on the run summary, and recorded in
// meta.kept. syncedAt is left alone — it dates the GitHub lists, which this script doesn't own.
function hold(why) {
  const msg = `writing: ${why}; keeping the previous list`;
  console.warn(`! ${msg}`);
  if (process.env.GITHUB_ACTIONS) console.log(`::warning title=sync-devto::${msg}`);
  profile.meta ??= {};
  profile.meta.kept = [...new Set([...(profile.meta.kept ?? []), 'writing'])];
  writeFileSync(FILE, JSON.stringify(profile, null, 2) + '\n');
  process.exit(0);
}

let rows;
try {
  rows = writingRows(await fetchAll());
} catch (err) {
  hold(`dev.to fetch failed (${err.message})`);
}
const prev = profile.writing?.length ?? 0;
// Same shrink guard as the 0-draft list, with the same 10-row floor: a short 200 (a degraded
// or cached page) would otherwise cut the section, its count and the feed to a handful.
// FORCE_WRITING=1 (force_writing workflow input) accepts a real drop, including to zero.
if (!process.env.FORCE_WRITING && prev >= 10 && (!rows.length || rows.length < prev / 2))
  hold(`dev.to returned ${rows.length} articles, had ${prev} (FORCE_WRITING=1 to accept)`);
if (!rows.length && !prev) process.exit(0);

profile.writing = rows;
writeFileSync(FILE, JSON.stringify(profile, null, 2) + '\n');
// an article is "new" from the day it was published, not the day this script first ran
seedFirstSeen(Object.fromEntries(rows.map((r) => [r.url, r.date])));
recordHistory(profile);
console.log(`synced writing: ${rows.length} articles (latest ${rows[0].date}: ${rows[0].title})`);
