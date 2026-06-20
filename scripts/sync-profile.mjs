#!/usr/bin/env node
// Refresh the live parts of src/data/profile.json (stars, versions, upstream PRs, issues)
// while preserving curated fields (taglines, ordering, featured, blurbs, 0-draft).
//
// Usage:  node scripts/sync-profile.mjs        # requires `gh` authenticated
//
// Domain tags are assigned from DOMAIN_BY_REPO below (stable, repo-keyed) so re-syncs
// never lose them and new contributions get tagged automatically.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(here, '../src/data/profile.json');

const GH_TIMEOUT_MS = 20_000;
const GH_MAX_BUFFER = 5 * 1024 * 1024;

// owner/repo → domain. Anything unmapped falls back to '' (flagged at the end to tag).
const DOMAIN_BY_REPO = {
  'authzed/spicedb': 'Authorization',
  'openfga/openfga': 'Authorization',
  'Permify/permify': 'Authorization',
  'open-policy-agent/opa': 'Authorization',
  'open-policy-agent/contrib': 'Authorization',
  'open-policy-agent/gatekeeper-library': 'Authorization',
  'aserto-dev/topaz': 'Authorization',
  'spiffe/spire': 'Workload Identity',
  'sigstore/sigstore-go': 'Supply Chain',
  'sigstore/cosign': 'Supply Chain',
  'in-toto/in-toto-golang': 'Supply Chain',
  'theupdateframework/go-tuf': 'Supply Chain',
  'falcosecurity/plugins': 'Runtime Security',
  'dexidp/dex': 'OIDC',
  'smallstep/certificates': 'PKI',
  'smallstep/cli': 'PKI',
  'cert-manager/cert-manager': 'PKI',
  'enix/x509-certificate-exporter': 'PKI',
  'golang/go': 'PKI',
  'istio/istio': 'Service Mesh',
  'cilium/cilium': 'Service Mesh',
  'kubernetes/kubernetes': 'Cloud Native',
  'prometheus/prometheus': 'Observability',
  'golangci/golangci-lint': 'Tooling',
  'google-gemini/gemini-cli': 'Tooling',
  'pwn2winctf/2020submissions': 'CTF',
};

const own = /^(kanywst|0-draft)\//;

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
    if (tag) repo.version = normalizeVersion(tag);
  } catch {
    /* no releases — keep whatever curation set (often null) */
  }
}

// --- external PRs (all states; UI filters closed) and issues ---
const prs = fetchExternal('prs');
const issues = fetchExternal('issues');

// Abort rather than bump syncedAt with possibly-stale data if the fetch came back empty
// (kanywst always has external PRs now; an empty result means gh hiccuped).
if (!prs.length) {
  throw new Error('No upstream PRs returned; aborting to avoid stale sync metadata.');
}
profile.contributions = prs;
profile.issues = issues;
profile.meta ??= {};
profile.meta.syncedAt = new Date().toISOString().slice(0, 10);

writeFileSync(FILE, JSON.stringify(profile, null, 2) + '\n');

const by = (arr, s) => arr.filter((c) => c.state === s).length;
console.log(
  `synced ${profile.meta.syncedAt}: ${profile.flagships.length} flagships, ` +
    `PRs ${prs.length} (${by(prs, 'merged')} merged / ${by(prs, 'open')} open / ${by(prs, 'closed')} closed), ` +
    `issues ${issues.length}`,
);
const untagged = [...prs, ...issues].filter((c) => !c.domain);
if (untagged.length) {
  console.log(`! ${untagged.length} untagged — add their repos to DOMAIN_BY_REPO:`);
  for (const c of untagged) console.log(`    ${c.owner}/${c.repo}`);
}
