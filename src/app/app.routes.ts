import { Routes } from '@angular/router';

const notFound = () => import('@pages/not-found/not-found').then((m) => m.NotFound);

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('@pages/hero/hero').then((m) => m.Hero),
  },
  {
    path:'tasks',
    pathMatch: 'full',
    loadComponent: () => import('@pages/multi-tasks/multi-tasks').then((m) => m.MultiTasks),
  },
  {
    path: 'benefits',
    pathMatch: 'full',
    loadComponent: () => import('@pages/multi-benefits/multi-benefits').then((m) => m.MultiBenefits),
  },
  {
    path: 'with-us',
    pathMatch: 'full',
    loadComponent: () => import('@pages/multiply-with-us/multiply-with-us').then((m) => m.MultiplyWithUs),
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
