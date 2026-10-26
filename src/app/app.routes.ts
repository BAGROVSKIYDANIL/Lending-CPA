import { Routes } from '@angular/router';
import {MultiBenefits} from "@widgets/multi-benefits";
import {MultiplyWithUs} from "@widgets/multiply-with-us";

const notFound = () => import('@pages/not-found/not-found').then((m) => m.NotFound);

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('@pages/hero/hero').then((m) => m.Hero),
  },
  {
    path: 'benefits',
    pathMatch: 'full',
    loadComponent: () => import('@widgets/multi-benefits/ui/multi-benefits').then((m) => m.MultiBenefits),
  },
  {
    path: 'with-us',
    pathMatch: 'full',
    loadComponent: () => import('@widgets/multiply-with-us/multiply-with-us').then((m) => m.MultiplyWithUs),
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
