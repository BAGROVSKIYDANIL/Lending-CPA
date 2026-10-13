# SCSS и BEM

Глобальная техническая база — `_base.scss`. Стили компонентов находятся рядом с компонентом
в отдельных `.scss` файлах. Общие переменные и миксины добавляются сюда по мере необходимости;
для подключения использовать `@use`.

## Шрифты и дизайн-токены

`src/styles.scss` подключает `_fonts.scss` и `_tokens.scss` один раз глобально.
WOFF2-файлы находятся в `public/assets/fonts`, внешние сервисы шрифтов не нужны.
Halvar Breitschrift: Light (300), Regular (400), Medium (500), Bold (700).
Stolzl: Light (300), Regular (400). Основной текст использует Stolzl Regular,
заголовки — Halvar Breitschrift Bold.

Палитра извлечена из локального `CPA F (Copy).fig`: именованные стили
`W` → `--color-white`, `Dark` → `--color-dark`, `Yell` → `--color-yellow`,
`main` / `purp` → `--color-purple`, `#0C090E` → `--color-near-black`.
Дополнительные цвета заливок, обводок и градиентов также вынесены в токены.
Значения RGB округлены до 8-битных каналов. Углы и позиции существующего
градиента hero сохранены, цвета заменены переменными.

В компонентах использовать семантические CSS-переменные, например:

```scss
.card {
  color: var(--color-text);
  background-color: var(--color-surface);
}

.button {
  font-family: var(--font-family-display);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-button);
  line-height: var(--line-height-button);
  color: var(--color-text-inverse);
  background-color: var(--color-accent);
}
```

Размеры `p`, `menu button`, `button` взяты из одноимённых текстовых стилей
макета; стиль `p` использует Halvar Breitschrift Bold, 20px / 24px.
В файле также встречаются Halvar Black (900) и служебный стиль Montserrat
SemiBold, но соответствующих файлов в переданной папке нет: эти начертания
не объявлены как доступные шрифты.

Имена классов: `block`, `block__element`, `block--modifier`, `block__element--modifier`.
Имена блоков и элементов — kebab-case. Модификатор применяется вместе с базовым классом.
Избегать селекторов по ID и вложенности, привязанной к структуре страницы.
