import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FilterDataPicker, FilterConfig } from '../../../../components/filter-data-picker/filter-data-picker';
import { PaginationComponent } from '../../../../components/pagination/pagination';
import { FormDialogComponent } from '../../../../components/form-dialog/form-dialog';
import { ConfirmDialog } from '../../../../components/confirm-dialog/confirm-dialog';
import { RoleService } from '../../../../services/role';
import { iRole } from '../../../../interfaces/role';

type RoleViewFormGroup = {
  'MÃ VAI TRÒ': FormControl<string>;
  'TÊN VAI TRÒ': FormControl<string>;
  'MÔ TẢ': FormControl<string>;
  'TRẠNG THÁI': FormControl<string>;
};

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FilterDataPicker, PaginationComponent, FormDialogComponent, ConfirmDialog],
  templateUrl: './role.html',
  styleUrl: './role.css',
})
export class Role implements OnInit {
  readonly viewDialogConfig = {
    cancelText: 'Đóng',
    hideSubmitButton: true
  };

  /**
   * Cấu hình bộ lọc - Truyền vào FilterDataPickerComponent
   * Sử dụng các key tiếng Việt từ JSON
   */
  filterConfig: FilterConfig[] = [
    {
      key: 'MÃ VAI TRÒ',
      label: 'Mã Vai trò',
      type: 'text'
    },
    {
      key: 'TÊN VAI TRÒ',
      label: 'Vai trò',
      type: 'text'
    }
  ];

  // All role data from JSON (không normalize)
  roles: iRole[] = [];

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  pageSizeOptions = [10, 20, 50];

  // Filter properties
  filteredData: iRole[] = [];
  paginatedData: iRole[] = [];

  // Dialog + Reactive form
  dialogMode: 'add' | 'view' | null = null;
  addRoleForm: FormGroup;
  detailForm: FormGroup<RoleViewFormGroup>;
  dialogSections = [
    {
      title: 'I. Thông tin vai trò',
      fields: [
        { label: 'Mã Vai trò', name: 'maVaiTro', type: 'text', required: true, placeholder: 'Nhập mã vai trò' },
        { label: 'Tên Vai trò', name: 'tenVaiTro', type: 'text', required: true, placeholder: 'Nhập tên vai trò' },
        { label: 'Mô tả', name: 'moTa', type: 'textarea', required: true, placeholder: 'Nhập mô tả vai trò' },
      ]
    }
  ];

  // Lock/Unlock confirmation dialog
  isConfirmLockDialogOpen = false;
  confirmLockItem: iRole | null = null;
  confirmLockMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private roleService: RoleService,
    private cdr: ChangeDetectorRef
  ) {
    this.addRoleForm = this.formBuilder.group({
      maVaiTro: ['', [Validators.required]], // TODO: Chốt quy tắc ràng buộc/Validators sau
      tenVaiTro: ['', [Validators.required]], // TODO: Chốt quy tắc ràng buộc/Validators sau
      moTa: ['', [Validators.required]], // TODO: Chốt quy tắc ràng buộc/Validators sau
    });

    this.detailForm = this.formBuilder.group<RoleViewFormGroup>({
      'MÃ VAI TRÒ': this.formBuilder.control('', { nonNullable: true }),
      'TÊN VAI TRÒ': this.formBuilder.control('', { nonNullable: true }),
      'MÔ TẢ': this.formBuilder.control('', { nonNullable: true }),
      'TRẠNG THÁI': this.formBuilder.control('', { nonNullable: true }),
    });
  }

  get isDialogOpen(): boolean {
    return this.dialogMode !== null;
  }

  get isViewMode(): boolean {
    return this.dialogMode === 'view';
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
    this.roleService.getRole().subscribe({
      next: (data) => {
        // Giữ nguyên dữ liệu từ JSON với các key tiếng Việt
        this.roles = data;
        this.filteredData = [...this.roles];
        this.updatePagination();
      },
      error: (err) => {
        console.error('Error loading role data:', err);
        // Fallback to sample data
        this.roles = [
          { 
            'STT': 1,
            'MÃ VAI TRÒ': 'ADMIN', 
            'TÊN VAI TRÒ': 'Admin', 
            'MÔ TẢ': 'Quản trị hệ thống',
            'TRẠNG THÁI': 'Đang hoạt động' 
          },
          { 
            'STT': 2,
            'MÃ VAI TRÒ': 'KETOAN', 
            'TÊN VAI TRÒ': 'Kế toán', 
            'MÔ TẢ': 'Quản lý tài chính',
            'TRẠNG THÁI': 'Đang hoạt động' 
          },
        ];
        this.filteredData = [...this.roles];
        this.updatePagination();
      }
    });
  }

  openAddRoleDialog(): void {
    this.addRoleForm.reset({
      maVaiTro: '',
      tenVaiTro: '',
      moTa: ''
    });
    this.dialogMode = 'add';
  }

  viewRoleDetail(item: iRole): void {
    this.detailForm.patchValue({
      'MÃ VAI TRÒ': `${item['MÃ VAI TRÒ'] ?? ''}`,
      'TÊN VAI TRÒ': `${item['TÊN VAI TRÒ'] ?? ''}`,
      'MÔ TẢ': `${item['MÔ TẢ'] ?? ''}`,
      'TRẠNG THÁI': `${item['TRẠNG THÁI'] ?? ''}`,
    });
    this.detailForm.disable();
    this.dialogMode = 'view';
  }

  closeDialog(): void {
    this.addRoleForm.reset({ maVaiTro: '', tenVaiTro: '', moTa: '' });
    this.detailForm.enable();
    this.detailForm.reset({
      'MÃ VAI TRÒ': '',
      'TÊN VAI TRÒ': '',
      'MÔ TẢ': '',
      'TRẠNG THÁI': '',
    });
    this.dialogMode = null;
  }

  onSubmitAddRole(formValue: any): void {
    if (this.isViewMode) {
      return;
    }

    if (this.addRoleForm.invalid) {
      this.addRoleForm.markAllAsTouched();
      return;
    }

    const normalizedMaVaiTro = `${formValue.maVaiTro ?? ''}`.trim();
    const normalizedTenVaiTro = `${formValue.tenVaiTro ?? ''}`.trim();
    const normalizedMoTa = `${formValue.moTa ?? ''}`.trim();

    const nextStt = this.roles.length > 0
      ? Math.max(...this.roles.map((item) => Number(item['STT']) || 0)) + 1
      : 1;

    const newRole: iRole = {
      STT: nextStt,
      'MÃ VAI TRÒ': normalizedMaVaiTro,
      'TÊN VAI TRÒ': normalizedTenVaiTro,
      'MÔ TẢ': normalizedMoTa,
      'TRẠNG THÁI': 'Đang hoạt động'
    };

    this.roleService.addRole(newRole).subscribe({
      next: () => {
        this.roles.unshift(newRole);
        this.filteredData = [...this.roles];
        this.currentPage = 1;
        this.updatePagination();
        this.closeDialog();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Không thể thêm vai trò mới:', error);
      }
    });
  }

  /**
   * Xử lý sự kiện tìm kiếm từ FilterDataPickerComponent
   * Lọc theo MÃ VAI TRÒ hoặc TÊN VAI TRÒ
   * @param filterValues Object chứa các giá trị filter { key: value }
   */
  handleSearch(filterValues: any): void {
    this.filteredData = this.roles.filter(role => {
      return Object.keys(filterValues).every(key => {
        const filterValue = filterValues[key];
        const roleValue = role[key];

        // Nếu không có giá trị filter cho field này, bỏ qua
        if (!filterValue) {
          return true;
        }

        // Với trường text: so sánh substring không phân biệt hoa thường
        if (typeof roleValue === 'string') {
          return roleValue.toLowerCase().includes(filterValue.toLowerCase());
        }

        // Cho các type khác, so sánh bằng
        return roleValue === filterValue;
      });
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  /**
   * Xử lý sự kiện reset từ FilterDataPickerComponent
   */
  handleReset(): void {
    this.filteredData = [...this.roles];
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    console.log('[Role] updatePagination:', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
      filteredLength: this.filteredData.length
    });

    // Safety check: validate itemsPerPage
    if (this.itemsPerPage <= 0) {
      console.error('[Role] itemsPerPage is invalid:', this.itemsPerPage);
      this.itemsPerPage = 10; // Fallback to default
    }

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    
    console.log('[Role] Slice parameters:', { start, end, arrayLength: this.filteredData.length });
    
    this.paginatedData = this.filteredData.slice(start, end);
    
    console.log('[Role] Paginated data count:', this.paginatedData.length);
  }

  onPaginationPageChange(page: number): void {
    console.log('[Role] onPaginationPageChange:', { newPage: page, currentPage: this.currentPage });
    this.currentPage = page;
    this.cdr.markForCheck(); // Force change detection
    this.updatePagination();
  }

  onPaginationPageSizeChange(size: number): void {
    console.log('[Role] onPaginationPageSizeChange:', { newSize: size, oldSize: this.itemsPerPage });
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.cdr.markForCheck(); // Force change detection
    this.updatePagination();
  }

  /**
   * Khởi tạo dialog xác nhận khóa/mở khóa vai trò
   * @param item Vai trò cần khóa/mở khóa
   */
  toggleLockStatus(item: iRole): void {
    this.confirmLockItem = item;
    const currentStatus = item['TRẠNG THÁI'];
    const action = currentStatus === 'Đang hoạt động' ? 'khóa' : 'mở khóa';
    const newStatus = currentStatus === 'Đang hoạt động' ? 'Đã khóa' : 'Đang hoạt động';
    
    this.confirmLockMessage = `Bạn có chắc chắn muốn ${action} vai trò "${item['TÊN VAI TRÒ']}" và đổi trạng thái thành "${newStatus}"?`;
    this.isConfirmLockDialogOpen = true;
  }

  /**
   * Xác nhận khóa/mở khóa và cập nhật dữ liệu
   */
  onConfirmLock(): void {
    if (!this.confirmLockItem) {
      return;
    }

    const currentStatus = (this.confirmLockItem['TRẠNG THÁI'] || '') as string;
    const roleId = (this.confirmLockItem['MÃ VAI TRÒ'] || '') as string;

    if (!currentStatus || !roleId) {
      console.error('Invalid role data for lock/unlock');
      return;
    }

    // Gọi service để cập nhật trạng thái
    // endpoint: để trống sẽ mock, sau này thêm API endpoint
    this.roleService.toggleLockStatus(roleId, currentStatus, '').subscribe({
      next: (response) => {
        if (response.success) {
          // Cập nhật trạng thái trong local data
          const roleToUpdate = this.roles.find(r => r['MÃ VAI TRÒ'] === roleId);
          if (roleToUpdate) {
            roleToUpdate['TRẠNG THÁI'] = currentStatus === 'Đang hoạt động' ? 'Đã khóa' : 'Đang hoạt động';
            // Cập nhật filtered và paginated data
            this.filteredData = [...this.roles];
            this.updatePagination();
            this.cdr.markForCheck();
          }
          this.isConfirmLockDialogOpen = false;
          this.confirmLockItem = null;
        }
      },
      error: (error) => {
        console.error('Không thể cập nhật trạng thái:', error);
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
   * Kiểm tra xem vai trò có bị khóa hay không
   */
  isRoleLocked(item: iRole): boolean {
    return item['TRẠNG THÁI'] === 'Đã khóa';
  }
}
