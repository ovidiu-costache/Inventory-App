import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService } from './services/notification.service';
import { AuthService } from './services/auth.service';
import { User } from './models/user.model';

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
  currentUser: User | null = null;
  private notificationSub: Subscription = new Subscription();
  private authSub: Subscription = new Subscription();

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to auth state
    this.authSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      
      // Only fetch notifications if user is logged in
      if (this.currentUser) {
        this.notificationService.fetchNotifications();
      }
      this.cdr.detectChanges();
    });

    // Subscribe to notification updates for the badge
    this.notificationSub = this.notificationService.notifications$.subscribe(notifications => {
      this.unreadCount = notifications.length;
      this.cdr.detectChanges();
    });
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    if (this.notificationSub) {
      this.notificationSub.unsubscribe();
    }
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }
}
