import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// serious/critical only: the page has to pass these, and moderate findings on a dark,
// contrast-tuned palette are worth reading but not worth failing CI over
async function axe(page: import('@playwright/test').Page) {
  // let the staggered .reveal entrance finish: mid-fade text is partly transparent, and axe
  // would measure the contrast of a frame no reader ever stops on
  // (the landing's breathing "space" key loops forever, so only finite animations count)
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity),
  );
  const { violations } = await new AxeBuilder({ page }).analyze();
  return violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

test('landing has an h1, a real open button, and no serious axe findings', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hi, I');
  await expect(page.getByRole('button', { name: /more/ })).toHaveAttribute('aria-expanded', 'false');
  expect(await axe(page)).toEqual([]);
});

test('Space opens the detail on its first heading; Escape returns focus', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Space');
  await expect(page.getByRole('heading', { name: 'selected work' })).toBeFocused();
  expect(await axe(page)).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: /more/ })).toBeFocused();
});

test('a section hash opens the detail at that section', async ({ page }) => {
  await page.goto('/#advisories');
  const heading = page.getByRole('heading', { name: /security advisories/ });
  await expect(heading).toBeFocused();
  await expect(heading).toBeInViewport();
});

test('without JS the prerendered copy carries every section and row', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 2 })).toHaveCount(5);
  await expect(page.locator('.noscript-detail .filter, .noscript-detail .more')).toHaveCount(0);
  await expect(page.locator('.hint')).toBeHidden();
  await ctx.close();
});
