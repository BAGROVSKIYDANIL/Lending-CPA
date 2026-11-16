import type { Page, Request, Route } from '@playwright/test';

export type ApiLanguage = 'en' | 'ru' | 'ua';
export type ContentEndpoint = 'tasks' | 'benefits' | 'multiply';
export type ApiEndpoint = ContentEndpoint | 'form';

interface MockBehavior {
  readonly status?: number;
  readonly body?: unknown;
  readonly abort?: boolean;
  readonly gate?: Promise<void>;
  readonly delayMs?: number;
}

export interface ApiRequestRecord {
  readonly endpoint: ApiEndpoint;
  readonly language?: ApiLanguage;
  readonly method: string;
  readonly hasApiKey: boolean;
  readonly body?: unknown;
}

export interface ApiMockController {
  readonly requests: ApiRequestRecord[];
  queue(endpoint: ApiEndpoint, behavior: MockBehavior): void;
  delayNext(endpoint: ApiEndpoint): () => void;
}

const contentFixtures = {
  en: {
    tasks: {
      description: 'Our in-house team handles every challenge',
      tiles: [
        { title: 'Research', text: 'Validate every idea' },
        { title: 'Launch', text: 'Ship measurable campaigns' },
      ],
    },
    benefits: {
      title: 'Growth is guaranteed with practice',
      description: 'A repeatable system for sustainable results',
      benefits: ['Transparent process', 'Experienced team', 'Measured growth'],
    },
    multiply: [
      { title: 'Media Buyers', steps: { step_1: 'Apply to the team', step_2: 'Grow skills' } },
      { title: 'Businesses', steps: { step_1: 'Share the goal', step_2: 'Launch a campaign' } },
      { title: 'Partners', steps: { step_1: 'Connect with us', step_2: 'Scale together' } },
    ],
  },
  ru: {
    tasks: {
      description: 'Своя команда решает каждую задачу',
      tiles: [
        { title: 'Анализ', text: 'Проверяем каждую идею' },
        { title: 'Запуск', text: 'Запускаем измеримые кампании' },
      ],
    },
    benefits: {
      title: 'Практика помогает гарантировать рост',
      description: 'Системный подход к устойчивому результату',
      benefits: ['Прозрачный процесс', 'Опытная команда', 'Измеримый рост'],
    },
    multiply: [
      { title: 'Медиабайеры', steps: { step_1: 'Подайте заявку', step_2: 'Развивайте навыки' } },
      { title: 'Бизнес', steps: { step_1: 'Расскажите о цели', step_2: 'Запустите кампанию' } },
      {
        title: 'Партнёры',
        steps: { step_1: 'Свяжитесь с нами', step_2: 'Масштабируйтесь вместе' },
      },
    ],
  },
  ua: {
    tasks: {
      description: 'Власна команда вирішує кожне завдання',
      tiles: [
        { title: 'Аналіз', text: 'Перевіряємо кожну ідею' },
        { title: 'Запуск', text: 'Запускаємо вимірювані кампанії' },
      ],
    },
    benefits: {
      title: 'Практика допомагає гарантувати зростання',
      description: 'Системний підхід до сталого результату',
      benefits: ['Прозорий процес', 'Досвідчена команда', 'Вимірюване зростання'],
    },
    multiply: [
      { title: 'Медіабаєри', steps: { step_1: 'Подайте заявку', step_2: 'Розвивайте навички' } },
      { title: 'Бізнес', steps: { step_1: 'Розкажіть про мету', step_2: 'Запустіть кампанію' } },
      { title: 'Партнери', steps: { step_1: 'Зв’яжіться з нами', step_2: 'Масштабуйтесь разом' } },
    ],
  },
} as const;

const isLanguage = (value: string | undefined): value is ApiLanguage =>
  value === 'en' || value === 'ru' || value === 'ua';

const isContentEndpoint = (value: string | undefined): value is ContentEndpoint =>
  value === 'tasks' || value === 'benefits' || value === 'multiply';

export async function installApiMocks(page: Page): Promise<ApiMockController> {
  const requests: ApiRequestRecord[] = [];
  const behaviors = new Map<ApiEndpoint, MockBehavior[]>();

  const controller: ApiMockController = {
    requests,
    queue(endpoint, behavior) {
      const queue = behaviors.get(endpoint) ?? [];
      queue.push(behavior);
      behaviors.set(endpoint, queue);
    },
    delayNext(endpoint) {
      let release = (): void => undefined;
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      this.queue(endpoint, { gate });
      return release;
    },
  };

  await page.route('https://cpa-server-vtel.onrender.com/**', async (route) => {
    await handleApiRoute(route, requests, behaviors);
  });

  return controller;
}

async function handleApiRoute(
  route: Route,
  requests: ApiRequestRecord[],
  behaviors: Map<ApiEndpoint, MockBehavior[]>,
): Promise<void> {
  const request = route.request();
  const url = new URL(request.url());
  const segments = url.pathname.split('/').filter(Boolean);
  const endpoint = segments.at(-1);
  const language = segments.length > 1 ? segments.at(-2) : undefined;

  if (endpoint === 'form') {
    requests.push(toRecord(request, 'form'));
    const behavior = behaviors.get('form')?.shift();
    await fulfillBehavior(route, behavior, null);
    return;
  }

  if (!isLanguage(language) || !isContentEndpoint(endpoint)) {
    await route.abort('failed');
    return;
  }

  requests.push(toRecord(request, endpoint, language));
  const behavior = behaviors.get(endpoint)?.shift();
  await fulfillBehavior(route, behavior, contentFixtures[language][endpoint]);
}

function toRecord(
  request: Request,
  endpoint: ApiEndpoint,
  language?: ApiLanguage,
): ApiRequestRecord {
  return {
    endpoint,
    language,
    method: request.method(),
    hasApiKey: Boolean(request.headerValue('x-api-key')),
    body: request.postDataJSON() as unknown,
  };
}

async function fulfillBehavior(
  route: Route,
  behavior: MockBehavior | undefined,
  defaultBody: unknown,
): Promise<void> {
  await behavior?.gate;
  if (behavior?.delayMs) {
    await new Promise((resolve) => setTimeout(resolve, behavior.delayMs));
  }
  if (behavior?.abort) {
    await route.abort('failed');
    return;
  }

  const status = behavior?.status ?? 200;
  if (status === 204) {
    await route.fulfill({ status });
    return;
  }

  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(behavior && 'body' in behavior ? behavior.body : defaultBody),
  });
}
