import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../../service/toast.service';

export interface PersonalDetails {
  _id?: string;
  userId: string;
  name: string;
  aboutYou: string;
  gender: string;
  birthday: string;
}

@Component({
  selector: 'app-personal-info',
  imports: [CommonModule, FormsModule],
  templateUrl: './personal-info.html',
  styleUrl: './personal-info.css',
})
export class PersonalInfo {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private cd = inject(ChangeDetectorRef);

  userId: string = '';
  details: PersonalDetails = {
    userId: '',
    name: '',
    aboutYou: '',
    gender: '',
    birthday: '',
  };

  // Toggle edit state per field
  editingField: 'name' | 'aboutYou' | 'gender' | 'birthday' | null = null;
  isLoading: boolean = false;
  isSaving: boolean = false;
  isEditing = false;
  ngOnInit(): void {
    this.userId = localStorage.getItem('userId') || '';
    this.details.userId = localStorage.getItem('userId') || '';
    this.fetchDetails();
  }

  fetchDetails(): void {
    this.isLoading = true;
    this.http.get<any>(`http://localhost:5000/api/personal-details/${this.userId}`).subscribe({
      next: (res) => {
        console.log('res', res);
        if (res.success && res.data) {
          this.isEditing = true;
          this.details = res.data;
          this.cd.detectChanges();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching personal details:', err);
        this.isLoading = false;
      },
    });
  }

  toggleEdit(field: 'name' | 'aboutYou' | 'gender' | 'birthday'): void {
    this.editingField = this.editingField === field ? null : field;
  }

  saveDetails(): void {
    this.isSaving = true;
    if (this.isEditing) {
      this.http
        .put<any>(`http://localhost:5000/api/personal-details/${this.userId}`, this.details)
        .subscribe({
          next: (res) => {
            this.isSaving = false;
            console.log('res', res);
            if (res.success) {
              this.toastService.success(`${this.editingField} field updated successfully!`);
              this.editingField = null;
            }
          },
          error: (err) => {
            console.error('Error saving personal details:', err);
            this.isSaving = false;
            this.toastService.error(`${this.editingField} field not updated successfully!`);
          },
        });
    } else {
      this.http
        .post<any>(`http://localhost:5000/api/personal-details/${this.userId}`, this.details)
        .subscribe({
          next: (res) => {
            this.isSaving = false;
            console.log('res', res);
            if (res.success) {
              this.toastService.success(`${this.editingField} field updated successfully!`);
              this.editingField = null;
            }
          },
          error: (err) => {
            console.error('Error saving personal details:', err);
            this.isSaving = false;
            this.toastService.error(`${this.editingField} field not updated successfully!`);
          },
        });
    }
  }

  navigateToMyAccount() {
    this.router.navigate(['edit-profile']);
  }
}
