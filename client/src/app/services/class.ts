import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { iClass, ClassFilter } from '../interfaces/class';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class Class {
  private apiUrl = `${environment.apiUrl}/class`;

  constructor(private http: HttpClient) { }

  getClasses(filters?: ClassFilter): Observable<iClass[]> {
    return this.http.get<iClass[]>(this.apiUrl).pipe(
      map((items) => {
        if (!filters) {
          return items;
        }

        return items.filter((item) => {
          const matchCourse = filters.courseCode
            ? item.maKhoa === filters.courseCode
            : true;
          const matchBranch = filters.branch
            ? item.chiNhanh === filters.branch
            : true;

          const itemDate = item.ngayBatDau ? new Date(item.ngayBatDau) : null;
          const startDate = filters.startDate ? new Date(filters.startDate) : null;
          const endDate = filters.endDate ? new Date(filters.endDate) : null;

          const matchStartDate = startDate && itemDate
            ? itemDate >= startDate
            : true;
          const matchEndDate = endDate && itemDate
            ? itemDate <= endDate
            : true;

          const keyword = filters.keyword ? filters.keyword.toLowerCase() : '';
          const matchKeyword = keyword
            ? (item.tenLop || '').toLowerCase().includes(keyword)
            || (item.maLop || '').toLowerCase().includes(keyword)
            : true;

          return matchCourse && matchBranch && matchStartDate && matchEndDate && matchKeyword;
        });
      })
    );
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