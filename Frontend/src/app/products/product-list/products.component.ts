import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../models/product.model';
import { SortByEnum } from '../enums/sort-by.enum';
import { SortDirEnum } from '../enums/sort-dir.enum';
import { StockStateEnum } from '../enums/stock-state.enum';
import { CategoriesService } from '../../services/categories.service';
import { Category } from '../../models/category.model';

@Component({
    selector: 'app-products',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
    products: Product[] = [];
    categories: Category[] = [];
    page = 1;
    pageSize = 10;
    hasMore = false;
    loadError = false;

    // Enums for template
    SortByEnum = SortByEnum;
    SortDirEnum = SortDirEnum;
    StockStateEnum = StockStateEnum;

    // Filter fields
    filterActive: boolean = true;
    filterSearch: string | undefined = undefined;
    filterCategoryId: number | undefined = undefined;
    filterStockState: StockStateEnum | undefined = undefined;
    filterMinPrice: number | undefined = undefined;
    filterMaxPrice: number | undefined = undefined;

    // Sort fields
    currentSortBy: SortByEnum = SortByEnum.NAME;
    currentSortDir: SortDirEnum = SortDirEnum.ASC;

    constructor(private productsService: ProductsService, 
        private categoriesService: CategoriesService,
        private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.loadProducts();
        this.categoriesService.getCategories().subscribe({
            next: (data) => {
                this.categories = data;
                this.cdr.detectChanges();
            }
        });
    }

    loadProducts(): void {
        this.loadError = false;

        this.productsService.getProducts(
            this.page, this.pageSize,  this.filterActive, this.filterCategoryId,
            this.filterStockState, this.filterMinPrice, this.filterMaxPrice,
            this.filterSearch, this.currentSortBy, this.currentSortDir
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

    // Called by the "Filter" button
    applyFilters(): void {
        this.page = 1;
        this.loadProducts();
    }

    // Handle sorting
    toggleSort(columnName: SortByEnum): void {
        if (this.currentSortBy === columnName) {
            this.currentSortDir = this.currentSortDir === SortDirEnum.ASC ? SortDirEnum.DESC : SortDirEnum.ASC;
        } else {
            this.currentSortBy = columnName;
            this.currentSortDir = SortDirEnum.ASC;
        }
        this.page = 1;
        this.loadProducts();
    }

    // Clear all filters and reload
    clearFilters(): void {
        this.filterSearch = undefined;
        this.filterCategoryId = undefined;
        this.filterStockState = undefined;
        this.filterActive = true;
        this.filterMinPrice = undefined;
        this.filterMaxPrice = undefined;
        this.currentSortBy = SortByEnum.NAME;
        this.currentSortDir = SortDirEnum.ASC;
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