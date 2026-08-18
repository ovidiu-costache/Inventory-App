import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { LowStockNotification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:5051/api/notifications';
  
  // BehaviorSubject holding the current list of notifications
  private notificationsSubject = new BehaviorSubject<LowStockNotification[]>([]);
  
  // Public observable for components to subscribe to
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Fetch the latest unresolved notifications and update the BehaviorSubject
  fetchNotifications(): void {
    this.http.get<LowStockNotification[]>(this.apiUrl)
      .subscribe({
        next: (data) => this.notificationsSubject.next(data),
        error: (err) => console.error('Error fetching notifications:', err)
      });
  }

  // Mark a notification as resolved
  resolveNotification(id: number): void {
    this.http.patch(`${this.apiUrl}/${id}/resolve`, {}).subscribe({
      next: () => {
        // Refresh the list after successfully resolving
        this.fetchNotifications();
      },
      error: (err) => console.error('Error resolving notification:', err)
    });
  }
}
