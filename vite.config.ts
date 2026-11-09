import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

const path = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));

const mainLocale = 'en-US';
const additionalLocales = ['ru', 'ua'] as const;

type AdditionalLocale = (typeof additionalLocales)[number];

const isAdditionalLocale = (locale: string): locale is AdditionalLocale =>
  additionalLocales.some((supportedLocale) => supportedLocale === locale);

export default defineConfig(({ mode }) => {
  const additionalLocale = isAdditionalLocale(mode) ? mode : null;
  const locale = additionalLocale ?? mainLocale;

  const localeHtml: Plugin = {
    name: 'locale-html',
    transformIndexHtml(html) {
      return html.replace('lang="en"', `lang="${locale}"`);
    },
  };

  return {
    plugins: [angular(), localeHtml],
    resolve: {
      mainFields: ['module'],
      alias: Object.fromEntries(
        ['app', 'pages', 'widgets', 'features', 'entities', 'shared'].map((layer) => [
          `@${layer}`,
          path(`./src/${layer}`),
        ]),
      ),
    },
    define: { __APP_LOCALE__: JSON.stringify(locale) },
    server: { port: 4200 },
    build: { outDir: `dist/cpa-landing/${locale}`, target: 'es2022' },
  };
});
