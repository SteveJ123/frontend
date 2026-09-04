import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../service/AuthService';
import { Router } from '@angular/router';
import { ToastService } from '../../../service/toast.service';
import { Service } from '../../../service/service';
import { apiUrl } from '../../../core/constants/api';

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
  private apiUrl = `${apiUrl}`;
  userName: string = '';

  private authService = inject(AuthService);
  private service = inject(Service);

  curremtLanguage: any = '';
  currentRoute: any = '';
  menuOptions: any[] = [];

  private router = inject(Router);
  private toastService = inject(ToastService);
  private cd = inject(ChangeDetectorRef);

  userId: string = '';
  profileImage: string | null = null;
  isUploading: boolean = false;
  isEditing = false;

  get currentRouteLanguage(): string {
    const urlSegments = this.router.url.split('/').filter(Boolean);
    return urlSegments[0] === 'te' ? 'Telugu' : 'English';
  }
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
      // {
      //   id: 'purchase-history',
      //   title: 'Purchase history',
      //   description: 'View purchases and download invoices',
      //   icon: 'tag',
      //   route: `${this.currentRoute}/purchase-history`,
      // },
      // {
      //   id: 'payment-details',
      //   title: 'Payment details',
      //   description: 'Manage your bank account & other payment details',
      //   icon: 'wallet',
      //   route: `${this.currentRoute}/payment-details`,
      // },
      // {
      //   id: 'update-contact',
      //   title: 'Update number/email',
      //   description: 'View and update registered phone number & email',
      //   icon: 'key',
      //   route: `${this.currentRoute}/update-contact`,
      // },
      // {
      //   id: 'Create Course',
      //   title: 'Create Course',
      //   description: 'Create Your Courses',
      //   icon: 'credit-card',
      //   route: `${this.currentRoute}/create-course`,
      // },
      // {
      //   id: 'Course List',
      //   title: 'Course List',
      //   description: 'Course List',
      //   icon: 'credit-card',
      //   route: `${this.currentRoute}/courses-list`,
      // },
    ];
    this.fetchPersonalDetails();
  }

  fetchPersonalDetails(): void {
    this.service.getPersonalDetails(this.userId, this.currentRouteLanguage).subscribe({
      next: (res) => {
        if (res.data) {
          this.userName = res.data.name || 'User';
          if (res.data.profileImage) {
            const path = res.data.profileImage;
            const cleanedPath = path.startsWith('/') ? path.slice(1) : path;
            this.profileImage = `${this.apiUrl}${cleanedPath}`;
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
    formData.append('language', this.currentRouteLanguage);
    this.isUploading = true;
    if (this.isEditing) {
      this.service.uploadProfileImage(this.userId, formData).subscribe({
        next: (res) => {
          if (res.success && res.data.profileImage) {
            // Update UI preview with updated uploaded avatar path
            const path = res.data.profileImage;
            const cleanedPath = path.startsWith('/') ? path.slice(1) : path;
            this.profileImage = `${this.apiUrl}${cleanedPath}`;
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

      this.service.uploadProfileImage(this.userId, formData).subscribe({
        next: (res) => {
          if (res.success && res.data.profileImage) {
            const path = res.data.profileImage;
            const cleanedPath = path.startsWith('/') ? path.slice(1) : path;
            this.profileImage = `${this.apiUrl}${cleanedPath}`;
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

    this.service.deleteProfileImage(this.userId, this.currentRouteLanguage).subscribe({
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
