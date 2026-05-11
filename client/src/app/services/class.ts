import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { iClass } from '../interfaces/class';

@Injectable({
  providedIn: 'root',
})
export class Class {
  url: string = 'assets/mock-data-json/class.json';
  constructor(private http: HttpClient) { }
  getClass(): Observable<iClass[]> {
    return this.http.get<iClass[]>(this.url);
  }
}
