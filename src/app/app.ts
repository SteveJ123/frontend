import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { LeftSidebar } from './components/left-sidebar/left-sidebar';
import { AuthService } from './service/AuthService';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, LeftSidebar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // protected readonly title = signal('demo');
  authService = inject(AuthService);
}
