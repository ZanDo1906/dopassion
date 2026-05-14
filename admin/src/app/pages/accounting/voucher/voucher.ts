import { Component, OnInit } from '@angular/core';
import { DecimalPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule,  } from '@angular/forms';
import { NgSelectModule,  } from '@ng-select/ng-select';
import { VoucherService,  } from '../../../services/voucher';
import { GridFormDialog } from '../../../components/form-dialog/form-dialog';

@Component({
  selector: 'app-voucher',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf, NgForOf, NgClass, DecimalPipe, NgSelectModule, GridFormDialog],
  templateUrl: './voucher.html',
  styleUrls: ['./voucher.css'],
})

export class Voucher implements OnInit {

  vouchers: any[] = [];
  filteredVouchers: any[] = [];

  loading = true;
  errorMessage = '';

  isFilterOpen = true;
  showAddDialog = false;

  currentPage = 1;
  itemsPerPage = 10;
  pageSizeOptions = [10, 20, 50];

  voucherForm!: FormGroup;

  filters = {
    voucherCode: '',
    programName: '',
    classCode: '',
    branch: [] as string[],
    courseCode: '',
    status: ''
  };

  courses = [
    { maKhoaHoc: 'LR' },
    { maKhoaHoc: 'SW' }
  ];

  branches = [
    { label: 'Chi nhánh 1', value: 'CN1' },
    { label: 'Chi nhánh 2', value: 'CN2' },
    { label: 'Chi nhánh 3', value: 'CN3' }
  ];

  voucherFormSections = [
    {
      title: 'THÔNG TIN VOUCHER',
      fields: [
        { name: 'maVoucher', label: 'Mã Voucher', type: 'text', required: true },
        { name: 'tenChuongTrinh', label: 'Tên Chương Trình', type: 'text', required: true },
        {
          name: 'chiNhanh',
          label: 'Chi nhánh áp dụng',
          type: 'select',
          options: [
            { label: 'Chi nhánh 1', value: 'CN1' },
            { label: 'Chi nhánh 2', value: 'CN2' },
            { label: 'Chi nhánh 3', value: 'CN3' },
            { label: 'Toàn hệ thống', value: 'ALL' }
          ]
        }
      ]
    },
    {
      title: 'CẤU HÌNH GIẢM GIÁ',
      fields: [
        {
          name: 'donViGiam',
          label: 'Đơn vị giảm',
          type: 'select',
          options: [
            { label: 'Phần trăm (%)', value: '%' },
            { label: 'Số tiền (VND)', value: 'VND' }
          ]
        },
        { name: 'thongSoGiam', label: 'Thông số giảm', type: 'number', required: true }
      ]
    }
  ];

  constructor(private fb: FormBuilder, private voucherService: VoucherService) {}

  ngOnInit(): void {
    this.loadVouchers();
    this.initForm();
  }

  initForm(): void {
    this.voucherForm = this.fb.group({
      maVoucher: [''],
      tenChuongTrinh: [''],
      donViGiam: ['VND'],
      thongSoGiam: [0],
      chiNhanh: ['ALL']
    });
  }

  toggleFilter(): void {
    this.isFilterOpen = !this.isFilterOpen;
  }

  loadVouchers(): void {
    this.voucherService.getVoucher().subscribe({
      next: (items: any[]) => {
        // Chuyển đổi từ Key của JSON (có dấu/khoảng trắng) sang biến Code (camelCase)
        this.vouchers = (items || []).map((item) => ({
          stt: item['STT'],
          // Đảm bảo các chuỗi trong ngoặc vuông khớp 100% với file JSON của bạn
          maVoucher: item['Mã voucher'], 
          tenChuongTrinh: item['Tên chương trình'],
          donViGiam: item['Đơn vị giảm'],
          thongSoGiam: item['Thông số'] || item['Thông số giảm'], // Phòng hờ trường hợp sai tên key
          chiNhanh: Array.isArray(item['Chi nhánh']) 
            ? item['Chi nhánh'] 
            : (item['Chi nhánh'] ? String(item['Chi nhánh']).split(', ') : [])
        }));

        this.filteredVouchers = [...this.vouchers];
        this.loading = false;
        console.log('Dữ liệu đã được chuyển đổi thành công:', this.vouchers);
      },
      error: (error) => {
        console.error('Lỗi khi tải hoặc chuyển đổi dữ liệu:', error);
        this.errorMessage = 'Không thể hiển thị danh sách voucher.';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    this.currentPage = 1;

    // Đảm bảo không bị lỗi Cannot read properties of undefined (reading 'trim')
    const voucherCode = (this.filters.voucherCode || '').trim().toLowerCase();
    const programName = (this.filters.programName || '').trim().toLowerCase();
    const classCode = (this.filters.classCode || '').trim().toLowerCase();
    const status = (this.filters.status || '').trim().toLowerCase();
    const courseCode = (this.filters.courseCode || '').trim().toLowerCase();
    
    // Đảm bảo branch luôn luôn là một mảng dù ng-select có trả về null
    const branch = this.filters.branch || [];

    this.filteredVouchers = this.vouchers.filter((item) => {
      const matchesVoucher = voucherCode ? item.maVoucher?.toLowerCase().includes(voucherCode) : true;
      const matchesProgram = programName ? item.tenChuongTrinh?.toLowerCase().includes(programName) : true;
      
      // Nếu branch là mảng rỗng thì bỏ qua điều kiện lọc này
      const matchesBranch = branch.length > 0 
        ? branch.every((cn: string) => item.chiNhanh?.includes(cn)) 
        : true;

      return matchesVoucher && matchesProgram && matchesBranch;
    });
  }

  clearFilters(): void {

    this.filters = {
      voucherCode: '',
      programName: '',
      classCode: '',
      branch: [],
      courseCode: '',
      status: ''
    };

    this.filteredVouchers = [...this.vouchers];
    this.currentPage = 1;

  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredVouchers.length / this.itemsPerPage));
  }

  get paginatedVouchers(): any[] {

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    return this.filteredVouchers.slice(start, end);

  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(page: number): void {

    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;

  }

  changePageSize(event: Event): void {

    const value = (event.target as HTMLSelectElement).value;

    this.itemsPerPage = Number(value);
    this.currentPage = 1;

  }

  openAddDialog(): void {

    this.voucherForm.reset({
      chiNhanh: 'ALL',
      donViGiam: 'VND',
      thongSoGiam: 0
    });

    this.showAddDialog = true;

  }

  closeDialog(): void {
    this.showAddDialog = false;
  }

  onSaveVoucher(): void {

  if (this.voucherForm.valid) {

    const formValue = this.voucherForm.value;

    const newData = {

      stt: this.vouchers.length + 1,

      maVoucher: formValue.maVoucher,

      tenChuongTrinh: formValue.tenChuongTrinh,

      donViGiam: formValue.donViGiam,

      thongSoGiam: formValue.thongSoGiam,

      chiNhanh: [formValue.chiNhanh]

    };

    this.vouchers.unshift(newData);

    this.filteredVouchers = [...this.vouchers];

    this.showAddDialog = false;

    console.log('Voucher mới:', newData);

  }

}

}