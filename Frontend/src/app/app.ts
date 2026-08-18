import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = 'Frontend';
  
  unreadCount = 0;
  private subscription: Subscription = new Subscription();

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to notification updates for the badge
    this.subscription = this.notificationService.notifications$.subscribe(notifications => {
      this.unreadCount = notifications.length;
      this.cdr.detectChanges();
    });

    // Initial fetch
    this.notificationService.fetchNotifications();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
