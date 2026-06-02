import { iStaff } from './../interfaces/staff';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class Staff {
  private apiUrl = `${environment.apiUrl}/staff`;
  constructor(private http: HttpClient) { }
  getStaffs(): Observable<iStaff[]> {
    return this.http.get<iStaff[]>(this.apiUrl);
  }

  addStaff(data: iStaff): Observable<iStaff> {
    return this.http.post<iStaff>(this.apiUrl, data);
  }

  updateStaff(id: string, data: Partial<iStaff>): Observable<iStaff> {
    return this.http.put<iStaff>(`${this.apiUrl}/${id}`, data);
  }

  deleteStaff(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getStaff(): Observable<iStaff[]> {
    return this.getStaffs();
  }

  uploadCccd(staffName: string, frontFile: File, backFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('staffName', staffName);
    formData.append('front', frontFile);
    formData.append('back', backFile);
    return this.http.post<any>(`${this.apiUrl}/upload-cccd`, formData);
  }
}
