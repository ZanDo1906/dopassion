import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../../services/contact';
import { GridFormDialog } from '../../../components/form-dialog/form-dialog';

@Component({
  selector: 'app-request',
  standalone: true,
  imports: [CommonModule, FormsModule, GridFormDialog],
  templateUrl: './request.html',
  styleUrl: './request.css',
})
export class Request implements OnInit {
  isFilterOpen = true;
  loading = true;
  requests: any[] = [];
  filteredRequests: any[] = [];

  // Phân trang
  currentPage = 1;
  itemsPerPage = 10;
  pageSizeOptions = [10, 20, 50];

  // Trạng thái Popup
  isDialogOpen = false;
  dialogSections: any[] = [];

  constructor(private contactService: Contact) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.contactService.getContact().subscribe({
      next: (data: any[]) => {
        this.requests = data.map((item, index) => {
          // Trích xuất ngày từ Mã liên hệ (LH-080526-001 -> 08/05/2026)
          let dateStr = 'N/A';
          const maLH = item['Mã liên hệ'] || '';
          if (maLH.length >= 11) {
            const d = maLH.substring(3, 5);
            const m = maLH.substring(5, 7);
            const y = '20' + maLH.substring(7, 9);
            dateStr = `${d}/${m}/${y}`;
          }

          return {
            stt: item['STT'] || index + 1,
            maYeuCau: maLH,
            tieuDe: item['Nội dung liên hệ'],
            nguoiGui: item['Tên khách hàng'],
            ngayGui: dateStr,
            trangThai: item['Trạng thái liên hệ'],
            cauTraLoi: item['Câu trả lời']
          };
        });
        this.filteredRequests = [...this.requests];
        this.loading = false;
      },
      error: (error) => {
        console.error('Lỗi khi đọc contact.json', error);
        this.loading = false;
      }
    });
  }

  // Hàm mở Popup và nạp dữ liệu từ row tương ứng vào các field
  openDetailDialog(item: any) {
    this.isDialogOpen = true;
    
    // Cấu hình các mục hiển thị trong Popup dựa trên dữ liệu của 'item'
    this.dialogSections = [
      {
        title: 'I. Thông tin chung',
        fields: [
          // Row 1 (3 cột): Mã yêu cầu, Ngày gửi, Trạng thái
          { label: 'Mã yêu cầu', name: 'maYeuCau', type: 'text', value: item.maYeuCau, disabled: true },
          { label: 'Ngày gửi', name: 'ngayGui', type: 'text', value: item.ngayGui, disabled: true },
          { label: 'Trạng thái', name: 'trangThai', type: 'text', value: item.trangThai, disabled: true },
          // Row 2 (2 cột còn lại): Người gửi, Nhân viên tiếp nhận
          { label: 'Người gửi', name: 'nguoiGui', type: 'text', value: item.nguoiGui, disabled: true },
          { label: 'Nhân viên tiếp nhận', name: 'staff', type: 'text', value: 'Admin (Mặc định)', disabled: true }
        ]
      },
      {
        title: 'II. Nội dung chi tiết',
        fields: [
          { label: 'Nội dung yêu cầu', name: 'tieuDe', type: 'textarea', value: item.tieuDe, disabled: true }
        ]
      },
      {
        title: 'III. Phản hồi yêu cầu',
        fields: [
          // ĐÂY LÀ TRƯỜNG DUY NHẤT KHÔNG BỊ DISABLED (Cho phép nhập liệu)
          { label: 'Nội dung phản hồi', name: 'cauTraLoi', type: 'textarea', value: item.cauTraLoi, disabled: false }
        ]
      }
    ];
  }

  closeDialog() { this.isDialogOpen = false; }

  onSubmitDialog(data: any) {
    console.log('Dữ liệu phản hồi mới:', data);
    this.isDialogOpen = false;
  }

  toggleFilter() { this.isFilterOpen = !this.isFilterOpen; }

  getStatusClass(status: string): string {
    const s = status?.toLowerCase() || '';
    if (s.includes('mới tạo')) return 'badge--blue';
    if (s.includes('chưa xử lý')) return 'badge--orange';
    if (s.includes('đã xử lý')) return 'badge--green';
    return 'badge--inactive';
  }

  // Phân trang
  get paginatedRequests(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRequests.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.filteredRequests.length / this.itemsPerPage)); }

  get pages(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }

  changePage(page: number) { if (page >= 1 && page <= this.totalPages) this.currentPage = page; }

  changePageSize(event: Event) {
    this.itemsPerPage = Number((event.target as HTMLSelectElement).value);
    this.currentPage = 1;
  }
}