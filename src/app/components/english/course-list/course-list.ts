import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Service } from '../../../service/service';
import { Router } from '@angular/router';
import { ToastService } from '../../../service/toast.service';

@Component({
  selector: 'app-course-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './course-list.html',
  styleUrl: './course-list.css',
})
export class CourseList implements OnInit {
  courses: any[] = [];
  isLoading = false;
  userRole: string = 'admin'; // 'admin' or 'user'

  // Edit State Tracking
  editingCourseId: string | null = null;
  editData: any = {};
  selectedEditFile: File | null = null;
  editImagePreview: string | null = null;
  courseType = '';

  productToDeleteId: string = '';
  showDeleteModal: boolean = false;
  private service = inject(Service);
  private cd = inject(ChangeDetectorRef);
  private router = inject(Router);
  private toastService = inject(ToastService);

  // Form Model matching Mongoose Defaults
  course = {
    title: '',
    description: '',
    instructor: 'Pooja Agarwala',
    sectionsCount: 1,
    lecturesCount: 1,
    isPaid: false,
    isNewCourse: true,
    membershipType: 'Standard',
  };

  get currentRouteLanguage(): string {
    const urlSegments = this.router.url.split('/').filter(Boolean);
    return urlSegments[0] === 'te' ? 'Telugu' : 'English';
  }

  showCreateCourse = false;
  constructor() {}

  ngOnInit(): void {
    this.userRole = localStorage.getItem('role') || 'admin';
    this.courseType = localStorage.getItem('courseType') || '';
    if (this.courseType || this.userRole) {
      this.fetchCourses();
    }
  }

  fetchCourses(): void {
    this.isLoading = true;
    this.service.getCourses(this.currentRouteLanguage, this.courseType, this.userRole).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.courses = res.data;
          this.isLoading = false;
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        console.error('Fetch error:', err);
        this.isLoading = false;
      },
    });
  }

  startEditing(event: Event, course: any): void {
    event.stopPropagation();
    this.editingCourseId = course._id;
    this.editData = { ...course };
    this.editImagePreview = course.thumbnail;
    this.selectedEditFile = null;
  }

  cancelEditing(): void {
    this.editingCourseId = null;
    this.editData = {};
    this.selectedEditFile = null;
    this.editImagePreview = null;
  }

  onEditFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedEditFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.editImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveEdit(course: any): void {
    const formData = new FormData();
    formData.append('title', this.editData.title);
    formData.append('instructor', this.editData.instructor);
    formData.append('description', this.editData.description || '');
    formData.append('isNewCourse', String(this.editData.isNewCourse));
    formData.append('language', this.currentRouteLanguage || '');

    if (this.selectedEditFile) {
      formData.append('thumbnail', this.selectedEditFile);
    }

    this.service.updateCourse(course._id, formData).subscribe({
      next: (res) => {
        if (res.success) {
          Object.assign(course, res.data);
          this.cancelEditing();
          this.cd.detectChanges();
          this.toastService.success('Course Updated Successfully!');
        }
      },
      error: (err) => {
        console.error('Update failed:', err);
        this.cd.detectChanges();
        this.toastService.error('Course Not Updated Successfully!');
      },
    });
  }

  deleteCourse(event: Event, courseId: string): void {
    console.log('courseId', courseId);
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this course?')) {
      //   this.service.deleteCourse(courseId).subscribe({
      //     next: (res) => {
      //       console.log('res', res);
      //       if (res.success) {
      //         this.courses = this.courses.filter((c) => c._id !== courseId);
      //         this.cd.detectChanges();
      //       }
      //     },
      //     error: (err) => console.error('Delete error:', err),
      //   });
    }
  }

  viewCourseDetails(courseId: string): void {
    if (this.editingCourseId) return;
    console.log('Navigating to course:', courseId);
    this.router.navigate(['/en/courses', courseId]);
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

    this.service.deleteCourse(this.productToDeleteId).subscribe({
      next: (res) => {
        console.log('res', res);
        if (res.success) {
          this.courses = this.courses.filter((c) => c._id !== this.productToDeleteId);
          this.toastService.success('Course deleted successfully!');
          this.cancelDelete();
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.cancelDelete();
        this.cd.detectChanges();
        this.toastService.error('Course not deleted!');
      },
    });
  }

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isSubmitting: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  // Handle image selection and client-side preview
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // Handle Form Submission using FormData
  onSubmit(): void {
    if (!this.course.title || !this.course.description || !this.selectedFile) {
      this.errorMessage = 'Please complete all required fields and upload a thumbnail.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();
    formData.append('title', this.course.title);
    formData.append('description', this.course.description);
    formData.append('instructor', this.course.instructor);
    formData.append('sectionsCount', this.course.sectionsCount.toString());
    formData.append('lecturesCount', this.course.lecturesCount.toString());
    formData.append('isPaid', String(this.course.isPaid));
    formData.append('isNewCourse', String(this.course.isNewCourse));
    formData.append('membershipType', this.course.membershipType);
    formData.append('language', this.currentRouteLanguage);

    // Attach the image file under the 'thumbnail' key expected by upload.single('thumbnail')
    formData.append('thumbnail', this.selectedFile, this.selectedFile.name);

    this.service.createCourse(formData).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        console.log('res', res);
        if (res.success) {
          if (res && res.data) {
            // 2. Prepend the new course object to the existing list
            this.courses = [res.data, ...this.courses];
            this.cd.detectChanges();
          }
          this.successMessage = 'Course published successfully!';
          this.toastService.success('Course Created Succesfully!');
          this.showCreateCourse = false;
          this.cd.detectChanges();
          // setTimeout(() => {
          //   this.router.navigate(['/courses-list']); // Navigate to course list after creation
          // }, 1500);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to publish course. Please try again.';
        this.toastService.error('Course Not Created Succesfully!');
        this.cd.detectChanges();
      },
    });
  }

  toggleCreateCourse() {
    this.showCreateCourse = !this.showCreateCourse;
  }
}
