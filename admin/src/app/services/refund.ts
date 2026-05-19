import { iRefund } from './../interfaces/refund';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class RefundService {
  private apiUrl = `${environment.apiUrl}/refund`;

  constructor(private http: HttpClient) { }

  getRefunds(): Observable<iRefund[]> {
    return this.http.get<iRefund[]>(this.apiUrl);
  }

  addRefund(data: iRefund): Observable<iRefund> {
    return this.http.post<iRefund>(this.apiUrl, data);
  }

  updateRefund(id: string, data: Partial<iRefund>): Observable<iRefund> {
    return this.http.put<iRefund>(`${this.apiUrl}/${id}`, data);
  }

  deleteRefund(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getRefund(): Observable<iRefund[]> {
    return this.getRefunds();
  }
}
