import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { StockMovementService, CreateStockMovementDto } from '../stock-movement';

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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  onSubmit(): void {
    this.errorMessage = '';

    // Basic validation before sending to backend
    if (!this.model.productId || this.model.productId <= 0) {
      this.errorMessage = 'ID-ul produsului trebuie sa fie un numar pozitiv.';
      this.cdr.detectChanges();
      return;
    }
    if (!this.model.quantity || this.model.quantity <= 0) {
      this.errorMessage = 'Cantitatea trebuie sa fie un numar strict pozitiv.';
      this.cdr.detectChanges();
      return;
    }

    this.movementService.createMovement(this.model).subscribe({
      next: () => {
        this.router.navigateByUrl('/movements');
      },
      error: (err) => {
        // Backend returns ProblemDetails with 'detail' field
        if (err.error && err.error.detail) {
          this.errorMessage = this.translateError(err.error.detail);
        } else if (err.status === 0) {
          this.errorMessage = 'Nu se poate conecta la server. Verifica ca backend-ul ruleaza.';
        } else {
          this.errorMessage = 'A aparut o eroare. Status: ' + err.status;
        }
        this.cdr.detectChanges();
      }
    });
  }

  private translateError(errorMsg: string): string {
    const msg = errorMsg.toLowerCase();

    if (msg.includes('product not found')) {
      return 'Produsul cu ID-ul introdus nu a fost gasit.';
    }
    if (msg.includes('cannot add stock movements to an inactive product')) {
      return 'Nu poti adauga miscari de stoc pentru un produs inactiv.';
    }
    if (msg.includes('insufficient stock available')) {
      return 'Stoc insuficient pentru a efectua aceasta iesire.';
    }
    if (msg.includes('quantity must be strictly positive')) {
      return 'Cantitatea trebuie sa fie strict pozitiva.';
    }
    if (msg.includes('invalid movement type')) {
      return 'Tipul de miscare selectat este invalid.';
    }
    if (msg.includes('user id does not exist')) {
      return 'Utilizatorul nu exista in sistem.';
    }
    if (msg.includes('product is currently being modified')) {
      return 'Produsul este modificat in acest moment de alt utilizator. Te rog incearca din nou in cateva secunde.';
    }

    // Default fallback (returns original if no translation matches)
    return errorMsg;
  }
}