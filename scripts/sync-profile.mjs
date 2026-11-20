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
import {
  LANG_BY_REPO,
  ORG_BLURB_BY_REPO,
  ORG_EXCLUDE,
  ORG_LANG_BY_REPO,
  TAGLINE_BY_REPO,
} from './taglines.mjs';
import { recordHistory } from './history.mjs';
import { normalizeVersion, orgRows, upstreamRows } from './sync-lib.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(here, '../src/data/profile.json');

const GH_TIMEOUT_MS = 20_000;
const GH_MAX_BUFFER = 5 * 1024 * 1024;

const OWN_OWNERS = ['kanywst', '0-draft'];
const isOwn = (nameWithOwner) => OWN_OWNERS.includes(nameWithOwner.split('/')[0]);

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


// kanywst opens hundreds of self-PRs (agent loops). Search returns at most 1000 results,
// so own repos are excluded in the query (fetchExternal) and the limit only has to cover
// external items.
const LIMIT = '1000';

function fetchExternal(kind /* 'prs' | 'issues' */) {
  // Exclude own repos in the query itself: search caps at 1000 results, and self-PRs
  // alone passed that, so a client-side filter silently dropped the oldest external PRs.
  const args = ['search', kind, '--author=kanywst', '--limit', LIMIT, '--json',
    'repository,title,state,number,url,createdAt,closedAt'];
  if (kind === 'issues') args.push('--include-prs=false');
  // `--` keeps gh from parsing the leading '-' as a flag; every flag must come before it
  args.push('--', ...OWN_OWNERS.map((o) => `-user:${o}`));
  const rows = ghJSON(args);
  // at the cap the oldest items are already gone; fail instead of writing a short list
  if (rows.length >= Number(LIMIT)) {
    throw new Error(`gh search ${kind} hit the ${LIMIT}-result cap; results are truncated`);
  }
  return upstreamRows(rows, { isOwn, exclude: EXCLUDE, domains: DOMAIN_BY_REPO });
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

// --- 0-draft: every public, non-fork, non-archived repo, newest first ---
// This list used to be hand-written and went stale: two of its three cards pointed at repos
// that had since been archived. Discovering it the way selected work is discovered keeps it
// honest; the org blurb and url above it stay curated.
const ORG_LIMIT = 300;

function fetchOrgRepos() {
  const all = ghJSON([
    'repo', 'list', '0-draft', '--limit', String(ORG_LIMIT), '--no-archived', '--source',
    '--visibility', 'public', '--json', 'name,description,primaryLanguage,url,createdAt',
  ]);
  // at the cap the list is truncated without a word from gh; same rule as the PR search
  if (all.length >= ORG_LIMIT) throw new Error(`gh repo list 0-draft hit the ${ORG_LIMIT} cap`);
  return orgRows(all, { exclude: ORG_EXCLUDE, blurbs: ORG_BLURB_BY_REPO, langs: ORG_LANG_BY_REPO });
}

const orgRepos = fetchOrgRepos();
const prevOrg = profile.org.repos?.length ?? 0;
// a sharp drop is far likelier a degraded fetch than half the org archived overnight; keep
// the last good list and say so, the same trade the empty-PR guard makes
if (!orgRepos.length) console.warn('! no 0-draft repos returned; keeping the previous list');
else if (orgRepos.length < prevOrg / 2)
  console.warn(`! 0-draft repos fell from ${prevOrg} to ${orgRepos.length}; keeping the previous list`);
else profile.org.repos = orgRepos;

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
// first-seen dates + star log behind the "new" / "+N ★" marks (src/data/history.json)
recordHistory(profile, profile.meta.syncedAt);

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
const orphanedOrg = [...Object.keys(ORG_BLURB_BY_REPO), ...Object.keys(ORG_LANG_BY_REPO)].filter((n) => !orgRepos.some((r) => r.name === n));
if (orphanedOrg.length) console.log(`! ORG_BLURB_BY_REPO names repos not in 0-draft: ${orphanedOrg.join(', ')}`);
const orphaned = [...overrides].filter((name) => !allOwnRepoNames.has(name));
if (orphaned.length) {
  console.log(`! ${orphaned.length} override(s) in taglines.mjs name a repo that no longer exists:`);
  for (const name of orphaned) console.log(`    ${name} (renamed or deleted — the tagline is dead)`);
}
