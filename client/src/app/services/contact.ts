import { iContact } from './../interfaces/contact';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Contact {
  url: string = 'assets/mock-data-json/contact.json';
  constructor(private http: HttpClient) { }
  getContact(): Observable<iContact[]> {
    return this.http.get<iContact[]>(this.url);
  }
}
