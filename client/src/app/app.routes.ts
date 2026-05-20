import { Routes } from '@angular/router';
import { Login } from './pages/login/login';

export const routes: Routes = [

  // ROOT -> HOME
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },

  // LOGIN
  {
    path: 'login',
    component: Login,
    title: 'Login'
  },

  // HOME
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home-page/home-page').then(m => m.HomePage),
    title: 'Home Page'
  },

  // ACCOUNT
  {
    path: 'account',
    loadComponent: () =>
      import('./pages/account/account').then(m => m.Account),
    title: 'Account'
  },

  // CLASSES
  {
    path: 'classes',
    loadComponent: () =>
      import('./pages/classes/classes').then(m => m.Classes),
    title: 'Classes'
  },

  // PAYMENT
  {
    path: 'payment',
    loadComponent: () =>
      import('./pages/payment/payment').then(m => m.Payment),
    title: 'Payment'
  },

  // CONTACT
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact').then(m => m.Contact),
    title: 'Contact'
  },

  // REVIEWS
  {
    path: 'reviews',
    loadComponent: () =>
      import('./pages/reviews/reviews').then(m => m.Reviews),
    title: 'Reviews'
  },

  // NOT FOUND
  {
    path: '**',
    redirectTo: 'home'
  }

];