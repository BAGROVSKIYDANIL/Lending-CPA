import { test, expect } from './fixtures/test';
import {
  assertNoHorizontalOverflow,
  expectActiveSection,
  isMobileProject,
  landing,
  openLanding,
  openMobileMenu,
  waitForHero,
} from './helpers/app';

test.describe('routing and localization', () => {
  test('redirects the root route to English', async ({ page, api }) => {
    await openLanding(page, '/');
    await expect(page).toHaveURL(/\/en$/);
    await waitForHero(page);
    expect(api.requests.every((request) => request.hasApiKey)).toBe(true);
  });

  test('switches language without mixing localized content', async ({ page, api }, testInfo) => {
    await openLanding(page, '/en');
    await waitForHero(page);
    if (isMobileProject(testInfo)) await openMobileMenu(page);
    await page.getByRole('link', { name: 'рус', exact: true }).click();

    await expect(page).toHaveURL(/\/ru$/);
    await expect(page.getByText('Предлагаем эффективные решения')).toBeVisible();
    if (isMobileProject(testInfo)) await openMobileMenu(page);
    await page.getByRole('link', { name: 'Команда', exact: true }).click();
    await expect(page).toHaveURL(/\/ru#team$/);
    await expect(page.getByText('Анализ', { exact: true })).toBeVisible();
    await expect(page.getByText('Research', { exact: true })).toHaveCount(0);
    expect(api.requests.some((request) => request.language === 'ru')).toBe(true);
  });

  test('shows the 404 page and returns to the landing page', async ({ page, api }) => {
    await page.goto('/en/unknown-route');
    await expect(page.getByRole('main', { name: '404 — Page not found' })).toBeVisible();
    await page.getByRole('link', { name: 'Take me back' }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(landing(page)).toBeVisible();
    expect(api.requests.every((request) => request.hasApiKey)).toBe(true);
  });
});

test.describe('desktop section engine', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    void page;
    test.skip(isMobileProject(testInfo), 'Desktop section engine is disabled on mobile.');
  });

  test('moves exactly one section per wheel gesture and exposes backward direction', async ({
    page,
    api,
  }) => {
    await openLanding(page, '/en');
    await expectActiveSection(page, 'hero');

    await page.mouse.wheel(0, 120);
    await page.mouse.wheel(0, 120);
    await expectActiveSection(page, 'team');
    await expect(page).toHaveURL(/\/en#team$/);

    await page.mouse.wheel(0, -120);
    await expect(landing(page)).toHaveAttribute('data-transition-direction', 'backward');
    await expectActiveSection(page, 'hero');
    expect(api.requests.length).toBeGreaterThan(0);
  });

  test('opens a deep link and keeps forward/backward navigation synchronized', async ({
    page,
    api,
  }) => {
    await openLanding(page, '/en#benefits');
    await expectActiveSection(page, 'benefits');

    await page.mouse.wheel(0, -120);
    await expectActiveSection(page, 'team');
    await expect(page).toHaveURL(/\/en#team$/);

    await page.mouse.wheel(0, 120);
    await expectActiveSection(page, 'benefits');
    expect(api.requests.some((request) => request.endpoint === 'benefits')).toBe(true);
  });

  test('does not move beyond the first or last section', async ({ page, api }) => {
    await openLanding(page, '/en');
    await expectActiveSection(page, 'hero');
    await page.mouse.wheel(0, -160);
    await expectActiveSection(page, 'hero');

    await page.goto('/en#join');
    await expectActiveSection(page, 'join');
    await page.mouse.wheel(0, 160);
    await expectActiveSection(page, 'join');
    expect(api.requests.length).toBeGreaterThan(0);
  });

  test('header navigation and scroll-to-top update the active section', async ({ page, api }) => {
    await openLanding(page, '/en');
    await waitForHero(page);
    await page.getByRole('link', { name: 'Benefits', exact: true }).click();
    await expectActiveSection(page, 'benefits');

    await page.goto('/en#join');
    await expectActiveSection(page, 'join');
    await page.getByRole('link', { name: 'SCROLL TO TOP' }).click();
    await expectActiveSection(page, 'hero');
    expect(api.requests.length).toBeGreaterThan(0);
  });

  test('fits sections into a 13-inch viewport without horizontal overflow', async ({
    page,
    api,
  }) => {
    await openLanding(page, '/en#team');
    await expectActiveSection(page, 'team');
    const sectionHeight = await page.locator('#team').evaluate((element) => element.scrollHeight);
    expect(sectionHeight).toBeLessThanOrEqual(page.viewportSize()?.height ?? 0);
    await assertNoHorizontalOverflow(page);
    expect(api.requests.length).toBeGreaterThan(0);
  });
});

test.describe('mobile navigation', () => {
  test('uses native vertical scrolling and keeps every section available', async ({
    page,
    api,
  }, testInfo) => {
    test.skip(!isMobileProject(testInfo), 'Mobile-only behavior.');
    await openLanding(page, '/en');

    const scroller = landing(page);
    await page.locator('#benefits').scrollIntoViewIfNeeded();
    await expect.poll(() => scroller.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    await expect(page.locator('#benefits')).toHaveAttribute('aria-hidden', 'false');
    await expect(landing(page)).toHaveAttribute('data-active-section', 'hero');
    await assertNoHorizontalOverflow(page);
    expect(api.requests.length).toBeGreaterThan(0);
  });

  test('reloads a localized hash route at the requested section', async ({
    page,
    api,
  }, testInfo) => {
    test.skip(!isMobileProject(testInfo), 'Mobile-only behavior.');
    await openLanding(page, '/ru#join');
    await expect(page).toHaveURL(/\/ru#join$/);
    await expect(page.locator('#join')).toBeInViewport();

    await page.reload();
    await expect(page.locator('#join')).toBeInViewport();
    expect(api.requests.some((request) => request.language === 'ru')).toBe(true);
  });
});
