import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationState } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-popup.html',
  styleUrls: ['./notification-popup.css']
})
export class NotificationPopupComponent implements OnInit, OnDestroy {
  state: NotificationState = {
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  };

  private subscription!: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notificationState$.subscribe(state => {
      this.state = state;
      if (state.isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    document.body.style.overflow = '';
  }

  close(): void {
    this.notificationService.close();
  }

  getIconClass(): string {
    switch (this.state.type) {
      case 'success': return 'bi-check-circle-fill text-success';
      case 'error': return 'bi-exclamation-circle-fill text-danger';
      case 'warning': return 'bi-exclamation-triangle-fill text-warning';
      case 'info':
      default: return 'bi-info-circle-fill text-primary';
    }
  }

  getIconColor(): string {
    switch (this.state.type) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'info':
      default: return '#4C70AD';
    }
  }
}
