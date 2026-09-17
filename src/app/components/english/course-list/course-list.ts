import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Service } from '../../../service/service';
import { Router } from '@angular/router';
import { ToastService } from '../../../service/toast.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-course-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './course-list.html',
  styleUrl: './course-list.css',
  host: {
    class: 'w-full block px-4',
  },
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
  showDeleteNutritionModal: boolean = false;
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

  nutritiousFoods: any[] = [];
  healthyDrinks: any[] = [];

  // Form State
  isEditingNutrition: boolean = false;
  isNutritionSubmitting: boolean = false;
  selectedNutritionFile: File | null = null;

  nutritionForm: any = {
    title: '',
    category: 'nutritiousFood',
    language: 'Telugu',
    imageUrl: '',
    ingredients: '',
    description: '',
  };
  constructor() {}

  ngOnInit(): void {
    this.userRole = localStorage.getItem('role') || 'admin';
    this.courseType = localStorage.getItem('courseType') || '';
    if (this.courseType || this.userRole) {
      this.fetchCourses();
      this.fetchNutritionItems();
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

  // saveEdit(course: any): void {
  //   const formData = new FormData();
  //   formData.append('title', this.editData.title);
  //   formData.append('instructor', this.editData.instructor);
  //   formData.append('description', this.editData.description || '');
  //   formData.append('isNewCourse', String(this.editData.isNewCourse));
  //   formData.append('language', this.currentRouteLanguage || '');

  //   if (this.selectedEditFile) {
  //     formData.append('thumbnail', this.selectedEditFile);
  //   }

  //   this.service.updateCourse(course._id, formData).subscribe({
  //     next: (res) => {
  //       if (res.success) {
  //         Object.assign(course, res.data);
  //         this.cancelEditing();
  //         this.cd.detectChanges();
  //         this.toastService.success('Course Updated Successfully!');
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Update failed:', err);
  //       this.cd.detectChanges();
  //       this.toastService.error('Course Not Updated Successfully!');
  //     },
  //   });
  // }

  async saveEdit(course: any): Promise<void> {
    try {
      let thumbnailUrl = course.thumbnail;

      // 1. If a new file was selected, upload it to S3 first under 'courseThumbnail'
      if (this.selectedEditFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', this.selectedEditFile, this.selectedEditFile.name);
        uploadFormData.append('folder', 'courseThumbnail');

        const uploadRes: any = await firstValueFrom(this.service.uploadAWSMedia(uploadFormData));

        if (!uploadRes || !uploadRes.success || !uploadRes.data) {
          throw new Error('Failed to upload updated thumbnail to S3');
        }

        thumbnailUrl = uploadRes.data;
      }

      // 2. Prepare JSON payload
      const payload = {
        title: this.editData.title,
        instructor: this.editData.instructor,
        description: this.editData.description || '',
        isNewCourse: Boolean(this.editData.isNewCourse),
        language: this.currentRouteLanguage || '',
        thumbnail: thumbnailUrl,
      };

      // 3. Send JSON payload to backend PUT endpoint
      this.service.updateCourse(course._id, payload).subscribe({
        next: (res: any) => {
          if (res && res.success) {
            Object.assign(course, res.data);
            this.selectedEditFile = null;
            this.cancelEditing();
            this.cd.detectChanges();
            this.toastService.success('Course Updated Successfully!');
          }
        },
        error: (err: any) => {
          console.error('Update failed:', err);
          this.toastService.error('Course Not Updated Successfully!');
          this.cd.detectChanges();
        },
      });
    } catch (error: any) {
      console.error('Save edit error:', error);
      this.toastService.error(error.message || 'Error updating course thumbnail');
    }
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
  openDeleteModal(event: any, id: string, courseNutrition: any): void {
    event.stopPropagation();
    this.productToDeleteId = id;
    if (courseNutrition === 'course') {
      this.showDeleteModal = true;
    } else if (courseNutrition === 'nutrition') {
      this.showDeleteNutritionModal = true;
    }
  }

  // Closes the popup dialog without deleting
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.showDeleteNutritionModal = false;
    this.productToDeleteId = '';
  }

  // Executed when "OK" / "Delete" is pressed in the modal
  confirmDelete(): void {
    if (!this.productToDeleteId) return;

    if (this.showDeleteModal) {
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
    } else if (this.showDeleteNutritionModal) {
      this.service.deleteNutritionItem(this.productToDeleteId).subscribe({
        next: () => {
          (this.fetchNutritionItems(), this.toastService.success('Product deleted successfully!'));
          this.cancelDelete();
          this.cd.detectChanges();
        },
        error: (err: any) => {
          console.error('Delete Error:', err);
          this.toastService.error('Product not deleted successfully!');
          this.cancelDelete();
          this.cd.detectChanges();
        },
      });
    }
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
  // onSubmit(): void {
  //   if (!this.course.title || !this.course.description || !this.selectedFile) {
  //     this.errorMessage = 'Please complete all required fields and upload a thumbnail.';
  //     return;
  //   }

  //   this.isSubmitting = true;
  //   this.errorMessage = '';
  //   this.successMessage = '';

  //   const formData = new FormData();
  //   formData.append('title', this.course.title);
  //   formData.append('description', this.course.description);
  //   formData.append('instructor', this.course.instructor);
  //   formData.append('sectionsCount', this.course.sectionsCount.toString());
  //   formData.append('lecturesCount', this.course.lecturesCount.toString());
  //   formData.append('isPaid', String(this.course.isPaid));
  //   formData.append('isNewCourse', String(this.course.isNewCourse));
  //   formData.append('membershipType', this.course.membershipType);
  //   formData.append('language', this.currentRouteLanguage);

  //   // Attach the image file under the 'thumbnail' key expected by upload.single('thumbnail')
  //   formData.append('thumbnail', this.selectedFile, this.selectedFile.name);

  //   this.service.createCourse(formData).subscribe({
  //     next: (res: any) => {
  //       this.isSubmitting = false;
  //       console.log('res', res);
  //       if (res.success) {
  //         if (res && res.data) {
  //           // 2. Prepend the new course object to the existing list
  //           this.courses = [res.data, ...this.courses];
  //           this.cd.detectChanges();
  //         }
  //         this.successMessage = 'Course published successfully!';
  //         this.toastService.success('Course Created Succesfully!');
  //         this.showCreateCourse = false;
  //         this.cd.detectChanges();
  //         // setTimeout(() => {
  //         //   this.router.navigate(['/courses-list']); // Navigate to course list after creation
  //         // }, 1500);
  //       }
  //     },
  //     error: (err) => {
  //       this.isSubmitting = false;
  //       this.errorMessage = err.error?.message || 'Failed to publish course. Please try again.';
  //       this.toastService.error('Course Not Created Succesfully!');
  //       this.cd.detectChanges();
  //     },
  //   });
  // }

  async onSubmit(): Promise<void> {
    if (!this.course.title || !this.course.description || !this.selectedFile) {
      this.errorMessage = 'Please complete all required fields and upload a thumbnail.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      // 1. Upload thumbnail file to AWS S3 under 'courseThumbnail' folder
      const uploadFormData = new FormData();
      uploadFormData.append('file', this.selectedFile, this.selectedFile.name);
      uploadFormData.append('folder', 'courseThumbnail');

      const uploadRes: any = await firstValueFrom(this.service.uploadAWSMedia(uploadFormData));

      if (!uploadRes || !uploadRes.success || !uploadRes.data) {
        throw new Error('Failed to upload thumbnail to AWS S3');
      }

      const fileLink = uploadRes.data;

      // 2. Build course payload with the S3 URL string
      const coursePayload = {
        title: this.course.title,
        description: this.course.description,
        instructor: this.course.instructor,
        sectionsCount: Number(this.course.sectionsCount),
        lecturesCount: Number(this.course.lecturesCount),
        isPaid: Boolean(this.course.isPaid),
        isNewCourse: Boolean(this.course.isNewCourse),
        membershipType: this.course.membershipType,
        language: this.currentRouteLanguage,
        thumbnail: fileLink, // S3 URL string
      };

      // 3. Create course record in backend database
      this.service.createCourse(coursePayload).subscribe({
        next: (res: any) => {
          this.isSubmitting = false;
          if (res && res.success) {
            if (res.data) {
              this.courses = [res.data, ...this.courses];
            }
            this.successMessage = 'Course published successfully!';
            this.toastService.success('Course Created Successfully!');
            this.showCreateCourse = false;
            this.cd.detectChanges();
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || 'Failed to publish course. Please try again.';
          this.toastService.error('Course Not Created Successfully!');
          this.cd.detectChanges();
        },
      });
    } catch (error: any) {
      console.error('Submission failed:', error);
      this.isSubmitting = false;
      this.errorMessage = error.message || 'Error uploading course thumbnail. Please try again.';
      this.toastService.error('Thumbnail upload failed!');
      this.cd.detectChanges();
    }
  }
  toggleCreateCourse() {
    this.showCreateCourse = !this.showCreateCourse;
  }

  // 1. READ: Fetch Items
  fetchNutritionItems(): void {
    this.service.getNutritionItems(this.currentRouteLanguage).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.nutritiousFoods = res.data.filter((item: any) => item.category === 'nutritiousFood');
          this.healthyDrinks = res.data.filter((item: any) => item.category === 'healthyDrink');
        }
      },
      error: (err: any) => console.error('Error fetching nutrition items:', err),
    });
  }

  // 2. CREATE & UPDATE: Direct Save using Image URL
  saveNutritionItem(): void {
    if (
      !this.nutritionForm.title ||
      !this.nutritionForm.imageUrl ||
      !this.nutritionForm.ingredients ||
      !this.nutritionForm.description
    ) {
      alert('Please fill in all required fields including Image URL.');
      return;
    }

    this.isNutritionSubmitting = true;

    if (this.isEditingNutrition && this.nutritionForm._id) {
      // UPDATE
      this.service.updateNutritionItem(this.nutritionForm._id, this.nutritionForm).subscribe({
        next: () => {
          this.resetNutritionForm();
          this.fetchNutritionItems();
          this.toastService.success('Product edited successfully!');
          this.isNutritionSubmitting = false;
          this.cd.detectChanges();
        },
        error: (err: any) => {
          console.error('Update Error:', err);
          this.isNutritionSubmitting = false;
          this.toastService.error('Product not edited successfully!');
          this.cd.detectChanges();
        },
      });
    } else {
      // CREATE
      this.service.createNutritionItem(this.nutritionForm).subscribe({
        next: () => {
          this.resetNutritionForm();
          this.fetchNutritionItems();
          this.isNutritionSubmitting = false;
          this.toastService.success('Product added successfully!');
          this.cd.detectChanges();
        },
        error: (err: any) => {
          console.error('Create Error:', err);
          this.isNutritionSubmitting = false;
          this.toastService.error('Product not added successfully!');
          this.cd.detectChanges();
        },
      });
    }
  }

  // Set Item to Form for Editing
  editNutritionItem(item: any): void {
    this.isEditingNutrition = true;
    this.nutritionForm = { ...item };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 3. DELETE
  deleteNutritionItem(id?: string): void {
    if (!id) return;
    if (confirm('Are you sure you want to delete this recipe item?')) {
      // this.service.deleteNutritionItem(id).subscribe({
      //   next: () => {
      //     (this.fetchNutritionItems(), this.toastService.success('Product deleted successfully!'));
      //     this.cd.detectChanges();
      //   },
      //   error: (err: any) => {
      //     console.error('Delete Error:', err);
      //     this.toastService.error('Product not deleted successfully!');
      //     this.cd.detectChanges();
      //   },
      // });
    }
  }

  // Reset Form
  resetNutritionForm(): void {
    this.isEditingNutrition = false;
    this.nutritionForm = {
      title: '',
      category: 'nutritiousFood',
      language: this.currentRouteLanguage === 'te' ? 'Telugu' : 'English',
      imageUrl: '',
      ingredients: '',
      description: '',
    };
  }

  // Navigation handler
  viewNutritionDetail(id?: string): void {
    if (id) {
      this.router.navigate(['/en/nutrition', id]);
    }
  }
}
