#!/usr/bin/env node
// Refresh the live parts of src/data/profile.json (selected work, upstream PRs, issues)
// while preserving the curated blurbs (0-draft, profile).
//
// Usage:  node scripts/sync-profile.mjs        # requires `gh` authenticated
//
// The *selected work* list is discovered, not hand-picked: every public, non-fork,
// non-archived kanywst repo with at least one star, ranked by stars. TAGLINE_BY_REPO /
// LANG_BY_REPO only refine how a discovered repo reads.
//
// Domain tags are assigned from DOMAIN_BY_REPO below (stable, repo-keyed) so re-syncs
// never lose them and new contributions get tagged automatically.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { DOMAIN_BY_REPO } from './domains.mjs';
import { LANG_BY_REPO, TAGLINE_BY_REPO } from './taglines.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(here, '../src/data/profile.json');

const GH_TIMEOUT_MS = 20_000;
const GH_MAX_BUFFER = 5 * 1024 * 1024;

const own = /^(kanywst|0-draft)\//;

// Items that exist upstream but don't belong in the showcase. kgateway#14625 is a
// duplicate of #14624 that a `gh issue create` retry opened; it was closed minutes later.
const EXCLUDE = new Set(['kgateway-dev/kgateway#14625']);

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

// Normalize a release tag for display: "omega-0.0.2" → "v0.0.2", "v0.12.0" → "v0.12.0".
function normalizeVersion(tag) {
  const m = tag.match(/v?\d+\.\d+\.\d+[\w.-]*/);
  if (!m) return tag;
  return m[0].startsWith('v') ? m[0] : `v${m[0]}`;
}

// kanywst opens hundreds of self-PRs (agent loops, ~450 total). A low --limit returns
// only the most-recent items, swamped by self-PRs, silently hiding older EXTERNAL ones.
// 1000 covers the current volume; if exceeded this needs real pagination.
const LIMIT = '1000';

function fetchExternal(kind /* 'prs' | 'issues' */) {
  const args = ['search', kind, '--author=kanywst', '--limit', LIMIT, '--json',
    'repository,title,state,number,url,createdAt'];
  if (kind === 'issues') args.push('--include-prs=false');
  return ghJSON(args)
    // guard against unexpected shapes, then keep external repos only
    .filter((x) => x?.repository?.nameWithOwner && !own.test(x.repository.nameWithOwner))
    .filter((x) => !EXCLUDE.has(`${x.repository.nameWithOwner}#${x.number}`))
    .map((x) => {
      const [owner, repo] = x.repository.nameWithOwner.split('/');
      return {
        owner,
        repo,
        number: x.number,
        state: x.state.toLowerCase(),
        domain: DOMAIN_BY_REPO[x.repository.nameWithOwner] ?? '',
        title: x.title,
        url: x.url,
        _date: x.createdAt,
      };
    })
    // resolved/landed first (merged|closed-issue), then most recent
    .sort((a, b) => {
      const rank = (s) => (s === 'merged' ? 0 : s === 'open' ? 1 : 2);
      return rank(a.state) - rank(b.state) || b._date.localeCompare(a._date);
    })
    .map(({ _date, ...rest }) => rest);
}

const profile = JSON.parse(readFileSync(FILE, 'utf8'));

// --- selected work: every own repo people actually starred, ranked by stars ---
// Stars are the whole selection rule. No manual list, no `featured` flag: a repo that
// earns its first star joins the showcase on the next sync and one that never does
// stays out, so the section can't quietly drift out of date.
// filled by fetchFlagships so the override audit below can tell "not starred yet" (fine,
// the override is just waiting) from "no such repo" (a rename that silently dropped a
// hand-written tagline)
let allOwnRepoNames = new Set();

function fetchFlagships() {
  const all = ghJSON([
    'repo', 'list', 'kanywst', '--limit', '300', '--no-archived', '--source',
    '--visibility', 'public', '--json',
    'name,description,stargazerCount,primaryLanguage,url',
  ]);
  allOwnRepoNames = new Set(all.map((r) => r.name));

  const repos = all
    .filter((r) => r.stargazerCount > 0)
    // stars desc; name asc only to keep ties deterministic across syncs
    .sort((a, b) => b.stargazerCount - a.stargazerCount || a.name.localeCompare(b.name));

  // `gh release view` exits non-zero both for "this repo has no releases" and for a rate
  // limit or a network hiccup, and the two are not reliably distinguishable. The old loop
  // mutated existing entries so a flaky call simply left the version alone; this one builds
  // each entry from scratch, so without a fallback one bad call would write null over a
  // real version. Carrying the last known value forward means a repo that genuinely deletes
  // its releases keeps a stale version until someone notices — the cheaper of the two
  // wrong answers, and the same trade the PR/issue guards below make.
  const knownVersion = new Map((profile.flagships ?? []).map((f) => [f.name, f.version]));

  return repos.map((r) => {
    let version = null;
    try {
      const tag = gh([
        'release', 'view', '-R', `kanywst/${r.name}`, '--json', 'tagName', '-q', '.tagName',
      ]).trim();
      if (tag) version = normalizeVersion(tag);
    } catch {
      version = knownVersion.get(r.name) ?? null;
    }
    return {
      name: r.name,
      owner: 'kanywst',
      lang: LANG_BY_REPO[r.name] ?? r.primaryLanguage?.name ?? '',
      version,
      stars: r.stargazerCount,
      // no `license`: it was curated per-repo but never rendered anywhere in the UI, and
      // `gh repo list` only exposes a licence key/name, not the SPDX id the old field held.
      // Dropped deliberately rather than carried as a field nothing reads.
      tagline: TAGLINE_BY_REPO[r.name] ?? r.description ?? '',
      url: r.url,
    };
  });
}

// Keep the previous list rather than blanking the section if gh returns nothing.
const flagships = fetchFlagships();
if (flagships.length) profile.flagships = flagships;
else console.warn('! no starred repos returned; keeping the previous selected work');

// --- external PRs (all states; UI filters closed) and issues ---
const prs = fetchExternal('prs');
const issues = fetchExternal('issues');

// Abort rather than bump syncedAt with possibly-stale data if the fetch came back empty
// (kanywst always has external PRs now; an empty result means gh hiccuped).
if (!prs.length) {
  throw new Error('No upstream PRs returned; aborting to avoid stale sync metadata.');
}
profile.contributions = prs;
// don't wipe a real issue list if the issues fetch came back empty (gh hiccup)
profile.issues = issues.length ? issues : (profile.issues ?? []);
profile.meta ??= {};
profile.meta.syncedAt = new Date().toISOString().slice(0, 10);

writeFileSync(FILE, JSON.stringify(profile, null, 2) + '\n');

const by = (arr, s) => arr.filter((c) => c.state === s).length;
console.log(
  `synced ${profile.meta.syncedAt}: ${profile.flagships.length} starred repos ` +
    `(top: ${profile.flagships.map((f) => `${f.name} ★${f.stars}`).slice(0, 3).join(', ')}), ` +
    `PRs ${prs.length} (${by(prs, 'merged')} merged / ${by(prs, 'open')} open / ${by(prs, 'closed')} closed), ` +
    `issues ${issues.length}`,
);
const untagged = [...prs, ...issues].filter((c) => !c.domain);
if (untagged.length) {
  console.log(`! ${untagged.length} untagged, add their repos to DOMAIN_BY_REPO:`);
  for (const c of untagged) console.log(`    ${c.owner}/${c.repo}`);
}

// The overrides are keyed by repo name, so a rename makes one stop matching and the repo
// silently falls back to its GitHub description — a hand-written tagline would disappear
// with nothing to notice it. Only the "no such repo" case is a problem worth printing: an
// override on a repo that simply hasn't earned a star yet is doing exactly what it should,
// and a warning that fires every single run is a warning nobody reads.
const overrides = new Set([...Object.keys(TAGLINE_BY_REPO), ...Object.keys(LANG_BY_REPO)]);
const orphaned = [...overrides].filter((name) => !allOwnRepoNames.has(name));
if (orphaned.length) {
  console.log(`! ${orphaned.length} override(s) in taglines.mjs name a repo that no longer exists:`);
  for (const name of orphaned) console.log(`    ${name} (renamed or deleted — the tagline is dead)`);
}
