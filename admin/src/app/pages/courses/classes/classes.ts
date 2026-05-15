import { Component, OnInit, DoCheck } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Class } from '../../../services/class';
import { iClass } from '../../../interfaces/class';
import { Staff } from '../../../services/staff';
import { iStaff } from '../../../interfaces/staff';
import { GridFormDialog } from '../../../components/form-dialog/form-dialog';
import { FilterDataPicker, FilterConfig } from '../../../components/filter-data-picker/filter-data-picker';

@Component({
  selector: 'app-classes',
  imports: [CommonModule, GridFormDialog, FilterDataPicker],
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
  dialogData: any = {};
  dialogSections = [
    {
      title: 'I. Thông tin Khóa học',
      fields: [
        { label: 'Mã lớp', name: 'Mã lớp', type: 'text', disabled: true },
        { label: 'Tên lớp', name: 'Tên lớp', type: 'text', disabled: true },
        {
          label: 'Khung giờ',
          name: 'Khung giờ',
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
        { label: 'Ngày bắt đầu', name: 'Ngày bắt đầu', type: 'date', required: true },
        { label: 'Ngày kết thúc', name: 'Ngày kết thúc', type: 'date', required: true },
        {
          label: 'Mã khóa',
          name: 'Mã khóa',
          type: 'text',
          disabled: true
        },
        {
          label: 'Tên khóa học',
          name: 'Tên khóa học',
          type: 'select',
          required: true,
          options: [
            { label: 'Chọn khóa học...', value: '' },
            { label: 'Khóa học TOEIC Speaking và Writing', value: 'Khóa học TOEIC Speaking và Writing' },
            { label: 'Khóa học TOEIC Listening và Reading', value: 'Khóa học TOEIC Listening và Reading' }
          ]
        },
        { label: 'STT', name: 'STT', type: 'number', disabled: true }
      ]
    },
    {
      title: 'II. Thông tin Giáo viên',
      fields: [
        {
          label: 'Chi nhánh',
          name: 'Chi nhánh',
          type: 'select',
          required: true,
          options: [
            { label: 'Chọn chi nhánh...', value: '' },
            { label: 'CN1', value: 'CN1' },
            { label: 'CN2', value: 'CN2' },
            { label: 'CN3', value: 'CN3' }
          ]
        },
        { label: 'Giảng viên', name: 'Giảng viên', type: 'select', required: true, options: [{ label: 'Chọn giảng viên...', value: '' }] },
        { label: 'Mã nhân viên', name: 'Mã nhân viên', type: 'text', disabled: true }
      ]
    }
  ];

  constructor(private classService: Class, private staffService: Staff) { }

  ngOnInit() {
    this.classService.getClass().subscribe((data) => {
      this.classes = data;
    });
    this.staffService.getStaff().subscribe((data) => {
      this.staffs = data;
      this.updateTeacherOptions();
    });
  }

  ngDoCheck() {
    if (this.isDialogOpen && this.dialogData) {
      // Đảo ngược logic: Dựa vào Tên khóa học để tính Mã khóa
      if (this.dialogData['Tên khóa học'] === 'Khóa học TOEIC Speaking và Writing' && this.dialogData['Mã khóa'] !== 'SW') {
        this.dialogData['Mã khóa'] = 'SW';
      } else if (this.dialogData['Tên khóa học'] === 'Khóa học TOEIC Listening và Reading' && this.dialogData['Mã khóa'] !== 'LR') {
        this.dialogData['Mã khóa'] = 'LR';
      } else if (!this.dialogData['Tên khóa học'] && this.dialogData['Mã khóa']) {
        this.dialogData['Mã khóa'] = '';
      }

      const maKhoa = this.dialogData['Mã khóa'];
      const chiNhanh = this.dialogData['Chi nhánh'];

      if (maKhoa && chiNhanh) {
        let branchCode = '';
        if (chiNhanh === 'CN1') branchCode = '01';
        else if (chiNhanh === 'CN2') branchCode = '02';
        else if (chiNhanh === 'CN3') branchCode = '03';

        const filteredClasses = this.classes.filter(c => c['Mã khóa'] === maKhoa && c['Chi nhánh'] === chiNhanh);
        let maxSeq = 0;
        for (let c of filteredClasses) {
          const parts = c['Mã lớp'].split('-');
          if (parts.length === 3) {
            const seq = parseInt(parts[2], 10);
            if (seq > maxSeq) { maxSeq = seq; }
          }
        }
        const nextSeq = (maxSeq + 1).toString().padStart(3, '0');
        const expectedMaLop = `${maKhoa}-${branchCode}-${nextSeq}`;

        if (this.dialogData['Mã lớp'] !== expectedMaLop) {
          this.dialogData['Mã lớp'] = expectedMaLop;
        }

        let prefix = '';
        if (maKhoa === 'SW') prefix = 'Lớp TOEIC Speaking&Writing';
        else if (maKhoa === 'LR') prefix = 'Lớp TOEIC Listening&Reading';

        const expectedTenLop = `${prefix} ${chiNhanh}-${nextSeq}`;
        if (this.dialogData['Tên lớp'] !== expectedTenLop) {
          this.dialogData['Tên lớp'] = expectedTenLop;
        }

      } else {
        if (this.dialogData['Mã lớp']) {
          this.dialogData['Mã lớp'] = '';
        }
        if (this.dialogData['Tên lớp']) {
          this.dialogData['Tên lớp'] = '';
        }
      }

      // Logic lọc Giáo viên
      if (chiNhanh !== this.lastBranch) {
        this.lastBranch = chiNhanh || '';
        const giangVienField = this.dialogSections[1].fields.find(f => f.name === 'Giảng viên');
        if (giangVienField) {
          if (chiNhanh) {
            const filteredStaffs = this.staffs.filter(s => s['Chi nhánh'] === chiNhanh && s['Mã vai trò'] === 'INSTRUCTOR');
            giangVienField.options = [
              { label: 'Chọn giảng viên...', value: '' },
              ...filteredStaffs.map(s => ({ label: s['Tên nhân viên'], value: s['Tên nhân viên'] }))
            ];
          } else {
            giangVienField.options = [{ label: 'Chọn giảng viên...', value: '' }];
          }
          this.dialogData['Giảng viên'] = '';
          this.dialogData['Mã nhân viên'] = '';
        }
      }

      // Cập nhật Mã nhân viên khi chọn Giảng viên
      if (this.dialogData['Giảng viên']) {
        const selectedTeacher = this.staffs.find(s => s['Tên nhân viên'] === this.dialogData['Giảng viên'] && s['Chi nhánh'] === chiNhanh && s['Mã vai trò'] === 'INSTRUCTOR');
        if (selectedTeacher && this.dialogData['Mã nhân viên'] !== selectedTeacher['Mã NV']) {
          this.dialogData['Mã nhân viên'] = selectedTeacher['Mã NV'];
        }
      } else {
        if (this.dialogData['Mã nhân viên']) {
          this.dialogData['Mã nhân viên'] = '';
        }
      }
    }
  }

  openDialog() {
    // Tự động tính thứ tự STT tiếp theo
    const nextStt = this.classes.length > 0 ? Math.max(...this.classes.map(c => c.STT)) + 1 : 1;
    this.dialogData = { STT: nextStt, 'Tên khóa học': '' };
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isDialogOpen = false;
  }

  onSubmitDialog(data: any) {
    console.log('Dữ liệu lớp học được thêm:', data);
    this.isDialogOpen = false;
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
      new Set(this.staffs.filter((s) => s['Mã vai trò'] === 'INSTRUCTOR').map((s) => s['Tên nhân viên']))
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
          item['Mã lớp'],
          item['Tên lớp'],
          item['Mã khóa'],
          item['Tên khóa học']
        ].some((value) => this.matchesText(`${value ?? ''}`, classCourseSearch))
      ) {
        return false;
      }
      if (filters['Chi nhánh'] && item['Chi nhánh'] !== filters['Chi nhánh']) {
        return false;
      }
      if (filters['Giảng viên'] && item['Giảng viên'] !== filters['Giảng viên']) {
        return false;
      }
      if (filters['Khung giờ'] && item['Khung giờ'] !== filters['Khung giờ']) {
        return false;
      }
      if (filters['Ngày bắt đầu'] && this.normalizeDate(item['Ngày bắt đầu']) !== filters['Ngày bắt đầu']) {
        return false;
      }
      if (filters['Ngày kết thúc'] && this.normalizeDate(item['Ngày kết thúc']) !== filters['Ngày kết thúc']) {
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
