import { iDebtReport } from './../interfaces/AR-report';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DebtReportService {
  url: string = 'assets/mock-data-json/AR-report.json';
  constructor(private http: HttpClient) { }
  getDebtReport(): Observable<iDebtReport[]> {
    return this.http.get<iDebtReport[]>(this.url);
  }
}
