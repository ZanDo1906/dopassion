import { iContact } from '../interfaces/contact';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class Contact {
  private apiUrl = `${environment.apiUrl}/contact`;
  constructor(private http: HttpClient) { }
  getContacts(): Observable<iContact[]> {
    return this.http.get<iContact[]>(this.apiUrl);
  }

  addContact(data: iContact): Observable<iContact> {
    return this.http.post<iContact>(this.apiUrl, data);
  }

  updateContact(id: string, data: Partial<iContact>): Observable<iContact> {
    return this.http.put<iContact>(`${this.apiUrl}/${id}`, data);
  }

  deleteContact(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getContact(): Observable<iContact[]> {
    return this.getContacts();
  }
}
