import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterDataPicker, FilterConfig } from '../../../components/filter-data-picker/filter-data-picker';
import { PaginationComponent } from '../../../components/pagination/pagination';
import { RegistrationService } from '../../../services/registration';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterDataPicker, PaginationComponent],
  templateUrl: './registration.html',
  styleUrl: './registration.css',
})
export class Registration implements OnInit {
  /**
   * Cấu hình bộ lọc cho FilterDataPickerComponent
   * Gồm 3 trường: Mã đăng ký, Tên khách hàng, Tên lớp học
   */
  filterConfig: FilterConfig[] = [
    {
      key: 'id',
      label: 'Mã đăng ký',
      type: 'text'
    },
    {
      key: 'studentName',
      label: 'Tên khách hàng',
      type: 'text'
    },
    {
      key: 'className',
      label: 'Lớp học',
      type: 'text'
    }
  ];

  /**
   * Danh sách tất cả đăng ký (từ API)
   */
  registrations: any[] = [];

  /**
   * Danh sách đăng ký đã lọc
   */
  filteredData: any[] = [];

  /**
   * Danh sách đăng ký hiển thị (sau phân trang)
   */
  paginatedData: any[] = [];

  /**
   * Biến phân trang
   */
  currentPage = 1;
  itemsPerPage = 10;
  pageSizeOptions = [10, 20, 50];

  constructor(private registrationService: RegistrationService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Initialize pagination state before loading data
    this.currentPage = 1;
    this.itemsPerPage = 10; // Explicitly set default
    this.filteredData = [];
    this.paginatedData = [];
    
    // Load data
    this.loadData();
  }

  /**
   * Tải dữ liệu đăng ký từ API
   * Chuẩn hóa dữ liệu: đổi tên các khóa từ Tiếng Việt sang Anh
   */
  loadData(): void {
    this.registrationService.getRegistrations().subscribe({
      next: (data) => {
        // Chuẩn hóa dữ liệu: máp các khóa tiếng Việt thành khóa Anh
        this.registrations = data.map(item => ({
          id: item['Mã đăng ký'] || '',
          customerCode: item['Mã KH'] || '',
          studentName: item['Tên KH'] || '',
          className: item['Tên lớp học'] || '',
          phone: '',
          registrationDate: item['Ngày đăng ký'] || '',
          status: item['Trạng thái'] || 'Đang hoạt động'
        }));
        this.filteredData = [...this.registrations];
        this.updatePagination();
      },
      error: (err) => {
        console.error('Lỗi tải dữ liệu đăng ký:', err);
        // Dữ liệu mẫu khi lỗi
        this.registrations = [
          {
            id: 'DK-020526-001',
            customerCode: 'KH-010526-001',
            studentName: 'Nguyễn Minh Anh',
            className: 'Lớp TOEIC Speaking&Writing CN1-001',
            phone: '0912345678',
            registrationDate: '2026-05-02',
            status: 'Đang hoạt động'
          },
          {
            id: 'DK-020526-002',
            customerCode: 'KH-010526-002',
            studentName: 'Trần Quốc Bảo',
            className: 'Lớp TOEIC Listening&Reading CN1-001',
            phone: '0912345679',
            registrationDate: '2026-05-02',
            status: 'Đang hoạt động'
          }
        ];
        this.filteredData = [...this.registrations];
        this.updatePagination();
      }
    });
  }

  /**
   * Xử lý sự kiện tìm kiếm từ FilterDataPickerComponent
   * Lọc dữ liệu theo các điều kiện trong filterValues
   * @param criteria Object chứa các điều kiện lọc
   */
  handleSearch(criteria: any): void {
    this.filteredData = this.registrations.filter(registration => {
      // Lọc theo từng field trong criteria
      return Object.keys(criteria).every(key => {
        const filterValue = criteria[key];
        const registrationValue = registration[key];

        // Nếu không có giá trị lọc, bỏ qua
        if (!filterValue) {
          return true;
        }

        // So sánh chuỗi (không phân biệt hoa thường)
        if (typeof registrationValue === 'string') {
          return registrationValue.toLowerCase().includes(filterValue.toLowerCase());
        }

        return registrationValue === filterValue;
      });
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  /**
   * Xử lý sự kiện reset bộ lọc
   * Khôi phục danh sách gốc
   */
  handleReset(): void {
    this.filteredData = [...this.registrations];
    this.currentPage = 1;
    this.updatePagination();
  }

  /**
   * Xử lý sự kiện thay đổi trang từ PaginationComponent
   * Cập nhật currentPage và cắt lại dữ liệu
   * @param page Số trang mới
   */
  onPaginationPageChange(page: number): void {
    console.log('[Registration] onPaginationPageChange:', { newPage: page, currentPage: this.currentPage });
    this.currentPage = page;
    this.cdr.markForCheck(); // Force change detection
    this.updatePagination();
  }

  /**
   * Xử lý sự kiện thay đổi kích thước trang từ PaginationComponent
   * Cập nhật itemsPerPage, reset currentPage về 1, và cắt lại dữ liệu
   * @param size Số lượng item mỗi trang
   */
  onPaginationPageSizeChange(size: number): void {
    console.log('[Registration] onPaginationPageSizeChange:', { newSize: size, oldSize: this.itemsPerPage });
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.cdr.markForCheck(); // Force change detection
    this.updatePagination();
  }

  /**
   * Cập nhật phân trang: cắt mảng dữ liệu theo currentPage và itemsPerPage
   */
  updatePagination(): void {
    console.log('[Registration] updatePagination:', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
      filteredLength: this.filteredData.length
    });

    // Safety check: validate itemsPerPage
    if (this.itemsPerPage <= 0) {
      console.error('[Registration] itemsPerPage is invalid:', this.itemsPerPage);
      this.itemsPerPage = 10; // Fallback to default
    }

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    
    console.log('[Registration] Slice parameters:', { start, end, arrayLength: this.filteredData.length });
    
    this.paginatedData = this.filteredData.slice(start, end);
    
    console.log('[Registration] Paginated data count:', this.paginatedData.length);
  }
}
