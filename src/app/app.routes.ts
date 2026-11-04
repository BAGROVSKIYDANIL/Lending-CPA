import { Routes } from '@angular/router';
import {languageGuard, languageResolver} from "@app/core/router";

const notFound = () => import('@pages/not-found/not-found').then((m) => m.NotFound);

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'en',
    },
    {
        path: ':lang',
        canActivate: [languageGuard],
        resolve: {
            language: languageResolver,
        },
        runGuardsAndResolvers: 'paramsChange',
        children: [
            {
                path: '',
                pathMatch: 'full',
                loadComponent: () => import('@pages/hero/hero').then((m) => m.Hero),
            },
            {
                path:'team',
                pathMatch: 'full',
                loadComponent: () => import('@pages/multi-tasks/multi-tasks').then((m) => m.MultiTasks),
            },
            {
                path: 'benefits',
                pathMatch: 'full',
                loadComponent: () => import('@widgets/multi-benefits/ui/multi-benefits').then((m) => m.MultiBenefits),
            },
            {
                path: 'join-us',
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
        ]
    }
];
