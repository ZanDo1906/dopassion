import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { FormDialogComponent } from '../../../components/form-dialog/form-dialog';
import { FilterDataPicker, FilterConfig } from '../../../components/filter-data-picker/filter-data-picker';
import { Client } from '../../../services/client';
import { Course } from '../../../services/course';
import { Class } from '../../../services/class';
import { RegistrationService } from '../../../services/registration';
import { Payment } from '../../../services/payment';
import { iClient } from '../../../interfaces/client';
import { iCourse } from '../../../interfaces/course';
import { iClass } from '../../../interfaces/class';
import { iRegistration } from '../../../interfaces/registration';
import { iPayment } from '../../../interfaces/payment';

@Component({
  selector: 'app-registration-stepper-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FormDialogComponent, FilterDataPicker],
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
    this.initializeStep1();
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

  /**
   * Tìm kiếm khách hàng theo SĐT hoặc Email
   */
  searchCustomer(): void {
    if (!this.searchQuery.trim()) {
      this.selectedCustomer = null;
      this.isNewCustomer = false;
      return;
    }

    const found = this.customers.find(c =>
      String(c.sdt) === this.searchQuery || c.email.toLowerCase() === this.searchQuery.toLowerCase()
    );

    if (found) {
      console.log('=== CUSTOMER FOUND ===');
      console.log('Full customer object:', found);
      console.log('ngaySinh:', found.ngaySinh);
      
      this.selectedCustomer = found;
      this.isNewCustomer = false;
      // Reinitialize form trước khi populate
      this.initializeStep1();
      this.populateCustomerForm(found);
    } else {
      this.selectedCustomer = null;
      this.isNewCustomer = true;
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
            options: [
              { value: 'Nam', label: 'Nam' },
              { value: 'Nữ', label: 'Nữ' },
              { value: 'Khác', label: 'Khác' }
            ]
          },
          {
            name: 'ngaySinh',
            label: 'Ngày sinh',
            type: 'date'
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

    console.log('=== FORM INITIALIZED ===');
    console.log('Fields in customerForm:', Object.keys(this.customerForm.controls));
    console.log('Has ngaySinh?', !!this.customerForm.get('ngaySinh'));
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
    // Chỉ check form tồn tại, không check valid vì có thể form có các control không cần thiết
    if (!this.customerForm) {
      this.errorMessage = 'Lỗi: Form không được khởi tạo';
      return;
    }

    // Lưu dữ liệu Step 1 vào mainForm
    this.mainForm.addControl('customerData', new FormControl(this.customerForm.getRawValue()));
    this.mainForm.addControl('isNewCustomer', new FormControl(this.isNewCustomer));
    this.mainForm.addControl('selectedCustomerId', new FormControl(this.selectedCustomer?._id || null));

    this.currentStep = 2;
    this.errorMessage = '';
    this.initializeStep2();
  }

  /**
   * ========== STEP 2: CLASS SELECTION ==========
   */

  private loadClasses(): void {
    this.classService.getClasses().subscribe({
      next: (data) => {
        this.classes = data;
        this.filteredClasses = [...data];
        console.log('Classes loaded:', data.length);
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
        console.log('Sample course:', data[0]);
      },
      error: (err) => {
        console.error('Lỗi tải danh sách khóa học:', err);
      }
    });
  }

  /**
   * Khởi tạo form Step 2 (Class Selection)
   */
  private initializeStep2(): void {
    console.log('Initializing Step 2. Courses:', this.courses.length, 'Classes:', this.classes.length);
    
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
        options: this.courses.length > 0 
          ? this.courses.map(c => ({ value: c.maKhoaHoc, label: c.tenKhoaHoc }))
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

    // Khởi tạo filtered classes = tất cả classes
    this.filteredClasses = [...this.classes];
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

    this.filteredClasses = this.classes.filter(cls => {
      const matchesCourse = !selectedCourse || normalizeText(cls.maKhoa).includes(selectedCourse) || normalizeText(cls.tenKhoaHoc).includes(selectedCourse);
      const matchesDate = !selectedDate || normalizeText(cls.ngayBatDau).startsWith(selectedDate);
      const matchesBranch = selectedBranches.length === 0 || selectedBranches.includes(cls.chiNhanh);
      return matchesCourse && matchesDate && matchesBranch;
    });

    this.selectedClass = null;
    this.selectedClassKey = '';
  }

  /**
   * Reset lọc lớp học
   */
  handleClassFilterReset(): void {
    this.filteredClasses = [...this.classes];
    this.selectedClass = null;
    this.selectedClassKey = '';
  }

  /**
   * Chọn lớp học từ card (toggle select/deselect)
   */
  selectClassCard(classItem: iClass): void {
    console.log('selectClassCard called with:', classItem.maLop);
    
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
      hocPhi: this.getCourseFee(classItem.maKhoa)
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
  private getCourseFee(maKhoa: string): number {
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
      hocPhi: this.getCourseFee(this.selectedClass.maKhoa)
    };

    this.mainForm.addControl('classData', new FormControl(classData));

    this.currentStep = 3;
    this.errorMessage = '';
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
    const isNewCustomer = this.mainForm.get('isNewCustomer')?.value;
    const selectedCustomerId = this.mainForm.get('selectedCustomerId')?.value;

    let customerId = selectedCustomerId;

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
          customerId = createdCustomer._id;
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
      chiNhanh: '',
      ngayDangKy: new Date().toISOString().split('T')[0],
      trangThai: 'Đang hoạt động'
    };

    this.registrationService.addRegistration(registrationPayload).subscribe({
      next: (createdRegistration) => {
        // Sau khi tạo Registration, tạo Payment (Debt)
        this.createDebtRecord(customerId, customerData, classData, createdRegistration._id || null);
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
  private createDebtRecord(customerId: string, customerData: any, classData: any, registrationId: string | null): void {
    // ========== Step 3: Tạo Payment (Debt/Invoice) ==========
    const debtPayload: iPayment = {
      stt: 0,
      maDangKy: registrationId || 'PENDING',
      maKh: customerId,
      tenKh: customerData.tenKhachHang,
      maLop: classData.maLop,
      tenLopHoc: classData.tenLop,
      khoaHoc: classData.maKhoa,
      tenKhoa: this.getClassCourseName(classData.maKhoa),
      chiNhanh: '',
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
          registration: registrationId,
          debt: createdDebt._id
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
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `KH-${dateStr}-${random}`;
  }

  private generateRegistrationCode(): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `DK-${dateStr}-${random}`;
  }

  private getCourseNameById(courseId: string): string {
    return this.courses.find(c => c._id === courseId)?.tenKhoaHoc || '';
  }

  /**
   * Lấy tên khóa học dựa vào maKhoa
   */
  private getClassCourseName(maKhoa: string): string {
    return this.courses.find(c => c._id === maKhoa)?.tenKhoaHoc || '';
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
}
