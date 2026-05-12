import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Sidebar } from './components/sidebar/sidebar';
import { NgIf } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('admin');
  showSidebar = true;

  constructor(private router: Router) {
    this.showSidebar = !this.router.url.includes('/login');

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects || event.url;
        this.showSidebar = !url.includes('/login');
      });
  }
}
