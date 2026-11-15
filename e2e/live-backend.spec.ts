import { test, expect } from '@playwright/test';

test.use({ trace: 'off', video: 'off', screenshot: 'off' });

test('optional live backend smoke check', async ({ request }, testInfo) => {
  test.skip(process.env['E2E_LIVE_BACKEND'] !== '1', 'Live backend smoke is opt-in.');
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Run the live smoke only once.');

  const apiKey = process.env['E2E_API_KEY'];
  test.skip(!apiKey, 'E2E_API_KEY is required for the live backend smoke.');

  const apiUrl = process.env['E2E_API_URL'] ?? 'https://cpa-server-vtel.onrender.com';
  const response = await request.get(`${apiUrl}/en/tasks`, {
    headers: { 'x-api-key': apiKey ?? '' },
    timeout: 60_000,
  });

  expect(response.ok()).toBe(true);
  const body = (await response.json()) as unknown;
  expect(body).toEqual(
    expect.objectContaining({
      description: expect.any(String),
      tiles: expect.any(Array),
    }),
  );
});
