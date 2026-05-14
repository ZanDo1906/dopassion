import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FilterDataPicker, FilterConfig } from '../../../../components/filter-data-picker/filter-data-picker';
import { PaginationComponent } from '../../../../components/pagination/pagination';
import { FormDialogComponent } from '../../../../components/form-dialog/form-dialog';
import { Staff as StaffService } from '../../../../services/staff';
@Component({
  selector: 'app-staff',
  imports: [CommonModule, ReactiveFormsModule, FilterDataPicker, PaginationComponent, FormDialogComponent],
  templateUrl: './staff.html',
  styleUrl: './staff.css',
})
export class Staff implements OnInit {
  /**
   * Cấu hình bộ lọc - Truyền vào FilterDataPickerComponent
   * Định nghĩa các trường có thể filter
   */
  filterConfig: FilterConfig[] = [
    {
      key: 'maNhanVien',
      label: 'Mã nhân viên',
      type: 'text'
    },
    {
      key: 'tenNhanVien',
      label: 'Tên nhân viên',
      type: 'text'
    },
    {
      key: 'gioiTinh',
      label: 'Giới tính',
      type: 'select',
      options: [
        { value: 'Nam', label: 'Nam' },
        { value: 'Nữ', label: 'Nữ' },
        { value: 'Khác', label: 'Khác' }
      ]
    },
    {
      key: 'chiNhanh',
      label: 'Chi nhánh',
      type: 'select',
      options: [
        { value: 'CN1', label: 'Chi nhánh 1' },
        { value: 'CN2', label: 'Chi nhánh 2' },
        { value: 'CN3', label: 'Chi nhánh 3' }
      ]
    },
    {
      key: 'vaiTro',
      label: 'Vai trò',
      type: 'select',
      options: [
        { value: 'Quản trị hệ thống', label: 'Admin' },
        { value: 'Giảng viên', label: 'Giảng viên' },
        { value: 'Nhân viên kế toán', label: 'Kế toán' },
        { value: 'Nhân viên hành chính', label: 'Nhân viên hành chính' }
      ]
    }
  ];

  // All staff data from JSON
  allStaffs: any[] = [];

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  pageSizeOptions = [10, 20, 50];

  // Filter properties
  filteredData: any[] = [];
  paginatedData: any[] = [];

  // Dialog + Reactive form
  isAddStaffDialogOpen = false;
  addStaffForm: FormGroup;

  branchOptions = [
    { value: 'CN1', label: 'Chi nhánh 1' },
    { value: 'CN2', label: 'Chi nhánh 2' },
    { value: 'CN3', label: 'Chi nhánh 3' }
  ];

  roleOptions = [
    { value: 'Quản trị hệ thống', label: 'Quản trị hệ thống', code: 'ADMIN' },
    { value: 'Nhân viên hành chính', label: 'Nhân viên hành chính', code: 'STAFF' },
    { value: 'Nhân viên kế toán', label: 'Nhân viên kế toán', code: 'ACCOUNTANT' },
    { value: 'Giảng viên', label: 'Giảng viên', code: 'INSTRUCTOR' },
    { value: 'Nhân viên IT', label: 'Nhân viên IT', code: 'IT_SUPPORT' }
  ];

  private roleCodeMap: Record<string, string> = {
    'Quản trị hệ thống': 'ADMIN',
    'Nhân viên hành chính': 'STAFF',
    'Nhân viên kế toán': 'ACCOUNTANT',
    'Giảng viên': 'INSTRUCTOR',
    'Nhân viên IT': 'IT_SUPPORT'
  };

  // Inject ChangeDetectorRef để force change detection
  constructor(
    private formBuilder: FormBuilder,
    private staffService: StaffService,
    private cdr: ChangeDetectorRef
  ) {
    this.addStaffForm = this.formBuilder.group({
      employeeId: [{ value: '', disabled: true }],
      fullName: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      dob: ['', [Validators.required]],
      address: [''],
      phone: ['', [Validators.required]],
      branch: ['', [Validators.required]],
      roleName: ['', [Validators.required]],
      roleId: [{ value: '', disabled: true }],
      cccdImage: ['', [Validators.required]],
      // TODO: Chốt thêm quy tắc Regex/Độ dài với team sau
    });

    this.addStaffForm.get('roleName')?.valueChanges.subscribe((roleName) => {
      const mappedRoleId = this.roleCodeMap[roleName] || '';
      this.addStaffForm.patchValue({ roleId: mappedRoleId }, { emitEvent: false });
    });
  }

  ngOnInit(): void {
    // Initialize pagination state before loading data
    this.currentPage = 1;
    this.itemsPerPage = 10; // Explicitly set default
    this.filteredData = [];
    this.paginatedData = [];
    
    // Load data
    this.loadData();
  }

  loadData(): void {
    this.staffService.getStaff().subscribe({
      next: (data) => {
        // Normalize data: map Vietnamese keys to normalized keys
        this.allStaffs = data.map(staff => ({
          maNhanVien: staff['Mã NV'] || '',
          tenNhanVien: staff['Tên nhân viên'] || '',
          gioiTinh: staff['Giới tính'] || '',
          ngaySinh: this.normalizeDateForInput(staff['Ngày sinh']),
          diaChi: (staff as any)['Địa chỉ'] || '',
          soDienThoai: `${staff['SĐT'] || ''}`,
          chiNhanh: staff['Chi nhánh'] || '',
          vaiTro: staff['Vai trò'] || '',
          maVaiTro: staff['Mã vai trò'] || this.roleCodeMap[staff['Vai trò']] || '',
          cccdImage: staff['Ảnh CCCD'] || '',
          trangThai: 'Đang hoạt động' // Default status
        }));
        this.filteredData = [...this.allStaffs];
        this.updatePagination();
      },
      error: (err) => {
        console.error('Error loading staff data:', err);
        // Fallback to sample data
        this.allStaffs = [
          { maNhanVien: 'NV001', tenNhanVien: 'Nguyễn Văn A', gioiTinh: 'Nam', chiNhanh: 'CN1', vaiTro: 'Quản trị hệ thống', trangThai: 'Đang hoạt động' },
          { maNhanVien: 'NV002', tenNhanVien: 'Trần Thị B', gioiTinh: 'Nữ', chiNhanh: 'CN2', vaiTro: 'Giảng viên', trangThai: 'Đang hoạt động' },
        ];
        this.filteredData = [...this.allStaffs];
        this.updatePagination();
      }
    });
  }

  /**
   * Xử lý sự kiện tìm kiếm từ FilterDataPickerComponent
   * @param filterValues Object chứa các giá trị filter { key: value }
   */
  handleSearch(filterValues: any): void {
    this.filteredData = this.allStaffs.filter(staff => {
      return Object.keys(filterValues).every(key => {
        const filterValue = filterValues[key];
        const staffValue = staff[key];

        // Nếu không có giá trị filter cho field này, bỏ qua
        if (!filterValue) {
          return true;
        }

        // Với trường text (maNhanVien, tenNhanVien): so sánh substring không phân biệt hoa thường
        if (key === 'maNhanVien' || key === 'tenNhanVien') {
          if (typeof staffValue === 'string') {
            return staffValue.toLowerCase().includes(filterValue.toLowerCase());
          }
        }

        // Với trường select (gioiTinh, chiNhanh, vaiTro): so sánh bằng tuyệt đối
        return staffValue === filterValue;
      });
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  /**
   * Xử lý sự kiện reset từ FilterDataPickerComponent
   */
  handleReset(): void {
    this.filteredData = [...this.allStaffs];
    this.currentPage = 1;
    this.updatePagination();
  }

  openAddStaffDialog(): void {
    const nextEmployeeId = this.generateNextEmployeeId();
    this.addStaffForm.reset({
      employeeId: nextEmployeeId,
      fullName: '',
      gender: '',
      dob: '',
      address: '',
      phone: '',
      branch: '',
      roleName: '',
      roleId: '',
      cccdImage: ''
    });
    this.isAddStaffDialogOpen = true;
  }

  closeAddStaffDialog(): void {
    this.isAddStaffDialogOpen = false;
  }

  onCccdFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.addStaffForm.patchValue({ cccdImage: file ? file.name : '' });
    this.addStaffForm.get('cccdImage')?.markAsTouched();
  }

  onSubmitAddStaff(): void {
    if (this.addStaffForm.invalid) {
      this.addStaffForm.markAllAsTouched();
      return;
    }

    const rawValue = this.addStaffForm.getRawValue();
    const newStaff = {
      maNhanVien: rawValue.employeeId,
      tenNhanVien: rawValue.fullName,
      gioiTinh: rawValue.gender,
      ngaySinh: rawValue.dob,
      diaChi: rawValue.address,
      soDienThoai: rawValue.phone,
      chiNhanh: rawValue.branch,
      vaiTro: rawValue.roleName,
      maVaiTro: rawValue.roleId,
      cccdImage: rawValue.cccdImage,
      trangThai: 'Đang hoạt động'
    };

    this.staffService.addStaff(newStaff).subscribe({
      next: () => {
        this.allStaffs.unshift(newStaff);
        this.filteredData = [...this.allStaffs];
        this.currentPage = 1;
        this.updatePagination();
        this.closeAddStaffDialog();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Không thể thêm nhân viên:', error);
      }
    });
  }

  private normalizeDateForInput(value: string): string {
    if (!value) {
      return '';
    }
    return value.split(' ')[0];
  }

  private generateNextEmployeeId(): string {
    const maxNumericPart = this.allStaffs.reduce((max, staff) => {
      const id = `${staff.maNhanVien || ''}`;
      const numericPart = Number(id.replace(/\D/g, ''));
      if (Number.isNaN(numericPart)) {
        return max;
      }
      return Math.max(max, numericPart);
    }, 0);

    const nextNumericPart = maxNumericPart + 1;
    return `DPS${nextNumericPart.toString().padStart(5, '0')}`;
  }

  onPaginationPageChange(page: number): void {
    console.log('[Staff] onPaginationPageChange:', { newPage: page, currentPage: this.currentPage });
    this.currentPage = page;
    this.cdr.markForCheck(); // Force change detection
    this.updatePagination();
  }

  onPaginationPageSizeChange(size: number): void {
    console.log('[Staff] onPaginationPageSizeChange:', { newSize: size, oldSize: this.itemsPerPage });
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.cdr.markForCheck(); // Force change detection
    this.updatePagination();
  }

  updatePagination(): void {
    console.log('[Staff] updatePagination:', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
      filteredLength: this.filteredData.length
    });

    // Safety check: validate itemsPerPage
    if (this.itemsPerPage <= 0) {
      console.error('[Staff] itemsPerPage is invalid:', this.itemsPerPage);
      this.itemsPerPage = 10; // Fallback to default
    }

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    
    console.log('[Staff] Slice parameters:', { start, end, arrayLength: this.filteredData.length });
    
    this.paginatedData = this.filteredData.slice(start, end);
    
    console.log('[Staff] Paginated data count:', this.paginatedData.length);
  }
}
