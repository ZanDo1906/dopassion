import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Generic Filter Configuration Interface
 * Hỗ trợ text, select, date inputs để xây dựng bộ lọc động
 */
export interface FilterConfig {
  key: string;                           // Tên trường dữ liệu (key để gửi API)
  label: string;                         // Nhãn hiển thị
  type: 'text' | 'select' | 'date';     // Loại input
  options?: Array<{ value: any; label: string }>; // Dùng cho select
}

@Component({
  selector: 'app-filter-data-picker',
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-data-picker.html',
  styleUrl: './filter-data-picker.css',
})
export class FilterDataPicker {
  /**
   * Input: Nhận cấu hình bộ lọc từ Component cha
   * Giúp component có thể tái sử dụng cho nhiều trang khác nhau
   */
  @Input() config: FilterConfig[] = [];

  /**
   * Output: Phát ra Object chứa các điều kiện lọc khi bấm nút Tìm kiếm
   * Object structure: { key1: value1, key2: value2, ... }
   */
  @Output() onSearch = new EventEmitter<any>();

  /**
   * Output: Phát ra sự kiện khi bấm xóa bộ lọc
   */
  @Output() onReset = new EventEmitter<void>();

  /**
   * Biến lưu trữ giá trị người dùng nhập
   * Structure: { [field.key]: value }
   * VD: { maKhachHang: 'KH001', tenKhachHang: 'Thuan' }
   */
  filterValues: any = {};

  /**
   * Quản lý trạng thái mở/đóng filter card
   */
  isFilterOpen = true;

  /**
   * Toggle mở/đóng filter card
   */
  toggleFilter(): void {
    this.isFilterOpen = !this.isFilterOpen;
  }

  /**
   * Xử lý sự kiện tìm kiếm
   * Phát ra object filterValues cho Component cha
   * Component cha sẽ xử lý logic lọc dữ liệu
   */
  triggerSearch(): void {
    this.onSearch.emit(this.filterValues);
  }

  /**
   * Xử lý sự kiện xóa bộ lọc
   * Reset filterValues về {}
   * Phát ra event onReset để Component cha xử lý
   */
  triggerReset(): void {
    this.filterValues = {};
    this.onReset.emit();
  }
}
