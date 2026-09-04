import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { apiUrl } from '../../../core/constants/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Service } from '../../../service/service';
import { ToastService } from '../../../service/toast.service';

@Component({
  selector: 'app-course-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './course-details.html',
  styleUrl: './course-details.css',
})
export class CourseDetails {
  courseId: string = '';
  course: any;
  isLoading: boolean = true;
  isModalOpen: boolean = false;
  isSubmitting: boolean = false;
  userRole: string = localStorage.getItem('role') || 'user';

  selectedVideoFile: File | null = null;
  videoForm = {
    title: '',
    duration: '',
  };

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
  ) {}

  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);
  private service = inject(Service);
  private toastService = inject(ToastService);

  get currentRouteLanguage(): string {
    const urlSegments = this.router.url.split('/').filter(Boolean);
    return urlSegments[0] === 'te' ? 'Telugu' : 'English';
  }
  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    if (this.courseId) {
      this.fetchCourseDetails();
    }
  }

  fetchCourseDetails(): void {
    this.isLoading = true;
    this.service.getCourseById(this.courseId, this.currentRouteLanguage).subscribe({
      next: (res) => {
        console.log('res', res);
        this.course = res.data;
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching course details:', err);
        this.isLoading = false;
      },
    });
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedVideoFile = null;
    this.videoForm = { title: '', duration: '' };
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedVideoFile = input.files[0];
    }
  }

  addVideoLecture(): void {
    if (!this.videoForm.title || !this.selectedVideoFile) return;

    this.isSubmitting = true;

    // Use FormData for binary file transmission
    const formData = new FormData();
    formData.append('title', this.videoForm.title);
    formData.append('duration', this.videoForm.duration);
    formData.append('video', this.selectedVideoFile);
    formData.append('language', this.currentRouteLanguage);

    this.service.uploadLecture(this.courseId, formData).subscribe({
      next: (res) => {
        this.course = res.data;
        this.isSubmitting = false;
        this.closeModal();
        this.toastService.success('Lecture updated succecssfully!');
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Failed to upload video:', err);
        this.isSubmitting = false;
        this.toastService.error('Lecture not updated succecssfully!');
        this.cd.detectChanges();
      },
    });
  }
}
