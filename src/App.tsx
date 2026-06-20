import { useCallback, useEffect, useState } from 'react';
import profile from './data/profile.json';

const { profile: me, flagships, org, contributions, issues } = profile;

const PR_STATES = ['merged', 'open', 'closed'] as const;

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
    </header>
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

function ContribRows({ items, base }: { items: Contribution[]; base: number }) {
  return (
    <ul className="rows">
      {items.map((c, i) => (
        <li key={c.url} className="reveal" style={{ ['--i' as string]: base + i }}>
          <a className="row contrib" href={c.url} target="_blank" rel="noreferrer">
            <span className={`tag tag-${c.state}`}>{c.state}</span>
            <span className="row-name mono">
              {c.owner}/<b>{c.repo}</b>
              <span className="num">#{c.number}</span>
            </span>
            <span className="row-desc">{c.title}</span>
            <span className="row-meta">{c.domain}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function Detail({ onClose }: { onClose: () => void }) {
  const prCount = (s: string) => contributions.filter((c) => c.state === s).length;
  // closed PRs are rejected/superseded — hidden by default, toggleable
  const [active, setActive] = useState<Set<string>>(() => new Set(['merged', 'open']));
  const toggleState = (s: string) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  const visiblePrs = contributions.filter((c) => active.has(c.state));

  let step = 0;
  const delay = () => ({ ['--i' as string]: step++ });

  return (
    <div className="detail">
      <section className="sec">
        <div className="sec-head reveal" style={delay()}>
          <h2 className="label">selected work</h2>
          <span className="label-note">tools &amp; reference implementations</span>
        </div>
        <ul className="rows">
          {flagships.map((f) => (
            <li key={f.url} className="reveal" style={delay()}>
              <a className="row" href={f.url} target="_blank" rel="noreferrer">
                <span className="row-name">{f.name}</span>
                <span className="row-desc">{f.tagline}</span>
                <span className="row-meta">
                  <span className="m-lang">{f.lang}</span>
                  {f.version && <span className="m-ver">{f.version}</span>}
                  {f.stars > 0 && <span className="m-star">★{f.stars}</span>}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="sec">
        <div className="sec-head reveal" style={delay()}>
          <h2 className="label">upstream — pull requests</h2>
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
        <ContribRows items={visiblePrs} base={2} />
      </section>

      <section className="sec">
        <div className="sec-head reveal" style={delay()}>
          <h2 className="label">upstream — issues filed</h2>
          <span className="label-note">{issues.length} bug reports &amp; proposals in external projects</span>
        </div>
        <ContribRows items={issues} base={2} />
      </section>

      <section className="sec">
        <div className="sec-head reveal" style={delay()}>
          <h2 className="label">0-draft</h2>
          <a className="label-note link" href={org.url} target="_blank" rel="noreferrer">
            research &amp; incubation →
          </a>
        </div>
        <p className="org-blurb reveal" style={delay()}>
          {org.blurb}
        </p>
        <ul className="rows">
          {org.repos.map((r) => (
            <li key={r.url} className="reveal" style={delay()}>
              <a className="row" href={r.url} target="_blank" rel="noreferrer">
                <span className="row-name mono">{r.name}</span>
                <span className="row-desc">{r.blurb}</span>
                <span className="row-meta">{r.lang}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <footer className="foot reveal" style={delay()}>
        <span>synced {profile.meta.syncedAt} · auto-generated from the GitHub &amp; dev.to APIs</span>
        <button className="collapse" onClick={onClose}>
          <span className="kbd">esc</span> collapse
        </button>
      </footer>
    </div>
  );
}

export default function App() {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      // Space only *opens* (collapsed → detail). Once open the page can be long,
      // so let Space scroll natively and use Esc / the button to collapse.
      if (e.code !== 'Space' || open) return;
      const target = e.target as HTMLElement;
      const tag = target?.tagName;
      if (
        tag === 'BUTTON' ||
        tag === 'A' ||
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return;
      }
      e.preventDefault();
      setOpen(true);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    document.body.classList.toggle('is-open', open);
    return () => document.body.classList.remove('is-open');
  }, [open]);

  return (
    <main className={`container${open ? ' is-open' : ''}`}>
      {open ? (
        <>
          <Hero compact />
          <Detail onClose={() => setOpen(false)} />
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
