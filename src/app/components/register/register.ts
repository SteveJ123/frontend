import { Component, inject } from '@angular/core';
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
    courseType: 'Face Yoga', // Default selected option
    role: 'user', // Set default user type on the frontend
    language: 'English',
  };

  constructor(
    // private authService: AuthService,
    // private router: Router,
  ) {}

  private authService = inject(AuthService);
  private router = inject(Router);

  onRegister(form: NgForm) {
    if (form.invalid || this.formData.password !== this.formData.repassword) {
      return;
    }

    // this.authService.register(this.formData).subscribe({
    //   next: () => this.router.navigate(['/login']),
    //   error: (err) => console.error('Registration failed:', err),
    // });

    this.authService.register(this.formData).subscribe({
      next: () => {
        // Determine language path ('en' vs default route)
        // const rawLang = this.formData.language || 'English';
        // const isEnglish = rawLang.toLowerCase().trim() === 'english';
        // const targetRoute = isEnglish ? '/en/login' : '/login';
        // console.log('targetRoute', targetRoute);
        this.router.navigate(['/login']);
      },
      error: (err: any) => console.error('Registration failed:', err),
    });
  }
}
