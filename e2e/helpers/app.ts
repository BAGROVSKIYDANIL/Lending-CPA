import { expect, type Locator, type Page, type TestInfo } from '@playwright/test';

export const isMobileProject = (testInfo: TestInfo): boolean =>
  testInfo.project.name.startsWith('mobile-');

export const landing = (page: Page): Locator => page.getByTestId('landing');

export async function expectActiveSection(page: Page, section: string): Promise<void> {
  await expect(landing(page)).toHaveAttribute('data-active-section', section);
  await expect(landing(page)).toHaveAttribute('data-transitioning', 'false');
  await expect(page.locator(`#${section}`)).toHaveClass(/landing__section--visible/);
}

export async function openLanding(page: Page, path = '/en'): Promise<void> {
  await page.goto(path);
  await expect(landing(page)).toBeVisible();
}

export async function waitForHero(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { level: 1, name: /practice makes profit/i })).toBeVisible(
    {
      timeout: 12_000,
    },
  );
}

export async function openMobileMenu(page: Page): Promise<void> {
  const dialog = page.getByRole('dialog', { name: 'Navigation menu' });
  if (await dialog.isVisible()) return;
  await page.locator('.header__menu--mob').click();
  await expect(dialog).toBeVisible();
}

export async function assertNoHorizontalOverflow(page: Page): Promise<void> {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
}
