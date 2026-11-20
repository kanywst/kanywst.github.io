import { describe, expect, it } from 'vitest';
// @ts-expect-error — plain .mjs build plugin, no type declarations
import { atomFeed, feedEntries, jsonLd } from '../scripts/site-plugin.mjs';
import profile from './data/profile.json';
import history from './data/history.json';

const fixture = {
  profile: { name: 'me', alias: 'm', tagline: 'a & b', domains: ['X'], links: { github: 'g', devto: 'd' } },
  meta: { syncedAt: '2026-11-20' },
  contributions: [
    { owner: 'o', repo: 'r', number: 1, state: 'open', domain: 'D', title: 'fix <script> & "x"', url: 'u1' },
    { owner: 'o', repo: 'r', number: 2, state: 'merged', domain: 'D', title: 'old', url: 'u2' },
  ],
  issues: [],
  advisories: [],
  flagships: [],
  org: { repos: [{ name: 'n', blurb: 'b', url: 'u3' }] },
};
const ledger = { firstSeen: { u1: '2026-11-19', u2: '1970-01-01', u3: '2026-11-20' }, stars: {} };

describe('Atom feed', () => {
  it('lists dated additions newest first and leaves bootstrap-seeded rows out', () => {
    expect(feedEntries(fixture, ledger).map((e: { url: string }) => e.url)).toEqual(['u3', 'u1']);
  });

  it('escapes titles and stamps the feed with the newest entry', () => {
    const xml = atomFeed(fixture, ledger);
    expect(xml).toContain('fix &lt;script&gt; &amp; &quot;x&quot;');
    expect(xml).not.toContain('<script>');
    expect(xml).toMatch(/<feed[^>]*>[\s\S]*?<updated>2026-11-20T06:00:00Z<\/updated>/);
    expect(new DOMParser().parseFromString(xml, 'application/xml').querySelector('parsererror')).toBeNull();
  });

  it('builds from the real data without error', () => {
    const xml = atomFeed(profile, history);
    expect(new DOMParser().parseFromString(xml, 'application/xml').querySelector('parsererror')).toBeNull();
  });
});

describe('JSON-LD', () => {
  it('describes the person from the curated profile, without a cron-driven dateModified', () => {
    const ld = jsonLd(fixture);
    expect(ld['@type']).toBe('ProfilePage');
    expect(ld.mainEntity).toMatchObject({ '@type': 'Person', name: 'me', sameAs: ['g', 'd'], knowsAbout: ['X'] });
    expect(ld).not.toHaveProperty('dateModified');
  });
});
