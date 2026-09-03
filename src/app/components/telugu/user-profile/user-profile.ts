import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Service } from '../../../service/service';
import { apiUrl } from '../../../core/constants/api';
import { HttpClient } from '@angular/common/http';
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
  private http = inject(HttpClient);

  userId = localStorage.getItem('userId') || '';
  username = localStorage.getItem('username') || '';

  imageapiUrl: any = '';
  currentLanguage: any = '';
  currentRoute: any = '';
  private authService = inject(AuthService);
  ngOnInit() {
    this.imageapiUrl = apiUrl;
    this.imageapiUrl = apiUrl;
    this.currentLanguage = this.authService.getUserLanguage();
    this.currentRoute = this.currentLanguage === 'English' ? 'en' : 'te';
    this.userId = localStorage.getItem('userId') || '';
    this.fetchPersonalDetails();
    this.getPostsByUser();
  }

  fetchPersonalDetails(): void {
    this.http.get<any>(`http://localhost:5000/api/personal-details/${this.userId}`).subscribe({
      next: (res) => {
        if (res.data) {
          console.log('res.data', res.data);
          this.data = res.data;
          if (res.data.profileImage) {
            this.data.profileImage = `http://localhost:5000${res.data.profileImage}`;
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
    console.log('Edit profile clicked');
    this.router.navigate(['/', this.currentRoute, 'edit-profile']);
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
