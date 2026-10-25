import { Routes } from '@angular/router';

const notFound = () => import('@pages/not-found/not-found').then((m) => m.NotFound);

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('@pages/hero/hero').then((m) => m.Hero),
  },
  {
    path: '404',
    loadComponent: notFound,
    title: __APP_LOCALE__ === 'ru' ? '404 — Страница не найдена' : '404 — Page not found',
  },
  {
    path: '**',
    loadComponent: notFound,
    title: __APP_LOCALE__ === 'ru' ? '404 — Страница не найдена' : '404 — Page not found',
  },
];
