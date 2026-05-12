import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type SectionKey = 'report' | 'users' | 'courses' | 'interactions' | 'accounting';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private readonly openSections = new Set<SectionKey>();

  toggleSection(section: SectionKey): void {
    if (this.openSections.has(section)) {
      this.openSections.delete(section);
    } else {
      this.openSections.add(section);
    }
  }

  isOpen(section: SectionKey): boolean {
    return this.openSections.has(section);
  }

}
