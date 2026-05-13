import { iRefund } from './../interfaces/refund';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RefundService {

  constructor(private http: HttpClient) {}

  getRefund() {
    return this.http.get<iRefund[]>(
      'assets/mock-data-json/refund.json'
    );
  }

}
