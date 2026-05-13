import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterDataPicker, FilterConfig } from '../../../components/filter-data-picker/filter-data-picker';
import { RegistrationService } from '../../../services/registration';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterDataPicker],
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
  pageSizeOptions = [5, 10, 20];
  pages: number[] = [];
  totalPages = 1;

  constructor(private registrationService: RegistrationService) {}

  ngOnInit(): void {
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
   * Cập nhật phân trang
   * Tính tổng số trang và cắt dữ liệu
   */
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedData = this.filteredData.slice(start, end);
    this.generatePages();
  }

  /**
   * Tạo danh sách số trang hiển thị (tối đa 5 trang)
   */
  generatePages(): void {
    this.pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      this.pages.push(i);
    }
  }

  /**
   * Chuyển trang
   * @param page Số trang cần chuyển
   */
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.updatePagination();
  }

  /**
   * Thay đổi số lượng item mỗi trang
   * @param event Change event từ select dropdown
   */
  changePageSize(event: any): void {
    this.itemsPerPage = Number(event.target.value);
    this.currentPage = 1;
    this.updatePagination();
  }
}
