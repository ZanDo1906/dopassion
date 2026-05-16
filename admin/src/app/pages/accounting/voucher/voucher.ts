import { Component, OnInit } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { VoucherService } from '../../../services/voucher';
import { GridFormDialog } from '../../../components/form-dialog/form-dialog';
import { FilterConfig, FilterDataPicker } from '../../../components/filter-data-picker/filter-data-picker';

@Component({
  selector: 'app-voucher',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf, NgForOf, NgSelectModule, GridFormDialog, FilterDataPicker],
  templateUrl: './voucher.html',
  styleUrls: ['./voucher.css'],
})

export class Voucher implements OnInit {

  filterConfig: FilterConfig[] = [
    {
      key: 'maVoucher',
      label: 'Mã Voucher',
      type: 'text'
    },
    {
      key: 'tenChuongTrinh',
      label: 'Tên Chương Trình',
      type: 'text'
    },
    {
      key: 'maKhoaHoc',
      label: 'Mã Khóa học',
      type: 'select',
      options: []
    },
    {
      key: 'maLop',
      label: 'Mã Lớp',
      type: 'text'
    },
    {
      key: 'chiNhanh',
      label: 'Chi nhánh',
      type: 'multi-select',
      options: []
    },
    {
      key: 'trangThai',
      label: 'Trạng thái',
      type: 'multi-select',
      options: [
        { label: 'Đang hoạt động', value: 'Đang hoạt động' },
        { label: 'Ngưng hoạt động', value: 'Ngưng hoạt động' }
      ]
    }
  ];

  allData: any[] = [];
  filteredData: any[] = [];
  paginatedData: any[] = [];

  loading = true;
  errorMessage = '';

  showAddDialog = false;

  currentPage = 1;
  itemsPerPage = 10;
  pageSizeOptions = [10, 20, 50];

  voucherForm!: FormGroup;

  branches = [
    { label: 'Chi nhánh 1', value: 'CN1' },
    { label: 'Chi nhánh 2', value: 'CN2' },
    { label: 'Chi nhánh 3', value: 'CN3' }
  ];

  courseOptions = [
    { label: 'LR', value: 'LR' },
    { label: 'SW', value: 'SW' },
    { label: 'TOEIC', value: 'TOEIC' }
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

  loadVouchers(): void {
    this.voucherService.getVoucher().subscribe({
      next: (items: any[]) => {
        // Chuyển đổi từ Key của JSON (có dấu/khoảng trắng) sang biến Code (camelCase)
        this.allData = (items || []).map((item) => ({
          stt: item['STT'],
          // Đảm bảo các chuỗi trong ngoặc vuông khớp 100% với file JSON của bạn
          maVoucher: item['Mã voucher'], 
          tenChuongTrinh: item['Tên chương trình'],
          donViGiam: item['Đơn vị giảm'],
          thongSoGiam: item['Thông số'] || item['Thông số giảm'], // Phòng hờ trường hợp sai tên key
          maKhoaHoc: item['Mã Khóa học'] || item['Mã khóa học'] || '',
          maLop: item['Mã Lớp'] || item['Mã lớp'] || '',
          chiNhanh: Array.isArray(item['Chi nhánh']) 
            ? item['Chi nhánh'] 
            : (item['Chi nhánh'] ? String(item['Chi nhánh']).split(', ') : []),
          trangThai: item['Trạng thái'] || 'Đang hoạt động'
        }));

        this.filteredData = [...this.allData];
        this.syncFilterOptions();
        this.currentPage = 1;
        this.updatePagination();
        this.loading = false;
        console.log('Dữ liệu đã được chuyển đổi thành công:', this.allData);
      },
      error: (error) => {
        console.error('Lỗi khi tải hoặc chuyển đổi dữ liệu:', error);
        this.errorMessage = 'Không thể hiển thị danh sách voucher.';
        this.loading = false;
      }
    });
  }

  handleSearch(filterValues: any): void {
    this.filteredData = this.allData.filter((item) => {
      return Object.keys(filterValues || {}).every((key) => {
        const filterValue = filterValues[key];
        const itemValue = item[key];

        if (Array.isArray(filterValue) && filterValue.length === 0) {
          return true;
        }

        if (!Array.isArray(filterValue) && (`${filterValue ?? ''}`.trim() === '')) {
          return true;
        }

        // Nếu filterValues[key] là một mảng (multi-select) và có dữ liệu
        if (Array.isArray(filterValue) && filterValue.length > 0) {
          const normalizedSelected = filterValue
            .map((value) => `${value ?? ''}`.trim().toLowerCase())
            .filter(Boolean);

          // Giữ lại bản ghi nếu giá trị của nó nằm trong mảng được chọn
          if (Array.isArray(itemValue)) {
            const normalizedItemValues = itemValue
              .map((value) => `${value ?? ''}`.trim().toLowerCase())
              .filter(Boolean);
            return normalizedSelected.some((selected) => normalizedItemValues.includes(selected));
          }

          const normalizedItemValue = `${itemValue ?? ''}`.trim().toLowerCase();
          return normalizedSelected.includes(normalizedItemValue);
        }

        const normalizedFilterText = `${filterValue ?? ''}`.trim().toLowerCase();
        if (Array.isArray(itemValue)) {
          const normalizedItemText = itemValue
            .map((value) => `${value ?? ''}`.trim().toLowerCase())
            .join(' ');
          return normalizedItemText.includes(normalizedFilterText);
        }

        // TODO: Chốt quy tắc lọc theo nghiệp vụ sau
        const normalizedItemValue = `${itemValue ?? ''}`.trim().toLowerCase();
        return normalizedItemValue.includes(normalizedFilterText);
      });
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  handleReset(): void {
    this.filteredData = [...this.allData];
    this.currentPage = 1;
    this.updatePagination();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredData.length / this.itemsPerPage));
  }

  get paginatedVouchers(): any[] {
    return this.paginatedData;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(page: number): void {

    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
    this.updatePagination();

  }

  changePageSize(event: Event): void {

    const value = (event.target as HTMLSelectElement).value;

    this.itemsPerPage = Number(value);
    this.currentPage = 1;
    this.updatePagination();

  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedData = this.filteredData.slice(start, end);
  }

  private syncFilterOptions(): void {
    const courseOptions = Array.from(new Set(this.allData.map((item) => `${item.maKhoaHoc ?? ''}`.trim()).filter(Boolean)))
      .map((value) => ({ label: value, value }));

    const branchOptions = Array.from(new Set(
      this.allData.flatMap((item) => Array.isArray(item.chiNhanh) ? item.chiNhanh : [])
    ))
      .filter(Boolean)
      .map((value) => ({ label: value, value }));

    this.filterConfig = this.filterConfig.map((field) => {
      if (field.key === 'maKhoaHoc') {
        return { ...field, options: courseOptions.length > 0 ? courseOptions : this.courseOptions };
      }

      if (field.key === 'chiNhanh') {
        return { ...field, options: branchOptions.length > 0 ? branchOptions : this.branches };
      }

      return field;
    });
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
        stt: this.allData.length + 1,
        maVoucher: formValue.maVoucher,
        tenChuongTrinh: formValue.tenChuongTrinh,
        donViGiam: formValue.donViGiam,
        thongSoGiam: formValue.thongSoGiam,
        chiNhanh: [formValue.chiNhanh]
      };

      this.allData.unshift(newData);
      this.filteredData = [...this.allData];
      this.currentPage = 1;
      this.updatePagination();

      this.showAddDialog = false;

      console.log('Voucher mới:', newData);
    }
  }

}
