import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { LowStockNotification } from '../../models/notification.model';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-list.html'
})
export class NotificationListComponent implements OnInit, OnDestroy {
  notifications: LowStockNotification[] = [];
  private subscription: Subscription = new Subscription();

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Explicitly subscribe to the BehaviorSubject
    this.subscription = this.notificationService.notifications$.subscribe(data => {
      this.notifications = data;
      this.cdr.detectChanges(); // Ensure UI updates when data arrives
    });

    // Fetch latest on component load
    this.notificationService.fetchNotifications();
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  resolveNotification(id: number): void {
    this.notificationService.resolveNotification(id);
  }

  trackById(index: number, notification: LowStockNotification): number {
    return notification.id;
  }
}
