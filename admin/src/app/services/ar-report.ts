import { iARReport } from './../interfaces/AR-report';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ArReport {
  url: string = 'assets/mock-data-json/ar-report.json';
  constructor(private http: HttpClient) { }
  getArReport(): Observable<iARReport[]> {
    return this.http.get<iARReport[]>(this.url);
  }
}
