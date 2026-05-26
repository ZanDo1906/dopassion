import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Class } from '../../services/class';
import { iClass, ClassFilter } from '../../interfaces/class';
import { Course } from '../../services/course';
import { iCourse } from '../../interfaces/course';
import { VoucherService } from '../../services/voucher';
import { iVoucher } from '../../interfaces/voucher';
import { DateRangePickerComponent, DateRange } from '../../components/date-range-picker/date-range-picker';
import { Client } from '../../services/client';
import { RegistrationService } from '../../services/registration';
import { Payment } from '../../services/payment';
import { iPayment } from '../../interfaces/payment';
import { iRegistration } from '../../interfaces/registration';
import { iClient } from '../../interfaces/client';

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
export class Classes implements OnInit, OnDestroy {
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

  // Payment states
  isPaymentModalOpen = false;
  paymentTimer = 600; // 10 mins
  paymentCountdownString = '10:00';
  paymentInterval: any = null;
  createdPayment: iPayment | null = null;
  createdRegistration: iRegistration | null = null;
  createdClient: iClient | null = null;
  copiedField: string | null = null;
  isPaymentExpired = false;
  isCheckingOut = false;

  // Đăng ký hiện có của khách hàng (từ DB + session)
  activeRegistrations: iRegistration[] = [];
  allRegistrations: iRegistration[] = [];
  allClients: iClient[] = [];
  // Cờ cho biết khách không còn lớp phù hợp (có cả LR + SW)
  noClassAvailable = false;
  noClassMessage = '';

  constructor(
    private classService: Class,
    private courseService: Course,
    private voucherService: VoucherService,
    private clientService: Client,
    private registrationService: RegistrationService,
    private paymentService: Payment
  ) { }

  ngOnDestroy() {
    this.clearPaymentTimer();
  }

  private clearPaymentTimer() {
    if (this.paymentInterval) {
      clearInterval(this.paymentInterval);
      this.paymentInterval = null;
    }
  }

  ngOnInit() {
    console.log('Classes component initialized');
    this.loadActiveRegistrations();
    this.loadAllClients();
    this.loadCourseCatalog();
    this.loadVoucherCatalog();
  }

  /**
   * Tải toàn bộ danh sách khách hàng để phục vụ việc sinh mã KH tự động
   */
  private loadAllClients(): void {
    this.clientService.getClients().subscribe({
      next: (clients: iClient[]) => {
        this.allClients = clients || [];
      },
      error: () => {
        this.allClients = [];
      }
    });
  }

  /**
   * Tải danh sách đăng ký đang hoạt động từ DB
   * Sau có login: lọc theo maKh của user đã login
   * Hiện tại: lấy tất cả đăng ký có maKh rỗng (tạo từ client chưa login)
   */
  private loadActiveRegistrations(): void {
    this.registrationService.getRegistrations().subscribe({
      next: (regs: iRegistration[]) => {
        this.allRegistrations = regs || [];
        // TODO: Khi có login, lọc theo maKh của user: regs.filter(r => r.maKh === currentUser.maKh)
        // Hiện tại: lấy các đăng ký có maKh rỗng (đăng ký từ client chưa login)
        this.activeRegistrations = this.allRegistrations.filter(
          r => r.trangThai === 'Đang hoạt động' && (!r.maKh || r.maKh === '')
        );
        console.log('[Registration] Active registrations loaded:', this.activeRegistrations.length);
      },
      error: () => {
        this.activeRegistrations = [];
        this.allRegistrations = [];
      }
    });
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

        // ===== Lọc theo đăng ký hiện có =====
        const filteredByReg = this.filterByRegistrations(data || []);

        // Normalize để khớp với fields trong template
        this.courses = filteredByReg.map((item) => ({
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

  /**
   * Lọc danh sách lớp theo đăng ký hiện có:
   * - Nếu có cả LR + SW đang hoạt động => không hiển lớp nào
   * - Nếu có LR => chỉ hiển SW
   * - Nếu có SW => chỉ hiển LR
   * - Check không trùng khungGio với đăng ký đang hoạt động
   */
  private filterByRegistrations(classes: iClass[]): iClass[] {
    if (this.activeRegistrations.length === 0) {
      this.noClassAvailable = false;
      this.noClassMessage = '';
      return classes;
    }

    // Kiểm tra khách hàng đã đăng ký khóa nào
    const hasLR = this.activeRegistrations.some(r => {
      const k = (r.khoaHoc || '').toUpperCase();
      return k === 'LR' || k.includes('LR');
    });
    const hasSW = this.activeRegistrations.some(r => {
      const k = (r.khoaHoc || '').toUpperCase();
      return k === 'SW' || k.includes('SW');
    });

    console.log('[Filter] Active courses:', { hasLR, hasSW });

    // Nếu có cả hai => không hiển lớp nào
    if (hasLR && hasSW) {
      this.noClassAvailable = true;
      this.noClassMessage = 'Bạn đã đăng ký cả khóa Listening & Reading và Speaking & Writing. Không còn lớp nào phù hợp.';
      return [];
    }

    this.noClassAvailable = false;
    this.noClassMessage = '';

    // Lấy danh sách khungGio đã đăng ký để check trùng
    const registeredSchedules = this.activeRegistrations
      .map(r => (r.maLop || '').toUpperCase())
      .filter(Boolean);

    // Lấy khungGio thực tế từ các lớp đã đăng ký
    const registeredKhungGios: string[] = [];
    for (const reg of this.activeRegistrations) {
      const regMaLop = (reg.maLop || '').toUpperCase();
      // Tìm class tương ứng để lấy khungGio
      const matchedClass = classes.find(c => (c.maLop || '').toUpperCase() === regMaLop);
      if (matchedClass && matchedClass.khungGio) {
        registeredKhungGios.push(matchedClass.khungGio.trim().toLowerCase());
      }
    }

    return classes.filter(cls => {
      const classCourseCode = (cls.maKhoa || '').toUpperCase();

      // Lọc theo khóa học: nếu có LR thì chỉ hiển SW, ngược lại
      if (hasLR && (classCourseCode === 'LR' || classCourseCode.includes('LR'))) {
        return false;
      }
      if (hasSW && (classCourseCode === 'SW' || classCourseCode.includes('SW'))) {
        return false;
      }

      // Check trùng khungGio
      const classSchedule = (cls.khungGio || '').trim().toLowerCase();
      if (classSchedule && registeredKhungGios.includes(classSchedule)) {
        return false;
      }

      return true;
    });
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

  /**
   * Đóng cả popup đăng ký và popup xem chi tiết lớp học.
   * Sử dụng cho nút 'x' trên popup đăng ký để tắt hoàn toàn view.
   */
  closeAllModals(): void {
    this.isRegisterModalOpen = false;
    this.registrationPreview = null;
    this.registrationVoucherId = '';

    this.isDetailModalOpen = false;
    this.isDetailLoading = false;
    this.detailError = '';
    this.selectedClassDetail = null;

    document.body.style.overflow = '';
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

    const isPercentageUnit = unit.includes('%') || unit.includes('phan tram') || unit.includes('phần trăm');
    const isMoney = unit.includes('vnd') || unit.includes('vnđ') || unit.includes('dong') || unit.includes('đ');

    let discountAmount = 0;
    // Interpret values carefully:
    // - If unit explicitly indicates money, treat rawValue as an absolute amount (VND).
    // - If rawValue is a fraction between 0 and 1 (e.g., 0.2), treat it as 20% (fractional percent).
    // - If rawValue is between 1 and 100, treat it as a percentage (e.g., 20 -> 20%).
    // - Values > 100 are treated as absolute amounts.
    if (isMoney) {
      discountAmount = rawValue;
    } else if (rawValue > 0 && rawValue < 1) {
      // Fractional form like 0.2 => 20%
      discountAmount = tuition * rawValue;
    } else if (rawValue >= 1 && rawValue <= 100) {
      // Percentage form like 20 => 20%
      discountAmount = (tuition * rawValue) / 100;
    } else if (isPercentageUnit && rawValue > 0) {
      // Fallback: if unit explicitly says percentage, but value looks large (>100), treat as percentage of tuition capped at tuition
      discountAmount = (tuition * rawValue) / 100;
    } else {
      // Otherwise, treat as absolute amount
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

    const unit = `${voucher.donViGiam || ''}`.trim().toLowerCase();
    const rawValue = Number(voucher.thongSo) || 0;

    const isPercentageUnit = unit.includes('%') || unit.includes('phan tram') || unit.includes('phần trăm');
    const isMoneyUnit = unit.includes('vnd') || unit.includes('vnđ') || unit.includes('dong') || unit.includes('đ');

    if (isMoneyUnit) {
      return `Giảm ${this.formatCurrency(rawValue)} VND`;
    }

    if (rawValue > 0 && rawValue < 1) {
      // fractional like 0.2 => 20%
      return `Giảm ${Number((rawValue * 100).toFixed(2))}%`;
    }

    if (rawValue >= 1 && rawValue <= 100) {
      return `Giảm ${rawValue}%`;
    }

    if (isPercentageUnit && rawValue > 0) {
      return `Giảm ${rawValue}%`;
    }

    // Fallback: treat as money
    return `Giảm ${this.formatCurrency(rawValue)} VND`;
  }

  // Mock data fields for payment screen
  mockPaymentAmount = 0;
  mockMaDangKy = '';

  /**
   * Tạo mã đăng ký theo format DK-ddmmyy-000 tăng dần trong ngày
   */
  private generateMaDangKy(): string {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);

    const prefix = `DK-${dd}${mm}${yy}`;

    // Tìm các mã đăng ký trong ngày hôm nay
    const todayRegs = this.allRegistrations
      .map(r => r.maDangKy)
      .filter(code => code && code.startsWith(prefix));

    let nextSeq = 1;
    if (todayRegs.length > 0) {
      // Lấy 3 số cuối của các mã, chuyển thành số, tìm max
      const maxSeq = Math.max(...todayRegs.map(code => {
        const parts = code.split('-');
        if (parts.length >= 3) {
          const seqNum = parseInt(parts[2], 10);
          return isNaN(seqNum) ? 0 : seqNum;
        }
        return 0;
      }));
      nextSeq = maxSeq + 1;
    }

    const seqStr = String(nextSeq).padStart(3, '0');
    return `${prefix}-${seqStr}`;
  }

  continueRegistration(): void {
    if (!this.selectedClassDetail || !this.registrationPreview || this.isCheckingOut) {
      return;
    }

    this.isCheckingOut = true;

    const now = new Date();
    const maDangKy = this.generateMaDangKy();
    const classDetail = this.selectedClassDetail;

    // Thông tin khách hàng - do chưa có login nên để trống
    const maKh = '';   // TODO: Lấy từ user đã login
    const tenKh = '';  // TODO: Lấy từ user đã login

    // Lấy thông tin khóa học
    const rawClass = classDetail as any;
    const khoaHoc = rawClass.khoaHoc || rawClass.maKhoa || '';
    const tenKhoa = rawClass.tenKhoaHoc || rawClass.tenKhoa || '';
    const maLop = classDetail.maLop || '';
    const tenLop = classDetail.tenLop || '';
    const chiNhanh = classDetail.chiNhanh || '';
    const hocPhi = Number(classDetail.hocPhi) || 0;

    // Voucher info
    const selectedVoucher = this.getSelectedVoucher();
    const voucherName = selectedVoucher?.raw?.maVoucher || selectedVoucher?.raw?.tenChuongTrinh || '';
    const thongSoGiam = this.getSelectedVoucherDiscountAmount();
    const soTienCanThanhToan = this.getRemainingAmount();

    // ===== STEP 1: Tạo đăng ký (registration) =====
    const registrationPayload: iRegistration = {
      maDangKy: maDangKy,
      maKh: maKh,               // Trống - sau có login fill vào
      tenKh: tenKh,             // Trống - sau có login fill vào
      maLop: maLop,
      tenLopHoc: tenLop,
      khoaHoc: khoaHoc,
      tenKhoa: tenKhoa,
      chiNhanh: chiNhanh,
      ngayDangKy: now.toISOString(),
      trangThai: 'Đang hoạt động'
    };

    this.registrationService.addRegistration(registrationPayload).subscribe({
      next: (savedReg: iRegistration) => {
        console.log('[Registration] Registration created:', savedReg);
        this.createdRegistration = savedReg;
        this.allRegistrations.push(savedReg);
        this.activeRegistrations.push(savedReg);

        // ===== STEP 2: Tạo công nợ (payment) với trạng thái 'Chờ thanh toán' =====
        const paymentPayload: iPayment = {
          maDangKy: maDangKy,
          maKh: maKh,             // Trống - sau có login fill vào
          tenKh: tenKh,           // Trống - sau có login fill vào
          maLop: maLop,
          tenLopHoc: tenLop,
          khoaHoc: khoaHoc,
          tenKhoa: tenKhoa,
          chiNhanh: chiNhanh,
          ngayDangKy: now.toISOString(),
          hocPhi: hocPhi,
          voucher: voucherName,
          thongSoGiam: thongSoGiam,
          soTienCanThanhToan: soTienCanThanhToan,
          soTienConLai: soTienCanThanhToan,
          trangThaiThanhToan: 'Chờ thanh toán'
        };

        this.paymentService.addPayment(paymentPayload).subscribe({
          next: (savedPayment: iPayment) => {
            console.log('[Registration] Payment created:', savedPayment);
            this.createdPayment = savedPayment;

            // Lưu thông tin để hiển thị trên màn hình thanh toán
            this.mockMaDangKy = maDangKy;
            this.mockPaymentAmount = soTienCanThanhToan;

            // Mở màn hình thanh toán
            this.isRegisterModalOpen = false;
            this.isPaymentModalOpen = true;
            this.isPaymentExpired = false;
            this.paymentTimer = 600; // 10 phút
            this.paymentCountdownString = '10:00';
            this.isCheckingOut = false;

            this.startPaymentTimer();
          },
          error: (err) => {
            console.error('[Registration] Error creating payment:', err);
            this.isCheckingOut = false;
            alert('Lỗi tạo công nợ. Vui lòng thử lại.');
          }
        });
      },
      error: (err) => {
        console.error('[Registration] Error creating registration:', err);
        this.isCheckingOut = false;
        alert('Lỗi tạo đăng ký. Vui lòng thử lại.');
      }
    });
  }


  startPaymentTimer(): void {
    this.clearPaymentTimer();
    this.paymentInterval = setInterval(() => {
      if (this.paymentTimer > 0) {
        this.paymentTimer--;
        const mins = Math.floor(this.paymentTimer / 60);
        const secs = this.paymentTimer % 60;
        this.paymentCountdownString = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      } else {
        this.clearPaymentTimer();
        this.isPaymentExpired = true;

        // Hết 10 phút → cập nhật trạng thái công nợ thành 'Chưa thanh toán'
        if (this.createdPayment?._id) {
          this.paymentService.updatePayment(this.createdPayment._id, {
            trangThaiThanhToan: 'Chưa thanh toán'
          }).subscribe({
            next: () => console.log('[Payment] Status updated to "Chưa thanh toán"'),
            error: (err) => console.error('[Payment] Error updating expired status:', err)
          });
        }
      }
    }, 1000);
  }

  getQrUrl(): string {
    const bankId = 'mbbank';
    const accountNo = '19062026';
    const template = 'qr_only';
    const accountName = encodeURIComponent('CONG TY CO PHAN DOPASSION');
    const amount = this.mockPaymentAmount || this.getRemainingAmount();
    const addInfo = encodeURIComponent(`DOPASSION ${this.mockMaDangKy}`);
    return `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${addInfo}&accountName=${accountName}`;
  }

  copyToClipboard(text: string, field: string): void {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this.copiedField = field;
      setTimeout(() => {
        if (this.copiedField === field) {
          this.copiedField = null;
        }
      }, 2000);
    });
  }

  closePaymentModal(): void {
    this.clearPaymentTimer();

    // Nếu user đóng modal mà chưa hết hạn → cập nhật trạng thái thành 'Đã hủy'
    if (!this.isPaymentExpired && this.createdPayment?._id) {
      this.paymentService.updatePayment(this.createdPayment._id, {
        trangThaiThanhToan: 'Đã hủy'
      }).subscribe({
        next: () => console.log('[Payment] Status updated to "Đã hủy"'),
        error: (err) => console.error('[Payment] Error updating cancelled status:', err)
      });
    }

    this.isPaymentModalOpen = false;
    this.mockPaymentAmount = 0;
    this.mockMaDangKy = '';
    this.createdPayment = null;
    this.createdRegistration = null;
    this.createdClient = null;
    this.closeAllModals();
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
