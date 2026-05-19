import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, NgForOf, NgIf, NgClass } from '@angular/common';

import { Payment } from '../../../services/payment';
import { Course } from '../../../services/course';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GridFormDialog } from '../../../components/form-dialog/form-dialog';

@Component({
  selector: 'app-debt',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf, NgForOf, NgClass, DecimalPipe, GridFormDialog],
  templateUrl: './debt.html',
  styleUrls: ['./debt.css'],
})

export class Debt {

  payments: any[] = [];
  filteredPayments: any[] = [];
  courses: any[] = [];
  isFilterOpen = true;
  // Phân trang
  currentPage = 1;
  itemsPerPage = 10;
  pageSizeOptions = [10, 20, 50];

  loading = true;
  errorMessage = '';
  showDetailDialog = false;
  dialogMode: 'view' | 'payment' = 'view';
  detailForm!: FormGroup;

  paymentDetailSections = [

    {
      title: 'THÔNG TIN ĐĂNG KÝ',

      fields: [

        {
          name: 'maDangKy',
          label: 'Mã đăng ký',
          type: 'text'
        },

        {
          name: 'maKH',
          label: 'Mã khách hàng',
          type: 'text'
        },

        {
          name: 'tenKhachHang',
          label: 'Tên khách hàng',
          type: 'text'
        },

        {
          name: 'maLop',
          label: 'Mã lớp',
          type: 'text'
        },

        {
          name: 'khoaHoc',
          label: 'Khóa học',
          type: 'text'
        },

        {
          name: 'chiNhanh',
          label: 'Chi nhánh',
          type: 'text'
        },

        {
          name: 'ngayDangKy',
          label: 'Ngày đăng ký',
          type: 'text'
        }

      ]
    },

    {
      title: 'THÔNG TIN CÔNG NỢ',

      fields: [

        {
          name: 'hocPhi',
          label: 'Học phí',
          type: 'number'
        },

        {
          name: 'voucher',
          label: 'Voucher',
          type: 'text'
        },

        {
          name: 'soTienCanThanhToan',
          label: 'Số tiền cần thanh toán',
          type: 'number'
        },

        {
          name: 'soTienDaDong',
          label: 'Số tiền đã đóng',
          type: 'number'
        },

        {
          name: 'soTienConLai',
          label: 'Số tiền còn lại',
          type: 'number'
        },

        {
          name: 'trangThai',
          label: 'Trạng thái',
          type: 'text'
        }

      ]
    }

  ];

  initForm() {

    this.detailForm = this.fb.group({

      maDangKy: [''],
      maKH: [''],
      tenKhachHang: [''],
      maLop: [''],
      khoaHoc: [''],
      chiNhanh: [''],
      ngayDangKy: [''],

      hocPhi: [''],
      voucher: [''],
      soTienCanThanhToan: [''],
      soTienDaDong: [''],
      soTienConLai: [''],
      trangThai: ['']

    });

  }

  filters = {
    registrationCode: '',
    customerCode: '',
    classCode: '',
    branch: '',
    courseCode: '',
  };

  constructor(
    private paymentService: Payment,
    private courseService: Course,
    private fb: FormBuilder
  ) {
    this.loadPayments();
    this.loadCourses();
    this.initForm();
  }

  toggleFilter() {

    this.isFilterOpen = !this.isFilterOpen;

  }

  loadPayments() {

    this.paymentService.getPayment().subscribe({

      next: (items: any[]) => {

        this.payments = items.map((item) => ({

          stt: item.stt,

          maDangKy: item.maDangKy,

          maKH: item.maKh,

          tenKhachHang: item.tenKh,

          maLop: item.maLop,

          tenLopHoc: item.tenLopHoc,

          khoaHoc: item.khoaHoc,

          tenKhoa: item.tenKhoa,

          chiNhanh: item.chiNhanh,

          ngayDangKy: item.ngayDangKy,

          hocPhi: item.hocPhi,

          voucher: item.voucher,

          thongSoGiam: item.thongSoGiam,

          soTienCanThanhToan: item.soTienCanThanhToan,

          soTienDaDong:
            item.soTienCanThanhToan - item.soTienConLai,

          soTienConLai: item.soTienConLai,

          trangThai: item.trangThaiThanhToan

        }));

        this.filteredPayments = [...this.payments];


        this.loading = false;
      },

      error: (error) => {

        console.error('Không thể tải payment.json', error);

        this.errorMessage =
          'Không thể tải dữ liệu công nợ.';

        this.loading = false;
      }

    });

  }

  loadCourses() {

    this.courseService.getCourse().subscribe({

      next: (items: any[]) => {

        this.courses = items.map((item) => ({

          maKhoaHoc: item['Mã khóa học'],

          tenKhoaHoc: item['Tên khóa học'],

          hocPhi: item['Học phí'],

          moTa: item['Mô tả']

        }));

      },

      error: (error) => {

        console.error(
          'Không thể tải course.json',
          error
        );

      }

    });

  }

  applyFilter() {

    this.currentPage = 1;

    const registration =
      this.filters.registrationCode
        .trim()
        .toLowerCase();

    const customer =
      this.filters.customerCode
        .trim()
        .toLowerCase();

    const classCode =
      this.filters.classCode
        .trim()
        .toLowerCase();

    const branch =
      this.filters.branch
        .trim()
        .toLowerCase();

    const courseCode =
      this.filters.courseCode
        .trim()
        .toLowerCase();

    this.filteredPayments = this.payments.filter((item) => {

      const matchesRegistration =
        registration
          ? item.maDangKy
            .toLowerCase()
            .includes(registration)
          : true;

      const matchesCustomer =
        customer
          ? item.maKH
            .toLowerCase()
            .includes(customer)
          : true;

      const matchesClass =
        classCode
          ? item.maLop
            .toLowerCase()
            .includes(classCode)
          : true;

      const matchesBranch =
        branch
          ? item.chiNhanh
            .toLowerCase()
            .includes(branch)
          : true;

      const matchesCourse =
        courseCode
          ? item.khoaHoc
            .toLowerCase()
            .includes(courseCode)
          : true;

      return (
        matchesRegistration &&
        matchesCustomer &&
        matchesClass &&
        matchesBranch &&
        matchesCourse
      );

    });

  }

  clearFilters() {

    this.filters = {

      registrationCode: '',

      customerCode: '',

      classCode: '',

      branch: '',

      courseCode: '',

    };

    this.filteredPayments = [...this.payments];
    this.currentPage = 1;

  }
  get totalPages(): number {

    return Math.max(
      1,
      Math.ceil(
        this.filteredPayments.length / this.itemsPerPage
      )
    );

  }

  get paginatedPayments(): any[] {

    const start =
      (this.currentPage - 1) * this.itemsPerPage;

    const end =
      start + this.itemsPerPage;

    return this.filteredPayments.slice(start, end);

  }

  get pages(): number[] {

    return Array.from(
      { length: this.totalPages },
      (_, i) => i + 1
    );

  }

  changePage(page: number) {

    if (
      page < 1 ||
      page > this.totalPages
    ) {
      return;
    }

    this.currentPage = page;

  }

  changePageSize(event: Event) {

    const value =
      (event.target as HTMLSelectElement).value;

    this.itemsPerPage = Number(value);

    this.currentPage = 1;

  }

  viewPaymentDetail(item: any): void {

    this.detailForm.patchValue({

      maDangKy: item.maDangKy,
      maKH: item.maKH,
      tenKhachHang: item.tenKhachHang,
      maLop: item.maLop,
      khoaHoc: item.khoaHoc,
      chiNhanh: item.chiNhanh,
      ngayDangKy: item.ngayDangKy,

      hocPhi: item.hocPhi,
      voucher: item.voucher,
      soTienCanThanhToan: item.soTienCanThanhToan,
      soTienDaDong: item.soTienDaDong,
      soTienConLai: item.soTienConLai,
      trangThai: item.trangThai

    });

    this.detailForm.disable();

    this.showDetailDialog = true;

  }

  paymentDebt(item: any): void {

    this.dialogMode = 'payment';

    this.detailForm.patchValue({

      maDangKy: item.maDangKy,
      maKH: item.maKH,
      tenKhachHang: item.tenKhachHang,
      maLop: item.maLop,
      khoaHoc: item.khoaHoc,
      chiNhanh: item.chiNhanh,
      ngayDangKy: item.ngayDangKy,

      hocPhi: item.hocPhi,
      voucher: item.voucher,
      soTienCanThanhToan: item.soTienCanThanhToan,
      soTienDaDong: item.soTienDaDong,
      soTienConLai: item.soTienConLai,
      trangThai: item.trangThai

    });

    // khóa toàn bộ
    this.detailForm.disable();

    // mở edit
    this.detailForm.get('voucher')?.enable();

    this.detailForm.get('soTienDaDong')?.enable();

    this.showDetailDialog = true;

  }

  closeDialog(): void {

    this.showDetailDialog = false;

  }
  savePayment(): void {

    const formValue =
      this.detailForm.getRawValue();

    const index =
      this.payments.findIndex(
        x => x.maDangKy === formValue.maDangKy
      );

    if (index !== -1) {

      this.payments[index].voucher =
        formValue.voucher;

      this.payments[index].soTienDaDong =
        Number(formValue.soTienDaDong);

      // tính lại
      this.payments[index].soTienConLai =
        this.payments[index].soTienCanThanhToan
        - this.payments[index].soTienDaDong;

      // cập nhật trạng thái
      if (this.payments[index].soTienConLai <= 0) {

        this.payments[index].trangThai =
          'Đã thanh toán';

      }
      else if (
        this.payments[index].soTienDaDong > 0
      ) {

        this.payments[index].trangThai =
          'Đã thanh toán một phần';

      }
      else {

        this.payments[index].trangThai =
          'Chưa thanh toán';

      }

      this.filteredPayments = [
        ...this.payments
      ];

    }

    this.showDetailDialog = false;

  }


}

