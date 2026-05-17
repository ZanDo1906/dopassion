import { iSalesReport } from './../interfaces/sales-report';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SalesReport {
  url: string = 'assets/mock-data-json/sales-report.json';
  constructor(private http: HttpClient) { }
  getSalesReport(): Observable<iSalesReport[]> {
    return this.http.get<iSalesReport[]>(this.url);
  }
}
