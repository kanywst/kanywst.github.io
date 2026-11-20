// The ledger behind the "new" and "+N ★" marks: src/data/history.json.
//
// profile.json is a snapshot — each sync rewrites the live arrays wholesale, so on its own it
// cannot say what changed. history.json is the memory next to it:
//
//   firstSeen  url → the sync date an item first appeared (PR, issue, advisory, starred repo,
//              0-draft repo).
//              Append-only on purpose: an item that drops out for a run (gh hiccup, a repo
//              briefly at 0 stars) keeps its original date and does not come back as "new".
//   stars      repo name → [[date, stars], ...], one entry per *change*, so a quiet repo
//              costs one line. Pruned to a window plus one baseline entry before it, which is
//              enough to answer "how many stars at date D" for any D inside the window.
//   absent     repo name → the first sync date it was missing from the list. A repo that
//              leaves is closed with a 0 only once it is missing from a *second* sync, dated
//              back to the first miss, so a single degraded fetch can't zero a repo and fake
//              a re-entry or a rank climb for the week after.
//
// Most firstSeen dates are sync dates. Two kinds are seeded from the source instead (see
// seedFirstSeen): a 0-draft repo's creation date and a dev.to article's publish date — for
// those, "first seen" means "created" / "published".
//
// Both ledgers are keyed by name/url, so a renamed repo starts over: new first-seen date,
// fresh star log. Renames are rare enough that this is cheaper than tracking repo ids.
//
// Both sync scripts call recordHistory() after writing profile.json. It is idempotent, so
// running either script twice, or both in either order, lands on the same ledger.
//
// The UI decides what counts as "new" / "this week" against the viewer's clock (see
// src/fresh.ts), so a badge fades on schedule even on a day the cron finds nothing to commit.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
export const HISTORY_FILE = resolve(here, '../src/data/history.json');

// How far back the star log reaches. Comfortably past the UI's 7-day delta window so a
// window change in the UI doesn't need a data migration.
const STAR_LOG_DAYS = 30;

// Seeded on an empty ledger so the very first run doesn't flag every existing row as new.
// Any date far outside the UI window works; the epoch reads as "unknown, old" in a diff.
export const BOOTSTRAP_DATE = '1970-01-01';

const DAY_MS = 86_400_000;
const shiftDays = (iso, days) =>
  new Date(Date.parse(`${iso}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);

/** Every url the page renders as a dated row. */
export function trackedUrls(profile) {
  return [
    ...(profile.flagships ?? []),
    ...(profile.contributions ?? []),
    ...(profile.issues ?? []),
    ...(profile.advisories ?? []),
    ...(profile.org?.repos ?? []),
    ...(profile.writing ?? []),
  ]
    .map((x) => x.url)
    .filter(Boolean);
}

export function loadHistory(file = HISTORY_FILE) {
  if (!existsSync(file)) return { firstSeen: {}, stars: {}, absent: {} };
  const h = JSON.parse(readFileSync(file, 'utf8'));
  return { firstSeen: h.firstSeen ?? {}, stars: h.stars ?? {}, absent: h.absent ?? {} };
}

/** Pure: fold one profile snapshot taken on `date` into the ledger. Returns a new ledger. */
export function foldSnapshot(history, profile, date) {
  const firstSeen = { ...history.firstSeen };
  const urls = trackedUrls(profile);
  const seed = Object.keys(firstSeen).length === 0 ? BOOTSTRAP_DATE : date;
  for (const url of urls) firstSeen[url] ??= seed;

  const stars = Object.fromEntries(
    Object.entries(history.stars).map(([k, v]) => [k, v.map((e) => [...e])]),
  );
  const present = new Set();
  for (const f of profile.flagships ?? []) {
    present.add(f.name);
    const log = (stars[f.name] ??= []);
    const last = log.at(-1);
    if (!last || last[1] !== f.stars) {
      // a second run on the same day overwrites rather than stacking two entries for one date
      if (last && last[0] === date) last[1] = f.stars;
      else log.push([date, f.stars]);
    }
  }
  // A repo that left the list (unstarred, archived, renamed) gets a closing 0 so a
  // past-rank lookup still sees it held a place then and doesn't see it now — but only once
  // it has been missing from two different syncs (see `absent` above).
  const absent = {};
  for (const [name, log] of Object.entries(stars)) {
    const last = log.at(-1);
    if (present.has(name) || !last || last[1] === 0) continue;
    const since = history.absent?.[name] ?? date;
    if (since === date) {
      absent[name] = since;
      continue;
    }
    // dated to the first miss; a same-day entry there is overwritten, not stacked
    if (last[0] >= since) last[1] = 0;
    else log.push([since, 0]);
  }

  return { firstSeen, stars: pruneStars(stars, date), absent };
}

function pruneStars(stars, date) {
  const cutoff = shiftDays(date, -STAR_LOG_DAYS);
  const out = {};
  for (const [name, log] of Object.entries(stars)) {
    // keep the newest entry at or before the cutoff as the baseline for lookups inside the window
    let base = -1;
    for (let i = 0; i < log.length; i++) if (log[i][0] <= cutoff) base = i;
    const kept = log.slice(Math.max(base, 0));
    // a repo that has sat at 0 since before the window carries no information any more
    if (kept.length === 1 && kept[0][1] === 0 && kept[0][0] <= cutoff) continue;
    out[name] = kept;
  }
  return out;
}

export function writeHistory(history, file = HISTORY_FILE) {
  // sorted keys: the daily diff then shows only what moved, not a reshuffle
  const sorted = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(
    file,
    JSON.stringify(
      {
        firstSeen: sorted(history.firstSeen),
        stars: sorted(history.stars),
        absent: sorted(history.absent ?? {}),
      },
      null,
      2,
    ) +
      '\n',
  );
}

/**
 * Give items a known first-seen date (a repo's creation, an article's publication) instead of
 * the date a sync happened to notice them. Only fills gaps: a recorded date is never moved.
 */
export function seedFirstSeen(dates) {
  const h = loadHistory();
  let n = 0;
  for (const [url, date] of Object.entries(dates)) {
    if (h.firstSeen[url] || !date) continue;
    h.firstSeen[url] = date;
    n++;
  }
  if (n) writeHistory(h);
}

/** Called by the sync scripts with the profile they just wrote. */
export function recordHistory(profile, date = new Date().toISOString().slice(0, 10)) {
  const before = loadHistory();
  const after = foldSnapshot(before, profile, date);
  writeHistory(after);
  const added = Object.keys(after.firstSeen).length - Object.keys(before.firstSeen).length;
  if (added) console.log(`history: ${added} new item(s) first seen ${date}`);
}
