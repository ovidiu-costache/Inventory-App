import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Product } from '../../models/product.model';
import { StockMovementService, CreateStockMovementDto } from '../../services/stock-movement.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { ProductsService } from '../../services/products.service';
import { AiReviewService } from '../../services/ai-review.service';


@Component({
  selector: 'app-movement-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './movement-form.html'
})
export class MovementFormComponent implements OnInit {
  model: CreateStockMovementDto = {
    productId: 0,
    movementTypeId: 1,
    quantity: 1,
    reason: '',
    referenceCode: '',
    createdByUserId: 1
  };

  adjustmentDirection: 'add' | 'subtract' = 'add';

  products: Product[] = [];
  errorMessage = '';

  isSuspectReview = false;
  suspectExplanation = '';
  isSubmitting = false;

  constructor(
    private movementService: StockMovementService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private productsService: ProductsService,
    private aiReviewService: AiReviewService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    const user = this.authService.currentUserValue;
    if (user) {
      this.model.createdByUserId = user.id;
    }
  }

  ngOnInit(): void {
    this.productsService.getProducts(1, 1000, true).subscribe({
      next: (res) => {
        this.products = res.items;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load products', err);
        this.errorMessage = 'Could not load products for the dropdown. Please refresh.';
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(forceSubmit: boolean = false): void {
    if (this.isSubmitting) {
      return;
    }

    this.errorMessage = '';
    this.isSuspectReview = false;

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

    const dto: CreateStockMovementDto = { ...this.model };
    if (dto.movementTypeId === 3) {
      if (this.adjustmentDirection === 'add') {
        dto.quantity = Math.abs(dto.quantity);
      } else {
        dto.quantity = -Math.abs(dto.quantity);
      }

      const selectedProduct = this.products.find(p => p.id === dto.productId);
      if (selectedProduct && dto.quantity < 0 && selectedProduct.currentStock + dto.quantity < 0) {
        this.errorMessage = 'Adjustment would result in negative stock.';
        this.cdr.detectChanges();
        return;
      }

      if (!forceSubmit) {
        this.isSubmitting = true;
        this.aiReviewService.reviewAdjustment({
          productId: dto.productId,
          quantity: dto.quantity,
          reason: dto.reason || ''
        }).subscribe({
          next: (res) => {
            if (res.verdict === 'SUSPECT') {
              this.isSuspectReview = true;
              this.suspectExplanation = res.explanation;
              this.isSubmitting = false;
              this.cdr.detectChanges();
            } else {
              this.executeSave(dto);
            }
          },
          error: (err) => {
            console.warn('AI Review failed, proceeding normally as fail-safe.', err);
            this.executeSave(dto);
          }
        });
        return;
      }
    }

    this.executeSave(dto);
  }

  private executeSave(dto: CreateStockMovementDto): void {
    this.isSubmitting = true;
    this.movementService.createMovement(dto).subscribe({
      next: () => {
        // Update notification badge
        this.notificationService.fetchNotifications();
        this.router.navigateByUrl('/movements');
      },
      error: (err) => {
        if (err.error && err.error.detail) {
          this.errorMessage = err.error.detail;
        } else if (err.status === 0) {
          this.errorMessage = 'Cannot connect to server. Check if backend is running.';
        } else {
          this.errorMessage = 'An error occurred. Status: ' + err.status;
        }
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}