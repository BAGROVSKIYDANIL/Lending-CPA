import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test } from '../e2e/fixtures/test';

test('limits the resources and DOM used to render the landing page', async ({
  page,
  api,
}, testInfo) => {
  expect(api).toBeDefined();
  await page.goto('/en', { waitUntil: 'load' });
  await expect(
    page.getByRole('heading', { level: 1, name: /practice makes profit/i }),
  ).toBeVisible();

  const metrics = await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const local = resources.filter((resource) => new URL(resource.name).origin === location.origin);
    return {
      requests: local.length,
      decodedBytes: local.reduce((total, resource) => total + resource.decodedBodySize, 0),
      domElements: document.querySelectorAll('*').length,
      resources: local.map(({ name, decodedBodySize }) => ({ name, decodedBodySize })),
    };
  });

  await testInfo.attach('landing-resources.json', {
    body: JSON.stringify(metrics, null, 2),
    contentType: 'application/json',
  });
  expect(metrics.requests).toBeGreaterThan(0);
  expect(metrics.decodedBytes).toBeGreaterThan(0);
  expect(metrics.requests).toBeLessThanOrEqual(60);
  expect(metrics.decodedBytes).toBeLessThanOrEqual(3 * 1024 * 1024);
  expect(metrics.domElements).toBeLessThanOrEqual(1500);
});

test('loads the not-found route chunk only when the route is opened', async ({ page, api }) => {
  expect(api).toBeDefined();
  const assets = await readdir(join(process.cwd(), 'dist/cpa-landing/en-US/assets'));
  const routeChunk = assets.find((file) => /^not-found-.*\.js$/.test(file));
  expect(routeChunk).toBeDefined();
  const requested = new Set<string>();
  page.on('request', (request) =>
    requested.add(new URL(request.url()).pathname.split('/').pop() ?? ''),
  );

  await page.goto('/en', { waitUntil: 'load' });
  await expect(
    page.getByRole('heading', { level: 1, name: /practice makes profit/i }),
  ).toBeVisible();
  expect(requested.has(routeChunk!)).toBe(false);

  await page.goto('/en/404', { waitUntil: 'load' });
  await expect.poll(() => requested.has(routeChunk!)).toBe(true);
});
