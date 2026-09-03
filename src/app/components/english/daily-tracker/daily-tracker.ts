import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DateAdapter,
  provideCalendar,
  CalendarPreviousViewDirective,
  CalendarTodayDirective,
  CalendarNextViewDirective,
  CalendarMonthViewComponent,
  CalendarEvent,
  CalendarView,
  CalendarDateFormatter,
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CustomDateFormatter } from './customDateFormatter';
import { Service } from '../../../service/service';

@Component({
  selector: 'app-daily-tracker',
  imports: [
    CommonModule,
    FormsModule,
    CalendarPreviousViewDirective,
    CalendarTodayDirective,
    CalendarNextViewDirective,
    CalendarMonthViewComponent,
  ],
  providers: [
    provideCalendar({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter,
    },
  ],
  templateUrl: './daily-tracker.html',
})
export class DailyTracker implements OnInit {
  viewDate: Date = new Date();
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;

  userId: string = '';
  points: number = 0;
  completedDates: string[] = []; // Contains array of strings like ['2026-08-01', '2026-08-31']

  isTodayCompleted: boolean = false;
  isSubmitting: boolean = false;

  // todayDateStr: string = format(new Date(), 'yyyy-MM-dd');
  todayDateStr: string = new Date().toISOString().split('T')[0];
  events: CalendarEvent[] = [];

  get localTodayStr(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate());
    return `${year}-${month}-${day}`;
  }

  constructor(private http: HttpClient) {}
  private service = inject(Service);
  private cd = inject(ChangeDetectorRef);
  isLoadingTracker: boolean = false;
  ngOnInit(): void {
    this.userId = localStorage.getItem('userId') || '';
    this.fetchTrackerStatus();
  }

  fetchTrackerStatus(): void {
    this.isLoadingTracker = true; // Show spinner
    this.service.fetchTrackerUpdate(this.userId).subscribe({
      next: (res: any) => {
        console.log('res fetch', this.localTodayStr);
        if (res.message == 'Daily practice already completed for today.') {
          this.isTodayCompleted = true;
          this.generateEvent();
          this.isLoadingTracker = false; // Hide spinner
          this.cd.detectChanges();
        } else {
          this.completedDates = res.completedPracticeDates || [];
          this.checkTodayStatus();
          this.generateCalendarEvents();
          this.isLoadingTracker = false; // Hide spinner
          this.cd.detectChanges();
        }
      },
      error: (err: any) => {
        console.error('Error fetching tracker status:', err);
        this.isLoadingTracker = false; // Hide spinner
        this.cd.detectChanges();
      },
    });
  }

  checkTodayStatus(): void {
    this.isTodayCompleted = this.completedDates.includes(this.localTodayStr);
  }

  generateEvent() {
    this.events = [this.localTodayStr].map((dateStr: any) => {
      const cleanDate = dateStr.split('T')[0];
      const [year, month, day] = cleanDate.split('-').map(Number);

      return {
        start: new Date(year, month - 1, day),
        title: 'Daily Practice Tracker',
        color: { primary: '#334155', secondary: '#f8fafc' },
        allDay: true,
      };
    });
  }
  generateCalendarEvents(): void {
    this.events = this.completedDates.map((dateStr) => {
      const cleanDate = dateStr.split('T')[0];
      const [year, month, day] = cleanDate.split('-').map(Number);

      return {
        start: new Date(year, month - 1, day),
        title: 'Daily Practice Tracker',
        color: { primary: '#334155', secondary: '#f8fafc' },
        allDay: true,
      };
    });
  }

  completeTodayHabit(): void {
    if (this.isTodayCompleted || this.isSubmitting) return;

    // this.isSubmitting = true;
    this.service.MarkPracticeComplete(this.userId).subscribe({
      next: (res: any) => {
        console.log('res=====', res);
        this.completedDates = res.completedPracticeDates || [];

        // Optimistic fallback if backend didn't append today immediately
        if (!this.completedDates.includes(this.localTodayStr)) {
          this.completedDates.push(this.localTodayStr);
        }

        this.checkTodayStatus();
        this.generateCalendarEvents();
        this.isSubmitting = false;
        this.cd.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to complete practice:', err);
        this.isSubmitting = false;
        this.cd.detectChanges();
      },
    });
  }
}
