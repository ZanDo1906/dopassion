import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DecimalPipe, NgForOf, NgIf, NgClass } from '@angular/common';
import { GridFormDialog } from '../../../components/form-dialog/form-dialog';
import { RefundService } from '../../../services/refund';

@Component({
  selector: 'app-refund',
  standalone: true,

  imports: [FormsModule, ReactiveFormsModule, NgIf, NgForOf, NgClass, DecimalPipe, GridFormDialog],
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

  showDetailDialog = false;
  dialogMode: 'view' | 'approve' = 'view';
  detailForm!: FormGroup;

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

  registrationSection = {

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
  };

  approvedRefundSection = {

    title: 'THÔNG TIN HOÀN TIỀN',

    fields: [

      {
        name: 'lyDoYeuCau',
        label: 'Lý do yêu cầu hoàn tiền',
        type: 'textarea'
      },

      {
        name: 'daThanhToan',
        label: 'Đã thanh toán',
        type: 'number'
      },

      {
        name: 'soTienHoan',
        label: 'Số tiền hoàn',
        type: 'number'
      },

      {
        name: 'lyDoChapNhan',
        label: 'Lý do chấp nhận hoàn tiền',
        type: 'textarea'
      },

      {
        name: 'trangThai',
        label: 'Trạng thái',
        type: 'text'
      }

    ]
  };

  rejectedRefundSection = {

    title: 'THÔNG TIN TỪ CHỐI',

    fields: [

      {
        name: 'lyDoYeuCau',
        label: 'Lý do yêu cầu hoàn tiền',
        type: 'textarea'
      },

      {
        name: 'daThanhToan',
        label: 'Đã thanh toán',
        type: 'number'
      },

      {
        name: 'lyDoTuChoi',
        label: 'Lý do từ chối',
        type: 'textarea'
      },

      {
        name: 'trangThai',
        label: 'Trạng thái',
        type: 'text'
      }

    ]
  };

  refundDetailSections: any[] = [];

  constructor(
    private refundService: RefundService,
    private fb: FormBuilder
  ) {

    this.loadRefunds();
    this.initForm();
  }

  initForm() {

    this.detailForm = this.fb.group({

      maDangKy: [''],
      maKH: [''],
      tenKhachHang: [''],
      maLop: [''],
      khoaHoc: [''],
      chiNhanh: [''],
      ngayDangKy: [''],
      daThanhToan: [''],
      soTienHoan: [''],
      lyDoYeuCau: [''],
      lyDoChapNhan: [''],
      lyDoTuChoi: [''],
      trangThai: ['']

    });

  }

  toggleFilter() {

    this.isFilterOpen = !this.isFilterOpen;

  }

  loadRefunds() {

    this.refundService.getRefund().subscribe({

      next: (items: any[]) => {

        this.refunds = items.map((item) => ({

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
          daThanhToan: item.daThanhToan,
          soTienHoan: item.soTienHoan,
          lyDoYeuCau: item.lyDoYeuCauHoanTien || '',
          lyDoChapNhan: item.lyDoChapNhanHoanTien || '',
          lyDoTuChoi: item.lyDoTuChoi,
          trangThai: item.trangThai

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

  viewRefundDetail(item: any): void {
    this.dialogMode = 'view';
    if (item.trangThai === 'Đã hủy') {

      this.refundDetailSections = [

        this.registrationSection,
        this.rejectedRefundSection

      ];

    } else {

      this.refundDetailSections = [

        this.registrationSection,
        this.approvedRefundSection

      ];

    }
    this.detailForm.patchValue({

      maDangKy: item.maDangKy,
      maKH: item.maKH,
      tenKhachHang: item.tenKhachHang,
      maLop: item.maLop,
      khoaHoc: item.khoaHoc,
      chiNhanh: item.chiNhanh,
      ngayDangKy: item.ngayDangKy,
      daThanhToan: item.daThanhToan,
      soTienHoan: item.soTienHoan,
      lyDoYeuCau: item.lyDoYeuCau,
      lyDoChapNhan: item.lyDoChapNhan,
      lyDoTuChoi: item.lyDoTuChoi,
      trangThai: item.trangThai

    });

    this.detailForm.disable();

    this.showDetailDialog = true;

  }
  approveRefund(item: any): void {

    this.dialogMode = 'approve';

    this.detailForm.patchValue({

      maDangKy: item.maDangKy,
      maKH: item.maKH,
      tenKhachHang: item.tenKhachHang,
      maLop: item.maLop,
      khoaHoc: item.khoaHoc,
      chiNhanh: item.chiNhanh,
      ngayDangKy: item.ngayDangKy,
      daThanhToan: item.daThanhToan,
      soTienHoan: item.soTienHoan,
      lyDoYeuCau: item.lyDoYeuCau,
      lyDoChapNhan: item.lyDoChapNhan,
      trangThai: item.trangThai

    });

    // disable toàn bộ trước
    this.detailForm.disable();

    // mở edit 2 field
    this.detailForm.get('soTienHoan')?.enable();

    this.detailForm.get('lyDoChapNhan')?.enable();

    this.showDetailDialog = true;

  }
  closeDialog(): void {

    this.showDetailDialog = false;

  }

  saveApproveRefund(): void {

    const formValue =
      this.detailForm.getRawValue();

    const index =
      this.refunds.findIndex(
        x => x.maDangKy === formValue.maDangKy
      );

    if (index !== -1) {

      this.refunds[index].soTienHoan =
        formValue.soTienHoan;

      this.refunds[index].lyDoChapNhan =
        formValue.lyDoChapNhan;

      this.refunds[index].trangThai =
        'Đã duyệt';

      this.filteredRefunds = [
        ...this.refunds
      ];
    }

    this.showDetailDialog = false;

  }
}