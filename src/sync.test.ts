import { describe, expect, it } from 'vitest';
// @ts-expect-error — plain .mjs sync helpers, no type declarations
import { advisoryFromApi, normalizeVersion, orgRows, upstreamRows } from '../scripts/sync-lib.mjs';

describe('normalizeVersion', () => {
  it.each([
    ['v0.12.0', 'v0.12.0'],
    ['omega-0.0.2', 'v0.0.2'],
    ['1.2.3-rc.1', 'v1.2.3-rc.1'],
    ['nightly', 'nightly'],
  ])('%s → %s', (tag, out) => expect(normalizeVersion(tag)).toBe(out));
});

const gh = (o: string, n: number, state: string, createdAt: string, closedAt?: string | null) => ({
  repository: { nameWithOwner: o },
  number: n,
  state,
  title: `t${n}`,
  url: `https://github.com/${o}/pull/${n}`,
  createdAt,
  closedAt,
});
const opts = {
  isOwn: (s: string) => s.startsWith('kanywst/'),
  exclude: new Set(['x/y#9']),
  domains: { 'a/b': 'Authz' },
};

describe('upstreamRows', () => {
  const rows = upstreamRows(
    [
      gh('kanywst/self', 1, 'MERGED', '2026-01-01T00:00:00Z', '2026-01-02T00:00:00Z'),
      gh('x/y', 9, 'OPEN', '2026-01-01T00:00:00Z'),
      gh('a/b', 2, 'OPEN', '2026-03-01T00:00:00Z', '0001-01-01T00:00:00Z'),
      gh('a/b', 3, 'MERGED', '2026-01-01T00:00:00Z', '2026-05-01T00:00:00Z'),
      gh('c/d', 4, 'MERGED', '2026-04-01T00:00:00Z', '2026-04-02T00:00:00Z'),
      gh('c/d', 5, 'CLOSED', '2026-06-01T00:00:00Z', null),
      { repository: null, number: 6 },
    ],
    opts,
  );

  it('drops own repos, excluded items and malformed rows', () => {
    expect(rows.map((r: { number: number }) => r.number)).toEqual([3, 4, 2, 5]);
  });

  it('dates a row by when it landed, falling back to createdAt for open or missing closedAt', () => {
    expect(rows.map((r: { date: string }) => r.date)).toEqual([
      '2026-05-01',
      '2026-04-02',
      '2026-03-01',
      '2026-06-01',
    ]);
  });

  it('tags domains and lowercases state', () => {
    expect(rows[0]).toMatchObject({ owner: 'a', repo: 'b', domain: 'Authz', state: 'merged' });
    expect(rows[1].domain).toBe('');
    expect(rows[0]).not.toHaveProperty('_date');
  });
});

describe('orgRows', () => {
  it('sorts newest first and drops excluded or undescribed repos, honouring overrides', () => {
    const out = orgRows(
      [
        { name: 'old', description: 'o', createdAt: '2026-01-01', url: 'u1', primaryLanguage: { name: 'Go' } },
        { name: 'new', description: 'n', createdAt: '2026-02-01', url: 'u2', primaryLanguage: null },
        { name: '.github', description: 'x', createdAt: '2026-03-01', url: 'u3' },
        { name: 'bare', description: '', createdAt: '2026-04-01', url: 'u4' },
        { name: 'curated', description: '', createdAt: '2025-01-01', url: 'u5' },
      ],
      { exclude: new Set(['.github']), blurbs: { curated: 'by hand' }, langs: { new: 'MDX' } },
    );
    expect(out).toEqual([
      { name: 'new', lang: 'MDX', blurb: 'n', url: 'u2' },
      { name: 'old', lang: 'Go', blurb: 'o', url: 'u1' },
      { name: 'curated', lang: '', blurb: 'by hand', url: 'u5' },
    ]);
  });
});

describe('advisoryFromApi', () => {
  const base = {
    state: 'published',
    ghsa_id: 'GHSA-1',
    html_url: 'https://github.com/new/name/security/advisories/GHSA-1',
    severity: 'High',
    summary: 's',
    published_at: '2026-06-30T14:16:34Z',
    cve_id: 'CVE-1',
    cvss_severities: {
      cvss_v3: { score: 7.5, vector_string: 'CVSS:3.1/AV:N' },
      cvss_v4: { score: null, vector_string: null },
    },
  };
  const src = { repo: 'old/name', ghsa: 'GHSA-1' };

  it('skips anything not published', () => {
    expect(advisoryFromApi({ ...base, state: 'draft' }, src, {})).toBeNull();
  });

  it('follows a rename through html_url and keeps the domain of either slug', () => {
    const a = advisoryFromApi(base, src, { 'old/name': 'PKI' });
    expect(a).toMatchObject({ owner: 'new', repo: 'name', domain: 'PKI', severity: 'high', published: '2026-06-30' });
  });

  it('prefers a v4 score and falls back to v3', () => {
    expect(advisoryFromApi(base, src, {}).cvss).toEqual({ score: 7.5, vector: 'CVSS:3.1/AV:N' });
    const v4 = { ...base, cvss_severities: { ...base.cvss_severities, cvss_v4: { score: 8.1, vector_string: 'CVSS:4.0/x' } } };
    expect(advisoryFromApi(v4, src, {}).cvss.score).toBe(8.1);
  });

  it('never invents a severity, and drops the score next to a hand-pinned CVE', () => {
    expect(advisoryFromApi({ ...base, severity: 'weird' }, src, {}).severity).toBe('unknown');
    const pinned = advisoryFromApi({ ...base, cve_id: null }, { ...src, cve: 'CVE-DOWN' }, {});
    expect(pinned.cve).toBe('CVE-DOWN');
    expect(pinned).not.toHaveProperty('cvss');
  });
});
