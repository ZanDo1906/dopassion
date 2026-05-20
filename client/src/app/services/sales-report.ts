import { iRevenueReport } from '../interfaces/sales-report';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class RevenueReportService {
  private apiUrl = `${environment.apiUrl}/sales-report`;
  constructor(private http: HttpClient) { }
  getRevenueReports(): Observable<iRevenueReport[]> {
    return this.http.get<iRevenueReport[]>(this.apiUrl);
  }

  addRevenueReport(data: iRevenueReport): Observable<iRevenueReport> {
    return this.http.post<iRevenueReport>(this.apiUrl, data);
  }

  updateRevenueReport(id: string, data: Partial<iRevenueReport>): Observable<iRevenueReport> {
    return this.http.put<iRevenueReport>(`${this.apiUrl}/${id}`, data);
  }

  deleteRevenueReport(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getRevenueReport(): Observable<iRevenueReport[]> {
    return this.getRevenueReports();
  }
}
