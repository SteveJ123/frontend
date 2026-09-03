import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { LeftSidebar } from './components/left-sidebar/left-sidebar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, LeftSidebar],
  template: `
    <app-header></app-header>
    <div class="flex">
      <app-left-sidebar></app-left-sidebar>
      <router-outlet></router-outlet>
    </div>
  `,
})
export class MainLayoutComponent {}
