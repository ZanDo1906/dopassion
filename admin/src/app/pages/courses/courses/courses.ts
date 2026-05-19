import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Course } from '../../../services/course';
import { iCourse } from '../../../interfaces/course';
import { FilterDataPicker, FilterConfig } from '../../../components/filter-data-picker/filter-data-picker';
import { GridFormDialog } from '../../../components/form-dialog/form-dialog';

@Component({
  selector: 'app-courses',
  imports: [CommonModule, FilterDataPicker, GridFormDialog],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses implements OnInit {
  courses: iCourse[] = [];

  filterValues: Record<string, any> = {};
  filterConfig: FilterConfig[] = [
    {
      key: 'courseSearch',
      label: 'Mã khóa học / Tên khóa học',
      type: 'text'
    }
  ];

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  pageSizeOptions = [10, 20, 50];

  isDialogOpen = false;
  dialogData: any = {};
  dialogSections = [
    {
      title: 'Thông tin Khóa học',
      fields: [
        { label: 'Mã khóa học', name: 'maKhoaHoc', type: 'text', required: true },
        { label: 'Tên khóa học', name: 'tenKhoaHoc', type: 'text', required: true },
        { label: 'Học phí', name: 'hocPhi', type: 'number', required: true },
        { label: 'Mô tả', name: 'moTa', type: 'text', required: false }
      ]
    }
  ];

  constructor(private courseService: Course, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.courseService.getCourse().subscribe((data) => {
      this.courses = data;
      this.cdr.detectChanges();
      console.log('Courses loaded:', this.courses.length, this.courses);
    }, (error) => {
      console.error('Error loading courses:', error);
    });
  }

  openDialog() {
    this.dialogData = {};
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isDialogOpen = false;
  }

  onSubmitDialog(data: any) {
    // If a course with same Mã khóa học exists, update it; otherwise add new
    const code = data && data.maKhoaHoc;
    if (code) {
      const idx = this.courses.findIndex(c => c.maKhoaHoc === code);
      if (idx !== -1) {
        this.courses[idx] = { ...this.courses[idx], ...data };
      } else {
        this.courses.push(data);
      }
    }
    this.isDialogOpen = false;
    this.cdr.detectChanges();
  }

  openEdit(item: iCourse) {
    // Prefill dialogData with a shallow copy of the item
    this.dialogData = { ...item };
    this.isDialogOpen = true;
  }

  handleFilterSearch(filters: Record<string, any>) {
    this.filterValues = { ...filters };
    this.currentPage = 1;
  }

  handleFilterReset() {
    this.filterValues = {};
    this.currentPage = 1;
  }

  private matchesText(value: string, query: string): boolean {
    if (!query) {
      return true;
    }
    return value.toLowerCase().includes(query.toLowerCase());
  }

  get filteredCourses() {
    const filters = this.filterValues || {};
    const courseSearch = `${filters['courseSearch'] || ''}`.trim().toLowerCase();
    return this.courses.filter((item) => {
      if (
        courseSearch &&
        ![
          item.maKhoaHoc,
          item.tenKhoaHoc
        ].some((value) => this.matchesText(`${value ?? ''}`, courseSearch))
      ) {
        return false;
      }
      return true;
    });
  }

  get paginatedCourses() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCourses.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get pages() {
    const totalPages = Math.ceil(this.filteredCourses.length / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.pages.length) {
      this.currentPage = page;
    }
  }

  changePageSize(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage = Number(target.value);
    this.currentPage = 1;
  }
}
