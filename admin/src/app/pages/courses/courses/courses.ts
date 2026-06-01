import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Course } from '../../../services/course';
import { iCourse } from '../../../interfaces/course';
import { Class } from '../../../services/class';
import { iClass } from '../../../interfaces/class';
import { FilterDataPicker, FilterConfig } from '../../../components/filter-data-picker/filter-data-picker';
import { GridFormDialog } from '../../../components/form-dialog/form-dialog';
import { ConfirmDialog } from '../../../components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-courses',
  imports: [CommonModule, FilterDataPicker, GridFormDialog, ConfirmDialog],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses implements OnInit {
  courses: iCourse[] = [];
  classes: iClass[] = [];

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
  isConfirmOpen = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmText = '';
  confirmIcon = '';
  toggleItem: any = null;

  dialogMode: 'add' | 'edit' | 'view' = 'add';
  dialogTitle: string = 'Thêm khóa học';
  dialogData: any = {};
  dialogSections = [
    {
      title: 'Thông tin Khóa học',
      fields: [
        { label: 'Mã khóa học', name: 'maKhoaHoc', type: 'text', required: true, disabled: false },
        { label: 'Tên khóa học', name: 'tenKhoaHoc', type: 'text', required: true, disabled: false },
        { label: 'Học phí', name: 'hocPhi', type: 'number', required: true, disabled: false },
        { label: 'Mô tả', name: 'moTa', type: 'text', required: false, disabled: false }
      ]
    }
  ];

  constructor(
    private courseService: Course, 
    private classService: Class, 
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.courseService.getCourse().subscribe((data) => {
      this.courses = data;
      this.cdr.detectChanges();
    }, (error) => {
      console.error('Error loading courses:', error);
    });
    
    this.classService.getClasses().subscribe((data) => {
      this.classes = data;
    }, (error) => {
      console.error('Error loading classes:', error);
    });
  }

  get isViewMode(): boolean {
    return this.dialogMode === 'view';
  }

  openDialog() {
    this.dialogTitle = 'Thêm khóa học';
    this.dialogMode = 'add';
    const codeField = this.dialogSections[0].fields.find(f => f.name === 'maKhoaHoc');
    if (codeField) (codeField as any).disabled = false;
    this.dialogData = {};
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isDialogOpen = false;
    this.dialogMode = 'add';
  }

  onSubmitDialog(data: any) {
    if (this.dialogMode === 'view') {
      return;
    }

    if (this.dialogMode === 'add') {
      const payload: iCourse = {
        ...data,
        active: true
      };
      this.courseService.addCourse(payload).subscribe({
        next: (created) => {
          this.courses.push(created);
          this.courses = [...this.courses];
          this.isDialogOpen = false;
          this.cdr.detectChanges();
          alert('Thêm khóa học thành công!');
        },
        error: (err) => {
          console.error('Lỗi thêm khóa học:', err);
          alert('Lỗi thêm khóa học: ' + (err.error?.message || err.message));
        }
      });
      return;
    }

    if (this.dialogMode === 'edit') {
      const courseId = this.dialogData?._id || this.courses.find(c => c.maKhoaHoc === data.maKhoaHoc)?._id;
      if (!courseId) {
        console.error('Không tìm thấy _id để cập nhật khóa học');
        alert('Không tìm thấy ID khóa học để cập nhật.');
        return;
      }
      const existing = this.courses.find(c => c._id === courseId || c.maKhoaHoc === data.maKhoaHoc);
      const payload: Partial<iCourse> = {
        ...data,
        active: data.active ?? existing?.active ?? true
      };

      this.courseService.updateCourse(courseId, payload).subscribe({
        next: (updated) => {
          const idx = this.courses.findIndex(c => c._id === courseId || c.maKhoaHoc === updated.maKhoaHoc);
          if (idx !== -1) {
            this.courses[idx] = { ...this.courses[idx], ...updated };
            this.courses = [...this.courses];
          }
          this.isDialogOpen = false;
          this.cdr.detectChanges();
          alert('Cập nhật khóa học thành công!');
        },
        error: (err) => {
          console.error('Lỗi cập nhật khóa học:', err);
          alert('Lỗi cập nhật khóa học: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  toggleStatus(item: iCourse) {
    this.toggleItem = item;
    const isCurrentlyActive = item.active !== false;

    if (isCurrentlyActive) {
      // Trying to deactivate. Check if any classes are active.
      // Class mapping: class.maKhoaHoc or class.maKhoa usually stores the course's maKhoaHoc. Let's check maKhoa or tenKhoaHoc
      const activeClasses = this.classes.filter(c => c.active !== false && (c.maKhoa === item.maKhoaHoc || c.tenKhoaHoc === item.tenKhoaHoc));
      
      if (activeClasses.length > 0) {
        alert(`Không thể ngưng hoạt động khóa học này vì đang có ${activeClasses.length} lớp học hoạt động thuộc khóa này. Vui lòng ngưng hoạt động các lớp học đó trước.`);
        this.toggleItem = null;
        return;
      }
    }

    this.confirmTitle = isCurrentlyActive ? 'Khóa khóa học' : 'Mở khóa khóa học';
    this.confirmMessage = isCurrentlyActive ? `Bạn có chắc chắn muốn ngưng hoạt động khóa học ${item.tenKhoaHoc}?` : `Bạn có chắc chắn muốn mở lại khóa học ${item.tenKhoaHoc}?`;
    this.confirmText = isCurrentlyActive ? 'Ngưng hoạt động' : 'Mở hoạt động';
    this.confirmIcon = isCurrentlyActive ? 'bi bi-lock-fill' : 'bi bi-unlock-fill';
    this.isConfirmOpen = true;
  }

  confirmSubmit() {
    if (!this.toggleItem) return;
    const courseId = this.toggleItem._id;
    if (!courseId) return;

    const newStatus = this.toggleItem.active === false ? true : false;
    this.courseService.updateCourse(courseId, { active: newStatus }).subscribe({
      next: (updated) => {
        const idx = this.courses.findIndex(c => c._id === courseId);
        if (idx !== -1) {
          this.courses[idx].active = newStatus;
          this.courses = [...this.courses];
        }
        this.isConfirmOpen = false;
        this.toggleItem = null;
        this.cdr.detectChanges();
        alert(`Đã ${newStatus ? 'mở' : 'ngưng'} hoạt động khóa học thành công!`);
      },
      error: (err) => {
        console.error('Lỗi cập nhật trạng thái khóa học:', err);
        alert('Lỗi cập nhật trạng thái khóa học: ' + (err.error?.message || err.message));
      }
    });
  }

  cancelConfirm() {
    this.isConfirmOpen = false;
    this.toggleItem = null;
  }

  openEdit(item: iCourse) {
    this.dialogTitle = 'Sửa khóa học';
    this.dialogMode = 'edit';
    const codeField = this.dialogSections[0].fields.find(f => f.name === 'maKhoaHoc');
    if (codeField) (codeField as any).disabled = true;
    this.dialogData = { ...item };
    this.isDialogOpen = true;
  }

  openView(item: iCourse) {
    this.dialogTitle = 'Xem khóa học';
    this.dialogMode = 'view';
    const codeField = this.dialogSections[0].fields.find(f => f.name === 'maKhoaHoc');
    if (codeField) (codeField as any).disabled = true;
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
