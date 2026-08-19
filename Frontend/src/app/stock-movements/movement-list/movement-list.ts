import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StockMovementService } from '../stock-movement';
import { StockMovement as StockMovementModel } from '../../models/stock-movement.model';

@Component({
  selector: 'app-movement-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './movement-list.html'
})
export class MovementListComponent implements OnInit {
  movements: StockMovementModel[] = [];
  page = 1;
  pageSize = 10;
  hasMore = false;
  loadError = false;

  // Filter fields
  filterType = '';
  filterFromDate = '';
  filterToDate = '';
  filterProductId: number | null = null;
  filterUserId: number | null = null;

  // Sort fields
  currentSortBy: string = 'CREATED_AT';
  currentSortDir: string = 'DESC';

  constructor(
    private movementService: StockMovementService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMovements();
  }

  loadMovements(): void {
    this.loadError = false;

    // Read the current filter values at call time
    const type = this.filterType || undefined;
    const from = this.filterFromDate || undefined;
    const to = this.filterToDate || undefined;
    const prodId = this.filterProductId || undefined;
    const userId = this.filterUserId || undefined;

    this.movementService.getMovements(
      this.page, this.pageSize, type, from, to, prodId, userId, 
      this.currentSortBy, this.currentSortDir
    )
      .subscribe({
        next: (response) => {
          this.movements = response.items;
          this.hasMore = response.hasMore;
          // Force Angular to re-render after data arrives
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading movements', err);
          this.movements = [];
          this.loadError = true;
          this.cdr.detectChanges();
        }
      });
  }

  // Called by the "Filtreaza" button
  applyFilters(): void {
    this.page = 1;
    this.loadMovements();
  }

  // Handle sorting
  toggleSort(column: string): void {
    if (this.currentSortBy === column) {
      // Toggle direction
      this.currentSortDir = this.currentSortDir === 'ASC' ? 'DESC' : 'ASC';
    } else {
      // New column, default to ASC (except for date where DESC makes more sense initially, but ASC is fine)
      this.currentSortBy = column;
      this.currentSortDir = column === 'CREATED_AT' ? 'DESC' : 'ASC';
    }
    this.page = 1;
    this.loadMovements();
  }

  // Clear all filters and reload
  clearFilters(): void {
    this.filterType = '';
    this.filterFromDate = '';
    this.filterToDate = '';
    this.filterProductId = null;
    this.filterUserId = null;
    this.currentSortBy = 'CREATED_AT';
    this.currentSortDir = 'DESC';
    this.page = 1;
    this.loadMovements();
  }

  nextPage(): void {
    if (this.hasMore) {
      this.page++;
      this.loadMovements();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadMovements();
    }
  }

  translateType(type: string): string {
    switch (type) {
      case 'INTRARE': return 'IN';
      case 'IESIRE': return 'OUT';
      case 'AJUSTARE': return 'ADJUSTMENT';
      default: return type;
    }
  }
}