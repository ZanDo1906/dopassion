import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { iCustomer } from '../interfaces/customer';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class Customer {
  private apiUrl = `${environment.apiUrl}/customer`;

  constructor(private http: HttpClient) { }

  getCustomers(): Observable<iCustomer[]> {
    return this.http.get<iCustomer[]>(this.apiUrl);
  }

  getCustomer(id: string): Observable<iCustomer> {
    return this.http.get<iCustomer>(`${this.apiUrl}/${id}`);
  }

  addCustomer(data: Partial<iCustomer>): Observable<iCustomer> {
    return this.http.post<iCustomer>(this.apiUrl, data);
  }

  updateCustomer(id: string, data: Partial<iCustomer>): Observable<iCustomer> {
    return this.http.put<iCustomer>(`${this.apiUrl}/${id}`, data);
  }

  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  register(data: {
    email: string;
    sdt: string;
    tenKhachHang: string;
    matKhau: string;
    gioiTinh?: string;
    ngaySinh?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, data);
  }

  login(loginValue: string, matKhau: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { loginValue, password: matKhau });
  }

  verifyAccount(loginValue: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-account`, { loginValue });
  }

  resetPassword(customerId: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, { customerId, newPassword });
  }

  uploadAvatar(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post<any>(`${this.apiUrl}/${id}/avatar`, formData);
  }
}
