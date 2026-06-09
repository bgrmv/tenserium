import { Routes } from '@angular/router';

export const ROUTES: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: '',
    loadComponent: () =>
      import('@widgets/app-shell').then((m) => m.AppShellComponent),
    children: [
      {
        path: 'home',
        title: 'Tenserium',
        loadComponent: () =>
          import('@pages/home').then((m) => m.HomePageComponent),
      },
      {
        path: 'learn',
        redirectTo: 'learn/present-simple',
        pathMatch: 'full',
      },
      {
        path: 'learn/:tenseId',
        title: 'Learn | Tenserium',
        loadComponent: () =>
          import('@pages/learn').then((m) => m.LearnPageComponent),
      },
      {
        path: 'stats',
        title: 'Stats | Tenserium',
        loadComponent: () =>
          import('@pages/stats').then((m) => m.StatsPageComponent),
      },
      {
        path: 'daily',
        title: 'Daily Challenge | Tenserium',
        loadComponent: () =>
          import('@pages/daily').then((m) => m.DailyPageComponent),
      },
    ],
  },
  {
    path: 'game',
    title: 'Game | Tenserium',
    loadComponent: () =>
      import('@pages/game').then((m) => m.GamePageComponent),
  },
  {
    path: 'onboarding',
    title: 'Welcome | Tenserium',
    loadComponent: () =>
      import('@pages/onboarding').then((m) => m.OnboardingPageComponent),
  },
  {
    path: '**',
    redirectTo: '/home',
  },
];
