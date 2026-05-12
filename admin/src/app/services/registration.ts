import { iRegistration } from './../interfaces/registration';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Registration {
  url: string = 'assets/mock-data-json/registration.json';
  constructor(private http: HttpClient) { }
  getRegistration(): Observable<iRegistration[]> {
    return this.http.get<iRegistration[]>(this.url);
  }
}
