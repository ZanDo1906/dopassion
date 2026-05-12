import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then(m => m.Login)
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'account',
        loadComponent: () => import('./pages/account/account').then(m => m.Account)
    },
    {
        path: 'courses',
        children: [
            {
                path: '',
                redirectTo: 'courses',
                pathMatch: 'full'
            },
            {
                path: 'courses',
                loadComponent: () => import('./pages/courses/courses/courses').then(m => m.Courses)
            },
            {
                path: 'classes',
                loadComponent: () => import('./pages/courses/classes/classes').then(m => m.Classes)
            }
        ]
    },
    {
        path: 'interactions',
        children: [
            {
                path: '',
                redirectTo: 'request',
                pathMatch: 'full'
            },
            {
                path: 'request',
                loadComponent: () => import('./pages/interactions/request/request').then(m => m.Request)
            },
            {
                path: 'feedback',
                loadComponent: () => import('./pages/interactions/feedback/feedback').then(m => m.Feedback)
            }
        ]
    },
    {
        path: 'report',
        children: [
            {
                path: '',
                redirectTo: 'student-report',
                pathMatch: 'full'
            },
            {
                path: 'student-report',
                loadComponent: () => import('./pages/report/student-report/student-report').then(m => m.StudentReport)
            },
            {
                path: 'debt-report',
                loadComponent: () => import('./pages/report/debt-report/debt-report').then(m => m.DebtReport)
            },
            {
                path: 'revenue-report',
                loadComponent: () => import('./pages/report/revenue-report/revenue-report').then(m => m.RevenueReport)
            }
        ]
    },
    {
        path: 'users',
        children: [
            {
                path: '',
                redirectTo: 'customer',
                pathMatch: 'full'
            },
            {
                path: 'customer',
                loadComponent: () => import('./pages/users/customer/customer').then(m => m.Customer)
            },
            {
                path: 'registration',
                loadComponent: () => import('./pages/users/registration/registration').then(m => m.Registration)
            },
            {
                path: 'staff',
                children: [
                    {
                        path: '',
                        redirectTo: 'staff',
                        pathMatch: 'full'
                    },
                    {
                        path: 'staff',
                        loadComponent: () => import('./pages/users/staff/staff/staff').then(m => m.Staff)
                    },
                    {
                        path: 'role',
                        loadComponent: () => import('./pages/users/staff/role/role').then(m => m.Role)
                    }
                ]
            }
        ]
    },
    {
        path: 'accounting',
        children: [
            {
                path: '',
                redirectTo: 'payment',
                pathMatch: 'full'
            },
            {
                path: 'payment',
                loadComponent: () => import('./pages/accounting/payment/payment').then(m => m.Payment)
            },
            {
                path: 'refund',
                loadComponent: () => import('./pages/accounting/refund/refund').then(m => m.Refund)
            },
            {
                path: 'debt',
                loadComponent: () => import('./pages/accounting/debt/debt').then(m => m.Debt)
            },
            {
                path: 'voucher',
                loadComponent: () => import('./pages/accounting/voucher/voucher').then(m => m.Voucher)
            }
        ]
    },
    {
        path: 'setting',
        loadComponent: () => import('./pages/setting/setting').then(m => m.Setting)
    }
];
