# Fallback popup

Универсальное модальное окно для безопасного отображения клиентских и HTTP-ошибок.
Компонент уже подключён один раз в корневом `App`, поэтому в feature-компонентах нужно
использовать только `FallbackPopupService`.

## Быстрый старт

Получите сервис через Angular DI и вызовите `showClientError()`:

```ts
import { Component, inject } from '@angular/core';
import { FallbackPopupService } from '@shared/lib/fallback-popup';

@Component({
  selector: 'app-report',
  template: `<button type="button" (click)="exportReport()">Export</button>`,
})
export class Report {
  private readonly fallbackPopup = inject(FallbackPopupService);

  exportReport(): void {
    try {
      // Выполнение клиентской операции.
    } catch {
      this.fallbackPopup.showClientError();
    }
  }
}
```

Для собственного понятного пользователю текста используйте `show()`:

```ts
this.fallbackPopup.show({
  title: $localize`:@@report.exportError.title:Export failed`,
  message: $localize`:@@report.exportError.message:We couldn't create the report.`,
  code: 'EXPORT_FAILED',
});
```

Не передавайте в `title`, `message` или `code` stack trace, токены, сырой HTML и
непроверенные технические сообщения сервера.

## HTTP-ошибки

Передайте пойманный `HttpErrorResponse` в `showHttpError()`. Сервис сам выберет
локализованный заголовок, сообщение и доступность повтора:

```ts
import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { FallbackPopupService } from '@shared/lib/fallback-popup';
import { TasksService } from '@entities/task';

export class TasksPage {
  private readonly tasks = inject(TasksService);
  private readonly fallbackPopup = inject(FallbackPopupService);
  private readonly destroyRef = inject(DestroyRef);

  loadTasks(): void {
    this.tasks
      .getTasks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          // Сохранить полученные данные.
        },
        error: (error: unknown) => {
          if (!(error instanceof HttpErrorResponse)) {
            this.fallbackPopup.showClientError({ owner: this.destroyRef });
            return;
          }

          this.fallbackPopup.showHttpError(error, {
            owner: this.destroyRef,
            retry: () => firstValueFrom(this.tasks.getTasks()),
          });
        },
      });
  }
}
```

`retry` принимает функцию, возвращающую `void` или `Promise<void>`. Для Observable
используйте `firstValueFrom()`. Передавайте callback только для операции, которую можно
безопасно выполнить повторно.

Сейчас повтор разрешается для:

- сетевой ошибки (`status === 0`);
- `408` и `504`;
- `429`;
- `500`, `502` и `503`.

Для `429` сервис читает `Retry-After`, блокирует кнопку и показывает обратный отсчёт.
Для `401`, `403`, `404`, `400`, `422` и неизвестных статусов переданный callback не
отображается.

## POST формы

Не добавляйте `retry` для отправки заявки: сервер мог принять POST, даже если ответ не
дошёл до браузера.

```ts
this.contactApi.submit(data).subscribe({
  next: () => this.form.complete(),
  error: (error: unknown) => {
    // Снять pending, не создавая второе сообщение рядом с popup.
    this.form.fail('');

    if (error instanceof HttpErrorResponse) {
      this.fallbackPopup.showHttpError(error, { owner: this.destroyRef });
    } else {
      this.fallbackPopup.showClientError({ owner: this.destroyRef });
    }
  },
});
```

Окно благодарности следует открывать только после успешного ответа сервера.

## Ошибки отдельных полей

Swagger текущего API не описывает тело ответа с ошибками полей. Не извлекайте поля из
неизвестной структуры. Сначала проверьте ответ type guard-функцией, соответствующей
документированному контракту, затем покажите ошибки возле полей и передайте их mapper:

```ts
const fieldErrors: Readonly<Record<string, string>> = {
  contact: 'Invalid contact',
};

this.fieldErrors.set(fieldErrors);
this.fallbackPopup.showHttpError(error, {
  owner: this.destroyRef,
  fieldErrors,
});
```

Для `400` или `422` с непустым `fieldErrors` popup не откроется. Если подтверждённых
ошибок полей нет, будет показано общее безопасное сообщение.

## Жизненный цикл

Передавайте `owner: DestroyRef`, если popup содержит `retry`. После уничтожения
инициирующего компонента сервис удалит callback, чтобы кнопка не обращалась к устаревшему
контексту.

Методы `show()`, `showClientError()` и `showHttpError()` возвращают функцию закрытия:

```ts
const closePopup = this.fallbackPopup.showClientError();

// Закроет только созданное этим вызовом окно. Новое окно не будет затронуто.
closePopup();
```

Повторный вызов `show*()` заменяет содержимое текущего окна. Стек popup не создаётся.

## Публичный API

| Метод                            | Назначение                                                      |
| -------------------------------- | --------------------------------------------------------------- |
| `show(data, options?)`           | Показать подготовленный пользовательский текст                  |
| `showClientError(options?)`      | Показать стандартную клиентскую ошибку                          |
| `showHttpError(error, options?)` | Преобразовать и показать `HttpErrorResponse`                    |
| `close()`                        | Закрыть текущее окно                                            |
| `retry()`                        | Запустить retry текущего окна; обычно вызывается UI-компонентом |

HTTP mapper также доступен отдельно:

```ts
import { mapHttpError } from '@shared/model/error';

const mapped = mapHttpError(error, { fieldErrors });
```

Это полезно, если вызывающему коду нужно сначала проверить `showPopup`, `retryable` или
`fieldErrors`, а затем самостоятельно решить, как отобразить ошибку.

## Локализация

Английские строки являются исходными `$localize`/template i18n-сообщениями. Русские
переводы находятся в `src/locales/messages.ru.xlf`. Для нового собственного текста
добавляйте стабильный `@@id`, выполняйте извлечение i18n и добавляйте русский перевод.

## Где находятся части реализации

- `shared/model/error` — безопасный HTTP mapper и пользовательская модель ошибки;
- `shared/lib/fallback-popup` — Signals-состояние и публичный сервис;
- `shared/ui/fallback-popup` — `<dialog>`, доступность, фокус, retry countdown и стили;
- `app/app.html` — единственный экземпляр popup в приложении.
