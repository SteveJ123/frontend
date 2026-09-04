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

  isEditMode: boolean = false;
  selectedLectureId: string | null = null;
  productToDeleteId: string = '';
  showDeleteModal: boolean = false;

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

  openModal(lecture: any = null): void {
    if (lecture) {
      this.isEditMode = true;
      this.selectedLectureId = lecture._id;
      this.videoForm.title = lecture.title;
    } else {
      this.isEditMode = false;
      this.selectedLectureId = null;
      this.videoForm = { title: '', duration: '' };
    }
    this.selectedVideoFile = null;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.selectedLectureId = null;
    this.selectedVideoFile = null;
    this.videoForm = { title: '', duration: '' };
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedVideoFile = input.files[0];
    }
  }

  saveVideoLecture(): void {
    if (!this.videoForm.title) return;

    this.isSubmitting = true;
    const formData = new FormData();
    formData.append('title', this.videoForm.title);
    formData.append('language', this.currentRouteLanguage);

    if (this.selectedVideoFile) {
      formData.append('video', this.selectedVideoFile);
    }

    if (this.isEditMode && this.selectedLectureId) {
      // Update existing lecture
      this.service.updateLecture(this.courseId, this.selectedLectureId, formData).subscribe({
        next: (res) => {
          this.course = res.data;
          this.isSubmitting = false;
          this.closeModal();
          this.toastService.success('Lecture updated successfully!');
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Failed to update lecture:', err);
          this.isSubmitting = false;
          this.toastService.error('Failed to update lecture.');
          this.cd.detectChanges();
        },
      });
    } else {
      // Add new lecture
      if (!this.selectedVideoFile) return;

      this.service.uploadLecture(this.courseId, formData).subscribe({
        next: (res) => {
          this.course = res.data;
          this.isSubmitting = false;
          this.closeModal();
          this.toastService.success('Lecture posted successfully!');
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Failed to upload video:', err);
          this.isSubmitting = false;
          this.toastService.error('Failed to upload video.');
          this.cd.detectChanges();
        },
      });
    }
  }

  deleteLecture(lectureId: string): void {
    if (!confirm('Are you sure you want to delete this lecture?')) return;

    // this.service.deleteLecture(this.courseId, lectureId, this.currentRouteLanguage).subscribe({
    //   next: (res) => {
    //     this.course = res.data;
    //     this.toastService.success('Lecture deleted successfully!');
    //     this.cd.detectChanges();
    //   },
    //   error: (err) => {
    //     console.error('Failed to delete lecture:', err);
    //     this.toastService.error('Failed to delete lecture.');
    //   },
    // });
  }

  // Opens the custom popup dialog
  openDeleteModal(event: any, id: string): void {
    event.stopPropagation();
    this.productToDeleteId = id;
    this.showDeleteModal = true;
  }

  // Closes the popup dialog without deleting
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.productToDeleteId = '';
  }

  // Executed when "OK" / "Delete" is pressed in the modal
  confirmDelete(): void {
    if (!this.productToDeleteId) return;
    this.service
      .deleteLecture(this.courseId, this.productToDeleteId, this.currentRouteLanguage)
      .subscribe({
        next: (res) => {
          this.course = res.data;
          this.toastService.success('Lecture deleted successfully!');
          this.showDeleteModal = false;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Failed to delete lecture:', err);
          this.showDeleteModal = false;
          this.toastService.error('Failed to delete lecture.');
        },
      });
  }
}
