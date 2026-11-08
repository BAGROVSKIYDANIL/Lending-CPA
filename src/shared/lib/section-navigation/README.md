# Section Navigation Engine

Централизованный движок переключает полноэкранные секции CPA Landing на desktop и
синхронизирует активную секцию с Angular Router. На mobile JavaScript-переходы
отключаются, а страницы используют нативный CSS Scroll Snap.

## Состав

| Файл | Ответственность |
| --- | --- |
| `section-navigation.types.ts` | Идентификаторы секций и публичные контракты |
| `section-navigation.service.ts` | Signals, направление, блокировка и URL |
| `section-transition.engine.ts` | Регистрация, запуск и отмена контроллеров |
| `native-section-animation.controller.ts` | Выполнение keyframes через Web Animations API |
| `index.ts` | Public API движка |

Интеграция wheel, клавиатуры, Router и viewport находится в
`src/pages/landing/landing.ts`. Движок не регистрирует глобальные события самостоятельно.

## Порядок секций

Порядок является частью контракта и задаётся в `SECTION_IDS`:

```ts
export const SECTION_IDS = ['hero', 'team', 'benefits', 'join'] as const;
```

- `hero` — `Hero`;
- `team` — `MultiTasks`;
- `benefits` — `MultiBenefits`;
- `join` — `MultiplyWithUs`.

Этот массив определяет направление перехода. Секция с большим индексом открывается с
`forward`, с меньшим — с `backward`.

При изменении массива необходимо одновременно обновить:

1. `id` wrapper-элемента в `landing.html`;
2. регистрацию контроллера в `Landing.registerControllers()`;
3. локальные fragment-ссылки;
4. тесты прямого URL и обратной навигации.

## Публичные контракты

```ts
type Direction = 'forward' | 'backward';

interface SectionAnimationController {
  enter(direction: Direction): Promise<void>;
  leave(direction: Direction): Promise<void>;
  reset(): void;
}
```

Контроллер принадлежит странице. `SectionTransitionEngine` не должен знать DOM-структуру
или конкретные анимации секции.

Анимация страницы описывается декларативно:

```ts
interface SectionAnimationStep {
  readonly selector: string;
  readonly keyframes: readonly Keyframe[];
  readonly options: KeyframeAnimationOptions;
  readonly stagger?: number;
}

interface SectionAnimationDefinition {
  readonly enter: Readonly<Record<Direction, readonly SectionAnimationStep[]>>;
  readonly leave: Readonly<Record<Direction, readonly SectionAnimationStep[]>>;
}
```

`selector` ищется внутри host-компонента. Если селектор соответствует нескольким
элементам, `stagger` добавляет к исходному `delay` значение `index × stagger`.

## Создание контроллера страницы

Определение следует хранить рядом с компонентом страницы:

```ts
import { ElementRef, inject } from '@angular/core';
import {
  NativeSectionAnimationController,
  type SectionAnimationDefinition,
} from '@shared/lib/section-navigation';

const enterForward = [
  {
    selector: '.example__title',
    keyframes: [
      { opacity: 0, transform: 'translateY(60px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    options: {
      duration: 650,
      easing: 'cubic-bezier(.22, 1, .36, 1)',
      fill: 'both' as const,
    },
  },
] as const;

const leaveForward = [
  {
    selector: '.example',
    keyframes: [{ opacity: 1 }, { opacity: 0 }],
    options: { duration: 180, easing: 'ease-in', fill: 'both' as const },
  },
] as const;

const animation: SectionAnimationDefinition = {
  enter: {
    forward: enterForward,
    backward: enterForward,
  },
  leave: {
    forward: leaveForward,
    backward: leaveForward,
  },
};

export class ExamplePage {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly animationController = new NativeSectionAnimationController(
    this.host,
    animation,
  );
}
```

Для `forward` и `backward` разрешено переиспользовать массив только тогда, когда это
действительно соответствует дизайну. Если обратный переход имеет другую траекторию,
следует создать отдельный набор keyframes.

## Регистрация контроллера

Landing получает компоненты через signal queries и регистрирует их после создания view:

```ts
private readonly example = viewChild.required(ExamplePage);

private registerControllers(): void {
  this.transitionEngine.register('example', this.example().animationController);
}
```

При уничтожении Landing контроллер обязательно удаляется:

```ts
this.transitionEngine.unregister('example', this.example().animationController);
```

`register()` и `unregister()` должны использовать один и тот же экземпляр контроллера.

## Жизненный цикл перехода

При `navigation.next()`, `previous()` или `navigateTo()` выполняется следующая цепочка:

1. Проверяется desktop-режим и `isAnimating`.
2. Определяются текущая секция, цель и направление.
3. При необходимости обновляется URL fragment.
4. `targetSection` получает целевой идентификатор.
5. Исходящая и входящая секции становятся видимыми слоями.
6. `leave()` и `enter()` запускаются параллельно.
7. `SectionTransitionEngine` ждёт реальные `animation.finished`.
8. Целевая секция становится `activeSection`.
9. Исходящий слой скрывается через `visibility: hidden`.
10. Блокировка перехода снимается.

Завершение нельзя имитировать через `setTimeout`. Тайминг перехода определяется
фактическими Web Animations API promises.

## Состояние SectionNavigationService

Сервис предоставляет read-only Signals:

```ts
readonly activeSection: Signal<SectionId>;
readonly targetSection: Signal<SectionId | null>;
readonly direction: Signal<Direction>;
readonly isAnimating: Signal<boolean>;
readonly visibleSections: Signal<readonly SectionId[]>;
```

Основные методы:

```ts
initialize(section);
next();
previous();
navigateTo(section, options);
disable();
```

`initialize()` используется при первом открытии и при возврате из mobile в desktop.
Он сразу активирует секцию из URL и не воспроизводит промежуточные экраны.

`disable()` отменяет переходы и очищает временное состояние. Он вызывается при переходе
в mobile-режим и при уничтожении Landing.

## Работа NativeSectionAnimationController

Контроллер:

1. отменяет предыдущий собственный запуск;
2. проверяет `prefers-reduced-motion`;
3. находит элементы по селекторам;
4. вызывает `element.animate()`;
5. ждёт все `animation.finished`;
6. фиксирует финальный кадр через `commitStyles()`;
7. отменяет завершённый объект `Animation`;
8. освобождает compositor effect.

`reset()` отменяет активные анимации и удаляет временные inline `opacity` и `transform`.

Это важно: finished-анимации не должны накапливаться между переходами. После стабильного
перехода в документе остаются только разрешённые бесконечные CSS-анимации.

## Правила анимаций

- Основные свойства — `transform` и `opacity`.
- Корневую секцию рекомендуется быстро гасить при `leave`, чтобы одновременно скрывать
  фоновые изображения и псевдоэлементы.
- Не анимировать layout-свойства (`width`, `height`, `top`, `left`) без необходимости.
- Не создавать вторую CSS-анимацию на том же `transform` или `opacity`.
- Одноразовые старые SCSS-анимации должны быть отключены в `.landing--desktop`.
- Бесконечные анимации строки и marquee остаются CSS-анимациями.
- Все keyframes должны иметь явные начальное и конечное состояния.
- Для групповых элементов использовать один step со `stagger`, а не ручной запуск цикла.
- Не добавлять сторонние animation/fullpage-пакеты.

## Wheel и тачпад

Wheel обрабатывается только в `Landing` одним listener. Небольшие `deltaY` накапливаются
до порога. После запуска перехода остальные события текущего инерционного жеста
игнорируются.

Нельзя добавлять wheel listeners в отдельные страницы. Иначе один жест сможет запустить
несколько конкурирующих переходов.

Wheel и клавиатурные переходы не выполняются, если открыт:

- нативный `dialog`;
- элемент с `aria-modal="true"`;
- CDK overlay.

При добавлении другого модального механизма его контейнер необходимо добавить в
`Landing.isModalEvent()`.

## Клавиатура

Desktop-команды:

| Клавиша | Действие |
| --- | --- |
| `ArrowDown`, `PageDown`, `Space` | Следующая секция |
| `ArrowUp`, `PageUp`, `Shift + Space` | Предыдущая секция |
| `Home` | Hero |
| `End` | Join |

События не перехватываются внутри полей ввода, кнопок и `contenteditable`.

## URL и локальные ссылки

Fragment должен совпадать с `SectionId`:

```html
<a [routerLink]="['/', language]" fragment="team">Команда</a>
```

Примеры URL:

- `/ru` или `/ru#hero` — Hero;
- `/ru#team` — MultiTasks;
- `/ru#benefits` — MultiBenefits;
- `/ru#join` — MultiplyWithUs.

Не использовать обычный `href` для внутренних Angular-переходов. `RouterLink` сохраняет
жизненный цикл приложения и позволяет движку обработать `NavigationEnd`.

Browser Back/Forward обрабатывается через Router events. Если URL изменился во время
перехода, новый target помещается в очередь и запускается после текущего перехода.

## Язык и API-контент

Локальная ссылка всегда строится с текущим языком:

```html
[routerLink]="['/', languageService.language()]"
```

Язык применяет `languageResolver`. Не следует одновременно вызывать
`LanguageService.changeLanguage()` в click handler языковой ссылки — это создаёт гонку
с Router.

Landing не пересоздаётся при `/en` → `/ru`, поэтому API-страницы обязаны следить за
`LanguageService.language` как за Signal:

```ts
readonly currentLanguage = this.languageService.language;

constructor() {
  effect(() => this.loadForLanguage(this.currentLanguage()));
}
```

Перед новым HTTP-запросом следует отменить предыдущий subscription. Иначе запоздавший
EN-ответ сможет перезаписать уже загруженный RU-контент.

## Mobile-режим

На ширине до 767 px `SectionNavigationService` отключён. JavaScript не перехватывает
wheel и touch.

Landing использует нативный scroll-контейнер:

```scss
height: var(--section-height);
overflow-y: auto;
scroll-snap-type: y mandatory;
overscroll-behavior-y: contain;
```

Секция использует:

```scss
min-height: var(--section-height);
scroll-snap-align: start;
scroll-snap-stop: always;
```

Высокая секция может быть больше viewport и прокручивается полностью. Header находится
вне scroll-контейнера. Hash navigation вызывает `scrollIntoView()` для нужной секции.

## Resize desktop/mobile

`ViewportService.isMobile` является Signal.

Desktop → mobile:

1. движок отменяется через `disable()`;
2. все секции возвращаются в поток;
3. scroll-контейнер прокручивается к текущему fragment.

Mobile → desktop:

1. определяется секция из URL;
2. вызывается `initialize(section)`;
3. остальные слои скрываются;
4. wheel и клавиатура снова управляют переходами.

## Очистка

Landing обязан удалить:

- `wheel` listener;
- `keydown` listener;
- активный `requestAnimationFrame` жеста;
- регистрации контроллеров;
- Router subscription.

Для Angular subscriptions используется `takeUntilDestroyed(DestroyRef)`. Контроллеры
дополнительно очищаются через `reset()`.

## Добавление новой секции

Чек-лист:

1. Добавить `SectionId` в `SECTION_IDS`.
2. Создать standalone-компонент с `ChangeDetectionStrategy.OnPush`.
3. Описать четыре набора `enter/leave × forward/backward`.
4. Экспортировать `animationController` из компонента.
5. Добавить wrapper с соответствующим `id` в `landing.html`.
6. Добавить `viewChild` в `Landing`.
7. Зарегистрировать и удалить контроллер.
8. Добавить fragment-ссылку.
9. Убедиться, что API-контент реагирует на смену языка.
10. Проверить desktop, mobile, прямой hash и Back/Forward.

## Проверка изменений

Минимальный набор сценариев:

- пройти все секции вперёд и назад;
- повторить цикл несколько раз;
- отправить серию быстрых wheel events;
- проверить длинную инерцию тачпада;
- открыть каждую секцию прямым hash URL;
- проверить Header, Scroll to top, Back и Forward;
- переключить desktop ↔ mobile;
- проверить mobile Scroll Snap;
- открыть форму и убедиться, что wheel не переключает фон;
- выполнить `/en` → `/ru` → локальная ссылка;
- убедиться, что выполняются RU API-запросы;
- включить `prefers-reduced-motion`;
- проверить viewport 1366×768.

Команды проверки:

```bash
npm run typecheck
npm run lint
npm run build
```

