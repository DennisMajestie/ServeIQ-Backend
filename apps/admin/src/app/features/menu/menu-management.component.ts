import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ImageUploadComponent } from '../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUploadComponent],
  template: `
    <div class="menu-management-container">
      <header class="header">
        <h1>Menu Management</h1>
        <button class="add-btn" (click)="openAddModal()">+ Add Item</button>
      </header>

      <div class="menu-grid">
        <div class="menu-card" *ngFor="let item of menuItems">
          <div class="item-image">
            <img *ngIf="item.image_url" [src]="item.image_url" alt="{{ item.name }}">
            <div *ngIf="!item.image_url" class="no-image">No Image</div>
          </div>
          <div class="item-details">
            <div class="main-info">
              <h3>{{ item.name }}</h3>
              <span class="category">{{ item.category }}</span>
            </div>
            <p class="price">{{ (item.price_kobo / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' }) }}</p>
          </div>
          <div class="actions">
            <button (click)="editItem(item)">Edit</button>
            <button class="delete" (click)="deleteItem(item.id)">Delete</button>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div class="modal" *ngIf="showModal">
        <div class="modal-content">
          <h2>{{ isEditing ? 'Edit' : 'Add' }} Menu Item</h2>
          <form (submit)="saveItem()">
            <div class="form-group">
              <label>Item Image</label>
              <app-image-upload 
                [imageUrl]="currentItem.image_url" 
                (imageUploaded)="onImageUploaded($event)"
                (imageRemoved)="onImageRemoved()">
              </app-image-upload>
            </div>
            <div class="form-group">
              <label>Name</label>
              <input type="text" [(ngModel)]="currentItem.name" name="name" required>
            </div>
            <div class="form-group">
              <label>Category</label>
              <select [(ngModel)]="currentItem.category" name="category" required>
                <option value="Food">Food</option>
                <option value="Drinks">Drinks</option>
                <option value="Desserts">Desserts</option>
              </select>
            </div>
            <div class="form-group">
              <label>Price (NGN)</label>
              <input type="number" [ngModel]="currentItem.price_kobo / 100" (ngModelChange)="currentItem.price_kobo = $event * 100" name="price" required>
            </div>
            <div class="modal-actions">
              <button type="button" (click)="closeModal()">Cancel</button>
              <button type="submit" [disabled]="!currentItem.name || !currentItem.category">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .menu-management-container { padding: 2rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; }
    .menu-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); transition: transform 0.2s; }
    .menu-card:hover { transform: translateY(-5px); }
    .item-image { height: 180px; width: 100%; background: #f0f0f0; display: flex; justify-content: center; align-items: center; }
    .item-image img { width: 100%; height: 100%; object-fit: cover; }
    .item-details { padding: 1.25rem; }
    .main-info { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
    .category { font-size: 0.75rem; background: #fff7ed; color: #f97316; padding: 2px 8px; border-radius: 12px; font-weight: 600; }
    .price { font-size: 1.125rem; font-weight: 700; color: #1f2937; }
    .actions { padding: 1rem 1.25rem; border-top: 1px solid #f3f4f6; display: flex; gap: 1rem; }
    .delete { color: #ef4444; }
    
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
    .modal-content { background: white; padding: 2rem; border-radius: 16px; width: 450px; max-height: 90vh; overflow-y: auto; }
    .form-group { margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
    input, select { padding: 0.75rem; border: 1px solid #ddd; border-radius: 8px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
  `]
})
export class MenuManagementComponent implements OnInit {
  menuItems: any[] = [];
  showModal = false;
  isEditing = false;
  currentItem: any = {};

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadMenuItems();
  }

  loadMenuItems() {
    this.http.get<any[]>('/api/v1/menu').subscribe(data => this.menuItems = data);
  }

  openAddModal() {
    this.isEditing = false;
    this.currentItem = { name: '', category: 'Food', price_kobo: 0, image_url: null };
    this.showModal = true;
  }

  editItem(item: any) {
    this.isEditing = true;
    this.currentItem = { ...item };
    this.showModal = true;
  }

  onImageUploaded(url: string) {
    this.currentItem.image_url = url;
  }

  onImageRemoved() {
    this.currentItem.image_url = null;
  }

  saveItem() {
    const request = this.isEditing 
      ? this.http.patch(`/api/v1/menu/${this.currentItem.id}`, this.currentItem)
      : this.http.post('/api/v1/menu', this.currentItem);

    request.subscribe(() => {
      this.loadMenuItems();
      this.closeModal();
    });
  }

  deleteItem(id: string) {
    if (confirm('Are you sure?')) {
      this.http.delete(`/api/v1/menu/${id}`).subscribe(() => this.loadMenuItems());
    }
  }

  closeModal() {
    this.showModal = false;
  }
}
