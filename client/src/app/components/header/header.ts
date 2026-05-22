import { Component, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements AfterViewInit {
  avatarUrl: string = '';
  gender: string = '';
  @ViewChild('navMenu') navMenu!: ElementRef;

  private lastLeft = -1;
  private lastWidth = -1;

  constructor(private router: Router) {
    const userData = localStorage.getItem('currentUser');

if (userData) {

  const user = JSON.parse(userData);
  this.gender = user.gioiTinh || '';

  // có avatar từ DB
  if (user.avatar && user.avatar.trim() !== '') {

    this.avatarUrl = user.avatar;

  }


}
    // Recalculate on route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      setTimeout(() => this.updateIndicator(), 100);
    });
  }

  ngAfterViewInit() {
    // Initial calculation
    setTimeout(() => this.updateIndicator(), 150);
  }

  @HostListener('window:resize')
  onResize() {
    this.updateIndicator();
  }

  // Periodic check on click to ensure state is synchronized
  @HostListener('click')
  onClick() {
    setTimeout(() => this.updateIndicator(), 50);
  }

  updateIndicator() {
    if (!this.navMenu) return;
    const menuEl = this.navMenu.nativeElement;
    const activeEl = menuEl.querySelector('.nav-item-link.active');
    const indicatorEl = menuEl.querySelector('.nav-indicator');
    
    if (activeEl && indicatorEl) {
      const left = activeEl.offsetLeft;
      const width = activeEl.offsetWidth;
      
      // Only touch DOM if coords actually changed
      if (left !== this.lastLeft || width !== this.lastWidth) {
        this.lastLeft = left;
        this.lastWidth = width;
        indicatorEl.style.left = `${left}px`;
        indicatorEl.style.width = `${width}px`;
        indicatorEl.style.opacity = '1';
      }
    } else if (indicatorEl) {
      indicatorEl.style.opacity = '0';
      this.lastLeft = -1;
      this.lastWidth = -1;
    }
  }

  onHelpClick() {
    // TODO: Xử lý click help icon
    console.log('Help clicked');
  }

  onNotificationClick() {
    // TODO: Xử lý click notification icon
    console.log('Notification clicked');
  }

  onAvatarClick() {
    this.router.navigate(['/account']);
  }
}

