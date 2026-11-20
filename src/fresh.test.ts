import { describe, expect, it } from 'vitest';
// @ts-expect-error — plain .mjs sync helper, no type declarations
import { BOOTSTRAP_DATE, foldSnapshot } from '../scripts/history.mjs';
import { isNew, ledger, movements, ranksAt, starsAt, type Ledger } from './fresh';
import profile from './data/profile.json';

const u = (n: string) => `https://github.com/kanywst/${n}`;

const h: Ledger = {
  firstSeen: {
    [u('old')]: BOOTSTRAP_DATE,
    [u('a')]: '2026-10-01',
    [u('b')]: '2026-10-01',
    [u('c')]: '2026-11-18',
    [u('back')]: '2026-09-01',
  },
  stars: {
    a: [['2026-10-01', 10], ['2026-11-19', 13]],
    b: [['2026-10-01', 20]],
    c: [['2026-11-18', 1]],
    back: [['2026-09-01', 2], ['2026-11-01', 0], ['2026-11-17', 3]],
  },
};
const NOW = '2026-11-20';

describe('isNew', () => {
  it('flags items first seen inside the 7-day window only', () => {
    expect(isNew(u('c'), NOW, h)).toBe(true);
    expect(isNew(u('a'), NOW, h)).toBe(false);
    // seven calendar days of "new": 11-18 … 11-24, gone on 11-25
    expect(isNew(u('c'), '2026-11-24', h)).toBe(true);
    expect(isNew(u('c'), '2026-11-25', h)).toBe(false);
  });

  it('never flags bootstrap-seeded or unknown items', () => {
    expect(isNew(u('old'), NOW, h)).toBe(false);
    expect(isNew(u('nope'), NOW, h)).toBe(false);
  });
});

describe('star log lookups', () => {
  it('reads the last entry at or before a date, 0 before the first', () => {
    expect(starsAt(h.stars.a, '2026-09-30')).toBe(0);
    expect(starsAt(h.stars.a, '2026-11-18')).toBe(10);
    expect(starsAt(h.stars.a, '2026-11-19')).toBe(13);
  });

  it('ranks by stars desc, name asc, starred only', () => {
    const r = ranksAt('2026-11-13', h);
    expect([...r.entries()]).toEqual([
      ['b', 1],
      ['a', 2],
    ]);
  });
});

describe('movements', () => {
  it('reports climbs, star gains, new entries and re-entries against a week ago', () => {
    // current order: a(13) overtook nobody, b(20) stays #1, back(3) re-entered, c(1) is new
    const ranked = [
      { name: 'b', stars: 20, url: u('b') },
      { name: 'a', stars: 13, url: u('a') },
      { name: 'back', stars: 3, url: u('back') },
      { name: 'c', stars: 1, url: u('c') },
    ];
    const m = movements(ranked, NOW, h);
    expect(m.get('b')).toEqual({ kind: 'move', climbed: 0, gained: 0 });
    expect(m.get('a')).toEqual({ kind: 'move', climbed: 0, gained: 3 });
    expect(m.get('back')).toEqual({ kind: 're', gained: 3 });
    expect(m.get('c')).toEqual({ kind: 'new' });
  });

  it('counts a climb when a repo overtakes another', () => {
    const ranked = [
      { name: 'a', stars: 25, url: u('a') },
      { name: 'b', stars: 20, url: u('b') },
    ];
    const hh: Ledger = { ...h, stars: { ...h.stars, a: [...h.stars.a, ['2026-11-20', 25]] } };
    const m = movements(ranked, NOW, hh);
    expect(m.get('a')).toEqual({ kind: 'move', climbed: 1, gained: 15 });
    expect(m.get('b')).toEqual({ kind: 'move', climbed: -1, gained: 0 });
  });
});

describe('foldSnapshot (scripts/history.mjs)', () => {
  const snap = (flagships: { name: string; stars: number }[], prs: string[] = []) => ({
    flagships: flagships.map((f) => ({ ...f, url: u(f.name) })),
    contributions: prs.map((url) => ({ url })),
  });

  it('seeds an empty ledger with the bootstrap date so nothing starts out new', () => {
    const out = foldSnapshot({ firstSeen: {}, stars: {} }, snap([{ name: 'a', stars: 1 }], ['pr1']), NOW);
    expect(out.firstSeen).toEqual({ [u('a')]: BOOTSTRAP_DATE, pr1: BOOTSTRAP_DATE });
  });

  it('keeps first-seen dates append-only, even across a run where an item is missing', () => {
    let l = foldSnapshot({ firstSeen: {}, stars: {} }, snap([], ['pr1']), '2026-11-01');
    l = foldSnapshot(l, snap([], ['pr2']), '2026-11-10');
    l = foldSnapshot(l, snap([], ['pr1', 'pr2']), '2026-11-12');
    expect(l.firstSeen).toEqual({ pr1: BOOTSTRAP_DATE, pr2: '2026-11-10' });
  });

  it('logs star changes only, closes a departed repo with 0, and is idempotent per day', () => {
    let l = foldSnapshot({ firstSeen: { x: BOOTSTRAP_DATE }, stars: {} }, snap([{ name: 'a', stars: 1 }]), '2026-11-01');
    l = foldSnapshot(l, snap([{ name: 'a', stars: 1 }]), '2026-11-02');
    l = foldSnapshot(l, snap([{ name: 'a', stars: 2 }]), '2026-11-03');
    l = foldSnapshot(l, snap([{ name: 'a', stars: 3 }]), '2026-11-03');
    l = foldSnapshot(l, snap([]), '2026-11-04');
    l = foldSnapshot(l, snap([]), '2026-11-04'); // a re-run the same day is still one miss
    expect(l.stars.a.at(-1)).toEqual(['2026-11-03', 3]);
    l = foldSnapshot(l, snap([]), '2026-11-05');
    expect(l.stars.a).toEqual([
      ['2026-11-01', 1],
      ['2026-11-03', 3],
      ['2026-11-04', 0],
    ]);
    expect(l.absent).toEqual({});
  });

  it('ignores a repo missing from a single degraded sync', () => {
    let l = foldSnapshot({ firstSeen: { x: BOOTSTRAP_DATE }, stars: {} }, snap([{ name: 'a', stars: 5 }]), '2026-11-01');
    l = foldSnapshot(l, snap([]), '2026-11-02');
    expect(l.absent).toEqual({ a: '2026-11-02' });
    l = foldSnapshot(l, snap([{ name: 'a', stars: 5 }]), '2026-11-03');
    expect(l.stars.a).toEqual([['2026-11-01', 5]]);
    expect(l.absent).toEqual({});
  });

  it('prunes the log to 30 days plus one baseline entry', () => {
    const l = foldSnapshot(
      {
        firstSeen: { x: BOOTSTRAP_DATE },
        stars: { a: [['2026-01-01', 1], ['2026-02-01', 2], ['2026-11-10', 3]] },
      },
      snap([{ name: 'a', stars: 3 }]),
      NOW,
    );
    expect(l.stars.a).toEqual([
      ['2026-02-01', 2],
      ['2026-11-10', 3],
    ]);
  });
});

describe('history.json contract', () => {
  it('dates every row the page renders', () => {
    const urls = [...profile.flagships, ...profile.contributions, ...profile.issues, ...profile.advisories].map(
      (x) => x.url,
    );
    for (const url of urls) expect(ledger.firstSeen[url], url).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('logs the current star count of every selected repo', () => {
    for (const f of profile.flagships) expect(ledger.stars[f.name]?.at(-1)?.[1], f.name).toBe(f.stars);
  });
});
