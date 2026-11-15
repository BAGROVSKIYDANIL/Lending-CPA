import { expect, test as base } from '@playwright/test';
import { installApiMocks, type ApiMockController } from './api-mocks';

interface E2EFixtures {
  readonly api: ApiMockController;
  readonly pageErrors: Error[];
}

export const test = base.extend<E2EFixtures>({
  api: async ({ page }, use) => {
    await use(await installApiMocks(page));
  },
  pageErrors: [
    async ({ page }, use) => {
      const errors: Error[] = [];
      page.on('pageerror', (error) => errors.push(error));
      await use(errors);
      expect(errors, 'Unexpected browser errors').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
