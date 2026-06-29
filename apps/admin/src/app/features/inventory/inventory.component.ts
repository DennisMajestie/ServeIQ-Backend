import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

const k = (v: number) => `₦${(v / 100).toFixed(2)}`;

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <header class="header">
        <h1>Inventory</h1>
        <div class="tabs">
          <button [class.active]="tab === 'items'" (click)="tab = 'items'">Items</button>
          <button [class.active]="tab === 'alerts'" (click)="tab = 'alerts'">Alerts</button>
          <button [class.active]="tab === 'bestsellers'" (click)="tab = 'bestsellers'">Bestsellers</button>
          <button [class.active]="tab === 'variance'" (click)="tab = 'variance'">Variance</button>
        </div>
      </header>

      <!-- Items Tab -->
      <ng-container *ngIf="tab === 'items'">
        <button class="add-btn" (click)="showAddItem = true">+ Add Item</button>
        <div class="table-wrap" style="margin-top:1rem">
          <table>
            <thead><tr><th>Menu Item</th><th>Category</th><th>In Stock</th><th>Reorder At</th><th>Status</th><th></th></tr></thead>
            <tbody>
              <tr *ngFor="let i of items">
                <td>{{ i.menu_item?.name || 'Unknown' }}</td>
                <td>{{ i.menu_item?.category || '-' }}</td>
                <td>{{ i.quantity_in_stock }}</td>
                <td>{{ i.reorder_level }}</td>
                <td><span class="badge" [class.low]="i.is_low_stock">{{ i.is_low_stock ? 'Low Stock' : 'OK' }}</span></td>
                <td class="actions">
                  <button (click)="showAddStock(i)">Add Stock</button>
                  <button (click)="showMovements(i)">History</button>
                </td>
              </tr>
              <tr *ngIf="items.length === 0"><td colspan="6" class="empty">No inventory items</td></tr>
            </tbody>
          </table>
        </div>
      </ng-container>

      <!-- Alerts Tab -->
      <ng-container *ngIf="tab === 'alerts'">
        <div class="table-wrap">
          <table>
            <thead><tr><th>Item</th><th>In Stock</th><th>Reorder At</th><th>Deficit</th></tr></thead>
            <tbody>
              <tr *ngFor="let a of alerts">
                <td>{{ a.menu_item_name }}</td>
                <td class="warn">{{ a.quantity_in_stock }}</td>
                <td>{{ a.reorder_level }}</td>
                <td class="warn">{{ a.deficit }}</td>
              </tr>
              <tr *ngIf="alerts.length === 0"><td colspan="4" class="empty">All items are well stocked</td></tr>
            </tbody>
          </table>
        </div>
      </ng-container>

      <!-- Bestsellers Tab -->
      <ng-container *ngIf="tab === 'bestsellers'">
        <div class="cards" *ngIf="bestsellersData">
          <div class="stat"><span>Bestsellers</span><strong>{{ bestsellersData.bestsellers.length }}</strong></div>
          <div class="stat"><span>Slow Movers</span><strong>{{ bestsellersData.slow_movers.length }}</strong></div>
          <div class="stat"><span>Out of Stock</span><strong style="color:#ef4444">{{ bestsellersData.out_of_stock.length }}</strong></div>
        </div>
        <div class="table-wrap" style="margin-top:1rem">
          <table>
            <thead><tr><th>Item</th><th>Sold</th><th>Revenue</th><th>Stock</th><th>Days Left</th></tr></thead>
            <tbody>
              <tr *ngFor="let b of bestsellersData?.bestsellers">
                <td>{{ b.menu_item_name }}</td>
                <td>{{ b.total_sold }}</td>
                <td>{{ k(b.revenue_kobo) }}</td>
                <td><span [class.warn]="b.is_low_stock">{{ b.current_stock }}</span></td>
                <td>{{ b.estimated_days_until_out ?? '-' }}</td>
              </tr>
              <tr *ngIf="!bestsellersData?.bestsellers?.length"><td colspan="5" class="empty">No sales data yet</td></tr>
            </tbody>
          </table>
        </div>
      </ng-container>

      <!-- Variance Tab -->
      <ng-container *ngIf="tab === 'variance'">
        <div class="table-wrap">
          <table>
            <thead><tr><th>Item</th><th>Current</th><th>Purchased</th><th>Sold</th><th>Wastage</th><th>Expected</th><th>Variance</th></tr></thead>
            <tbody>
              <tr *ngFor="let v of variance">
                <td>{{ v.menu_item_name }}</td>
                <td>{{ v.current_stock }}</td>
                <td>{{ v.total_purchased }}</td>
                <td>{{ v.total_sold }}</td>
                <td>{{ v.total_wastage }}</td>
                <td>{{ v.expected_stock }}</td>
                <td><span [style.color]="v.variance !== 0 ? '#ef4444' : '#16a34a'">{{ v.variance }}</span></td>
              </tr>
              <tr *ngIf="variance.length === 0"><td colspan="7" class="empty">No variance data</td></tr>
            </tbody>
          </table>
        </div>
      </ng-container>
    </div>

    <!-- Add Inventory Item Modal -->
    <div class="modal" *ngIf="showAddItem">
      <div class="modal-content">
        <h2>Add Inventory Item</h2>
        <form (submit)="addItem()">
          <div class="form-group"><label>Menu Item</label><select [(ngModel)]="newItem.menu_item_id" name="menuItem" required>
            <option value="">-- Select --</option>
            <option *ngFor="let m of menuItems" [value]="m.id">{{ m.name }}</option>
          </select></div>
          <div class="form-group"><label>Initial Stock</label><input type="number" [(ngModel)]="newItem.quantity_in_stock" name="qty" min="0"></div>
          <div class="form-group"><label>Reorder Level</label><input type="number" [(ngModel)]="newItem.reorder_level" name="reorder" min="0"></div>
          <div class="modal-actions">
            <button type="button" (click)="showAddItem = false">Cancel</button>
            <button type="submit" [disabled]="!newItem.menu_item_id">Add</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Stock Modal -->
    <div class="modal" *ngIf="showStockModal">
      <div class="modal-content">
        <h2>Add Stock</h2>
        <p>Current: <strong>{{ stockTarget?.quantity_in_stock }}</strong></p>
        <form (submit)="addStock()">
          <div class="form-group"><label>Quantity to Add</label><input type="number" [(ngModel)]="stockQty" name="stockQty" required min="1"></div>
          <div class="form-group"><label>Notes</label><input [(ngModel)]="stockNotes" name="notes" placeholder="e.g. purchase, wastage"></div>
          <div class="modal-actions">
            <button type="button" (click)="showStockModal = false">Cancel</button>
            <button type="submit" [disabled]="!stockQty || stockQty < 1">Add</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Movements Modal -->
    <div class="modal" *ngIf="showMovementsModal">
      <div class="modal-content wide">
        <h2>Stock Movements</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Change</th><th>After</th><th>Type</th><th>Notes</th></tr></thead>
            <tbody>
              <tr *ngFor="let m of movements">
                <td>{{ m.created_at | date:'short' }}</td>
                <td [style.color]="m.quantity_change > 0 ? '#16a34a' : '#ef4444'">{{ m.quantity_change > 0 ? '+' : '' }}{{ m.quantity_change }}</td>
                <td>{{ m.quantity_after }}</td>
                <td><span class="badge">{{ m.movement_type }}</span></td>
                <td>{{ m.notes || '-' }}</td>
              </tr>
              <tr *ngIf="movements.length === 0"><td colspan="5" class="empty">No movements</td></tr>
            </tbody>
          </table>
        </div>
        <div class="modal-actions"><button type="button" (click)="showMovementsModal = false">Close</button></div>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 2rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem; }
    .tabs { display: flex; gap: 0.25rem; background: #f3f4f6; border-radius: 10px; padding: 0.25rem; }
    .tabs button { padding: 0.5rem 1rem; border: none; background: transparent; border-radius: 8px; font-weight: 500; cursor: pointer; font-size: 0.875rem; }
    .tabs button.active { background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem; }
    .stat { background: white; border-radius: 12px; padding: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08); display: flex; flex-direction: column; }
    .stat span { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; }
    .stat strong { font-size: 1.5rem; margin-top: 0.25rem; }
    .table-wrap { background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #f3f4f6; font-size: 0.875rem; }
    th { background: #f9fafb; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; background: #d1fae5; color: #065f46; }
    .badge.low { background: #fee2e2; color: #991b1b; }
    .warn { color: #ef4444; font-weight: 600; }
    .empty { text-align: center; color: #9ca3af; padding: 3rem; }
    .add-btn { padding: 0.625rem 1.25rem; background: #f97316; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .actions button { padding: 0.375rem 0.75rem; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer; font-size: 0.8125rem; margin-right: 0.375rem; }
    .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
    .modal-content { background: white; padding: 2rem; border-radius: 16px; width: 500px; max-height: 90vh; overflow-y: auto; }
    .modal-content.wide { width: 700px; }
    .form-group { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.375rem; }
    .form-group label { font-size: 0.8125rem; font-weight: 600; color: #374151; }
    input, select { padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9375rem; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
    .modal-actions button:last-child { background: #f97316; color: white; border: none; padding: 0.5rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
  `]
})
export class InventoryComponent implements OnInit {
  tab = 'items';
  items: any[] = [];
  alerts: any[] = [];
  bestsellersData: any = null;
  variance: any[] = [];

  menuItems: any[] = [];
  showAddItem = false;
  newItem = { menu_item_id: '', quantity_in_stock: 0, reorder_level: 10 };

  showStockModal = false;
  stockTarget: any = null;
  stockQty = 0;
  stockNotes = '';

  showMovementsModal = false;
  movements: any[] = [];

  k = k;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('/api/v1/inventory').subscribe(d => this.items = d);
    this.http.get<any[]>('/api/v1/inventory/alerts').subscribe(d => this.alerts = d);
    this.http.get<any>('/api/v1/inventory/bestsellers').subscribe(d => this.bestsellersData = d);
    this.http.get<any[]>('/api/v1/reports/stock-variance').subscribe(d => this.variance = d);
    this.http.get<any>('/api/v1/menu').subscribe(d => this.menuItems = d.data || d);
  }

  addItem() {
    this.http.post('/api/v1/inventory', this.newItem).subscribe(() => {
      this.showAddItem = false;
      this.newItem = { menu_item_id: '', quantity_in_stock: 0, reorder_level: 10 };
      this.http.get<any[]>('/api/v1/inventory').subscribe(d => this.items = d);
    });
  }

  showAddStock(item: any) {
    this.stockTarget = item;
    this.stockQty = 0;
    this.stockNotes = '';
    this.showStockModal = true;
  }

  addStock() {
    this.http.post(`/api/v1/inventory/${this.stockTarget.id}/stock`, { quantity: this.stockQty, notes: this.stockNotes }).subscribe(() => {
      this.showStockModal = false;
      this.http.get<any[]>('/api/v1/inventory').subscribe(d => this.items = d);
    });
  }

  showMovements(item: any) {
    this.http.get<any[]>(`/api/v1/inventory/${item.id}/movements`).subscribe(d => {
      this.movements = d;
      this.showMovementsModal = true;
    });
  }
}
