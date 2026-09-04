import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Service } from '../../../service/service';
import { apiUrl } from '../../../core/constants/api';
import { AuthService } from '../../../service/AuthService';

export interface CommunityPost {
  id: string;
  author: string;
  avatarUrl?: string;
  timeAgo: string;
  category: string;
  weekTag?: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  views: number;
}

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfile {
  private apiUrl = `${apiUrl}`;
  user = {
    name: 'Username',
    points: '40.96K ALHP',
    joinedDate: '15 Dec 2025',
    bio: 'Not added yet.',
    avatarUrl: '',
  };

  posts: any[] = [];
  data: any = {};

  private service = inject(Service);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  userId = localStorage.getItem('userId') || '';
  username = localStorage.getItem('username') || '';

  imageapiUrl: any = '';

  currentLanguage: any = '';
  currentRoute: any = '';
  private authService = inject(AuthService);

  get currentRouteLanguage(): string {
    const urlSegments = this.router.url.split('/').filter(Boolean);
    return urlSegments[0] === 'te' ? 'Telugu' : 'English';
  }
  ngOnInit() {
    this.imageapiUrl = apiUrl;
    this.currentLanguage = this.authService.getUserLanguage();
    this.currentRoute = this.currentLanguage === 'English' ? 'en' : 'te';
    this.userId = localStorage.getItem('userId') || '';
    this.fetchPersonalDetails();
    this.getPostsByUser();
  }

  fetchPersonalDetails(): void {
    this.service.getPersonalDetails(this.userId, this.currentRouteLanguage).subscribe({
      next: (res) => {
        if (res.data) {
          console.log('res.data', res.data);
          this.data = res.data;
          if (res.data.profileImage) {
            const path = res.data.profileImage;
            const cleanedPath = path.startsWith('/') ? path.slice(1) : path;

            this.data.profileImage = `${this.apiUrl}${cleanedPath}`;
            this.cd.detectChanges();
          }
        }
      },
      error: (err) => console.error('Error fetching profile:', err),
    });
  }

  getPostsByUser() {
    this.service.getPostsByUserId(this.userId).subscribe({
      next: (response) => {
        console.log('response', response);
        if (response.success) {
          this.posts = response.data;
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error fetching user posts:', err);
      },
    });
  }
  onEditProfile(): void {
    console.log('Edit profile clicked', this.currentRoute);
    this.router.navigate(['/', this.currentRoute, 'edit-profile']);
    // this.router.navigate(['edit-profile']);
  }

  getMediaUrl(path: string): string {
    if (!path) {
      return '';
    }

    // Convert Windows \ to /
    const normalizedPath = path.replace(/\\/g, '/');

    return `${apiUrl}${normalizedPath}`;
    // return `https://backend-2rgv.onrender.com/${normalizedPath}`;
  }
}
