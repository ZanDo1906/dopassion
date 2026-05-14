import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

type SectionKey = 'report' | 'users' | 'users.staff' | 'courses' | 'interactions' | 'accounting' | string;

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  private readonly openSections: { [key: string]: boolean } = {};

  constructor(private readonly router: Router) { }

  ngOnInit(): void {
    // Auto-open sections based on current route
    this.autoOpenSectionsForCurrentRoute(this.router.url);
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
