import { iStaff } from './../interfaces/staff';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Staff {
  url: string = 'assets/mock-data-json/staff.json';
  constructor(private http: HttpClient) { }
  getStaff(): Observable<iStaff[]> {
    return this.http.get<iStaff[]>(this.url);
  }
}
