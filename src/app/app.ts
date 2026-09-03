import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { LeftSidebar } from './components/left-sidebar/left-sidebar';
import { AuthService } from './service/AuthService';
import { ToastComponent } from './components/toast/ToastComponent';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // protected readonly title = signal('demo');

  constructor() {}
}
