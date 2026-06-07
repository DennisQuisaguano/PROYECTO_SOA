import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'select-sucursal',
    loadComponent: () => import('./pages/auth/select-sucursal/select-sucursal.component').then(m => m.SelectSucursalComponent),
    canActivate: [authGuard]
  },
  {
    path: '',
    loadComponent: () => import('./layout/app-layout.component').then(m => m.AppLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'ventas/nueva',
        loadComponent: () => import('./pages/ventas/nueva-venta/nueva-venta.component').then(m => m.NuevaVentaComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'CAJERO'] }
      },
      {
        path: 'ventas/historial',
        loadComponent: () => import('./pages/ventas/historial-ventas/historial-ventas.component').then(m => m.HistorialVentasComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'CAJERO'] }
      },
      {
        path: 'inventario',
        loadComponent: () => import('./pages/inventario/inventario-lista/inventario-lista.component').then(m => m.InventarioListaComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'BODEGUERO'] }
      },
      {
        path: 'inventario/solicitudes',
        loadComponent: () => import('./pages/inventario/solicitudes-stock/solicitudes-stock.component').then(m => m.SolicitudesStockComponent),
        canActivate: [roleGuard],
        data: { roles: ['BODEGUERO'] }
      },
      {
        path: 'inventario/historial',
        loadComponent: () => import('./pages/inventario/movimientos-historial/movimientos-historial.component').then(m => m.MovimientosHistorialComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'BODEGUERO'] }
      },
      {
        path: 'productos',
        loadComponent: () => import('./pages/productos/productos-lista/productos-lista.component').then(m => m.ProductosListaComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'BODEGUERO'] }
      },
      {
        path: 'clientes',
        loadComponent: () => import('./pages/clientes/clientes-lista/clientes-lista.component').then(m => m.ClientesListaComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'CAJERO'] }
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./pages/usuarios/usuarios-lista/usuarios-lista.component').then(m => m.UsuariosListaComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'categorias',
        loadComponent: () => import('./pages/categorias/categorias-lista/categorias-lista.component').then(m => m.CategoriasListaComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];