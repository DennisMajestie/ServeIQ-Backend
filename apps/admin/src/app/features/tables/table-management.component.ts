import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-table-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="table-management-container">
      <header class="header">
        <h1>Table Management</h1>
        <button class="add-btn" (click)="openAddModal()">+ Add Table</button>
      </header>

      <div class="table-grid">
        <div class="table-card" *ngFor="let table of tables" [class.occupied]="table.status === 'occupied'">
          <div class="table-header">
            <span class="table-number">{{ table.table_number }}</span>
            <span class="status-badge" [class]="table.status">{{ table.status }}</span>
          </div>
          <div class="table-body">
            <p *ngIf="table.label" class="label">{{ table.label }}</p>
            <p class="capacity">Capacity: {{ table.capacity }}</p>
          </div>
          <div class="actions">
            <button (click)="editTable(table)">Edit</button>
            <button class="delete" (click)="deleteTable(table.id)">Delete</button>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div class="modal" *ngIf="showModal">
        <div class="modal-content">
          <h2>{{ isEditing ? 'Edit' : 'Add' }} Table</h2>
          <form (submit)="saveTable()">
            <div class="form-group">
              <label>Table Number / ID</label>
              <input type="text" [(ngModel)]="currentTable.table_number" name="table_number" placeholder="e.g. T1" required>
            </div>
            <div class="form-group">
              <label>Label (Optional)</label>
              <input type="text" [(ngModel)]="currentTable.label" name="label" placeholder="e.g. Window Side">
            </div>
            <div class="form-group">
              <label>Capacity</label>
              <input type="number" [(ngModel)]="currentTable.capacity" name="capacity" min="1" required>
            </div>
            <div class="form-group">
              <label>Status</label>
              <select [(ngModel)]="currentTable.status" name="status">
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" (click)="closeModal()">Cancel</button>
              <button type="submit" [disabled]="!currentTable.table_number || !currentTable.capacity">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table-management-container { padding: 2rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .table-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem; }
    .table-card { 
      background: white; border-radius: 12px; padding: 1.5rem; border: 1px solid #e2e8f0;
      transition: all 0.2s; position: relative; overflow: hidden;
    }
    .table-card.occupied { border-left: 4px solid #ef4444; }
    .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .table-number { font-size: 1.25rem; font-weight: 700; color: #1e293b; }
    .status-badge { 
      font-size: 0.75rem; padding: 2px 8px; border-radius: 12px; text-transform: uppercase; font-weight: 600;
    }
    .status-badge.available { background: #dcfce7; color: #166534; }
    .status-badge.occupied { background: #fee2e2; color: #991b1b; }
    .status-badge.reserved { background: #fef9c3; color: #854d0e; }
    
    .table-body { margin-bottom: 1.5rem; }
    .label { color: #64748b; font-size: 0.875rem; margin-bottom: 0.25rem; }
    .capacity { font-size: 0.875rem; color: #1e293b; }
    
    .actions { display: flex; gap: 1rem; border-top: 1px solid #f1f5f9; padding-top: 1rem; }
    .delete { color: #ef4444; }

    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
    .modal-content { background: white; padding: 2rem; border-radius: 16px; width: 400px; }
    .form-group { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
    input, select { padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
  `]
})
export class TableManagementComponent implements OnInit {
  tables: any[] = [];
  showModal = false;
  isEditing = false;
  currentTable: any = {};

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadTables();
  }

  loadTables() {
    this.http.get<any[]>('/api/v1/tables').subscribe(data => this.tables = data);
  }

  openAddModal() {
    this.isEditing = false;
    this.currentTable = { table_number: '', label: '', capacity: 1, status: 'available' };
    this.showModal = true;
  }

  editTable(table: any) {
    this.isEditing = true;
    this.currentTable = { ...table };
    this.showModal = true;
  }

  saveTable() {
    const request = this.isEditing 
      ? this.http.patch(`/api/v1/tables/${this.currentTable.id}`, this.currentTable)
      : this.http.post('/api/v1/tables', this.currentTable);

    request.subscribe({
      next: () => {
        this.loadTables();
        this.closeModal();
      },
      error: (err) => {
        console.error('Failed to save table', err);
        alert('Error saving table. Check if table number is unique.');
      }
    });
  }

  deleteTable(id: string) {
    if (confirm('Are you sure you want to delete this table?')) {
      this.http.delete(`/api/v1/tables/${id}`).subscribe(() => this.loadTables());
    }
  }

  closeModal() {
    this.showModal = false;
  }
}
