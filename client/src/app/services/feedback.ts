import { iFeedback } from './../interfaces/feedback';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Feedback {
  url: string = 'assets/mock-data-json/feedback.json';
  constructor(private http: HttpClient) { }
  getFeedback(): Observable<iFeedback[]> {
    return this.http.get<iFeedback[]>(this.url);
  }
}
