import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/home-page/home-page').then(m => m.HomePage),
        title: 'Home Page'
    },
    {
        path: 'account',
        loadComponent: () => import('./pages/account/account').then(m => m.Account),
        title: 'Account'
    },
    {
        path: 'classes',
        loadComponent: () => import('./pages/classes/classes').then(m => m.Classes),
        title: 'Classes'
    },
    {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact').then(m => m.Contact),
        title: 'Contact'
    },
    {
        path: 'reviews',
        loadComponent: () => import('./pages/reviews/reviews').then(m => m.Reviews),
        title: 'Reviews'
    }
];
