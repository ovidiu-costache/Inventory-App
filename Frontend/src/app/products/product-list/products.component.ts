import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductsService } from '../products.service';
import { Product } from '../../models/product.model';

@Component({
    selector: 'app-products',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './products.component.html'
})
export class ProductsComponent implements OnInit {
    products: Product[] = [];
    page = 1;
    pageSize = 10;
    hasMore = false;
    loadError = false;

    // Filter fields (matching backend params)
    filterSearch = '';
    filterCategoryId: number | null = null;
    filterStockState = '';
    filterMinPrice: number | null = null;
    filterMaxPrice: number | null = null;

    // Sort fields (backend accepts: NAME, PRICE, STOCK)
    currentSortBy: string = 'NAME';
    currentSortDir: string = 'ASC';

    constructor(private productsService: ProductsService, private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.loadProducts();
    }

    loadProducts(): void {
        this.loadError = false;

        const categoryId = this.filterCategoryId || undefined;
        const stockState = this.filterStockState || undefined;
        const minPrice = this.filterMinPrice ?? undefined;
        const maxPrice = this.filterMaxPrice ?? undefined;
        const search = this.filterSearch || undefined;

        this.productsService.getProducts(
            this.page, this.pageSize, categoryId, stockState,
            minPrice, maxPrice, search,
            this.currentSortBy, this.currentSortDir
        )
            .subscribe({
                next: (response) => {
                    this.products = response.items;
                    this.hasMore = response.hasMore;
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('Error loading products', err);
                    this.products = [];
                    this.loadError = true;
                    this.cdr.detectChanges();
                }
            });
    }

    // Called by the "Filtreaza" button
    applyFilters(): void {
        this.page = 1;
        this.loadProducts();
    }

    // Handle sorting (backend accepts: NAME, PRICE, STOCK)
    toggleSort(column: string): void {
        if (this.currentSortBy === column) {
            this.currentSortDir = this.currentSortDir === 'ASC' ? 'DESC' : 'ASC';
        } else {
            this.currentSortBy = column;
            this.currentSortDir = 'ASC';
        }
        this.page = 1;
        this.loadProducts();
    }

    // Clear all filters and reload
    clearFilters(): void {
        this.filterSearch = '';
        this.filterCategoryId = null;
        this.filterStockState = '';
        this.filterMinPrice = null;
        this.filterMaxPrice = null;
        this.currentSortBy = 'NAME';
        this.currentSortDir = 'ASC';
        this.page = 1;
        this.loadProducts();
    }

    nextPage(): void {
        if (this.hasMore) {
            this.page++;
            this.loadProducts();
        }
    }

    prevPage(): void {
        if (this.page > 1) {
            this.page--;
            this.loadProducts();
        }
    }
}