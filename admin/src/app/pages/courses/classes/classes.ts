import { Component, OnInit, DoCheck } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Class } from '../../../services/class';
import { iClass } from '../../../interfaces/class';
import { Staff } from '../../../services/staff';
import { iStaff } from '../../../interfaces/staff';
import { GridFormDialog } from '../../../components/form-dialog/form-dialog';
import { ConfirmDialog } from '../../../components/confirm-dialog/confirm-dialog';
import { FilterDataPicker, FilterConfig } from '../../../components/filter-data-picker/filter-data-picker';

@Component({
  selector: 'app-classes',
  imports: [CommonModule, GridFormDialog, FilterDataPicker, ConfirmDialog],
  templateUrl: './classes.html',
  styleUrl: './classes.css',
})
export class Classes implements OnInit, DoCheck {
  classes: iClass[] = [];
  staffs: iStaff[] = [];
  lastBranch: string = '';

  filterValues: Record<string, any> = {};
  filterConfig: FilterConfig[] = [
    {
      key: 'classCourseSearch',
      label: 'Mã lớp / Tên lớp / Mã khóa / Tên khóa học',
      type: 'text'
    },
    {
      key: 'Chi nhánh',
      label: 'Chi nhánh',
      type: 'select',
      options: [
        { value: 'CN1', label: 'CN1' },
        { value: 'CN2', label: 'CN2' },
        { value: 'CN3', label: 'CN3' }
      ]
    },
    {
      key: 'Giảng viên',
      label: 'Giảng viên',
      type: 'select',
      options: []
    },
    {
      key: 'Khung giờ',
      label: 'Khung giờ',
      type: 'select',
      options: [
        { value: '17h45-19h15 (T2-4-6)', label: '17h45-19h15 (T2-4-6)' },
        { value: '19h30-21h00 (T2-4-6)', label: '19h30-21h00 (T2-4-6)' },
        { value: '17h45-19h15 (T3-5-7)', label: '17h45-19h15 (T3-5-7)' },
        { value: '19h30-21h00 (T3-5-7)', label: '19h30-21h00 (T3-5-7)' }
      ]
    },
    { key: 'Ngày bắt đầu', label: 'Ngày bắt đầu', type: 'date' },
    { key: 'Ngày kết thúc', label: 'Ngày kết thúc', type: 'date' }
  ];

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  pageSizeOptions = [10, 20, 50];

  isDialogOpen = false;
  dialogMode: 'add' | 'edit' | 'view' = 'add';
  isConfirmOpen = false;
  pendingSubmitData: any = null;
  dialogData: any = {};
  dialogTitle: string = 'Thêm lớp học';
  dialogSections = [
    {
      title: 'I. Thông tin Khóa học',
      fields: [
        { label: 'Mã lớp', name: 'maLop', type: 'text', disabled: true },
        { label: 'Tên lớp', name: 'tenLop', type: 'text', disabled: true },
        {
          label: 'Khung giờ',
          name: 'khungGio',
          type: 'select',
          required: true,
          options: [
            { label: 'Chọn khung giờ...', value: '' },
            { label: '17h45-19h15 (T2-4-6)', value: '17h45-19h15 (T2-4-6)' },
            { label: '19h30-21h00 (T2-4-6)', value: '19h30-21h00 (T2-4-6)' },
            { label: '17h45-19h15 (T3-5-7)', value: '17h45-19h15 (T3-5-7)' },
            { label: '19h30-21h00 (T3-5-7)', value: '19h30-21h00 (T3-5-7)' }
          ]
        },
        { label: 'Ngày bắt đầu', name: 'ngayBatDau', type: 'date', required: true },
        { label: 'Ngày kết thúc', name: 'ngayKetThuc', type: 'date', required: true },
        {
          label: 'Mã khóa',
          name: 'maKhoa',
          type: 'text',
          disabled: true
        },
        {
          label: 'Tên khóa học',
          name: 'tenKhoaHoc',
          type: 'select',
          required: true,
          options: [
            { label: 'Chọn khóa học...', value: '' },
            { label: 'Khóa học TOEIC Speaking và Writing', value: 'Khóa học TOEIC Speaking và Writing' },
            { label: 'Khóa học TOEIC Listening và Reading', value: 'Khóa học TOEIC Listening và Reading' }
          ]
        },
        { label: 'STT', name: 'stt', type: 'number', disabled: true }
      ]
    },
    {
      title: 'II. Thông tin Giáo viên',
      fields: [
        {
          label: 'Chi nhánh',
          name: 'chiNhanh',
          type: 'select',
          required: true,
          options: [
            { label: 'Chọn chi nhánh...', value: '' },
            { label: 'CN1', value: 'CN1' },
            { label: 'CN2', value: 'CN2' },
            { label: 'CN3', value: 'CN3' }
          ]
        },
        { label: 'Giảng viên', name: 'giangVien', type: 'select', required: true, options: [{ label: 'Chọn giảng viên...', value: '' }] },
        { label: 'Mã nhân viên', name: 'maNhanVien', type: 'text', disabled: true }
      ]
    }
  ];

  constructor(private classService: Class, private staffService: Staff) { }

  get isViewMode(): boolean {
    return this.dialogMode === 'view';
  }

  ngOnInit() {
    this.classService.getClasses().subscribe((data: iClass[]) => {
      this.classes = data;
    });
    this.staffService.getStaff().subscribe((data) => {
      this.staffs = data;
      this.updateTeacherOptions();
    });
  }

  ngDoCheck() {
    if (this.isDialogOpen && this.dialogData) {
      if (this.dialogMode === 'add') {
        // Đảo ngược logic: Dựa vào Tên khóa học để tính Mã khóa
        if (this.dialogData.tenKhoaHoc === 'Khóa học TOEIC Speaking và Writing' && this.dialogData.maKhoa !== 'SW') {
          this.dialogData.maKhoa = 'SW';
        } else if (this.dialogData.tenKhoaHoc === 'Khóa học TOEIC Listening và Reading' && this.dialogData.maKhoa !== 'LR') {
          this.dialogData.maKhoa = 'LR';
        } else if (!this.dialogData.tenKhoaHoc && this.dialogData.maKhoa) {
          this.dialogData.maKhoa = '';
        }

        const maKhoa = this.dialogData.maKhoa;
        const chiNhanh = this.dialogData.chiNhanh;

        if (maKhoa && chiNhanh) {
          let branchCode = '';
          if (chiNhanh === 'CN1') branchCode = '01';
          else if (chiNhanh === 'CN2') branchCode = '02';
          else if (chiNhanh === 'CN3') branchCode = '03';

          const filteredClasses = this.classes.filter(c => c.maKhoa === maKhoa && c.chiNhanh === chiNhanh);
          let maxSeq = 0;
          for (let c of filteredClasses) {
            const parts = c.maLop.split('-');
            if (parts.length === 3) {
              const seq = parseInt(parts[2], 10);
              if (seq > maxSeq) { maxSeq = seq; }
            }
          }
          const nextSeq = (maxSeq + 1).toString().padStart(3, '0');
          const expectedMaLop = `${maKhoa}-${branchCode}-${nextSeq}`;

          if (this.dialogData.maLop !== expectedMaLop) {
            this.dialogData.maLop = expectedMaLop;
          }

          let prefix = '';
          if (maKhoa === 'SW') prefix = 'Lớp TOEIC Speaking&Writing';
          else if (maKhoa === 'LR') prefix = 'Lớp TOEIC Listening&Reading';

          const expectedTenLop = `${prefix} ${chiNhanh}-${nextSeq}`;
          if (this.dialogData.tenLop !== expectedTenLop) {
            this.dialogData.tenLop = expectedTenLop;
          }

        } else {
          if (this.dialogData.maLop) {
            this.dialogData.maLop = '';
          }
          if (this.dialogData.tenLop) {
            this.dialogData.tenLop = '';
          }
        }
      }

      const maKhoa = this.dialogData.maKhoa;
      const chiNhanh = this.dialogData.chiNhanh;

      // Logic lọc Giáo viên
      if (chiNhanh !== this.lastBranch) {
        const previousBranch = this.lastBranch;
        this.lastBranch = chiNhanh || '';
        const giangVienField = this.dialogSections[1].fields.find(f => f.name === 'giangVien');
        if (giangVienField) {
          if (chiNhanh) {
            const filteredStaffs = this.staffs.filter(s => s.chiNhanh === chiNhanh && s.maVaiTro === 'INSTRUCTOR');
            giangVienField.options = [
              { label: 'Chọn giảng viên...', value: '' },
              ...filteredStaffs.map(s => ({ label: s.tenNhanVien, value: s.tenNhanVien }))
            ];
          } else {
            giangVienField.options = [{ label: 'Chọn giảng viên...', value: '' }];
          }
          if (this.dialogMode !== 'view' && previousBranch) {
            this.dialogData.giangVien = '';
            this.dialogData.maNhanVien = '';
          }
        }
      }

      // Cập nhật Mã nhân viên khi chọn Giảng viên
      if (this.dialogMode !== 'view') {
        if (this.dialogData.giangVien) {
          const selectedTeacher = this.staffs.find(s => s.tenNhanVien === this.dialogData.giangVien && s.chiNhanh === chiNhanh && s.maVaiTro === 'INSTRUCTOR');
          if (selectedTeacher && this.dialogData.maNhanVien !== selectedTeacher.maNv) {
            this.dialogData.maNhanVien = selectedTeacher.maNv;
          }
        } else {
          if (this.dialogData.maNhanVien) {
            this.dialogData.maNhanVien = '';
          }
        }
      }
    }
  }

  openDialog() {
    // Tự động tính thứ tự STT tiếp theo
    const nextStt = this.classes.length > 0 ? Math.max(...this.classes.map(c => c.stt)) + 1 : 1;
    // Ensure dialogData contains all fields defined in sections with defaults
    const data: any = { stt: nextStt };
    for (const section of this.dialogSections) {
      for (const field of section.fields) {
        if (!(field.name in data)) {
          const val = (field as any).value;
          data[field.name] = val !== undefined ? val : this.getDefaultForType(field.type);
        }
      }
    }
    this.dialogTitle = 'Thêm lớp học';
    this.dialogData = data;
    this.dialogMode = 'add';
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isDialogOpen = false;
    this.isConfirmOpen = false;
    this.pendingSubmitData = null;
    this.dialogMode = 'add';
  }

  onSubmitDialog(data: any) {
    if (this.dialogMode === 'view') {
      return;
    }
    this.pendingSubmitData = data;
    this.isConfirmOpen = true;
  }

  confirmSubmit() {
    const data = this.pendingSubmitData;
    if (!data) {
      this.isConfirmOpen = false;
      return;
    }

    // Update existing class if Mã lớp matches, otherwise add new
    const maLop = data && data.maLop;
    if (maLop) {
      const idx = this.classes.findIndex(c => c.maLop === maLop);
      if (idx !== -1) {
        this.classes[idx] = { ...this.classes[idx], ...data } as iClass;
      } else {
        this.classes.push(data as iClass);
      }
    }
    this.pendingSubmitData = null;
    this.isConfirmOpen = false;
    this.isDialogOpen = false;
  }

  cancelConfirm() {
    this.isConfirmOpen = false;
    this.pendingSubmitData = null;
  }

  openEdit(item: iClass) {
    // Prefill dialog with the selected class data and ensure all fields exist
    const data: any = { ...item };
    data.ngayBatDau = this.normalizeDate(item.ngayBatDau);
    data.ngayKetThuc = this.normalizeDate(item.ngayKetThuc);
    for (const section of this.dialogSections) {
      for (const field of section.fields) {
        if (!(field.name in data)) {
          const val = (field as any).value;
          data[field.name] = val !== undefined ? val : this.getDefaultForType(field.type);
        }
      }
    }
    this.dialogTitle = 'Sửa lớp học';
    this.dialogData = data;
    this.dialogMode = 'edit';
    this.isDialogOpen = true;
  }

  openView(item: iClass) {
    const data: any = { ...item };
    data.ngayBatDau = this.normalizeDate(item.ngayBatDau);
    data.ngayKetThuc = this.normalizeDate(item.ngayKetThuc);
    for (const section of this.dialogSections) {
      for (const field of section.fields) {
        if (!(field.name in data)) {
          const val = (field as any).value;
          data[field.name] = val !== undefined ? val : this.getDefaultForType(field.type);
        }
      }
    }
    this.dialogTitle = 'Xem lớp học';
    this.dialogData = data;
    this.dialogMode = 'view';
    this.isDialogOpen = true;
  }

  private getDefaultForType(fieldType: string): any {
    switch (fieldType) {
      case 'number': return 0;
      case 'date': return '';
      case 'select': return '';
      default: return '';
    }
  }

  handleFilterSearch(filters: Record<string, any>) {
    this.filterValues = { ...filters };
    this.currentPage = 1;
  }

  handleFilterReset() {
    this.filterValues = {};
    this.currentPage = 1;
  }

  private updateTeacherOptions() {
    const teacherField = this.filterConfig.find((field) => field.key === 'Giảng viên');
    if (!teacherField) {
      return;
    }
    const teacherNames = Array.from(
      new Set(this.staffs.filter((s) => s.maVaiTro === 'INSTRUCTOR').map((s) => s.tenNhanVien))
    );
    teacherField.options = teacherNames.map((name) => ({ value: name, label: name }));
  }


  private normalizeDate(value: any): string {
    if (!value) {
      return '';
    }
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value.toISOString().slice(0, 10);
    }
    if (typeof value === 'string') {
      return value.slice(0, 10);
    }
    return '';
  }

  private matchesText(value: string, query: string): boolean {
    if (!query) {
      return true;
    }
    return value.toLowerCase().includes(query.toLowerCase());
  }

  get filteredClasses() {
    const filters = this.filterValues || {};
    const classCourseSearch = `${filters['classCourseSearch'] || ''}`.trim().toLowerCase();
    return this.classes.filter((item) => {
      if (
        classCourseSearch &&
        ![
          item.maLop,
          item.tenLop,
          item.maKhoa,
          item.tenKhoaHoc
        ].some((value) => this.matchesText(`${value ?? ''}`, classCourseSearch))
      ) {
        return false;
      }
      if (filters['Chi nhánh'] && item.chiNhanh !== filters['Chi nhánh']) {
        return false;
      }
      if (filters['Giảng viên'] && item.giangVien !== filters['Giảng viên']) {
        return false;
      }
      if (filters['Khung giờ'] && item.khungGio !== filters['Khung giờ']) {
        return false;
      }
      if (filters['Ngày bắt đầu'] && this.normalizeDate(item.ngayBatDau) !== filters['Ngày bắt đầu']) {
        return false;
      }
      if (filters['Ngày kết thúc'] && this.normalizeDate(item.ngayKetThuc) !== filters['Ngày kết thúc']) {
        return false;
      }
      return true;
    });
  }

  get paginatedClasses() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredClasses.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get pages() {
    const totalPages = Math.ceil(this.filteredClasses.length / this.itemsPerPage);
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
