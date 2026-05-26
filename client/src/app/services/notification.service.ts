import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface NotificationState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<NotificationState>();
  notificationState$ = this.notificationSubject.asObservable();

  show(title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    this.notificationSubject.next({
      isOpen: true,
      title,
      message,
      type
    });
  }

  close(): void {
    this.notificationSubject.next({
      isOpen: false,
      title: '',
      message: '',
      type: 'info'
    });
  }
}
