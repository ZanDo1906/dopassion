import { iRegistration } from '../interfaces/registration';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  private apiUrl = `${environment.apiUrl}/registration`;

  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách đăng ký từ JSON file
   * @returns Observable chứa mảng dữ liệu đăng ký
   */
  getRegistrations(): Observable<iRegistration[]> {
    return this.http.get<iRegistration[]>(this.apiUrl);
  }

  addRegistration(data: iRegistration): Observable<iRegistration> {
    return this.http.post<iRegistration>(this.apiUrl, data);
  }

  updateRegistration(id: string, data: Partial<iRegistration>): Observable<iRegistration> {
    return this.http.put<iRegistration>(`${this.apiUrl}/${id}`, data);
  }

  deleteRegistration(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
