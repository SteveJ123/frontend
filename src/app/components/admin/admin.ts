import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../service/AuthService'; // Adjust path as needed

interface AdminModuleLink {
  title: string;
  description: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-admin',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  private router = inject(Router);
  private authService = inject(AuthService);

  activeLang: 'te' | 'en' = 'te';

  adminModules: AdminModuleLink[] = [
    {
      title: 'Community Posts',
      description: 'Manage admin announcements and community posts',
      route: 'community-post',
      icon: '📢',
    },
    {
      title: 'User Feed',
      description: 'Moderate user posts, comments, and reported content',
      route: 'user-feed',
      icon: '💬',
    },
    {
      title: 'Courses List',
      description: 'Create, update, and manage course offerings',
      route: 'courses-list',
      icon: '📚',
    },
    {
      title: 'Practice Sessions',
      description: 'Schedule live yoga and practice sessions',
      route: 'session',
      icon: '🧘‍♀️',
    },
    {
      title: 'User Profiles',
      description: 'View registered user details and progress trackers',
      route: 'user-profile',
      icon: '👥',
    },
    {
      title: 'Products Store',
      description: 'Manage catalog, prices, and available products',
      route: 'products',
      icon: '🛒',
    },
  ];

  ngOnInit(): void {
    const userLang = this.authService.getUserLanguage() || 'te';
    this.activeLang =
      userLang.toLowerCase().trim() === 'english' || userLang.toLowerCase().trim() === 'en'
        ? 'en'
        : 'te';
  }

  switchLanguage(lang: 'te' | 'en'): void {
    this.activeLang = lang;
  }

  navigateToModule(route: string): void {
    this.router.navigate(['/', this.activeLang, route]);
  }
}
