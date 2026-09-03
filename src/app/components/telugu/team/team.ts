import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../service/AuthService';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../service/toast.service';
import { apiUrl } from '../../../core/constants/api';

export interface UserData {
  _id: string;
  username: string;
  mobile: string;
  role: string;
  courseType: string;
}

@Component({
  selector: 'app-team',
  imports: [CommonModule, FormsModule],
  templateUrl: './team.html',
  styleUrl: './team.css',
})
export class Team implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  paginatedUsers: any[] = [];

  courseOptions: string[] = ['Face Yoga', 'Face Yoga + Raj Yoga'];
  pageSizeOptions: number[] = [5, 10, 20];

  selectedCourse: string = '';
  searchName: string = '';
  searchMobile: string = '';

  pageSize: number = 5;
  currentPage: number = 1;
  totalPages: number = 1;

  isModalOpen: boolean = false;
  editingUser: any = {};

  private api = `${apiUrl}api/registered-users`;
  productToDeleteId: string = '';
  showDeleteModal: boolean = false;
  constructor(private http: HttpClient) {}
  private cd = inject(ChangeDetectorRef);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.http.get<any[]>(this.api).subscribe({
      next: (data: any) => {
        console.log('data', data);
        this.users = data?.data;
        this.applyFilters();
        this.cd.detectChanges();
      },
      error: (err) => console.error('Failed to load users:', err),
    });
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onCourseFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter((user) => {
      const matchesName = user.username.toLowerCase().includes(this.searchName.toLowerCase());
      const matchesMobile = user.mobile.includes(this.searchMobile);
      const matchesCourse = this.selectedCourse ? user.courseType === this.selectedCourse : true;
      return matchesName && matchesMobile && matchesCourse;
    });

    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize) || 1;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.paginatedUsers = this.filteredUsers.slice(startIndex, startIndex + this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  openEditModal(user: any): void {
    this.editingUser = { ...user };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editingUser = {};
  }

  // saveUser(): void {
  //   if (!this.editingUser?._id) return;

  //   this.http.put<any>(`${this.api}/${this.editingUser?._id}`, this.editingUser).subscribe({
  //     next: (updatedUser) => {
  //       const index = this.users.findIndex((u) => u._id === updatedUser._id);
  //       if (index !== -1) {
  //         this.users[index] = updatedUser;
  //         this.cd.detectChanges();
  //         this.applyFilters();
  //       }
  //       this.cd.detectChanges();
  //       this.closeModal();
  //       this.toastService.success('User updated successfully ');
  //     },
  //     error: (err) => {
  //       console.error('Failed to update user:', err);
  //       this.closeModal();
  //       this.cd.detectChanges();
  //       this.toastService.error('User updated successfully ');
  //     },
  //   });
  // }

  saveUser(): void {
    const userId = this.editingUser?._id;
    if (!userId) return;

    this.http
      .put<{ success: boolean; message: string; data: any }>(
        `${this.api}/${userId}`,
        this.editingUser,
      )
      .subscribe({
        next: (response) => {
          // Extract the updated user from the API response payload
          const updatedUser = response.data;

          // Update the users array immutably so Angular detects the change immediately
          this.users = this.users.map((u) => (u._id === updatedUser._id ? updatedUser : u));

          // Re-apply filter rules to update table data and recalculate pagination
          this.applyFilters();

          this.closeModal();
          this.cd.markForCheck(); // Preferred over detectChanges for OnPush components
          this.toastService.success('User updated successfully');
        },
        error: (err) => {
          console.error('Failed to update user:', err);
          this.closeModal();
          this.cd.markForCheck();
          this.toastService.error(err.error?.message || 'Failed to update user');
        },
      });
  }
  // deleteUser(userId: string): void {
  //   if (confirm('Are you sure you want to delete this user?')) {

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
    this.http.delete(`${this.api}/${this.productToDeleteId}`).subscribe({
      next: () => {
        this.users = this.users.filter((u) => u._id !== this.productToDeleteId);
        this.applyFilters();
        this.cancelDelete();
        this.cd.detectChanges();
        this.toastService.success('User deleted successfully ');
      },
      error: (err: any) => {
        console.error('Failed to delete user:', err);
        this.cancelDelete();
        this.cd.detectChanges();
        this.toastService.error('User updated successfully ');
      },
    });
  }
}
