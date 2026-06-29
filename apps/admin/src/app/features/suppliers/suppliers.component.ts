import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <header class="header">
        <h1>Suppliers</h1>
        <button class="add-btn" (click)="openModal()">+ Add Supplier</button>
      </header>

      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Contact</th><th>Phone</th><th>Email</th><th></th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of suppliers">
              <td><strong>{{ s.name }}</strong><br><span class="muted">{{ s.address }}</span></td>
              <td>{{ s.contact_person || '-' }}</td>
              <td>{{ s.phone || '-' }}</td>
              <td>{{ s.email || '-' }}</td>
              <td class="actions">
                <button (click)="edit(s)">Edit</button>
                <button class="delete" (click)="remove(s.id)">Delete</button>
              </td>
            </tr>
            <tr *ngIf="suppliers.length === 0"><td colspan="5" class="empty">No suppliers yet</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="modal" *ngIf="showModal">
      <div class="modal-content">
        <h2>{{ editing ? 'Edit' : 'Add' }} Supplier</h2>
        <form (submit)="save()">
          <div class="form-group"><label>Name *</label><input [(ngModel)]="form.name" name="name" required></div>
          <div class="form-group"><label>Contact Person</label><input [(ngModel)]="form.contact_person" name="cp"></div>
          <div class="form-group"><label>Phone</label><input [(ngModel)]="form.phone" name="phone"></div>
          <div class="form-group"><label>Email</label><input type="email" [(ngModel)]="form.email" name="email"></div>
          <div class="form-group"><label>Address</label><input [(ngModel)]="form.address" name="address"></div>
          <div class="form-group"><label>Note</label><textarea [(ngModel)]="form.note" name="note" rows="2"></textarea></div>
          <div class="modal-actions">
            <button type="button" (click)="close()">Cancel</button>
            <button type="submit" [disabled]="!form.name">Save</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 2rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .table-wrap { background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.875rem 1rem; text-align: left; border-bottom: 1px solid #f3f4f6; }
    th { background: #f9fafb; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }
    .muted { font-size: 0.8125rem; color: #9ca3af; }
    .actions { white-space: nowrap; }
    .empty { text-align: center; color: #9ca3af; padding: 3rem; }
    .add-btn { padding: 0.625rem 1.25rem; background: #f97316; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .add-btn:hover { background: #ea580c; }
    button:not(.add-btn) { padding: 0.375rem 0.75rem; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer; font-size: 0.8125rem; margin-right: 0.375rem; }
    .delete { color: #ef4444; border-color: #fca5a5; }
    .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
    .modal-content { background: white; padding: 2rem; border-radius: 16px; width: 480px; max-height: 90vh; overflow-y: auto; }
    .form-group { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.375rem; }
    .form-group label { font-size: 0.8125rem; font-weight: 600; color: #374151; }
    input, textarea { padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9375rem; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
  `]
})
export class SuppliersComponent implements OnInit {
  suppliers: any[] = [];
  showModal = false;
  editing: string | null = null;
  form: any = {};

  constructor(private http: HttpClient) {}

  ngOnInit() { this.load(); }

  load() { this.http.get<any[]>('/api/v1/suppliers').subscribe(d => this.suppliers = d); }

  openModal() { this.editing = null; this.form = {}; this.showModal = true; }

  edit(s: any) {
    this.editing = s.id;
    this.form = { name: s.name, contact_person: s.contact_person, phone: s.phone, email: s.email, address: s.address, note: s.note };
    this.showModal = true;
  }

  save() {
    const req = this.editing
      ? this.http.patch(`/api/v1/suppliers/${this.editing}`, this.form)
      : this.http.post('/api/v1/suppliers', this.form);
    req.subscribe(() => { this.load(); this.close(); });
  }

  remove(id: string) {
    if (confirm('Delete this supplier?')) this.http.delete(`/api/v1/suppliers/${id}`).subscribe(() => this.load());
  }

  close() { this.showModal = false; }
}
