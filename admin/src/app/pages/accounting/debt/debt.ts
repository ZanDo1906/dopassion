import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, NgForOf, NgIf, NgClass } from '@angular/common';

import { Payment } from '../../../services/payment';
import { Course } from '../../../services/course';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GridFormDialog } from '../../../components/form-dialog/form-dialog';
import { VoucherService } from '../../../services/voucher';
import { Observable } from 'rxjs/internal/Observable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-debt',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf, NgForOf, NgClass, DecimalPipe, GridFormDialog],
  templateUrl: './debt.html',
  styleUrls: ['./debt.css'],
})

export class Debt {

  vouchers: any[] = [];
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

  private originalPaymentDetailSections: any[] = [];

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
          type: 'select',
          options: []

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
          name: 'nhapSoTienThanhToan',
          label: 'Nhập số tiền thanh toán',
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
      nhapSoTienThanhToan: [''],
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
    status: ''
  };

  constructor(
    private paymentService: Payment,
    private courseService: Course,
    private voucherService: VoucherService,
    private fb: FormBuilder
  ) {
    this.originalPaymentDetailSections = JSON.parse(JSON.stringify(this.paymentDetailSections));
    this.loadPayments();
    this.loadCourses();
    this.initForm();
    this.loadVouchers();
  }

  private sortPaymentsNewestFirst(items: any[]): any[] {
    return [...items].sort((left, right) => {
      const leftTime = new Date(left.createdAt || left.updatedAt || left.ngayDangKy || 0).getTime();
      const rightTime = new Date(right.createdAt || right.updatedAt || right.ngayDangKy || 0).getTime();
      return rightTime - leftTime;
    });
  }

  toggleFilter() {

    this.isFilterOpen = !this.isFilterOpen;

  }

  loadPayments() {

    this.paymentService.getPayment().subscribe({

      next: (items: any[]) => {

        this.payments = this.sortPaymentsNewestFirst(items.map((item) => ({
          _id: item._id,

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

          trangThai: item.trangThaiThanhToan,

          createdAt: item.createdAt,
          updatedAt: item.updatedAt

        })));

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
              console.log(items);


        this.courses = items.map((item) => ({
        maKhoaHoc: item.maKhoaHoc,
        tenKhoaHoc: item.tenKhoaHoc,
        hocPhi: item.hocPhi,
        moTa: item.moTa
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

  const status =
  this.filters.status
    .trim()
    .toLowerCase();

  this.filteredPayments =
    this.payments.filter((item) => {

      const matchesRegistration =
        registration
          ? item.maDangKy
              ?.toLowerCase()
              .includes(registration)
          : true;

      const matchesCustomer =
        customer
          ? item.maKH
              ?.toLowerCase()
              .includes(customer)
          : true;

      const matchesClass =
        classCode
          ? item.maLop
              ?.toLowerCase()
              .includes(classCode)
          : true;

      const matchesBranch =
        branch
          ? item.chiNhanh
              ?.toLowerCase()
              .includes(branch)
          : true;

      const matchesCourse =
        courseCode
          ? item.khoaHoc
              ?.toLowerCase()
              .includes(courseCode)
          : true;

      const matchesStatus =
        status
          ? item.trangThai
              ?.trim()
              .toLowerCase() === status
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

    this.dialogMode = 'view';

    // Dynamically adjust sections for view mode
    const registrationSection = this.paymentDetailSections[0];
    const debtSection = this.paymentDetailSections[1];

    const baseFields = debtSection.fields.filter(
      (f: any) => f.name !== 'nhapSoTienThanhToan'
    );

    let viewFields: any[] = baseFields;

    this.paymentDetailSections = [
      registrationSection,
      { ...debtSection, fields: viewFields }
    ];

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
      nhapSoTienThanhToan: '',
      soTienConLai: item.soTienConLai,
      trangThai: item.trangThai

    });

    this.detailForm.disable();

    this.showDetailDialog = true;

  }

  paymentDebt(item: any): void {

    this.dialogMode = 'payment';

    // Restore original sections with 'Nhập số tiền thanh toán'
    this.paymentDetailSections = JSON.parse(JSON.stringify(this.originalPaymentDetailSections));

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
      nhapSoTienThanhToan: '',
      soTienConLai: item.soTienConLai,
      trangThai: item.trangThai

    });

    // khóa toàn bộ
    this.detailForm.disable();

    // mở edit
    this.detailForm.get('voucher')?.enable();

    this.detailForm.get('nhapSoTienThanhToan')?.enable();

    this.showDetailDialog = true;
    this.detailForm
    .get('voucher')
    ?.valueChanges
    .subscribe((value) => {

      this.calculatePaymentByVoucher(value);

    });

    this.detailForm
  .get('nhapSoTienThanhToan')
  ?.valueChanges
  .subscribe((value) => {

    const soTienCanThanhToan =
      Number(
        this.detailForm.get(
          'soTienCanThanhToan'
        )?.value || 0
      );

    const soTienDaDongHienTai =
      Number(
        this.detailForm.get(
          'soTienDaDong'
        )?.value || 0
      );

    const nhapSoTienThanhToan =
      Number(value || 0);

    const tongDaDong =
      soTienDaDongHienTai +
      nhapSoTienThanhToan;

    let soTienConLai =
      soTienCanThanhToan - tongDaDong;

    if (soTienConLai < 0) {
      soTienConLai = 0;
    }

    this.detailForm.patchValue(
      {
        soTienConLai:
          soTienConLai
      },
      {
        emitEvent: false
      }
    );

  });

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

  if (index === -1) {
    return;
  }

  const soTienCanThanhToan =
    Number(formValue.soTienCanThanhToan || 0);

  const soTienDaDongHienTai =
  Number(formValue.soTienDaDong || 0);

  const nhapSoTienThanhToan =
    Number(
      formValue.nhapSoTienThanhToan || 0
    );

  // cộng dồn tiền mới thanh toán
  const soTienDaDong =
    soTienDaDongHienTai +
    nhapSoTienThanhToan;

  const soTienConLai =
    soTienCanThanhToan - soTienDaDong;

  let trangThai = 'Chưa thanh toán';

  // ===== ĐÃ THANH TOÁN =====

  if (
    soTienDaDong >= soTienCanThanhToan
  ) {

    trangThai = 'Đã thanh toán';

  }

  // ===== THANH TOÁN 1 PHẦN =====

  else if (soTienDaDong > 0) {

    trangThai =
      'Đã thanh toán một phần';

  }

  // cập nhật local

  this.payments[index].voucher =
    formValue.voucher;

  this.payments[index].soTienCanThanhToan =
    soTienCanThanhToan;

  this.payments[index].soTienDaDong =
    soTienDaDong;

  this.payments[index].soTienConLai =
    soTienConLai;

  this.payments[index].trangThai =
    trangThai;

  // ===== PAYLOAD =====

  const payload = {

    voucher: formValue.voucher,

    soTienCanThanhToan:
      soTienCanThanhToan,

    soTienConLai:
      soTienConLai,

    trangThaiThanhToan:
      trangThai

  };

  // ===== UPDATE DATABASE =====

  this.paymentService
    .updatePayment(
      this.payments[index]._id,
      payload
    )
    .subscribe({

      next: (response: any) => {

        console.log(
          'Cập nhật thanh toán thành công',
          response
        );

        this.filteredPayments =
          [...this.payments];

        this.showDetailDialog = false;

      },

      error: (error: any) => {

        console.error(
          'Lỗi cập nhật payment',
          error
        );

      }

    });

}

loadVouchers() {

  this.voucherService.getVouchers().subscribe({

    next: (items: any[]) => {

      this.vouchers = items.filter(
        (x: any) => x.active === true
      );

      const options = this.vouchers.map((voucher: any) => ({
        value: voucher.maVoucher,
        label: voucher.maVoucher + ' - ' + voucher.tenChuongTrinh
      }));

      // Update the active sections
      const voucherField: any =
        this.paymentDetailSections[1].fields.find(
          (x: any) => x.name === 'voucher'
        );

      if (voucherField) {
        voucherField.options = options;
      }

      // Update the backup sections so when paymentDebt restores them, options are preserved
      const origVoucherField: any =
        this.originalPaymentDetailSections[1].fields.find(
          (x: any) => x.name === 'voucher'
        );

      if (origVoucherField) {
        origVoucherField.options = options;
      }

    },

    error: (error) => {

      console.error(
        'Không thể tải voucher',
        error
      );

    }

  });

}

calculatePaymentByVoucher(voucherCode: string): void {

  const selectedVoucher =
    this.vouchers.find(
      (x: any) => x.maVoucher === voucherCode
    );

  if (!selectedVoucher) {
    return;
  }

  const hocPhi =
    Number(this.detailForm.get('hocPhi')?.value || 0);

  let soTienCanThanhToan = hocPhi;

  // giảm theo VNĐ
  if (selectedVoucher.donViGiam === 'VNĐ') {

    soTienCanThanhToan =
      hocPhi - Number(selectedVoucher.thongSo || 0);

  }

  // giảm theo %
  else if (
    selectedVoucher.donViGiam === 'Phần trăm'
  ) {

    soTienCanThanhToan =
      hocPhi * (
        1 - Number(selectedVoucher.thongSo || 0)
      );

  }

  // không âm
  if (soTienCanThanhToan < 0) {
    soTienCanThanhToan = 0;
  }

  const soTienDaDong =
  Number(
    this.detailForm.get(
      'soTienDaDong'
    )?.value || 0
  );

let soTienConLai =
  soTienCanThanhToan - soTienDaDong;

if (soTienConLai < 0) {

  soTienConLai = 0;

}

this.detailForm.patchValue({

  soTienCanThanhToan:
    Math.round(soTienCanThanhToan),

  soTienConLai:
    Math.round(soTienConLai)

});

}

  exportExcel() {
    const data = this.filteredPayments;
    if (!data || data.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    const excelData = data.map((item: any, index: number) => ({
      'STT': index + 1,
      'Mã đăng ký': item.maDangKy ?? '',
      'Mã khách hàng': item.maKH ?? '',
      'Tên khách hàng': item.tenKhachHang ?? '',
      'Mã lớp': item.maLop ?? '',
      'Khóa học': item.khoaHoc ?? '',
      'Chi nhánh': item.chiNhanh ?? '',
      'Ngày đăng ký': item.ngayDangKy ?? '',
      'Học phí': item.hocPhi ?? 0,
      'Voucher': item.voucher ?? '',
      'Số tiền cần thanh toán': item.soTienCanThanhToan ?? 0,
      'Số tiền đã đóng': item.soTienDaDong ?? 0,
      'Số tiền còn lại': item.soTienConLai ?? 0,
      'Trạng thái': item.trangThai ?? '',
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

    const headers = Object.keys(excelData[0]);
    worksheet['!cols'] = headers.map(key => {
      const maxLen = Math.max(
        key.length,
        ...excelData.map(row => `${(row as any)[key] ?? ''}`.length)
      );
      return { wch: maxLen + 2 };
    });

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách công nợ');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, `DanhSachCongNo_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
}
