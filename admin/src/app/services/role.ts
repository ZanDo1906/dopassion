import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { iRole } from '../interfaces/role';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  readonly resourceUrl = 'assets/mock-data-json/role.json';
  apiUrl = '';

  constructor(private http: HttpClient) { }

  getRole(): Observable<iRole[]> {
    return this.http.get<iRole[]>(this.resourceUrl);
  }

  addRole(newRole: any, endpoint: string = this.apiUrl): Observable<any> {
    if (!endpoint) {
      return of(newRole);
    }

    return this.http.post<any>(endpoint, newRole);
  }

  /**
   * Toggle lock status của một Role
   * Endpoint: sẽ chuyển sang API khi kết nối database
   * @param roleId Mã vai trò
   * @param currentStatus Trạng thái hiện tại
   * @param endpoint API endpoint (tùy chọn, để trống sẽ mock)
   * @returns Observable với role đã cập nhật
   */
  toggleLockStatus(
    roleId: string,
    currentStatus: string,
    endpoint: string = ''
  ): Observable<{ success: boolean; role?: iRole; message: string }> {
    // Xác định trạng thái mới dựa trên trạng thái hiện tại
    const newStatus = currentStatus === 'Đang hoạt động' ? 'Đã khóa' : 'Đang hoạt động';

    const payload = {
      roleId,
      newStatus,
      previousStatus: currentStatus,
      changedAt: new Date().toISOString()
    };

    // Nếu có endpoint, gọi API thực
    if (endpoint) {
      return this.http.put<any>(endpoint, payload);
    }

    // Mock response cho development
    return of({
      success: true,
      message: `Cập nhật trạng thái thành: ${newStatus}`,
      role: { 'TRẠNG THÁI': newStatus } as any
    });
  }
}
