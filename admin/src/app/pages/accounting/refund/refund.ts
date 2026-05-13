import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  DecimalPipe,
  NgForOf,
  NgIf,
  NgClass
} from '@angular/common';

import { RefundService } from '../../../services/refund';

@Component({
  selector: 'app-refund',
  standalone: true,

  imports: [
    FormsModule,
    NgIf,
    NgForOf,
    NgClass,
    DecimalPipe
  ],

  templateUrl: './refund.html',
  styleUrls: ['./refund.css'],
})

export class Refund {

  refunds: any[] = [];

  filteredRefunds: any[] = [];

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
    status: ''

  };

  courses = [

    {
      maKhoaHoc: 'LR'
    },

    {
      maKhoaHoc: 'SW'
    }

  ];

  constructor(
    private refundService: RefundService
  ) {

    this.loadRefunds();

  }

  toggleFilter() {

    this.isFilterOpen = !this.isFilterOpen;

  }

  loadRefunds() {

    this.refundService.getRefund().subscribe({

      next: (items: any[]) => {

        this.refunds = items.map((item) => ({

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
          daThanhToan: item['Đã thanh toán'],
          soTienHoan: item['Số tiền hoàn'],
          lyDo: item['Lý do hoàn tiền'],
          trangThai: item['Trạng thái']

        }));

        this.filteredRefunds = [...this.refunds];

        this.loading = false;

      },

      error: (error) => {

        console.error(
          'Không thể tải refund.json',
          error
        );

        this.errorMessage =
          'Không thể tải dữ liệu hoàn tiền.';

        this.loading = false;

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

    const status =
      this.filters.status
        .trim()
        .toLowerCase();

    const courseCode =
      this.filters.courseCode
        .trim()
        .toLowerCase();

    this.filteredRefunds =
      this.refunds.filter((item) => {

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

        const matchesStatus =
          status
            ? item.trangThai
                .toLowerCase()
                .includes(status)
            : true;    
        return (

          matchesRegistration &&
          matchesCustomer &&
          matchesClass &&
          matchesBranch &&
          matchesCourse &&
          matchesStatus

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
      status: '',
    };

    this.filteredRefunds = [...this.refunds];

    this.currentPage = 1;

  }

  get totalPages(): number {

    return Math.max(
      1,

      Math.ceil(
        this.filteredRefunds.length /
        this.itemsPerPage
      )
    );

  }

  get paginatedRefunds(): any[] {

    const start =
      (this.currentPage - 1) *
      this.itemsPerPage;

    const end =
      start + this.itemsPerPage;

    return this.filteredRefunds.slice(
      start,
      end
    );

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