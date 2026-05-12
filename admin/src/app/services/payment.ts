import { iPayment } from './../interfaces/payment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Payment {
  url: string = 'assets/mock-data-json/payment.json';
  constructor(private http: HttpClient) { }
  getPayment(): Observable<iPayment[]> {
    return this.http.get<iPayment[]>(this.url);
  }
}
