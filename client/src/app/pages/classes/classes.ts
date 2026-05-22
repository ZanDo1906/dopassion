import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Class } from '../../services/class';
import { iClass, ClassFilter } from '../../interfaces/class';
import { Course } from '../../services/course';
import { iCourse } from '../../interfaces/course';
import { VoucherService } from '../../services/voucher';
import { iVoucher } from '../../interfaces/voucher';
import { DateRangePickerComponent, DateRange } from '../../components/date-range-picker/date-range-picker';

interface ClassDetailView extends iClass {
  currentEnrollment: number;
  maxEnrollment: number;
  hocPhi: number;
}

interface RegistrationPreview {
  customerName: string;
  email: string;
}

interface VoucherPreviewOption {
  id: string;
  label: string;
  raw: iVoucher;
}

@Component({
  selector: 'app-classes',
  imports: [CommonModule, DateRangePickerComponent, FormsModule],
  providers: [Class],
  templateUrl: './classes.html',
  styleUrl: './classes.css',
})
export class Classes implements OnInit {
  // Biến lưu trữ bộ lọc hiện tại
  // Khởi tạo startDate/endDate rỗng để hiển thị Placeholder ban đầu
  currentFilters: ClassFilter = {
    courseCode: '',
    branch: '',
    startDate: '',
    endDate: '',
    keyword: ''
  };

  // Dữ liệu hiển thị trên UI
  courses: Array<{
    id?: string;
    code: string;
    title: string;
    startDate: string;
    branch: string;
    schedule: string;
    tuition: number;
    hasTest: boolean;
    raw: iClass;
  }> = [];

  private courseCatalogMap: Record<string, iCourse> = {};
  branchOptions: string[] = [];
  private voucherCatalog: iVoucher[] = [];
  voucherOptions: VoucherPreviewOption[] = [];

  isDetailModalOpen = false;
  isDetailLoading = false;
  detailError = '';
  selectedClassDetail: ClassDetailView | null = null;
  isRegisterModalOpen = false;
  registrationPreview: RegistrationPreview | null = null;
  registrationVoucherId = '';
  private readonly bodyOverflowBeforeModal = '';

  constructor(
    private classService: Class,
    private courseService: Course,
    private voucherService: VoucherService
  ) { }

  ngOnInit() {
    console.log('Classes component initialized');
    this.loadCourseCatalog();
    this.loadVoucherCatalog();
  }

  private loadCourseCatalog(): void {
    this.courseService.getCourses().subscribe({
      next: (courses: iCourse[]) => {
        this.courseCatalogMap = (courses || []).reduce((map, course) => {
          const normalizedCode = `${course.maKhoaHoc || ''}`.trim().toUpperCase();
          map[normalizedCode] = course;
          return map;
        }, {} as Record<string, iCourse>);

        this.loadClasses();
        this.loadBranchOptions();
      },
      error: (error) => {
        console.error('Error loading course catalog:', error);
        this.courseCatalogMap = {};
        this.loadClasses();
        this.loadBranchOptions();
      }
    });
  }

  private loadBranchOptions(): void {
    this.classService.getClasses().subscribe({
      next: (data: iClass[]) => {
        const branches = new Set<string>();

        (data || []).forEach((item) => {
          const branch = `${item.chiNhanh || ''}`.trim();
          if (branch) {
            branches.add(branch);
          }
        });

        this.branchOptions = Array.from(branches).sort();
      },
      error: (error) => {
        console.error('Error loading branch options:', error);
        this.branchOptions = [];
      }
    });
  }

  private loadVoucherCatalog(): void {
    this.voucherService.getVouchers().subscribe({
      next: (vouchers: iVoucher[]) => {
        this.voucherCatalog = vouchers || [];
        this.refreshVoucherOptions();
      },
      error: (error) => {
        console.error('Error loading voucher catalog:', error);
        this.voucherCatalog = [];
        this.voucherOptions = [];
      }
    });
  }

  private refreshVoucherOptions(): void {
    if (!this.selectedClassDetail) {
      this.voucherOptions = [];
      return;
    }

    const branch = `${this.selectedClassDetail.chiNhanh || ''}`.trim().toLowerCase();
    const courseCode = `${this.selectedClassDetail.maKhoa || ''}`.trim().toLowerCase();
    const courseName = `${this.selectedClassDetail.tenKhoaHoc || ''}`.trim().toLowerCase();

    const matchedVouchers = this.voucherCatalog.filter((voucher) => {
      const voucherBranch = `${voucher.chiNhanh || ''}`.trim().toLowerCase();
      const voucherCourse = `${voucher.khoaHocApDung || ''}`.trim().toLowerCase();

      const branchMatch = !voucherBranch || voucherBranch === 'tất cả' || voucherBranch === 'tat ca' || voucherBranch === branch;
      const courseMatch = !voucherCourse || voucherCourse === 'tất cả' || voucherCourse === 'tat ca'
        || voucherCourse === courseCode
        || voucherCourse.includes(courseCode)
        || voucherCourse.includes(courseName)
        || courseName.includes(voucherCourse);

      return voucher.active && branchMatch && courseMatch;
    });

    this.voucherOptions = matchedVouchers.map((voucher) => ({
      id: voucher._id || voucher.maVoucher,
      label: `${voucher.maVoucher} - ${voucher.tenChuongTrinh}`,
      raw: voucher
    }));

    if (this.voucherOptions.length > 0) {
      this.registrationVoucherId = this.voucherOptions[0].id;
    } else {
      this.registrationVoucherId = '';
    }
  }

  /**
   * Lấy dữ liệu lớp học từ Service với bộ lọc hiện tại
   */
  loadClasses() {
    // Chuẩn bị bộ lọc để gửi tới Service
    const filters: ClassFilter = {
      courseCode: this.currentFilters.courseCode || undefined,
      branch: this.currentFilters.branch || undefined,
      startDate: this.currentFilters.startDate,
      endDate: this.currentFilters.endDate,
      keyword: this.currentFilters.keyword || undefined
    };

    // Gọi Service để lấy dữ liệu đã được lọc
    this.classService.getClasses(filters).subscribe({
      next: (data: iClass[]) => {
        console.log('Filtered data received from service:', data);
        // Normalize để khớp với fields trong template
        this.courses = (data || []).map((item) => ({
          id: item._id,
          code: item.maLop || '',
          title: this.getCourseByClass(item)?.tenKhoaHoc || item.tenKhoaHoc || item.tenLop || item.maLop || '',
          startDate: item.ngayBatDau || '',
          branch: item.chiNhanh || '',
          schedule: item.khungGio || '',
          tuition: this.getTuitionForClass(item),
          hasTest: true,
          raw: item
        }));
        console.log('Total courses after filter:', this.courses.length);
      },
      error: (error) => {
        console.error('Error loading classes from service:', error);
        // Gán mảng rỗng khi có lỗi để hiển thị Empty State
        this.courses = [];
      }
    });
  }

  /**
   * Xử lý khi người dùng thay đổi lựa chọn khóa học
   * Cập nhật filter và gọi service để lấy dữ liệu mới
   */
  filterByCourse(event: any) {
    this.currentFilters.courseCode = event.target.value;
    console.log('Course filter changed:', this.currentFilters.courseCode);
  }

  /**
   * Xử lý khi người dùng thay đổi lựa chọn chi nhánh
   * Cập nhật filter và gọi service để lấy dữ liệu mới
   */
  filterByBranch(event: any) {
    this.currentFilters.branch = event.target.value;
    console.log('Branch filter changed:', this.currentFilters.branch);
  }

  /**
   * Xử lý khi người dùng thay đổi khoảng ngày khai giảng
   * Cập nhật filter và gọi service để lấy dữ liệu mới
   */
  onDateRangeChange(dateRange: DateRange) {
    this.currentFilters.startDate = dateRange.fromDate;
    this.currentFilters.endDate = dateRange.toDate;
    console.log('Date range changed:', {
      startDate: this.currentFilters.startDate,
      endDate: this.currentFilters.endDate
    });
  }

  /**
   * Format ngày tháng hiển thị trên UI
   */
  formatDate(date: string): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  formatCurrency(amount: number | undefined): string {
    const value = Number(amount) || 0;
    return new Intl.NumberFormat('vi-VN').format(value);
  }

  private getCourseByClass(item: iClass): iCourse | null {
    const classKey = `${item.maKhoa || ''}`.trim().toUpperCase();
    return this.courseCatalogMap[classKey] || null;
  }

  private getTuitionForClass(item: iClass): number {
    const course = this.getCourseByClass(item);
    if (course) {
      return Number(course.hocPhi) || 0;
    }

    const classKey = `${item.maKhoa || ''}`.trim().toUpperCase();
    const courseCode = `${item.tenKhoaHoc || ''}`.trim();

    const fallbackKey = courseCode.toUpperCase().includes('LISTENING')
      ? 'LR'
      : courseCode.toUpperCase().includes('SPEAKING')
        ? 'SW'
        : classKey;

    return Number(this.courseCatalogMap[fallbackKey]?.hocPhi) || 0;
  }

  /**
   * Thực hiện tìm kiếm với các bộ lọc hiện tại
   * Gọi Service với ClassFilter object để lấy dữ liệu đã được lọc
   * Logic lọc (filter) hoàn toàn được xử lý bên Service
   */
  onSearch() {
    console.log('Search button clicked with filters:', this.currentFilters);
    this.loadClasses();
  }

  /**
   * Mở popup xem chi tiết lớp học.
   * Gọi API backend theo maLop để lấy thêm sĩ số hiện tại.
   */
  openClassDetail(courseCode: string): void {
    if (!courseCode) {
      return;
    }

    this.isDetailModalOpen = true;
    document.body.style.overflow = 'hidden';
    this.isDetailLoading = true;
    this.detailError = '';
    this.selectedClassDetail = null;

    this.classService.getClassDetailByMaLop(courseCode).subscribe({
      next: (data) => {
        const course = this.getCourseByClass(data);
        this.selectedClassDetail = {
          ...(data as ClassDetailView),
          hocPhi: Number(course?.hocPhi) || this.getTuitionForClass(data)
        };
        this.isDetailLoading = false;
      },
      error: (error) => {
        console.error('Error loading class detail:', error);
        this.detailError = 'Không thể tải thông tin chi tiết lớp học.';
        this.isDetailLoading = false;
      }
    });
  }

  closeClassDetail(): void {
    this.isDetailModalOpen = false;
    document.body.style.overflow = '';
    this.isDetailLoading = false;
    this.detailError = '';
    this.selectedClassDetail = null;
  }

  registerNow(): void {
    if (!this.selectedClassDetail) {
      return;
    }

    this.registrationPreview = {
      customerName: 'Nguyễn Minh Đức',
      email: 'duc.nguyen@gmail.com'
    };

    this.refreshVoucherOptions();
    this.isRegisterModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeRegisterModal(): void {
    this.isRegisterModalOpen = false;
    this.registrationPreview = null;
    this.registrationVoucherId = '';
    if (!this.isDetailModalOpen) {
      document.body.style.overflow = '';
    }
  }

  onVoucherChange(event: Event): void {
    const target = event.target as HTMLSelectElement | null;
    this.registrationVoucherId = target?.value || '';
  }

  getSelectedVoucher(): VoucherPreviewOption | null {
    return this.voucherOptions.find((voucher) => voucher.id === this.registrationVoucherId) || null;
  }

  private getVoucherDiscountAmount(voucher: iVoucher | null | undefined): number {
    if (!voucher || !this.selectedClassDetail) {
      return 0;
    }

    const tuition = Number(this.selectedClassDetail.hocPhi) || 0;
    const rawValue = Number(voucher.thongSo) || 0;
    const unit = `${voucher.donViGiam || ''}`.trim().toLowerCase();

    if (rawValue <= 0 || tuition <= 0) {
      return 0;
    }

    const isPercentage = unit.includes('%') || unit.includes('phan tram') || unit.includes('phần trăm');
    const isMoney = unit.includes('vnd') || unit.includes('vnđ') || unit.includes('dong') || unit.includes('đ');

    let discountAmount = 0;
    if (isPercentage) {
      discountAmount = (tuition * rawValue) / 100;
    } else if (isMoney) {
      discountAmount = rawValue;
    } else if (rawValue > 0 && rawValue <= 100) {
      discountAmount = (tuition * rawValue) / 100;
    } else {
      discountAmount = rawValue;
    }

    return Math.max(0, Math.min(tuition, discountAmount));
  }

  getSelectedVoucherDiscountAmount(): number {
    return this.getVoucherDiscountAmount(this.getSelectedVoucher()?.raw);
  }

  getRemainingAmount(): number {
    const tuition = Number(this.selectedClassDetail?.hocPhi) || 0;
    const discountAmount = this.getSelectedVoucherDiscountAmount();
    return Math.max(0, tuition - discountAmount);
  }

  getDiscountLabel(): string {
    const voucher = this.getSelectedVoucher()?.raw;
    if (!voucher) {
      return 'Không áp dụng voucher';
    }

    const unit = `${voucher.donViGiam || ''}`.trim();
    const rawValue = Number(voucher.thongSo) || 0;
    if (unit.includes('%') || unit.toLowerCase().includes('phan tram') || unit.toLowerCase().includes('phần trăm')) {
      return `Giảm ${rawValue}%`;
    }

    return `Giảm ${this.formatCurrency(rawValue)} VND`;
  }

  continueRegistration(): void {
    if (!this.selectedClassDetail || !this.registrationPreview) {
      return;
    }

    console.log('Continue registration:', {
      customer: this.registrationPreview,
      classDetail: this.selectedClassDetail,
      voucher: this.getSelectedVoucher()?.raw || null,
      discountAmount: this.getSelectedVoucherDiscountAmount(),
      remainingAmount: this.getRemainingAmount()
    });
  }

  /**
   * Reset tất cả các bộ lọc về trạng thái mặc định
   * - Reset courseCode (Khóa học)
   * - Reset branch (Chi nhánh)
   * - Reset startDate/endDate (Khoảng thời gian) - Về rỗng để hiển thị Placeholder
   * - Reset keyword (Từ khóa tìm kiếm)
   * - Load lại dữ liệu toàn bộ danh sách
   */
  resetFilters() {
    console.log('Resetting all filters');

    // Reset tất cả filters về giá trị mặc định (rỗng)
    // startDate/endDate rỗng sẽ lọc toàn bộ dữ liệu (không hạn chế ngày)
    this.currentFilters = {
      courseCode: '',
      branch: '',
      startDate: '',
      endDate: '',
      keyword: ''
    };

    // Reset các select elements
    const courseSelect = document.querySelector(
      'select[title*="Khóa"]'
    ) as HTMLSelectElement;
    const branchSelect = document.querySelector(
      'select[title*="Chi"]'
    ) as HTMLSelectElement;

    if (courseSelect) courseSelect.value = '';
    if (branchSelect) branchSelect.value = '';

    console.log('All filters reset to defaults:', this.currentFilters);

    // Load lại danh sách đầy đủ
    this.loadClasses();
  }

  trackByCourseId(index: number, course: { id?: string; code: string }): string {
    return course.id || course.code || String(index);
  }

  formatDisplayDate(date: string): string {
    if (!date) {
      return '---';
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const year = parsedDate.getFullYear();
    return `${year}-${month}-${day}`;
  }
}
