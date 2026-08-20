import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-left-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './left-sidebar.html',
  styleUrl: './left-sidebar.css',
})
export class LeftSidebar {
  isSidebarOpen = signal(false);

  toggleSidebar() {
    this.isSidebarOpen.update((v) => !v);
  }
}
