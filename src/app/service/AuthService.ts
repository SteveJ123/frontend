// auth.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { apiUrl } from '../core/constants/api';
import { Router } from '@angular/router';
import { Service } from './service';

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  role: 'user' | 'admin';
  username: string;
  courseType: string;
  id: string;
  language: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${apiUrl}api/`;

  // 1. Initialize signal by checking if token exists in localStorage
  // isLoggedIn = signal<boolean>(this.hasToken());
  // Track initial authentication check status
  isInitializing = signal<boolean>(true);
  isLoggedIn = signal<boolean>(false);
  private service = inject(Service);

  constructor() {
    this.checkInitialAuthState();
  }

  private checkInitialAuthState(): void {
    // Read synchronous token/session data from localStorage
    const token = localStorage.getItem('token');

    if (token) {
      this.isLoggedIn.set(true);
      this.isLoggedIn = signal<boolean>(!!localStorage.getItem('token'));
    } else {
      this.isLoggedIn.set(false);
    }

    // Complete initial check
    this.isInitializing.set(false);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  register(data: any): Observable<any> {
    console.log('data', data);
    const rawLang = data.language || 'English';
    const isEnglish = rawLang.toLowerCase().trim() === 'english';
    const targetRoute = isEnglish ? 'en/register' : 'register';
    return this.http.post(`${this.apiUrl}register`, data);
  }

  // New GET method with courseType filter support
  getRegisteredUsers(courseType?: string): Observable<any> {
    let params = new HttpParams();
    if (courseType) {
      params = params.set('courseType', courseType);
    }
    return this.http.get(`${this.apiUrl}registered-users`, { params });
  }

  // 1. Automatically save token and role on successful login
  login(data: { mobile: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}login`, data).pipe(
      tap((response) => {
        console.log('response', response);
        if (response.token && response.role) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.role);
          localStorage.setItem('username', response.username);
          localStorage.setItem('courseType', response.courseType);
          localStorage.setItem('userId', response.id);
          localStorage.setItem('language', response.language);
          // 2. Fetch notifications immediately
          this.service.fetchNotifications(response.id);
          this.isLoggedIn.set(true);
        }
      }),
    );
  }

  // 2. Retrieve saved user role from localStorage
  getUserRole(): 'admin' | 'user' {
    return (localStorage.getItem('role') as 'admin' | 'user') || 'user';
  }

  getUserName(): string | null {
    return localStorage.getItem('username');
  }

  getUserCourse(): string | null {
    return localStorage.getItem('courseType');
  }
  // 3. Clear storage on logout
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.isLoggedIn.set(false);
    this.router.navigate(['']);
  }

  // Helper method to retrieve token for HTTP Interceptors
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  getUserLanguage(): string | null {
    return localStorage.getItem('language');
  }
}
