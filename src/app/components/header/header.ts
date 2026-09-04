import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  inject,
  signal,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { Router, RouterLink, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../service/AuthService';
import { SidebarService } from '../../service/SidebarService';
import { Service } from '../../service/service';
import { filter, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { apiUrl } from '../../core/constants/api';

interface CourseOption {
  label: string;
  route: string;
  icon: string;
}

interface NotificationItem {
  _id: string;
  sender: { username: string; courseType?: string };
  postId: string;
  postContentSnippet: string;
  isRead: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private apiUrl = `${apiUrl}`;
  language = false;
  isSidebarOpen = signal(false);
  isProfileOpen = false;
  private routerSubscription!: Subscription;

  // isNotificationOpen = false;
  // notifications: NotificationItem[] = [];
  // unreadCount = 0;
  // constructor(private router: Router) {}
  private router = inject(Router);
  private authService = inject(AuthService);
  private service = inject(Service);

  courseType = this.authService.getUserCourse();
  userType = this.authService.getUserRole();
  public sidebarService = inject(SidebarService);
  private cdr = inject(ChangeDetectorRef);
  username = this.authService.getUserName();
  userId = '';

  notifications: any[] = [];
  unreadCount: number = 0;
  isNotificationOpen: boolean = false;
  private sub = new Subscription();
  profileImage = '';

  currentLang = 'en';
  get currentRouteLanguage(): string {
    const urlSegments = this.router.url.split('/').filter(Boolean);
    return urlSegments[0] === 'te' ? 'Telugu' : 'English';
  }
  ngOnInit() {
    const userLanguage = this.authService.getUserLanguage() || 'en';
    this.currentLang = userLanguage.toLowerCase().trim() === 'telugu' ? 'te' : 'en';
    this.userId = localStorage.getItem('userId') || '';

    // 1. Get user role from Auth Service
    this.userType = this.authService.getUserRole();

    // 2. Set initial language based on the active URL
    this.detectLanguageFromUrl(this.router.url);

    // 3. Listen for route changes dynamically (crucial for Admin switching between /en/ and /te/)
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.detectLanguageFromUrl(event.urlAfterRedirects || event.url);
      });

    if (this.userId) {
      // 1. Fetch Profile Image based on user language
      this.fetchUserProfile();

      // 2. Initial Notifications Fetch via service
      this.service.fetchNotifications(this.userId, this.currentLang);
    }
    this.sub.add(
      this.service.notifications$.subscribe((list) => {
        console.log('list', list);
        this.notifications = list;
        this.recalculateUnreadCount();
        this.cdr.detectChanges();
      }),
    );

    // 2. Subscribe to reactive unread count
    this.sub.add(
      this.service.unreadCount$.subscribe((count) => {
        this.unreadCount = count;
        this.cdr.detectChanges();
      }),
    );
  }

  private detectLanguageFromUrl(url: string): void {
    const urlSegments = url.split('/');
    // Check if the second segment is 'te' or 'en' (e.g., /te/community-post)
    const langSegment = urlSegments[1]?.toLowerCase();

    if (langSegment === 'te') {
      this.currentLang = 'te';
    } else if (langSegment === 'en') {
      this.currentLang = 'en';
    } else {
      // Fallback for admin or un-localized routes
      const defaultLang = (this.authService.getUserLanguage() || '').toLowerCase();
      this.currentLang = defaultLang === 'telugu' || defaultLang === 'te' ? 'te' : 'en';
    }
  }

  // fetchUserProfile(): void {
  //   // this.http.get<any>(`http://localhost:5000/api/personal-details/${this.userId}`)
  //   this.service.getUserProfile(this.userId).subscribe({
  //     next: (res: any) => {
  //       if (res.data && res.data.profileImage) {
  //         // Prepend your backend domain if storing relative file paths (/uploads/...)
  //         this.profileImage = `http://localhost:5000${res.data.profileImage}`;
  //         this.cdr.detectChanges();
  //       }
  //     },
  //     error: (err: any) => {
  //       console.error('Failed to fetch profile image for header:', err);
  //     },
  //   });
  // }

  // fetchEnUserProfile(): void {
  //   // this.http.get<any>(`http://localhost:5000/api/personal-details/${this.userId}`)
  //   this.service.getEnUserProfile(this.userId).subscribe({
  //     next: (res: any) => {
  //       if (res.data && res.data.profileImage) {
  //         // Prepend your backend domain if storing relative file paths (/uploads/...)
  //         this.profileImage = `http://localhost:5000${res.data.profileImage}`;
  //         this.cdr.detectChanges();
  //       }
  //     },
  //     error: (err: any) => {
  //       console.error('Failed to fetch profile image for header:', err);
  //     },
  //   });
  // }

  fetchUserProfile(): void {
    this.service.getPersonalDetails(this.userId, this.currentRouteLanguage).subscribe({
      next: (res: any) => {
        console.log('res profile', res);
        if (res.data && res.data.profileImage) {
          const path = res.data.profileImage;
          const cleanedPath = path.startsWith('/') ? path.slice(1) : path;
          this.profileImage = `${this.apiUrl}${cleanedPath}`;
          this.cdr.detectChanges();
        }
      },
      error: (err: any) => {
        console.error('Failed to fetch profile image for header:', err);
      },
    });
  }

  toggleNotificationDropdown(): void {
    this.isNotificationOpen = !this.isNotificationOpen;
  }

  fetchNotifications(userId: any): void {
    this.service.getUserNotifications(userId).subscribe((data: any) => {
      console.log('data', data);
      this.notifications = data.data;
      this.unreadCount = data.data.filter((n: any) => !n.isRead).length;
    });
  }

  // onNotificationClick(notification: any): void {
  //   // Step 1: Handle read status updates dynamically
  //   if (!notification.isRead) {
  //     // Optimistic UI update
  //     notification.isRead = true;
  //     this.recalculateUnreadCount();

  //     this.service.notificationsUpdateRead(notification._id).subscribe({
  //       error: (err) => {
  //         console.error('Failed to update notification status:', err);
  //         // Rollback on API failure
  //         notification.isRead = false;
  //         this.recalculateUnreadCount();
  //       },
  //     });
  //   }

  //   // Step 2: Safely extract target postId string
  //   const targetPostId =
  //     typeof notification.postId === 'object' && notification.postId !== null
  //       ? notification.postId._id
  //       : notification.postId;

  //   // Step 3: Determine target route based on post type (User vs Admin Post)
  //   const targetRoute = notification.postModel === 'AdminPost' ? 'community-post' : 'user-feed';

  //   // Step 4: Navigate to the target route with the postId query parameter for auto-scrolling
  //   if (targetPostId) {
  //     this.router.navigate(['/', this.currentLang, targetRoute], {
  //       queryParams: { postId: targetPostId },
  //     });
  //   }

  //   // Step 5: Close dropdown
  //   this.isNotificationOpen = false;
  // }

  onNotificationClick(notification: any): void {
    if (!notification.isRead) {
      // Optimistic UI update
      notification.isRead = true;
      this.recalculateUnreadCount();

      // Pass language to ensure correct patch route is hit
      this.service.notificationsUpdateRead(notification._id, this.currentLang).subscribe({
        error: (err) => {
          console.error('Failed to update notification status:', err);
          notification.isRead = false;
          this.recalculateUnreadCount();
        },
      });
    }

    const targetPostId =
      typeof notification.postId === 'object' && notification.postId !== null
        ? notification.postId._id
        : notification.postId;

    const targetRoute = notification.postModel === 'AdminPost' ? 'community-post' : 'user-feed';

    if (targetPostId) {
      this.router.navigate(['/', this.currentLang, targetRoute], {
        queryParams: { postId: targetPostId },
      });
    }

    this.isNotificationOpen = false;
  }

  private recalculateUnreadCount(): void {
    this.unreadCount = this.notifications.filter((n) => !n.isRead).length;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  toggleSidebar() {
    // this.isSidebarOpen.update((v) => !v);
    this.sidebarService.toggleSidebar();
  }

  isCoursesOpen: boolean = false;

  // Dynamic course collection
  courses: CourseOption[] = [
    { label: 'FACE YOGA', route: 'face-yoga', icon: '🧘‍♀️' },
    { label: 'FACE YOGA + RAJ YOGA', route: 'face-raj-yoga', icon: '🧘‍♂️' },
  ];

  toggleCoursesDropdown(): void {
    // Navigate using array format with the current language prefix
    this.router.navigate(['/', this.currentLang, 'courses-list']);
    // this.router.navigate(['/courses-list']);
  }

  navigateTo(route: string): void {
    // Ensure route has no leading slash to avoid double slashes when building the array
    const cleanRoute = route.startsWith('/') ? route.substring(1) : route;

    // Navigate using array format with the current language prefix
    this.router.navigate(['/', this.currentLang, cleanRoute]);
    // this.router.navigate([route]);
    this.isCoursesOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.isCoursesOpen = false;
    }
  }

  toggleProfileDropdown(): void {
    this.isProfileOpen = !this.isProfileOpen;
  }

  viewProfile(): void {
    this.router.navigate(['/', this.currentLang, 'user-profile']);
    this.isProfileOpen = false;
    // Add navigation logic (e.g., router.navigate(['/profile']))
  }

  myAccount(): void {
    this.isProfileOpen = false;
    // this.router.navigate(['edit-profile']);
    this.router.navigate(['/', this.currentLang, 'edit-profile']);

    // Add navigation logic (e.g., router.navigate(['/account']))
  }

  logout(): void {
    this.isProfileOpen = false;
    // Add logout logic (e.g., clear tokens, redirect to login)
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ngOnDestroy(): void {
  //   this.subscriptions.unsubscribe();
  // }

  toggleLanguage() {
    this.language = !this.language;
  }
}
