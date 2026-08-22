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
        this.router.navigate(['/feed']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Invalid mobile number or password.';
      },
    });
  }
}
