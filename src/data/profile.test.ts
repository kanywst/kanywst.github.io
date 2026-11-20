import { describe, expect, it } from 'vitest';
import profile from './profile.json';
// @ts-expect-error — plain .mjs sync helper, no type declarations
import { ORG_EXCLUDE } from '../../scripts/taglines.mjs';

// Guards the contract that scripts/sync-profile.mjs writes and App.tsx renders from.
// If the sync output drifts (renamed field, bad PR state), these fail loudly.

describe('profile.json contract', () => {
  it('carries the curated profile block', () => {
    expect(profile.profile.name).toBeTruthy();
    expect(profile.profile.links.github).toMatch(/^https?:\/\//);
    expect(profile.profile.links.devto).toMatch(/^https?:\/\//);
    expect(profile.profile.links.org).toMatch(/^https?:\/\//);
  });

  it('has flagships with the fields App renders', () => {
    expect(Array.isArray(profile.flagships)).toBe(true);
    expect(profile.flagships.length).toBeGreaterThan(0);
    for (const f of profile.flagships) {
      expect(f.name).toBeTruthy();
      expect(f.url).toMatch(/^https?:\/\//);
      expect(typeof f.stars).toBe('number');
      // GitHub can't classify every repo, so lang is allowed to be empty (the UI omits it)
      expect(typeof f.lang).toBe('string');
    }
  });

  it('only carries starred repos, in descending star order', () => {
    // the selection rule itself: sync-profile.mjs discovers by stars, nothing is hand-picked
    for (const f of profile.flagships) expect(f.stars).toBeGreaterThan(0);
    const stars = profile.flagships.map((f) => f.stars);
    expect(stars).toEqual([...stars].sort((a, b) => b - a));
  });

  it('only ever uses known PR states in contributions', () => {
    const states = new Set(['merged', 'open', 'closed']);
    expect(Array.isArray(profile.contributions)).toBe(true);
    for (const c of profile.contributions) {
      expect(states.has(c.state)).toBe(true);
      expect(c.owner).toBeTruthy();
      expect(c.repo).toBeTruthy();
      expect(typeof c.number).toBe('number');
      expect(c.url).toMatch(/^https?:\/\//);
    }
  });

  it('has well-formed issues', () => {
    expect(Array.isArray(profile.issues)).toBe(true);
    for (const issue of profile.issues) {
      expect(issue.owner).toBeTruthy();
      expect(issue.repo).toBeTruthy();
      expect(issue.url).toMatch(/^https?:\/\//);
    }
  });

  it('dates upstream rows and scores advisories in the shapes the UI reads', () => {
    const ymd = /^\d{4}-\d{2}-\d{2}$/;
    for (const c of [...profile.contributions, ...profile.issues]) expect(c.date, c.url).toMatch(ymd);
    for (const a of profile.advisories as { cvss?: { score: number; vector: string }; published?: string }[]) {
      if (a.published) expect(a.published).toMatch(ymd);
      if (a.cvss) {
        expect(a.cvss.score).toBeGreaterThanOrEqual(0);
        expect(a.cvss.score).toBeLessThanOrEqual(10);
        expect(a.cvss.vector).toMatch(/^CVSS:[34]\.\d\//);
      }
    }
  });

  it('lists discovered 0-draft repos with a blurb and no excluded plumbing', () => {
    expect(profile.org.repos.length).toBeGreaterThan(0);
    for (const r of profile.org.repos) {
      expect(r.blurb, r.name).toBeTruthy();
      expect(ORG_EXCLUDE.has(r.name), r.name).toBe(false);
    }
  });

  it('summarises merged reach as counts, if present', () => {
    const r = (profile.meta as { mergedReach?: { repos: number; stars: number } }).mergedReach;
    if (!r) return;
    expect(Number.isInteger(r.repos) && r.repos > 0).toBe(true);
    expect(Number.isInteger(r.stars) && r.stars >= 0).toBe(true);
  });

  it('records when the live half was last synced', () => {
    expect(profile.meta.syncedAt).toBeTruthy();
  });
});
