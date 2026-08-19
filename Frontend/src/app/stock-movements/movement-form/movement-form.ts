import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { StockMovementService, CreateStockMovementDto } from '../../services/stock-movement.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-movement-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './movement-form.html'
})
export class MovementFormComponent {
  model: CreateStockMovementDto = {
    productId: 0,
    movementTypeId: 1,
    quantity: 1,
    reason: '',
    referenceCode: '',
    createdByUserId: 1 // hardcoded — no auth system yet
  };

  errorMessage = '';

  constructor(
    private movementService: StockMovementService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Dynamically set the createdByUserId from the auth service
    const user = this.authService.currentUserValue;
    if (user) {
      this.model.createdByUserId = user.id;
    }
  }

  onSubmit(): void {
    this.errorMessage = '';

    // Basic validation before sending to backend
    if (!this.model.productId || this.model.productId <= 0) {
      this.errorMessage = 'Product ID must be a positive number.';
      this.cdr.detectChanges();
      return;
    }
    if (!this.model.quantity || this.model.quantity <= 0) {
      this.errorMessage = 'Quantity must be strictly positive.';
      this.cdr.detectChanges();
      return;
    }

    this.movementService.createMovement(this.model).subscribe({
      next: () => {
        // Fetch notifications to update the badge immediately
        this.notificationService.fetchNotifications();
        this.router.navigateByUrl('/movements');
      },
      error: (err) => {
        // Backend returns ProblemDetails with 'detail' field in English
        if (err.error && err.error.detail) {
          this.errorMessage = err.error.detail;
        } else if (err.status === 0) {
          this.errorMessage = 'Cannot connect to server. Check if backend is running.';
        } else {
          this.errorMessage = 'An error occurred. Status: ' + err.status;
        }
        this.cdr.detectChanges();
      }
    });
  }
}