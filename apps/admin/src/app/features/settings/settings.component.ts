import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container">
      <header class="header">
        <h1>Settings</h1>
        <span class="saved-hint" *ngIf="saved">Saved!</span>
      </header>

      <section class="card">
        <h2>Profile</h2>
        <div class="field">
          <label>Full Name</label>
          <input type="text" [(ngModel)]="profile.full_name" name="fullName" />
        </div>
        <div class="field">
          <label>Email</label>
          <input type="email" [(ngModel)]="profile.email" name="email" />
        </div>
        <button class="save-btn" (click)="saveProfile()">Update Profile</button>
      </section>

      <section class="card">
        <h2>Branch</h2>
        <div class="field">
          <label>Current Branch</label>
          <select [(ngModel)]="selectedBranchId" name="branch">
            <option *ngFor="let b of branches" [value]="b.id">{{ b.name }}</option>
          </select>
        </div>
      </section>

      <section class="card">
        <h2>Business Settings</h2>
        <div class="field">
          <label>Tax Rate (%)</label>
          <input type="number" step="0.01" min="0" max="100" [(ngModel)]="business.tax_rate" name="taxRate" />
        </div>
        <div class="field">
          <label>Currency</label>
          <select [(ngModel)]="business.currency" name="currency">
            <option value="NGN">NGN (₦)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
        <div class="field">
          <label>Timezone</label>
          <select [(ngModel)]="business.timezone" name="timezone">
            <option value="Africa/Lagos">GMT+1 (West Africa)</option>
            <option value="Africa/Accra">GMT+0 (Ghana)</option>
            <option value="Africa/Nairobi">GMT+3 (East Africa)</option>
            <option value="Africa/Johannesburg">GMT+2 (South Africa)</option>
            <option value="Europe/London">GMT+0/+1 (UK)</option>
            <option value="America/New_York">GMT-5/-4 (US Eastern)</option>
          </select>
        </div>
        <button class="save-btn" (click)="saveBusiness()">Save Settings</button>
      </section>
    </div>
  `,
  styles: [`
    .settings-container { padding: 2rem; max-width: 640px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .saved-hint { color: #16a34a; font-weight: 600; font-size: 0.875rem; }
    .card { background: white; border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .card h2 { margin-top: 0; margin-bottom: 1.25rem; font-size: 1.125rem; color: #1f2937; }
    .field { display: flex; flex-direction: column; gap: 0.375rem; margin-bottom: 1rem; }
    .field label { font-size: 0.8125rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.025em; }
    .field input, .field select { padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9375rem; }
    .field input:focus, .field select:focus { outline: 2px solid #f97316; border-color: transparent; }
    .save-btn { margin-top: 0.5rem; padding: 0.625rem 1.5rem; background: #f97316; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .save-btn:hover { background: #ea580c; }
  `]
})
export class SettingsComponent implements OnInit {
  profile: any = { full_name: '', email: '' };
  branches: any[] = [];
  selectedBranchId = '';
  business: any = { tax_rate: 7.5, currency: 'NGN', timezone: 'Africa/Lagos' };
  saved = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>('/api/v1/user/me').subscribe(u => {
      this.profile = u;
    });
    this.http.get<any[]>('/api/v1/branches').subscribe(list => {
      this.branches = list;
      if (list.length) this.selectedBranchId = list[0].id;
    });
    this.http.get<any>('/api/v1/businesses/me').subscribe(b => {
      this.business = b;
    });
  }

  saveProfile() {
    this.http.patch('/api/v1/user/me', this.profile).subscribe(() => this.flashSaved());
  }

  saveBusiness() {
    this.http.patch('/api/v1/businesses/me', this.business).subscribe(() => this.flashSaved());
  }

  private flashSaved() {
    this.saved = true;
    setTimeout(() => this.saved = false, 2000);
  }
}
