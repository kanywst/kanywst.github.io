// Build-time extras derived from the same data the page renders, so none of them can drift:
//
//   index.html   JSON-LD (ProfilePage + Person) for search engines, and a content hash on the
//                og.png URLs — X / Slack / Discord cache a preview by URL, so a fixed
//                /og.png kept showing last month's counts long after make-og.mjs redrew it.
//   feed.xml     Atom feed of what was added, straight from history.json's first-seen dates:
//                upstream PRs, issues, advisories, newly starred repos and 0-draft repos.
//                Entry ids are the item URLs, so a reader never re-notifies an old entry.
//   sitemap.xml  + robots.txt pointing at it.
//
// Wired in vite.config.ts; only active for `vite build`.

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://kanywst.github.io/';
const FEED_ENTRIES = 50;
const BOOTSTRAP_DATE = '1970-01-01';

const readJSON = (p) => JSON.parse(readFileSync(resolve(root, p), 'utf8'));

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);

// the cron runs at 06:00 UTC, so that is when a "first seen" date actually happened
const stamp = (date) => `${date}T06:00:00Z`;

export function feedEntries(profile, history) {
  const kinds = [
    ...profile.contributions.map((c) => ({
      url: c.url,
      title: `PR ${c.owner}/${c.repo}#${c.number} (${c.state}): ${c.title}`,
      category: 'pull request',
      summary: c.domain,
    })),
    ...profile.issues.map((c) => ({
      url: c.url,
      title: `Issue ${c.owner}/${c.repo}#${c.number}: ${c.title}`,
      category: 'issue',
      summary: c.domain,
    })),
    ...profile.advisories.map((a) => ({
      url: a.url,
      title: `Advisory ${a.owner}/${a.repo} ${a.cve ?? a.ghsa} (${a.severity}): ${a.title}`,
      category: 'security advisory',
      summary: a.domain,
    })),
    ...profile.flagships.map((f) => ({
      url: f.url,
      title: `Selected work: ${f.name} earned its first star`,
      category: 'repository',
      summary: f.tagline,
    })),
    ...profile.org.repos.map((r) => ({
      url: r.url,
      title: `0-draft: ${r.name}`,
      category: '0-draft',
      summary: r.blurb,
    })),
  ];
  return kinds
    .map((k) => ({ ...k, date: history.firstSeen[k.url] }))
    .filter((k) => k.date && k.date !== BOOTSTRAP_DATE)
    .sort((a, b) => b.date.localeCompare(a.date) || a.url.localeCompare(b.url))
    .slice(0, FEED_ENTRIES);
}

export function atomFeed(profile, history) {
  const entries = feedEntries(profile, history);
  const updated = stamp(entries[0]?.date ?? profile.meta.syncedAt);
  const body = entries
    .map(
      (e) => `  <entry>
    <id>${esc(e.url)}</id>
    <title>${esc(e.title)}</title>
    <link href="${esc(e.url)}"/>
    <updated>${stamp(e.date)}</updated>
    <category term="${esc(e.category)}"/>${e.summary ? `\n    <summary>${esc(e.summary)}</summary>` : ''}
  </entry>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${SITE}</id>
  <title>${esc(profile.profile.name)} — what's new</title>
  <subtitle>${esc(profile.profile.tagline)}</subtitle>
  <link href="${SITE}"/>
  <link rel="self" href="${SITE}feed.xml"/>
  <author><name>${esc(profile.profile.name)}</name><uri>${esc(profile.profile.links.github)}</uri></author>
  <updated>${updated}</updated>
${body}
</feed>
`;
}

export function jsonLd(profile) {
  const p = profile.profile;
  // no dateModified: Google wants it to mean a human edit, and the daily cron would make it
  // claim one every day
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: SITE,
    mainEntity: {
      '@type': 'Person',
      name: p.name,
      alternateName: p.alias,
      url: SITE,
      image: `https://avatars.githubusercontent.com/${p.name}?s=460`,
      description: p.tagline,
      knowsAbout: p.domains,
      sameAs: [p.links.github, p.links.devto],
    },
  };
}

export default function sitePlugin() {
  return {
    name: 'kanywst-site',
    apply: 'build',
    transformIndexHtml(html) {
      const profile = readJSON('src/data/profile.json');
      const og = createHash('sha256')
        .update(readFileSync(resolve(root, 'public/og.png')))
        .digest('hex')
        .slice(0, 10);
      // `<` escaped so a tagline can never close the script element
      const ld = JSON.stringify(jsonLd(profile)).replace(/</g, '\\u003c');
      return html
        .replaceAll(`${SITE}og.png"`, `${SITE}og.png?v=${og}"`)
        .replace('</head>', `    <script type="application/ld+json">${ld}</script>\n  </head>`);
    },
    generateBundle() {
      const profile = readJSON('src/data/profile.json');
      const history = readJSON('src/data/history.json');
      this.emitFile({ type: 'asset', fileName: 'feed.xml', source: atomFeed(profile, history) });
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}</loc><lastmod>${profile.meta.syncedAt}</lastmod></url>
</urlset>
`,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`,
      });
    },
  };
}
