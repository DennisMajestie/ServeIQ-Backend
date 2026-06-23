import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="image-upload-container">
      <div class="preview-area" *ngIf="imageUrl || previewUrl">
        <img [src]="previewUrl || imageUrl" alt="Preview" class="image-preview">
        <button type="button" class="remove-btn" (click)="removeImage()">Remove</button>
      </div>
      <div class="upload-placeholder" *ngIf="!imageUrl && !previewUrl" (click)="fileInput.click()">
        <span class="upload-icon">📷</span>
        <span class="upload-text">Upload Image</span>
      </div>
      <input 
        #fileInput 
        type="file" 
        style="display: none" 
        accept="image/*" 
        (change)="onFileSelected($event)">
      
      <div *ngIf="isUploading" class="uploading-overlay">
        <span>Uploading...</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .image-upload-container {
      width: 150px;
      height: 150px;
      border: 2px dashed #f97316;
      border-radius: 12px;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      cursor: pointer;
      overflow: hidden;
      background: #fff;
      transition: all 0.2s;
    }
    .image-upload-container:hover {
      border-color: #ea580c;
      background: #fff7ed;
    }
    .preview-area {
      width: 100%;
      height: 100%;
      position: relative;
    }
    .image-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .remove-btn {
      position: absolute;
      top: 5px;
      right: 5px;
      background: rgba(255, 0, 0, 0.7);
      color: white;
      border: none;
      border-radius: 4px;
      padding: 2px 5px;
      font-size: 10px;
    }
    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #666;
    }
    .upload-icon {
      font-size: 24px;
    }
    .uploading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255,255,255,0.8);
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `]
})
export class ImageUploadComponent {
  @Input() imageUrl: string | null = null;
  @Output() imageUploaded = new EventEmitter<string>();
  @Output() imageRemoved = new EventEmitter<void>();

  previewUrl: string | null = null;
  isUploading = false;

  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Create local preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);

      // Upload to server
      this.uploadFile(file);
    }
  }

  uploadFile(file: File) {
    this.isUploading = true;
    const formData = new FormData();
    formData.append('file', file);

    this.http.post<{url: string}>('/api/v1/upload', formData).subscribe({
      next: (res) => {
        this.isUploading = false;
        this.imageUploaded.emit(res.url);
      },
      error: (err) => {
        this.isUploading = false;
        console.error('Upload failed', err);
        // Fallback or error handling
      }
    });
  }

  removeImage() {
    this.imageUrl = null;
    this.previewUrl = null;
    this.imageRemoved.emit();
  }
}
