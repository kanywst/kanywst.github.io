// "What changed this week", derived from src/data/history.json (written by scripts/history.mjs).
//
// Everything is measured against the viewer's clock, not against meta.syncedAt: a badge then
// fades on schedule even if the cron goes quiet, instead of a stale "new" living forever.
//
// One window for both marks, so "new" and "▲ / +N" answer the same question — what moved in
// the last week. Charts compare against the previous edition rather than the previous day for
// the same reason: a daily-sync delta is 0 almost every day and gone the morning after.
import history from './data/history.json';

export const WINDOW_DAYS = 7;
const BOOTSTRAP_DATE = '1970-01-01';
const DAY_MS = 86_400_000;

type StarLog = [string, number][];
export type Ledger = { firstSeen: Record<string, string>; stars: Record<string, StarLog> };

export const ledger = history as unknown as Ledger;

export const todayUTC = () => new Date().toISOString().slice(0, 10);

const shift = (iso: string, days: number) =>
  new Date(Date.parse(`${iso}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);

/** The cutoff: anything first seen after this date is "new". */
export const windowStart = (now: string) => shift(now, -WINDOW_DAYS);

export function firstSeen(url: string, h: Ledger = ledger): string | undefined {
  const d = h.firstSeen[url];
  return d && d !== BOOTSTRAP_DATE ? d : undefined;
}

export function isNew(url: string, now: string, h: Ledger = ledger): boolean {
  const d = firstSeen(url, h);
  return !!d && d > windowStart(now) && d <= now;
}

/** Stars a repo had at the end of `date`; 0 when the log says nothing about it yet. */
export function starsAt(log: StarLog | undefined, date: string): number {
  let n = 0;
  for (const [d, s] of log ?? []) {
    if (d > date) break;
    n = s;
  }
  return n;
}

/** Rank by the page's own rule (stars desc, name asc, starred only) as of `date`. */
export function ranksAt(date: string, h: Ledger = ledger): Map<string, number> {
  const rows = Object.entries(h.stars)
    .map(([name, log]) => ({ name, stars: starsAt(log, date) }))
    .filter((r) => r.stars > 0)
    .sort((a, b) => b.stars - a.stars || a.name.localeCompare(b.name));
  return new Map(rows.map((r, i) => [r.name, i + 1]));
}

export type Movement =
  // first starred inside the window: no "last week" to compare with
  | { kind: 'new' }
  // starred before, dropped out, back again (chart "RE")
  | { kind: 're'; gained: number }
  // was ranked a week ago: rank shift (+ = climbed) and stars gained since
  | { kind: 'move'; climbed: number; gained: number };

export function movements(
  ranked: { name: string; stars: number; url: string }[],
  now: string,
  h: Ledger = ledger,
): Map<string, Movement> {
  const base = windowStart(now);
  const before = ranksAt(base, h);
  const out = new Map<string, Movement>();
  ranked.forEach((r, i) => {
    const gained = Math.max(0, r.stars - starsAt(h.stars[r.name], base));
    const prev = before.get(r.name);
    if (prev === undefined) {
      out.set(r.name, isNew(r.url, now, h) ? { kind: 'new' } : { kind: 're', gained });
    } else {
      out.set(r.name, { kind: 'move', climbed: prev - (i + 1), gained });
    }
  });
  return out;
}

export function daysAgo(date: string, now: string): string {
  const n = Math.round((Date.parse(`${now}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`)) / DAY_MS);
  return n <= 0 ? 'today' : n === 1 ? 'yesterday' : `${n} days ago`;
}
