import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Feedback as FeedbackService } from '../../../services/feedback';
import { FormDialogComponent } from '../../../components/form-dialog/form-dialog';
import { PaginationComponent } from '../../../components/pagination/pagination';
import { FilterDataPicker, FilterConfig } from '../../../components/filter-data-picker/filter-data-picker';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule, FormDialogComponent, PaginationComponent, FilterDataPicker],
  templateUrl: './feedback.html',
  styleUrl: './feedback.css',
})
export class Feedback implements OnInit {
  loading = true;

  feedbacks: any[] = [];
  filteredFeedbacks: any[] = [];
  paginatedFeedbacks: any[] = []; 

  selectedFeedback: any = null;
  isDialogOpen = false;

  currentPage = 1;
  itemsPerPage = 10;
  pageSizeOptions = [5, 10, 20, 50];

  filterValues: Record<string, any> = {};
  filterConfig: FilterConfig[] = [
    {
      key: 'maDanhGia',
      label: 'Mã đánh giá',
      type: 'text'
    },
    {
      key: 'lopHoc',
      label: 'Lớp học',
      type: 'text'
    },
    {
      key: 'soSao',
      label: 'Số sao',
      type: 'select',
      options: [
        { value: 5, label: '5 Sao' },
        { value: 4, label: '4 Sao' },
        { value: 3, label: '3 Sao' },
        { value: 2, label: '2 Sao' },
        { value: 1, label: '1 Sao' }
      ]
    },
    {
      key: 'trangThai',
      label: 'Trạng thái',
      type: 'select',
      options: [
        { value: 'Chưa ẩn', label: 'Chưa ẩn' },
        { value: 'Đã ẩn', label: 'Đã ẩn' }
      ]
    }
  ];

  constructor(private feedbackService: FeedbackService) { }

  ngOnInit() {
    this.loadFeedbacks();
  }

  loadFeedbacks() {
    this.loading = true;
    this.feedbackService.getFeedback().subscribe({
      next: (data: any[]) => {
        this.feedbacks = data.map((item, index) => {
          let parsedDate = item.ngayDanhGia;
          if (parsedDate && parsedDate.includes(' ')) {
            const datePart = parsedDate.split(' ')[0];
            const parts = datePart.split('-');
            if (parts.length === 3) {
              parsedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
          }

          return {
            _id: item._id, 
            stt: item.stt || index + 1,
            maDanhGia: item.maDanhGia,
            maDangKy: item.maDangKy,
            khachHang: item.tenKhachHang,
            lopHoc: item.tenLopHoc,
            noiDung: item.noiDungDanhGia,
            soSao: item.soSao || 5,
            ngayDanhGia: parsedDate,
            trangThai: (item.trangThai === 'Từ chối' || item.trangThai === 'Đã ẩn') ? 'Đã ẩn' : 'Chưa ẩn'
          };
        });
        this.filteredFeedbacks = [...this.feedbacks];
        this.currentPage = 1;
        this.updatePaginatedFeedbacks();
        this.loading = false;
      },
      error: (error) => {
        console.error('Không thể tải dữ liệu feedback từ Server:', error);
        this.loading = false;
      }
    });
  }

  handleSearch(filterValues: any): void {
    this.filterValues = { ...filterValues };
    this.currentPage = 1;
    this.applyFilter();
  }

  applyFilter(): void {
    this.filteredFeedbacks = this.feedbacks.filter(item => {
      return Object.keys(this.filterValues).every(key => {
        const filterValue = this.filterValues[key];
        if (filterValue === null || filterValue === undefined || filterValue === '') {
          return true;
        }

        const itemValue = item[key];

        if (key === 'maDanhGia' || key === 'lopHoc') {
          if (typeof itemValue === 'string') {
            return itemValue.toLowerCase().includes(String(filterValue).trim().toLowerCase());
          }
        }

        if (key === 'soSao') {
          return Number(itemValue) === Number(filterValue);
        }

        return String(itemValue) === String(filterValue);
      });
    });
    const maxPage = Math.max(1, Math.ceil(this.filteredFeedbacks.length / this.itemsPerPage));
    if (this.currentPage > maxPage) {
      this.currentPage = maxPage;
    }
    this.updatePaginatedFeedbacks();
  }

  updatePaginatedFeedbacks() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedFeedbacks = this.filteredFeedbacks.slice(start, end);
  }

  handleReset(): void {
    this.filterValues = {};
    this.currentPage = 1;
    this.applyFilter();
  }

  onPaginationPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedFeedbacks();
  }

  onPaginationPageSizeChange(size: number): void {
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.updatePaginatedFeedbacks();
  }

  openDetailDialog(item: any) {
    this.selectedFeedback = { ...item };
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isDialogOpen = false;
    this.selectedFeedback = null;
  }

  onSubmitDialog() {
    if (this.selectedFeedback && this.selectedFeedback._id) {
      const targetStatus = this.selectedFeedback.trangThai === 'Đã ẩn' ? 'Chưa ẩn' : 'Đã ẩn';
      const updatePayload = {
        trangThai: targetStatus
      };

      this.feedbackService.updateFeedback(this.selectedFeedback._id, updatePayload).subscribe({
        next: () => {
          if (this.selectedFeedback) {
            this.selectedFeedback.trangThai = targetStatus;
          }

          // Cập nhật danh sách local trực tiếp để giao diện nền thay đổi ngay lập tức
          const idx = this.feedbacks.findIndex(f => f._id === this.selectedFeedback._id);
          if (idx !== -1) {
            this.feedbacks[idx].trangThai = targetStatus;
          }
          this.applyFilter();
        },
        error: (err) => {
          console.error('Lỗi khi cập nhật trạng thái hiển thị đánh giá:', err);
        }
      });
    }
  }

  getStars(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < rating);
  }
}