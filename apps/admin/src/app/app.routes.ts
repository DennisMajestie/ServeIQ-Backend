import { Routes } from '@angular/router';
import { WaiterManagementComponent } from './features/waiters/waiter-management.component';
import { MenuManagementComponent } from './features/menu/menu-management.component';
import { TableManagementComponent } from './features/tables/table-management.component';
import { SettingsComponent } from './features/settings/settings.component';
import { SuppliersComponent } from './features/suppliers/suppliers.component';
import { ShiftsComponent } from './features/shifts/shifts.component';
import { InventoryComponent } from './features/inventory/inventory.component';

export const routes: Routes = [
  { path: '', redirectTo: 'waiters', pathMatch: 'full' },
  { path: 'waiters', component: WaiterManagementComponent },
  { path: 'menu', component: MenuManagementComponent },
  { path: 'tables', component: TableManagementComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'suppliers', component: SuppliersComponent },
  { path: 'shifts', component: ShiftsComponent },
  { path: 'inventory', component: InventoryComponent },
];
