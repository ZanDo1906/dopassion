import { iStudentReport } from '../interfaces/student-report';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class StudentReportService {
  private apiUrl = `${environment.apiUrl}/student-report`;
  constructor(private http: HttpClient) { }
  getStudentReports(): Observable<iStudentReport[]> {
    return this.http.get<iStudentReport[]>(this.apiUrl);
  }

  addStudentReport(data: iStudentReport): Observable<iStudentReport> {
    return this.http.post<iStudentReport>(this.apiUrl, data);
  }

  updateStudentReport(id: string, data: Partial<iStudentReport>): Observable<iStudentReport> {
    return this.http.put<iStudentReport>(`${this.apiUrl}/${id}`, data);
  }

  deleteStudentReport(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getStudentReport(): Observable<iStudentReport[]> {
    return this.getStudentReports();
  }
}
