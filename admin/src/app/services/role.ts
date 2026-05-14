import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { iRole } from '../interfaces/role';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  readonly resourceUrl = 'assets/mock-data-json/role.json';
  apiUrl = '';

  constructor(private http: HttpClient) { }

  getRole(): Observable<iRole[]> {
    return this.http.get<iRole[]>(this.resourceUrl);
  }

  addRole(newRole: any, endpoint: string = this.apiUrl): Observable<any> {
    if (!endpoint) {
      return of(newRole);
    }

    return this.http.post<any>(endpoint, newRole);
  }
}
