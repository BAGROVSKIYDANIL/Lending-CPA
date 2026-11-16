# CPA Landing E2E

## Coverage map

| Requirement                                   | Route/component            | Test file                    |
| --------------------------------------------- | -------------------------- | ---------------------------- |
| Locales, root redirect, 404                   | `/`, `/:lang`, `/:lang/**` | `navigation.spec.ts`         |
| Header, hash, reload, scroll to top           | Landing navigation         | `navigation.spec.ts`         |
| Wheel forward/backward and boundaries         | Section navigation engine  | `navigation.spec.ts`         |
| Native mobile scroll and overflow             | Landing mobile layout      | `navigation.spec.ts`         |
| Contact methods, validation, success, pending | Application form           | `form.spec.ts`               |
| API headers, loading, invalid payload, retry  | API services and fallback  | `api-and-resilience.spec.ts` |
| Locale request race                           | Localized content services | `api-and-resilience.spec.ts` |
| Marquee and decorative animation state        | Hero and benefits          | `api-and-resilience.spec.ts` |

The default suite intercepts every CPA API request and uses fixtures matching the Zod contracts in
`src/entities/*/model`. It does not depend on the external backend and never asserts or prints the API
key value.

## Setup and commands

```bash
npm ci
npx playwright install chromium firefox webkit
npm run test:e2e
```

Other commands:

- `npm run test:e2e:ui`
- `npm run typecheck:e2e`
- `npm run test:e2e:headed`
- `npm run test:e2e:debug`
- `npm run test:e2e:report`
- `npx playwright test --project=desktop-chromium`
- `npx playwright test --project=mobile-chromium`

The test runner starts Vite on `http://127.0.0.1:4200` automatically and reuses an existing local
server outside CI. HTML reports are written to `playwright-report/`; traces, screenshots and retained
videos are written to `test-results/`.

Set `E2E_PORT` to run against another local port, for example `$env:E2E_PORT = '4300'` in PowerShell.

## Application environment

The application reads API configuration from Vite variables. For normal local development, copy
`.env.example` to `.env.local` and replace the placeholder value. Never commit `.env.local`.

The mock E2E web server injects a non-secret placeholder header. The fixture verifies only that the
header exists.

## Optional live backend smoke

The live smoke is skipped by default and is not part of CI. It runs only in desktop Chromium and may
take up to 60 seconds because of backend cold starts.

PowerShell:

```powershell
$env:E2E_LIVE_BACKEND = '1'
$env:E2E_API_KEY = '<key from a secure secret store>'
npx playwright test e2e/live-backend.spec.ts --project=desktop-chromium
```

Bash:

```bash
E2E_LIVE_BACKEND=1 E2E_API_KEY='<key from a secure secret store>' \
  npx playwright test e2e/live-backend.spec.ts --project=desktop-chromium
```

## Known product discrepancies

- `/` redirects to `/en`; the English landing is not served directly from `/`.
- The mobile hero currently renders a static `profit` word. The requirement that the rotating word
  animation remain active on mobile is represented by `test.fixme`.
- Telegram and WhatsApp have no format restrictions in the verified API contract beyond a non-empty
  contact value, so E2E does not invent phone or username validation rules.
- The visual preloader is driven by the initial page-load animation. API loading is represented by
  section-level status elements; there is no visual CombinedPreloader consumer.
- If an English content request remains pending during a language switch, the application can stay
  on `/en`. The race test documents this behavior as `fixme`; the normal local-link flow is covered
  in every browser and verifies Russian API content.

## Troubleshooting

- If port 4200 is occupied by an unrelated process, stop it or run on an isolated port with
  `E2E_PORT`. Playwright reuses an existing server locally.
- Install missing browser binaries with `npx playwright install`.
- For a failed test, open the HTML report with `npm run test:e2e:report` and inspect the attached trace.
