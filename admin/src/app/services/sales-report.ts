import { iRevenueReport } from './../interfaces/sales-report';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RevenueReportService {
  url: string = 'assets/mock-data-json/sales-report.json';
  constructor(private http: HttpClient) { }
  getRevenueReport(): Observable<iRevenueReport[]> {
    return this.http.get<iRevenueReport[]>(this.url);
  }
}
