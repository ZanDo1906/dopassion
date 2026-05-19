import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { iClass } from '../interfaces/class';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class Class {
  private apiUrl = `${environment.apiUrl}/class`;

  constructor(private http: HttpClient) { }

  getClasses(): Observable<iClass[]> {
    return this.http.get<iClass[]>(this.apiUrl);
  }

  addClass(data: iClass): Observable<iClass> {
    return this.http.post<iClass>(this.apiUrl, data);
  }

  updateClass(id: string, data: Partial<iClass>): Observable<iClass> {
    return this.http.put<iClass>(`${this.apiUrl}/${id}`, data);
  }

  deleteClass(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}