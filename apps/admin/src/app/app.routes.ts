import { Routes } from '@angular/router';
import { WaiterManagementComponent } from './features/waiters/waiter-management.component';
import { MenuManagementComponent } from './features/menu/menu-management.component';
import { TableManagementComponent } from './features/tables/table-management.component';
import { SettingsComponent } from './features/settings/settings.component';

export const routes: Routes = [
  { path: '', redirectTo: 'waiters', pathMatch: 'full' },
  { path: 'waiters', component: WaiterManagementComponent },
  { path: 'menu', component: MenuManagementComponent },
  { path: 'tables', component: TableManagementComponent },
  { path: 'settings', component: SettingsComponent },
];
