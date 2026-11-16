import { test, expect } from './fixtures/test';
import { isMobileProject, openLanding, waitForHero } from './helpers/app';

test('shows loading state for a controlled delayed response and then renders data', async ({
  page,
  api,
}) => {
  const release = api.delayNext('tasks');
  await openLanding(page, '/en#team');
  const loading = page.getByRole('status').filter({ hasText: 'Loading tasks' });
  await expect(loading).toBeAttached();
  release();
  await expect(page.getByText('Research', { exact: true })).toBeAttached();
  await expect(loading).toHaveCount(0);
});

test('sends localized API requests with a configured key header', async ({ page, api }) => {
  await openLanding(page, '/ua');
  await expect.poll(() => api.requests.length).toBeGreaterThanOrEqual(3);
  expect(api.requests.every((request) => request.hasApiKey)).toBe(true);
  expect(
    api.requests
      .filter((request) => request.endpoint !== 'form')
      .every((request) => request.language === 'ua'),
  ).toBe(true);
});

test('rejects an invalid API response and shows the shared fallback', async ({ page, api }) => {
  api.queue('benefits', { body: null });
  await openLanding(page, '/en#benefits');
  await expect(page.getByRole('dialog', { name: 'Unexpected server response' })).toBeVisible();
  await expect(page.getByText('The service returned data in an unsupported format.')).toBeVisible();
});

test('retries failed section content without contacting the real backend', async ({
  page,
  api,
}) => {
  api.queue('multiply', { status: 503, body: { message: 'unavailable' } });
  await openLanding(page, '/en#join');
  await expect(page.getByRole('dialog', { name: 'Service temporarily unavailable' })).toBeVisible();
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByText('Apply to the team')).toBeVisible();
  expect(api.requests.filter((request) => request.endpoint === 'multiply')).toHaveLength(2);
});

test('does not render a stale response after switching language', async ({
  page,
  api,
}, testInfo) => {
  test.skip(isMobileProject(testInfo), 'The request cancellation path is viewport-independent.');
  test.fixme(true, 'Known product defect: a delayed locale request can block language routing.');
  api.queue('tasks', {
    delayMs: 6_000,
    body: {
      description: 'A stale English response',
      tiles: [{ title: 'STALE ENGLISH', text: 'This content must never be rendered' }],
    },
  });
  await openLanding(page, '/en');
  await waitForHero(page);
  await page.getByRole('link', { name: 'рус', exact: true }).click();
  await expect(page).toHaveURL(/\/ru$/);

  await page.getByRole('link', { name: 'Команда', exact: true }).click();
  await expect(page).toHaveURL(/\/ru#team$/);
  await expect(page.getByText('Анализ', { exact: true })).toBeVisible();
  await expect(page.getByText('STALE ENGLISH', { exact: true })).toHaveCount(0);
});

test('records native animation mechanisms without relying on frame timing', async ({
  page,
  api,
}, testInfo) => {
  await openLanding(page, '/en#benefits');
  const marquee = page.locator('.benefits-marquee__track');
  await expect(marquee).toBeAttached();
  await expect(marquee).toHaveCSS('animation-name', /benefits-marquee$/);

  if (isMobileProject(testInfo)) {
    await expect(page.locator('.multi-benefits__intro')).toHaveCSS('animation-name', 'none');
  } else {
    await expect(page.locator('.multi-benefits__cards')).not.toHaveCSS('animation-name', 'none');
  }
  expect(api.requests.length).toBeGreaterThan(0);
});

test('keeps the rotating hero word animation on mobile', async ({ page, api }, testInfo) => {
  test.fixme(
    isMobileProject(testInfo),
    'Current mobile template renders a static profit word, contrary to the CPA specification.',
  );
  await openLanding(page, '/en');
  await waitForHero(page);
  await expect(page.locator('.title__words')).toHaveCSS('animation-name', 'word-scroll');
  expect(api.requests.length).toBeGreaterThan(0);
});
