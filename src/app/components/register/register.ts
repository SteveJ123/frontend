import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/AuthService';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  formData = {
    username: '',
    mobile: '',
    password: '',
    repassword: '',
    role: 'user', // Set default user type on the frontend
  };

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onRegister(form: NgForm) {
    if (form.invalid || this.formData.password !== this.formData.repassword) {
      return;
    }

    this.authService.register(this.formData).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => console.error('Registration failed:', err),
    });
  }
}
