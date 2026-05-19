import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { iPayment } from '../interfaces/payment';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})

export class Payment {
  private apiUrl = `${environment.apiUrl}/payment`;

  constructor(private http: HttpClient) { }

  getPayments(): Observable<iPayment[]> {
    return this.http.get<iPayment[]>(this.apiUrl);
  }

  addPayment(data: iPayment): Observable<iPayment> {
    return this.http.post<iPayment>(this.apiUrl, data);
  }

  updatePayment(id: string, data: Partial<iPayment>): Observable<iPayment> {
    return this.http.put<iPayment>(`${this.apiUrl}/${id}`, data);
  }

  deletePayment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getPayment(): Observable<iPayment[]> {
    return this.getPayments();
  }

}