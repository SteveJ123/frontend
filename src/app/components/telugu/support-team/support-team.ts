import { Component, signal, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../service/toast.service';
import { Router } from '@angular/router';
import { Service } from '../../../service/service';

export interface SupportMember {
  _id?: string;
  name: string;
  role: string;
  avatar: string;
  phone: string;
  email: string;
  available: boolean;
}

@Component({
  selector: 'app-support-team',
  imports: [CommonModule, FormsModule],
  templateUrl: './support-team.html',
  styleUrl: './support-team.css',
})
export class SupportTeam {
  private apiUrl = 'http://localhost:5000/api/support-team';
  private toastService = inject(ToastService);
  private cd = inject(ChangeDetectorRef);
  supportTeam = signal<SupportMember[]>([]);
  isModalOpen = false;
  isEditing = false;

  formData: SupportMember = this.getEmptyForm();
  productToDeleteId: string = '';
  showDeleteModal: boolean = false;
  constructor(private http: HttpClient) {}

  private router = inject(Router);
  private service = inject(Service);

  get currentRouteLanguage(): string {
    const urlSegments = this.router.url.split('/').filter(Boolean);
    return urlSegments[0] === 'te' ? 'Telugu' : 'English';
  }
  ngOnInit(): void {
    this.fetchTeam();
  }

  getEmptyForm(): SupportMember {
    return { name: '', role: '', avatar: '', phone: '', email: '', available: true };
  }

  fetchTeam(): void {
    this.http.get<{ success: boolean; data: SupportMember[] }>(this.apiUrl);
    this.service.getSupportTeam(this.currentRouteLanguage).subscribe({
      next: (res) => this.supportTeam.set(res.data),
      error: (err) => console.error(err),
    });
  }

  openCreateModal(): void {
    this.formData = this.getEmptyForm();
    this.isEditing = false;
    this.isModalOpen = true;
  }

  openEditModal(person: SupportMember): void {
    this.formData = { ...person };
    this.isEditing = true;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveMember(): void {
    let payload = {
      ...this.formData,
      language: this.currentRouteLanguage,
    };

    if (this.isEditing && this.formData._id) {
      this.service.updateMember(this.formData._id, payload).subscribe({
        next: (res) => {
          this.supportTeam.update((list) =>
            list.map((item) => (item._id === res.data._id ? res.data : item)),
          );
          this.closeModal();
          this.cancelDelete();
          this.toastService.success('Support updated successfully!');
        },
        error: (err) => {
          console.error(err);
          this.cancelDelete();
          this.toastService.error('Support not updated successfully!');
        },
      });
    } else {
      this.service.createMember(payload).subscribe({
        next: (res) => {
          this.supportTeam.update((list) => [res.data, ...list]);
          this.toastService.success('Support created successfully!');
          this.closeModal();
          this.cancelDelete();
        },
        error: (err) => {
          console.error(err);
          this.toastService.success('Support created successfully!');
          this.cancelDelete();
        },
      });
    }
  }

  // Opens the custom popup dialog
  openDeleteModal(id: string): void {
    this.productToDeleteId = id;
    this.showDeleteModal = true;
  }

  // Closes the popup dialog without deleting
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.productToDeleteId = '';
  }

  // Executed when "OK" / "Delete" is pressed in the modal
  confirmDelete(): void {
    if (!this.productToDeleteId) return;

    this.service.deleteMember(this.productToDeleteId).subscribe({
      next: () => {
        this.supportTeam.update((list) =>
          list.filter((item) => item._id !== this.productToDeleteId),
        );
        this.toastService.success('Support deleted successfully!');
        this.cancelDelete();
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.cancelDelete();
        this.cd.detectChanges();
        this.toastService.error('Support not deleted!');
      },
    });
  }
}
