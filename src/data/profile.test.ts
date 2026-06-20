import { describe, expect, it } from 'vitest';
import profile from './profile.json';

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
      expect(f.lang).toBeTruthy();
    }
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

  it('records when the live half was last synced', () => {
    expect(profile.meta.syncedAt).toBeTruthy();
  });
});
