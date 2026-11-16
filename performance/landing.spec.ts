import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { expect, test } from '../e2e/fixtures/test';

test('keeps the production JavaScript and CSS within the compressed size budget', async () => {
  const assets = join(process.cwd(), 'dist/cpa-landing/en-US/assets');
  const files = (await readdir(assets)).filter((file) => /\.(js|css)$/.test(file));
  expect(files.length).toBeGreaterThan(0);
  const sizes = await Promise.all(
    files.map(async (file) => gzipSync(await readFile(join(assets, file))).length),
  );
  expect(sizes.reduce((total, size) => total + size, 0)).toBeLessThanOrEqual(200 * 1024);
});

test('renders the landing hero within the response budget', async ({ page, api }, testInfo) => {
  // Accessing the fixture installs API mocks before navigation.
  expect(api).toBeDefined();
  const start = Date.now();
  await page.goto('/en', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1, name: /practice makes profit/i })).toBeVisible(
    { timeout: 15_000 },
  );
  const elapsed = Date.now() - start;
  await testInfo.attach('hero-render-time', { body: `${elapsed} ms`, contentType: 'text/plain' });
  expect(elapsed).toBeLessThan(15_000);
});
