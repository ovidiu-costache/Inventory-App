import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { StockMovementService, CreateStockMovementDto } from '../../services/stock-movement.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { ProductsService } from '../../services/products.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

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

  // Adjustment direction toggle (add or subtract)
  adjustmentDirection: 'add' | 'subtract' = 'add';

  // Product lookup fields
  productLookupInfo = '';
  productLookupError = '';
  private productIdSubject = new Subject<number>();

  errorMessage = '';

  constructor(
    private movementService: StockMovementService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private productsService: ProductsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Dynamically set the createdByUserId from the auth service
    const user = this.authService.currentUserValue;
    if (user) {
      this.model.createdByUserId = user.id;
    }

    // Reactive product lookup with debounce
    this.productIdSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(id => {
      if (!id) {
        this.productLookupInfo = '';
        this.productLookupError = '';
        this.cdr.detectChanges();
        return;
      }
      this.productsService.getProduct(id).subscribe({
        next: (product) => {
          this.productLookupInfo = `${product.code} — ${product.name} (stock: ${product.currentStock})`;
          this.productLookupError = '';
          this.cdr.detectChanges();
        },
        error: () => {
          this.productLookupInfo = '';
          this.productLookupError = `No product found with ID ${id}`;
          this.cdr.detectChanges();
        }
      });
    });
  }

  onProductIdChange(): void {
    this.productIdSubject.next(this.model.productId);
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

    // Build the DTO to send (for ADJUSTMENT, apply the direction sign)
    const dto: CreateStockMovementDto = { ...this.model };
    if (dto.movementTypeId === 3) {
      // Apply direction
      dto.quantity = this.adjustmentDirection === 'add' ? Math.abs(dto.quantity) : -Math.abs(dto.quantity);
    }

    this.movementService.createMovement(dto).subscribe({
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