import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { iClass } from '../interfaces/class';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class Class {
  private apiUrl = `${environment.apiUrl}/class`;

  constructor(private http: HttpClient) { }

  getClasses(): Observable<iClass[]> {
    return this.http.get<iClass[]>(this.apiUrl);
  }

  /**
   * Lấy classes với filter (server-side)
   */
  getClassesByFilter(filters: any): Observable<iClass[]> {
    let params = new HttpParams();
    if (filters.maKhoa) params = params.set('maKhoa', filters.maKhoa);
    if (filters.ngayBatDau) params = params.set('ngayBatDau', filters.ngayBatDau);
    if (filters.chiNhanh) params = params.set('chiNhanh', filters.chiNhanh);
    
    return this.http.get<iClass[]>(this.apiUrl, { params });
  }

  addClass(data: iClass): Observable<iClass> {
    return this.http.post<iClass>(this.apiUrl, data);
  }

  updateClass(id: string, data: Partial<iClass>): Observable<iClass> {
    return this.http.put<iClass>(`${this.apiUrl}/${id}`, data);
  }

  deleteClass(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}