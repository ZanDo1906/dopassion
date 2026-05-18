import { iStudentReport } from '../interfaces/student-report';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StudentReportService {
  url: string = 'assets/mock-data-json/student-report.json';
  constructor(private http: HttpClient) { }
  getStudentReport(): Observable<iStudentReport[]> {
    return this.http.get<iStudentReport[]>(this.url);
  }
}
