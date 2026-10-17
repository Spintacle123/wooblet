import { test, expect } from '@playwright/test';

test('public routes show the launch preview without storefront controls', async ({ page }) => {
  const catalogRequests: string[] = [];
  page.on('request', request => {
    if (/\/api\/products(?:\?|$)/.test(request.url())) catalogRequests.push(request.url());
  });
  for (const route of ['/', '/shop', '/shop/wooblets', '/cart', '/checkout']) {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Good things takea little wooble.');
    await expect(page.getByRole('timer')).toBeVisible();
    await expect(page.getByRole('timer')).not.toContainText('–');
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /Shopping bag/ })).toHaveCount(0);
    await expect(page.getByRole('article')).toHaveCount(3);
  }
  expect(catalogRequests).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.screenshot({ path: 'test-results/launch-preview-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'test-results/launch-preview-desktop.png', fullPage: true });
  await page.goto('/login');
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
});
