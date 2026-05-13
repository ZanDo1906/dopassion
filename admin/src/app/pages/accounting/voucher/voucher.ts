import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import {
  DecimalPipe,
  NgForOf,
  NgIf,
  NgClass
} from '@angular/common';

import { VoucherService } from '../../../services/voucher';

@Component({
  selector: 'app-voucher',
  standalone: true,

  imports: [
    FormsModule,
    NgIf,
    NgForOf,
    NgClass,
    DecimalPipe,
    NgSelectModule
  ],

  templateUrl: './voucher.html',
  styleUrls: ['./voucher.css'],
})

export class Voucher {

  vouchers: any[] = [];

  filteredVouchers: any[] = [];

  isFilterOpen = true;



  // Phân trang
  currentPage = 1;

  itemsPerPage = 10;

  pageSizeOptions = [10, 20, 50];

  loading = true;

  errorMessage = '';

  filters = {
    voucherCode: '',
    programName: '',
    classCode: '',
    branch: [] as string[],
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
    private voucherService: VoucherService
  ) {

    this.loadVouchers();

  }

  toggleFilter() {

    this.isFilterOpen = !this.isFilterOpen;

  }

  loadVouchers() {

    this.voucherService.getVoucher().subscribe({

      next: (items: any[]) => {

        this.vouchers = items.map((item) => ({

          stt: item['STT'],
          maVoucher: item['Mã voucher'],
          tenChuongTrinh: item['Tên chương trình'],
          donViGiam: item['Đơn vị giảm'],
          thongSoGiam: item['Thông số'],
          chiNhanh: Array.isArray(item['Chi nhánh']) ? item['Chi nhánh'] : item['Chi nhánh'].split(', '),

        }));

        this.filteredVouchers = [...this.vouchers];

        this.loading = false;

      },

      error: (error) => {

        console.error(
          'Không thể tải voucher.json',
          error
        );

        this.errorMessage =
          'Không thể tải dữ liệu voucher.';

        this.loading = false;

      }

    });

  }

  applyFilter() {

    this.currentPage = 1;

    const voucherCode =
      this.filters.voucherCode
        .trim()
        .toLowerCase();

    const programName =
      this.filters.programName
        .trim()
        .toLowerCase();

    const classCode =
      this.filters.classCode
        .trim()
        .toLowerCase();

    const branch =
      this.filters.branch as string[];
    // .trim()
    // .toLowerCase();

    const status =
      this.filters.status
        .trim()
        .toLowerCase();

    const courseCode =
      this.filters.courseCode
        .trim()
        .toLowerCase();

    this.filteredVouchers =
      this.vouchers.filter((item) => {

        const matchesVoucher =
          voucherCode
            ? item.maVoucher
              .toLowerCase()
              .includes(voucherCode)
            : true;

        const matchesProgram =
          programName
            ? item.tenChuongTrinh
              .toLowerCase()
              .includes(programName)
            : true;

        const matchesClass =
          classCode
            ? item.maLop
              .toLowerCase()
              .includes(classCode)
            : true;

        const matchesBranch =
          branch.length > 0
            ? branch.every(
              (cn: string) =>
                item.chiNhanh.includes(cn)
            )
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

          matchesVoucher &&
          matchesProgram &&
          matchesClass &&
          matchesBranch &&
          matchesCourse &&
          matchesStatus

        );

      });

  }

  clearFilters() {

    this.filters = {

      voucherCode: '',
      programName: '',
      classCode: '',
      branch: [],
      courseCode: '',
      status: '',
    };

    this.filteredVouchers = [...this.vouchers];

    this.currentPage = 1;

  }

  get totalPages(): number {

    return Math.max(
      1,

      Math.ceil(
        this.filteredVouchers.length /
        this.itemsPerPage
      )
    );

  }

  get paginatedVouchers(): any[] {

    const start =
      (this.currentPage - 1) *
      this.itemsPerPage;

    const end =
      start + this.itemsPerPage;

    return this.filteredVouchers.slice(
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

  //   onBranchChange(event: Event) {

  //   const checkbox =
  //     event.target as HTMLInputElement;

  //   const value = checkbox.value;

  //   if (checkbox.checked) {

  //     this.filters.branch.push(value);

  //   }

  //   else {

  //     this.filters.branch =
  //       this.filters.branch.filter(
  //         (item) => item !== value
  //       );

  //   }

  // }
  branches = [

    {
      label: 'Chi nhánh 1',
      value: 'CN1'
    },

    {
      label: 'Chi nhánh 2',
      value: 'CN2'
    },

    {
      label: 'Chi nhánh 3',
      value: 'CN3'
    }

  ];
}
