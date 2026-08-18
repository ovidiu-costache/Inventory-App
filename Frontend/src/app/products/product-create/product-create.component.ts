import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { CategoriesService } from '../../services/categories.service';
import { CreateProductDto } from '../dtos/create-product.dto';
import { Category } from '../../models/category.model';
import { ProductFormComponent, ProductFormData } from '../product-form/product-form.component';

@Component({
    selector: 'app-product-create',
    standalone: true,
    imports: [CommonModule, FormsModule, ProductFormComponent],
    templateUrl: './product-create.component.html'
})
export class ProductCreateComponent implements OnInit {
    categories: Category[] = [];

    formData: ProductFormData = {
        code: '',
        name: '',
        description: '',
        categoryId: 0,
        unitOfMeasure: '',
        price: 0,
        reorderThreshold: 0
    };

    submitError = '';
    isSubmitting = false;

    constructor(
        private productsService: ProductsService,
        private categoriesService: CategoriesService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.categoriesService.getCategories().subscribe({
            next: (data) => {
                this.categories = data;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading categories', err);
            }
        });
    }

    onSubmit(submittedData: ProductFormData): void {
        this.submitError = '';
        this.isSubmitting = true;

        // Basic client-side validation
        if (!submittedData.code.trim()) {
            this.submitError = 'Product code is required.';
            this.isSubmitting = false;
            return;
        }
        if (!submittedData.name.trim()) {
            this.submitError = 'Product name is required.';
            this.isSubmitting = false;
            return;
        }
        if (!submittedData.categoryId || submittedData.categoryId <= 0) {
            this.submitError = 'Category is required.';
            this.isSubmitting = false;
            return;
        }
        if (!submittedData.unitOfMeasure.trim()) {
            this.submitError = 'Unit of measure is required.';
            this.isSubmitting = false;
            return;
        }
        if (submittedData.price < 0) {
            this.submitError = 'Price cannot be negative.';
            this.isSubmitting = false;
            return;
        }
        if (submittedData.reorderThreshold < 0) {
            this.submitError = 'Reorder threshold cannot be negative.';
            this.isSubmitting = false;
            return;
        }

        const dto: CreateProductDto = {
            ...submittedData,
            code: submittedData.code.trim(),
            name: submittedData.name.trim(),
            description: submittedData.description?.trim() || undefined,
            unitOfMeasure: submittedData.unitOfMeasure.trim()
        };

        this.productsService.createProduct(dto).subscribe({
            next: () => {
                this.router.navigate(['/products']);
            },
            error: (err) => {
                console.error('Error creating product', err);
                this.submitError = err.error?.detail || err.error?.title || 'Error creating product. Please check the data and try again.';
                this.isSubmitting = false;
                this.cdr.detectChanges();
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/products']);
    }
}
