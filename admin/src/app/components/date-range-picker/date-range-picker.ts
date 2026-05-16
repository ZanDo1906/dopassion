import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DateRange {
  fromDate: string;
  toDate: string;
}

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './date-range-picker.html',
  styleUrl: './date-range-picker.css',
})
export class DateRangePickerComponent implements OnInit, OnChanges {
  @Input() label: string = 'Chọn khoảng thời gian';
  @Input() fromDate: string = '';      // Khởi tạo rỗng - để hiển thị Placeholder
  @Input() toDate: string = '';        // Khởi tạo rỗng - để hiển thị Placeholder
  @Input() minDate: string = '';       // Ngày tối thiểu có thể chọn cho startDate
  @Output() dateRangeChange = new EventEmitter<DateRange>();

  // Giá trị hiển thị trên UI (DD/MM/YYYY - DD/MM/YYYY)
  // Khởi tạo rỗng để hiển thị Placeholder màu xám trên input
  displayValue: string = '';
  showPicker: boolean = false;

  ngOnInit() {
    this.updateDisplayValue();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['fromDate'] || changes['toDate']) {
      this.updateDisplayValue();
    }
  }

  /**
   * Tính toán min constraint cho ngày kết thúc (endDate)
   * Ngày kết thúc không được phép chọn trước ngày bắt đầu
   */
  get minToDate(): string {
    return this.fromDate || this.minDate;
  }

  /**
   * Tính toán max constraint cho ngày bắt đầu (startDate)
   * Ngày bắt đầu không được phép chọn sau ngày kết thúc
   */
  get maxFromDate(): string {
    return this.toDate;
  }

  /**
   * Format minDate thành YYYY-MM-DD cho input type="date"
   * Đảm bảo input nhận đúng format constraint
   */
  get formattedMinDate(): string {
    return this.ensureDateFormat(this.minDate);
  }

  /**
   * Format minToDate (constraint của endDate) thành YYYY-MM-DD
   * Khi người dùng chọn startDate, endDate sẽ bị khóa các ngày trước đó
   */
  get formattedMinToDate(): string {
    return this.ensureDateFormat(this.minToDate);
  }

  /**
   * Format maxFromDate (constraint của startDate) thành YYYY-MM-DD
   * Khi người dùng chọn endDate, startDate sẽ bị khóa các ngày sau đó
   */
  get formattedMaxFromDate(): string {
    return this.ensureDateFormat(this.maxFromDate);
  }

  /**
   * Đảm bảo giá trị date ở format YYYY-MM-DD
   * Nếu giá trị rỗng, trả về empty string
   */
  private ensureDateFormat(dateStr: string): string {
    if (!dateStr) return '';
    
    // Nếu đã là YYYY-MM-DD, trả về ngay
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateStr;
    }
    
    // Nếu là DD/MM/YYYY, convert sang YYYY-MM-DD
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    }
    
    // Trường hợp khác, trả về như là
    return dateStr;
  }

  /**
   * Cập nhật giá trị hiển thị từ fromDate và toDate
   */
  updateDisplayValue() {
    if (this.fromDate && this.toDate) {
      const from = this.formatDateDisplay(this.fromDate);
      const to = this.formatDateDisplay(this.toDate);
      this.displayValue = `${from} - ${to}`;
    } else if (this.fromDate) {
      this.displayValue = this.formatDateDisplay(this.fromDate);
    } else {
      this.displayValue = '';
    }
  }

  /**
   * Format ngày từ YYYY-MM-DD sang DD/MM/YYYY
   */
  private formatDateDisplay(dateStr: string): string {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  /**
   * Format ngày từ DD/MM/YYYY sang YYYY-MM-DD (input type="date" format)
   */
  private formatDateInput(dateStr: string): string {
    if (!dateStr) return '';
    
    // Nếu đã ở format YYYY-MM-DD, trả về luôn
    if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
      return dateStr;
    }
    
    // Convert từ DD/MM/YYYY sang YYYY-MM-DD
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  }

  /**
   * Xử lý khi người dùng thay đổi ngày bắt đầu
   * - Nếu toDate < fromDate, tự động set toDate = fromDate
   * - Phát ra event để cập nhật UI
   */
  onFromDateChange(event: any) {
    this.fromDate = event.target.value;
    
    // Dynamic Constraint: Nếu có toDate và nó nhỏ hơn fromDate, tự động reset toDate
    if (this.toDate && this.fromDate > this.toDate) {
      this.toDate = this.fromDate;
      console.log('Auto-adjust endDate to match startDate:', this.toDate);
    }
    
    this.updateDisplayValue();
    this.emitChange();
  }

  /**
   * Xử lý khi người dùng thay đổi ngày kết thúc
   * - Nếu fromDate > toDate, tự động set fromDate = toDate
   * - Phát ra event để cập nhật UI
   */
  onToDateChange(event: any) {
    this.toDate = event.target.value;
    
    // Dynamic Constraint: Nếu có fromDate và nó lớn hơn toDate, tự động reset fromDate
    if (this.fromDate && this.toDate < this.fromDate) {
      this.fromDate = this.toDate;
      console.log('Auto-adjust startDate to match endDate:', this.fromDate);
    }
    
    this.updateDisplayValue();
    this.emitChange();
  }

  /**
   * Xóa một input date cụ thể và gỡ bỏ ràng buộc liên quan
   */
  clearFromDate() {
    this.fromDate = '';
    // Gỡ bỏ ràng buộc min của toDate
    console.log('Cleared startDate - endDate is now free');
    this.updateDisplayValue();
    this.emitChange();
  }

  clearToDate() {
    this.toDate = '';
    // Gỡ bỏ ràng buộc max của fromDate
    console.log('Cleared endDate - startDate is now free');
    this.updateDisplayValue();
    this.emitChange();
  }

  /**
   * Phát ra sự kiện khi ngày thay đổi
   */
  private emitChange() {
    this.dateRangeChange.emit({
      fromDate: this.fromDate,
      toDate: this.toDate
    });
  }

  /**
   * Toggle hiển thị date picker
   */
  togglePicker() {
    this.showPicker = !this.showPicker;
  }

  /**
   * Đóng date picker
   */
  closePicker() {
    this.showPicker = false;
  }

  /**
   * Reset giá trị về mặc định
   * Gỡ bỏ tất cả ràng buộc min/max
   */
  resetDates() {
    this.fromDate = '';
    this.toDate = '';
    this.updateDisplayValue();
    console.log('Reset dates - all constraints removed');
    this.emitChange();
  }
}
