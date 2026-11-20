// Pure transforms behind the sync scripts, split out so they can be unit-tested
// (src/sync.test.ts) without shelling out to gh. The scripts keep the I/O and the guards
// around it; everything here takes API-shaped data and returns profile.json-shaped rows.

// Normalize a release tag for display: "omega-0.0.2" → "v0.0.2", "v0.12.0" → "v0.12.0".
export function normalizeVersion(tag) {
  const m = tag.match(/v?\d+\.\d+\.\d+[\w.-]*/);
  if (!m) return tag;
  return m[0].startsWith('v') ? m[0] : `v${m[0]}`;
}

/**
 * gh search rows → upstream PR/issue rows: external repos only, minus `exclude`, domain
 * tagged, merged first, then open, then closed, each by the date the row shows.
 */
export function upstreamRows(rows, { isOwn, exclude, domains }) {
  return rows
    // guard against unexpected shapes, then keep external repos only
    .filter((x) => x?.repository?.nameWithOwner && !isOwn(x.repository.nameWithOwner))
    .filter((x) => !exclude.has(`${x.repository.nameWithOwner}#${x.number}`))
    .map((x) => {
      const [owner, repo] = x.repository.nameWithOwner.split('/');
      return {
        owner,
        repo,
        number: x.number,
        state: x.state.toLowerCase(),
        domain: domains[x.repository.nameWithOwner] ?? '',
        title: x.title,
        url: x.url,
        // when it landed (merged / closed) or, still open, when it was opened. gh reports an
        // open item's closedAt as the zero time, not null
        date: (x.state.toLowerCase() === 'open' || !x.closedAt || x.closedAt.startsWith('0001')
          ? x.createdAt
          : x.closedAt
        ).slice(0, 10),
        _date: x.createdAt,
      };
    })
    // resolved/landed first (merged|closed-issue), then most recent
    .sort((a, b) => {
      const rank = (s) => (s === 'merged' ? 0 : s === 'open' ? 1 : 2);
      // by the date the row shows (landed, or opened if still open), so the month column
      // reads in order; createdAt only breaks ties
      return (
        rank(a.state) - rank(b.state) ||
        b.date.localeCompare(a.date) ||
        b._date.localeCompare(a._date)
      );
    })
    .map(({ _date, ...rest }) => rest);
}

/** gh repo list rows → 0-draft cards: newest first, excluded and blurb-less repos dropped. */
export function orgRows(all, { exclude, blurbs, langs }) {
  return all
    .filter((r) => !exclude.has(r.name))
    // a repo with no description has nothing to put on a card yet
    .filter((r) => blurbs[r.name] ?? r.description)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.name.localeCompare(b.name))
    .map((r) => ({
      name: r.name,
      lang: langs[r.name] ?? r.primaryLanguage?.name ?? '',
      blurb: blurbs[r.name] ?? r.description,
      url: r.url,
    }));
}

export const KNOWN_SEVERITY = new Set(['critical', 'high', 'medium', 'low']);

/** One GitHub security-advisory API response → an advisories[] row, or null if unpublished. */
export function advisoryFromApi(data, { repo, ghsa, title, cve }, domains) {
  if (data.state !== 'published') return null;
  // Derive owner/repo from the live html_url (GitHub keeps it current across renames),
  // falling back to the static source slug, so a renamed repo doesn't show a stale slug.
  const url = data.html_url ?? `https://github.com/${repo}/security/advisories/${ghsa}`;
  const m = url.match(/github\.com\/([^/]+)\/([^/]+)\/security\/advisories\//);
  const slug = m ? `${m[1]}/${m[2]}` : repo;
  const [owner, name] = slug.split('/');
  const cveId = data.cve_id ?? cve; // GitHub-assigned, else a pinned downstream CVE
  // Don't fabricate a severity if the API omits/renames the field; flag it ('unknown',
  // sorted last, warned below) rather than silently claiming a specific level.
  const sev = (data.severity ?? '').toLowerCase();
  const v4 = data.cvss_severities?.cvss_v4;
  const v3 = data.cvss_severities?.cvss_v3 ?? data.cvss;
  const scored = v4?.score ? v4 : v3?.score ? v3 : null;
  const cvss = scored ? { score: scored.score, vector: scored.vector_string } : null;
  return {
    owner,
    repo: name,
    ghsa: data.ghsa_id,
    ...(cveId ? { cve: cveId } : {}),
    severity: KNOWN_SEVERITY.has(sev) ? sev : 'unknown',
    // the upstream GHSA's own score, omitted rather than guessed when it has none — and
    // omitted for a CVE pinned by hand in ADVISORY_SOURCES, where the upstream score would sit
    // next to an id someone else assigned and read as that CVE's score
    ...(cvss && !(cve && !data.cve_id) ? { cvss } : {}),
    ...(data.published_at ? { published: data.published_at.slice(0, 10) } : {}),
    title: title ?? data.summary,
    domain: domains[slug] ?? domains[repo] ?? '',
    url,
  };
}
