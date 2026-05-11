import { iRole } from './../interfaces/role';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Role {
  url: string = 'assets/mock-data-json/role.json';
  constructor(private http: HttpClient) { }
  getRole(): Observable<iRole[]> {
    return this.http.get<iRole[]>(this.url);
  }
}
