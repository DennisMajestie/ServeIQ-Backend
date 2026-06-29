import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

const k = (v: number) => `₦${(v / 100).toFixed(2)}`;

@Component({
  selector: 'app-shifts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <header class="header">
        <h1>Shifts</h1>
        <button class="add-btn" *ngIf="!currentShift" (click)="showOpen = true">+ Open Shift</button>
        <button class="add-btn danger" *ngIf="currentShift" (click)="prepareClose()">Close Current Shift</button>
      </header>

      <div class="cards" *ngIf="summary">
        <div class="stat"><span>Total Shifts</span><strong>{{ summary.total_shifts }}</strong></div>
        <div class="stat"><span>Closed</span><strong>{{ summary.closed_shifts }}</strong></div>
        <div class="stat"><span>Cash Sales</span><strong>{{ k(summary.total_cash_sales) }}</strong></div>
        <div class="stat"><span>Variance</span><strong [style.color]="summary.total_variance !== 0 ? '#ef4444' : '#16a34a'">{{ k(summary.total_variance) }}</strong></div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Opened</th><th>Closed</th><th>By</th><th>Start Cash</th><th>Expected</th><th>Actual</th><th>Variance</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of shifts">
              <td>{{ s.opened_at | date:'medium' }}</td>
              <td>{{ (s.closed_at | date:'medium') || '-' }}</td>
              <td>{{ s.opened_by?.slice(0,8) || '-' }}</td>
              <td>{{ k(s.starting_cash_kobo) }}</td>
              <td>{{ s.expected_cash_kobo != null ? k(s.expected_cash_kobo) : '-' }}</td>
              <td>{{ s.actual_cash_kobo != null ? k(s.actual_cash_kobo) : '-' }}</td>
              <td [style.color]="(s.variance_kobo || 0) !== 0 ? '#ef4444' : '#16a34a'">{{ s.variance_kobo != null ? k(s.variance_kobo) : '-' }}</td>
              <td><span class="badge" [class.open]="s.status === 'open'">{{ s.status }}</span></td>
            </tr>
            <tr *ngIf="shifts.length === 0"><td colspan="8" class="empty">No shifts yet</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Open Shift Modal -->
    <div class="modal" *ngIf="showOpen">
      <div class="modal-content">
        <h2>Open Shift</h2>
        <form (submit)="openShift()">
          <div class="form-group"><label>Starting Cash (kobo)</label><input type="number" [(ngModel)]="openDto.starting_cash_kobo" name="startCash" required min="0"></div>
          <div class="form-group"><label>Note</label><textarea [(ngModel)]="openDto.note" name="note" rows="2"></textarea></div>
          <div class="modal-actions">
            <button type="button" (click)="showOpen = false">Cancel</button>
            <button type="submit" [disabled]="openDto.starting_cash_kobo == null">Open Shift</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Close Shift Modal -->
    <div class="modal" *ngIf="showClose">
      <div class="modal-content">
        <h2>Close Shift</h2>
        <p>Expected cash: <strong>{{ k(currentShift?.expected_cash_kobo || 0) }}</strong></p>
        <form (submit)="closeShift()">
          <div class="form-group"><label>Actual Cash Counted (kobo)</label><input type="number" [(ngModel)]="closeDto.actual_cash_kobo" name="actualCash" required min="0"></div>
          <div class="form-group"><label>Note</label><textarea [(ngModel)]="closeDto.note" name="note" rows="2"></textarea></div>
          <div class="modal-actions">
            <button type="button" (click)="showClose = false">Cancel</button>
            <button type="submit" [disabled]="closeDto.actual_cash_kobo == null">Close Shift</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 2rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .stat { background: white; border-radius: 12px; padding: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08); display: flex; flex-direction: column; }
    .stat span { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; }
    .stat strong { font-size: 1.5rem; margin-top: 0.25rem; }
    .table-wrap { background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #f3f4f6; font-size: 0.875rem; }
    th { background: #f9fafb; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; background: #d1d5db; }
    .badge.open { background: #d1fae5; color: #065f46; }
    .empty { text-align: center; color: #9ca3af; padding: 3rem; }
    .add-btn { padding: 0.625rem 1.25rem; background: #f97316; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .add-btn.danger { background: #ef4444; }
    .add-btn:hover { opacity: 0.9; }
    .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
    .modal-content { background: white; padding: 2rem; border-radius: 16px; width: 420px; }
    .form-group { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.375rem; }
    .form-group label { font-size: 0.8125rem; font-weight: 600; color: #374151; }
    input, textarea { padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9375rem; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
    .modal-actions button:last-child { background: #f97316; color: white; border: none; padding: 0.5rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
  `]
})
export class ShiftsComponent implements OnInit {
  shifts: any[] = [];
  currentShift: any = null;
  summary: any = null;
  showOpen = false;
  showClose = false;
  openDto = { starting_cash_kobo: 0, note: '' };
  closeDto = { actual_cash_kobo: 0, note: '' };
  k = k;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.load();
    this.http.get<any>('/api/v1/reports/shifts').subscribe(s => this.summary = s);
  }

  load() {
    this.http.get<any[]>('/api/v1/shifts').subscribe(list => {
      this.shifts = list;
      const open = list.find(s => s.status === 'open');
      this.currentShift = open || null;
    });
  }

  openShift() {
    this.http.post('/api/v1/shifts/open', this.openDto).subscribe(() => {
      this.showOpen = false;
      this.openDto = { starting_cash_kobo: 0, note: '' };
      this.load();
    });
  }

  prepareClose() {
    this.closeDto = { actual_cash_kobo: 0, note: '' };
    this.showClose = true;
  }

  closeShift() {
    this.http.post(`/api/v1/shifts/${this.currentShift.id}/close`, this.closeDto).subscribe(() => {
      this.showClose = false;
      this.load();
    });
  }
}
