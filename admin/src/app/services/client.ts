import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { iClient } from '../interfaces/client';

@Injectable({
  providedIn: 'root',
})
export class Client {
  url: string = 'assets/mock-data-json/client.json';
  constructor(private http: HttpClient) { }
  getClient(): Observable<iClient[]> {
    return this.http.get<iClient[]>(this.url);
  }
}
