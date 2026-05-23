import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FilterDataPicker, FilterConfig } from '../../../../components/filter-data-picker/filter-data-picker';
import { PaginationComponent } from '../../../../components/pagination/pagination';
import { FormDialogComponent } from '../../../../components/form-dialog/form-dialog';
import { ConfirmDialog } from '../../../../components/confirm-dialog/confirm-dialog';
import { Staff as StaffService } from '../../../../services/staff';
import { iStaff } from '../../../../interfaces/staff';

type StaffDetailFormGroup = {
  'Mã nhân viên': FormControl<string>;
  'Tên nhân viên': FormControl<string>;
  'Giới tính': FormControl<string>;
  'Ngày sinh': FormControl<string>;
  'SĐT': FormControl<string>;
  'Địa chỉ': FormControl<string>;
  'Chi nhánh': FormControl<string>;
  'Vai trò': FormControl<string>;
  'Mã vai trò': FormControl<string>;
  'Ảnh CCCD': FormControl<string>;
  'Trạng thái': FormControl<string>;
};

@Component({
  selector: 'app-staff',
  imports: [CommonModule, ReactiveFormsModule, FilterDataPicker, PaginationComponent, FormDialogComponent, ConfirmDialog],
  templateUrl: './staff.html',
  styleUrl: './staff.css',
})
export class Staff implements OnInit {
  readonly viewDialogConfig = {
    cancelText: 'Đóng',
    hideSubmitButton: true
  };

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
    },
    {
      key: 'trangThai',
      label: 'Trạng thái',
      type: 'select',
      options: [
        { value: 'Đang hoạt động', label: 'Đang hoạt động' },
        { value: 'Đã khóa', label: 'Đã khóa' }
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
  isViewStaffDialogOpen = false;
  addStaffForm: FormGroup;
  detailForm: FormGroup<StaffDetailFormGroup>;

  // Lock/Unlock confirmation dialog
  isConfirmLockDialogOpen = false;
  confirmLockItem: any = null;
  confirmLockMessage = '';

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

    this.detailForm = this.formBuilder.group<StaffDetailFormGroup>({
      'Mã nhân viên': this.formBuilder.control('', { nonNullable: true }),
      'Tên nhân viên': this.formBuilder.control('', { nonNullable: true }),
      'Giới tính': this.formBuilder.control('', { nonNullable: true }),
      'Ngày sinh': this.formBuilder.control('', { nonNullable: true }),
      'SĐT': this.formBuilder.control('', { nonNullable: true }),
      'Địa chỉ': this.formBuilder.control('', { nonNullable: true }),
      'Chi nhánh': this.formBuilder.control('', { nonNullable: true }),
      'Vai trò': this.formBuilder.control('', { nonNullable: true }),
      'Mã vai trò': this.formBuilder.control('', { nonNullable: true }),
      'Ảnh CCCD': this.formBuilder.control('', { nonNullable: true }),
      'Trạng thái': this.formBuilder.control('', { nonNullable: true })
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
          maNhanVien: staff.maNv || '',
          tenNhanVien: staff.tenNhanVien || '',
          gioiTinh: staff.gioiTinh || '',
          ngaySinh: this.normalizeDateForInput(staff.ngaySinh),
          diaChi: '',
          soDienThoai: `${staff.sdt || ''}`,
          chiNhanh: staff.chiNhanh || '',
          vaiTro: staff.vaiTro || '',
          maVaiTro: staff.maVaiTro || this.roleCodeMap[staff.vaiTro] || '',
          cccdImage: staff.anhCccd || '',
          trangThai: staff.active === false ? 'Đã khóa' : 'Đang hoạt động',
          _id: staff._id || ''
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
    this.closeViewStaffDialog();

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

  viewStaffDetail(item: any): void {
    this.closeAddStaffDialog();

    this.detailForm.patchValue({
      'Mã nhân viên': `${item?.maNhanVien ?? ''}`,
      'Tên nhân viên': `${item?.tenNhanVien ?? ''}`,
      'Giới tính': `${item?.gioiTinh ?? ''}`,
      'Ngày sinh': `${item?.ngaySinh ?? ''}`,
      'SĐT': `${item?.soDienThoai ?? ''}`,
      'Địa chỉ': `${item?.diaChi ?? ''}`,
      'Chi nhánh': `${item?.chiNhanh ?? ''}`,
      'Vai trò': `${item?.vaiTro ?? ''}`,
      'Mã vai trò': `${item?.maVaiTro ?? ''}`,
      'Ảnh CCCD': `${item?.cccdImage ?? ''}`,
      'Trạng thái': `${item?.trangThai ?? ''}`
    });

    this.detailForm.disable();
    this.isViewStaffDialogOpen = true;
  }

  closeViewStaffDialog(): void {
    this.isViewStaffDialogOpen = false;
    this.detailForm.enable();
    this.detailForm.reset({
      'Mã nhân viên': '',
      'Tên nhân viên': '',
      'Giới tính': '',
      'Ngày sinh': '',
      'SĐT': '',
      'Địa chỉ': '',
      'Chi nhánh': '',
      'Vai trò': '',
      'Mã vai trò': '',
      'Ảnh CCCD': '',
      'Trạng thái': ''
    });
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
    const newStaffPayload: iStaff = {
      stt: this.allStaffs.length + 1,
      maNv: rawValue.employeeId,
      tenNhanVien: rawValue.fullName,
      gioiTinh: rawValue.gender,
      ngaySinh: rawValue.dob,
      sdt: Number(rawValue.phone) || 0,
      email: '',
      chiNhanh: rawValue.branch,
      vaiTro: rawValue.roleName,
      maVaiTro: rawValue.roleId,
      anhCccd: rawValue.cccdImage,
      active: true
    };

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

    this.staffService.addStaff(newStaffPayload).subscribe({
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

  /**
   * Khởi tạo dialog xác nhận khóa/mở khóa nhân viên
   * @param item Nhân viên cần khóa/mở khóa
   */
  toggleLockStatus(item: any): void {
    this.confirmLockItem = item;
    const currentStatus = item?.trangThai;
    const action = currentStatus === 'Đang hoạt động' ? 'khóa' : 'mở khóa';
    const newStatus = currentStatus === 'Đang hoạt động' ? 'Đã khóa' : 'Đang hoạt động';

    this.confirmLockMessage = `Bạn có chắc chắn muốn ${action} nhân viên "${item?.tenNhanVien}" và đổi trạng thái thành "${newStatus}"?`;
    this.isConfirmLockDialogOpen = true;
  }

  /**
   * Xác nhận khóa/mở khóa và cập nhật dữ liệu
   */
  onConfirmLock(): void {
    if (!this.confirmLockItem) {
      return;
    }

    const currentStatus = this.confirmLockItem?.trangThai;
    const staffId = this.confirmLockItem?._id;

    if (!staffId) {
      console.error('[Staff] No _id found for lock/unlock');
      return;
    }

    const newActive = currentStatus === 'Đang hoạt động' ? false : true;
    const newStatus = newActive ? 'Đang hoạt động' : 'Đã khóa';

    // Gọi API cập nhật trạng thái active vào database
    this.staffService.updateStaff(staffId, { active: newActive }).subscribe({
      next: () => {
        const staffToUpdate = this.allStaffs.find(s => s.maNhanVien === this.confirmLockItem?.maNhanVien);
        if (staffToUpdate) {
          staffToUpdate.trangThai = newStatus;
          this.filteredData = [...this.allStaffs];
          this.updatePagination();
          this.cdr.markForCheck();
        }
        this.isConfirmLockDialogOpen = false;
        this.confirmLockItem = null;
      },
      error: (err) => {
        console.error('[Staff] Lỗi cập nhật trạng thái:', err);
        this.isConfirmLockDialogOpen = false;
        this.confirmLockItem = null;
      }
    });
  }

  /**
   * Hủy khóa/mở khóa
   */
  onCancelLock(): void {
    this.isConfirmLockDialogOpen = false;
    this.confirmLockItem = null;
  }

  /**
   * Kiểm tra xem nhân viên có bị khóa hay không
   */
  isLocked(item: any): boolean {
    return item?.trangThai === 'Đã khóa';
  }
}
