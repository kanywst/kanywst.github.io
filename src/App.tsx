import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import profile from './data/profile.json';
import {
  WINDOW_DAYS,
  daysAgo,
  firstSeen,
  isNew,
  movements,
  todayUTC,
  type Movement,
} from './fresh';

const { profile: me, flagships, advisories, org, contributions, issues } = profile;

// The sync script already writes them in star order; sorting here too keeps the ranking
// a property of the UI rather than a trust in the file.
const ranked = [...flagships].sort((a, b) => b.stars - a.stars || a.name.localeCompare(b.name));

const PR_STATES = ['merged', 'open', 'closed'] as const;

// The upstream lists run to dozens of rows. Show a slice and let the reader ask for the
// rest, so the sections below stay reachable without a long scroll.
const PREVIEW_ROWS = 6;

// The top 3 by stars get the podium treatment; the rest stay compact rows.
const PODIUM = 3;

// 0-draft is discovered newest-first and runs to ~15 repos; two rows of three is the preview.
const ORG_PREVIEW = 6;

// GitHub's own language colors, so the dot reads as the language at a glance. Anything
// unmapped falls back to the muted foreground.
const LANG_COLOR: Record<string, string> = {
  Go: '#00ADD8',
  Rust: '#dea584',
  Python: '#3572A5',
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Shell: '#89e051',
  Zig: '#ec915c',
  Ruby: '#701516',
  HTML: '#e34c26',
  Astro: '#ff5a03',
  MDX: '#fcb32c',
  List: '#8b8b93',
};

// github.com/<login>.png, not avatars.githubusercontent.com/<login>: the short form is keyed
// on user logins and hands an org (spiffe, kubernetes, …) the default identicon. The .png URL
// costs a 302, which the preconnect in index.html keeps cheap.
const avatar = (login: string) => `https://github.com/${login}.png?size=160`;

function LangDot({ lang }: { lang: string }) {
  if (!lang) return null;
  return (
    <span className="lang">
      <i className="lang-dot" style={{ background: LANG_COLOR[lang] ?? 'var(--faint)' }} />
      {lang}
    </span>
  );
}

// "new" is a word, not a dot: a dot alone is colour carrying meaning (WCAG 1.4.1), and the
// word is short enough in a mono face to sit inline with a repo name.
function NewTag({ url, now }: { url: string; now: string }) {
  if (!isNew(url, now)) return null;
  const d = firstSeen(url);
  return (
    <span className="new-tag" title={d ? `first seen ${d} (${daysAgo(d, now)})` : undefined}>
      <i className="new-dot" aria-hidden="true" />
      new
    </span>
  );
}

// Chart-style movement against a week ago. Glyph + number for the eye, a full sentence for
// a screen reader; nothing at all when nothing moved, so the marks stay rare enough to read.
function RankMove({ m }: { m: Movement | undefined }) {
  if (!m) return null;
  if (m.kind === 're')
    return (
      <span className="rank-move re" title="back in the ranking this week">
        re<span className="sr-only"> (re-entered this week)</span>
      </span>
    );
  if (m.kind !== 'move' || m.climbed === 0) return null;
  const up = m.climbed > 0;
  const n = Math.abs(m.climbed);
  return (
    <span
      className={`rank-move ${up ? 'up' : 'down'}`}
      title={`${up ? 'up' : 'down'} ${n} place${n === 1 ? '' : 's'} since last week`}
    >
      <span aria-hidden="true">
        {up ? '▲' : '▼'}
        {n}
      </span>
      <span className="sr-only">
        {' '}
        ({up ? 'up' : 'down'} {n} place{n === 1 ? '' : 's'} this week)
      </span>
    </span>
  );
}

function StarGain({ m }: { m: Movement | undefined }) {
  const gained = m && m.kind !== 'new' ? m.gained : 0;
  if (!gained) return null;
  return (
    <span className="star-gain" title={`+${gained} star${gained === 1 ? '' : 's'} in the last ${WINDOW_DAYS} days`}>
      <span aria-hidden="true">+{gained}</span>
      <span className="sr-only">
        {' '}
        ({gained} new star{gained === 1 ? '' : 's'} this week)
      </span>
    </span>
  );
}

function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M3 6 7.6 11.4 12 4 16.4 11.4 21 6 19.3 16H4.7Z" />
      <rect x="4.7" y="17.5" width="14.6" height="2.5" rx="1.1" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18.91-.25 1.89-.38 2.86-.38.97 0 1.95.13 2.86.38 2.18-1.49 3.14-1.18 3.14-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.13v3.16c0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function Hero({ compact }: { compact: boolean }) {
  return (
    <header className={`main-content${compact ? ' main-content--top' : ''}`}>
      {/* hero-inner is the View Transition unit: same content/size in both states, so it
          morphs by a pure translate from centered (landing) to top (compact) */}
      <div className="hero-inner">
        <img
          src={avatar(me.name)}
          alt=""
          width={64}
          height={64}
          className="avatar"
        />

        <div className="text-content">
          <h1 className="hero-hi">👋 Hi, I&rsquo;m {me.name}.</h1>
          <p>
            {me.tagline.split(/(Authorization)/).map((part, i) =>
              part === 'Authorization' ? (
                <span className="hl" key={i}>
                  {part}
                </span>
              ) : (
                part
              ),
            )}
          </p>
        </div>

        <div className="social-links">
          <a
            href={me.links.github}
            aria-label="GitHub"
            title="GitHub"
            className="social-link"
            target="_blank"
            rel="noreferrer"
          >
            <GitHubIcon />
          </a>
          <a className="social-link text-link" href={me.links.devto} target="_blank" rel="noreferrer">
            dev.to
          </a>
          <a className="social-link text-link" href={me.links.org} target="_blank" rel="noreferrer">
            0-draft
          </a>
        </div>
      </div>
    </header>
  );
}

type Flagship = {
  name: string;
  lang: string;
  version: string | null;
  stars: number;
  tagline: string;
  url: string;
};

// #1 wears the crown, #2/#3 carry their numeral. Rank is the only difference between
// them: same card, progressively smaller.
function PodiumCard({
  repo,
  rank,
  move,
  now,
  style,
}: {
  repo: Flagship;
  rank: number;
  move: Movement | undefined;
  now: string;
  style: CSSProperties;
}) {
  return (
    <li className="reveal" style={style}>
      <a className={`pod pod-${rank}`} href={repo.url} target="_blank" rel="noreferrer">
        {/* An aria-label here would REPLACE the accessible name rather than add to it, so
            the tagline, language and version below were never announced — the top three
            repos read out as less than the plain rows underneath them. The rank and star
            count are carried as visually-hidden text instead, which leaves the rest of the
            card's real content in the accessible name where it belongs. */}
        <span className="sr-only">
          Rank {rank}, {repo.stars} star{repo.stars === 1 ? '' : 's'}.
        </span>
        <span className="pod-rank-col">
          <span className="pod-rank" aria-hidden="true">
            {rank === 1 ? <CrownIcon /> : rank}
          </span>
          <RankMove m={move} />
        </span>
        <span className="pod-body">
          <span className="pod-title">
            <span className="pod-name">{repo.name}</span>
            <NewTag url={repo.url} now={now} />
          </span>
          <span className="pod-desc">{repo.tagline}</span>
          <span className="pod-meta">
            <LangDot lang={repo.lang} />
            {repo.version && <span className="m-ver">{repo.version}</span>}
          </span>
        </span>
        {/* only the glyph and the number are hidden (the sr-only rank line above already
            says the count); the gain stays outside so its sentence is announced */}
        <span className="pod-stars">
          <span className="pod-star-glyph" aria-hidden="true">
            ★
          </span>
          <b aria-hidden="true">{repo.stars}</b>
          <StarGain m={move} />
        </span>
      </a>
    </li>
  );
}

type Contribution = {
  owner: string;
  repo: string;
  number: number;
  state: string;
  domain: string;
  title: string;
  url: string;
  // landed (merged/closed) or, still open, opened — YYYY-MM-DD
  date?: string;
};

// A state marker rather than a filled badge. The old 70px block put the loudest element of
// every row in the column carrying the least information — with the default filter on,
// "MERGED" repeated in teal down the whole list and read as a stripe, not as data. The word
// stays in the DOM (color alone is not an accessible carrier); the dot does the scanning.
function Marker({ kind, label, children }: { kind: string; label: string; children?: ReactNode }) {
  return (
    <span className={`marker marker-${kind}`}>
      <i className="marker-dot" aria-hidden="true" />
      {label}
      {children}
    </span>
  );
}

// month precision: the day adds nothing a reader scanning 120 rows can use
const month = (date?: string) => date?.slice(0, 7);

function ContribRows({ items, base, now }: { items: Contribution[]; base: number; now: string }) {
  return (
    <ul className="rows">
      {items.map((c, i) => (
        <li key={c.url} className="reveal" style={{ ['--i']: base + i } as CSSProperties}>
          <a className={`row entry${isNew(c.url, now) ? ' is-new' : ''}`} href={c.url} target="_blank" rel="noreferrer">
            <Marker kind={c.state} label={c.state} />
            <span className="row-body">
              <span className="row-head">
                <span className="row-name mono" title={`${c.owner}/${c.repo}#${c.number}`}>
                  {c.owner}/<b>{c.repo}</b>
                  <span className="num">#{c.number}</span>
                  <NewTag url={c.url} now={now} />
                </span>
                <span className="row-meta-inline">
                  {c.domain && <span className="m-domain">{c.domain}</span>}
                  {c.date && (
                    <time className="m-date" dateTime={c.date} title={c.date}>
                      {month(c.date)}
                    </time>
                  )}
                </span>
              </span>
              <span className="row-desc">{c.title}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

type Advisory = {
  owner: string;
  repo: string;
  ghsa: string;
  cve?: string;
  severity: string;
  title: string;
  domain: string;
  url: string;
  cvss?: { score: number; vector: string };
  published?: string;
};

function AdvisoryRows({ items, base, now }: { items: Advisory[]; base: number; now: string }) {
  return (
    <ul className="rows">
      {items.map((a, i) => (
        <li key={a.url} className="reveal" style={{ ['--i']: base + i } as CSSProperties}>
          <a className={`row entry${isNew(a.url, now) ? ' is-new' : ''}`} href={a.url} target="_blank" rel="noreferrer">
            <Marker kind={`sev-${a.severity}`} label={a.severity}>
              {a.cvss && (
                <span className="cvss" title={a.cvss.vector}>
                  <span className="sr-only"> CVSS </span>
                  {a.cvss.score.toFixed(1)}
                </span>
              )}
            </Marker>
            <span className="row-body">
              <span className="row-head">
                <span className="row-name mono">
                  {a.owner}/<b>{a.repo}</b>
                  <NewTag url={a.url} now={now} />
                </span>
                <span className="row-meta-inline">
                  {a.cve ? (
                    <span className="cve">{a.cve}</span>
                  ) : (
                    <span className="ghsa">{a.ghsa}</span>
                  )}
                  <span className="m-domain">{a.domain}</span>
                  {a.published && (
                    <time className="m-date" dateTime={a.published} title={`published ${a.published}`}>
                      {month(a.published)}
                    </time>
                  )}
                </span>
              </span>
              <span className="row-desc">{a.title}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function MoreButton({
  expanded,
  total,
  noun,
  onClick,
  style,
}: {
  expanded: boolean;
  total: number;
  noun: string;
  onClick: () => void;
  style: CSSProperties;
}) {
  return (
    <button className="more reveal" style={style} onClick={onClick} aria-expanded={expanded}>
      <svg
        className={`more-caret${expanded ? ' up' : ''}`}
        viewBox="0 0 24 24"
        width="11"
        height="11"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m5 9 7 7 7-7" />
      </svg>
      {expanded ? 'show less' : `show all ${total} ${noun}`}
    </button>
  );
}

export function ContribCloud({
  items,
  noun,
  style,
  skipTo,
}: {
  items: Contribution[];
  noun: 'pull request' | 'issue';
  style?: CSSProperties;
  skipTo?: string;
}) {
  // total contribution footprint (all states), aggregated by org. intentionally NOT
  // tied to the state filter, so the cloud stays a stable overview while the list below
  // responds to the chips
  const ownerCounts = useMemo(
    () =>
      [
        ...items
          .reduce((m, c) => {
            m.set(c.owner, (m.get(c.owner) ?? 0) + 1);
            return m;
          }, new Map<string, number>())
          .entries(),
      ]
        .map(([owner, count]) => ({ owner, count }))
        .sort((a, b) => b.count - a.count),
    [items],
  );

  if (ownerCounts.length === 0) return null;

  const counts = ownerCounts.map((o) => o.count);
  const min = Math.min(...counts);
  const max = Math.max(...counts);

  // The counts are a long tail — one org at 5, a couple at 4, and ~34 at exactly 1. Mapping
  // them linearly pinned every single-contribution org to the floor and spent the whole size
  // range on the top three. Square-rooting the ratio lifts the tail off the floor so the
  // middle of the distribution is actually legible as a middle.
  const size = (count: number) => {
    if (max === min) return 46;
    const ratio = Math.sqrt((count - min) / (max - min));
    return Math.round(34 + ratio * 46);
  };

  return (
    <div className="cloud reveal" style={style}>
      {/* the cloud is 40-odd org links, so tabbing from the section heading to the list
          underneath meant 40-odd stops through avatars. Visible on focus only. */}
      {skipTo && (
        <a className="skip" href={`#${skipTo}`}>
          skip the {noun} cloud
        </a>
      )}
      {ownerCounts.map(({ owner, count }) => {
        const px = size(count);
        return (
          <a
            key={owner}
            className="cloud-org"
            href={`https://github.com/${owner}`}
            target="_blank"
            rel="noreferrer"
            title={`${owner} — ${count} ${noun}${count > 1 ? 's' : ''}`}
            aria-label={`${owner}, ${count} ${noun}${count > 1 ? 's' : ''}`}
            style={{ width: px }}
          >
            <img
              src={avatar(owner)}
              alt=""
              width={px}
              height={px}
              loading="lazy"
            />
            {/* a badge reading "1" on 34 of 42 avatars is noise: the count is only worth
                printing where it says something the size isn't already saying */}
            {count > 1 && (
              <span className="org-count" aria-hidden="true">
                {count}
              </span>
            )}
          </a>
        );
      })}
    </div>
  );
}

// "3 new" beside a section heading, so an addition that sorts below the preview fold is still
// announced where the reader is already looking.
// On the long lists it doubles as a filter: the lists keep their order (merged first, then
// by date), so this week's open PR can sit behind the preview fold, and one press brings
// exactly those rows up instead of reshuffling the list for everyone.
function NewCount({
  items,
  now,
  pressed,
  onToggle,
}: {
  items: { url: string }[];
  now: string;
  pressed?: boolean;
  onToggle?: () => void;
}) {
  const n = items.filter((x) => isNew(x.url, now)).length;
  if (!n) return null;
  const body = (
    <>
      <i className="new-dot" aria-hidden="true" />
      {n} new
    </>
  );
  const title = `first seen in the last ${WINDOW_DAYS} days`;
  if (!onToggle)
    return (
      <span className="sec-new" title={title}>
        {body}
      </span>
    );
  return (
    <button
      className={`sec-new as-button${pressed ? ' on' : ''}`}
      title={pressed ? 'show every row again' : `${title} — show only these`}
      aria-pressed={pressed}
      onClick={onToggle}
    >
      {body}
    </button>
  );
}

function Detail({ onClose, now }: { onClose: () => void; now: string }) {
  const moves = useMemo(() => movements(ranked, now), [now]);
  const prCount = (s: string) => contributions.filter((c) => c.state === s).length;
  // closed PRs are rejected/superseded, so hidden by default and toggleable
  const [active, setActive] = useState<Set<string>>(() => new Set(['merged', 'open']));
  const [prsExpanded, setPrsExpanded] = useState(false);
  const [issuesExpanded, setIssuesExpanded] = useState(false);
  const toggleState = (s: string) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  const [newPrsOnly, setNewPrsOnly] = useState(false);
  const [newIssuesOnly, setNewIssuesOnly] = useState(false);
  const [orgExpanded, setOrgExpanded] = useState(false);
  // discovered newest-first, so the preview is the org's latest work
  const shownOrg = orgExpanded ? org.repos : org.repos.slice(0, ORG_PREVIEW);
  const hasOrgMore = org.repos.length > ORG_PREVIEW;
  const statePrs = contributions.filter((c) => active.has(c.state));
  const visiblePrs = newPrsOnly ? statePrs.filter((c) => isNew(c.url, now)) : statePrs;
  const visibleIssues = newIssuesOnly ? issues.filter((x) => isNew(x.url, now)) : issues;
  // "new only" is already a short list, so it skips the preview cut
  const shownPrs = prsExpanded || newPrsOnly ? visiblePrs : visiblePrs.slice(0, PREVIEW_ROWS);
  const shownIssues =
    issuesExpanded || newIssuesOnly ? visibleIssues : visibleIssues.slice(0, PREVIEW_ROWS);
  const hasPrCloud = contributions.length > 0;
  const hasIssueCloud = issues.length > 0;
  const hasPrMore = !newPrsOnly && visiblePrs.length > PREVIEW_ROWS;
  const hasIssueMore = !newIssuesOnly && issues.length > PREVIEW_ROWS;

  // Stagger indices, precomputed in DOM order so every revealed element gets a monotonic
  // --i without mutating a counter mid-render (keeps render pure under Strict/concurrent).
  const at = (n: number): CSSProperties => ({ ['--i']: n } as CSSProperties);
  const cveCount = advisories.filter((a) => 'cve' in a && a.cve).length;
  const workHead = 0;
  const flagshipsStart = workHead + 1;
  const advHead = flagshipsStart + ranked.length;
  const advRowsStart = advHead + 1;
  const prHead = advRowsStart + advisories.length;
  const prRowsStart = prHead + 1 + (hasPrCloud ? 1 : 0);
  const prMoreAt = prRowsStart + shownPrs.length;
  const issuesHead = prMoreAt + (hasPrMore ? 1 : 0);
  const issueRowsStart = issuesHead + 1 + (hasIssueCloud ? 1 : 0);
  const issueMoreAt = issueRowsStart + shownIssues.length;
  const draftHead = issueMoreAt + (hasIssueMore ? 1 : 0);
  const orgBlurbAt = draftHead + 1;
  const orgReposStart = orgBlurbAt + 1;
  const orgMoreAt = orgReposStart + shownOrg.length;
  const footerAt = orgMoreAt + (hasOrgMore ? 1 : 0);

  return (
    <div className="detail">
      <section className="sec" id="work" aria-labelledby="work-h">
        <div className="sec-head reveal" style={at(workHead)}>
          <div className="label-row">
            <h2 className="label" id="work-h" tabIndex={-1}>
              selected work
            </h2>
            <NewCount items={ranked} now={now} />
          </div>
          <span className="label-note">every starred repo, most stars first</span>
        </div>
        <ol className="podium">
          {ranked.slice(0, PODIUM).map((f, i) => (
            <PodiumCard
              key={f.url}
              repo={f}
              rank={i + 1}
              move={moves.get(f.name)}
              now={now}
              style={at(flagshipsStart + i)}
            />
          ))}
        </ol>
        <ul className="rows">
          {ranked.slice(PODIUM).map((f, i) => (
            <li key={f.url} className="reveal" style={at(flagshipsStart + PODIUM + i)}>
              <a
                className={`row entry work${isNew(f.url, now) ? ' is-new' : ''}`}
                href={f.url}
                target="_blank"
                rel="noreferrer"
              >
                <span className="row-rank">
                  <span aria-hidden="true">{String(PODIUM + i + 1).padStart(2, '0')}</span>
                  <RankMove m={moves.get(f.name)} />
                </span>
                <span className="row-body">
                  <span className="row-head">
                    <span className="row-title">
                      <span className="row-name">{f.name}</span>
                      <NewTag url={f.url} now={now} />
                    </span>
                    <span className="row-meta">
                      <LangDot lang={f.lang} />
                      {f.version && <span className="m-ver">{f.version}</span>}
                      <span className="m-star">
                        ★{f.stars}
                        <StarGain m={moves.get(f.name)} />
                      </span>
                    </span>
                  </span>
                  <span className="row-desc">{f.tagline}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* the one section that gets room rather than chrome: these are real disclosed findings
          in named upstream projects, and letting them breathe against the dense lists below
          is what marks them as the strongest thing here */}
      <section className="sec sec--open sec--feature" id="advisories" aria-labelledby="advisories-h">
        <div className="sec-head reveal" style={at(advHead)}>
          <div className="label-row">
            <h2 className="label" id="advisories-h" tabIndex={-1}>
              upstream · security advisories
            </h2>
            <NewCount items={advisories} now={now} />
          </div>
          <span className="label-note">
            {advisories.length} disclosed · {cveCount} CVE{cveCount === 1 ? '' : 's'} assigned
          </span>
        </div>
        <AdvisoryRows items={advisories} base={advRowsStart} now={now} />
      </section>

      <section className="sec" id="pull-requests" aria-labelledby="pull-requests-h">
        <div className="sec-head reveal" style={at(prHead)}>
          <div className="label-row">
            <h2 className="label" id="pull-requests-h" tabIndex={-1}>
              upstream · pull requests
            </h2>
            {/* counted over the state filter, so the number always matches what pressing it shows */}
            <NewCount
              items={statePrs}
              now={now}
              pressed={newPrsOnly}
              onToggle={() => setNewPrsOnly((v) => !v)}
            />
          </div>
          <div className="filter" role="group" aria-label="filter pull requests by state">
            {PR_STATES.map((s) => (
              <button
                key={s}
                className={`chip chip-${s}${active.has(s) ? ' on' : ''}`}
                onClick={() => toggleState(s)}
                aria-pressed={active.has(s)}
              >
                {s} <span className="chip-n">{prCount(s)}</span>
              </button>
            ))}
          </div>
        </div>
        {hasPrCloud && (
          <ContribCloud
            items={contributions}
            noun="pull request"
            style={at(prHead + 1)}
            skipTo="pr-list"
          />
        )}
        <div id="pr-list" tabIndex={-1}>
          <ContribRows items={shownPrs} base={prRowsStart} now={now} />
        </div>
        {hasPrMore && (
          <MoreButton
            expanded={prsExpanded}
            total={visiblePrs.length}
            noun="pull requests"
            onClick={() => setPrsExpanded((v) => !v)}
            style={at(prMoreAt)}
          />
        )}
      </section>

      <section className="sec sec--tight" id="issues" aria-labelledby="issues-h">
        <div className="sec-head reveal" style={at(issuesHead)}>
          <div className="label-row">
            <h2 className="label" id="issues-h" tabIndex={-1}>
              upstream · issues filed
            </h2>
            <NewCount
              items={issues}
              now={now}
              pressed={newIssuesOnly}
              onToggle={() => setNewIssuesOnly((v) => !v)}
            />
          </div>
          <span className="label-note">{issues.length} bug reports &amp; proposals in external projects</span>
        </div>
        {hasIssueCloud && (
          <ContribCloud items={issues} noun="issue" style={at(issuesHead + 1)} skipTo="issue-list" />
        )}
        <div id="issue-list" tabIndex={-1}>
          <ContribRows items={shownIssues} base={issueRowsStart} now={now} />
        </div>
        {hasIssueMore && (
          <MoreButton
            expanded={issuesExpanded}
            total={issues.length}
            noun="issues"
            onClick={() => setIssuesExpanded((v) => !v)}
            style={at(issueMoreAt)}
          />
        )}
      </section>

      <section className="sec sec--open" id="0-draft" aria-labelledby="0-draft-h">
        <div className="sec-head reveal" style={at(draftHead)}>
          <div className="label-row">
            <h2 className="label" id="0-draft-h" tabIndex={-1}>
              0-draft
            </h2>
            <NewCount items={org.repos} now={now} />
          </div>
          <a className="label-note link" href={org.url} target="_blank" rel="noreferrer">
            research &amp; incubation
          </a>
        </div>
        <div className="org-intro reveal" style={at(orgBlurbAt)}>
          <a className="org-badge" href={org.url} target="_blank" rel="noreferrer" tabIndex={-1}>
            <img src={avatar('0-draft')} alt="" width={56} height={56} />
          </a>
          <p className="org-blurb">{org.blurb}</p>
        </div>
        <ul className="org-grid">
          {shownOrg.map((r, i) => (
            <li key={r.url} className="reveal" style={at(orgReposStart + i)}>
              <a className="org-card" href={r.url} target="_blank" rel="noreferrer">
                <span className="org-card-top">
                  <LangDot lang={r.lang} />
                  <NewTag url={r.url} now={now} />
                </span>
                <span className="org-card-name">{r.name}</span>
                <span className="org-card-desc">{r.blurb}</span>
              </a>
            </li>
          ))}
        </ul>
        {hasOrgMore && (
          <MoreButton
            expanded={orgExpanded}
            total={org.repos.length}
            noun="0-draft repos"
            onClick={() => setOrgExpanded((v) => !v)}
            style={at(orgMoreAt)}
          />
        )}
      </section>

      <footer className="foot reveal" style={at(footerAt)}>
        <span>
          synced {profile.meta?.syncedAt} · auto-generated from the GitHub API ·{' '}
          <a className="foot-link" href="/feed.xml">
            feed
          </a>
          <span className="foot-legend">
            <span className="new-tag">new</span> / <span className="rank-move up">▲</span> /{' '}
            <span className="star-gain">+★</span> = last {WINDOW_DAYS} days
          </span>
        </span>
        <button className="collapse" onClick={onClose}>
          <span className="kbd">esc</span> collapse
        </button>
      </footer>
    </div>
  );
}

// everything "new" on the page, for the one-line teaser on the landing
const allTracked = [...flagships, ...advisories, ...contributions, ...issues, ...org.repos];

// Sections a link can open straight to: kanywst.github.io/#advisories skips the landing.
const SECTIONS = ['work', 'advisories', 'pull-requests', 'issues', '0-draft'];
const hashSection = () => {
  const h = decodeURIComponent(window.location.hash.slice(1));
  return SECTIONS.includes(h) ? h : null;
};

export default function App() {
  const [open, setOpen] = useState(() => hashSection() !== null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const opened = useRef(false);
  // read once per mount: a badge flipping mid-visit at UTC midnight helps nobody
  const [now] = useState(todayUTC);
  const freshCount = allTracked.filter((x) => isNew(x.url, now)).length;

  // Drive the open/close state change through the View Transition API so the hero glides
  // from its centered (landing) position to the top, animated from the real measured
  // positions, no magic offset. Falls back to an instant swap where VT is unsupported
  // (e.g. Firefox) or when the user prefers reduced motion.
  const setOpenAnimated = useCallback((next: boolean | ((v: boolean) => boolean)) => {
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => unknown;
    };
    // optional-chain: matchMedia is absent in some environments (jsdom, old/SSR), so treat as no preference
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    if (doc.startViewTransition && !reduceMotion) {
      doc.startViewTransition(() => flushSync(() => setOpen(next)));
    } else {
      setOpen(next);
    }
  }, []);

  const toggle = useCallback(() => setOpenAnimated((v) => !v), [setOpenAnimated]);

  // Focus follows the swap. The element that had it (the landing, or the collapse button)
  // unmounts, which used to drop focus to <body> and leave a keyboard user at the top of an
  // unannounced page. Opening lands on the linked section's heading, or the first one;
  // closing returns to the button that opens it again.
  useEffect(() => {
    if (open) {
      const target = hashSection() ?? SECTIONS[0];
      const heading = document.getElementById(`${target}-h`);
      heading?.focus({ preventScroll: true });
      if (hashSection()) document.getElementById(target)?.scrollIntoView?.();
    } else if (opened.current) {
      moreRef.current?.focus();
      // collapsing drops a section hash, so a reload lands where the reader now is
      if (hashSection()) history.replaceState(null, '', window.location.pathname);
    }
    opened.current ||= open;
  }, [open]);

  useEffect(() => {
    const onHash = () => {
      if (hashSection()) setOpenAnimated(true);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [setOpenAnimated]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        // collapsed already: nothing to close, and no view transition to run for nothing
        if (open) setOpenAnimated(false);
        return;
      }
      // Space only *opens* (collapsed → detail). Once open the page can be long,
      // so let Space scroll natively and use Esc / the button to collapse.
      // Use e.key (layout/IME aware) and skip while composing.
      if (e.key !== ' ' || open || e.isComposing) return;
      const target = e.target;
      if (
        target instanceof Element &&
        target.closest('a, button, input, textarea, select, [contenteditable]')
      ) {
        return;
      }
      e.preventDefault();
      setOpenAnimated(true);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpenAnimated]);

  return (
    <main className="container">
      {open ? (
        <>
          <Hero compact />
          <Detail onClose={() => setOpenAnimated(false)} now={now} />
        </>
      ) : (
        // A click anywhere still opens it, as a mouse convenience. The landing used to be one
        // big role="button" with the three hero links nested inside it — interactive content
        // inside a button, and an aria-label that replaced the hero's own text. The real
        // control is now the "more" button; the wrapper is only a click target.
        <div
          className="landing"
          onClick={(e) => {
            // don't toggle when a nested link (GitHub / dev.to / 0-draft) is clicked
            if ((e.target as HTMLElement).closest('a, button')) return;
            toggle();
          }}
        >
          <Hero compact={false} />
          <div className="hint">
            <button
              ref={moreRef}
              type="button"
              className="hint-more"
              aria-expanded={false}
              onClick={toggle}
            >
              <span className="kbd" aria-hidden="true">
                space
              </span>
              <span>more</span>
            </button>
            {freshCount > 0 && (
              <span className="hint-new">
                <i className="new-dot" aria-hidden="true" />
                {freshCount} new this week
              </span>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
