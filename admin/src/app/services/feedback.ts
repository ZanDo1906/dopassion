import { iFeedback } from './../interfaces/feedback';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class Feedback {
  private apiUrl = `${environment.apiUrl}/feedback`;
  constructor(private http: HttpClient) { }
  getFeedbacks(): Observable<iFeedback[]> {
    return this.http.get<iFeedback[]>(this.apiUrl);
  }

  addFeedback(data: iFeedback): Observable<iFeedback> {
    return this.http.post<iFeedback>(this.apiUrl, data);
  }

  updateFeedback(id: string, data: Partial<iFeedback>): Observable<iFeedback> {
    return this.http.put<iFeedback>(`${this.apiUrl}/${id}`, data);
  }

  deleteFeedback(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getFeedback(): Observable<iFeedback[]> {
    return this.getFeedbacks();
  }
}
