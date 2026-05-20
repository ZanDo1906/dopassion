import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { iVoucher } from '../interfaces/voucher';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})

export class VoucherService {
  private apiUrl = `${environment.apiUrl}/voucher`;

  constructor(private http: HttpClient) { }

  getVouchers(): Observable<iVoucher[]> {
    return this.http.get<iVoucher[]>(this.apiUrl);
  }

  addVoucher(data: iVoucher): Observable<iVoucher> {
    return this.http.post<iVoucher>(this.apiUrl, data);
  }

  updateVoucher(id: string, data: Partial<iVoucher>): Observable<iVoucher> {
    return this.http.put<iVoucher>(`${this.apiUrl}/${id}`, data);
  }

  deleteVoucher(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getVoucher(): Observable<iVoucher[]> {
    return this.getVouchers();
  }

  addItem(data: iVoucher): Observable<iVoucher> {
    return this.addVoucher(data);
  }

}