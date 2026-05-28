import { Component, OnInit, DoCheck } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Class } from '../../../services/class';
import { iClass } from '../../../interfaces/class';
import { Staff } from '../../../services/staff';
import { iStaff } from '../../../interfaces/staff';
import { GridFormDialog } from '../../../components/form-dialog/form-dialog';
import { ConfirmDialog } from '../../../components/confirm-dialog/confirm-dialog';
import { FilterDataPicker, FilterConfig } from '../../../components/filter-data-picker/filter-data-picker';
import { ImportExcelDialog, ImportExcelColumn } from '../../../components/import-excel-dialog/import-excel-dialog';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-classes',
  imports: [CommonModule, GridFormDialog, FilterDataPicker, ConfirmDialog, ImportExcelDialog],
  templateUrl: './classes.html',
  styleUrl: './classes.css',
})
export class Classes implements OnInit, DoCheck {
  classes: iClass[] = [];
  staffs: iStaff[] = [];
  lastBranch: string = '';
  lastStaffCount = 0;

  // Import Excel
  showImportDialog = false;
  importColumns: ImportExcelColumn[] = [
    { header: 'Tên khóa học', key: 'tenKhoaHoc', example: 'Khóa học TOEIC Listening và Reading' },
    { header: 'Chi nhánh', key: 'chiNhanh', example: 'CN1' },
    { header: 'Giảng viên', key: 'giangVien', example: 'Nguyễn Văn A' },
    { header: 'Mã nhân viên', key: 'maNhanVien', example: 'NV001' },
    { header: 'Khung giờ', key: 'khungGio', example: '17h45-19h15 (T2-4-6)' },
    { header: 'Ngày bắt đầu', key: 'ngayBatDau', example: '2025-06-01' },
    { header: 'Ngày kết thúc', key: 'ngayKetThuc', example: '2025-08-30' },
  ];

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
        }
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

      if (this.staffs.length !== this.lastStaffCount) {
        this.lastStaffCount = this.staffs.length;
        this.lastBranch = '';
      }

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

          const teacherByCode = this.dialogData.maNhanVien
            ? this.staffs.find(s => s.maNv === this.dialogData.maNhanVien)
            : null;
          if (teacherByCode && (!this.dialogData.giangVien || this.dialogData.giangVien !== teacherByCode.tenNhanVien)) {
            this.dialogData.giangVien = teacherByCode.tenNhanVien;
          }

          const currentTeacher = `${this.dialogData.giangVien || ''}`.trim();
          if (currentTeacher && !giangVienField.options.some((opt: any) => opt.value === currentTeacher)) {
            giangVienField.options = [
              { label: currentTeacher, value: currentTeacher },
              ...giangVienField.options
            ];
          }

          if (this.dialogMode === 'add' && previousBranch) {
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

    // Enable tenKhoaHoc and chiNhanh for add mode
    const courseField = this.dialogSections[0].fields.find(f => f.name === 'tenKhoaHoc');
    if (courseField) courseField.disabled = false;
    const branchField = this.dialogSections[1].fields.find(f => f.name === 'chiNhanh');
    if (branchField) branchField.disabled = false;

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
    this.pendingSubmitData = { ...data, _id: this.dialogData?._id };
    this.confirmSubmit();
  }

  confirmSubmit() {
    const data = this.pendingSubmitData;
    if (!data) {
      this.isConfirmOpen = false;
      return;
    }

    if (this.dialogMode === 'edit') {
      const classId = this.resolveClassId(data);
      if (!classId) {
        console.error('Không tìm thấy _id để cập nhật lớp học');
        alert('Không tìm thấy ID lớp học để cập nhật.');
        return;
      }
      const existing = this.classes.find(c => c._id === classId || c.maLop === data.maLop);
      const payload: Partial<iClass> = {
        ...data,
        active: data.active ?? existing?.active
      };

      this.classService.updateClass(classId, payload).subscribe({
        next: (updated) => {
          const idx = this.classes.findIndex(c => c._id === classId || c.maLop === updated.maLop);
          if (idx !== -1) {
            this.classes[idx] = { ...this.classes[idx], ...updated } as iClass;
            this.classes = [...this.classes];
          }
          this.pendingSubmitData = null;
          this.isConfirmOpen = false;
          this.isDialogOpen = false;
          alert('Cập nhật lớp học thành công!');
        },
        error: (err) => {
          console.error('Lỗi cập nhật lớp học:', err);
          alert('Lỗi cập nhật lớp học: ' + (err.error?.message || err.message));
        }
      });
      return;
    }

    const payload = {
      ...data,
      active: true
    };

    this.classService.addClass(payload as iClass).subscribe({
      next: (created) => {
        this.classes.push(created as iClass);
        this.classes = [...this.classes];
        this.pendingSubmitData = null;
        this.isConfirmOpen = false;
        this.isDialogOpen = false;
        alert('Thêm lớp học thành công!');
      },
      error: (err) => {
        console.error('Lỗi thêm lớp học:', err);
        alert('Lỗi thêm lớp học: ' + (err.error?.message || err.message));
      }
    });
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

    // Disable tenKhoaHoc and chiNhanh for edit mode
    const courseField = this.dialogSections[0].fields.find(f => f.name === 'tenKhoaHoc');
    if (courseField) courseField.disabled = true;
    const branchField = this.dialogSections[1].fields.find(f => f.name === 'chiNhanh');
    if (branchField) branchField.disabled = true;

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

  private resolveClassId(data: any): string | null {
    if (data?._id) {
      return data._id;
    }
    if (data?.maLop) {
      const found = this.classes.find(c => c.maLop === data.maLop);
      return found?._id ?? null;
    }
    return null;
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

  exportExcel() {
    const data = this.filteredClasses;
    if (!data || data.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    // Map all fields from the detail view (dialogSections)
    const excelData = data.map((item: iClass, index: number) => ({
      'STT': item.stt ?? (index + 1),
      'Mã lớp': item.maLop ?? '',
      'Tên lớp': item.tenLop ?? '',
      'Mã khóa': item.maKhoa ?? '',
      'Tên khóa học': item.tenKhoaHoc ?? '',
      'Chi nhánh': item.chiNhanh ?? '',
      'Giảng viên': item.giangVien ?? '',
      'Mã nhân viên': item.maNhanVien ?? '',
      'Khung giờ': item.khungGio ?? '',
      'Ngày bắt đầu': item.ngayBatDau ? this.normalizeDate(item.ngayBatDau) : '',
      'Ngày kết thúc': item.ngayKetThuc ? this.normalizeDate(item.ngayKetThuc) : '',
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

    // Auto-fit column widths
    const headers = Object.keys(excelData[0]);
    worksheet['!cols'] = headers.map(key => {
      const maxLen = Math.max(
        key.length,
        ...excelData.map(row => `${(row as any)[key] ?? ''}`.length)
      );
      return { wch: maxLen + 2 };
    });

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách lớp học');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, `DanhSachLopHoc_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  openImportDialog(): void {
    this.showImportDialog = true;
  }

  closeImportDialog(): void {
    this.showImportDialog = false;
  }

  onImportExcel(data: any[]): void {
    if (!data || data.length === 0) {
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    data.forEach((row, index) => {
      // Determine maKhoa from tenKhoaHoc
      let maKhoa = '';
      const tenKhoaHoc = `${row.tenKhoaHoc ?? ''}`.trim();
      if (tenKhoaHoc.includes('Speaking') && tenKhoaHoc.includes('Writing')) {
        maKhoa = 'SW';
      } else if (tenKhoaHoc.includes('Listening') && tenKhoaHoc.includes('Reading')) {
        maKhoa = 'LR';
      }

      const chiNhanh = `${row.chiNhanh ?? ''}`.trim();
      let branchCode = '';
      if (chiNhanh === 'CN1') branchCode = '01';
      else if (chiNhanh === 'CN2') branchCode = '02';
      else if (chiNhanh === 'CN3') branchCode = '03';

      // Auto-generate maLop and tenLop
      const filteredClasses = this.classes.filter(c => c.maKhoa === maKhoa && c.chiNhanh === chiNhanh);
      let maxSeq = 0;
      for (const c of filteredClasses) {
        const parts = c.maLop.split('-');
        if (parts.length === 3) {
          const seq = parseInt(parts[2], 10);
          if (seq > maxSeq) maxSeq = seq;
        }
      }
      const nextSeq = (maxSeq + index + 1).toString().padStart(3, '0');
      const maLop = maKhoa && branchCode ? `${maKhoa}-${branchCode}-${nextSeq}` : '';

      let tenLop = '';
      if (maKhoa === 'SW') tenLop = `Lớp TOEIC Speaking&Writing ${chiNhanh}-${nextSeq}`;
      else if (maKhoa === 'LR') tenLop = `Lớp TOEIC Listening&Reading ${chiNhanh}-${nextSeq}`;

      const nextStt = this.classes.length + index + 1;

      const payload: any = {
        stt: nextStt,
        maLop,
        tenLop,
        maKhoa,
        tenKhoaHoc,
        chiNhanh,
        giangVien: `${row.giangVien ?? ''}`.trim(),
        maNhanVien: `${row.maNhanVien ?? ''}`.trim(),
        khungGio: `${row.khungGio ?? ''}`.trim(),
        ngayBatDau: `${row.ngayBatDau ?? ''}`.trim(),
        ngayKetThuc: `${row.ngayKetThuc ?? ''}`.trim(),
        active: true
      };

      this.classService.addClass(payload as iClass).subscribe({
        next: (created) => {
          successCount++;
          this.classes.push(created as iClass);
          if (successCount + errorCount === data.length) {
            this.classes = [...this.classes];
            alert(`Nhập thành công ${successCount}/${data.length} lớp học.`);
            this.showImportDialog = false;
          }
        },
        error: (err) => {
          errorCount++;
          console.error(`Lỗi nhập lớp dòng ${index + 1}:`, err);
          if (successCount + errorCount === data.length) {
            this.classes = [...this.classes];
            alert(`Nhập thành công ${successCount}/${data.length} lớp học. Lỗi: ${errorCount} dòng.`);
            this.showImportDialog = false;
          }
        }
      });
    });
  }
}
