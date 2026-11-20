import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App, { ContribCloud } from './App';
import profile from './data/profile.json';
import history from './data/history.json';

const prSection = () =>
  screen.getByRole('heading', { name: /pull requests/ }).closest('section') as HTMLElement;
const contribRows = (root: HTMLElement) => root.querySelectorAll('.row.entry').length;

type Item = {
  owner: string;
  repo: string;
  number: number;
  state: string;
  domain: string;
  title: string;
  url: string;
};

const item = (owner: string, n: number): Item => ({
  owner,
  repo: 'repo',
  number: n,
  state: 'merged',
  domain: 'authz',
  title: `pr ${n}`,
  url: `https://github.com/${owner}/repo/pull/${n}`,
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('App landing → detail', () => {
  it('shows the hero and the space hint on the landing', () => {
    render(<App />);
    expect(screen.getByText(/Hi, I/)).toBeInTheDocument();
    expect(screen.getByText('more')).toBeInTheDocument();
    // detail is collapsed initially
    expect(screen.queryByRole('heading', { name: 'selected work' })).not.toBeInTheDocument();
  });

  it('reveals the detail on Space and collapses on Escape', () => {
    render(<App />);

    fireEvent.keyDown(window, { key: ' ' });
    expect(screen.getByRole('heading', { name: 'selected work' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /pull requests/ })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('heading', { name: 'selected work' })).not.toBeInTheDocument();
  });

  it('hides closed PRs by default and reveals exactly them when toggled on', () => {
    const closedCount = profile.contributions.filter((c) => c.state === 'closed').length;
    render(<App />);
    fireEvent.keyDown(window, { key: ' ' });

    // merged + open are on by default, closed is off
    expect(screen.getByRole('button', { name: /^merged/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /^open/ })).toHaveAttribute('aria-pressed', 'true');
    const closed = screen.getByRole('button', { name: /^closed/ });
    expect(closed).toHaveAttribute('aria-pressed', 'false');

    // the list renders a preview slice, so expand it first: filtering is only observable in full
    fireEvent.click(within(prSection()).getByRole('button', { name: /show all/ }));

    // toggling closed reveals exactly the closed rows, i.e. the actual filtering, not just chip state
    const before = contribRows(prSection());
    fireEvent.click(closed);
    expect(closed).toHaveAttribute('aria-pressed', 'true');
    expect(contribRows(prSection()) - before).toBe(closedCount);
  });

  it('previews the PR list and expands to the full set on demand', () => {
    const visible = profile.contributions.filter((c) => c.state !== 'closed').length;
    render(<App />);
    fireEvent.keyDown(window, { key: ' ' });

    const preview = contribRows(prSection());
    expect(preview).toBeLessThan(visible);

    const more = within(prSection()).getByRole('button', { name: /show all/ });
    expect(more).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(more);
    expect(contribRows(prSection())).toBe(visible);

    const less = within(prSection()).getByRole('button', { name: /show less/ });
    expect(less).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(less);
    expect(contribRows(prSection())).toBe(preview);
  });

  it('ranks selected work by stars, podiuming the top three', () => {
    const byStars = [...profile.flagships].sort(
      (a, b) => b.stars - a.stars || a.name.localeCompare(b.name),
    );
    render(<App />);
    fireEvent.keyDown(window, { key: ' ' });

    const section = screen
      .getByRole('heading', { name: 'selected work' })
      .closest('section') as HTMLElement;

    const podium = [...section.querySelectorAll('.pod')];
    expect(podium).toHaveLength(3);
    expect(podium.map((p) => p.querySelector('.pod-name')!.textContent)).toEqual(
      byStars.slice(0, 3).map((f) => f.name),
    );
    // rank 1 wears the crown, the runners-up carry their numeral
    expect(podium[0].querySelector('.pod-rank svg')).not.toBeNull();
    expect(podium[1].querySelector('.pod-rank')!.textContent).toBe('2');

    // the remainder keeps descending, and every entry on the page has at least one star
    const rest = [...section.querySelectorAll('.row.work .row-name')].map((n) => n.textContent);
    expect(rest).toEqual(byStars.slice(3).map((f) => f.name));
    expect(profile.flagships.every((f) => f.stars > 0)).toBe(true);
  });

  it('renders one advisory row per entry and badges exactly the CVE-bearing ones', () => {
    const cveCount = profile.advisories.filter((a) => 'cve' in a && a.cve).length;
    render(<App />);
    fireEvent.keyDown(window, { key: ' ' });

    const section = screen
      .getByRole('heading', { name: /security advisories/ })
      .closest('section') as HTMLElement;
    expect(section.querySelectorAll('.row.entry')).toHaveLength(profile.advisories.length);
    expect(section.querySelectorAll('.row-meta-inline .cve')).toHaveLength(cveCount);
  });

  it('keeps the contribution cloud stable when the state filter changes', () => {
    render(<App />);
    fireEvent.keyDown(window, { key: ' ' });

    // the cloud is a full-footprint overview, intentionally not tied to the chips
    const cloudBefore = prSection().querySelectorAll('.cloud-org').length;
    fireEvent.click(screen.getByRole('button', { name: /^closed/ }));
    expect(prSection().querySelectorAll('.cloud-org').length).toBe(cloudBefore);
  });
});

describe('ContribCloud aggregation', () => {
  it('renders one avatar per distinct owner, sorted by count desc', () => {
    const { container } = render(
      <ContribCloud
        items={[item('alpha', 1), item('alpha', 2), item('alpha', 3), item('beta', 4)]}
        noun="pull request"
      />,
    );
    const orgs = [...container.querySelectorAll<HTMLAnchorElement>('.cloud-org')];
    expect(orgs).toHaveLength(2);
    expect(orgs.map((a) => a.getAttribute('href'))).toEqual([
      'https://github.com/alpha',
      'https://github.com/beta',
    ]);
    // a printed count only earns its place where it says something the size doesn't:
    // "1" on every single-contribution org is noise, so only counts above 1 get a badge
    expect(within(orgs[0]).getByText('3')).toBeInTheDocument();
    expect(orgs[1].querySelector('.org-count')).toBeNull();
    // ...but the count stays in the accessible name for every org, badge or not
    expect(orgs[1].getAttribute('aria-label')).toBe('beta, 1 pull request');
    // the busier org is drawn larger
    const sizeOf = (a: HTMLAnchorElement) => Number(a.querySelector('img')!.getAttribute('width'));
    expect(sizeOf(orgs[0])).toBeGreaterThan(sizeOf(orgs[1]));
  });

  it('falls back to a uniform size when every owner is tied', () => {
    const { container } = render(
      <ContribCloud items={[item('a', 1), item('b', 2), item('c', 3)]} noun="pull request" />,
    );
    const widths = [...container.querySelectorAll('.cloud-org img')].map((img) =>
      img.getAttribute('width'),
    );
    expect(new Set(widths).size).toBe(1);
  });

  it('pluralizes the noun in the accessible label by count', () => {
    const { container } = render(
      <ContribCloud items={[item('solo', 1), item('many', 2), item('many', 3)]} noun="issue" />,
    );
    const labels = [...container.querySelectorAll('.cloud-org')].map((a) =>
      a.getAttribute('aria-label'),
    );
    expect(labels).toContain('many, 2 issues');
    expect(labels).toContain('solo, 1 issue');
  });

  it('renders nothing when there are no items', () => {
    const { container } = render(<ContribCloud items={[]} noun="issue" />);
    expect(container.querySelector('.cloud')).toBeNull();
  });
});

describe('this-week marks', () => {
  afterEach(() => vi.useRealTimers());

  const dated = Object.entries(history.firstSeen as Record<string, string>).filter(
    ([, d]) => d !== '1970-01-01',
  );
  const prUrls = new Set(profile.contributions.map((c) => c.url));
  const newestPr = dated.filter(([u]) => prUrls.has(u)).sort(([, a], [, b]) => b.localeCompare(a))[0];

  it('shows nothing new once the window has passed', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2100-01-01T12:00:00Z'));
    render(<App />);
    expect(screen.queryByText(/new this week/)).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: ' ' });
    expect(document.querySelectorAll('.new-tag:not(.foot-legend .new-tag)').length).toBe(0);
  });

  it.runIf(newestPr)('tags a PR first seen today and filters to the new ones on demand', () => {
    const [url, day] = newestPr!;
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(`${day}T12:00:00Z`));
    render(<App />);
    expect(screen.getByText(/new this week/)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: ' ' });

    const sec = prSection();
    const toggle = within(sec).getByRole('button', { name: /\d+ new/ });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');

    const rows = [...sec.querySelectorAll('a.row.entry')];
    expect(rows.length).toBeGreaterThan(0);
    // every row left is a new one, and the newest PR is among them
    for (const r of rows) expect(r.classList.contains('is-new')).toBe(true);
    expect(rows.some((r) => r.getAttribute('href') === url)).toBe(true);
  });
});

describe('deep links and focus', () => {
  afterEach(() => window.history.replaceState(null, '', '/'));

  it('opens straight to a section named in the URL hash and focuses its heading', () => {
    window.history.replaceState(null, '', '/#advisories');
    render(<App />);
    const heading = screen.getByRole('heading', { name: /security advisories/ });
    expect(heading).toHaveFocus();
    expect(heading.closest('section')).toHaveAttribute('id', 'advisories');
  });

  it('ignores a hash that is not a section', () => {
    window.history.replaceState(null, '', '/#nope');
    render(<App />);
    expect(screen.queryByRole('heading', { name: 'selected work' })).not.toBeInTheDocument();
  });

  it('opens from a real button, focuses the first section, and returns focus on Escape', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Hi, I/);
    fireEvent.click(screen.getByRole('button', { name: /more/ }));
    expect(screen.getByRole('heading', { name: 'selected work' })).toHaveFocus();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.getByRole('button', { name: /more/ })).toHaveFocus();
  });
});

describe('malformed hash', () => {
  afterEach(() => window.history.replaceState(null, '', '/'));
  it('renders the landing instead of throwing on a broken percent escape', () => {
    window.history.replaceState(null, '', '/#%E0%A4%A');
    render(<App />);
    expect(screen.getByText(/Hi, I/)).toBeInTheDocument();
  });
});

describe('keyboard chords', () => {
  it('ignores Space and Escape pressed with a modifier', () => {
    render(<App />);
    fireEvent.keyDown(window, { key: ' ', ctrlKey: true });
    expect(screen.queryByRole('heading', { name: 'selected work' })).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: ' ' });
    fireEvent.keyDown(window, { key: 'Escape', metaKey: true });
    expect(screen.getByRole('heading', { name: 'selected work' })).toBeInTheDocument();
  });
});
