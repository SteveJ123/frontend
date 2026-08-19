import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Home } from './components/home/home';
import { Header } from './components/header/header';
import { LeftSidebar } from './components/left-sidebar/left-sidebar';

@Component({
  selector: 'app-root',
  imports: [Home, Header, LeftSidebar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('demo');
}
