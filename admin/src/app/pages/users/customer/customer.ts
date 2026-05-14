import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FilterDataPicker, FilterConfig } from '../../../components/filter-data-picker/filter-data-picker';
import { PaginationComponent } from '../../../components/pagination/pagination';

@Component({
  selector: 'app-customer',
  imports: [CommonModule, FormsModule, FilterDataPicker, PaginationComponent],
  templateUrl: './customer.html',
  styleUrl: './customer.css',
})
export class Customer implements OnInit {
  /**
   * Cấu hình bộ lọc - Truyền vào FilterDataPickerComponent
   * Định nghĩa các trường có thể filter
   */
  filterConfig: FilterConfig[] = [
    {
      key: 'maKhachHang',
      label: 'Mã khách hàng',
      type: 'text'
    },
    {
      key: 'tenKhachHang',
      label: 'Tên khách hàng',
      type: 'text'
    }
  ];

  // All customer data from JSON
  allCustomers: any[] = [];

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  pageSizeOptions = [10, 20, 50];

  // Filter properties
  filteredCustomers: any[] = [];
  paginatedCustomers: any[] = [];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Initialize pagination state before loading data
    this.currentPage = 1;
    this.itemsPerPage = 10; // Explicitly set default
    this.filteredCustomers = [];
    this.paginatedCustomers = [];
    
    // Load data
    this.loadData();
  }

  loadData(): void {
    this.http.get<any[]>('assets/mock-data-json/client.json').subscribe({
      next: (data) => {
        // Normalize data: map 'Mã KH' to 'maKhachHang', 'Tên khách hàng' to 'tenKhachHang', etc.
        this.allCustomers = data.map(customer => ({
          maKhachHang: customer['Mã KH'] || '',
          tenKhachHang: customer['Tên khách hàng'] || '',
          phone: customer.SĐT || '',
          trangThai: customer['Trạng thái'] || 'Chưa đăng ký khóa'
        }));
        this.filteredCustomers = [...this.allCustomers];
        this.updatePagination();
      },
      error: (err) => {
        console.error('Error loading customer data:', err);
        // Fallback to sample data
        this.allCustomers = [
          { maKhachHang: 'KH001', tenKhachHang: 'Dương Trọng Nhân', phone: '0912345678', trangThai: 'Chưa đăng ký khóa' },
          { maKhachHang: 'KH002', tenKhachHang: 'Cao Thành Thuận', phone: '0912345679', trangThai: 'Chưa đăng ký khóa' },
          { maKhachHang: 'KH003', tenKhachHang: 'Nguyễn Văn A', phone: '0912345680', trangThai: 'Chưa đăng ký khóa' },
        ];
        this.filteredCustomers = [...this.allCustomers];
        this.updatePagination();
      }
    });
  }

  /**
   * Xử lý sự kiện tìm kiếm từ FilterDataPickerComponent
   * Nhận filterValues object từ component con
   * Lọc dữ liệu dựa trên các điều kiện
   * @param filterValues Object chứa các giá trị filter { key: value }
   */
  onSearch(filterValues: any): void {
    // Lọc dữ liệu: kiểm tra từng trường trong filterValues
    this.filteredCustomers = this.allCustomers.filter(customer => {
      // Duyệt qua từng field trong filterValues
      return Object.keys(filterValues).every(key => {
        const filterValue = filterValues[key];
        const customerValue = customer[key];

        // Nếu không có giá trị filter cho field này, bỏ qua
        if (!filterValue) {
          return true;
        }

        // Thực hiện so sánh (hỗ trợ text substring match)
        if (typeof customerValue === 'string') {
          return customerValue.toLowerCase().includes(filterValue.toLowerCase());
        }

        // Cho các type khác, so sánh bằng
        return customerValue === filterValue;
      });
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  /**
   * Xử lý sự kiện reset từ FilterDataPickerComponent
   * Reset tất cả các filter
   */
  onReset(): void {
    this.filteredCustomers = [...this.allCustomers];
    this.currentPage = 1;
    this.updatePagination();
  }

  onPaginationPageChange(page: number): void {
    console.log('[Customer] onPaginationPageChange:', { newPage: page, currentPage: this.currentPage, itemsPerPage: this.itemsPerPage });
    this.currentPage = page;
    this.cdr.markForCheck(); // Force change detection
    this.updatePagination();
  }

  onPaginationPageSizeChange(size: number): void {
    console.log('[Customer] onPaginationPageSizeChange:', { newSize: size, oldSize: this.itemsPerPage });
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.cdr.markForCheck(); // Force change detection
    this.updatePagination();
  }

  updatePagination(): void {
    console.log('[Customer] updatePagination:', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
      filteredLength: this.filteredCustomers.length
    });

    // Safety check: validate itemsPerPage
    if (this.itemsPerPage <= 0) {
      console.error('[Customer] itemsPerPage is invalid:', this.itemsPerPage);
      this.itemsPerPage = 10; // Fallback to default
    }

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    
    console.log('[Customer] Slice parameters:', { start, end, arrayLength: this.filteredCustomers.length });
    
    this.paginatedCustomers = this.filteredCustomers.slice(start, end);
    
    console.log('[Customer] Paginated data count:', this.paginatedCustomers.length);
  }
}
