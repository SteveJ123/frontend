// auth.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/`;

  // 1. Initialize signal by checking if token exists in localStorage
  isLoggedIn = signal<boolean>(this.hasToken());

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  register(data: { mobile: string; password: string; repassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}register`, data);
  }

  // 2. Automatically save token and update isLoggedIn signal on successful login
  login(data: { mobile: string; password: string }): Observable<any> {
    return this.http.post<{ token: string; [key: string]: any }>(`${this.apiUrl}login`, data).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.isLoggedIn.set(true);
        }
      }),
    );
  }

  // 3. Clear token and update signal on logout
  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedIn.set(false);
  }

  // Helper method to retrieve token for HTTP Interceptors
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
