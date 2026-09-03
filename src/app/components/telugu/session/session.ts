import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Service } from '../../../service/service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../service/toast.service';
import { AuthService } from '../../../service/AuthService';
import { Router } from '@angular/router';

export interface LiveSession {
  _id?: string;
  title: string;
  courseType: string;
  date: string;
  rawDate?: string; // Stores YYYY-MM-DD for <input type="date">
  startTime: string;
  endTime: string;
  occurrence?: string;
  linkTypeNote?: string;
  meetingUrl: string;
}

@Component({
  selector: 'app-session',
  imports: [CommonModule, FormsModule],
  templateUrl: './session.html',
  styleUrl: './session.css',
})
export class Session {
  // Edit / Form Management
  userRole: string = 'user'; // 'admin' or 'user'
  userCourseType: string = 'Face Yoga'; // 'Face Yoga' or 'Face Yoga + Raj Yoga'

  sessions: LiveSession[] = [];
  groupedSessions: { date: string; items: LiveSession[] }[] = [];

  activeDropdownId: string | null = null;
  copiedSessionId: string | null = null;

  isEditing = false;
  editingSessionId: string | null = null;

  courseTypes: string[] = ['Face Yoga', 'Face Yoga + Raj Yoga'];

  sessionForm: LiveSession = {
    title: 'Face Yoga',
    courseType: 'Face Yoga',
    date: '',
    rawDate: new Date().toISOString().split('T')[0],
    startTime: '7:00 AM',
    endTime: '8:20 AM',
    occurrence: 'Occurrence 1 of 100',
    linkTypeNote: '(Zoom Meeting - recurring fixed link)',
    meetingUrl: '',
  };
  productToDeleteId: string = '';
  showDeleteModal: boolean = false;
  constructor() {}
  private service = inject(Service);
  private router = inject(Router);
  private authService = inject(AuthService);
  private cd = inject(ChangeDetectorRef);
  private toastService = inject(ToastService);

  userLanguage: any = '';
  userType: any = '';
  userId: any = '';

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.userRole = localStorage.getItem('role') || 'admin';
    this.userCourseType = localStorage.getItem('courseType') || '';
    this.fetchSessions();
  }

  get currentRouteLanguage(): string {
    const urlSegments = this.router.url.split('/').filter(Boolean);
    return urlSegments[0] === 'te' ? 'Telugu' : 'English';
  }

  fetchSessions(): void {
    this.service
      .getSession(this.currentRouteLanguage, this.userCourseType, this.userRole)
      .subscribe({
        next: (res: any) => {
          console.log('res', res);
          if (res.success) {
            // Filter out combo sessions if user courseType is strictly "Face Yoga"
            this.sessions = res.data;
            this.groupSessionsByDate();
            this.cd.detectChanges();
          }
        },
        error: (err) => {
          console.error('Error fetching sessions:', err);
        },
      });
  }

  groupSessionsByDate(): void {
    const groups: { [key: string]: LiveSession[] } = {};
    this.sessions.forEach((session) => {
      if (!groups[session.date]) {
        groups[session.date] = [];
      }
      groups[session.date].push(session);
    });

    this.groupedSessions = Object.keys(groups).map((date) => ({
      date,
      items: groups[date],
    }));
    this.cd.detectChanges();
  }

  onCourseTypeChange(selectedType: string): void {
    this.sessionForm.title = selectedType;
    this.sessionForm.courseType = selectedType;
  }

  // Handle Form Submit (Creates or Updates depending on isEditing state)
  saveSession(): void {
    // Format raw YYYY-MM-DD input string into display string "MMM DD, YYYY"
    if (this.sessionForm.rawDate) {
      const dateObj = new Date(this.sessionForm.rawDate);
      this.sessionForm.date = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }

    const payload = {
      title: this.sessionForm.title,
      courseType: this.sessionForm.courseType,
      date: this.sessionForm.date,
      startTime: this.sessionForm.startTime,
      endTime: this.sessionForm.endTime,
      occurrence: this.sessionForm.occurrence,
      linkTypeNote: this.sessionForm.linkTypeNote,
      meetingUrl: this.sessionForm.meetingUrl,
      language: this.currentRouteLanguage,
    };

    if (this.isEditing && this.editingSessionId) {
      // Update
      this.service.updateSession(this.editingSessionId, payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.fetchSessions();
            this.resetForm();
            this.cd.detectChanges();
            this.toastService.success('Session updated successfully!');
          }
        },
        error: (err) => {
          console.error('Update error:', err);
          this.toastService.error('Session not updated successfully!');
        },
      });
    } else {
      // Create
      this.service.createSession(payload).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.fetchSessions();
            this.resetForm();
            this.cd.detectChanges();
            this.toastService.success('Session saved successfully!');
          }
        },
        error: (err) => {
          console.error('Creation error:', err);
          this.toastService.error('Session not saved successfully!');
        },
      });
    }
  }

  startEditing(session: LiveSession, event: Event): void {
    event.stopPropagation();
    this.isEditing = true;
    this.editingSessionId = session._id || null;

    // Convert display date string to YYYY-MM-DD format for date input
    let formattedRawDate = new Date().toISOString().split('T')[0];
    if (session.date) {
      const parsedDate = new Date(session.date);
      if (!isNaN(parsedDate.getTime())) {
        formattedRawDate = parsedDate.toISOString().split('T')[0];
      }
    }

    this.sessionForm = {
      ...session,
      rawDate: formattedRawDate,
      courseType: session.courseType || session.title,
    };
    this.activeDropdownId = null;
  }

  resetForm(): void {
    this.isEditing = false;
    this.editingSessionId = null;
    const today = new Date().toISOString().split('T')[0];
    this.sessionForm = {
      title: 'Face Yoga',
      courseType: 'Face Yoga',
      date: '',
      rawDate: today,
      startTime: '7:00 AM',
      endTime: '8:20 AM',
      occurrence: 'Occurrence 1 of 100',
      linkTypeNote: '(Zoom Meeting - recurring fixed link)',
      meetingUrl: '',
    };
  }

  // deleteSession(id: string, event: Event): void {
  //   event.stopPropagation();
  //   if (confirm('Are you sure you want to delete this live session?')) {
  //     this.service.deleteSession(id).subscribe({
  //       next: (res: any) => {
  //         if (res.success) {
  //           this.fetchSessions();
  //           this.activeDropdownId = null;
  //           this.cd.detectChanges();
  //         }
  //       },
  //       error: (err) => console.error('Delete error:', err),
  //     });
  //   }
  // }

  toggleDropdown(id: string, event: Event): void {
    event.stopPropagation();
    this.activeDropdownId = this.activeDropdownId === id ? null : id;
  }

  copyLink(meetingUrl: string, id: string, event: Event): void {
    event.stopPropagation();
    navigator.clipboard.writeText(meetingUrl).then(() => {
      this.copiedSessionId = id;
      setTimeout(() => {
        this.copiedSessionId = null;
        this.activeDropdownId = null;
      }, 1500);
    });
  }

  joinSession(meetingUrl: string): void {
    window.open(meetingUrl, '_blank');
  }

  // Opens the custom popup dialog
  openDeleteModal(id: string): void {
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
    this.service.deleteSession(this.productToDeleteId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.fetchSessions();
          this.activeDropdownId = null;
          this.cd.detectChanges();
          this.toastService.success('Session deleted successfully!');
          this.cancelDelete();
        }
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.cancelDelete();
        this.cd.detectChanges();
        this.toastService.error('Session not deleted!');
      },
    });
  }
}
