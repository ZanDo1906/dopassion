import { iRefund } from './../interfaces/refund';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Refund {
  url: string = 'assets/mock-data-json/refund.json';
  constructor(private http: HttpClient) { }
  getRefund(): Observable<iRefund[]> {
    return this.http.get<iRefund[]>(this.url);
  }
}
