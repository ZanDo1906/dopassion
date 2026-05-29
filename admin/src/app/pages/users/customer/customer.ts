import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Customer as CustomerService } from '../../../services/customer';
import { iCustomer } from '../../../interfaces/customer';
import { FilterDataPicker, FilterConfig } from '../../../components/filter-data-picker/filter-data-picker';
import { PaginationComponent } from '../../../components/pagination/pagination';
import { FormDialogComponent } from '../../../components/form-dialog/form-dialog';
import { ConfirmDialog } from '../../../components/confirm-dialog/confirm-dialog';
import { RegistrationService } from '../../../services/registration';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
      key: 'trangThaiHoatDong',
      label: 'Trạng thái hoạt động',
      type: 'select',
      options: [
        {
          value: 'Đang hoạt động',
          label: 'Đang hoạt động'
        },
        {
          value: 'Đã khóa',
          label: 'Đã khóa'
        }
      ]
    },
    {
      key: 'trangThaiDangKy',
      label: 'Trạng thái đăng ký',
      type: 'select',
      options: [
        {
          value: 'Đã đăng ký',
          label: 'Đã đăng ký'
        },
        {
          value: 'Chưa đăng ký khóa học này',
          label: 'Chưa đăng ký khóa học này'
        }
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
  isLockWarningOnly = false;

  genderOptions = [
    { value: 'Nam', label: 'Nam' },
    { value: 'Nữ', label: 'Nữ' },
    { value: 'Khác', label: 'Khác' }
  ];

  constructor(private customerService: CustomerService, private cdr: ChangeDetectorRef, private formBuilder: FormBuilder,   private registrationService: RegistrationService,) {
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

    // Subscribe to customer changes so the list refreshes when new customers are added elsewhere
    try {
      this.customerService.customersChanged$.subscribe((customer) => {
        console.log('[Customer] customersChanged event received:', customer);
        // reload list to ensure newly created customers are shown
        this.loadData();
      });
    } catch (e) {
      console.warn('Failed to subscribe to customersChanged$', e);
    }
  }

  loadData(): void {
  this.customerService.getCustomers().subscribe({
    next: (clients: iCustomer[]) => {
      this.registrationService.getRegistrations().subscribe({
        next: (registrations: any[]) => {
          // Danh sách mã khách đã đăng ký
          const registeredCustomerIds = registrations.map(r => r.maKh);
          this.allCustomersRaw = clients;
          this.allCustomers = this.sortCustomersNewestFirst(
            clients.map(customer => {
              // Kiểm tra khách có tồn tại trong bảng registration không
              const hasRegistration = registeredCustomerIds.includes(customer.maKh);
              return {
                maKhachHang: customer.maKh || '',
                tenKhachHang: customer.tenKhachHang || '',
                phone: customer.sdt ? String(customer.sdt) : '',
                trangThaiHoatDong:
                  customer.active
                    ? 'Đang hoạt động'
                    : 'Đã khóa',
                // ===== SỬA LOGIC Ở ĐÂY =====
                trangThaiDangKy:
                  hasRegistration
                    ? 'Đã đăng ký'
                    : 'Chưa đăng ký khóa học này',
                gioiTinh: customer.gioiTinh || '',
                ngaySinh: this.normalizeDateForInput(customer.ngaySinh),
                email: customer.email || '',
                ngayDangKy: this.normalizeDateForInput(customer.ngayDangKy),
                createdAt: customer.createdAt,
                updatedAt: customer.updatedAt,
                rawData: customer
              };
            })
          );
          this.filteredCustomers = [...this.allCustomers];
          this.updatePagination();
        },
        error: (err) => {
          console.error('Error loading registrations:', err);
        }
      });
    },
    error: (err) => {
      console.error('Error loading customer data:', err);
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
        // SELECT
        if (
          key === 'trangThaiHoatDong' ||
          key === 'trangThaiDangKy'
        ) {
          return customerValue === filterValue;
        }
        // TEXT
        return customerValue
          .toLowerCase()
          .includes(filterValue.toLowerCase());
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
      'Trạng thái':`${item?.trangThaiHoatDong ?? ''}`
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
  const currentStatus = item?.trangThaiHoatDong;
  const isCurrentlyLocked = currentStatus === 'Đã khóa';
  // Nếu đang hoạt động => chuẩn bị khóa
  if (!isCurrentlyLocked) {
    // Đã đăng ký khóa học => không cho khóa
    if (item?.trangThaiDangKy === 'Đã đăng ký') {
      this.confirmLockItem = null;
      this.isLockWarningOnly = true;
      this.confirmLockMessage =
        `Không thể khóa khách hàng "${item?.tenKhachHang}" vì khách hàng đã đăng ký khóa học.`;
      this.isConfirmLockDialogOpen = true;
      return;
    }
  }
  // Bình thường
  this.confirmLockItem = item;
  this.isLockWarningOnly = false;
  const action = isCurrentlyLocked ? 'mở khóa' : 'khóa';
  const newStatus = isCurrentlyLocked
    ? 'Đang hoạt động'
    : 'Đã khóa';
  this.confirmLockMessage =
    `Bạn có chắc chắn muốn ${action} khách hàng "${item?.tenKhachHang}" và đổi trạng thái thành "${newStatus}"?`;
  this.isConfirmLockDialogOpen = true;
}

  /**
   * Xác nhận khóa/mở khóa và cập nhật dữ liệu
   */
  onConfirmLock(): void {
    if (!this.confirmLockItem) {
      return;
    }

    const currentStatus = this.confirmLockItem?.trangThaiHoatDong;
    const customerId = this.confirmLockItem?.rawData?._id || this.confirmLockItem?._id;

    if (!customerId) {
      console.error('[Customer] No _id found for lock/unlock');
      return;
    }

    const isCurrentlyLocked = currentStatus === 'Đã khóa';
    const newStatus = isCurrentlyLocked
      ? 'Đang hoạt động'
      : 'Đã khóa';
    const newActive = isCurrentlyLocked
      ? true
      : false;
    // Gọi API cập nhật trạng thái vào database
    this.customerService.updateCustomer(customerId, {
      active: newActive
    }).subscribe({
      next: (response) => {
      console.log('UPDATE RESPONSE:', response);
        // Cập nhật local data sau khi DB thành công
        const customerToUpdate = this.allCustomers.find(c => c.maKhachHang === this.confirmLockItem?.maKhachHang);
        if (customerToUpdate) {
          customerToUpdate.trangThaiHoatDong = newStatus;
          customerToUpdate.active = newActive;
          this.allCustomers = this.sortCustomersNewestFirst(this.allCustomers);
          this.filteredCustomers = [...this.allCustomers];
          this.updatePagination();
          this.cdr.markForCheck();
        }
        this.isConfirmLockDialogOpen = false;
        this.confirmLockItem = null;
      },
      error: (err) => {
        console.error('[Customer] Lỗi cập nhật trạng thái:', err);
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
   * Kiểm tra xem khách hàng có bị khóa hay không
   */
  isLocked(item: any): boolean {
    return item?.trangThaiHoatDong === 'Đã khóa';
  }
  exportExcel(): void {

  // Xuất theo dữ liệu đang filter
  // KHÔNG dùng paginatedCustomers
  const exportData = this.filteredCustomers.map((customer, index) => {

    // Lấy raw data gốc từ DB
    const raw = customer.rawData || {};

    return {
      'STT': index + 1,
      'Mã khách hàng': raw.maKh || '',
      'Tên khách hàng': raw.tenKhachHang || '',
      'Giới tính': raw.gioiTinh || '',
      'Ngày sinh': this.normalizeDateForInput(raw.ngaySinh),
      'SĐT': raw.sdt || '',
      'Email': raw.email || '',
      'Ngày đăng ký': this.normalizeDateForInput(raw.ngayDangKy),
      'Trạng thái hoạt động':
        raw.active === true
          ? 'Đang hoạt động'
          : 'Đã khóa',

      'Trạng thái đăng ký':
        customer.trangThaiDangKy || '',

      'Ngày tạo': this.normalizeDateForInput(raw.createdAt),
      'Ngày cập nhật': this.normalizeDateForInput(raw.updatedAt)
    };
  });

  // Tạo worksheet
  const worksheet: XLSX.WorkSheet =
    XLSX.utils.json_to_sheet(exportData);

  // Auto width columns
  const columnWidths = Object.keys(exportData[0] || {}).map(key => ({
    wch: Math.max(key.length + 5, 20)
  }));

  worksheet['!cols'] = columnWidths;

  // Tạo workbook
  const workbook: XLSX.WorkBook = {
    Sheets: {
      'Danh sách khách hàng': worksheet
    },
    SheetNames: ['Danh sách khách hàng']
  };

  // Xuất file
  const excelBuffer: any =
    XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

  // Blob
  const data: Blob = new Blob(
    [excelBuffer],
    {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    }
  );

  // File name
  const fileName =
    `DanhSachKhachHang_${new Date().getTime()}.xlsx`;

  saveAs(data, fileName);
}
}
