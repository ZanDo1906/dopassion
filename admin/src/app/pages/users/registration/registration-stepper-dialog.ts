import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { FilterDataPicker, FilterConfig } from '../../../components/filter-data-picker/filter-data-picker';
import { Client } from '../../../services/client';
import { Course } from '../../../services/course';
import { Class } from '../../../services/class';
import { RegistrationService } from '../../../services/registration';
import { Payment } from '../../../services/payment';
import { tap } from 'rxjs/operators';
import { iClient } from '../../../interfaces/client';
import { iCourse } from '../../../interfaces/course';
import { iClass } from '../../../interfaces/class';
import { iRegistration } from '../../../interfaces/registration';
import { iPayment } from '../../../interfaces/payment';

@Component({
  selector: 'app-registration-stepper-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FilterDataPicker],
  templateUrl: './registration-stepper-dialog.html',
  styleUrl: './registration-stepper-dialog.css'
})
export class RegistrationStepperDialog implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<any>();

  // Stepper state
  currentStep = 1;
  totalSteps = 3;
  isLoading = false;
  errorMessage = '';

  // Step 1: Customer search & info
  searchQuery = '';
  customers: iClient[] = [];
  selectedCustomer: iClient | null = null;
  customerForm: FormGroup | null = null;
  isNewCustomer = false;

  // Step 2: Class selection
  courses: iCourse[] = [];
  classes: iClass[] = [];
  filteredClasses: iClass[] = [];
  selectedClass: iClass | null = null;
  selectedClassKey = '';
  classForm: FormGroup | null = null;
  classFilterConfig: FilterConfig[] = [];
  existingRegistrations: iRegistration[] = [];
  customerExistingCourseTypes: string[] = []; // 'LR' or 'SW'
  customerExistingClasses: iClass[] = [];

  // Step 3: Review & Submit
  reviewForm: FormGroup | null = null;

  // Shared FormGroup
  mainForm: FormGroup;

  // Form dialog sections
  customerFormSections: any[] = [];
  classFormSections: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private clientService: Client,
    private courseService: Course,
    private classService: Class,
    private registrationService: RegistrationService,
    private paymentService: Payment
  ) {
    this.mainForm = this.formBuilder.group({});
  }

  ngOnInit(): void {
    this.loadCustomers();
    this.loadClasses();
    this.loadCourses();
    this.loadExistingRegistrations();
    this.initializeStep1();
  }

  /**
   * Tải danh sách đăng ký hiện có từ backend
   */
  private loadExistingRegistrations(): void {
    console.log('[loadExistingRegistrations] Starting to load...');
    this.registrationService.getRegistrations().subscribe({
      next: (data) => {
        this.existingRegistrations = data;
        console.log('[loadExistingRegistrations] SUCCESS - Loaded:', data.length, 'registrations');
        data.forEach((reg, idx) => {
          console.log(`  [${idx}] maKh="${reg.maKh}", maDangKy="${reg.maDangKy}", tenKhoa="${reg.tenKhoa}"`);
        });
      },
      error: (err) => {
        console.error('[loadExistingRegistrations] ERROR:', err);
      }
    });
  }

  /**
   * Trích xuất loại khóa học từ tên khóa học (LR hoặc SW)
   * VD: 
   * - 'Learn React (LR)' -> 'LR'
   * - 'TOEIC Listening&Reading' -> 'LR'
   * - 'Solidworks (SW)' -> 'SW'
   * - 'TOEIC Speaking&Writing' -> 'SW'
   */
  private extractCourseType(courseName: string | undefined): string | null {
    if (!courseName) return null;

    const name = courseName.toLowerCase();

    // Thử tìm pattern (LR) hoặc (SW)
    const match = name.match(/\((lr|sw)\)/i);
    if (match) {
      return match[1].toUpperCase();
    }

    // Kiểm tra cho LR (Learn React, Listening&Reading, Listening & Reading)
    if (
      name.includes('react') ||
      name.includes('learn') ||
      name.includes('listening') ||
      name.includes('reading') ||
      name.match(/listening\s*&\s*reading/i) ||
      name === 'lr'
    ) {
      console.log(`[extractCourseType] "${courseName}" -> LR (keyword match)`);
      return 'LR';
    }

    // Kiểm tra cho SW (Solidworks, Speaking&Writing, Speaking & Writing)
    if (
      name.includes('solidwork') ||
      name.includes('speaking') ||
      name.includes('writing') ||
      name.match(/speaking\s*&\s*writing/i) ||
      name === 'sw'
    ) {
      console.log(`[extractCourseType] "${courseName}" -> SW (keyword match)`);
      return 'SW';
    }

    // Không tìm thấy type
    console.warn('[extractCourseType] Could not extract type from course name:', courseName);
    return null;
  }

  /**
   * Lấy danh sách loại khóa học từ các khóa học đã đăng ký của khách hàng
   * Kiểm tra khách hàng có đăng ký cả 2 loại (LR và SW) không
   */
  private getCustomerExistingCourseTypes(customerId: string): string[] {
    const types = new Set<string>();

    console.log('=== CHECK EXISTING REGISTRATIONS ===');
    console.log('Looking for registrations of customer ID (maKh):', customerId);
    console.log('Total registrations in system:', this.existingRegistrations.length);

    // In ra tất cả registrations để debug
    if (this.existingRegistrations.length > 0) {
      console.log('All registrations:');
      this.existingRegistrations.forEach((reg, idx) => {
        console.log(`  [${idx}] maKh="${reg.maKh}", tenKh="${reg.tenKh}", maDangKy="${reg.maDangKy}", tenKhoa="${reg.tenKhoa}"`);
      });
    } else {
      console.warn('No registrations loaded yet!');
    }

    // Lọc đăng ký theo nhiều chiến lược: maKh, tenKh, sdt
    const customerRegs = this.existingRegistrations.filter(reg => {
      const regMaKh = (reg.maKh || '').toString();
      const regTenKh = (reg.tenKh || '').toString().toLowerCase();
      const regPhone = ((reg as any).sdt || '').toString().replace(/\D/g, '');

      const targetMaKh = (customerId || '').toString();
      const targetTenKh = (this.selectedCustomer?.tenKhachHang || '').toString().toLowerCase();
      const targetPhone = (this.selectedCustomer?.sdt || '').toString().replace(/\D/g, '');

      const matchMaKh = regMaKh && targetMaKh && regMaKh === targetMaKh;
      const matchTenKh = regTenKh && targetTenKh && regTenKh === targetTenKh;
      const matchPhone = regPhone && targetPhone && regPhone === targetPhone;

      if (matchMaKh || matchTenKh || matchPhone) {
        console.log(`[getCustomerExistingCourseTypes] matched registration by ${matchMaKh ? 'maKh' : matchTenKh ? 'tenKh' : 'phone'}`);
        return true;
      }
      return false;
    });

    console.log('Found registrations matching maKh:', customerRegs.length);
    customerRegs.forEach((reg, idx) => {
      console.log(`  [${idx}] maKh=${reg.maKh}, tenKhoa=${reg.tenKhoa}, maDangKy=${reg.maDangKy}`);
    });

    // Trích xuất loại khóa học từ tên khóa học
    customerRegs.forEach(reg => {
      const courseType = this.extractCourseType(reg.tenKhoa);
      console.log(`  Processing course: "${reg.tenKhoa}" -> Type: ${courseType}`);
      if (courseType) {
        types.add(courseType);
      }
    });

    const result = Array.from(types);
    console.log('Final course types found:', result);
    return result;
  }

  /**
   * Lấy danh sách lớp học đã đăng ký của khách hàng
   */
  private getCustomerExistingClasses(customerId: string): iClass[] {
    // Use same flexible matching as course types (maKh, tenKh, phone)
    const customerRegs = this.existingRegistrations.filter(reg => {
      const regMaKh = (reg.maKh || '').toString();
      const regTenKh = (reg.tenKh || '').toString().toLowerCase();
      const regPhone = ((reg as any).sdt || '').toString().replace(/\D/g, '');

      const targetMaKh = (customerId || '').toString();
      const targetTenKh = (this.selectedCustomer?.tenKhachHang || '').toString().toLowerCase();
      const targetPhone = (this.selectedCustomer?.sdt || '').toString().replace(/\D/g, '');

      return (regMaKh && targetMaKh && regMaKh === targetMaKh)
        || (regTenKh && targetTenKh && regTenKh === targetTenKh)
        || (regPhone && targetPhone && regPhone === targetPhone);
    });

    console.log(`Found ${customerRegs.length} registrations to match with classes`);

    const matchedClasses = this.classes.filter(cls =>
      customerRegs.some(reg => reg.maLop === cls.maLop)
    );

    console.log(`Matched ${matchedClasses.length} classes for customer`);
    return matchedClasses;
  }

  /**
   * ========== STEP 1: CUSTOMER SEARCH & INFO ==========
   */

  private loadCustomers(): void {
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.customers = data;
      },
      error: (err) => {
        console.error('Lỗi tải danh sách khách hàng:', err);
        this.errorMessage = 'Không thể tải danh sách khách hàng';
      }
    });
  }

  private loadClasses(): void {
    this.classService.getClasses().subscribe({
      next: (data) => {
        this.classes = data;
        const deduped = this.dedupeClasses(data);
        this.filteredClasses = [...deduped];
        console.log('Classes loaded:', deduped.length);
      },
      error: (err) => {
        console.error('Lỗi tải danh sách lớp học:', err);
        this.errorMessage = 'Không thể tải danh sách lớp học';
      }
    });
  }

  private loadCourses(): void {
    this.courseService.getCourses().subscribe({
      next: (data) => {
        this.courses = data;
        console.log('Courses loaded:', data.length);
      },
      error: (err) => {
        console.error('Lỗi tải danh sách khóa học:', err);
      }
    });
  }

  /**
   * Tìm kiếm khách hàng theo SĐT hoặc Email
   * Kiểm tra quy tắc: khách hàng chỉ được đăng ký 1 trong 2 khóa (LR hoặc SW)
   */
  searchCustomer(): void {
    this.errorMessage = '';

    if (!this.searchQuery.trim()) {
      this.selectedCustomer = null;
      this.isNewCustomer = false;
      this.customerExistingCourseTypes = [];
      this.customerExistingClasses = [];
      return;
    }

    const q = this.searchQuery.trim();
    const qLower = q.toLowerCase();
    const qDigits = q.replace(/\D/g, '');

    const found = this.customers.find(c => {
      const sdtDigits = String(c.sdt ?? '').replace(/\D/g, '');
      const email = (c.email ?? '').toLowerCase();
      const name = (c.tenKhachHang ?? '').toLowerCase();

      // match phone exactly (digits) OR email exact OR name contains query (partial, case-insensitive)
      if (qDigits && sdtDigits === qDigits) return true;
      if (email && email === qLower) return true;
      if (name && name.includes(qLower)) return true;
      return false;
    });

    if (found) {
      console.log('=== CUSTOMER FOUND ===');
      console.log('Customer name:', found.tenKhachHang);
      console.log('Customer maKh:', found.maKh);
      console.log('Customer _id:', found._id);
      console.log('Total registrations in memory:', this.existingRegistrations.length);

      this.selectedCustomer = found;
      this.isNewCustomer = false;

      // === VALIDATION: Check existing registrations ===
      // Thử nhiều cách để find customer registrations (maKh, _id, tenKh)
      const customerId = found.maKh;
      console.log('Using customerId for lookup:', customerId);

      this.customerExistingCourseTypes = this.getCustomerExistingCourseTypes(customerId);
      this.customerExistingClasses = this.getCustomerExistingClasses(customerId);

      console.log('Customer existing course types:', this.customerExistingCourseTypes);
      console.log('Customer existing classes count:', this.customerExistingClasses.length);

      // === RULE: If customer has both LR and SW registrations, show error ===
      if (this.customerExistingCourseTypes.length >= 2) {
        this.errorMessage = `Khách hàng này đã đăng ký cả 2 khóa (LR và SW). Không thể đăng ký thêm!`;
        console.warn('VALIDATION FAILED: Customer has both LR and SW courses');
        this.selectedCustomer = null;
        this.isNewCustomer = false;
        this.customerExistingCourseTypes = [];
        this.customerExistingClasses = [];
        this.initializeStep1();
        this.clearCustomerForm();
        return;
      }

      // Reinitialize form trước khi populate
      this.initializeStep1();
      this.populateCustomerForm(found);
      console.log('VALIDATION PASSED: Customer can proceed');
    } else {
      this.selectedCustomer = null;
      this.isNewCustomer = true;
      this.customerExistingCourseTypes = [];
      this.customerExistingClasses = [];
      // Reinitialize form cho khách mới
      this.initializeStep1();
      this.clearCustomerForm();
    }
  }

  /**
   * Xóa tìm kiếm khách hàng
   */
  clearSearch(): void {
    this.searchQuery = '';
    this.selectedCustomer = null;
    this.isNewCustomer = false;
    this.clearCustomerForm();
    this.errorMessage = '';
  }

  /**
   * Format ngày từ format API (ISO Date hoặc string) thành format input date (YYYY-MM-DD)
   */
  private formatDateForInput(dateStr: string | undefined): string {
    console.log('formatDateForInput called with:', dateStr, 'Type:', typeof dateStr);

    if (!dateStr) {
      console.log('dateStr is empty/null, returning empty string');
      return '';
    }

    try {
      // **FALLBACK FIRST**: Nếu string chứa YYYY-MM-DD ở đầu, extract nó
      const dateMatch = dateStr.match(/^\d{4}-\d{2}-\d{2}/);
      if (dateMatch) {
        console.log('Found YYYY-MM-DD pattern at start, extracting:', dateMatch[0]);
        return dateMatch[0];
      }

      // Nếu là format "YYYY-MM-DD HH:MM:SS" (từ backend), extract chỉ date part
      // Regex này linh hoạt với space và khoảng trắng khác
      if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(dateStr)) {
        console.log('Is "YYYY-MM-DD HH:MM:SS" format, extracting date...');
        const result = dateStr.split(/\s+/)[0];
        console.log('Extracted to:', result);
        return result;
      }

      // Nếu là ISO date string (2022-05-20T00:00:00Z), parse và extract date
      if (typeof dateStr === 'string' && dateStr.includes('T')) {
        console.log('Is ISO date format, converting...');
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const result = `${year}-${month}-${day}`;
        console.log('Converted to:', result);
        return result;
      }

      // Nếu là format DD/MM/YYYY, convert thành YYYY-MM-DD
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        console.log('Is DD/MM/YYYY format, converting...');
        const [day, month, year] = dateStr.split('/');
        const result = `${year}-${month}-${day}`;
        console.log('Converted to:', result);
        return result;
      }

      console.log('Could not match any format, returning as is:', dateStr);
      return dateStr;
    } catch (error) {
      console.error('Error in formatDateForInput:', error);
      return '';
    }
  }

  /**
   * Khởi tạo form Step 1 (Customer Info)
   */
  private initializeStep1(): void {
    this.customerFormSections = [
      {
        title: 'Thông tin khách hàng',
        columns: 2,
        fields: [
          {
            name: 'tenKhachHang',
            label: 'Tên khách hàng',
            type: 'text',
            required: true,
            validators: [Validators.required]
          },
          {
            name: 'sdt',
            label: 'Số điện thoại',
            type: 'tel',
            required: true,
            validators: [Validators.required]
          },
          {
            name: 'email',
            label: 'Email',
            type: 'email',
            required: true,
            validators: [Validators.required, Validators.email]
          },
          {
            name: 'gioiTinh',
            label: 'Giới tính',
            type: 'select',
            required: true, // Đã thêm bắt buộc
            validators: [Validators.required], // Đã thêm Validators
            options: [
              { value: 'Nam', label: 'Nam' },
              { value: 'Nữ', label: 'Nữ' },
              { value: 'Khác', label: 'Khác' }
            ]
          },
          {
            name: 'ngaySinh',
            label: 'Ngày sinh',
            type: 'date',
            required: true, // Đã thêm bắt buộc
            validators: [Validators.required] // Đã thêm Validators
          }
        ]
      }
    ];

    this.customerForm = this.formBuilder.group(
      this.customerFormSections[0].fields.reduce((acc: any, field: any) => {
        acc[field.name] = new FormControl('', field.validators || []);
        return acc;
      }, {})
    );
  }

  /**
   * Điền dữ liệu khách hàng tìm thấy vào form
   */
  private populateCustomerForm(customer: iClient): void {
    if (this.customerForm) {
      console.log('=== FORM BEFORE PATCH ===');
      console.log('Form controls:', Object.keys(this.customerForm.controls));

      const formattedDate = this.formatDateForInput(customer.ngaySinh);
      console.log('=== FORMATTING DATE ===');
      console.log('ngaySinh original:', customer.ngaySinh);
      console.log('ngaySinh formatted:', formattedDate);

      // PATCH VALUE LÚC FORM STILL ENABLED
      console.log('=== PATCHING FORM (while enabled) ===');
      this.customerForm.patchValue({
        tenKhachHang: customer.tenKhachHang,
        sdt: customer.sdt,
        email: customer.email,
        gioiTinh: customer.gioiTinh,
        ngaySinh: formattedDate
      });

      console.log('=== FORM AFTER PATCH ===');
      console.log('Form values:', this.customerForm.getRawValue());

      // THEN DISABLE ALL FIELDS
      console.log('=== DISABLING ALL FIELDS ===');
      Object.keys(this.customerForm.controls).forEach(key => {
        const control = this.customerForm?.get(key);
        if (control) {
          control.disable();
          console.log(`Disabled ${key}, value is:`, control.value);
        }
      });

      console.log('=== FORM FINAL STATE ===');
      console.log('Form values (getRawValue):', this.customerForm.getRawValue());
    }
  }

  /**
   * Xóa dữ liệu form (dành cho khách mới)
   */
  private clearCustomerForm(): void {
    if (this.customerForm) {
      this.customerForm.reset();
      // Enable tất cả fields cho khách mới
      Object.keys(this.customerForm.controls).forEach(key => {
        this.customerForm?.get(key)?.enable();
      });
      console.log('Form cleared and all fields enabled');
    }
  }

  /**
     * Chuyển sang Step 2
     */
  proceedToStep2(): void {
    if (!this.customerForm) {
      this.errorMessage = 'Lỗi: Form không được khởi tạo';
      return;
    }

    // 1. Nếu không có khách cũ được chọn -> Chắc chắn là Khách Mới
    const isActuallyNew = this.selectedCustomer === null;

    // 2. ÉP LỖI: Bắt buộc nhập đầy đủ 5 trường
    if (isActuallyNew) {
      this.customerForm.markAllAsTouched();

      if (this.customerForm.invalid) {
        if (this.customerForm.get('tenKhachHang')?.hasError('required')) {
          this.errorMessage = 'Vui lòng nhập tên khách hàng';
        } else if (this.customerForm.get('sdt')?.hasError('required')) {
          this.errorMessage = 'Vui lòng nhập số điện thoại';
        } else if (this.customerForm.get('email')?.hasError('required')) {
          this.errorMessage = 'Vui lòng nhập email';
        } else if (this.customerForm.get('email')?.hasError('email')) {
          this.errorMessage = 'Vui lòng nhập email hợp lệ (VD: abc@domain.com)';
        } else if (this.customerForm.get('gioiTinh')?.hasError('required')) {
          this.errorMessage = 'Vui lòng chọn giới tính'; // Bắt lỗi Giới tính
        } else if (this.customerForm.get('ngaySinh')?.hasError('required')) {
          this.errorMessage = 'Vui lòng chọn ngày sinh'; // Bắt lỗi Ngày sinh
        } else {
          this.errorMessage = 'Vui lòng nhập đầy đủ các thông tin bắt buộc (*)';
        }
        return; // Dừng lại, không cho sang Bước 2
      }
    }

    // 3. Lấy dữ liệu và lưu an toàn
    const customerData = this.customerForm.getRawValue();

    if (!this.mainForm.contains('customerData')) {
      this.mainForm.addControl('customerData', new FormControl(customerData));
      this.mainForm.addControl('isNewCustomer', new FormControl(isActuallyNew));
      this.mainForm.addControl('selectedCustomerId', new FormControl(this.selectedCustomer?._id || null));
    } else {
      // Update existing controls with latest values
      this.mainForm.get('customerData')?.patchValue(customerData);
      this.mainForm.get('isNewCustomer')?.setValue(isActuallyNew);
      this.mainForm.get('selectedCustomerId')?.setValue(this.selectedCustomer?._id || null);
    }

    // 4. Cho qua bước 2
    this.currentStep = 2;
    this.errorMessage = '';
    this.initializeStep2();
  }

  /**
   * Khởi tạo form Step 2 (Class Selection)
   * Nếu khách hàng đã đăng ký 1 khóa, chỉ hiển thị khóa còn lại
   */
  private initializeStep2(): void {
    console.log('Initializing Step 2. Courses:', this.courses.length, 'Classes:', this.classes.length);
    console.log('Customer existing course types:', this.customerExistingCourseTypes);

    // === RULE: Filter available courses based on existing registrations ===
    let availableCourses = [...this.courses];

    if (this.customerExistingCourseTypes.length === 1) {
      const existingType = this.customerExistingCourseTypes[0];
      const otherType = existingType === 'LR' ? 'SW' : 'LR';

      // Chỉ cho phép đăng ký khóa còn lại (khóa khác)
      availableCourses = availableCourses.filter(c => {
        const courseType = this.extractCourseType(c.tenKhoaHoc);
        return courseType === otherType;
      });

      console.log('Available courses after filtering:', availableCourses.length);
    }

    // Tạo filter config cho classes
    const chiNhanhOptions = [...new Set(this.classes.map(c => c.chiNhanh))].map(cn => ({
      value: cn,
      label: cn
    }));

    this.classFilterConfig = [
      {
        key: 'maKhoa',
        label: 'Khóa học',
        type: 'select',
        options: availableCourses.length > 0
          ? availableCourses.map(c => ({ value: c.maKhoaHoc, label: c.tenKhoaHoc }))
          : []
      },
      {
        key: 'ngayBatDau',
        label: 'Ngày khai giảng',
        type: 'date'
      },
      {
        key: 'chiNhanh',
        label: 'Chi nhánh',
        type: 'multi-select',
        options: chiNhanhOptions
      }
    ];

    console.log('Filter config:', this.classFilterConfig);

    // === Filter classes based on available courses ===
    let baseClasses = this.classes.filter(cls =>
      availableCourses.some(c => c.maKhoaHoc === cls.maKhoa)
    );

    this.filteredClasses = this.dedupeClasses([...baseClasses]);
    this.selectedClass = null;
    this.selectedClassKey = '';

    // Khởi tạo form simple
    this.classForm = this.formBuilder.group({
      selectedClassId: new FormControl('')
    });
  }

  /**
   * Xử lý lọc lớp học theo filter
   */
  handleClassFilter(criteria: any): void {
    console.log('Filter criteria received:', criteria);

    const normalizeText = (value: any) => `${value ?? ''}`.trim().toLowerCase();
    const selectedCourse = normalizeText(criteria.maKhoa);
    const selectedDate = normalizeText(criteria.ngayBatDau);
    const selectedBranches = Array.isArray(criteria.chiNhanh) ? criteria.chiNhanh : [];

    this.filteredClasses = this.dedupeClasses(this.classes.filter(cls => {
      const matchesCourse = !selectedCourse || normalizeText(cls.maKhoa).includes(selectedCourse) || normalizeText(cls.tenKhoaHoc).includes(selectedCourse);
      const matchesDate = !selectedDate || normalizeText(cls.ngayBatDau).startsWith(selectedDate);
      const matchesBranch = selectedBranches.length === 0 || selectedBranches.includes(cls.chiNhanh);
      return matchesCourse && matchesDate && matchesBranch;
    }));

    this.selectedClass = null;
    this.selectedClassKey = '';
  }

  /**
   * Reset lọc lớp học
   */
  handleClassFilterReset(): void {
    this.filteredClasses = this.dedupeClasses([...this.classes]);
    this.selectedClass = null;
    this.selectedClassKey = '';
  }

  /**
   * Kiểm tra xung đột khungGio giữa 2 lớp
   * VD: '09:00-12:00' và '10:00-13:00' là trùng
   */
  private hasTimeSlotConflict(existingKhungGio: string, newKhungGio: string): boolean {
    // Parse a schedule string into an array of time ranges and a set of days (optional)
    const parseSchedule = (s: string): { ranges: { start: number; end: number }[]; days: Set<number> } => {
      const result: { ranges: { start: number; end: number }[]; days: Set<number> } = { ranges: [], days: new Set<number>() };
      if (!s) return result;
      const str = s.toString();

      // Extract parenthesis content for days like (T2-4-6)
      const parenMatch = str.match(/\(([^)]*)\)/);
      if (parenMatch && parenMatch[1]) {
        const nums = parenMatch[1].match(/\d+/g);
        if (nums) {
          nums.forEach(n => result.days.add(parseInt(n, 10)));
        }
      }

      // Find all time ranges in formats like 17:45-19:15 or 17h45-19h15 or 17h45 - 19h15
      const timeRangeRegex = /(\d{1,2})\s*(?:h|:)\s*(\d{2})\s*-\s*(\d{1,2})\s*(?:h|:)\s*(\d{2})/g;
      let m: RegExpExecArray | null;
      while ((m = timeRangeRegex.exec(str)) !== null) {
        const sh = parseInt(m[1], 10);
        const sm = parseInt(m[2], 10);
        const eh = parseInt(m[3], 10);
        const em = parseInt(m[4], 10);
        const start = sh * 60 + sm;
        const end = eh * 60 + em;
        if (!isNaN(start) && !isNaN(end)) {
          result.ranges.push({ start, end });
        }
      }

      // Also support formats with colon only like 09:00-12:00
      const colonRegex = /(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/g;
      while ((m = colonRegex.exec(str)) !== null) {
        const toMinutes = (t: string) => {
          const [hh, mm] = t.split(':').map(s => parseInt(s, 10));
          return hh * 60 + mm;
        };
        const start = toMinutes(m[1]);
        const end = toMinutes(m[2]);
        result.ranges.push({ start, end });
      }

      return result;
    };

    const a = parseSchedule(existingKhungGio);
    const b = parseSchedule(newKhungGio);

    if (a.ranges.length === 0 || b.ranges.length === 0) return false;

    // If both specify days, require intersection of days; otherwise assume potential overlap
    const bothHaveDays = a.days.size > 0 && b.days.size > 0;

    // Check any pair of ranges for overlap AND (days intersect OR no days specified)
    for (const ra of a.ranges) {
      for (const rb of b.ranges) {
        const overlap = ra.start < rb.end && rb.start < ra.end;
        if (!overlap) continue;

        if (bothHaveDays) {
          // check day intersection
          const intersect = Array.from(a.days).some(d => b.days.has(d));
          if (intersect) return true;
        } else {
          // no day info -> treat as conflict when times overlap
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Chọn lớp học từ card (toggle select/deselect)
   */
  selectClassCard(classItem: iClass): void {
    console.log('selectClassCard called with:', classItem.maLop);
    this.errorMessage = '';

    // Nếu đã chọn rồi → deselect
    if (this.selectedClassKey === classItem.maLop) {
      console.log('Deselecting:', classItem.maLop);
      this.selectedClass = null;
      this.selectedClassKey = '';
      this.classForm?.patchValue({
        selectedClassId: ''
      });
      this.mainForm.removeControl('classData');
      return;
    }

    // === VALIDATION: Check time slot conflicts ===
    // Skip time-conflict validation for new customers
    const isNew = this.isNewCustomer || (this.mainForm.get('isNewCustomer')?.value ?? false);
    if (!isNew && this.customerExistingClasses.length > 0) {
      for (const existingClass of this.customerExistingClasses) {
        if (this.hasTimeSlotConflict(existingClass.khungGio, classItem.khungGio)) {
          this.errorMessage = `Xung đột thời gian! Lớp "${classItem.tenLop}" (${classItem.khungGio}) trùng với lớp đã đăng ký "${existingClass.tenLop}" (${existingClass.khungGio})`;
          console.warn('Time slot conflict detected:', this.errorMessage);
          return;
        }
      }
    }

    // Chọn lớp mới
    console.log('Selecting new class:', classItem.maLop);
    this.selectedClass = classItem;
    this.selectedClassKey = classItem.maLop;
    const classData = {
      classId: classItem._id,
      maLop: classItem.maLop,
      tenLop: classItem.tenLop,
      maKhoa: classItem.maKhoa,
      tenKhoaHoc: this.courses.find(c => c.maKhoaHoc === classItem.maKhoa)?.tenKhoaHoc || classItem.tenKhoaHoc,
      hocPhi: this.getCourseFee(classItem.maKhoa),
      chiNhanh: classItem.chiNhanh || '',
      khungGio: classItem.khungGio || ''
    };

    console.log('classData:', classData);

    // Lưu classData vào mainForm
    if (this.mainForm.get('classData')) {
      this.mainForm.get('classData')?.patchValue(classData);
    } else {
      this.mainForm.addControl('classData', new FormControl(classData));
    }

    this.classForm?.patchValue({
      selectedClassId: classItem.maLop
    });
  }

  trackByClass(index: number, classItem: iClass): string {
    return classItem.maLop;
  }

  /**
   * Lấy học phí theo mã khóa học
   */
  getCourseFee(maKhoa: string): number {
    const normalizedKey = `${maKhoa ?? ''}`.trim().toLowerCase();
    const course = this.courses.find(c => {
      return `${c.maKhoaHoc ?? ''}`.trim().toLowerCase() === normalizedKey
        || `${c._id ?? ''}`.trim().toLowerCase() === normalizedKey
        || `${c.tenKhoaHoc ?? ''}`.trim().toLowerCase() === normalizedKey;
    });
    return course?.hocPhi || 0;
  }

  /**
   * Chuyển sang Step 3
   */
  proceedToStep3(): void {
    if (!this.selectedClass) {
      this.errorMessage = 'Vui lòng chọn lớp học';
      return;
    }

    // Lưu dữ liệu Step 2 vào mainForm
    const classData = {
      classId: this.selectedClass._id,
      maLop: this.selectedClass.maLop,
      tenLop: this.selectedClass.tenLop,
      maKhoa: this.selectedClass.maKhoa,
      tenKhoaHoc: this.courses.find(c => c.maKhoaHoc === this.selectedClass?.maKhoa)?.tenKhoaHoc || this.selectedClass.tenKhoaHoc,
      hocPhi: this.getCourseFee(this.selectedClass.maKhoa),
      chiNhanh: this.selectedClass.chiNhanh || '',
      khungGio: this.selectedClass.khungGio || ''
    };

    this.mainForm.addControl('classData', new FormControl(classData));

    this.currentStep = 3;
    this.errorMessage = '';
  }

  /**
   * Unified handler for the Next button to avoid accidental double-advances
   */
  onNextClick(): void {
    if (this.isLoading) return;
    if (this.currentStep === 1) {
      this.proceedToStep2();
    } else if (this.currentStep === 2) {
      this.proceedToStep3();
    }
  }

  /**
   * ========== STEP 3: SUBMIT & CREATE RECORDS ==========
   */

  /**
   * Submit: Tạo Customer (nếu cần), Registration, và Payment (Debt)
   * 
   * Quy trình:
   * 1. Nếu khách mới: Tạo Customer record
   * 2. Tạo Registration record
   * 3. Tạo Payment record (với trạng thái "Chưa thanh toán")
   */
  submitRegistration(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const customerData = this.mainForm.get('customerData')?.value;
    const classData = this.mainForm.get('classData')?.value;
    const isNewCustomer = this.mainForm.get('isNewCustomer')?.value ?? this.isNewCustomer;
    const selectedCustomerId = this.mainForm.get('selectedCustomerId')?.value;

    let customerId = selectedCustomerId || this.selectedCustomer?._id || null;

    // ========== Step 1: Tạo Customer (nếu khách mới) ==========
    if (isNewCustomer) {
      const newClientPayload: iClient = {
        stt: 0,
        maKh: this.generateCustomerCode(),
        tenKhachHang: customerData.tenKhachHang,
        gioiTinh: customerData.gioiTinh,
        ngaySinh: customerData.ngaySinh,
        sdt: customerData.sdt,
        email: customerData.email,
        ngayDangKy: new Date().toISOString().split('T')[0],
        trangThai: 'Chưa đăng ký khóa',  // Khách mới luôn có trạng thái "Chưa đăng ký khóa"
        active: true
      };

      this.clientService.addClient(newClientPayload).subscribe({
        next: (createdCustomer) => {
          customerId = createdCustomer._id || createdCustomer.maKh || customerId;
          // refresh local customers list and put the new customer on top
          this.loadCustomers();
          this.customers = [createdCustomer, ...this.customers.filter(c => c._id !== createdCustomer._id)];
          // Sau khi tạo Customer, tạo Registration
          this.createRegistration(customerId, customerData, classData);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Lỗi tạo khách hàng: ' + err.message;
        }
      });
    } else {
      // Khách cũ, tiếp tục tạo Registration
      this.createRegistration(customerId, customerData, classData);
    }
  }

  /**
   * Tạo Registration record
   */
  private createRegistration(customerId: string, customerData: any, classData: any): void {
    // ========== Step 2: Tạo Registration ==========
    const registrationPayload: iRegistration = {
      stt: 0,
      maDangKy: this.generateRegistrationCode(),
      maKh: customerId,
      tenKh: customerData.tenKhachHang,
      maLop: classData.maLop,
      tenLopHoc: classData.tenLop,
      khoaHoc: classData.maKhoa,
      tenKhoa: this.getClassCourseName(classData.maKhoa),
      chiNhanh: classData.chiNhanh || customerData.chiNhanh || '',
      ngayDangKy: new Date().toISOString().split('T')[0],
      trangThai: 'Đang hoạt động'
    };

    this.registrationService.addRegistration(registrationPayload).subscribe({
      next: (createdRegistration) => {
        this.existingRegistrations = [
          createdRegistration,
          ...this.existingRegistrations.filter(reg => reg.maDangKy !== createdRegistration.maDangKy)
        ];

        // Sau khi tạo Registration, cập nhật trạng thái khách hàng rồi tạo Payment (Debt)
        this.markCustomerAsRegistered(customerId).subscribe({
          next: () => {
            this.createDebtRecord(customerId, customerData, classData, createdRegistration);
          },
          error: (err) => {
            this.isLoading = false;
            this.errorMessage = 'Lỗi cập nhật trạng thái khách hàng: ' + err.message;
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Lỗi tạo đăng ký: ' + err.message;
      }
    });
  }

  /**
   * Tạo Payment record (dùng làm Debt/Invoice)
   */
  private createDebtRecord(customerId: string, customerData: any, classData: any, registrationObj: any): void {
    // ========== Step 3: Tạo Payment (Debt/Invoice) ==========
    const debtPayload: iPayment = {
      stt: 0,
      maDangKy: (registrationObj && registrationObj.maDangKy) || 'PENDING',
      maKh: customerId,
      tenKh: customerData.tenKhachHang,
      maLop: classData.maLop,
      tenLopHoc: classData.tenLop,
      khoaHoc: classData.maKhoa,
      tenKhoa: this.getClassCourseName(classData.maKhoa),
      chiNhanh: classData.chiNhanh || customerData.chiNhanh || '',
      ngayDangKy: new Date().toISOString().split('T')[0],
      hocPhi: classData.hocPhi,
      voucher: '',
      thongSoGiam: 0,
      soTienCanThanhToan: classData.hocPhi,
      soTienConLai: classData.hocPhi,
      trangThaiThanhToan: 'Chưa thanh toán' // Default status
    };

    this.paymentService.addPayment(debtPayload).subscribe({
      next: (createdDebt) => {
        this.isLoading = false;
        this.success.emit({
          customer: customerData,
          registration: registrationObj,
          debt: createdDebt
        });
        this.close.emit();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Lỗi tạo công nợ: ' + err.message;
      }
    });
  }

  /**
   * ========== UTILITIES ==========
   */

  private generateCustomerCode(): string {
    return this.generateSequentialCode('KH', this.customers.map(customer => customer.maKh || ''));
  }

  private generateRegistrationCode(): string {
    return this.generateSequentialCode('DK', this.existingRegistrations.map(registration => registration.maDangKy || ''));
  }

  private generateSequentialCode(prefix: 'KH' | 'DK', existingCodes: string[]): string {
    const dateCode = this.getCurrentDateCode();
    const pattern = new RegExp(`^${prefix}-${dateCode}-(\\d{3})$`, 'i');

    let maxSequence = 0;
    for (const existingCode of existingCodes) {
      const match = `${existingCode ?? ''}`.trim().match(pattern);
      if (match) {
        maxSequence = Math.max(maxSequence, Number(match[1]));
      }
    }

    const nextSequence = maxSequence + 1;
    if (nextSequence > 999) {
      throw new Error(`Đã vượt quá giới hạn mã ${prefix} trong ngày ${dateCode}`);
    }

    return `${prefix}-${dateCode}-${String(nextSequence).padStart(3, '0')}`;
  }

  private getCurrentDateCode(date = new Date()): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}${month}${year}`;
  }

  private markCustomerAsRegistered(customerId: string) {
    const updatedStatus = 'Đã đăng ký khóa';

    return this.clientService.updateClient(customerId, { trangThai: updatedStatus }).pipe(
      tap((updatedCustomer: iClient) => {
        const localId = updatedCustomer._id || customerId;
        this.selectedCustomer = this.selectedCustomer && (this.selectedCustomer._id === localId || this.selectedCustomer.maKh === localId)
          ? { ...this.selectedCustomer, trangThai: updatedStatus }
          : this.selectedCustomer;

        this.customers = this.customers.map(customer => {
          const matchesId = customer._id === localId || customer.maKh === localId;
          return matchesId ? { ...customer, trangThai: updatedStatus } : customer;
        });
      })
    );
  }

  private getCourseNameById(courseId: string): string {
    return this.courses.find(c => c._id === courseId)?.tenKhoaHoc || '';
  }

  /**
   * Lấy tên khóa học dựa vào maKhoa
   */
  private getClassCourseName(maKhoa: string): string {
    const key = `${maKhoa ?? ''}`.trim().toLowerCase();
    const course = this.courses.find(c => {
      return `${c.maKhoaHoc ?? ''}`.trim().toLowerCase() === key
        || `${c._id ?? ''}`.trim().toLowerCase() === key
        || `${c.tenKhoaHoc ?? ''}`.trim().toLowerCase() === key;
    });
    return course?.tenKhoaHoc || '';
  }

  /**
   * Quay lại bước trước
   */
  goToPreviousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.errorMessage = '';
    }
  }

  /**
   * Đóng dialog
   */
  closeDialog(): void {
    this.close.emit();
  }

  /**
   * Remove duplicate classes by `maLop` (keep first occurrence)
   */
  private dedupeClasses(list: iClass[]): iClass[] {
    const seen = new Set<string>();
    const out: iClass[] = [];
    for (const item of list) {
      const key = `${item.maLop ?? item._id ?? ''}`.trim();
      if (!seen.has(key)) {
        seen.add(key);
        out.push(item);
      } else {
        console.warn('[dedupeClasses] duplicate detected for', key);
      }
    }
    return out;
  }
}
