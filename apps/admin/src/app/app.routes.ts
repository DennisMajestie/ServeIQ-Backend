import { Routes } from '@angular/router';
import { WaiterManagementComponent } from './features/waiters/waiter-management.component';
import { MenuManagementComponent } from './features/menu/menu-management.component';

export const routes: Routes = [
  { path: '', redirectTo: 'waiters', pathMatch: 'full' },
  { path: 'waiters', component: WaiterManagementComponent },
  { path: 'menu', component: MenuManagementComponent },
];
