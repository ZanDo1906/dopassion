import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Class } from '../../services/class';
import { iClass, ClassFilter } from '../../interfaces/class';
import { DateRangePickerComponent, DateRange } from '../../components/date-range-picker/date-range-picker';

@Component({
  selector: 'app-classes',
  imports: [CommonModule, DateRangePickerComponent],
  providers: [Class],
  templateUrl: './classes.html',
  styleUrl: './classes.css',
})
export class Classes implements OnInit {
  // Biến lưu trữ bộ lọc hiện tại
  // Khởi tạo startDate/endDate rỗng để hiển thị Placeholder ban đầu
  currentFilters: ClassFilter = {
    courseCode: '',
    branch: '',
    startDate: '',
    endDate: '',
    keyword: ''
  };

  // Dữ liệu hiển thị trên UI
  courses: any[] = [];
  
  constructor(private classService: Class) {}
  
  ngOnInit() {
    console.log('Classes component initialized');
    this.loadClasses();
  }
  
  /**
   * Lấy dữ liệu lớp học từ Service với bộ lọc hiện tại
   */
  loadClasses() {
    // Chuẩn bị bộ lọc để gửi tới Service
    const filters: ClassFilter = {
      courseCode: this.currentFilters.courseCode || undefined,
      branch: this.currentFilters.branch || undefined,
      startDate: this.currentFilters.startDate,
      endDate: this.currentFilters.endDate,
      keyword: this.currentFilters.keyword || undefined
    };

    // Gọi Service để lấy dữ liệu đã được lọc
    this.classService.getClasses(filters).subscribe({
      next: (data: any[]) => {
        console.log('Filtered data received from service:', data);
        // Gán dữ liệu, có thể là mảng rỗng nếu không khớp filter
        this.courses = data && data.length > 0 ? data : [];
        console.log('Total courses after filter:', this.courses.length);
      },
      error: (error) => {
        console.error('Error loading classes from service:', error);
        // Gán mảng rỗng khi có lỗi để hiển thị Empty State
        this.courses = [];
      }
    });
  }
  
  /**
   * Xử lý khi người dùng thay đổi lựa chọn khóa học
   * Cập nhật filter và gọi service để lấy dữ liệu mới
   */
  filterByCourse(event: any) {
    this.currentFilters.courseCode = event.target.value;
    console.log('Course filter changed:', this.currentFilters.courseCode);
  }
  
  /**
   * Xử lý khi người dùng thay đổi lựa chọn chi nhánh
   * Cập nhật filter và gọi service để lấy dữ liệu mới
   */
  filterByBranch(event: any) {
    const selectedBranch = event.target.value;
    
    // Convert từ tên chi nhánh (Hà Nội) sang code (CN1)
    const branchCodeMap: { [key: string]: string } = {
      'Hà Nội': 'CN1',
      'TP. HCM': 'CN2',
      'Đà Nẵng': 'CN3'
    };
    
    this.currentFilters.branch = branchCodeMap[selectedBranch] || '';
    console.log('Branch filter changed:', this.currentFilters.branch);
  }
  
  /**
   * Xử lý khi người dùng thay đổi khoảng ngày khai giảng
   * Cập nhật filter và gọi service để lấy dữ liệu mới
   */
  onDateRangeChange(dateRange: DateRange) {
    this.currentFilters.startDate = dateRange.fromDate;
    this.currentFilters.endDate = dateRange.toDate;
    console.log('Date range changed:', {
      startDate: this.currentFilters.startDate,
      endDate: this.currentFilters.endDate
    });
  }

  /**
   * Format ngày tháng hiển thị trên UI
   */
  formatDate(date: string): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  /**
   * Thực hiện tìm kiếm với các bộ lọc hiện tại
   * Gọi Service với ClassFilter object để lấy dữ liệu đã được lọc
   * Logic lọc (filter) hoàn toàn được xử lý bên Service
   */
  onSearch() {
    console.log('Search button clicked with filters:', this.currentFilters);
    this.loadClasses();
  }

  /**
   * Reset tất cả các bộ lọc về trạng thái mặc định
   * - Reset courseCode (Khóa học)
   * - Reset branch (Chi nhánh)
   * - Reset startDate/endDate (Khoảng thời gian) - Về rỗng để hiển thị Placeholder
   * - Reset keyword (Từ khóa tìm kiếm)
   * - Load lại dữ liệu toàn bộ danh sách
   */
  resetFilters() {
    console.log('Resetting all filters');
    
    // Reset tất cả filters về giá trị mặc định (rỗng)
    // startDate/endDate rỗng sẽ lọc toàn bộ dữ liệu (không hạn chế ngày)
    this.currentFilters = {
      courseCode: '',
      branch: '',
      startDate: '',
      endDate: '',
      keyword: ''
    };

    // Reset các select elements
    const courseSelect = document.querySelector(
      'select[title*="Khóa"]'
    ) as HTMLSelectElement;
    const branchSelect = document.querySelector(
      'select[title*="Chi"]'
    ) as HTMLSelectElement;

    if (courseSelect) courseSelect.value = '';
    if (branchSelect) branchSelect.value = '';

    console.log('All filters reset to defaults:', this.currentFilters);

    // Load lại danh sách đầy đủ
    this.loadClasses();
  }
}
