#!/usr/bin/env node
// Regenerate the `advisories` array in src/data/profile.json from the live GitHub
// advisory API. Only touches `advisories` — run alongside sync-profile.mjs.
//
// Usage:  node scripts/sync-advisories.mjs        # `gh` auth optional (published
//         advisories are world-readable; drafts/closed 404 and are skipped)
//
// The section is self-maintaining: list every advisory you file in ADVISORY_SOURCES
// below (even before it's public). Each one is fetched every sync; a source that isn't
// `published` yet returns 404 and is skipped, so it appears on the site the day it goes
// public — and the CVE id / severity fill in automatically once assigned. When you file
// a new advisory, add ONE line here; nothing else needs editing.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(here, '../src/data/profile.json');

const GH_TIMEOUT_MS = 20_000;

// Every advisory kanywst has reported. `domain` is curated (the API has no such field);
// `title` overrides the API summary when set (default: the advisory's own summary);
// `cve` pins a CVE the upstream GHSA doesn't carry — a downstream vendor's own CNA can
// assign one under its product name while the upstream advisory stays cve=null (kuma's
// finding is CVE-2026-18677 via Kong Mesh, but kumahq's GHSA shows no cve). A GitHub-
// assigned CVE fills in automatically from the API; only downstream ones need pinning.
// Published → rendered; draft / triage / closed → 404 → silently skipped.
const ADVISORY_SOURCES = [
  { repo: 'kubewarden/policies', ghsa: 'GHSA-8p62-9vh2-272p', domain: 'Supply Chain' },
  { repo: 'kumahq/kuma', ghsa: 'GHSA-744g-c785-x65q', domain: 'Workload Identity',
    cve: 'CVE-2026-18677',
    title: "Dataplane token without a workload binding can claim any workload's SPIFFE identity" },
  { repo: 'falcosecurity/plugins', ghsa: 'GHSA-jhjp-4c2q-xmx4', domain: 'Runtime Security',
    title: 'k8saudit rules miss privileged settings on init / ephemeral containers' },
  { repo: 'authzed/spicedb', ghsa: 'GHSA-5784-6qcr-48fq', domain: 'Authorization' },
  { repo: 'zitadel/zitadel', ghsa: 'GHSA-93hm-8q29-c8cr', domain: 'Identity',
    title: 'SSRF in organization domain HTTP verification' },
  // Filed, not yet public — auto-appear once published:
  { repo: 'envoyproxy/ai-gateway', ghsa: 'GHSA-6f73-grvh-9gvc', domain: 'AI Gateway' },
  { repo: 'envoyproxy/ai-gateway', ghsa: 'GHSA-9c2x-f2fx-mc4q', domain: 'AI Gateway' },
  { repo: 'envoyproxy/ai-gateway', ghsa: 'GHSA-chmc-g5r6-q8xc', domain: 'AI Gateway' },
  { repo: 'oras-project/oras-go', ghsa: 'GHSA-6hq5-qrvm-qhcx', domain: 'Supply Chain' },
  { repo: 'zalando/skipper', ghsa: 'GHSA-7g9f-57qp-jhgx', domain: 'OIDC' },
  { repo: 'zalando/skipper', ghsa: 'GHSA-v9vv-w45w-rppw', domain: 'OIDC' },
  { repo: 'aquasecurity/trivy', ghsa: 'GHSA-mx8c-3cph-89vq', domain: 'Supply Chain' },
  { repo: 'coder/coder', ghsa: 'GHSA-j58h-457w-w698', domain: 'Cloud Native' },
  { repo: 'notaryproject/notation-go', ghsa: 'GHSA-8879-53fh-v6x7', domain: 'Supply Chain' },
  { repo: 'notaryproject/ratify', ghsa: 'GHSA-88jq-fv55-rqr7', domain: 'Supply Chain' },
  { repo: 'goauthentik/authentik', ghsa: 'GHSA-hm5g-jff6-5qh8', domain: 'Identity' },
  { repo: 'cerbos/cerbos', ghsa: 'GHSA-rm2r-9fq8-vvj4', domain: 'Authorization' },
  { repo: 'netbirdio/netbird', ghsa: 'GHSA-gvrx-7qv5-hmff', domain: 'Cloud Native' },
];

const SEVERITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 };

function fetchAdvisory({ repo, ghsa, domain, title, cve }) {
  let data;
  try {
    const out = execFileSync('gh', ['api', `repos/${repo}/security-advisories/${ghsa}`], {
      encoding: 'utf8',
      timeout: GH_TIMEOUT_MS,
      stdio: ['ignore', 'pipe', 'ignore'], // swallow the 404 stderr for unpublished ones
    });
    data = JSON.parse(out);
  } catch {
    return null; // draft / triage / closed / withdrawn — not public yet
  }
  if (data.state !== 'published') return null;
  const [owner, name] = repo.split('/');
  const cveId = data.cve_id ?? cve; // GitHub-assigned, else a pinned downstream CVE
  return {
    owner,
    repo: name,
    ghsa: data.ghsa_id,
    ...(cveId ? { cve: cveId } : {}),
    severity: (data.severity || 'medium').toLowerCase(),
    title: title ?? data.summary,
    domain,
    url: data.html_url ?? `https://github.com/${repo}/security/advisories/${ghsa}`,
  };
}

const advisories = ADVISORY_SOURCES.map(fetchAdvisory)
  .filter(Boolean)
  // CVE-bearing first (the headline), then by severity, then filing order preserved
  .sort((a, b) => {
    const cve = (a.cve ? 0 : 1) - (b.cve ? 0 : 1);
    if (cve) return cve;
    return (SEVERITY_RANK[a.severity] ?? 9) - (SEVERITY_RANK[b.severity] ?? 9);
  });

const profile = JSON.parse(readFileSync(FILE, 'utf8'));

// A network hiccup makes every fetch 404; don't wipe a real list on a bad run.
if (!advisories.length && profile.advisories?.length) {
  throw new Error('No published advisories returned; keeping the existing list.');
}
profile.advisories = advisories;
writeFileSync(FILE, JSON.stringify(profile, null, 2) + '\n');

const cves = advisories.filter((a) => a.cve).length;
console.log(
  `synced advisories: ${advisories.length} published (${cves} with a CVE) ` +
    `from ${ADVISORY_SOURCES.length} sources`,
);
for (const a of advisories) {
  console.log(`    ${a.severity.padEnd(8)} ${a.owner}/${a.repo}  ${a.cve ?? a.ghsa}`);
}
