import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FilterDataPicker, FilterConfig } from '../../../../components/filter-data-picker/filter-data-picker';
import { PaginationComponent } from '../../../../components/pagination/pagination';
import { FormDialogComponent } from '../../../../components/form-dialog/form-dialog';
import { ConfirmDialog } from '../../../../components/confirm-dialog/confirm-dialog';
import { Staff as StaffService } from '../../../../services/staff';
import { iStaff } from '../../../../interfaces/staff';
import { RoleService } from '../../../../services/role';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
  // 'Ảnh CCCD': FormControl<string>;
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
  isEditMode = false;
  editingStaffId = '';
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

  roleOptions: any[] = [];
  loadRoleOptions(): void {
    this.roleService.getRole().subscribe({
      next: (roles: any[]) => {
        this.roleOptions = roles
        .filter(role => role.active === true)
        .map(role => ({
          value: role.tenVaiTro,
          label: role.tenVaiTro,
          code: role.maVaiTro
        }));
        // update filter config
        const roleFilter = this.filterConfig.find(
          item => item.key === 'vaiTro'
        );
        if (roleFilter) {
          roleFilter.options = this.roleOptions.map(role => ({
            value: role.value,
            label: role.label
          }));
        }
        // update roleCodeMap
        this.roleCodeMap = {};
        this.roleOptions.forEach(role => {
          this.roleCodeMap[role.value] = role.code;
        });
      },
      error: (err) => {
        console.error('Lỗi load role:', err);
      }
    });
  }

  private roleCodeMap: Record<string, string> = {};

  // Inject ChangeDetectorRef để force change detection
  constructor(
    private formBuilder: FormBuilder,
    private staffService: StaffService,
    private cdr: ChangeDetectorRef,
    private roleService: RoleService
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
      // cccdImage: ['', [Validators.required]],
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
      // 'Ảnh CCCD': this.formBuilder.control('', { nonNullable: true }),
      'Trạng thái': this.formBuilder.control('', { nonNullable: true })
    });
        this.detailForm.get('Vai trò')?.valueChanges.subscribe((roleName) => {
    const mappedRoleId = this.roleCodeMap[roleName] || '';
    this.detailForm.patchValue(
      {
        'Mã vai trò': mappedRoleId
      },
      { emitEvent: false }
    );
  });
  }
  

  ngOnInit(): void {
    // Initialize pagination state before loading data
    this.currentPage = 1;
    this.itemsPerPage = 10; // Explicitly set default
    this.filteredData = [];
    this.paginatedData = [];

    // Load data
    this.loadRoleOptions();
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
          // cccdImage: staff.anhCccd || '',
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
      // cccdImage: ''
    });
    this.isAddStaffDialogOpen = true;
  }

  closeAddStaffDialog(): void {
    this.isAddStaffDialogOpen = false;
  }

  viewStaffDetail(item: any): void {
    this.isEditMode = false;
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
      // 'Ảnh CCCD': `${item?.cccdImage ?? ''}`,
      'Trạng thái': `${item?.trangThai ?? ''}`
    });

    this.detailForm.disable();
    this.isViewStaffDialogOpen = true;
  }
  editStaff(item: any): void {
    this.isEditMode = true;
    this.editingStaffId = item._id || '';
    this.detailForm.enable();
    this.detailForm.get('Mã nhân viên')?.disable();
    this.detailForm.get('Mã vai trò')?.disable();
    this.detailForm.get('Trạng thái')?.disable();
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
      // 'Ảnh CCCD': `${item?.cccdImage ?? ''}`,
      'Trạng thái': `${item?.trangThai ?? ''}`
    });
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
      // 'Ảnh CCCD': '',
      'Trạng thái': ''
    });
  }

  // onCccdFileChange(event: Event): void {
  //   const input =
  //     event.target as HTMLInputElement;
  //   const file =
  //     input.files?.[0];
  //   if (!file) {
  //     return;
  //   }
  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     this.addStaffForm.patchValue({ cccdImage: reader.result as string    });
  //     this.addStaffForm.get('cccdImage')?.markAsTouched();
  //   };
  //   reader.readAsDataURL(file);
  // }

  onSubmitAddStaff(): void {
    if (this.addStaffForm.invalid) {
      this.addStaffForm.markAllAsTouched();
      return;
    }

    const rawValue = this.addStaffForm.getRawValue();
    const newStaffPayload: iStaff = {
      maNv: rawValue.employeeId,
      tenNhanVien: rawValue.fullName,
      gioiTinh: rawValue.gender,
      ngaySinh: rawValue.dob,
      sdt: Number(rawValue.phone) || 0,
      email: '',
      chiNhanh: rawValue.branch,
      vaiTro: rawValue.roleName,
      maVaiTro: rawValue.roleId,
      // anhCccd: rawValue.cccdImage,
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
      // cccdImage: rawValue.cccdImage,
      trangThai: 'Đang hoạt động'
    };

    this.staffService.addStaff(newStaffPayload).subscribe({
      next: (createdStaff: any) => {

      const mappedStaff = {
        maNhanVien: createdStaff.maNv || '',
        tenNhanVien: createdStaff.tenNhanVien || '',
        gioiTinh: createdStaff.gioiTinh || '',
        ngaySinh: this.normalizeDateForInput(createdStaff.ngaySinh),
        diaChi: '',
        soDienThoai: `${createdStaff.sdt || ''}`,
        chiNhanh: createdStaff.chiNhanh || '',
        vaiTro: createdStaff.vaiTro || '',
        maVaiTro: createdStaff.maVaiTro || '',
        // cccdImage: createdStaff.anhCccd || '',
        trangThai: createdStaff.active === false
          ? 'Đã khóa'
          : 'Đang hoạt động',
        _id: createdStaff._id || ''
      };
      this.allStaffs.unshift(mappedStaff);
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
  onSubmitEditStaff(): void {

    if (!this.editingStaffId) {
      return;
    }

    const formValue =
      this.detailForm.getRawValue();

    const updatePayload: Partial<iStaff> = {
      tenNhanVien:
        formValue['Tên nhân viên'],

      gioiTinh:
        formValue['Giới tính'],

      ngaySinh:
        formValue['Ngày sinh'],
      sdt:
        Number(formValue['SĐT']) || 0,

      chiNhanh:
        formValue['Chi nhánh'],

      vaiTro:
        formValue['Vai trò'],

      maVaiTro:
        formValue['Mã vai trò'],

      // anhCccd:
      //   formValue['Ảnh CCCD']

    };
console.log('editingStaffId:', this.editingStaffId);
console.log('updatePayload:', updatePayload);
    this.staffService
      .updateStaff(
        this.editingStaffId,
        updatePayload
      )
      .subscribe({
        next: () => {
          const staff =
            this.allStaffs.find(
              s => s._id === this.editingStaffId
            );
          if (staff) {
            staff.tenNhanVien =
              formValue['Tên nhân viên'];
            staff.gioiTinh =
              formValue['Giới tính'];
            staff.ngaySinh =
              formValue['Ngày sinh'];
            staff.soDienThoai =
              formValue['SĐT'];
            staff.chiNhanh =
              formValue['Chi nhánh'];
            staff.vaiTro =
              formValue['Vai trò'];
            staff.maVaiTro =
              formValue['Mã vai trò'];
            // staff.cccdImage =
            //   formValue['Ảnh CCCD'];
            this.filteredData = [
              ...this.allStaffs
            ];
            this.updatePagination();
            this.cdr.markForCheck();
          }
          this.closeViewStaffDialog();
        },
        error: (err) => {
          console.error(err);
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
  const currentStatus = item?.trangThai;
  // =========================
  // NẾU ĐANG MỞ KHÓA NHÂN VIÊN
  // =========================
  if (currentStatus === 'Đã khóa') {
    this.roleService.getRole().subscribe({
      next: (roles: any[]) => {
        const role =
          roles.find(
            r => r.maVaiTro === item.maVaiTro
          );
        // =========================
        // ROLE ĐANG BỊ KHÓA
        // =========================
        if (role && role.active === false) {
          this.confirmLockItem = null;
          this.confirmLockMessage =
            `Không thể mở khóa nhân viên "${item.tenNhanVien}" vì vai trò "${item.vaiTro}" đang bị khóa. Vui lòng mở khóa vai trò trước.`;
          this.isConfirmLockDialogOpen = true;
          return;
        }
        // =========================
        // CHO PHÉP MỞ KHÓA
        // =========================
        this.confirmLockItem = item;
        this.confirmLockMessage =
          `Bạn có chắc chắn muốn mở khóa nhân viên "${item.tenNhanVien}" và đổi trạng thái thành "Đang hoạt động"?`;
        this.isConfirmLockDialogOpen = true;
      },
      error: (err) => {
        console.error(err);
      }
    });
    return;
  }

  // =========================
  // KHÓA NHÂN VIÊN
  // =========================

  this.confirmLockItem = item;

  this.confirmLockMessage =
    `Bạn có chắc chắn muốn khóa nhân viên "${item.tenNhanVien}" và đổi trạng thái thành "Đã khóa"?`;

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

  exportExcel(): void {
  // Xuất TOÀN BỘ dữ liệu
  // Không dùng paginatedData
  const exportData = this.filteredData.map((staff, index) => ({
    'STT': index + 1,
    'Mã nhân viên': staff.maNhanVien,
    'Tên nhân viên': staff.tenNhanVien,
    'Giới tính': staff.gioiTinh,
    'Ngày sinh': staff.ngaySinh,
    'SĐT': staff.soDienThoai,
    'Địa chỉ': staff.diaChi,
    'Chi nhánh': staff.chiNhanh,
    'Vai trò': staff.vaiTro,
    'Mã vai trò': staff.maVaiTro,
    'Trạng thái': staff.trangThai
  }));
  // Tạo worksheet
  const worksheet: XLSX.WorkSheet =
    XLSX.utils.json_to_sheet(exportData);
  // Tạo workbook
  const workbook: XLSX.WorkBook = {
    Sheets: {
      'Danh sách nhân viên': worksheet
    },
    SheetNames: ['Danh sách nhân viên']
  };
  // Xuất buffer
  const excelBuffer: any =
    XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });
  // Tạo file blob
  const data: Blob = new Blob(
    [excelBuffer],
    {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    }
  );
  // Tên file
  const fileName =
    `DanhSachNhanVien_${new Date().getTime()}.xlsx`;
  saveAs(data, fileName);
}
}
