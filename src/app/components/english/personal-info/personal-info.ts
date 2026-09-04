import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../../service/toast.service';
import { AuthService } from '../../../service/AuthService';
import { Service } from '../../../service/service';

export interface PersonalDetails {
  _id?: string;
  userId: string;
  name: string;
  aboutYou: string;
  gender: string;
  birthday: string;
  language: string;
}

@Component({
  selector: 'app-personal-info',
  imports: [CommonModule, FormsModule],
  templateUrl: './personal-info.html',
  styleUrl: './personal-info.css',
})
export class PersonalInfo {
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
    language: '',
  };

  // Toggle edit state per field
  editingField: 'name' | 'aboutYou' | 'gender' | 'birthday' | null = null;
  isLoading: boolean = false;
  isSaving: boolean = false;
  isEditing = false;
  currentLanguage: any = '';
  currentRoute: any = '';
  private authService = inject(AuthService);
  private service = inject(Service);

  get currentRouteLanguage(): string {
    const urlSegments = this.router.url.split('/').filter(Boolean);
    return urlSegments[0] === 'te' ? 'Telugu' : 'English';
  }
  ngOnInit(): void {
    this.userId = localStorage.getItem('userId') || '';
    this.currentLanguage = this.authService.getUserLanguage();
    this.currentRoute = this.currentLanguage === 'English' ? 'en' : 'te';
    this.details.userId = localStorage.getItem('userId') || '';
    this.fetchDetails();
  }

  fetchDetails(): void {
    this.isLoading = true;
    this.service.getPersonalDetails(this.userId, this.currentRouteLanguage).subscribe({
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
    this.details = {
      ...this.details,
      language: this.currentRouteLanguage,
    };
    if (this.isEditing) {
      this.service.updatePersonalDetails(this.userId, this.details).subscribe({
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
      this.service.updatePersonalDetails(this.userId, this.details).subscribe({
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
    this.router.navigate(['/', this.currentRoute, 'edit-profile']);
  }
}
