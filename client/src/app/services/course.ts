import { iCourse } from '../interfaces/course';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class Course {
  private apiUrl = `${environment.apiUrl}/course`;
  constructor(private http: HttpClient) { }
  getCourses(): Observable<iCourse[]> {
    return this.http.get<iCourse[]>(this.apiUrl);
  }

  addCourse(data: iCourse): Observable<iCourse> {
    return this.http.post<iCourse>(this.apiUrl, data);
  }

  updateCourse(id: string, data: Partial<iCourse>): Observable<iCourse> {
    return this.http.put<iCourse>(`${this.apiUrl}/${id}`, data);
  }

  deleteCourse(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getCourse(): Observable<iCourse[]> {
    return this.getCourses();
  }
}

