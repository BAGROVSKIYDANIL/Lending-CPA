# CPA Landing

Техническая основа по `writing-block.md`: Angular 22.2.2, standalone-компоненты,
SCSS, Angular i18n и Feature-Sliced Design. Сборщик — Vite 8 с
`@analogjs/vite-plugin-angular`. Корневой компонент пустой.

## Запуск

Требуется Node.js `^22.22.3`, `^24.15.0` или `>=26.0.0` и npm.

```bash
npm install
npm start
```

Приложение доступно на `http://localhost:4200/`. Пустая страница ожидаема:
страницы, секции, бизнес-компоненты и демонстрационный контент не создавались.

| Команда                | Назначение                                        |
| ---------------------- | ------------------------------------------------- |
| `npm start`            | Разработка на исходной локали                     |
| `npm run start:ru`     | Разработка на русской локали                      |
| `npm run build`        | Production-сборка всех локалей                    |
| `npm run build:source` | Production-сборка исходной локали                 |
| `npm run typecheck`    | Проверка типов TypeScript                         |
| `npm run i18n:extract` | Извлечение сообщений в `src/locales/messages.xlf` |

Локали для начальной конфигурации: `en-US` и `ru`. Детали в
[src/locales/README.md](src/locales/README.md). Артефакты сборки находятся в
`dist/cpa-landing/en-US` и `dist/cpa-landing/ru`. `npm run preview` открывает
production-сборку исходной локали. Настройки Vite находятся в `vite.config.ts`.
Angular CLI и `angular.json` сохранены для извлечения i18n-сообщений;
команды запуска и сборки используют Vite.

## Архитектура

```text
src/
  app/                   Корневой компонент, bootstrap providers
  pages/                 Будущие страницы
  widgets/               Будущие крупные блоки интерфейса
  features/              Будущие пользовательские возможности
  entities/              Будущие бизнес-сущности
  shared/
    api/                 API_CONFIG и ApiClient
    lib/animation/       Контракты и токен ANIMATION_LAYER
    lib/preloader/       CombinedPreloader
    styles/              Глобальная SCSS-база и правила BEM
    ui/                  Будущие общие UI-компоненты
  locales/               Каталоги Angular i18n
```

Направление зависимостей: `app → pages → widgets → features → entities → shared`.
Слой может использовать любой нижележащий слой, но не верхний.
Слайсы одного слоя не импортируют друг друга. Пустые слои пока не содержат слайсов.
Импорты между слайсами проходят через публичный `index.ts`; настроены алиасы `@app/*`,
`@pages/*`, `@widgets/*`, `@features/*`, `@entities/*`, `@shared/*`.

Стили компонента — отдельный `.scss` рядом с компонентом. Правила классов BEM
описаны в [src/shared/styles/README.md](src/shared/styles/README.md).

## Инфраструктура

**Animation Layer:** `ANIMATION_LAYER` задаёт контракт запуска, завершения и отмены.
Реализация и provider добавляются при появлении требований к анимациям.
На этом этапе анимации не создаются и не запускаются.

**Combined Preloader:** учитывает загрузки источников `application`, `assets`, `api`,
`animation`. `begin(source, label)` возвращает функцию завершения конкретной загрузки;
повторное завершение безопасно. Сигналы `pending` и `isLoading` объединяют состояние.
Будущие интеграции должны вызывать завершение также при ошибке или отмене.
Автоматического перехвата запросов, визуального компонента и загрузочных сценариев нет.

**API Layer:** `ApiClient` предоставляет типизированные GET/POST и формирует адрес
`{baseUrl}/{locale}/{relativePath}`. Локаль берётся из Angular `LOCALE_ID`,
`localeMap` позволяет сопоставить её сегменту endpoint. Пути передаются без ведущего
слеша, query-параметры — через `HttpParams`. В `app.config.ts` адрес `baseUrl: null`:
клиент блокирует запросы, пока API не настроен. Реальные API не подключены.

## Статус проверки в текущей среде

Конфигурация переведена на Vite; синтаксис JSON проверен. Установка зависимостей заблокирована средой:
`npm install` возвращает `EACCES` при обращении к `registry.npmjs.org`.
Кеш не содержит требуемые зависимости. Поэтому запуск, проверка типов,
извлечение сообщений и production-сборка пока не подтверждены.
`package-lock.json` появится после успешного `npm install`; его следует сохранить в репозитории.

После восстановления доступа к npm выполнить:

```bash
npm install
npm run typecheck
npm run i18n:extract
npm run build
npm start
```

## Linter & Prettier

Для VSCode требуется установка плагинов `ESLint` и `Prettier - Code formatter`.
