import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { flushSync } from 'react-dom';
import profile from './data/profile.json';

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
  List: '#8b8b93',
};

function LangDot({ lang }: { lang: string }) {
  if (!lang) return null;
  return (
    <span className="lang">
      <i className="lang-dot" style={{ background: LANG_COLOR[lang] ?? 'var(--faint)' }} />
      {lang}
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
          src="https://github.com/kanywst.png?size=160"
          alt=""
          width={64}
          height={64}
          className="avatar"
        />

        <div className="text-content">
          <p>👋 Hi, I&rsquo;m {me.name}.</p>
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
function PodiumCard({ repo, rank, style }: { repo: Flagship; rank: number; style: CSSProperties }) {
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
        <span className="pod-rank" aria-hidden="true">
          {rank === 1 ? <CrownIcon /> : rank}
        </span>
        <span className="pod-body">
          <span className="pod-name">{repo.name}</span>
          <span className="pod-desc">{repo.tagline}</span>
          <span className="pod-meta">
            <LangDot lang={repo.lang} />
            {repo.version && <span className="m-ver">{repo.version}</span>}
          </span>
        </span>
        <span className="pod-stars" aria-hidden="true">
          <span className="pod-star-glyph">★</span>
          <b>{repo.stars}</b>
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
};

// A state marker rather than a filled badge. The old 70px block put the loudest element of
// every row in the column carrying the least information — with the default filter on,
// "MERGED" repeated in teal down the whole list and read as a stripe, not as data. The word
// stays in the DOM (color alone is not an accessible carrier); the dot does the scanning.
function Marker({ kind, label }: { kind: string; label: string }) {
  return (
    <span className={`marker marker-${kind}`}>
      <i className="marker-dot" aria-hidden="true" />
      {label}
    </span>
  );
}

function ContribRows({ items, base }: { items: Contribution[]; base: number }) {
  return (
    <ul className="rows">
      {items.map((c, i) => (
        <li key={c.url} className="reveal" style={{ ['--i']: base + i } as CSSProperties}>
          <a className="row entry" href={c.url} target="_blank" rel="noreferrer">
            <Marker kind={c.state} label={c.state} />
            <span className="row-body">
              <span className="row-head">
                <span className="row-name mono" title={`${c.owner}/${c.repo}#${c.number}`}>
                  {c.owner}/<b>{c.repo}</b>
                  <span className="num">#{c.number}</span>
                </span>
                {c.domain && <span className="m-domain">{c.domain}</span>}
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
};

function AdvisoryRows({ items, base }: { items: Advisory[]; base: number }) {
  return (
    <ul className="rows">
      {items.map((a, i) => (
        <li key={a.url} className="reveal" style={{ ['--i']: base + i } as CSSProperties}>
          <a className="row entry" href={a.url} target="_blank" rel="noreferrer">
            <Marker kind={`sev-${a.severity}`} label={a.severity} />
            <span className="row-body">
              <span className="row-head">
                <span className="row-name mono">
                  {a.owner}/<b>{a.repo}</b>
                </span>
                <span className="row-meta-inline">
                  {a.cve ? (
                    <span className="cve">{a.cve}</span>
                  ) : (
                    <span className="ghsa">{a.ghsa}</span>
                  )}
                  <span className="m-domain">{a.domain}</span>
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
              src={`https://github.com/${owner}.png?size=160`}
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

function Detail({ onClose }: { onClose: () => void }) {
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
  const visiblePrs = contributions.filter((c) => active.has(c.state));
  const shownPrs = prsExpanded ? visiblePrs : visiblePrs.slice(0, PREVIEW_ROWS);
  const shownIssues = issuesExpanded ? issues : issues.slice(0, PREVIEW_ROWS);
  const hasPrCloud = contributions.length > 0;
  const hasIssueCloud = issues.length > 0;
  const hasPrMore = visiblePrs.length > PREVIEW_ROWS;
  const hasIssueMore = issues.length > PREVIEW_ROWS;

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
  const footerAt = orgReposStart + org.repos.length;

  return (
    <div className="detail">
      <section className="sec">
        <div className="sec-head reveal" style={at(workHead)}>
          <h2 className="label">selected work</h2>
          <span className="label-note">every starred repo, most stars first</span>
        </div>
        <ol className="podium">
          {ranked.slice(0, PODIUM).map((f, i) => (
            <PodiumCard key={f.url} repo={f} rank={i + 1} style={at(flagshipsStart + i)} />
          ))}
        </ol>
        <ul className="rows">
          {ranked.slice(PODIUM).map((f, i) => (
            <li key={f.url} className="reveal" style={at(flagshipsStart + PODIUM + i)}>
              <a className="row entry work" href={f.url} target="_blank" rel="noreferrer">
                <span className="row-rank" aria-hidden="true">
                  {String(PODIUM + i + 1).padStart(2, '0')}
                </span>
                <span className="row-body">
                  <span className="row-head">
                    <span className="row-name">{f.name}</span>
                    <span className="row-meta">
                      <LangDot lang={f.lang} />
                      {f.version && <span className="m-ver">{f.version}</span>}
                      <span className="m-star">★{f.stars}</span>
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
      <section className="sec sec--open sec--feature">
        <div className="sec-head reveal" style={at(advHead)}>
          <h2 className="label">upstream · security advisories</h2>
          <span className="label-note">
            {advisories.length} disclosed · {cveCount} CVE{cveCount === 1 ? '' : 's'} assigned
          </span>
        </div>
        <AdvisoryRows items={advisories} base={advRowsStart} />
      </section>

      <section className="sec">
        <div className="sec-head reveal" style={at(prHead)}>
          <h2 className="label">upstream · pull requests</h2>
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
          <ContribRows items={shownPrs} base={prRowsStart} />
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

      <section className="sec sec--tight">
        <div className="sec-head reveal" style={at(issuesHead)}>
          <h2 className="label">upstream · issues filed</h2>
          <span className="label-note">{issues.length} bug reports &amp; proposals in external projects</span>
        </div>
        {hasIssueCloud && (
          <ContribCloud items={issues} noun="issue" style={at(issuesHead + 1)} skipTo="issue-list" />
        )}
        <div id="issue-list" tabIndex={-1}>
          <ContribRows items={shownIssues} base={issueRowsStart} />
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

      <section className="sec sec--open">
        <div className="sec-head reveal" style={at(draftHead)}>
          <h2 className="label">0-draft</h2>
          <a className="label-note link" href={org.url} target="_blank" rel="noreferrer">
            research &amp; incubation
          </a>
        </div>
        <div className="org-intro reveal" style={at(orgBlurbAt)}>
          <a className="org-badge" href={org.url} target="_blank" rel="noreferrer" tabIndex={-1}>
            <img src="https://github.com/0-draft.png?size=160" alt="" width={56} height={56} />
          </a>
          <p className="org-blurb">{org.blurb}</p>
        </div>
        <ul className="org-grid">
          {org.repos.map((r, i) => (
            <li key={r.url} className="reveal" style={at(orgReposStart + i)}>
              <a className="org-card" href={r.url} target="_blank" rel="noreferrer">
                <LangDot lang={r.lang} />
                <span className="org-card-name">{r.name}</span>
                <span className="org-card-desc">{r.blurb}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <footer className="foot reveal" style={at(footerAt)}>
        <span>synced {profile.meta?.syncedAt} · auto-generated from the GitHub &amp; dev.to APIs</span>
        <button className="collapse" onClick={onClose}>
          <span className="kbd">esc</span> collapse
        </button>
      </footer>
    </div>
  );
}

export default function App() {
  const [open, setOpen] = useState(false);

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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpenAnimated(false);
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
          <Detail onClose={() => setOpenAnimated(false)} />
        </>
      ) : (
        <div
          className="landing"
          onClick={(e) => {
            // don't toggle when a nested link (GitHub / dev.to / 0-draft) is clicked
            if ((e.target as HTMLElement).closest('a, button')) return;
            toggle();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              toggle();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Open profile details"
        >
          <Hero compact={false} />
          <div className="hint">
            <span className="kbd">space</span>
            <span>more</span>
          </div>
        </div>
      )}
    </main>
  );
}
