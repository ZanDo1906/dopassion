import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { iRole } from '../interfaces/role';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/role`;

  constructor(private http: HttpClient) { }

  getRoles(): Observable<iRole[]> {
    return this.http.get<iRole[]>(this.apiUrl);
  }

  addRole(newRole: iRole, endpoint: string = this.apiUrl): Observable<iRole> {
    if (!endpoint) {
      return of(newRole as iRole);
    }

    return this.http.post<iRole>(endpoint, newRole);
  }

  updateRole(id: string, data: Partial<iRole>): Observable<iRole> {
    return this.http.put<iRole>(`${this.apiUrl}/${id}`, data);
  }

  deleteRole(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getRole(): Observable<iRole[]> {
    return this.getRoles();
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

    if (this.apiUrl) {
      return this.http.put<any>(`${this.apiUrl}/${roleId}`, payload);
    }

    // Mock response cho development
    return of({
      success: true,
      message: `Cập nhật trạng thái thành: ${newStatus}`,
      role: { trangThai: newStatus } as any
    });
  }
}
