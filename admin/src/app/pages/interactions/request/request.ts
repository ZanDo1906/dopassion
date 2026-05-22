import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ContactService } from '../../../services/contact'; 
import { FormDialogComponent } from '../../../components/form-dialog/form-dialog'; 
import { PaginationComponent } from '../../../components/pagination/pagination'; 
import { iContact } from '../../../interfaces/contact';

@Component({
  selector: 'app-request',
  standalone: true,
  imports: [CommonModule, FormsModule, FormDialogComponent, PaginationComponent], 
  templateUrl: './request.html',
  styleUrl: './request.css'
})
export class Request implements OnInit {
  
  requestList: iContact[] = [];
  filteredRequestList: iContact[] = []; 
  paginatedRequestList: iContact[] = []; 
  
  selectedRequest: iContact | null = null;
  isModalOpen: boolean = false;
  isFilterOpen: boolean = true; 

  currentPage: number = 1;
  itemsPerPage: number = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  searchPhone: string = '';
  searchEmail: string = '';
  searchStatus: string = '';

  constructor(private contactService: ContactService) { }

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.contactService.getContacts().subscribe({
      next: (data: iContact[]) => {
        this.requestList = data;
        this.filterRequests(); 
      },
      error: (err: any) => {
        console.error('Lỗi khi tải danh sách yêu cầu tư vấn:', err);
      }
    });
  }

  toggleFilter(): void {
    this.isFilterOpen = !this.isFilterOpen;
  }

  filterRequests(): void {
    this.filteredRequestList = this.requestList.filter(item => {
      const matchPhone = !this.searchPhone || (item.soDienThoai || '').toLowerCase().includes(this.searchPhone.trim().toLowerCase());
      const matchEmail = !this.searchEmail || (item.gmail || '').toLowerCase().includes(this.searchEmail.trim().toLowerCase());
      
      let matchStatus = true;
      if (this.searchStatus) {
        const currentStatus = item.trangThaiLienHe === 'Đã xử lý' ? 'Đã xử lý' : 'Chưa xử lý';
        matchStatus = currentStatus === this.searchStatus;
      }
      
      return matchPhone && matchEmail && matchStatus;
    });

    this.currentPage = 1;
    this.updatePaginatedRequests();
  }

  updatePaginatedRequests(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedRequestList = this.filteredRequestList.slice(startIndex, endIndex);
  }

  onPaginationPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedRequests();
  }

  onPaginationPageSizeChange(size: number): void {
    this.itemsPerPage = size;
    this.currentPage = 1; 
    this.updatePaginatedRequests();
  }

  resetFilters(): void {
    this.searchPhone = '';
    this.searchEmail = '';
    this.searchStatus = '';
    this.filterRequests();
  }

  markAsProcessed(): void {
    if (this.selectedRequest && this.selectedRequest._id) {
      this.contactService.updateContact(this.selectedRequest._id, { trangThaiLienHe: 'Đã xử lý' }).subscribe({
        next: () => {
          if (this.selectedRequest) {
            this.selectedRequest.trangThaiLienHe = 'Đã xử lý';
          }
          this.loadRequests();
          setTimeout(() => {
            this.closeModal();
          }, 400);
        },
        error: (err: any) => {
          console.error('Lỗi khi cập nhật trạng thái yêu cầu:', err);
        }
      });
    }
  }

  openViewModal(request: iContact): void {
    this.selectedRequest = { ...request };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedRequest = null;
  }
}