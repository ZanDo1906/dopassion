import { iDebtReport } from './../interfaces/AR-report';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class DebtReportService {
  private apiUrl = `${environment.apiUrl}/AR-report`;
  constructor(private http: HttpClient) { }
  getDebtReports(): Observable<iDebtReport[]> {
    return this.http.get<iDebtReport[]>(this.apiUrl);
  }

  addDebtReport(data: iDebtReport): Observable<iDebtReport> {
    return this.http.post<iDebtReport>(this.apiUrl, data);
  }

  updateDebtReport(id: string, data: Partial<iDebtReport>): Observable<iDebtReport> {
    return this.http.put<iDebtReport>(`${this.apiUrl}/${id}`, data);
  }

  deleteDebtReport(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getDebtReport(): Observable<iDebtReport[]> {
    return this.getDebtReports();
  }
}
