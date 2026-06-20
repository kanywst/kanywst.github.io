#!/usr/bin/env node
// Refresh the live parts of src/data/profile.json (stars, versions, upstream PRs)
// while preserving all curated fields (taglines, ordering, featured, blurbs, domains).
//
// Usage:  node scripts/sync-profile.mjs        # requires `gh` authenticated
//
// Curation lives in profile.json and is the source of truth for WHAT to show;
// this script only updates HOW MANY / WHICH VERSION / current PR state.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(here, '../src/data/profile.json');

const GH_TIMEOUT_MS = 20_000;
const GH_MAX_BUFFER = 5 * 1024 * 1024;

function gh(args) {
  return execFileSync('gh', args, {
    encoding: 'utf8',
    timeout: GH_TIMEOUT_MS,
    maxBuffer: GH_MAX_BUFFER,
  });
}

function ghJSON(args) {
  return JSON.parse(gh(args));
}

const profile = JSON.parse(readFileSync(FILE, 'utf8'));

// --- flagships: stars + latest release tag ---
for (const repo of profile.flagships) {
  const slug = `${repo.owner}/${repo.name}`;
  try {
    const { stargazerCount } = ghJSON(['repo', 'view', slug, '--json', 'stargazerCount']);
    repo.stars = stargazerCount;
  } catch {
    console.warn(`! stars unavailable for ${slug}`);
  }
  try {
    const tag = gh(['release', 'view', '-R', slug, '--json', 'tagName', '-q', '.tagName']).trim();
    if (tag) repo.version = tag;
  } catch {
    /* no releases — keep whatever curation set (often null) */
  }
}

// --- contributions: external PRs authored by kanywst ---
const own = /^(kanywst|0-draft)\//;
const domainByUrl = Object.fromEntries(profile.contributions.map((c) => [c.url, c.domain]));

const prs = ghJSON([
  'search',
  'prs',
  '--author=kanywst',
  '--limit',
  '100',
  '--json',
  'repository,title,state,number,url,createdAt',
])
  .filter((p) => !own.test(p.repository.nameWithOwner))
  .map((p) => {
    const [owner, repo] = p.repository.nameWithOwner.split('/');
    return {
      owner,
      repo,
      number: p.number,
      state: p.state.toLowerCase(),
      domain: domainByUrl[p.url] ?? '',
      title: p.title,
      url: p.url,
      _date: p.createdAt,
    };
  })
  // merged first, then most-recent
  .sort((a, b) => {
    const am = a.state === 'merged' ? 0 : 1;
    const bm = b.state === 'merged' ? 0 : 1;
    return am - bm || b._date.localeCompare(a._date);
  })
  .map(({ _date, ...c }) => c);

// Abort rather than bump syncedAt with possibly-stale data if the fetch came back empty
// (kanywst always has external PRs now; an empty result means gh hiccuped).
if (!prs.length) {
  throw new Error('No upstream PRs returned; aborting to avoid stale sync metadata.');
}
profile.contributions = prs;

profile.meta.syncedAt = new Date().toISOString().slice(0, 10);

writeFileSync(FILE, JSON.stringify(profile, null, 2) + '\n');

const merged = profile.contributions.filter((c) => c.state === 'merged').length;
console.log(
  `synced ${profile.meta.syncedAt}: ${profile.flagships.length} flagships, ` +
    `${profile.contributions.length} upstream PRs (${merged} merged)`,
);
console.log('! review domain tags for any newly-added PRs (default is empty)');
