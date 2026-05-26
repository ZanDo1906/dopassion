import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { CommonModule } from '@angular/common';
import { NotificationPopupComponent } from './components/notification-popup/notification-popup';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, CommonModule, NotificationPopupComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(public router: Router) { }
  get isLoginPage(): boolean {
    // router.url can contain query params, so we check if it starts with '/login'
    return this.router.url.startsWith('/login');
  }
}
