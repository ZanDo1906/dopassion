import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { iClass, ClassFilter } from '../interfaces/class';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class Class {
  private apiUrl = `${environment.apiUrl}/class`;

  constructor(private http: HttpClient) { }

  getClasses(filters?: ClassFilter): Observable<iClass[]> {
    let params = new HttpParams();

    if (filters?.courseCode) {
      params = params.set('courseCode', filters.courseCode);
    }

    if (filters?.branch) {
      params = params.set('branch', filters.branch);
    }

    if (filters?.startDate) {
      params = params.set('startDate', filters.startDate);
    }

    if (filters?.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    if (filters?.keyword) {
      params = params.set('keyword', filters.keyword);
    }

    return this.http.get<iClass[]>(this.apiUrl, { params });
  }

  getClassDetailByMaLop(maLop: string): Observable<iClass> {
    return this.http.get<iClass>(`${this.apiUrl}/detail/${encodeURIComponent(maLop)}`);
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