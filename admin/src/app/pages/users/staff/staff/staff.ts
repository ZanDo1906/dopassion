import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FilterDataPicker, FilterConfig } from '../../../../components/filter-data-picker/filter-data-picker';
import { PaginationComponent } from '../../../../components/pagination/pagination';
@Component({
  selector: 'app-staff',
  imports: [CommonModule, FormsModule, FilterDataPicker, PaginationComponent],
  templateUrl: './staff.html',
  styleUrl: './staff.css',
})
export class Staff implements OnInit {
  /**
   * Cấu hình bộ lọc - Truyền vào FilterDataPickerComponent
   * Định nghĩa các trường có thể filter
   */
  filterConfig: FilterConfig[] = [
    {
      key: 'maNhanVien',
      label: 'Mã nhân viên',
      type: 'text'
    },
    {
      key: 'tenNhanVien',
      label: 'Tên nhân viên',
      type: 'text'
    },
    {
      key: 'gioiTinh',
      label: 'Giới tính',
      type: 'select',
      options: [
        { value: 'Nam', label: 'Nam' },
        { value: 'Nữ', label: 'Nữ' },
        { value: 'Khác', label: 'Khác' }
      ]
    },
    {
      key: 'chiNhanh',
      label: 'Chi nhánh',
      type: 'select',
      options: [
        { value: 'CN1', label: 'Chi nhánh 1' },
        { value: 'CN2', label: 'Chi nhánh 2' },
        { value: 'CN3', label: 'Chi nhánh 3' }
      ]
    },
    {
      key: 'vaiTro',
      label: 'Vai trò',
      type: 'select',
      options: [
        { value: 'Quản trị hệ thống', label: 'Admin' },
        { value: 'Giảng viên', label: 'Giảng viên' },
        { value: 'Nhân viên kế toán', label: 'Kế toán' },
        { value: 'Nhân viên hành chính', label: 'Nhân viên hành chính' }
      ]
    }
  ];

  // All staff data from JSON
  allStaffs: any[] = [];

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  pageSizeOptions = [10, 20, 50];

  // Filter properties
  filteredData: any[] = [];
  paginatedData: any[] = [];

  // Inject ChangeDetectorRef để force change detection
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Initialize pagination state before loading data
    this.currentPage = 1;
    this.itemsPerPage = 10; // Explicitly set default
    this.filteredData = [];
    this.paginatedData = [];
    
    // Load data
    this.loadData();
  }

  loadData(): void {
    this.http.get<any[]>('assets/mock-data-json/staff.json').subscribe({
      next: (data) => {
        // Normalize data: map Vietnamese keys to normalized keys
        this.allStaffs = data.map(staff => ({
          maNhanVien: staff['Mã NV'] || '',
          tenNhanVien: staff['Tên nhân viên'] || '',
          gioiTinh: staff['Giới tính'] || '',
          chiNhanh: staff['Chi nhánh'] || '',
          vaiTro: staff['Vai trò'] || '',
          trangThai: 'Đang hoạt động' // Default status
        }));
        this.filteredData = [...this.allStaffs];
        this.updatePagination();
      },
      error: (err) => {
        console.error('Error loading staff data:', err);
        // Fallback to sample data
        this.allStaffs = [
          { maNhanVien: 'NV001', tenNhanVien: 'Nguyễn Văn A', gioiTinh: 'Nam', chiNhanh: 'CN1', vaiTro: 'Quản trị hệ thống', trangThai: 'Đang hoạt động' },
          { maNhanVien: 'NV002', tenNhanVien: 'Trần Thị B', gioiTinh: 'Nữ', chiNhanh: 'CN2', vaiTro: 'Giảng viên', trangThai: 'Đang hoạt động' },
        ];
        this.filteredData = [...this.allStaffs];
        this.updatePagination();
      }
    });
  }

  /**
   * Xử lý sự kiện tìm kiếm từ FilterDataPickerComponent
   * @param filterValues Object chứa các giá trị filter { key: value }
   */
  handleSearch(filterValues: any): void {
    this.filteredData = this.allStaffs.filter(staff => {
      return Object.keys(filterValues).every(key => {
        const filterValue = filterValues[key];
        const staffValue = staff[key];

        // Nếu không có giá trị filter cho field này, bỏ qua
        if (!filterValue) {
          return true;
        }

        // Với trường text (maNhanVien, tenNhanVien): so sánh substring không phân biệt hoa thường
        if (key === 'maNhanVien' || key === 'tenNhanVien') {
          if (typeof staffValue === 'string') {
            return staffValue.toLowerCase().includes(filterValue.toLowerCase());
          }
        }

        // Với trường select (gioiTinh, chiNhanh, vaiTro): so sánh bằng tuyệt đối
        return staffValue === filterValue;
      });
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  /**
   * Xử lý sự kiện reset từ FilterDataPickerComponent
   */
  handleReset(): void {
    this.filteredData = [...this.allStaffs];
    this.currentPage = 1;
    this.updatePagination();
  }

  onPaginationPageChange(page: number): void {
    console.log('[Staff] onPaginationPageChange:', { newPage: page, currentPage: this.currentPage });
    this.currentPage = page;
    this.cdr.markForCheck(); // Force change detection
    this.updatePagination();
  }

  onPaginationPageSizeChange(size: number): void {
    console.log('[Staff] onPaginationPageSizeChange:', { newSize: size, oldSize: this.itemsPerPage });
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.cdr.markForCheck(); // Force change detection
    this.updatePagination();
  }

  updatePagination(): void {
    console.log('[Staff] updatePagination:', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
      filteredLength: this.filteredData.length
    });

    // Safety check: validate itemsPerPage
    if (this.itemsPerPage <= 0) {
      console.error('[Staff] itemsPerPage is invalid:', this.itemsPerPage);
      this.itemsPerPage = 10; // Fallback to default
    }

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    
    console.log('[Staff] Slice parameters:', { start, end, arrayLength: this.filteredData.length });
    
    this.paginatedData = this.filteredData.slice(start, end);
    
    console.log('[Staff] Paginated data count:', this.paginatedData.length);
  }
}
