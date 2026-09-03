import { CommonModule } from '@angular/common';
import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { AuthService } from '../../service/AuthService';
import { SidebarService } from '../../service/SidebarService';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-left-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './left-sidebar.html',
  styleUrl: './left-sidebar.css',
})
export class LeftSidebar {
  isSidebarOpen = signal(false);

  private authService = inject(AuthService);
  public sidebarService = inject(SidebarService);
  userRole = this.authService.getUserRole();
  private router = inject(Router);
  currentLang = 'en';
  private routerSubscription!: Subscription;
  ngOnInit() {
    const rawLang = this.authService.getUserLanguage() || 'en';
    this.currentLang = rawLang.toLowerCase().trim() === 'telugu' ? 'te' : 'en';

    this.detectLanguageFromUrl(this.router.url);

    // 2. Listen for URL changes dynamically when navigating
    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.detectLanguageFromUrl(event.urlAfterRedirects || event.url);
      });
  }

  private detectLanguageFromUrl(url: string): void {
    const isUserAdmin = this.userRole?.trim().toLowerCase() === 'admin';

    if (isUserAdmin) {
      // For Admin: Strictly extract 'en' or 'te' from current URL path
      const urlSegment = url.split('/')[1]?.toLowerCase();
      if (urlSegment === 'te' || urlSegment === 'en') {
        this.currentLang = urlSegment;
        return;
      }
    }

    // Fallback for standard users or non-localized URLs: Read from profile preference
    const rawLang = this.authService.getUserLanguage() || 'en';
    const normalized = rawLang.toLowerCase().trim();
    this.currentLang = normalized === 'telugu' || normalized === 'te' ? 'te' : 'en';
  }
  toggleSidebar() {
    this.isSidebarOpen.update((v) => !v);
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
