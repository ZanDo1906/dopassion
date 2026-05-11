import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-classes',
  imports: [CommonModule],
  templateUrl: './classes.html',
  styleUrl: './classes.css',
})
export class Classes {
  selectedCourse = '';
  selectedBranch = '';
  startDate = '2026-01-01';
  endDate = '2026-01-31';
  courses: any[] = [];
  
  allCourses = [
    { id: 1, type: 'LR', branch: 'Hà Nội', startDate: '2026-01-10', title: 'LR - 01 (Listening & Reading)', schedule: '17h30 - T3, T4, T6', lessons: '24 buổi', hasTest: true },
    { id: 2, type: 'LR', branch: 'TP. HCM', startDate: '2026-01-12', title: 'LR - 02 (Listening & Reading)', schedule: '18h00 - T2, T4, T6', lessons: '24 buổi', hasTest: true },
    { id: 3, type: 'LR', branch: 'Đà Nẵng', startDate: '2026-01-15', title: 'LR - 03 (Listening & Reading)', schedule: '19h00 - T3, T5, T7', lessons: '24 buổi', hasTest: false },
    { id: 4, type: 'LR', branch: 'Hà Nội', startDate: '2026-01-18', title: 'LR - 04 (Listening & Reading)', schedule: '20h00 - T2, T5', lessons: '24 buổi', hasTest: true },
    { id: 5, type: 'LR', branch: 'TP. HCM', startDate: '2026-01-22', title: 'LR - 05 (Listening & Reading)', schedule: '17h00 - T3, T5, T7', lessons: '24 buổi', hasTest: false },
    { id: 6, type: 'LR', branch: 'Đà Nẵng', startDate: '2026-01-25', title: 'LR - 06 (Listening & Reading)', schedule: '18h30 - T2, T4, T6', lessons: '24 buổi', hasTest: true },
    { id: 7, type: 'SW', branch: 'Hà Nội', startDate: '2026-01-08', title: 'SW - 01 (Speaking & Writing)', schedule: '17h30 - T3, T4, T6', lessons: '20 buổi', hasTest: true },
    { id: 8, type: 'SW', branch: 'TP. HCM', startDate: '2026-01-20', title: 'SW - 02 (Speaking & Writing)', schedule: '18h00 - T2, T4, T6', lessons: '20 buổi', hasTest: false },
    { id: 9, type: 'SW', branch: 'Đà Nẵng', startDate: '2026-01-05', title: 'SW - 03 (Speaking & Writing)', schedule: '19h00 - T3, T5, T7', lessons: '20 buổi', hasTest: true },
    { id: 10, type: 'SW', branch: 'Hà Nội', startDate: '2026-01-16', title: 'SW - 04 (Speaking & Writing)', schedule: '20h00 - T2, T5', lessons: '20 buổi', hasTest: true },
    { id: 11, type: 'SW', branch: 'TP. HCM', startDate: '2026-01-19', title: 'SW - 05 (Speaking & Writing)', schedule: '17h00 - T3, T5, T7', lessons: '20 buổi', hasTest: false },
    { id: 12, type: 'SW', branch: 'Đà Nẵng', startDate: '2026-01-28', title: 'SW - 06 (Speaking & Writing)', schedule: '18h30 - T2, T4, T6', lessons: '20 buổi', hasTest: true },
    { id: 13, type: 'LR', branch: 'Hà Nội', startDate: '2026-02-01', title: 'LR - 07 (Listening & Reading)', schedule: '17h30 - T3, T4, T6', lessons: '24 buổi', hasTest: true },
    { id: 14, type: 'LR', branch: 'TP. HCM', startDate: '2026-02-05', title: 'LR - 08 (Listening & Reading)', schedule: '18h00 - T2, T4, T6', lessons: '24 buổi', hasTest: false },
    { id: 15, type: 'SW', branch: 'Đà Nẵng', startDate: '2026-02-03', title: 'SW - 07 (Speaking & Writing)', schedule: '19h00 - T3, T5, T7', lessons: '20 buổi', hasTest: true },
    { id: 16, type: 'SW', branch: 'Hà Nội', startDate: '2026-02-08', title: 'SW - 08 (Speaking & Writing)', schedule: '20h00 - T2, T5', lessons: '20 buổi', hasTest: true }
  ];
  
  constructor() {
    this.courses = this.allCourses;
  }
  
  filterByCourse(event: any) {
    this.selectedCourse = event.target.value;
  }
  
  filterByBranch(event: any) {
    this.selectedBranch = event.target.value;
  }
  
  filterByDate(type: 'start' | 'end', event: any) {
    if (type === 'start') {
      this.startDate = event.target.value;
    } else {
      this.endDate = event.target.value;
    }
  }

  formatDate(date: string): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  onSearch() {
    this.courses = this.allCourses.filter(course => {
      const matchCourse = !this.selectedCourse || course.type === this.selectedCourse;
      const matchBranch = !this.selectedBranch || course.branch === this.selectedBranch;
      const courseDate = new Date(course.startDate);
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      const matchDate = courseDate >= start && courseDate <= end;
      return matchCourse && matchBranch && matchDate;
    });
  }
}
