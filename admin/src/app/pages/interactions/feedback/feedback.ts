import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Feedback as FeedbackService } from '../../../services/feedback';
import { GridFormDialog } from '../../../components/form-dialog/form-dialog';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule, GridFormDialog],
  templateUrl: './feedback.html',
  styleUrl: './feedback.css',
})
export class Feedback implements OnInit {
  isFilterOpen = true;
  loading = true;

  feedbacks: any[] = [];
  filteredFeedbacks: any[] = [];

  // Phân trang
  currentPage = 1;
  itemsPerPage = 10;
  pageSizeOptions = [10, 20, 50];

  // Logic Popup
  isDialogOpen = false;
  dialogSections: any[] = [];

  constructor(private feedbackService: FeedbackService) {}

  ngOnInit() {
    this.loadFeedbacks();
  }

  loadFeedbacks() {
    this.feedbackService.getFeedback().subscribe({
      next: (data: any[]) => {
        this.feedbacks = data.map((item, index) => {
          // Xử lý Ngày đánh giá (Từ "2026-05-20 00:00:00" -> "20/05/2026")
          let parsedDate = item['Ngày đánh giá'];
          if (parsedDate && parsedDate.includes(' ')) {
            const datePart = parsedDate.split(' ')[0];
            const parts = datePart.split('-');
            if (parts.length === 3) {
              parsedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
          }

          return {
            stt: item['STT'] || index + 1,
            maDanhGia: item['Mã đánh giá'],
            maDangKy: item['Mã đăng ký'],
            khachHang: item['Tên khách hàng'],
            lopHoc: item['Tên lớp học'],
            noiDung: item['Nội dung đánh giá'],
            soSao: item['Số sao'] || 5,
            ngayDanhGia: parsedDate,
            trangThai: item['Trạng thái'] || 'Chờ duyệt'
          };
        });
        this.filteredFeedbacks = [...this.feedbacks];
        this.loading = false;
      },
      error: (error) => {
        console.error('Không thể tải dữ liệu feedback.json', error);
        this.loading = false;
      }
    });
  }

  toggleFilter() {
    this.isFilterOpen = !this.isFilterOpen;
  }

  // Mở Popup Chi tiết (Giống định dạng 3 mục)
  openDetailDialog(item: any) {
    this.isDialogOpen = true;
    
    this.dialogSections = [
      {
        title: 'I. Thông tin chung',
        fields: [
          { label: 'Mã đánh giá', name: 'maDanhGia', type: 'text', value: item.maDanhGia, disabled: true },
          { label: 'Mã đăng ký', name: 'maDangKy', type: 'text', value: item.maDangKy, disabled: true },
          { label: 'Học viên', name: 'khachHang', type: 'text', value: item.khachHang, disabled: true },
          { label: 'Lớp học', name: 'lopHoc', type: 'text', value: item.lopHoc, disabled: true },
          { label: 'Ngày đánh giá', name: 'ngayDanhGia', type: 'text', value: item.ngayDanhGia, disabled: true },
          { label: 'Số sao', name: 'soSao', type: 'text', value: `${item.soSao} Sao`, disabled: true },
          { label: 'Trạng thái', name: 'trangThai', type: 'text', value: item.trangThai, disabled: true }
        ]
      },
      {
        title: 'II. Nội dung đánh giá',
        fields: [
          { label: 'Chi tiết đánh giá của học viên', name: 'noiDung', type: 'textarea', value: item.noiDung, disabled: true }
        ]
      },
      {
        title: 'III. Phản hồi từ trung tâm',
        fields: [
          // Trường duy nhất được phép nhập (để phản hồi lại học viên)
          { label: 'Nội dung phản hồi', name: 'phanHoiTrungTam', type: 'textarea', value: '', disabled: false }
        ]
      }
    ];
  }

  closeDialog() {
    this.isDialogOpen = false;
  }

  onSubmitDialog(data: any) {
    console.log('Dữ liệu phản hồi đã lưu:', data);
    this.isDialogOpen = false;
  }

  // Hàm tạo mảng sao để hiển thị HTML
  getStars(rating: number): boolean[] {
    return Array.from({length: 5}, (_, i) => i < rating);
  }

  // Set màu Badge
  getStatusClass(status: string): string {
    const s = status?.toLowerCase() || '';
    if (s.includes('đã duyệt')) return 'badge--green';
    if (s.includes('chờ') || s.includes('chưa')) return 'badge--orange';
    if (s.includes('từ chối')) return 'badge--inactive';
    return 'badge--blue';
  }

  // Phân trang
  get paginatedFeedbacks(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredFeedbacks.slice(start, end);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredFeedbacks.length / this.itemsPerPage));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  changePageSize(event: Event) {
    this.itemsPerPage = Number((event.target as HTMLSelectElement).value);
    this.currentPage = 1;
  }
}