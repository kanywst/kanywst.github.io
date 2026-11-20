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
import { DOMAIN_BY_REPO, LISTING, LISTING_REPOS } from './domains.mjs';
import {
  LANG_BY_REPO,
  ORG_BLURB_BY_REPO,
  ORG_EXCLUDE,
  ORG_LANG_BY_REPO,
  TAGLINE_BY_REPO,
} from './taglines.mjs';
import { recordHistory, seedFirstSeen } from './history.mjs';
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

// Degrades instead of throwing: 0-draft being unavailable must not take the day's PR and
// issue refresh down with it. Returns null on any failure (the cap included — a truncated
// list is exactly what not to write), and the caller keeps the previous list.
function fetchOrgRepos() {
  let all;
  try {
    all = ghJSON([
      'repo', 'list', '0-draft', '--limit', String(ORG_LIMIT), '--no-archived', '--source',
      '--visibility', 'public', '--json', 'name,description,primaryLanguage,url,createdAt',
    ]);
  } catch (err) {
    console.warn(`! 0-draft repo list failed, keeping the previous list: ${err.message}`);
    return null;
  }
  if (all.length >= ORG_LIMIT) {
    console.warn(`! gh repo list 0-draft hit the ${ORG_LIMIT} cap; keeping the previous list`);
    return null;
  }
  const rows = orgRows(all, { exclude: ORG_EXCLUDE, blurbs: ORG_BLURB_BY_REPO, langs: ORG_LANG_BY_REPO });
  // a discovered list drops a repo silently in two ways; name both so a missing card is traceable
  const skipped = all.filter((r) => !ORG_EXCLUDE.has(r.name) && !rows.some((x) => x.name === r.name));
  if (skipped.length) {
    console.warn(`! ${skipped.length} 0-draft repo(s) have no description, so no card:`);
    for (const r of skipped) console.warn(`    ${r.name}`);
  }
  return { all, rows };
}

const org = fetchOrgRepos();
const prevOrg = profile.org.repos?.length ?? 0;
// a sharp drop is far likelier a degraded fetch than half the org archived overnight; keep
// the last good list and say so, the same trade the empty-PR guard makes
// A real large drop (a batch archived, new ORG_EXCLUDE entries) would trip this every day, so
// it says so on the run summary, and FORCE_ORG=1 (workflow_dispatch env or a local run)
// writes the new list anyway.
const orgShrank = org && org.rows.length < prevOrg / 2 && !process.env.FORCE_ORG;
if (org && (!org.rows.length || orgShrank)) {
  const msg = `0-draft repos fell from ${prevOrg} to ${org.rows.length}; keeping the previous list (FORCE_ORG=1 to accept)`;
  console.warn(`! ${msg}`);
  if (process.env.GITHUB_ACTIONS) console.log(`::warning title=sync-profile::${msg}`);
} else if (org) profile.org.repos = org.rows;

// --- external PRs (all states; UI filters closed) and issues ---
const prs = fetchExternal('prs');
const issues = fetchExternal('issues');

// Abort rather than bump syncedAt with possibly-stale data if the fetch came back empty
// (kanywst always has external PRs now; an empty result means gh hiccuped).
if (!prs.length) {
  throw new Error('No upstream PRs returned; aborting to avoid stale sync metadata.');
}
// Same shrink guard as the 0-draft and writing lists: a degraded search that returns a
// fraction of the PRs would otherwise be committed, and shrink the chips, cloud and reach
// figure with it. FORCE_PRS=1 accepts a real large drop.
// Only from 10 rows up: at small counts halving is ordinary (one issue closed out of one),
// and aborting the whole sync over it would freeze everything else.
const shrank = (now, prev) =>
  prev?.length >= 10 && now.length < prev.length / 2 && !process.env.FORCE_PRS;
if (shrank(prs, profile.contributions) || shrank(issues, profile.issues)) {
  const msg = `upstream lists shrank (PRs ${profile.contributions.length}→${prs.length}, issues ${profile.issues?.length ?? 0}→${issues.length}); aborting to keep the previous data (FORCE_PRS=1 to accept)`;
  if (process.env.GITHUB_ACTIONS) console.log(`::warning title=sync-profile::${msg}`);
  throw new Error(msg);
}
profile.contributions = prs;

// --- reach of the merged work: how many upstream repos, and their combined stars ---
// One aggregate on purpose, not a per-PR weight: ranking or sizing PRs by repo stars would
// put a typo fix in a famous repo above a real authz fix in a small one. Best-effort; a
// failure keeps the previous figure.


function fetchMergedReach() {
  const slugs = [
    ...new Set(prs.filter((p) => p.state === 'merged').map((p) => `${p.owner}/${p.repo}`)),
  ].filter((s) => !LISTING.test(s) && !LISTING_REPOS.has(s));
  let stars = 0;
  let resolved = 0;
  const unresolved = [];
  const big = [];
  for (let i = 0; i < slugs.length; i += 50) {
    const chunk = slugs.slice(i, i + 50);
    const query = `{ ${chunk
      .map((s, j) => {
        const [o, n] = s.split('/');
        return `r${j}: repository(owner: ${JSON.stringify(o)}, name: ${JSON.stringify(n)}) { stargazerCount }`;
      })
      .join(' ')} }`;
    // a deleted/renamed repo comes back as null with a partial error; gh still prints the data
    let data;
    try {
      data = JSON.parse(gh(['api', 'graphql', '-f', `query=${query}`])).data;
    } catch (err) {
      const out = err.stdout && JSON.parse(err.stdout);
      if (!out?.data) throw err;
      data = out.data;
    }
    // A repo that comes back null (deleted, private, renamed away) is left out of both
    // numbers and named, so the figure stays consistent ("N projects" counts only what was
    // summed) and keeps moving with the PR list instead of freezing on one dead repo.
    chunk.forEach((slug, j) => {
      const r = data?.[`r${j}`];
      if (!r) return unresolved.push(slug);
      resolved++;
      stars += r.stargazerCount;
      // the listing exclusions are a hand-kept set: a big repo nobody has classified yet (not
      // in DOMAIN_BY_REPO) gets named, so a new list or registry is noticed before it inflates
      if (r.stargazerCount >= 20_000 && !DOMAIN_BY_REPO[slug]) big.push(slug);
    });
  }
  if (unresolved.length) console.warn(`! merged reach: no star count for ${unresolved.join(', ')} (left out)`);
  if (big.length)
    console.warn(`! merged reach counts large unclassified repos; tag them in DOMAIN_BY_REPO, and add any list/registry to LISTING_REPOS: ${big.join(', ')}`);
  if (!resolved) throw new Error('no repo resolved');
  return { repos: resolved, stars };
}

try {
  profile.meta ??= {};
  profile.meta.mergedReach = fetchMergedReach();
} catch (err) {
  // dropped, not kept: a figure from an older PR list would sit above the fresh one and no
  // longer match it. The line simply doesn't render until the next good sync.
  delete profile.meta.mergedReach;
  const msg = `merged-reach lookup failed, dropping the figure for this sync: ${err.message}`;
  console.warn(`! ${msg}`);
  if (process.env.GITHUB_ACTIONS) console.log(`::warning title=sync-profile::${msg}`);
}
// don't wipe a real issue list if the issues fetch came back empty (gh hiccup)
profile.issues = issues.length ? issues : (profile.issues ?? []);
profile.meta ??= {};
profile.meta.syncedAt = new Date().toISOString().slice(0, 10);

writeFileSync(FILE, JSON.stringify(profile, null, 2) + '\n');
// first-seen dates + star log behind the "new" / "+N ★" marks (src/data/history.json)
// a 0-draft repo is new from the day it was created, not the day discovery first saw it
if (org) {
  const created = new Map(org.all.map((r) => [r.url, r.createdAt.slice(0, 10)]));
  seedFirstSeen(Object.fromEntries(org.rows.map((r) => [r.url, created.get(r.url)])));
}
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
// Checked against the full fetched list (not the filtered cards, so an excluded repo with an
// override isn't a false alarm), and only when that fetch actually succeeded: against a
// degraded result every override would look orphaned.
if (org) {
  const names = new Set(org.all.map((r) => r.name));
  const orphanedOrg = [...Object.keys(ORG_BLURB_BY_REPO), ...Object.keys(ORG_LANG_BY_REPO)].filter(
    (n) => !names.has(n),
  );
  if (orphanedOrg.length) {
    console.warn(`! ${orphanedOrg.length} 0-draft override(s) in taglines.mjs name a repo that no longer exists:`);
    for (const n of orphanedOrg) console.warn(`    ${n} (renamed or archived — the curated text is dead)`);
  }
}
const orphaned = [...overrides].filter((name) => !allOwnRepoNames.has(name));
if (orphaned.length) {
  console.log(`! ${orphaned.length} override(s) in taglines.mjs name a repo that no longer exists:`);
  for (const name of orphaned) console.log(`    ${name} (renamed or deleted — the tagline is dead)`);
}
