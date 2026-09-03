import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../service/AuthService';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../service/toast.service';

export interface SettingsOption {
  id: string;
  title: string;
  description: string;
  icon: 'user' | 'personal' | 'tag' | 'wallet' | 'key' | 'credit-card';
  route?: string;
}

@Component({
  selector: 'app-edit-profile',
  imports: [CommonModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile {
  userName: string = '';

  private authService = inject(AuthService);

  curremtLanguage: any = '';
  currentRoute: any = '';
  menuOptions: any[] = [];

  private router = inject(Router);
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  private cd = inject(ChangeDetectorRef);

  userId: string = '';
  profileImage: string | null = null;
  isUploading: boolean = false;
  isEditing = false;
  ngOnInit() {
    this.userName = localStorage.getItem('username') || '';
    this.userId = localStorage.getItem('userId') || '';

    this.curremtLanguage = this.authService.getUserLanguage() || null;
    this.currentRoute = this.curremtLanguage === 'English' ? 'en' : 'te';
    this.menuOptions = [
      {
        id: 'view-profile',
        title: 'View profile',
        description: 'View your profile page as others see it',
        icon: 'user',
        route: `${this.currentRoute}/user-profile`, // Clean explicit mapping
      },
      {
        id: 'personal-info',
        title: 'Personal information',
        description: 'Update your name, bio, gender, birthday and more',
        icon: 'personal',
        route: `${this.currentRoute}/personal-info`,
      },
      {
        id: 'purchase-history',
        title: 'Purchase history',
        description: 'View purchases and download invoices',
        icon: 'tag',
        route: `${this.currentRoute}/purchase-history`,
      },
      {
        id: 'payment-details',
        title: 'Payment details',
        description: 'Manage your bank account & other payment details',
        icon: 'wallet',
        route: `${this.currentRoute}/payment-details`,
      },
      {
        id: 'update-contact',
        title: 'Update number/email',
        description: 'View and update registered phone number & email',
        icon: 'key',
        route: `${this.currentRoute}/update-contact`,
      },
      {
        id: 'Create Course',
        title: 'Create Course',
        description: 'Create Your Courses',
        icon: 'credit-card',
        route: `${this.currentRoute}/create-course`,
      },
      {
        id: 'Course List',
        title: 'Course List',
        description: 'Course List',
        icon: 'credit-card',
        route: `${this.currentRoute}/courses-list`,
      },
    ];
    this.fetchPersonalDetails();
  }

  fetchPersonalDetails(): void {
    this.http.get<any>(`http://localhost:5000/api/personal-details/${this.userId}`).subscribe({
      next: (res) => {
        if (res.data) {
          this.userName = res.data.name || 'User';
          if (res.data.profileImage) {
            this.profileImage = `http://localhost:5000${res.data.profileImage}`;
            this.cd.detectChanges();
          } else {
            this.isEditing = true;
          }
        }
      },
      error: (err) => console.error('Error fetching profile:', err),
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Create FormData object to handle multipart file payload
    const formData = new FormData();
    formData.append('image', file);

    this.isUploading = true;
    if (this.isEditing) {
      this.http
        .put<any>(
          `http://localhost:5000/api/personal-details/${this.userId}/profile-image`,
          formData,
        )
        .subscribe({
          next: (res) => {
            if (res.success && res.data.profileImage) {
              // Update UI preview with updated uploaded avatar path
              this.profileImage = `http://localhost:5000${res.data.profileImage}`;
            }
            this.isUploading = false;
            this.toastService.success('Profile Image updated successfully!');
          },
          error: (err) => {
            console.error('Failed to upload image:', err);
            this.isUploading = false;
            this.toastService.error('Profile Image Not updated successfully!');
          },
        });
    } else {
      // Direct POST request for upload
      this.http
        .post<any>(
          `http://localhost:5000/api/personal-details/${this.userId}/profile-image`,
          formData,
        )
        .subscribe({
          next: (res) => {
            if (res.success && res.data.profileImage) {
              this.profileImage = `http://localhost:5000${res.data.profileImage}`;
              this.toastService.success('Profile Image Uploaded Succcessfully!');
            }
            this.isUploading = false;
          },
          error: (err) => {
            console.error('Image upload failed:', err);
            this.isUploading = false;
            this.toastService.error('Profile Image Not Uploaded Succcessfully!');
          },
        });
    }
  }
  onOptionClick(option: SettingsOption): void {
    console.log('Clicked option:', option.title);
  }

  onLogout(): void {
    console.log('Logging out user...');
    this.authService.logout();
  }

  onDeleteAccount(): void {
    console.log('Delete account requested...');
  }

  // Option 1: Using the option object or route directly (Recommended)
  navigateToOption(option: SettingsOption): void {
    if (option.route) {
      this.router.navigate([option.route]);
      return;
    }

    // // Fallback or ID-based routing switch
    // switch (option.id) {
    //   case 'view-profile':
    //     this.router.navigate(['/user-profile']);
    //     break;
    //   case 'personal-info':
    //     this.router.navigate(['/personal-info']);
    //     break;
    //   // Add other routes as needed
    //   default:
    //     console.warn('No route defined for:', option.id);
    // }
  }

  // Option 2: Checking title (as explicitly requested)
  navigateToByTitle(title: string): void {
    if (title.toLowerCase() === 'view profile') {
      this.router.navigate(['/user-profile']);
    }
  }

  deleteProfileImage(event: Event): void {
    // Prevent triggering file picker click event from parent container
    event.stopPropagation();

    if (!confirm('Are you sure you want to delete your profile image?')) return;

    this.http
      .delete<any>(`http://localhost:5000/api/personal-details/${this.userId}/profile-image`)
      .subscribe({
        next: (res) => {
          if (res.success) {
            // Reset UI state to null to re-render default avatar fallback
            this.profileImage = null;
            this.toastService.success('Profile Image Deleted Successfuly!');
          }
        },
        error: (err) => {
          console.error('Failed to delete image:', err);
          this.toastService.error('Profile Image Not Deleted Successfuly!');
        },
      });
  }
}
