import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'form',
    loadComponent: () => import('./features/visits/form/form-shell.component').then(m => m.FormShellComponent),
    canActivate: [authGuard],
  },
  {
    path: 'success',
    loadComponent: () => import('./features/visits/success/success.component').then(m => m.SuccessComponent),
    canActivate: [authGuard],
  },
  {
    path: 'visits',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/visits/history/visit-history.component').then(m => m.VisitHistoryComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./features/visits/detail/visit-detail.component').then(m => m.VisitDetailComponent),
      },
    ],
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'login' },
];
