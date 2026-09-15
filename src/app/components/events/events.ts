import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { Service } from '../../service/service';
import { apiUrl } from '../../core/constants/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../service/toast.service';

@Component({
  selector: 'app-events',
  imports: [CommonModule, FormsModule],
  templateUrl: './events.html',
  styleUrl: './events.css',
  host: {
    class: 'w-full block px-4',
  },
})
export class Events {
  private apiUrl = `${apiUrl}`;
  events: any[] = [];
  currentLang: string = 'English';

  title: string = '';
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  editingEventId: string | null = null;

  errorMessage: string = '';

  constructor(
    private service: Service,
    private cdr: ChangeDetectorRef,
  ) {}

  private router = inject(Router);
  private toastService = inject(ToastService);

  // get currentRouteLanguage(): string {
  //   const urlSegments = this.router.url.split('/').filter(Boolean);
  //   this.currentLang = urlSegments[0] === 'te' ? 'Telugu' : 'English';
  //   return urlSegments[0] === 'te' ? 'Telugu' : 'English';
  // }
  currentLangSelected: string = 'en';

  productToDeleteId: any = '';
  showDeleteModal: boolean = false;

  ngOnInit(): void {
    this.loadEvents(this.currentLang);
  }

  switchLanguage(lang: string): void {
    this.currentLangSelected = lang;
    this.currentLang = lang === 'en' ? 'English' : 'Telugu';
    console.log('this.currentLang', this.currentLang);
    this.loadEvents(this.currentLang);
  }

  loadEvents(language: any): void {
    this.service.getEvents(language).subscribe({
      next: (res) => {
        console.log('res.data', res.data);
        this.events = res.data;
        this.cdr.detectChanges();
      },
      error: (err) => this.showError('Failed to fetch events.'),
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (file.size > 5 * 1024 * 1024) {
        this.showError('Image size must be less than 5 MB.');
        input.value = '';
        return;
      }

      this.selectedFile = file;
      this.imagePreviewUrl = URL.createObjectURL(file);
      this.cdr.detectChanges();
    }
  }

  saveEvent(): void {
    if (!this.title.trim()) {
      this.showError('Event title is required.');
      return;
    }

    if (!this.editingEventId && !this.selectedFile) {
      this.showError('Please select an event image.');
      return;
    }

    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('language', this.currentLang);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    if (this.editingEventId) {
      this.service.updateEvent(this.editingEventId, formData).subscribe({
        next: () => {
          this.resetForm();
          this.loadEvents(this.currentLang);
          this.toastService.success('Product edited successfully!');
          this.cdr.detectChanges();
        },
        error: () => {
          this.showError('Failed to update event.');
          this.toastService.error('Product Not edited successfully!');
          this.cdr.detectChanges();
        },
      });
    } else {
      this.service.createEvent(formData).subscribe({
        next: () => {
          this.resetForm();
          this.loadEvents(this.currentLang);
          this.toastService.success('Product added successfully!');
          this.cdr.detectChanges();
        },
        error: () => {
          this.showError('Failed to create event.');
          this.toastService.error('Product not added successfully!');
          this.cdr.detectChanges();
        },
      });
    }
  }

  /** Combines base API URL with relative file paths safely */
  getImageUrl(path: string | undefined): string {
    if (!path) return '';
    // If path is already a full http(s) URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    const cleanPath = path.replace(/^\/+/, '');
    return `${this.apiUrl}${cleanPath}`;
  }

  editEvent(event: any): void {
    this.editingEventId = event._id!;
    this.title = event.title;
    console.log('event', event);
    // Option A: Strip all leading slashes using regex (Recommended)
    const cleanImagePath = event.imageUrl ? event.imageUrl.replace(/^\/+/, '') : '';
    this.imagePreviewUrl = `${apiUrl}${cleanImagePath}`;
    // this.imagePreviewUrl = `${apiUrl}${event.imageUrl}`;
    this.selectedFile = null;
  }

  deleteEvent(id: string): void {
    if (confirm('Are you sure you want to delete this event?')) {
      // this.service.deleteEvent(id).subscribe({
      //   next: () => this.loadEvents(this.currentLang),
      //   error: () => this.showError('Failed to delete event.'),
      // });
    }
  }

  resetForm(): void {
    this.title = '';
    this.selectedFile = null;
    this.imagePreviewUrl = null;
    this.editingEventId = null;
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  private showError(msg: string): void {
    this.errorMessage = msg;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.errorMessage = '';
      this.cdr.detectChanges();
    }, 5000);
  }

  openDeleteModal(id: any): void {
    // this.activeMenuPostId = null;
    this.productToDeleteId = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.productToDeleteId = '';
  }

  confirmDelete(): void {
    if (!this.productToDeleteId) return;
    this.service.deleteEvent(this.productToDeleteId).subscribe({
      next: (res) => {
        console.log('res', res);
        if (res.success) {
          this.loadEvents(this.currentLang);
          this.toastService.success('Product deleted successfully!');
          this.productToDeleteId = '';
          this.showDeleteModal = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.showError('Failed to delete event.');
        this.toastService.error('Product not deleted successfully!');
        this.productToDeleteId = '';
        this.showDeleteModal = false;
        this.cdr.detectChanges();
      },
    });
  }
}
