import { Component, signal, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../service/toast.service';
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
  // private apiUrl = 'http://localhost:5000/api/support-team';
  private toastService = inject(ToastService);
  private cd = inject(ChangeDetectorRef);
  private service = inject(Service);
  supportTeam = signal<SupportMember[]>([]);
  isModalOpen = false;
  isEditing = false;

  formData: SupportMember = this.getEmptyForm();
  productToDeleteId: string = '';
  showDeleteModal: boolean = false;
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchEnTeam();
  }

  getEmptyForm(): SupportMember {
    return { name: '', role: '', avatar: '', phone: '', email: '', available: true };
  }

  fetchEnTeam(): void {
    // this.http.get<{ success: boolean; data: SupportMember[] }>(this.apiUrl)
    this.service.fetchEnSupportTeam().subscribe({
      next: (res: any) => this.supportTeam.set(res.data),
      error: (err: any) => console.error(err),
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
    if (this.isEditing && this.formData._id) {
      this.service.updateEnSupportTeam(this.formData._id, this.formData).subscribe({
        next: (res: any) => {
          this.supportTeam.update((list) =>
            list.map((item) => (item._id === res.data._id ? res.data : item)),
          );
          this.closeModal();
          this.cancelDelete();
          this.toastService.success('Support updated successfully!');
        },
        error: (err: any) => {
          console.error(err);
          this.cancelDelete();
          this.toastService.error('Support not updated successfully!');
        },
      });
    } else {
      // this.http
      //   .post<{ success: boolean; data: SupportMember }>(this.apiUrl, this.formData)

      this.service.addEnSupportTeam(this.formData).subscribe({
        next: (res: any) => {
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

  // deleteMember(id: string): void {
  //   if (confirm('Are you sure you want to remove this support member?')) {
  //     this.http.delete(`${this.apiUrl}/${id}`).subscribe({
  //       next: () => {
  //         this.supportTeam.update((list) => list.filter((item) => item._id !== id));
  //       },
  //       error: (err) => console.error(err),
  //     });
  //   }
  // }

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

    // this.http.delete(`${this.apiUrl}/${this.productToDeleteId}`)
    this.service.deleteEnSupportTeam(this.productToDeleteId).subscribe({
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
