import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard-home/dashboard-home.component').then(m => m.DashboardHomeComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'usuarios', 
    loadComponent: () => import('./components/users/users.component').then(m => m.UsersComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'productos', 
    loadComponent: () => import('./components/products/products.component').then(m => m.ProductsComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'proveedores', 
    loadComponent: () => import('./components/suppliers/suppliers.component').then(m => m.SuppliersComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'clientes', 
    loadComponent: () => import('./components/clients/clients.component').then(m => m.ClientsComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'ventas', 
    loadComponent: () => import('./components/sales/sales.component').then(m => m.SalesComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'compras', 
    loadComponent: () => import('./components/purchases/purchases.component').then(m => m.PurchasesComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];
