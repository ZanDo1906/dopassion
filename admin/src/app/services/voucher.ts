import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class VoucherService {

  constructor(private http: HttpClient) {}

  getVoucher(): Observable<any[]> {

    return this.http.get<any[]>(
      'assets/mock-data-json/voucher.json'
    );

  }

  addItem(data: any): Observable<any> {

    console.log(
      'Sending data to server:',
      data
    );

    return of({
      success: true,
      timestamp: new Date()
    });

  }

}