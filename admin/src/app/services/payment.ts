import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class Payment {

  constructor(private http: HttpClient) {}

  getPayment() {
    return this.http.get<any[]>(
      'assets/mock-data-json/payment.json'
    );
  }

}