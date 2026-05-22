import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FilterDataPicker, FilterConfig } from '../../../components/filter-data-picker/filter-data-picker';
import { PaginationComponent } from '../../../components/pagination/pagination';
import { FormDialogComponent } from '../../../components/form-dialog/form-dialog';
import { ConfirmDialog } from '../../../components/confirm-dialog/confirm-dialog';
import { RegistrationService } from '../../../services/registration';
import { RegistrationStepperDialog } from './registration-stepper-dialog';

type RegistrationDetailFormGroup = {
  'Mã đăng ký': FormControl<string>;
  'Mã KH': FormControl<string>;
  'Tên KH': FormControl<string>;
  'Mã lớp': FormControl<string>;
  'Tên lớp học': FormControl<string>;
  'Khóa học': FormControl<string>;
  'Tên khóa': FormControl<string>;
  'Chi nhánh': FormControl<string>;
  'Ngày đăng ký': FormControl<string>;
  'Trạng thái': FormControl<string>;
};

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FilterDataPicker, PaginationComponent, FormDialogComponent, ConfirmDialog, RegistrationStepperDialog],
  templateUrl: './registration.html',
  styleUrl: './registration.css',
})
export class Registration implements OnInit {
  /**
   * Cấu hình bộ lọc cho FilterDataPickerComponent
   * Gồm 3 trường: Mã đăng ký, Tên khách hàng, Tên lớp học
   */
  filterConfig: FilterConfig[] = [
    {
      key: 'id',
      label: 'Mã đăng ký',
      type: 'text'
    },
    {
      key: 'studentName',
      label: 'Tên khách hàng',
      type: 'text'
    },
    {
      key: 'className',
      label: 'Lớp học',
      type: 'text'
    },
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'select',
      options: [
        { value: 'Đang hoạt động', label: 'Đang hoạt động' },
        { value: 'Đã khóa', label: 'Đã khóa' },
        { value: 'Ngưng hoạt động', label: 'Ngưng hoạt động' },
        { value: 'Chưa đăng ký khóa', label: 'Chưa đăng ký khóa' }
      ]
    }
  ];

  /**
   * Danh sách tất cả đăng ký (từ API)
   */
  registrations: any[] = [];

  /**
   * Danh sách đăng ký đã lọc
   */
  filteredData: any[] = [];

  /**
   * Danh sách đăng ký hiển thị (sau phân trang)
   */
  paginatedData: any[] = [];

  /**
   * Biến phân trang
   */
  currentPage = 1;
  itemsPerPage = 10;
  pageSizeOptions = [10, 20, 50];

  // View dialog configuration
  readonly viewDialogConfig = {
    cancelText: 'Đóng',
    hideSubmitButton: true
  };

  // Dialog + Reactive form
  isViewRegistrationDialogOpen = false;
  detailForm: FormGroup<RegistrationDetailFormGroup>;

  // Lock/Unlock confirmation dialog
  isConfirmLockDialogOpen = false;
  confirmLockItem: any = null;
  confirmLockMessage = '';

  // Stepper dialog state
  isStepperDialogOpen = false;

  constructor(private registrationService: RegistrationService, private cdr: ChangeDetectorRef, private formBuilder: FormBuilder) {
    this.detailForm = this.formBuilder.group<RegistrationDetailFormGroup>({
      'Mã đăng ký': this.formBuilder.control('', { nonNullable: true }),
      'Mã KH': this.formBuilder.control('', { nonNullable: true }),
      'Tên KH': this.formBuilder.control('', { nonNullable: true }),
      'Mã lớp': this.formBuilder.control('', { nonNullable: true }),
      'Tên lớp học': this.formBuilder.control('', { nonNullable: true }),
      'Khóa học': this.formBuilder.control('', { nonNullable: true }),
      'Tên khóa': this.formBuilder.control('', { nonNullable: true }),
      'Chi nhánh': this.formBuilder.control('', { nonNullable: true }),
      'Ngày đăng ký': this.formBuilder.control('', { nonNullable: true }),
      'Trạng thái': this.formBuilder.control('', { nonNullable: true })
    });
  }

  private sortRegistrationsNewestFirst(items: any[]): any[] {
    return [...items].sort((left, right) => {
      const leftTime = new Date(left.createdAt || left.updatedAt || left.registrationDate || 0).getTime();
      const rightTime = new Date(right.createdAt || right.updatedAt || right.registrationDate || 0).getTime();
      return rightTime - leftTime;
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

  /**
   * Tải dữ liệu đăng ký từ API
   * Chuẩn hóa dữ liệu: đổi tên các khóa từ Tiếng Việt sang Anh
   */
  loadData(): void {
    this.registrationService.getRegistrations().subscribe({
      next: (data) => {
        // Chuẩn hóa dữ liệu: máp các khóa tiếng Việt thành khóa Anh
        this.registrations = this.sortRegistrationsNewestFirst(data.map(item => ({
          id: item.maDangKy || '',
          customerCode: item.maKh || '',
          studentName: item.tenKh || '',
          className: item.tenLopHoc || '',
          phone: '',
          registrationDate: this.normalizeDateForInput(item.ngayDangKy),
          status: item.trangThai || 'Đang hoạt động',
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          // Full data for view
          maLop: item.maLop || '',
          khoaHoc: item.khoaHoc || '',
          tenKhoa: item.tenKhoa || '',
          chiNhanh: item.chiNhanh || '',
          rawData: item
        })));
        this.filteredData = [...this.registrations];
        this.updatePagination();
      },
      error: (err) => {
        console.error('Lỗi tải dữ liệu đăng ký:', err);
        // Dữ liệu mẫu khi lỗi
        this.registrations = this.sortRegistrationsNewestFirst([
          {
            id: 'DK-020526-001',
            customerCode: 'KH-010526-001',
            studentName: 'Nguyễn Minh Anh',
            className: 'Lớp TOEIC Speaking&Writing CN1-001',
            phone: '0912345678',
            registrationDate: '2026-05-02',
            status: 'Đang hoạt động'
          },
          {
            id: 'DK-020526-002',
            customerCode: 'KH-010526-002',
            studentName: 'Trần Quốc Bảo',
            className: 'Lớp TOEIC Listening&Reading CN1-001',
            phone: '0912345679',
            registrationDate: '2026-05-02',
            status: 'Đang hoạt động'
          }
        ]);
        this.filteredData = [...this.registrations];
        this.updatePagination();
      }
    });
  }

  /**
   * Xử lý sự kiện tìm kiếm từ FilterDataPickerComponent
   * Lọc dữ liệu theo các điều kiện trong filterValues
   * @param criteria Object chứa các điều kiện lọc
   */
  handleSearch(criteria: any): void {
    this.filteredData = this.registrations.filter(registration => {
      // Lọc theo từng field trong criteria
      return Object.keys(criteria).every(key => {
        const filterValue = criteria[key];
        const registrationValue = registration[key];

        // Nếu không có giá trị lọc, bỏ qua
        if (!filterValue) {
          return true;
        }

        // So sánh chuỗi (không phân biệt hoa thường)
        if (typeof registrationValue === 'string') {
          return registrationValue.toLowerCase().includes(filterValue.toLowerCase());
        }

        return registrationValue === filterValue;
      });
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  /**
   * Xử lý sự kiện reset bộ lọc
   * Khôi phục danh sách gốc
   */
  handleReset(): void {
    this.filteredData = [...this.registrations];
    this.currentPage = 1;
    this.updatePagination();
  }

  /**
   * Xem chi tiết đăng ký
   * @param item Dữ liệu đăng ký từ table
   */
  viewRegistrationDetail(item: any): void {
    this.closeViewRegistrationDialog();

    this.detailForm.patchValue({
      'Mã đăng ký': `${item?.id ?? ''}`,
      'Mã KH': `${item?.customerCode ?? ''}`,
      'Tên KH': `${item?.studentName ?? ''}`,
      'Mã lớp': `${item?.maLop ?? ''}`,
      'Tên lớp học': `${item?.className ?? ''}`,
      'Khóa học': `${item?.khoaHoc ?? ''}`,
      'Tên khóa': `${item?.tenKhoa ?? ''}`,
      'Chi nhánh': `${item?.chiNhanh ?? ''}`,
      'Ngày đăng ký': `${item?.registrationDate ?? ''}`,
      'Trạng thái': `${item?.status ?? ''}`
    });

    this.detailForm.disable();
    this.isViewRegistrationDialogOpen = true;
  }

  /**
   * Đóng dialog xem chi tiết
   */
  closeViewRegistrationDialog(): void {
    this.isViewRegistrationDialogOpen = false;
    this.detailForm.enable();
    this.detailForm.reset({
      'Mã đăng ký': '',
      'Mã KH': '',
      'Tên KH': '',
      'Mã lớp': '',
      'Tên lớp học': '',
      'Khóa học': '',
      'Tên khóa': '',
      'Chi nhánh': '',
      'Ngày đăng ký': '',
      'Trạng thái': ''
    });
  }

  /**
   * Normalize ngày từ định dạng "YYYY-MM-DD HH:MM:SS" thành "YYYY-MM-DD"
   */
  private normalizeDateForInput(value: string): string {
    if (!value) {
      return '';
    }
    return value.split(' ')[0];
  }

  /**
   * Xử lý sự kiện thay đổi trang từ PaginationComponent
   * Cập nhật currentPage và cắt lại dữ liệu
   * @param page Số trang mới
   */
  onPaginationPageChange(page: number): void {
    console.log('[Registration] onPaginationPageChange:', { newPage: page, currentPage: this.currentPage });
    this.currentPage = page;
    this.cdr.markForCheck(); // Force change detection
    this.updatePagination();
  }

  /**
   * Xử lý sự kiện thay đổi kích thước trang từ PaginationComponent
   * Cập nhật itemsPerPage, reset currentPage về 1, và cắt lại dữ liệu
   * @param size Số lượng item mỗi trang
   */
  onPaginationPageSizeChange(size: number): void {
    console.log('[Registration] onPaginationPageSizeChange:', { newSize: size, oldSize: this.itemsPerPage });
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.cdr.markForCheck(); // Force change detection
    this.updatePagination();
  }

  /**
   * Cập nhật phân trang: cắt mảng dữ liệu theo currentPage và itemsPerPage
   */
  updatePagination(): void {
    console.log('[Registration] updatePagination:', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
      filteredLength: this.filteredData.length
    });

    // Safety check: validate itemsPerPage
    if (this.itemsPerPage <= 0) {
      console.error('[Registration] itemsPerPage is invalid:', this.itemsPerPage);
      this.itemsPerPage = 10; // Fallback to default
    }

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    console.log('[Registration] Slice parameters:', { start, end, arrayLength: this.filteredData.length });

    this.paginatedData = this.filteredData.slice(start, end);

    console.log('[Registration] Paginated data count:', this.paginatedData.length);
  }

  /**
   * Khởi tạo dialog xác nhận khóa/mở khóa đăng ký
   * @param item Đăng ký cần khóa/mở khóa
   */
  toggleLockStatus(item: any): void {
    this.confirmLockItem = item;
    const currentStatus = item?.status;
    const action = currentStatus === 'Đang hoạt động' ? 'khóa' : 'mở khóa';
    const newStatus = currentStatus === 'Đang hoạt động' ? 'Đã khóa' : 'Đang hoạt động';

    this.confirmLockMessage = `Bạn có chắc chắn muốn ${action} đăng ký "${item?.studentName}" và đổi trạng thái thành "${newStatus}"?`;
    this.isConfirmLockDialogOpen = true;
  }

  /**
   * Xác nhận khóa/mở khóa và cập nhật dữ liệu
   */
  onConfirmLock(): void {
    if (!this.confirmLockItem) {
      return;
    }

    const currentStatus = this.confirmLockItem?.status;
    const registrationId = this.confirmLockItem?.id;

    // Cập nhật trạng thái trong local data (mock, sau này gọi API)
    const registrationToUpdate = this.registrations.find(r => r.id === registrationId);
    if (registrationToUpdate) {
      registrationToUpdate.status = currentStatus === 'Đang hoạt động' ? 'Đã khóa' : 'Đang hoạt động';
      this.registrations = this.sortRegistrationsNewestFirst(this.registrations);
      // Cập nhật filtered và paginated data
      this.filteredData = [...this.registrations];
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
   * Kiểm tra xem đăng ký có bị khóa hay không
   */
  isLocked(item: any): boolean {
    return item?.status === 'Đã khóa';
  }

  /**
   * ========== REGISTRATION STEPPER DIALOG METHODS ==========
   */

  /**
   * Mở dialog stepper để tạo đăng ký mới
   */
  openStepperDialog(): void {
    this.isStepperDialogOpen = true;
  }

  /**
   * Đóng dialog stepper
   */
  closeStepperDialog(): void {
    this.isStepperDialogOpen = false;
  }

  /**
   * Xử lý success từ stepper dialog
   * Tại đây có thể refresh danh sách hoặc hiển thị thông báo
   */
  onStepperSuccess(result: any): void {
    console.log('Registration stepper success:', result);
    
    // If stepper returned the created registration object, prepend it to the list for immediate visibility
    if (result && result.registration && typeof result.registration === 'object') {
      const reg = result.registration;
      const mapped = {
        id: reg.maDangKy || '',
        customerCode: reg.maKh || '',
        studentName: reg.tenKh || '',
        className: reg.tenLopHoc || '',
        phone: '',
        registrationDate: this.normalizeDateForInput(reg.ngayDangKy ? (typeof reg.ngayDangKy === 'string' ? reg.ngayDangKy : new Date(reg.ngayDangKy).toISOString()) : ''),
        status: reg.trangThai || 'Đang hoạt động',
        maLop: reg.maLop || '',
        khoaHoc: reg.khoaHoc || '',
        tenKhoa: reg.tenKhoa || '',
        chiNhanh: reg.chiNhanh || '',
        rawData: reg
      };

      // Prepend into arrays
      this.registrations = [mapped, ...this.registrations];
      this.filteredData = [mapped, ...this.filteredData];
      this.currentPage = 1;
      this.updatePagination();
    } else {
      // Fallback: refresh full list
      this.loadData();
    }
    
    // Đóng dialog
    this.isStepperDialogOpen = false;

    // TODO: Hiển thị notification thành công
    // this.notificationService.showSuccess('Đăng ký khóa học thành công');
  }
}
