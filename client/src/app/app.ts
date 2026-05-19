import { Component, signal } from '@angular/core';
import { Router,RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Header, Footer, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(public router: Router) {}
  get isLoginPage(): boolean {
  return this.router.url === '/login';
}
}
