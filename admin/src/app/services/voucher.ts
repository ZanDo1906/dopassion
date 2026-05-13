import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { iVoucher } from '../interfaces/voucher';

@Injectable({
  providedIn: 'root'
})

export class VoucherService {

  constructor(
    private http: HttpClient
  ) {}

  getVoucher() {

    return this.http.get<iVoucher[]>(

      'assets/mock-data-json/voucher.json'

    );

  }

}