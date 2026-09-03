import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Service } from '../../../service/service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-tracker-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-tracker-list.html',
  styleUrl: './admin-tracker-list.css',
})
export class AdminTrackerList {
  activeLanguage: string = 'English'; // Default or managed via tab
  langPrefix: string = 'en';

  users: any[] = [];
  filteredUsers: any[] = [];

  // Search & Filter controls
  searchTerm: string = '';
  minPoints: number | null = null;
  maxPoints: number | null = null;
  private service = inject(Service);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cd = inject(ChangeDetectorRef);
  constructor() {}

  ngOnInit(): void {
    // Detect language prefix from active route (/en or /te)
    const currentUrl = this.router.url;
    if (currentUrl.includes('/te')) {
      this.langPrefix = 'te';
      this.activeLanguage = 'Telugu';
    } else {
      this.langPrefix = 'en';
      this.activeLanguage = 'English';
    }

    this.fetchUsersTracker();
  }

  fetchUsersTracker(): void {
    this.service.getUsersTrackerSummary(this.activeLanguage).subscribe({
      next: (res) => {
        if (res.success) {
          this.users = res.data;
          this.applyFilters();
          this.cd.detectChanges();
        }
      },
      error: (err) => console.error('Error fetching users summary:', err),
    });
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter((user) => {
      // 1. Search by Name or Phone Number
      const searchLower = this.searchTerm.toLowerCase().trim();
      const matchesSearch =
        !searchLower ||
        user.name.toLowerCase().includes(searchLower) ||
        (user.phone && user.phone.includes(searchLower));

      // 2. Points Range Filter
      const matchesMin = this.minPoints === null || user.points >= this.minPoints;
      const matchesMax = this.maxPoints === null || user.points <= this.maxPoints;

      return matchesSearch && matchesMin && matchesMax;
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.minPoints = null;
    this.maxPoints = null;
    this.applyFilters();
  }

  navigateToUserTracker(userId: string): void {
    // Navigates dynamically to /en/daily-tracker/:userId or /te/daily-tracker/:userId
    this.router.navigate([`/${this.langPrefix}/daily-tracker`, userId]);
  }
}
