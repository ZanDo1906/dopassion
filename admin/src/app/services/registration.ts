import { iRegistration } from './../interfaces/registration';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  private url: string = 'assets/mock-data-json/registration.json';

  constructor(private http: HttpClient) {}

  /**
   * Lấy danh sách đăng ký từ JSON file
   * @returns Observable chứa mảng dữ liệu đăng ký
   */
  getRegistrations(): Observable<iRegistration[]> {
    return this.http.get<iRegistration[]>(this.url);
  }
}
