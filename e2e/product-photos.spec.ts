import { test, expect } from '@playwright/test';

test('admin uploads product photos, chooses a cover, and saves the gallery', async ({ page }) => {
  const photo = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jL1sAAAAASUVORK5CYII=', 'base64');
  let uploaded = 0;
  // Exercise the form without writing test files to production object storage.
  await page.route('**/api/uploads/image', async route => {
    expect(route.request().headers()['content-type']).toContain('multipart/form-data');
    uploaded += 1;
    await route.fulfill({ json: { url: `http://localhost:3300/test-photo-${uploaded}.png` } });
  });
  await page.route('**/test-photo-*.png', route => route.fulfill({ contentType: 'image/png', body: photo }));
  await page.goto('/login?next=%2Fadmin');
  await page.getByLabel('Email address').fill('studio@example.com');
  await page.getByLabel('Password').fill('browser-test-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto('/admin/products');
  await page.getByRole('button', { name: 'New product' }).click();
  await page.getByLabel('Name', { exact: true }).fill('Photo test product');
  await page.getByLabel('Slug', { exact: true }).fill('photo-test-product');
  const gallery = page.getByRole('region', { name: 'Product photo gallery' });
  const input = page.getByLabel('Product photos', { exact: true });
  await input.setInputFiles({ name: 'invalid.txt', mimeType: 'text/plain', buffer: Buffer.from('invalid') });
  await expect(gallery.getByRole('alert')).toContainText('Choose JPEG, PNG, or WebP');
  expect(uploaded).toBe(0);
  await input.setInputFiles([
    { name: 'front.png', mimeType: 'image/png', buffer: photo },
    { name: 'back.png', mimeType: 'image/png', buffer: photo },
  ]);
  await expect(gallery.getByRole('status')).toHaveText('2 of 10 photos');
  await expect(page.getByAltText('Product photo 1', { exact: true })).toHaveAttribute('src', /test-photo-1.png$/);
  await page.getByRole('button', { name: 'Make cover' }).nth(1).click();
  await expect(page.getByAltText('Product photo 1', { exact: true })).toHaveAttribute('src', /test-photo-2.png$/);
  await page.getByRole('button', { name: 'Save product', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'New little design' })).toHaveCount(0);
  await page.reload();
  await page.locator('.list-row').filter({ hasText: 'Photo test product' }).getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(page.getByAltText('Product photo 1', { exact: true })).toHaveAttribute('src', /test-photo-2.png$/);
  await page.getByRole('button', { name: 'Remove product photo 2' }).click();
  await page.getByRole('button', { name: 'Save product', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Edit product', exact: true })).toHaveCount(0);
  await page.reload();
  await page.locator('.list-row').filter({ hasText: 'Photo test product' }).getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(gallery.getByRole('status')).toHaveText('1 of 10 photos');
});
