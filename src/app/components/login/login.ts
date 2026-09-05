import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../service/AuthService';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  loginData = {
    mobile: '',
    password: '',
  };

  errorMessage: string = '';

  onLogin(form: NgForm) {
    this.errorMessage = '';

    if (form.invalid) {
      return;
    }

    this.authService.login(this.loginData).subscribe({
      next: (res: any) => {
        console.log('res login', res);
        // Save JWT token locally if needed
        if (res.token) {
          localStorage.setItem('token', res.token);
        }

        if (res.role === 'admin') {
          return this.router.navigate(['/te/community-post']);
          // return this.router.navigate(['/admin']);
        }

        const rawLang = this.authService.getUserLanguage() ?? 'English';
        const lang = rawLang.toLowerCase().trim() === 'english' ? 'en' : 'te';

        const role = this.authService.getUserRole();
        return this.router.navigate([`/${lang}/community-post`]);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Invalid mobile number or password.';
      },
    });
  }
}
