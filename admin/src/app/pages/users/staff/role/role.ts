import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FilterDataPicker, FilterConfig } from '../../../../components/filter-data-picker/filter-data-picker';
import { PaginationComponent } from '../../../../components/pagination/pagination';

@Component({
  selector: 'app-role',
  imports: [CommonModule, FormsModule, FilterDataPicker, PaginationComponent],
  templateUrl: './role.html',
  styleUrl: './role.css',
})
export class Role implements OnInit {
  /**
   * Cấu hình bộ lọc - Truyền vào FilterDataPickerComponent
   * Sử dụng các key tiếng Việt từ JSON
   */
  filterConfig: FilterConfig[] = [
    {
      key: 'MÃ VAI TRÒ',
      label: 'Mã Vai trò',
      type: 'text'
    },
    {
      key: 'TÊN VAI TRÒ',
      label: 'Vai trò',
      type: 'text'
    }
  ];

  // All role data from JSON (không normalize)
  roles: any[] = [];

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
    this.http.get<any[]>('assets/mock-data-json/role.json').subscribe({
      next: (data) => {
        // Giữ nguyên dữ liệu từ JSON với các key tiếng Việt
        this.roles = data;
        this.filteredData = [...this.roles];
        this.updatePagination();
      },
      error: (err) => {
        console.error('Error loading role data:', err);
        // Fallback to sample data
        this.roles = [
          { 
            'STT': 1,
            'MÃ VAI TRÒ': 'ADMIN', 
            'TÊN VAI TRÒ': 'Admin', 
            'MÔ TẢ': 'Quản trị hệ thống',
            'TRẠNG THÁI': 'Đang hoạt động' 
          },
          { 
            'STT': 2,
            'MÃ VAI TRÒ': 'KETOAN', 
            'TÊN VAI TRÒ': 'Kế toán', 
            'MÔ TẢ': 'Quản lý tài chính',
            'TRẠNG THÁI': 'Đang hoạt động' 
          },
        ];
        this.filteredData = [...this.roles];
        this.updatePagination();
      }
    });
  }

  /**
   * Xử lý sự kiện tìm kiếm từ FilterDataPickerComponent
   * Lọc theo MÃ VAI TRÒ hoặc TÊN VAI TRÒ
   * @param filterValues Object chứa các giá trị filter { key: value }
   */
  handleSearch(filterValues: any): void {
    this.filteredData = this.roles.filter(role => {
      return Object.keys(filterValues).every(key => {
        const filterValue = filterValues[key];
        const roleValue = role[key];

        // Nếu không có giá trị filter cho field này, bỏ qua
        if (!filterValue) {
          return true;
        }

        // Với trường text: so sánh substring không phân biệt hoa thường
        if (typeof roleValue === 'string') {
          return roleValue.toLowerCase().includes(filterValue.toLowerCase());
        }

        // Cho các type khác, so sánh bằng
        return roleValue === filterValue;
      });
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  /**
   * Xử lý sự kiện reset từ FilterDataPickerComponent
   */
  handleReset(): void {
    this.filteredData = [...this.roles];
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    console.log('[Role] updatePagination:', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
      filteredLength: this.filteredData.length
    });

    // Safety check: validate itemsPerPage
    if (this.itemsPerPage <= 0) {
      console.error('[Role] itemsPerPage is invalid:', this.itemsPerPage);
      this.itemsPerPage = 10; // Fallback to default
    }

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    
    console.log('[Role] Slice parameters:', { start, end, arrayLength: this.filteredData.length });
    
    this.paginatedData = this.filteredData.slice(start, end);
    
    console.log('[Role] Paginated data count:', this.paginatedData.length);
  }

  onPaginationPageChange(page: number): void {
    console.log('[Role] onPaginationPageChange:', { newPage: page, currentPage: this.currentPage });
    this.currentPage = page;
    this.cdr.markForCheck(); // Force change detection
    this.updatePagination();
  }

  onPaginationPageSizeChange(size: number): void {
    console.log('[Role] onPaginationPageSizeChange:', { newSize: size, oldSize: this.itemsPerPage });
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.cdr.markForCheck(); // Force change detection
    this.updatePagination();
  }
}
