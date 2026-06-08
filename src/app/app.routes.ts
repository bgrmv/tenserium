import { Routes } from '@angular/router';

export const ROUTES: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('@pages/home').then((m) => m.HomePageComponent),
  },
  {
    path: 'present-simple',
    loadComponent: () =>
      import('@pages/present-simple').then(
        (m) => m.PresentSimpleShellPageComponent,
      ),
    children: [
      {
        path: 'learn',
        title: 'Present Simple | Learn',
        loadComponent: () =>
          import('@pages/present-simple').then(
            (m) => m.PresentSimpleLearnPageComponent,
          ),
      },
      {
        path: 'exam',
        title: 'Present Simple | Exam',
        loadComponent: () =>
          import('@pages/present-simple').then(
            (m) => m.PresentSimpleExamPageComponent,
          ),
      },
    ],
  },
];
