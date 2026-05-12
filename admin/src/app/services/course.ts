import { iCourse } from './../interfaces/course';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Course {
  url: string = 'assets/mock-data-json/course.json';
  constructor(private http: HttpClient) { }
  getCourse(): Observable<iCourse[]> {
    return this.http.get<iCourse[]>(this.url);
  }
}

