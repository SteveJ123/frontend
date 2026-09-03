import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  // Hold state with an initial value of false
  private isSidebarOpenSubject = new BehaviorSubject<boolean>(false);

  // Expose as an Observable for components to subscribe
  isSidebarOpen$ = this.isSidebarOpenSubject.asObservable();

  // Toggle open/close state
  toggleSidebar(): void {
    this.isSidebarOpenSubject.next(!this.isSidebarSubjectValue);
  }

  // Set explicit state
  setSidebarState(isOpen: boolean): void {
    this.isSidebarOpenSubject.next(isOpen);
  }

  // Getter for current instant value
  private get isSidebarSubjectValue(): boolean {
    return this.isSidebarOpenSubject.getValue();
  }
}
