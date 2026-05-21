import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Client } from '../../../services/client';
import { iClient } from '../../../interfaces/client';
import { FilterDataPicker, FilterConfig } from '../../../components/filter-data-picker/filter-data-picker';
import { PaginationComponent } from '../../../components/pagination/pagination';
import { FormDialogComponent } from '../../../components/form-dialog/form-dialog';
import { ConfirmDialog } from '../../../components/confirm-dialog/confirm-dialog';

type CustomerDetailFormGroup = {
  'Mã KH': FormControl<string>;
  'Tên khách hàng': FormControl<string>;
  'Giới tính': FormControl<string>;
  'Ngày sinh': FormControl<string>;
  'SĐT': FormControl<string>;
  'Email': FormControl<string>;
  'Ngày đăng ký': FormControl<string>;
  'Trạng thái': FormControl<string>;
};

@Component({
  selector: 'app-customer',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FilterDataPicker, PaginationComponent, FormDialogComponent, ConfirmDialog],
  templateUrl: './customer.html',
  styleUrl: './customer.css',
})
export class Customer implements OnInit {
  /**
   * Cấu hình bộ lọc - Truyền vào FilterDataPickerComponent
   * Định nghĩa các trường có thể filter
   */
  filterConfig: FilterConfig[] = [
    {
      key: 'maKhachHang',
      label: 'Mã khách hàng',
      type: 'text'
    },
    {
      key: 'tenKhachHang',
      label: 'Tên khách hàng',
      type: 'text'
    },
    {
      key: 'trangThai',
      label: 'Trạng thái',
      type: 'select',
      options: [
        { value: 'Chưa đăng ký khóa', label: 'Chưa đăng ký khóa' },
        { value: 'Đã đăng ký khóa', label: 'Đã đăng ký khóa' },
        { value: 'Đã khóa', label: 'Đã khóa' },
        { value: 'Đang hoạt động', label: 'Đang hoạt động' }
      ]
    }
  ];

  // View dialog configuration
  readonly viewDialogConfig = {
    cancelText: 'Đóng',
    hideSubmitButton: true
  };

  // All customer data from JSON (full data, không normalize)
  allCustomersRaw: any[] = [];

  // All customer data from JSON
  allCustomers: any[] = [];

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  pageSizeOptions = [10, 20, 50];

  // Filter properties
  filteredCustomers: any[] = [];
  paginatedCustomers: any[] = [];

  // Dialog + Reactive form
  isViewCustomerDialogOpen = false;
  detailForm: FormGroup<CustomerDetailFormGroup>;

  // Lock/Unlock confirmation dialog
  isConfirmLockDialogOpen = false;
  confirmLockItem: any = null;
  confirmLockMessage = '';

  genderOptions = [
    { value: 'Nam', label: 'Nam' },
    { value: 'Nữ', label: 'Nữ' },
    { value: 'Khác', label: 'Khác' }
  ];

  constructor(private clientService: Client, private cdr: ChangeDetectorRef, private formBuilder: FormBuilder) {
    this.detailForm = this.formBuilder.group<CustomerDetailFormGroup>({
      'Mã KH': this.formBuilder.control('', { nonNullable: true }),
      'Tên khách hàng': this.formBuilder.control('', { nonNullable: true }),
      'Giới tính': this.formBuilder.control('', { nonNullable: true }),
      'Ngày sinh': this.formBuilder.control('', { nonNullable: true }),
      'SĐT': this.formBuilder.control('', { nonNullable: true }),
      'Email': this.formBuilder.control('', { nonNullable: true }),
      'Ngày đăng ký': this.formBuilder.control('', { nonNullable: true }),
      'Trạng thái': this.formBuilder.control('', { nonNullable: true })
    });
  }

  private sortCustomersNewestFirst(items: any[]): any[] {
    return [...items].sort((left, right) => {
      const leftTime = new Date(left.createdAt || left.updatedAt || left.ngayDangKy || 0).getTime();
      const rightTime = new Date(right.createdAt || right.updatedAt || right.ngayDangKy || 0).getTime();
      return rightTime - leftTime;
    });
  }

  ngOnInit(): void {
    // Initialize pagination state before loading data
    this.currentPage = 1;
    this.itemsPerPage = 10; // Explicitly set default
    this.filteredCustomers = [];
    this.paginatedCustomers = [];

    // Load data
    this.loadData();
  }

  loadData(): void {
    this.clientService.getClients().subscribe({
      next: (data: iClient[]) => {
        // Lưu toàn bộ dữ liệu gốc từ API
        this.allCustomersRaw = data;

        // Normalize data: map API fields to UI fields
        this.allCustomers = this.sortCustomersNewestFirst(data.map(customer => ({
          maKhachHang: customer.maKh || '',
          tenKhachHang: customer.tenKhachHang || '',
          phone: customer.sdt ? String(customer.sdt) : '',
          trangThai: customer.trangThai || 'Chưa đăng ký khóa',
          // Lưu thêm dữ liệu đầy đủ để dùng cho view detail
          gioiTinh: customer.gioiTinh || '',
          ngaySinh: this.normalizeDateForInput(customer.ngaySinh),
          email: customer.email || '',
          ngayDangKy: this.normalizeDateForInput(customer.ngayDangKy),
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt,
          // Reference to raw data for view
          rawData: customer
        })));
        this.filteredCustomers = [...this.allCustomers];
        this.updatePagination();
      },
      error: (err) => {
        console.error('Error loading customer data:', err);
        // Fallback to sample data
        this.allCustomers = this.sortCustomersNewestFirst([
          { maKhachHang: 'KH001', tenKhachHang: 'Dương Trọng Nhân', phone: '0912345678', trangThai: 'Chưa đăng ký khóa', gioiTinh: 'Nam', ngaySinh: '1995-01-15', email: 'duong@example.com', ngayDangKy: '2026-05-01', rawData: {} },
          { maKhachHang: 'KH002', tenKhachHang: 'Cao Thành Thuận', phone: '0912345679', trangThai: 'Chưa đăng ký khóa', gioiTinh: 'Nam', ngaySinh: '1998-05-20', email: 'thuan@example.com', ngayDangKy: '2026-05-01', rawData: {} },
          { maKhachHang: 'KH003', tenKhachHang: 'Nguyễn Văn A', phone: '0912345680', trangThai: 'Chưa đăng ký khóa', gioiTinh: 'Nam', ngaySinh: '1996-03-10', email: 'nguyena@example.com', ngayDangKy: '2026-05-02', rawData: {} },
        ]);
        this.filteredCustomers = [...this.allCustomers];
        this.updatePagination();
      }
    });
  }

  /**
   * Xử lý sự kiện tìm kiếm từ FilterDataPickerComponent
   * Nhận filterValues object từ component con
   * Lọc dữ liệu dựa trên các điều kiện
   * @param filterValues Object chứa các giá trị filter { key: value }
   */
  onSearch(filterValues: any): void {
    // Lọc dữ liệu: kiểm tra từng trường trong filterValues
    this.filteredCustomers = this.allCustomers.filter(customer => {
      // Duyệt qua từng field trong filterValues
      return Object.keys(filterValues).every(key => {
        const filterValue = filterValues[key];
        const customerValue = customer[key];

        // Nếu không có giá trị filter cho field này, bỏ qua
        if (!filterValue) {
          return true;
        }

        // Thực hiện so sánh (hỗ trợ text substring match)
        if (typeof customerValue === 'string') {
          return customerValue.toLowerCase().includes(filterValue.toLowerCase());
        }

        // Cho các type khác, so sánh bằng
        return customerValue === filterValue;
      });
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  /**
   * Xử lý sự kiện reset từ FilterDataPickerComponent
   * Reset tất cả các filter
   */
  onReset(): void {
    this.filteredCustomers = [...this.allCustomers];
    this.currentPage = 1;
    this.updatePagination();
  }

  /**
   * Xem chi tiết khách hàng
   * @param item Dữ liệu khách hàng từ table
   */
  viewCustomerDetail(item: any): void {
    this.closeViewCustomerDialog();

    this.detailForm.patchValue({
      'Mã KH': `${item?.maKhachHang ?? ''}`,
      'Tên khách hàng': `${item?.tenKhachHang ?? ''}`,
      'Giới tính': `${item?.gioiTinh ?? ''}`,
      'Ngày sinh': `${item?.ngaySinh ?? ''}`,
      'SĐT': `${item?.phone ?? ''}`,
      'Email': `${item?.email ?? ''}`,
      'Ngày đăng ký': `${item?.ngayDangKy ?? ''}`,
      'Trạng thái': `${item?.trangThai ?? ''}`
    });

    this.detailForm.disable();
    this.isViewCustomerDialogOpen = true;
  }

  /**
   * Đóng dialog xem chi tiết
   */
  closeViewCustomerDialog(): void {
    this.isViewCustomerDialogOpen = false;
    this.detailForm.enable();
    this.detailForm.reset({
      'Mã KH': '',
      'Tên khách hàng': '',
      'Giới tính': '',
      'Ngày sinh': '',
      'SĐT': '',
      'Email': '',
      'Ngày đăng ký': '',
      'Trạng thái': ''
    });
  }

  /**
   * Normalize ngày từ định dạng "YYYY-MM-DD HH:MM:SS" thành "YYYY-MM-DD"
   * @param dateString Chuỗi ngày từ JSON
   * @returns Ngày đã normalize
   */
  private normalizeDateForInput(value: string | Date | undefined): string {
    if (!value) {
      return '';
    }
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    if (value.includes('T')) {
      return value.split('T')[0];
    }
    return value.split(' ')[0];
  }

  onPaginationPageChange(page: number): void {
    console.log('[Customer] onPaginationPageChange:', { newPage: page, currentPage: this.currentPage, itemsPerPage: this.itemsPerPage });
    this.currentPage = page;
    this.cdr.markForCheck(); // Force change detection
    this.updatePagination();
  }

  onPaginationPageSizeChange(size: number): void {
    console.log('[Customer] onPaginationPageSizeChange:', { newSize: size, oldSize: this.itemsPerPage });
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.cdr.markForCheck(); // Force change detection
    this.updatePagination();
  }

  updatePagination(): void {
    console.log('[Customer] updatePagination:', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
      filteredLength: this.filteredCustomers.length
    });

    // Safety check: validate itemsPerPage
    if (this.itemsPerPage <= 0) {
      console.error('[Customer] itemsPerPage is invalid:', this.itemsPerPage);
      this.itemsPerPage = 10; // Fallback to default
    }

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    console.log('[Customer] Slice parameters:', { start, end, arrayLength: this.filteredCustomers.length });

    this.paginatedCustomers = this.filteredCustomers.slice(start, end);

    console.log('[Customer] Paginated data count:', this.paginatedCustomers.length);
  }

  /**
   * Khởi tạo dialog xác nhận khóa/mở khóa khách hàng
   * @param item Khách hàng cần khóa/mở khóa
   */
  toggleLockStatus(item: any): void {
    this.confirmLockItem = item;
    const currentStatus = item?.trangThai;

    // Nếu đã khóa rồi thì mở khóa, ngược lại thì khóa
    const isCurrentlyLocked = currentStatus === 'Đã khóa';
    const action = isCurrentlyLocked ? 'mở khóa' : 'khóa';
    const newStatus = isCurrentlyLocked ? 'Chưa đăng ký khóa' : 'Đã khóa';

    this.confirmLockMessage = `Bạn có chắc chắn muốn ${action} khách hàng "${item?.tenKhachHang}" và đổi trạng thái thành "${newStatus}"?`;
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
    const customerId = this.confirmLockItem?.maKhachHang;

    // Cập nhật trạng thái trong local data (mock, sau này gọi API)
    const customerToUpdate = this.allCustomers.find(c => c.maKhachHang === customerId);
    if (customerToUpdate) {
      // Nếu đã khóa rồi thì mở khóa (=> Chưa đăng ký khóa), ngược lại thì khóa (=> Đã khóa)
      customerToUpdate.trangThai = currentStatus === 'Đã khóa' ? 'Chưa đăng ký khóa' : 'Đã khóa';
        this.allCustomers = this.sortCustomersNewestFirst(this.allCustomers);
      // Cập nhật filtered và paginated data
      this.filteredCustomers = [...this.allCustomers];
      this.updatePagination();
      this.cdr.markForCheck();
    }
    this.isConfirmLockDialogOpen = false;
    this.confirmLockItem = null;
  }

  /**
   * Hủy khóa/mở khóa
   */
  onCancelLock(): void {
    this.isConfirmLockDialogOpen = false;
    this.confirmLockItem = null;
  }

  /**
   * Kiểm tra xem khách hàng có bị khóa hay không
   */
  isLocked(item: any): boolean {
    return item?.trangThai === 'Đã khóa';
  }
}
