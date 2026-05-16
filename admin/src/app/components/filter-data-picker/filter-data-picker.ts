import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Generic Filter Configuration Interface
 * Hỗ trợ text, select, date inputs để xây dựng bộ lọc động
 */
export interface FilterConfig {
  key: string;                           // Tên trường dữ liệu (key để gửi API)
  label: string;                         // Nhãn hiển thị
  type: 'text' | 'select' | 'multi-select' | 'date' | 'number'; // Loại input
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

  openDropdownKey: string | null = null;

  /**
   * Quản lý trạng thái mở/đóng filter card
   */
  isFilterOpen = true;

  /**
   * Toggle mở/đóng filter card
   */
  constructor(private elementRef: ElementRef<HTMLElement>) {}

  toggleFilter(): void {
    this.isFilterOpen = !this.isFilterOpen;
  }

  toggleMultiSelectDropdown(key: string): void {
    this.openDropdownKey = this.openDropdownKey === key ? null : key;
  }

  onMultiSelectChange(key: string, value: any, isChecked: boolean): void {
    const currentValues = Array.isArray(this.filterValues[key]) ? [...this.filterValues[key]] : [];

    if (isChecked) {
      if (!currentValues.includes(value)) {
        currentValues.push(value);
      }
    } else {
      const index = currentValues.indexOf(value);
      if (index !== -1) {
        currentValues.splice(index, 1);
      }
    }

    this.filterValues[key] = currentValues;
  }

  isMultiSelectChecked(key: string, value: any): boolean {
    const currentValues = Array.isArray(this.filterValues[key]) ? this.filterValues[key] : [];
    return currentValues.includes(value);
  }

  getMultiSelectDisplay(field: FilterConfig): string {
    const selectedValues = Array.isArray(this.filterValues[field.key]) ? this.filterValues[field.key] : [];

    if (selectedValues.length === 0) {
      return `-- Chọn ${field.label} --`;
    }

    if (selectedValues.length > 2) {
      return `Đã chọn ${selectedValues.length}`;
    }

    const selectedLabels = selectedValues.map((value: any) => {
      const option = field.options?.find((item) => item.value === value);
      return option?.label ?? `${value}`;
    });

    return selectedLabels.join(', ');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (!target) {
      return;
    }

    if (!this.elementRef.nativeElement.contains(target)) {
      this.openDropdownKey = null;
    }
  }

  /**
   * Xử lý sự kiện tìm kiếm
   * Phát ra object filterValues cho Component cha
   * Component cha sẽ xử lý logic lọc dữ liệu
   */
  triggerSearch(): void {
    const normalizedValues = { ...this.filterValues };

    for (const field of this.config) {
      if (field.type !== 'multi-select') {
        continue;
      }

      const rawValue = normalizedValues[field.key];
      if (Array.isArray(rawValue)) {
        normalizedValues[field.key] = rawValue;
      } else if (rawValue === null || rawValue === undefined || rawValue === '') {
        normalizedValues[field.key] = [];
      } else {
        normalizedValues[field.key] = [rawValue];
      }
    }

    this.onSearch.emit(normalizedValues);
  }

  /**
   * Xử lý sự kiện xóa bộ lọc
   * Reset filterValues về {}
   * Phát ra event onReset để Component cha xử lý
   */
  triggerReset(): void {
    this.filterValues = {};
    this.openDropdownKey = null;
    this.onReset.emit();
  }
}
