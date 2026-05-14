import { Component, Input, Output, EventEmitter, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class PaginationComponent implements OnChanges, OnInit {
  @Input() totalItems: number = 0;
  @Input() currentPage: number = 1;
  @Input() itemsPerPage: number = 10;
  @Input() pageSizeOptions: number[] = [10, 20, 50];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  pages: number[] = [];
  totalPages: number = 1;
  selectedPageSize: number = 10;

  ngOnChanges(changes: SimpleChanges): void {
    console.log('[Pagination] ngOnChanges triggered:', Object.keys(changes));
    
    // Luôn tính lại totalPages khi totalItems hoặc itemsPerPage thay đổi
    if (changes['totalItems'] || changes['itemsPerPage']) {
      console.log('[Pagination] Recalculating totalPages due to totalItems or itemsPerPage change');
      this.calculateTotalPages();
    }
    // Luôn tính lại pages array khi bất kỳ input nào thay đổi
    if (changes['totalItems'] || changes['itemsPerPage'] || changes['currentPage']) {
      console.log('[Pagination] Regenerating pages array');
      this.generatePages();
    }

    if (changes['itemsPerPage']) {
      this.selectedPageSize = this.itemsPerPage;
      console.log('[Pagination] Sync selectedPageSize:', this.selectedPageSize);
    }
  }

  ngOnInit(): void {
    this.selectedPageSize = this.itemsPerPage;
  }

  calculateTotalPages(): void {
    console.log('[Pagination] calculateTotalPages:', { totalItems: this.totalItems, itemsPerPage: this.itemsPerPage });
    
    if (this.itemsPerPage <= 0) {
      console.warn('[Pagination] itemsPerPage is 0 or negative, setting totalPages to 1');
      this.totalPages = 1;
      return;
    }
    this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
    console.log('[Pagination] totalPages calculated:', this.totalPages);
  }

  /**
   * Sinh danh sách số trang để hiển thị (tối đa 5 trang)
   * Đảm bảo pages array luôn chứa các số từ 1 trở đi
   */
  generatePages(): void {
    this.pages = [];
    
    // Nếu không có trang nào, return array rỗng
    if (this.totalPages <= 0) {
      return;
    }

    const maxPagesToShow = 5;
    
    // Tính startPage và endPage
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    // Điều chỉnh lại startPage nếu endPage gần đến cuối
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Sinh danh sách số trang (bắt đầu từ 1)
    for (let i = startPage; i <= endPage; i++) {
      this.pages.push(i);
    }
  }

  onPageChange(page: number): void {
    // Validate page number - chỉ check hợp lệ, không check bằng currentPage
    // vì currentPage ở child có thể chưa được sync từ parent
    if (!page || page < 1 || page > this.totalPages) {
      console.warn('[Pagination] Invalid page:', { page, totalPages: this.totalPages });
      return;
    }
    console.log('[Pagination] onPageChange emitting:', { newPage: page, currentPage: this.currentPage });
    // Emit chính xác con số trang mà người dùng click
    this.pageChange.emit(page);
  }

  onPageSizeChange(newSize: number): void {
    const numericSize = Number(newSize);
    console.log('[Pagination] onPageSizeChange triggered:', { newSize: numericSize, currentItemsPerPage: this.itemsPerPage });
    
    if (numericSize && numericSize > 0 && numericSize !== this.itemsPerPage) {
      console.log('[Pagination] Emitting pageSizeChange:', numericSize);
      this.pageSizeChange.emit(numericSize);
    } else {
      console.warn('[Pagination] Invalid newSize or same as current:', { newSize: numericSize, current: this.itemsPerPage });
    }
  }

  /**
   * Trả về số trang trước đó (nhưng không nhỏ hơn 1)
   */
  getPreviousPageNumber(): number {
    return Math.max(1, this.currentPage - 1);
  }

  /**
   * Trả về số trang tiếp theo (nhưng không lớn hơn totalPages)
   */
  getNextPageNumber(): number {
    return Math.min(this.totalPages, this.currentPage + 1);
  }

  /**
   * Tính item đầu tiên trên trang hiện tại
   */
  getStartItem(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  /**
   * Tính item cuối cùng trên trang hiện tại
   */
  getEndItem(): number {
    if (this.totalItems === 0) return 0;
    const calculated = this.currentPage * this.itemsPerPage;
    return Math.min(calculated, this.totalItems);
  }

  /**
   * Kiểm tra xem nút Previous có bị disabled không
   */
  isPreviousDisabled(): boolean {
    return this.currentPage <= 1 || this.totalPages <= 1;
  }

  /**
   * Kiểm tra xem nút Next có bị disabled không
   */
  isNextDisabled(): boolean {
    return this.currentPage >= this.totalPages || this.totalPages <= 1;
  }
}
