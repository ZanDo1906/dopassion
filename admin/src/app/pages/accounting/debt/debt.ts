import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, NgForOf, NgIf, NgClass } from '@angular/common';

import { Payment } from '../../../services/payment';
import { Course } from '../../../services/course';

@Component({
  selector: 'app-debt',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgForOf,
    NgClass,
    DecimalPipe
  ],
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

  filters = {
    registrationCode: '',
    customerCode: '',
    classCode: '',
    branch: '',
    courseCode: '',
  };

  constructor(private paymentService: Payment,
    private courseService: Course) {
    this.loadPayments();
    this.loadCourses();
  }

  toggleFilter() {

    this.isFilterOpen = !this.isFilterOpen;

  }

  loadPayments() {

    this.paymentService.getPayment().subscribe({

      next: (items: any[]) => {

        this.payments = items.map((item) => ({

          stt: item['STT'],

          maDangKy: item['Mã đăng ký'],

          maKH: item['Mã KH'],

          tenKhachHang: item['Tên KH'],

          maLop: item['Mã lớp'],

          tenLopHoc: item['Tên lớp học'],

          khoaHoc: item['Khóa học'],

          tenKhoa: item['Tên khóa'],

          chiNhanh: item['Chi nhánh'],

          ngayDangKy: item['Ngày đăng ký'],

          hocPhi: item['Học phí'],

          voucher: item['Voucher'],

          thongSoGiam: item['Thông số giảm'],

          soTienCanThanhToan: item['Số tiền cần thanh toán'],

          soTienDaDong:
            item['Số tiền cần thanh toán'] - item['Số tiền còn lại'],

          soTienConLai: item['Số tiền còn lại'],

          trangThai: item['Trạng thái THANH TOÁN']

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

  

}

