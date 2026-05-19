import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { iClient } from '../interfaces/client';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class Client {
  private apiUrl = `${environment.apiUrl}/client`;

  constructor(private http: HttpClient) { }

  getClients(): Observable<iClient[]> {
    return this.http.get<iClient[]>(this.apiUrl);
  }

  addClient(data: iClient): Observable<iClient> {
    return this.http.post<iClient>(this.apiUrl, data);
  }

  updateClient(id: string, data: Partial<iClient>): Observable<iClient> {
    return this.http.put<iClient>(`${this.apiUrl}/${id}`, data);
  }

  deleteClient(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
