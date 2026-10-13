import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { transformAsync } from '@babel/core';
import {
  Diagnostics,
  Xliff1TranslationParser,
  makeEs2015TranslatePlugin,
} from '@angular/localize/tools';

const path = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));

export default defineConfig(({ mode }) => {
  const locale = mode === 'ru' ? 'ru' : 'en-US';
  let translations = {};
  if (locale === 'ru') {
    const file = path('./src/locales/messages.ru.xlf');
    const contents = readFileSync(file, 'utf8');
    const parser = new Xliff1TranslationParser();
    const analysis = parser.analyze(file, contents);
    if (!analysis.canParse) throw new Error(`Invalid XLIFF: ${file}`);
    const bundle = parser.parse(file, contents, analysis.hint);
    if (bundle.diagnostics.hasErrors)
      throw new Error(bundle.diagnostics.formatDiagnostics('Invalid translations'));
    translations = bundle.translations;
  }

  const localize: Plugin = {
    name: 'angular-localize',
    enforce: 'post',
    transformIndexHtml(html) {
      return html.replace('lang="en"', `lang="${locale}"`);
    },
    async transform(code, id) {
      if (!/\.[cm]?[jt]s(?:\?|$)/.test(id) || !/\$localize\s*`/.test(code)) return;
      const diagnostics = new Diagnostics();
      const result = await transformAsync(code, {
        filename: id.split('?')[0],
        configFile: false,
        babelrc: false,
        sourceMaps: true,
        plugins: [
          makeEs2015TranslatePlugin(diagnostics, translations, {
            missingTranslation: locale === 'ru' ? 'error' : 'ignore',
          }),
        ],
      });
      if (diagnostics.hasErrors) this.error(diagnostics.formatDiagnostics('Missing translations'));
      if (result?.code) return { code: result.code, map: result.map };
    },
  };

  return {
    plugins: [angular(), localize],
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
