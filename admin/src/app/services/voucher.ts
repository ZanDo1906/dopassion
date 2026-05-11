import { iVoucher } from './../interfaces/voucher';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Voucher {
  url: string = 'assets/mock-data-json/voucher.json';
  constructor(private http: HttpClient) { }
  getVoucher(): Observable<iVoucher[]> {
    return this.http.get<iVoucher[]>(this.url);
  }
}
