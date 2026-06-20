import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App, { ContribCloud } from './App';
import profile from './data/profile.json';

const prSection = () =>
  screen.getByRole('heading', { name: /pull requests/ }).closest('section') as HTMLElement;
const contribRows = (root: HTMLElement) => root.querySelectorAll('.row.contrib').length;

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

    // toggling closed reveals exactly the closed rows — the actual filtering, not just chip state
    const before = contribRows(prSection());
    fireEvent.click(closed);
    expect(closed).toHaveAttribute('aria-pressed', 'true');
    expect(contribRows(prSection()) - before).toBe(closedCount);
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
    // count badges
    expect(orgs.map((a) => within(a).getByText(/^[0-9]+$/).textContent)).toEqual(['3', '1']);
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
