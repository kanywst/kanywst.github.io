#!/usr/bin/env node
// Rebuild src/data/history.json from the git history of src/data/profile.json.
//
// The daily cron has committed a profile.json snapshot every day it changed, so the repo
// already holds the answer to "when did this row first appear" and "how many stars did that
// repo have last week". Replaying those snapshots in order gives real dates instead of
// stamping every existing row with today (which would flag the whole page as new) or with
// a sentinel (which would lose the last week's genuine additions and star gains).
//
// Usage:  node scripts/backfill-history.mjs      # needs the full git history (not a shallow clone)
//
// Safe to re-run: it starts from an empty ledger and replays from the first commit, then
// folds in the working-tree profile.json as today's snapshot.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { BOOTSTRAP_DATE, HISTORY_FILE, foldSnapshot, writeHistory } from './history.mjs';

const PATH = 'src/data/profile.json';
// TZ=UTC: the cron stamps dates in UTC, so commit dates must be read in UTC too or a
// late-evening local commit lands on the wrong day
const git = (args) =>
  execFileSync('git', args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, TZ: 'UTC' },
  });

if (git(['rev-parse', '--is-shallow-repository']).trim() === 'true') {
  throw new Error('shallow clone: run `git fetch --unshallow` first, or every row dates to today');
}

const commits = git(['log', '--reverse', '--format=%H %cd', '--date=format-local:%Y-%m-%d', '--', PATH])
  .trim()
  .split('\n')
  .map((l) => l.split(' '));

let history = { firstSeen: {}, stars: {} };
let replayed = 0;
for (const [sha, date] of commits) {
  let snap;
  try {
    snap = JSON.parse(git(['show', `${sha}:${PATH}`]));
  } catch {
    continue; // deleted / mid-refactor / not JSON at that commit
  }
  // The first usable snapshot is the page as it was launched, not a batch of additions:
  // dating it to its commit is honest, but the BOOTSTRAP seed in foldSnapshot already
  // handles that — the first fold into an empty ledger gets BOOTSTRAP_DATE.
  history = foldSnapshot(history, snap, date);
  replayed++;
}

// the working tree may hold a sync that isn't committed yet; date it the way the sync did
const current = JSON.parse(readFileSync(PATH, 'utf8'));
const today = current.meta?.syncedAt ?? new Date().toISOString().slice(0, 10);
history = foldSnapshot(history, current, today);
writeHistory(history);

const dated = Object.values(history.firstSeen).filter((d) => d !== BOOTSTRAP_DATE);
console.log(
  `replayed ${replayed} snapshots → ${Object.keys(history.firstSeen).length} items ` +
    `(${dated.length} with a real first-seen date), ${Object.keys(history.stars).length} star logs ` +
    `→ ${HISTORY_FILE}`,
);
