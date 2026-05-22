import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';

type SectionKey = 'report' | 'users' | 'users.staff' | 'courses' | 'interactions' | 'accounting' | string;

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  private readonly openSections: { [key: string]: boolean } = {};

  currentUrl: string = '';

  constructor(private readonly router: Router) { }

  ngDoCheck(): void {
    this.currentUrl = this.router.url;
  }

  ngOnInit(): void {
    // Auto-open sections based on current route
    this.autoOpenSectionsForCurrentRoute(this.router.url);
    this.currentUrl = this.router.url;
  }
  // Kiểm tra section có active không dựa vào url hiện tại
  isSectionActive(section: string): boolean {
    // Xử lý đặc biệt cho các section có nhiều cấp
    if (section === 'users.staff') {
      return this.currentUrl.startsWith('/users/staff/');
    }
    if (section === 'users') {
      return this.currentUrl.startsWith('/users/');
    }
    if (section === 'courses') {
      return this.currentUrl.startsWith('/courses/');
    }
    if (section === 'report') {
      return this.currentUrl.startsWith('/report/');
    }
    if (section === 'interactions') {
      return this.currentUrl.startsWith('/interactions/');
    }
    if (section === 'accounting') {
      return this.currentUrl.startsWith('/accounting/');
    }
    if (section === 'setting') {
      return this.currentUrl.startsWith('/setting') || this.currentUrl.startsWith('/branch') || this.currentUrl.startsWith('/permissions');
    }
    return false;
  }

  toggleSection(section: SectionKey): void {
    if (this.openSections[section]) {
      this.openSections[section] = false;
    } else {
      this.openSections[section] = true;
      // Keep parent sections open when opening child sections
      if (section.includes('.')) {
        const parent = section.split('.')[0];
        this.openSections[parent] = true;
      }
    }
  }

  isOpen(section: SectionKey): boolean {
    return this.openSections[section] || false;
  }

  private autoOpenSectionsForCurrentRoute(url: string): void {
    const cleanUrl = url.split('?')[0].split('#')[0];

    // Map URLs to sections that should be open
    const sectionMap: Record<string, string[]> = {
      '/users/customer': ['users'],
      '/users/registration': ['users'],
      '/users/staff/role': ['users', 'users.staff'],
      '/users/staff/staff': ['users', 'users.staff'],
    };

    // Check if current URL needs sections to be open
    if (sectionMap[cleanUrl]) {
      sectionMap[cleanUrl].forEach(section => {
        this.openSections[section] = true;
      });
    }
  }

  logout(): void {
    this.router.navigate(['/login']);
  }

}
