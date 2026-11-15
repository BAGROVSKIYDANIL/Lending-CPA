import { test, expect } from './fixtures/test';
import { isMobileProject, openLanding } from './helpers/app';

async function openForm(page: import('@playwright/test').Page): Promise<void> {
  const cta = page.getByRole('button', { name: 'Join the team' });
  await cta.scrollIntoViewIfNeeded();
  await cta.click();
  await expect(page.getByRole('dialog', { name: 'Application form' })).toBeVisible();
}

async function selectContactMethod(
  page: import('@playwright/test').Page,
  method: 'Telegram' | 'WhatsApp' | 'Email',
): Promise<void> {
  await page.getByRole('combobox', { name: 'Contact Method (required)' }).click();
  await page.getByRole('option', { name: method, exact: true }).click();
}

test.beforeEach(async ({ page, api }, testInfo) => {
  const path = isMobileProject(testInfo) ? '/en' : '/en#join';
  await openLanding(page, path);
  if (isMobileProject(testInfo)) await page.locator('#join').scrollIntoViewIfNeeded();
  await expect.poll(() => api.requests.length).toBeGreaterThan(0);
});

test('opens the form from every collaboration category and restores focus on close', async ({
  page,
  api,
}) => {
  for (const category of ['For Media Buyers', 'For Businesses', 'For Partners']) {
    await page.getByRole('button', { name: category, exact: true }).click();
    await openForm(page);
    const backdrop = await page.locator('dialog.application-form').evaluate((dialog) => {
      const styles = getComputedStyle(dialog, '::backdrop');
      return { backgroundColor: styles.backgroundColor, backdropFilter: styles.backdropFilter };
    });
    expect(backdrop.backgroundColor).toMatch(/rgba?\(/);
    expect(backdrop.backdropFilter).not.toBe('none');
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('dialog', { name: 'Application form' })).toBeHidden();
  }
  expect(api.requests.length).toBeGreaterThan(0);
});

test('validates required fields and contact method specific hints', async ({ page, api }) => {
  await openForm(page);
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('This field is required.')).toHaveCount(2);
  expect(api.requests.filter((request) => request.endpoint === 'form')).toHaveLength(0);

  const contact = page.getByRole('textbox', { name: 'Your Contact (required)' });
  await selectContactMethod(page, 'Telegram');
  await expect(contact).toHaveAttribute('placeholder', '@username');
  await selectContactMethod(page, 'WhatsApp');
  await expect(contact).toHaveAttribute('placeholder', '+373 60123456');
  await selectContactMethod(page, 'Email');
  await expect(contact).toHaveAttribute('placeholder', 'name@example.com');
  await contact.fill('invalid-email');
  await contact.blur();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
});

test('submits an optional name and keeps the success dialog open', async ({ page, api }) => {
  await openForm(page);
  await selectContactMethod(page, 'Email');
  await page.getByRole('textbox', { name: 'Your Contact (required)' }).fill('qa@example.com');
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(
    page.getByRole('heading', { name: 'WE HAVE RECEIVED YOUR APPLICATION!' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Done' })).toBeVisible();
  const submission = api.requests.find((request) => request.endpoint === 'form');
  expect(submission?.method).toBe('POST');
  expect(submission?.body).toEqual({ name: '', method: 'email', contact: 'qa@example.com' });
});

test('blocks duplicate submission while the request is pending', async ({ page, api }) => {
  const release = api.delayNext('form');
  await openForm(page);
  await selectContactMethod(page, 'Telegram');
  await page.getByRole('textbox', { name: 'Your Contact (required)' }).fill('@qa_user');
  const submit = page.getByRole('button', { name: 'Submit' });
  await submit.click();

  await expect(page.getByRole('button', { name: 'Sending…' })).toBeDisabled();
  await page.getByRole('button', { name: 'Sending…' }).click({ force: true });
  expect(api.requests.filter((request) => request.endpoint === 'form')).toHaveLength(1);
  release();
  await expect(page.getByRole('button', { name: 'Done' })).toBeVisible();
});

test('shows a localized fallback after a server error', async ({ page, api }) => {
  api.queue('form', { status: 503, body: { message: 'unavailable' } });
  await openForm(page);
  await selectContactMethod(page, 'WhatsApp');
  await page.getByRole('textbox', { name: 'Your Contact (required)' }).fill('+37360123456');
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.getByRole('dialog', { name: 'Service temporarily unavailable' })).toBeVisible();
  await expect(page.getByText('The request could not be sent. Please try again.')).toBeVisible();
});
