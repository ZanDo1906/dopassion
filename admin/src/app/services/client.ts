import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { iClient } from '../interfaces/client';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class Client {
  private apiUrl = `${environment.apiUrl}/customer`;
  private clientsChanged = new Subject<iClient | null>();
  public clientsChanged$ = this.clientsChanged.asObservable();

  constructor(private http: HttpClient) { }

  getClients(): Observable<iClient[]> {
    return this.http.get<iClient[]>(this.apiUrl).pipe(
      tap((data) => {
        console.log('=== CLIENT SERVICE: getClients() ===');
        console.log('Full response:', data);
        if (data && data.length > 0) {
          console.log('First client:', data[0]);
          console.log('First client ngaySinh:', data[0].ngaySinh, 'Type:', typeof data[0].ngaySinh);
          console.log('First client trangThai:', data[0].trangThai);
        }
      })
    );
  }

  addClient(data: iClient): Observable<iClient> {
    return this.http.post<iClient>(this.apiUrl, data).pipe(
      tap((created) => {
        // Notify subscribers that clients changed (new client created)
        try {
          this.clientsChanged.next(created);
        } catch (e) {
          console.warn('clientsChanged notify failed', e);
        }
      })
    );
  }

  updateClient(id: string, data: Partial<iClient>): Observable<iClient> {
    return this.http.put<iClient>(`${this.apiUrl}/${id}`, data);
  }

  deleteClient(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
