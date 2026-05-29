import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { iCustomer } from '../interfaces/customer';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class Customer {
  private apiUrl = `${environment.apiUrl}/customer`;
  private customersChanged = new Subject<iCustomer | null>();
  public customersChanged$ = this.customersChanged.asObservable();

  constructor(private http: HttpClient) { }

  getCustomers(): Observable<iCustomer[]> {
    return this.http.get<iCustomer[]>(this.apiUrl).pipe(
      tap((data) => {
        console.log('=== CUSTOMER SERVICE: getCustomers() ===');
        console.log('Full response:', data);
        if (data && data.length > 0) {
          console.log('First customer:', data[0]);
          console.log('First customer ngaySinh:', data[0].ngaySinh, 'Type:', typeof data[0].ngaySinh);
        }
      })
    );
  }

  addCustomer(data: iCustomer): Observable<iCustomer> {
    return this.http.post<iCustomer>(this.apiUrl, data).pipe(
      tap((created) => {
        try {
          this.customersChanged.next(created);
        } catch (e) {
          console.warn('customersChanged notify failed', e);
        }
      })
    );
  }

  updateCustomer(id: string, data: Partial<iCustomer>): Observable<iCustomer> {
    return this.http.put<iCustomer>(`${this.apiUrl}/${id}`, data);
  }

  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
